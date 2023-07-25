import React, { useState, useEffect } from "react";
import { FlatList, View } from "react-native";
import styled from "styled-components/native";
import { observer } from "mobx-react-lite";
import useStore, { useSchool } from "../commons/Stores";
import { ages, getDay, wwidth } from "../commons/utils";
import {
  Loader,
  BACKGRAY,
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
  Container,
} from "../commons/UI";
import CoachCard from "../comp/CoachCard";
import { EmptyText } from "../comp/CoachGroups";
import Dates from "../comp/Dates";
import EventCard from "../comp/EventCard";
import Toast from "react-native-toast-message";

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

  if (load)
    return (
      <GrayContainer
        style={{ justifyContent: "center", paddingHorizontal: 24 }}
      >
        <Loader />
        <BlankText>Loading coaches schedule</BlankText>
      </GrayContainer>
    );

  return (
    <Container>
      <FlatList
        data={filteredCoaches}
        {...listProps}
        renderItem={renderCoaches}
        ListHeaderComponent={<Groups {...{ navigate }} />}
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
        contentContainerStyle={{ flexGrow: 1, padding: 24 }}
        refreshControl={<Refresher update={onRefresh} />}
      />
    </Container>
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
    if (!load) getAllGroups();
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

  const [day, setDay] = useState(nearestBook ? nearestBook.day : dates[0]),
    dayEvents = filtered.filter((e) => e.day == (day || dates[0])); // изнчально day state = undefined

  useEffect(() => {
    (!dates.includes(day) || !dayEvents[0]) && setDay(dates[0]);
  }, [progID, age, !dayEvents[0]]);

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
          onPress={() => navigate("Filters", { from: "Groups" })}
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
        style={{ width: wwidth - 48 }}
      />
      <Press
        onPress={() =>
          Toast.show({
            duration: 500,
            text1: "Hello",
            text2: "This is some something 👋",
          })
        }
      >
        <PageTitle style={{ marginTop: 32, marginBottom: 18 }}>
          Coaches
        </PageTitle>
      </Press>
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
    style: { background: BACKGRAY, width: wwidth },
  };
