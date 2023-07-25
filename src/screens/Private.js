import React, { useState, useEffect, useRef, useCallback } from "react";
import { ScrollView } from "react-native";
import { observer } from "mobx-react-lite";
import orderBy from "lodash/orderBy";
import { doc, onSnapshot } from "firebase/firestore";
import useStore, { useCart } from "../commons/Stores";
import {
  groupBy,
  getFreeSlots,
  showToast,
  getDay,
  db,
  wwidth,
} from "../commons/utils";
import {
  Loader,
  PageTitle,
  CloseIcon,
  RowBetween,
  Container,
  BlankView,
  BlankText,
  BACKGRAY,
} from "../commons/UI";
import PrivatBooking from "../comp/PrivatBooking";

export default observer(
  ({
    navigation: { navigate, replace, goBack },
    route: {
      params: { coachID },
    },
  }) => {
    const mount = useRef(true),
      {
        school: {
          coaches: { [coachID]: coach },
        },
        cart: { getCart, add: addCart },
      } = useStore(),
      cartPrivats = orderBy(
        getCart(coachID).filter((e) => e.privat),
        "from"
      );

    const cartCrossed = useCallback(
      (from, to) =>
        cartPrivats.find(
          (e) =>
            (e.from <= from && e.to > from) || (e.from >= from && e.from < to)
        ),
      [cartPrivats.length]
    );

    const [starts, setStarts] = useState(
      slots2starts(coach.slots, cartPrivats)
    );

    useEffect(() => {
      return () => (mount.current = false);
    }, []);

    useEffect(() => {
      // const listener = onSnapshot(doc(db, "coaches", coachID), (dc) => {
      //   let { slots: newSlots } = dc.data(),
      //     newStarts = slots2starts(newSlots, cartPrivats),
      //     changed = starts && starts.length != newStarts.length;
      //   return (
      //     changed && showToast("Available times were just updated"),
      //     mount.current && setStarts(newStarts)
      //   );
      // });
      // return () => listener();
    }, [starts?.length || 0]);

    return (
      <Container>
        <RowBetween style={{ marginLeft: 24, marginBottom: -12 }}>
          <PageTitle>Private class</PageTitle>
          <CloseIcon onPress={goBack} style={{ padding: 24 }} />
        </RowBetween>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            padding: 24,
            paddingTop: 8,
            paddingBottom: 32,
          }}
          style={{ width: wwidth }}
        >
          {!starts && <Loader big />}
          {starts && !starts[0] && (
            <BlankView>
              <BlankText>Coach doesn't have free time slots for now</BlankText>
            </BlankView>
          )}
          {starts?.[0] && (
            <PrivatBooking
              {...{ coachID, addCart, cartCrossed, navigate, replace }}
              startGroups={groupBy(starts, "day")}
              cartStarts={groupBy(cartPrivats, "day")}
            />
          )}
        </ScrollView>
      </Container>
    );
  }
);

let slots2starts = (slots, cartPrivats) => {
  let now = Date.now();
  let slotsArr = orderBy(Object.values(slots || {}), "from").filter(
    (s) => s?.to > now + 45 * 60000 // remove slots ending in less than 45 mins
  );
  if (!slotsArr[0]) return [];

  let freeSlots = slotsArr.reduce((res, slot) => {
    // each slot can have busy parts already in db + blocked by curent cart
    let { from, to, busy } = slot,
      busyArr = Object.values(busy || {}),
      blockedByCart = cartPrivats.filter((e) => e.from >= from && e.to <= to),
      allBusies = blockedByCart[0] ? busyArr.concat(blockedByCart) : busyArr;
    //  if no busy slot parts, add the whole slot as free. Else, get free sub-slots  & add them
    allBusies[0] ? res.push(...getFreeSlots(slot, allBusies)) : res.push(slot);
    return res;
  }, []);

  if (!freeSlots[0]) return [];

  let starts = freeSlots.reduce((prev, { id, from: slFrom, to }) => {
    let LATEST = to - 30 * 60000; // LATEST possible start time as min. duration is 30 min
    let arr = new Array(parseInt((LATEST - slFrom) / 60000 / 15) + 1) // starts array length is LATEST-from divided by 15 mins + the last one, f.e. 60 min slot = 5 start times
      .fill(1)
      .map((_, i) => {
        let from = slFrom + 15 * 60000 * i,
          maxDur = (to - from) / 60000 > 360 ? 360 : (to - from) / 60000; // max duration = difference with the end of the free slot, but <= 6 hours
        return { slotID: id, from, maxDur, day: getDay(from) };
      })
      .filter((s) => s.from > now + 15 * 60000); // remove start times in less than 15 mins
    return prev.concat(arr);
  }, []);
  return starts;
};
