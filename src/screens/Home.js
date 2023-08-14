import React, { useState, useEffect } from "react";
import { FlatList, View } from "react-native";
import styled from "styled-components/native";
import { observer } from "mobx-react-lite";
import useStore, { useSchool } from "../commons/Stores";
import { ages, getDay, deskPadding } from "../commons/utils";
import {
  Loader,
  RowBetween,
  PageTitle,
  Refresher,
  FilterButton,
  BlankView,
  Touch,
  GrayContainer,
  BLUE,
  BlankText,
  Press,
  LOGO,
  Row,
  BORDERGRAY,
} from "../commons/UI";
import CoachCard from "../comp/CoachCard";
import { EmptyText } from "../comp/CoachGroups";
import Dates from "../comp/Dates";
import EventCard from "../comp/EventCard";

export default observer(({ navigation: { navigate, getState } }) => {
  const {
      load,
      coachesArr,
      programs,
      filter: { progID },
      setFilter,
      getSchool,
      getAllGroups,
    } = useSchool(),
    filterProg = programs[progID],
    onRefresh = async () => await Promise.all([getSchool(), getAllGroups()]);

  const filteredCoaches = progID
    ? coachesArr.filter((c) => c.programs?.includes(progID))
    : coachesArr;

  const renderCoaches = ({ item: coach }) => (
    <CoachCard full {...{ programs, coach, navigate, getState }} />
  );

  useEffect(() => {
    // navigate("Event", { id: "2nnzp9pUSqhJv7jq3CJ3mGMqSQV2-1688945611414-1" });
  }, []);

  if (load)
    return (
      <GrayContainer
        style={{
          justifyContent: "center",
          paddingHorizontal: deskPadding + 24,
        }}
      >
        <Loader />
        <BlankText>Loading coaches schedule</BlankText>
      </GrayContainer>
    );

  return (
    <GrayContainer>
      <FlatList
        data={filteredCoaches}
        {...listProps}
        renderItem={renderCoaches}
        ListHeaderComponent={
          <>
            <Row
              style={{
                justifyContent: "center",
                paddingBottom: 20,
                marginBottom: 20,
                marginHorizontal: -deskPadding - 24,
                borderBottomWidth: 1,
                borderBottomColor: BORDERGRAY,
              }}
            >
              <LOGO />
            </Row>
            <Groups {...{ navigate }} />
          </>
        }
        ListEmptyComponent={
          <BlankView>
            <EmptyText>
              Sorry, there are no {filterProg?.name} classes or coaches with a
              free time slot for now
            </EmptyText>
            <Touch onPress={() => setFilter((pr) => ({ ...pr, progID: null }))}>
              <EmptyText style={{ color: BLUE }}>Reset filter</EmptyText>
            </Touch>
          </BlankView>
        }
        contentContainerStyle={{
          flexGrow: 1,
          padding: 24,
          paddingHorizontal: deskPadding + 24,
        }}
        refreshControl={<Refresher update={onRefresh} />}
      />
    </GrayContainer>
  );
});

let Groups = observer(({ navigate }) => {
  const {
    school: {
      load,
      coaches,
      programs,
      groupsLoaded,
      filter: { progID, age },
      setFilter,
      getAllGroups,
    },
    client: { myid, allActiveEvents, nearestBook },
  } = useStore();

  useEffect(() => {
    // if (!load) getAllGroups();
  }, [load]);

  const filtered =
    progID || age
      ? allActiveEvents.filter(
          (e) =>
            (progID ? e.progID == progID : true) && (age ? e.age == age : true)
        )
      : allActiveEvents;

  const dates = filtered.reduce((pr, e) => {
    let day = getDay(e.from);
    !pr.includes(day) && pr.push(day);
    return pr;
  }, []);

  const [day, setDay] = useState(nearestBook?.day || dates[0]),
    dayEvents = filtered.filter((e) => e.day == (day || dates[0])); // изнчально day state = undefined

  useEffect(() => {
    (!dates.includes(day) || !dayEvents[0]) && setDay(dates[0]);
  }, [progID, age, !dayEvents[0]]);

  useEffect(() => {
    if (nearestBook?.day && day != nearestBook?.day) setDay(nearestBook.day);
  }, [nearestBook?.day]);

  const fltAgeName = age ? ages.find((a) => a.id >= age).name : "",
    fltProgName = progID ? programs[progID].short || programs[progID].name : "",
    filterTitle =
      progID || age
        ? fltProgName + (progID && age ? ", " : "") + fltAgeName
        : "Filters";

  const renderItem = ({ item: e }) => (
    <EventCard
      event={e}
      {...{ coaches, myid, navigate }}
      program={programs[e.progID]}
    />
  );

  return (
    <>
      <RowBetween>
        <PageTitle>Schedule</PageTitle>
        <FilterButton
          onPress={() => navigate("Filters", { from: "Home" })}
          active={progID || age}
          text={filterTitle}
        />
      </RowBetween>
      {dates[0] && (
        <Dates
          {...{ dates }}
          pick={setDay}
          active={day || dates[0]}
          style={{ marginTop: 20, marginBottom: 24 }}
        />
      )}
      <FlatList
        data={dayEvents}
        {...{ renderItem, ...listProps }}
        ListEmptyComponent={
          allActiveEvents[0] ? (
            <View
              style={{
                justifyContent: "center",
                marginTop: 32,
                marginBottom: 16,
              }}
            >
              <EmptyText>No classes with these filters.</EmptyText>
              <Touch onPress={() => (setFilter({}), setDay(dates[0]))}>
                <EmptyText style={{ color: BLUE }}>Reset filters</EmptyText>
              </Touch>
            </View>
          ) : groupsLoaded ? (
            <EmptyText style={{ flex: 1, marginTop: 32, marginBottom: 16 }}>
              No group classes for now
            </EmptyText>
          ) : (
            <Loader big />
          )
        }
        contentContainerStyle={{ flexGrow: 1 }}
      />
      <PageTitle style={{ marginTop: 32, marginBottom: 18 }}>Coaches</PageTitle>
    </>
  );
});

let keyExtractor = (c) => c.uid || c.id,
  getItemLayout = (_, i) => ({
    length: 116 + 9,
    offset: (116 + 9) * i,
    index: i,
  }),
  ItemSeparatorComponent = styled.View`
    height: 9px;
  `,
  listProps = {
    keyExtractor,
    ItemSeparatorComponent,
    getItemLayout,
  };
