import React, { useContext, useEffect } from "react";
import { makeAutoObservable, runInAction } from "mobx";
import { query, getDocs, where, doc, getDoc } from "firebase/firestore";
import { ref, set, get } from "firebase/database";
import orderBy from "lodash/orderBy";
import {
  db,
  dbCoaches,
  dbEvents,
  rdbProgs,
  dbQueryToObj,
  getDay,
  getFreeSlots,
  loccoaches,
  locevents,
  locprogs,
  rdb,
} from "./utils";
import AuthStore from "./AuthStore";
import CartStore from "./CartStore";
import ClientStore from "./ClientStore";

let dbGroupsRef = query(
  dbEvents,
  where("group", "==", true),
  where("active", "==", true),
  where("to", ">", Date.now())
);

const Context = React.createContext();

const useStore = () => useContext(Context);
export default useStore;

export const useAuth = () => useStore().auth,
  useSchool = () => useStore().school,
  useClient = () => useStore().client,
  useCart = () => useStore().cart;

export const StoresProvider = ({ children }) => {
  const school = new SchoolStore(),
    auth = new AuthStore(),
    client = new ClientStore(school, auth),
    cart = new CartStore(school);

  useEffect(() => {
    // school.getSchool();
  }, []);

  return (
    <Context.Provider value={{ school, auth, cart, client }}>
      {children}
    </Context.Provider>
  );
};

class SchoolStore {
  // allPrograms = {};
  // coaches = {};
  allPrograms = locprogs;
  coaches = loccoaches;
  groups = {};
  filter = {};

  constructor() {
    makeAutoObservable(this);
  }

  get load() {
    return !Object.keys(this.allPrograms)[0] || !Object.keys(this.coaches)[0];
  }

  get programs() {
    if (this.load) return {};
    let activeProgs = Object.values(this.coaches).reduce((res, c) => {
      c.programs?.forEach(res.add, res);
      return res;
    }, new Set());
    let filtrd = Object.values(this.allPrograms).reduce((res, cur) => {
      if (activeProgs.has(cur.id)) res[cur.id] = cur;
      return res;
    }, {});
    return filtrd;
  }

  get groupsLoaded() {
    return !!this.groups;
  }

  get groupsArr() {
    return orderBy(
      Object.values(this.groups || {}).filter(
        (e) => e.active && e.to > Date.now()
      ),
      "from"
    );
  }

  get coachesArr() {
    return Object.values(this.coaches).filter((c) => {
      if (c.status != "approved") return false;
      let hasSlot = Object.values(c.slots || {}).some(
        (sl) =>
          sl &&
          sl.to > Date.now() + 45 * 60000 &&
          !!getFreeSlots(sl, Object.values(sl.busy || {}))[0]
      );
      if (hasSlot) return true;
      if (this.groupsArr.some((e) => e.coachID == c.uid)) return true;
      return false;
    });
  }

  setGroups = (obj = {}) => {
    let arr = Object.values(obj);
    if (arr[0] && arr.some((e) => !e.day))
      arr
        .filter((e) => !e.day)
        .forEach((e) => (obj[e.id].day = getDay(e.from)));
    return (this.groups = { ...this.groups, ...obj });
  };

  updateGroup = (e) => {
    if (!e.day && e.from) e.day = getDay(e.from);
    return (this.groups[e.id] = { ...this.groups[e.id], ...e });
  };

  deleteGroup = (id) => delete this.groups[id];

  setFilter = (obj) => (this.filter = obj);

  getProgs = async () =>
    get(rdbProgs).then((res) =>
      runInAction(() => (this.allPrograms = res.val()))
    );

  getSchool = async () =>
    await Promise.all([
      getDocs(query(dbCoaches, where("status", "==", "approved"))),
      this.getProgs(),
    ])
      .then((res) => runInAction(() => (this.coaches = dbQueryToObj(res[0]))))
      .catch((er) => console.log("ERROR getSchool", er));

  getAllGroups = async () =>
    getDocs(dbGroupsRef)
      .then((q) => this.setGroups(dbQueryToObj(q)))
      .catch((er) => console.log("ERROR getAllGroups =" + er))
      .finally(() => console.log("getAllGroups"));

  getCoach = async (id, next) =>
    await getDoc(doc(db, "coaches", id))
      .then((d) => {
        if (d?.exists())
          runInAction(
            () => (this.coaches[id] = { ...this.coaches[id], ...d.data() })
          );
      })
      .finally(() => next && next());

  handleDBCoachGroups = (q, coachID, myid) => {
    if (q.empty) return;
    let obj = dbQueryToObj(q),
      newIds = Object.keys(obj),
      currEvents = this.groupsArr.filter((e) => e.coachID == coachID),
      outdated = currEvents.filter((e) => !newIds.includes(e.id));
    // we need to delete outdated groups which are not booked, since setGroups doesn't remove events.
    // The booked ones arent needed to be deleted, since they getting handled automatically by listener in EffectsProvider
    if (outdated[0]) {
      let now = Date.now();
      let needDelete = myid
        ? outdated.filter((e) => e.to < now || !e.clientsIds?.includes(myid))
        : outdated;
      needDelete.forEach((e) => this.deleteGroup(e.id));
    }
    // udate Groups if there is a new or edited group. No need to check for updated bookins since they are handled by listener in EffectsProvider
    let currIds = currEvents.map((e) => e.id);
    let hasNewOREdited = newIds.some(
      (id) => !currIds.includes(id) || obj[id].edited != this.groups[id]?.edited
    );
    // console.log('handleDBCoachGroups hasNewOREdited', hasNewOREdited);
    return hasNewOREdited && this.setGroups(obj);
  };

  getCoachGroups = async (coachID, myid) =>
    getDocs(
      query(
        dbEvents,
        where("coachID", "==", coachID),
        where("group", "==", true),
        where("active", "==", true),
        where("to", ">", Date.now())
      )
    ).then((q) => this.handleDBCoachGroups(q, coachID, myid));
}
