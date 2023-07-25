import React from "react";
import { FlatList, View } from "react-native";
import styled from "styled-components/native";
import { observer } from "mobx-react-lite";
import dayjs from "dayjs";
import orderBy from "lodash/orderBy";
import { useClient, useSchool } from "../commons/Stores";
import { ages, durtnText } from "../commons/utils";
import {
  Touch,
  Text14,
  DGRAY,
  Button,
  Text21,
  PageTitle as Title,
  Text12,
  Text18,
  GREEN,
  Medium18,
  Medium12,
  BACKGREEN,
  BACKBLUE,
} from "../commons/UI";
import { TimeComp } from "./TimeComp";

export default observer(({ coachID, navigate, incarts, style }) => {
  const {
    coaches: {
      [coachID]: { price, grPrice },
    },
  } = useSchool();

  return (
    <PrivatesView {...{ style }}>
      <Title>Private class</Title>
      <EventsList {...{ coachID, navigate, incarts }} />
      <Desc selectable>
        Book your own time and program. Coach support and comments after a class
        provided. No other participants.{"\n"}The coach's rate per hour is
        <Text21> ${price} </Text21>for 1 person or
        <Text21> ${grPrice} </Text21>for 2+ persons.
      </Desc>
      <Button
        big
        text="Schedule a time"
        onPress={() => navigate("Private", { coachID })}
        style={{ marginTop: 16 }}
      />
    </PrivatesView>
  );
});

const EventsList = observer(({ coachID, incarts, navigate }) => {
  const { myid, privatsArr, programs } = useClient(),
    books = privatsArr.filter((e) => e.coachID == coachID),
    booksNCart =
      incarts[0] && books[0]
        ? orderBy(incarts.concat(books), "from")
        : incarts[0]
        ? incarts
        : books[0] && books;

  if (!booksNCart) return null;

  const incartIds = incarts.map((e) => e.id);

  const renderEvents = ({ item: e }) => (
    <EventCard
      event={e}
      prog={programs[e.progID]}
      incart={incartIds.includes(e.id)}
      {...{ myid, navigate }}
    />
  );
  return (
    <FlatList data={booksNCart} renderItem={renderEvents} {...listProps} />
  );
});

export const EventCard = ({
  event: { id, coachID, privat, price, age, ...ev },
  prog,
  incart,
  myid,
  navigate,
}) => {
  let book = ev.clientsIds?.includes(myid);
  return (
    <Touch
      onPress={() =>
        navigate(
          incart ? "Cart" : book ? "Event" : "AddGroup",
          incart ? { coachID } : { id }
        )
      }
    >
      <EventView
        style={[
          book && { backgroundColor: BACKGREEN },
          privat && { width: 126 },
          incart && border,
        ]}
      >
        <View style={{ alignItems: "center" }}>
          {privat && (
            <>
              <TimeComp med {...ev} style={{ marginTop: 1 }} />
              <Dur style={{ color: DGRAY, marginTop: 4 }} numberOfLines={1}>
                {(prog.short || prog.name) +
                  ", " +
                  ages.find((a) => a.id >= age).name}
              </Dur>
            </>
          )}
          {!privat && (
            <>
              <Time>{dayjs(ev.from).format("HH:mm")}</Time>
              <Dur>{durtnText((ev.to - ev.from) / 60000)}</Dur>
            </>
          )}
        </View>
        {!book && !incart && !privat && (
          <Medium18>${price % 1 == 0 ? price : price.toFixed(1)}</Medium18>
        )}
        {(incart || book) && (
          <Booked numberOfLines={1}>{book ? "booked" : `in cart`}</Booked>
        )}
      </EventView>
    </Touch>
  );
};

let listProps = {
  horizontal: true,
  keyExtractor,
  ItemSeparatorComponent: () => <View style={{ width: 16 }} />,
  getItemLayout: getEventLayout,
  showsHorizontalScrollIndicator: false,
  contentContainerStyle: { padding: 24, paddingBottom: 10 },
  style: { marginHorizontal: -24 },
};

let keyExtractor = (e) => e.id,
  getEventLayout = (_, i) => ({
    length: 126 + 16,
    offset: (126 + 16) * i,
    index: i,
  }),
  border = { borderWidth: 1, borderColor: GREEN, marginHorizontal: 1 };

export const Desc = styled(Text14)`
  color: ${DGRAY};
  margin-top: 20px;
`;

let PrivatesView = styled.View`
    /* background: #f2f2f2; */
    background: ${BACKBLUE};
    padding: 40px 24px;
  `,
  EventView = styled.View`
    width: 66px;
    height: 90px;
    justify-content: space-between;
    align-items: center;
    background: white;
    padding: 8px 6px 4px;
  `,
  Time = styled(Text18)`
    color: ${GREEN};
  `,
  Dur = styled(Text12)`
    color: ${GREEN};
    margin-top: 2px;
  `,
  Booked = styled(Medium12)`
    font-size: 13px;
    margin-bottom: 3px;
  `;
