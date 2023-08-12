import React, { useEffect } from "react";
import { observer } from "mobx-react-lite";
import {
  onSnapshot,
  where,
  query,
  orderBy,
  limit,
  doc,
} from "firebase/firestore";
import useStore from "./Stores";
import { db, dbBooks, dbOrders, tmzn, timezoneName as tmzName } from "./utils";

export default observer((pr) => {
  const {
    school: { load: initLoad },
    auth: { myid, isactive, profile, updateFields, localUpdateFields },
    client: { handleBooksListener, updateOrder, load: clientLoad },
  } = useStore();

  // //  Timezone
  useEffect(() => {
    if (isactive) {
      let upd = {},
        device = "web";
      tmzn != profile.timezone && (upd.timezone = tmzn);
      tmzName != profile.timezoneName && (upd.timezoneName = tmzName);
      device != profile.device && (upd.device = device);
      Object.keys(upd)[0] && updateFields(upd);
    }
  }, [isactive]);

  // //  bookings listener
  useEffect(() => {
    if (isactive && !initLoad) {
      const unsubscribe = onSnapshot(dbBooks(myid), handleBooksListener);
      const listenOrder = onSnapshot(
        query(
          dbOrders,
          where("client", "==", myid),
          orderBy("created", "desc"),
          limit(1)
        ),
        (q) => !q.empty && updateOrder(q.docs[0].data())
      );
      return () => (unsubscribe(), listenOrder());
    }
  }, [isactive && !initLoad]);

  // user balance listener
  useEffect(() => {
    if (isactive && !clientLoad) {
      const listener = onSnapshot(doc(db, "users", myid), (d) => {
        let { balance } = d.data();
        if (
          Object.keys(balance || {}).length !=
          Object.keys(profile.balance || {}).length
        )
          localUpdateFields({ balance });
      });
      return () => listener();
    }
  }, [isactive && !clientLoad]);

  return pr.children;
});
