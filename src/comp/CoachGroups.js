import React, { useRef, useState, useEffect, useCallback } from "react";
import { View, FlatList } from "react-native";
import styled from "styled-components/native";
import { observer } from "mobx-react-lite";
import { query, onSnapshot, where } from "firebase/firestore";
import { useRoute } from "@react-navigation/native";
import useStore from "../commons/Stores";
import { groupBy, wwidth, ages, dbEvents } from "../commons/utils";
import { GRAY, Loader, PageTitle, DropDown, Text16 } from "../commons/UI";
import { EventCard } from "./CoachPrivats";
import { DateParent } from "./Dates";
import { TimznComp } from "./PrivatBooking";

export default observer(({ coachID, incartIds, navigate, ...pr }) => {
  const mount = useRef(true),
    {
      auth: {
        profile: { uid: myid, age: myage },
      },
      school: {
        groupsArr,
        handleDBCoachGroups,
        coaches: {
          [coachID]: { programs: progIds },
        },
        programs,
        filter: { progID: prog0, age: age0 },
      },
    } = useStore(),
    groups = groupsArr.filter((e) => e.coachID == coachID),
    [age, setAge] = useState(
      ages.find((a) => a.id >= (age0 || myage || 14)).id
    ),
    [progID, setProgID] = useState(
      prog0 && progIds.includes(prog0) && groups.some((e) => e.progID == prog0)
        ? prog0
        : groups.find((e) => e.age == age)?.progID || progIds[0]
    ),
    [load, setLoad] = useState(true),
    filtered = groups.filter((e) => e?.progID == progID && e?.age == age),
    dayGroups = Object.values(groupBy(filtered, "day"));

  useEffect(() => {
    // let listener = onSnapshot(
    //   query(
    //     dbEvents,
    //     where("coachID", "==", coachID),
    //     where("group", "==", true),
    //     where("active", "==", true),
    //     where("to", ">", Date.now())
    //   ),
    //   (q) =>
    //     mount.current && (handleDBCoachGroups(q, coachID, myid), setLoad(false))
    // );
    // return () => ((mount.current = false), listener());
  }, []);

  const { params } = useRoute();

  useEffect(() => {
    if (params.age || params.progID) {
      let { progID: pProgID, age: pAge } = params;
      pAge != age && setAge(pAge);
      pProgID != progID && setProgID(pProgID);
    }
  }, [params.age, params.progID]);

  const openFilter = useCallback(
    () => navigate("Filters", { from: "Coach", progID, age, coachID }),
    [age, progID]
  );

  const renderDays = ({ item: events, index: ind }) => (
    <DayGroup
      quant={dayGroups.length}
      {...{ events, ind, incartIds, myid, navigate }}
    />
  );

  return (
    <GroupsView>
      <PageTitle>Group classes</PageTitle>
      {load && !groups[0] ? (
        <Loader style={{ marginTop: 28 }} />
      ) : (
        <>
          {groups[0] && (
            <DropDown
              text={
                (progIds[1] ? programs[progID].name + ", " : "") +
                ages.find((a) => age <= a.id).name
              }
              icon
              onPress={openFilter}
              style={{ marginTop: 24 }}
            />
          )}
          {dayGroups[0] && <TimznComp style={{ marginTop: 20 }} />}
          <FlatList
            data={dayGroups}
            renderItem={renderDays}
            {...listProps}
            ListEmptyComponent={
              <EmptyText style={{ marginTop: 32, marginBottom: -16 }}>
                {groups[0]
                  ? `No such groups, try other ${
                      progIds[1] ? "filters" : "age"
                    }`
                  : "No groups for now"}
              </EmptyText>
            }
          />
        </>
      )}
    </GroupsView>
  );
});

let DayGroup = observer(({ events, last, ind, incartIds, ...r }) => {
  const renderEvents = ({ item: event }) => (
    <EventCard {...{ event, ...r }} incart={incartIds.includes(event.id)} />
  );
  return (
    <DateParent
      day={events[0].day}
      last={ind == r.quant - 1}
      first={ind == 0}
      width={90}
    >
      <FlatList
        data={events}
        renderItem={renderEvents}
        {...{ keyExtractor, ItemSeparatorComponent }}
        getItemLayout={getEventLayout}
        scrollEnabled={false}
        style={{ marginTop: 16 }}
      />
    </DateParent>
  );
});

const listProps = {
  keyExtractor: daysKeys,
  horizontal: true,
  showsHorizontalScrollIndicator: false,
  contentContainerStyle: { padding: 24, paddingTop: 0, paddingBottom: 16 },
  style: { marginHorizontal: -24 },
  getItemLayout: getDayLayout,
};

let daysKeys = (g) => g[0]?.day,
  keyExtractor = (e) => e.id,
  getDayLayout = (_, i) => ({ length: 90, offset: 90 * i, index: i }),
  getEventLayout = (_, i) => ({
    length: 90 + 8,
    offset: (90 + 8) * i,
    index: i,
  });

export const EmptyText = styled(Text16)`
  text-align: center;
  color: ${GRAY};
  width: ${wwidth - 24 * 2}px;
  padding: 2px 0;
`;
let GroupsView = styled.View`
    background: #f8f8f8;
    padding: 40px 24px;
  `,
  ItemSeparatorComponent = styled.View`
    height: 8px;
  `;
