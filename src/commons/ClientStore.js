import { makeAutoObservable } from "mobx";
import axios from "axios";
import dayjs from "dayjs";
import {
  doc,
  getDoc,
  setDoc,
  writeBatch,
  deleteDoc,
  deleteField,
  arrayRemove,
} from "firebase/firestore";
import orderBy from "lodash/orderBy";
import { navigate, getRoute } from "./RootNavigation";
import {
  dbQueryToObj,
  db,
  showtoast,
  getDay,
  tabbarHeight,
  handleRoutesCheck,
  getBalance,
  dayAgo,
  locorder,
  isDesktop,
} from "./utils";
import { dbbatchOrderEvents } from "./orderChecks";

export default class Client {
  privats = {};
  // orders = {};
  orders = { [locorder.id]: locorder };
  passed = {};
  load = true;

  constructor(school, auth) {
    makeAutoObservable(this);
    this.school = school;
    this.auth = auth;
  }

  get myid() {
    return this.auth.myid;
  }
  get profile() {
    return this.auth.profile;
  }
  get balance() {
    return getBalance(this.profile.balance);
  }
  get coaches() {
    return this.school.coaches;
  }
  get programs() {
    return this.school.programs;
  }
  get groups() {
    return this.school.groups;
  }

  get privatsArr() {
    return orderBy(
      Object.values(this.privats).filter(
        (e) => e?.active && e?.to > Date.now()
      ),
      "from"
    );
  }

  get allActiveEvents() {
    return orderBy(this.school.groupsArr.concat(this.privatsArr), "from");
  }

  get allBooks() {
    return this.load
      ? []
      : orderBy(
          Object.values(this.groups || {})
            .filter((e) => e?.clientsIds?.includes(this.myid))
            .concat(Object.values(this.privats)),
          "from"
        );
  }

  get books() {
    return this.allBooks.reduce((pr, e) => {
      pr[e.id] = e;
      return pr;
    }, {});
  }

  get booksIds() {
    return Object.keys(this.books);
  }

  get nearestBook() {
    return this.allBooks.find((e) => e?.active);
  }

  get booksQuant() {
    return this.allBooks.filter((e) => e?.active).length;
  }

  updateEvent = (e) => {
    if (!e.day && e.from) e.day = getDay(e.from);
    return e.privat || e.id in this.privats
      ? (this.privats[e.id] = { ...this.privats[e.id], ...e })
      : this.school.updateGroup(e);
  };

  deleteEvent = (id) =>
    id in this.privats ? delete this.privats[id] : this.school.deleteGroup(id);

  deleteBook = (id) =>
    id in this.privats
      ? delete this.privats[id]
      : this.groups[id] &&
        this.school.updateGroup({
          id,
          clientsIds: this.groups[id].clientsIds.filter((c) => c != this.myid),
          clients: {},
        });

  setBooks = (obj = {}) => {
    let privats = {},
      groups = {};
    Object.keys(obj)[0] &&
      Object.values(obj).forEach((e) => {
        !e.day && (e.day = getDay(e.from));
        return e.privat ? (privats[e.id] = e) : (groups[e.id] = e);
      });
    this.privats = privats;
    Object.keys(groups)[0] && this.school.setGroups(groups);
  };

  addPassed = (e) => {
    if (!e.day && e.from) e.day = getDay(e.from);
    return (this.passed[e.id] = e);
  };

  markViewed = async (id) => {
    let curr = this.books[id],
      batch = writeBatch(db);
    this.deleteEvent(id);
    batch.delete(doc(db, "events", id));
    batch.set(doc(db, "passed", id), Object.assign(curr, { viewed: true }));
    batch.commit();
    curr.to < Date.now() && this.addPassed(curr);
  };

  setLoad = (val) => (this.load = val || null);

  setOrders = (obj) => (this.orders = { ...this.orders, ...obj });

  updateOrder = (obj) =>
    (this.orders[obj.id] = { ...this.orders[obj.id], ...obj });

  getOrder = async (id) =>
    await getDoc(doc(db, "orders", id)).then(
      (d) => d?.exists() && this.updateOrder(d.data())
    );

  get lastOrder() {
    return orderBy(Object.values(this.orders), "created", "desc")[0];
  }

  get hasUnpaidOrder() {
    let o = this.lastOrder,
      eventsArr = Object.values(o?.events || {});
    return (
      o &&
      o.status != "paid" &&
      o.created > dayAgo() &&
      (o.payurl || this.balance >= o.total) &&
      eventsArr.some(
        (e) =>
          e.active &&
          e.from > (e.privat ? Date.now() + 15 * 60000 : Date.now() - 5 * 60000)
      )
    );
  }

  handleLogout = async () => (
    await this.auth.logout(),
    this.setLoad(true),
    this.setOrders({}),
    (this.privats = {})
  );

  createOrder = async ({ cart, total }, next) => {
    let { coachID } = cart[0],
      uid = this.myid,
      created = Date.now(),
      orderID = uid + "-" + created,
      events = {},
      { name, email, stripeID: mystripeID } = this.profile;

    let user = await this.auth.checkDBUser(),
      balance = getBalance(user.balance),
      payCard = balance < total;

    cart.forEach(({ ...e }, ind) => {
      let id = e.privat ? orderID + "-" + (ind + 1) : e.id;
      e.client = { ...e.client, uid, name, orderID };
      e.progName = this.programs[e.progID].name;
      if (e.privat) (e.id = id), (e.active = true), (e.created = created);
      else delete e.clients, delete e.clientsIds;
      events[id] = e;
    });

    let order = {
      id: orderID,
      created,
      coachID,
      client: uid,
      name,
      quant: cart.length,
      total,
      events,
      status: payCard ? "pending" : "paid",
      method: payCard ? "card" : "balance",
      time: payCard ? null : created,
    };

    let batch = writeBatch(db);

    if (!payCard) batch = dbbatchOrderEvents(events, batch); // if pay by balance, handle events  db batch updates

    if (payCard) {
      let stripe = await axios
        .post(`https://blossm.site/pay`, {
          client: mystripeID,
          name,
          email,
          coach: this.coaches[coachID].name,
          quant: cart.length,
          sum: total,
          orderID,
        })
        .catch((er) => console.warn("ERROR axios.post " + er));
      let { url, stripeID } = stripe?.data || {};
      order.payurl = url || null;
      if (stripeID && !mystripeID) this.auth.updateFields({ stripeID });
    }

    batch.set(doc(db, "orders", orderID), order);

    let error;

    batch
      .commit()
      .catch((er) => (error = er))
      .finally(() => {
        if (error)
          return alert(
            `Couldn't place an order, make sure you have internet connection, then try again.\n\n` +
              (error.message || error)
          );
        this.updateOrder(order);
        navigate("ProfileStack", {
          screen: "Profile",
          params: { orderID, init: true },
        });
        if (next && (!payCard || order.payurl)) next();
        if (!payCard)
          this.auth.updateBalance({ time: created, sum: -total, orderID });
      });
  };

  cancelBook = async (id, next) => {
    let curr = this.books[id],
      uid = this.myid,
      {
        from,
        privat,
        coachID,
        slotID,
        clients: {
          [uid]: { sum, orderID },
        },
      } = curr,
      refund = from > Date.now() + 8 * 60 * 60000 ? sum : 0,
      time = Date.now(),
      who = "client",
      batch = writeBatch(db),
      evref = doc(db, "events", id);

    if (privat)
      batch.delete(evref),
        batch.update(doc(db, "coaches", coachID), {
          [`slots.${slotID}.busy.${id}`]: deleteField(),
        });
    else
      batch.update(evref, {
        [`clients.${uid}`]: deleteField(),
        [`clientsIds`]: arrayRemove(uid),
      });
    batch.update(doc(db, "orders", orderID), {
      [`events.${id}.active`]: false,
      [`events.${id}.cancelTime`]: time,
      [`events.${id}.cancelType`]: "booking was cancelled",
      [`events.${id}.cancelBy`]: who,
      [`events.${id}.refund`]: refund,
    });
    let balanceRec = { time, sum: refund, event: id, who, orderID };
    batch.update(doc(db, "users", uid), { [`balance.${time}`]: balanceRec });
    await batch
      .commit()
      .catch((er) => console.warn("cancelEvent ERROR", er))
      .finally(() => {
        next && next();
        this.deleteBook(id);
        this.auth.updateBalance(balanceRec);
        if (privat)
          delete this.school.coaches[coachID].slots[slotID]?.busy?.[id];
      });
  };

  handleBooksListener = async (q, refresher) => {
    let { myid, load } = this;
    if (q.empty && !this.booksQuant) return load && this.setLoad();
    let updates = q.docChanges(),
      [added, changed, removed] = [[], [], []],
      newState = dbQueryToObj(q);

    updates.forEach((u) => {
      let { type } = u,
        d = u.doc.data(),
        curr = this.books[d.id];
      if (type == "removed") return curr && removed.push(d);
      // rest are 'modified' or 'added', but 1 of the 'modified' cases is when other client booked event – so no need to be handled
      if (!curr || !curr.clientsIds?.includes(myid)) return added.push(d);
      let wasChanged =
        d.active != curr.active ||
        d.edited != curr.edited ||
        d.zoom != curr.zoom ||
        d.zoomPass != curr.zoomPass;
      return wasChanged && changed.push(d);
    });

    if (!added[0] && !removed[0] && !changed[0]) return;

    if (added[0]) {
      let toastData = added[1] ? added.length : added[0];
      // if all events are new, setBooks, toast or setload() & then return
      if (added.length == updates.length)
        return (
          !load && !refresher && toast("add", toastData), // toast if not a first app launch (load=true) & not a manual pull-to-refresh getter
          this.setBooks(newState),
          load && this.setLoad()
        );
      else toast("add", toastData);
    }

    // if events quantity changes (added OR passed OR private removed), we'll setBooks for all changes at once, so won't need to update event separately
    let needSetState =
      added[0] || removed.some((d) => d.privat || d.to < Date.now());

    // changed events may be cancelled (active: false) or just edited
    if (changed[0])
      changed.forEach((d, ind) => {
        let curr = this.books[d.id];
        //  need to toast & then update with setTimeout, because each new toast cancels previous one
        setTimeout(
          () => (
            toast(
              !d.active ? "cancel" : d.edited != curr.edited ? "edit" : "zoom",
              curr,
              ind + (added[0] ? 1 : 0)
            ),
            d.privat && !curr.privat && this.school.deleteGroup(d.id),
            !needSetState && this.updateEvent(d) // updateEvent after toast current data, so inside setTimeout
          ),
          ind * 2000 + (added[0] ? 2000 : 1)
        );
      });

    // removed are those which are passed OR haven't the user's uid in clients anymore
    if (removed[0])
      orderBy(removed, "from").forEach((d, ind) => {
        let { id } = d;
        // if passed
        if (d.to < Date.now())
          return (
            !d.privat && this.school.deleteGroup(id),
            d.clientsIds?.includes(myid) && this.addPassed(d)
          ); // if privat, it'll be auto-deleted by 'needSetState && setBooks'. But 'setbooks' doesn't delete group classes by itself
        // else, toast + un-book it (deleteBook), means delete event if it's a private OR just remove user's uid if it's a group
        let curr = this.books[id];
        setTimeout(
          () => (
            toast("cancel", curr, ind + (added[0] ? 1 : 0) + changed.length), // need to toast & then delete with setTimeout, because each new toast cancels previous one
            !needSetState && this.deleteBook(id) // if needSetState = true, it will be deleted by setBooks
          ),
          ind * 2000 + (added[0] ? 2000 : 1) + changed.length * 2000
        );
      });

    return needSetState && this.setBooks(newState);
  };
}

let toast = (type, data, index = 0) => {
  let added = type == "add",
    cancld = type == "cancel",
    id = data?.id,
    timeText = id && dayjs(data.from).format("D MMM, HH:mm"),
    { name: screen, params: p } = getRoute();
  let infocus =
    (id && screen == "Event" && p?.id == id) ||
    ((cancld || !id) && screen == "Profile");

  let text = !id
    ? `${data} booking(s) added`
    : type == "zoom"
    ? `Zoom data was updated ${infocus ? "" : " in your booking " + timeText}`
    : `${cancld ? "Your" : infocus ? "This" : added ? "A" : "Your"} booking ${
        infocus ? "" : timeText
      } was ${added ? "added" : cancld ? "cancelled" : "updated"}`.trim();

  let onPress = () => {
    if (infocus) return;
    let { isINProfileStack } = handleRoutesCheck(),
      params = id ? { id } : undefined;

    return isDesktop && id
      ? navigate("Event", params)
      : isINProfileStack
      ? navigate(id ? "Event" : "Profile", params)
      : navigate("ProfileStack", { screen: "Profile", params });
  };

  return showtoast(text, 3500, tabbarHeight + 150 + index * (54 + 16), onPress); // 54+16 is toast's height + margin
};
