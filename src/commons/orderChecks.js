// common shared with back server for stripe payments
import {
  doc,
  getDoc,
  query,
  where,
  documentId,
  getDocs,
  arrayUnion,
} from "firebase/firestore";
import { db, dbEvents, getFreeSlots } from "./utils";
import orderBy from "lodash/orderBy";

// check order events before Cart ordering or paying order by deposit balance
export const orderChecks = async (events, updateSlot, updateGroup) => {
  let eventsArr = orderBy(Object.values(events), "from"),
    { coachID } = eventsArr[0],
    { uid } = eventsArr[0].client,
    [changed, privats, groupIds] = [[], [], []],
    refund = 0;

  eventsArr.forEach((e) => (e.privat ? privats.push(e) : groupIds.push(e.id)));

  let addChange = (id, change) => (
    changed.push({ id, change }), (refund += events[id].client?.sum || 0)
  );

  // 1. check group events for changes and impossible bookings
  const checkGroups = async () => {
    let getEvents = (ids) =>
      getDocs(query(dbEvents, where(documentId(), "in", ids))).then((q) => {
        console.log("checkGroups", q.size);
        // if something in event was changed or it was deleted, can't be booked, so push to changed
        // check if some events were deleted
        if (!q || q.empty)
          return ids.forEach((id) => addChange(id, "cancelled or passed"));
        if (q.size < ids.length) {
          let qids = q.docs.map((d) => d.id),
            missedIds = ids.filter((id) => !qids.includes(id));
          missedIds[0] &&
            missedIds.forEach((id) => addChange(id, "cancelled or passed"));
        }
        q.forEach((doc) => {
          let d = doc.data(),
            { id } = doc,
            booked = d.clientsIds?.includes(uid),
            ev = events[id];
          if (
            d.active &&
            !booked &&
            d.edited == ev.edited &&
            d.from > Date.now() - 5 * 60000
          )
            return true;
          let change = !d.active
            ? "cancelled or passed"
            : booked
            ? "already booked"
            : d.edited != ev.edited
            ? "changed"
            : "already started";
          return (
            addChange(id, change),
            updateGroup && (booked || change == "changed") && updateGroup(d)
          );
        });
      });

    if (!groupIds[10]) return getEvents(groupIds);
    else {
      // split  groupIds array by 1-10 subarrays, because firestore 'in' query is limited to 10
      let idsby10 = groupIds.reduce(
        (res, cur) => {
          let lastInd = res.length - 1;
          res[lastInd].length == 10 ? res.push([cur]) : res[lastInd].push(cur);
          return res;
        },
        [[]]
      );
      await Promise.all(idsby10.map(async (ids) => await getEvents(ids)));
    }
  };

  // 2. check private events for available slots
  const checkPrivats = async () => {
    let coach = await getDoc(doc(db, "coahes", coachID)),
      { slots } = coach.data() || {},
      slotsArr = orderBy(Object.values(slots || {}), "from").filter(
        (s) => s.to > Date.now() + 45 * 60000
      ),
      change = "slots changed";

    if (!slotsArr[0]) return privats.forEach(({ id }) => addChange(id, change));

    let freeSlots = slotsArr.reduce((res, sl) => {
      let busyArr = Object.values(sl.busy || {});
      busyArr[0] ? res.push(...getFreeSlots(sl, busyArr)) : res.push(sl);
      return res;
    }, []);

    // find free slot, if not, can't be booked, so push to changed
    privats.forEach(({ id, from, to, slotID }) => {
      if (from < Date.now() + 15 * 60000) return addChange(id, "too soon");
      let freeSlot = freeSlots.find((s) => s.from <= from && s.to >= to);
      if (!freeSlot) return addChange(id, change);
      if (freeSlot.id != slotID)
        return (
          updateSlot(id, freeSlot.id),
          console.log("updated Slot", slotID, freeSlot.id)
        );
    });
  };

  // 3. run checks
  await Promise.all([
    groupIds[0] && checkGroups(),
    privats[0] && checkPrivats(),
  ]);

  return { changed, refund };
};

export const dbbatchOrderEvents = (events, batch, changedIds, orderRef) => {
  // for (var id in events) {
  Object.keys(events).forEach((id) => {
    // if was changed, set events[id].active = false &  return
    if (changedIds?.includes(id))
      return batch.update(orderRef, {
        [`events.${id}.active`]: false,
      });

    let { from, to, client, ...e } = events[id],
      { uid } = client,
      evref = doc(db, "events", id);
    client.time = Date.now();

    if (e.privat)
      return (
        (e.clients = { [uid]: client }),
        (e.clientsIds = [uid]),
        batch.set(evref, Object.assign(e, { from, to })),
        batch.update(doc(db, "coaches", e.coachID), {
          [`slots.${e.slotID}.busy.${id}`]: { id, from, to },
        })
      );
    else
      batch.update(evref, {
        [`clients.${uid}`]: client,
        clientsIds: arrayUnion(uid),
      });
  });

  return batch;
};
