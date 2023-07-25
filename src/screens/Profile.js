import React, { useCallback, useEffect } from "react";
import { View, ScrollView, FlatList, Linking } from "react-native";
import styled from "styled-components/native";
import { observer } from "mobx-react-lite";
import { getDocs } from "firebase/firestore";
import dayjs from "dayjs";
import useStore, { useClient } from "../commons/Stores";
import { dbBooks, wwidth, resetStackRoute, dayAgo } from "../commons/utils";
import {
  GrayContainer,
  Touch,
  Loader,
  Text28,
  DGRAY,
  BACKGRAY,
  RowCentered,
  InstaIcon,
  FacbkIcon,
  YoutbIcon,
  Refresher,
  BlankText,
  GRAY,
  Text16,
  RowBetween,
  Medium14,
  RED,
  Row,
  Text14,
  Text18,
  Text12,
  BlankView,
} from "../commons/UI";
import Header from "../comp/ProfileHeader";
import BookCard from "../comp/BookCard";
import { Legals } from "./Login";

export default observer(
  ({ navigation: { navigate }, route: { params: p } }) => {
    const hasParams = p && (p.orderID || p.id),
      {
        auth: { myid, checkDBUser },
        client: { load, handleBooksListener },
      } = useStore();

    // params  after push not-n or toast pressed OR dynamic links order
    useEffect(() => {
      if (!load && hasParams) resetStackRoute(p.orderID ? "Order" : "Event", p);
    }, [!load && hasParams]);

    const onRefresh = useCallback(
      async () =>
        await Promise.all([
          checkDBUser(),
          getDocs(dbBooks(myid)).then((q) => handleBooksListener(q, "getter")),
        ]),
      []
    );

    return (
      <GrayContainer>
        <ScrollView
          refreshControl={<Refresher update={onRefresh} />}
          contentContainerStyle={{
            flexGrow: 1,
            padding: 24,
            paddingBottom: 16,
          }}
          style={{ width: wwidth }}
        >
          <Header {...{ navigate }} />
          {load && <Loader big />}
          {!load && (
            <>
              <BooksComp {...{ navigate }} />
              <OrderCard {...{ navigate }} />
              <BlankView style={{ marginTop: 20, minHeight: 80 }}>
                <BlankText>
                  Get a mobile app to sync bookings with your calendar, view
                  your classes & orders history and coaches' comments on your
                  progress!
                </BlankText>
              </BlankView>
            </>
          )}
          {/* <RowCentered style={{ marginVertical: 24 }}>
            {[1, 2, 3].map(SocIcon)}
          </RowCentered> */}
          <Legals {...{ myid }} />
        </ScrollView>
      </GrayContainer>
    );
  }
);

let BooksComp = observer(({ navigate }) => {
  const { coaches, programs, allBooks, markViewed } = useClient(),
    allQnt = allBooks.length;

  if (!allQnt)
    return (
      <>
        <Title style={{ marginTop: 24 }}>My bookings</Title>
        <BlankText
          style={{ textAlign: "left", marginTop: 6, marginBottom: -4 }}
        >
          Your bookings will be here
        </BlankText>
      </>
    );

  const renderBooks = ({ item: event }) => (
    <BookCard
      {...{ event, coaches, navigate, markViewed }}
      program={programs[event.progID]}
      style={{ width: bookWidth }}
    />
  );

  return (
    <>
      <Title style={{ marginTop: 24 }}>My bookings ({allQnt})</Title>
      {allQnt && (
        <View style={{ height: 97, marginTop: 18 }}>
          <FlatList
            horizontal
            data={allBooks}
            renderItem={renderBooks}
            {...{ keyExtractor, ItemSeparatorComponent, getItemLayout }}
            initialNumToRender={1}
            windowSize={5}
            contentContainerStyle={{ paddingHorizontal: 24 }}
            style={{ marginHorizontal: -24 }}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      )}
    </>
  );
});

let OrderCard = observer((pr) => {
  let {
    lastOrder: o,
    balance,
    coaches: { [o?.coachID || "11"]: coach },
  } = useClient();

  if (!o) return null;

  let { id: orderID, quant: qt, coachID, created, total, payurl: url } = o,
    name = coach?.name || "Coach " + coachID,
    paid = o.status == "paid",
    recent = created > dayAgo(),
    eventsArr = Object.values(o.events),
    canorder = eventsArr.some(
      (e) =>
        e.active &&
        e.from > (e.privat ? Date.now() + 15 * 60000 : Date.now() - 5 * 60000)
    ),
    canpay = !paid && recent && canorder && (url || balance >= total),
    expired = !paid && (!recent || !canorder),
    error = !paid && recent && o.method == "card" && !url && balance < total,
    cancelledQt = eventsArr.filter((e) => !e.active).length,
    refunded = eventsArr.reduce((res, e) => res + (e.refund || 0), 0);

  let textStyle = {
    style: expired || error ? { color: GRAY } : { color: DGRAY },
  };

  return (
    <>
      <Title style={{ marginTop: 24, marginBottom: 18 }}>Latest order</Title>
      <Touch onPress={() => pr.navigate("Order", { orderID })}>
        <OrderView>
          <RowBetween>
            <Text16 {...textStyle}>{dayjs(created).format("D MMMM")}</Text16>
            {(expired || error) && (
              <Text16 {...textStyle}>{error ? "error" : "expired"}</Text16>
            )}
            {canpay && <Medium14 style={{ color: RED }}>pending</Medium14>}
          </RowBetween>
          <Name {...textStyle}>{name}</Name>
          <RowBetween style={{ marginTop: 3, alignItems: "flex-end" }}>
            <Text14 {...textStyle}>
              {qt + " class" + (qt == 1 ? "" : "es")}
              {cancelledQt
                ? qt == 1
                  ? " (cancelled)"
                  : ` (${cancelledQt} cancelled)`
                : ""}
            </Text14>
            <Row>
              <Text18 {...textStyle}>{"$" + total}</Text18>
              {refunded > 0 && (
                <Text12 style={{ color: GRAY }}>-{refunded}</Text12>
              )}
            </Row>
          </RowBetween>
        </OrderView>
      </Touch>
    </>
  );
});

let bookWidth = wwidth > 600 ? 380 : wwidth < 350 ? 240 : wwidth * 0.66;

let getItemLayout = (_, i) => ({
  length: bookWidth + 16,
  offset: (bookWidth + 16) * i,
  index: i,
});

let SocIcon = (c, i) => (
  <Touch
    key={String(i)}
    onPress={() =>
      Linking.openURL(
        i == 0
          ? "https://www.instagram.com/bloss.am.club/"
          : i == 1
          ? "https://www.facebook.com/rhythmicgymnasticsonline/"
          : "https://www.youtube.com/channel/UCcjjswwHfOuAnwFiPX0MFPw"
      )
    }
    style={{ marginRight: 24 }}
  >
    {i == 0 ? <InstaIcon /> : i == 1 ? <FacbkIcon /> : <YoutbIcon />}
  </Touch>
);

let keyExtractor = (e) => e.id;

let ItemSeparatorComponent = styled.View`
    width: 16px;
  `,
  Title = styled(Text28)`
    color: ${DGRAY};
  `,
  OrderView = styled.View`
    background: white;
    height: 100px;
    border-radius: 18px;
    padding: 16px;
  `,
  Name = styled(Text14)`
    color: ${DGRAY};
    margin-top: 4px;
  `;
