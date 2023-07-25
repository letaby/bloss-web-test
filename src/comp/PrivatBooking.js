import React, { useState, useEffect, useCallback } from "react";
import { FlatList, View } from "react-native";
import styled from "styled-components/native";
import { observer } from "mobx-react-lite";
import { useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import dayjs from "dayjs";
import orderBy from "lodash/orderBy";
import useStore from "../commons/Stores";
import { durtnText, ages, showToast, tmzn } from "../commons/utils";
const toast = (tx) => showToast(tx, 0, 120);
import {
  Press,
  Button,
  QuantButton,
  Text18,
  BACKGREEN,
  GREEN,
  DropDown,
  Caption,
  GRAY,
} from "../commons/UI";
import { DateParent } from "../comp/Dates";

export default observer(({ coachID, startGroups, ...r }) => {
  const days = Object.keys(startGroups).sort(),
    daysQuant = days.length,
    [start, setStart] = useState(daysQuant ? startGroups[days[0]][0] : {}),
    { from, slotID, maxDur, day } = start,
    durs = durations(maxDur),
    [dur, setDur] = useState([60, 45, 30].find((d) => durs.includes(d))),
    to = from + dur * 60000;

  const {
    school: {
      coaches: {
        [coachID]: { price: prvPrice, grPrice, programs: progIds },
      },
      programs,
      filter: { progID: prog0 },
    },
    auth: {
      profile: { age: age0 },
    },
  } = useStore();

  const [progID, setProgID] = useState(
      progIds.includes(prog0) ? prog0 : progIds[0]
    ),
    [age, setAge] = useState(age0 || 14),
    ageIndex = ages.findIndex((a) => age <= a.id),
    [quant, setQuant] = useState(1),
    price = (quant > 1 ? grPrice : prvPrice) * (dur / 60),
    sum = price * quant;

  useEffect(() => {
    if (dur > maxDur) setDur(maxDur);
  }, [from]);

  const {
    params: { filter: prmsFltr },
  } = useRoute();

  useEffect(() => {
    if (prmsFltr?.progID) setProgID(prmsFltr.progID);
  }, [prmsFltr?.progID]);

  const save = () => {
    // checks if coach slots were updated
    if (dur > maxDur) return toast("Choose new available duration");
    if (!startGroups[day]?.some((s) => s.from == from))
      return toast("Choose new available time");
    let cartCrossed = r.cartCrossed(coachID, from, to);
    if (cartCrossed)
      return toast(
        "There is a class with crossed timing in cart: " +
          dayjs(cartCrossed.from).format("D MMM HH:mm–") +
          dayjs(cartCrossed.to).format("HH:mm")
      );
    r.addCart({
      privat: true,
      coachID,
      progID,
      slotID,
      from,
      day,
      to,
      age,
      price,
      client: { quant, sum },
    });
    r.replace("Cart", { coachID });
  };

  const pickStart = useCallback(
    (st) => (st.maxDur < dur && setDur(st.maxDur), setStart(st)),
    [dur]
  );

  const renderDays = useCallback(
    ({ item: day, index: i }) => (
      <DayGroup
        starts={startGroups[day]}
        cartStarts={r.cartStarts[day]}
        first={i == 0}
        last={i == daysQuant - 1}
        picked={start}
        {...{ pickStart }}
      />
    ),
    [from, daysQuant]
  );

  return (
    <>
      <View style={{ flex: 1 }}>
        <TimznComp />
        <View style={{ height: 52 + 8 + 12 + 44 * 4 + 26 }}>
          <FlatList data={days} renderItem={renderDays} {...flatProps} />
          <Gradient width={daysQuant * 82} type={1} />
          <Gradient width={daysQuant * 82} />
        </View>

        <View
          style={{
            height: 50 * 4 + 20 * 3,
            justifyContent: "space-between",
            marginTop: 32,
          }}
        >
          <QuantButton
            text={"Duration: " + durtnText(dur)}
            plus={
              durs.includes(dur + 15) ? () => setDur((pr) => pr + 15) : null
            }
            minus={dur > 30 ? () => setDur((pr) => pr - 15) : null}
          />

          <DropDown
            text={programs[progID].name}
            icon={progIds[1]}
            onPress={
              progIds[1]
                ? () =>
                    r.navigate("Filters", { from: "Private", progID, coachID })
                : null
            }
          />

          <QuantButton
            text={"Age: " + ages[ageIndex].name}
            plus={age < 36 ? () => setAge(ages[ageIndex + 1].id) : null}
            minus={age > 5 ? () => setAge(ages[ageIndex - 1].id) : null}
          />

          <QuantButton
            text={"Persons: " + quant}
            plus={() => setQuant((pr) => pr + 1)}
            minus={quant > 1 ? () => setQuant((pr) => pr - 1) : null}
          />
        </View>
      </View>
      <Button
        big
        text={"Add to cart, $" + sum}
        onPress={save}
        style={{ marginTop: 40 }}
      />
    </>
  );
});

const DayGroup = ({ starts, cartStarts, ...r }) => {
  const startsAndIncarts = cartStarts?.length
    ? orderBy(starts.concat(cartStarts), "from")
    : starts;

  let renderTimes = ({ item: st }) => {
    let active = st.from == r.picked.from,
      incart = cartStarts?.some((ev) => ev.from == st.from),
      text = dayjs(st.from).format("HH:mm");
    return (
      <Press
        onPress={() =>
          active
            ? null
            : incart
            ? toast("A class at " + text + " is already in your cart")
            : r.pickStart(st)
        }
      >
        <TimeView>
          <InnerView
            style={[active && { backgroundColor: BACKGREEN }, incart && border]}
          >
            <TimeText style={(active || incart) && { color: GREEN }}>
              {text}
            </TimeText>
          </InnerView>
        </TimeView>
      </Press>
    );
  };

  return (
    <DateParent day={starts[0].day} {...r}>
      <FlatList
        data={startsAndIncarts}
        renderItem={renderTimes}
        keyExtractor={timeKeys}
        nestedScrollEnabled
        initialNumToRender={4}
        windowSize={5}
        contentContainerStyle={{ flexGrow: 1, paddingVertical: 12 }}
        getItemLayout={getTimeLayout}
        style={{ marginTop: 8 }}
      />
    </DateParent>
  );
};

let daygroupKeys = (d) => d,
  timeKeys = (it) => it.from,
  daysLayout = (_, i) => ({ length: 82, offset: 82 * i, index: i }),
  getTimeLayout = (_, i) => ({ length: 44, offset: 44 * i, index: i });

let flatProps = {
  keyExtractor: daygroupKeys,
  initialNumToRender: 3,
  maxToRenderPerBatch: 3,
  windowSize: 5,
  horizontal: true,
  showsHorizontalScrollIndicator: false,
  contentContainerStyle: { flexGrow: 1, paddingHorizontal: 24 },
  style: { marginHorizontal: -24, height: 52 + 8 + 12 + 44 * 4 + 26 },
  getItemLayout: daysLayout,
};

let durations = (max) =>
  new Array(23) // Dur-ns array length = the Period divided by 15 mins minus one interval, because we remove 0 min and 15 min intervals
    .fill(1)
    .map((_, i) => (i + 2) * 15)
    .filter((d) => d <= max);

let border = { borderWidth: 1, borderColor: GREEN, marginHorizontal: 1 },
  TimeView = styled.View`
    align-items: center;
    width: 82px;
    height: 44px;
  `,
  InnerView = styled.View`
    flex: 1;
    justify-content: center;
    width: 66px;
  `,
  TimeText = styled(Text18)`
    text-align: center;
    margin-bottom: -1px;
  `,
  TimznText = styled(Caption)`
    text-align: right;
    color: ${GRAY};
    height: 12px;
    margin: 0 0 10px;
  `;

export const TimznComp = (pr) => (
  <TimznText {...pr}>Your timezone ({tmzn < 0 ? tmzn : `+${tmzn}`})</TimznText>
);

let Gradient = ({ width, type }) => (
  <LinearGradient
    colors={["white", "rgba(255,255,255,0)"]}
    start={{ x: 0, y: type == 1 ? 0 : 1.0 }}
    end={{ x: 0, y: type == 1 ? 1.0 : 0 }}
    style={[
      { position: "absolute", width, height: 18 },
      type == 1 && { top: 52 + 8 },
      type != 1 && { bottom: -4 },
    ]}
  />
);
