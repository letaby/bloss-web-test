import React from "react";
import { View } from "react-native";
import { observer } from "mobx-react-lite";
import { LinearGradient } from "expo-linear-gradient";
import styled from "styled-components/native";
import dayjs from "dayjs";
import {
  ages,
  contactSuprt,
  durtnText,
  wwidth,
  tmzn,
  callAlert,
} from "../commons/utils";
import {
  Text14,
  RowBetween,
  Text16 as Text,
  Row,
  Press,
  RowCentered,
  Medium14,
  DGRAY,
  UserImage,
  Text18,
  GREEN,
  Text10,
  BACKGREEN,
  Text15,
  GRAY,
  BACKGRAY,
  Text28,
  LINEGRAY,
  LITEBORDER,
  shadow2,
  Medium16,
  MarkView,
  Text12,
  RED,
  Touch,
  shadow16,
  MinusIcon,
  Image,
} from "../commons/UI";
import { TimeComp } from "./TimeComp";

export default observer(({ event, program, myid, coaches, ...r }) => {
  const { id, from, to, age, coachID, ...ev } = event,
    book = ev.clientsIds?.includes(myid),
    name = coaches[coachID]?.name || "Coach " + coachID;
  return (
    <Press onPress={() => r.navigate("Event", { id })}>
      <Wrap>
        <Row>
          {/* <View> */}
          <UserImage
            source={{ uri: program.image }}
            style={{ width: 136, height: 106, marginRight: 20 }}
          >
            <Gradient>
              <Text18 style={{ color: "white" }}>{program.name}</Text18>
            </Gradient>
          </UserImage>
          {/* </View> */}
          <Body>
            <View style={{ flexShrink: 1 }}>
              <Text15 numberOfLines={1}>{name}</Text15>
              <RowCentered style={{ marginTop: 7 }}>
                <Time>{dayjs(from).format("HH:mm")}</Time>
                <DurView>
                  <Dur>{durtnText((to - from) / 60000)}</Dur>
                </DurView>
              </RowCentered>
            </View>
            <RowBetween>
              <Price>{ages.find((a) => a.id >= age).name}</Price>
              {book && <Medium14 style={{ color: GREEN }}>booked</Medium14>}
              {!book && <Price>${ev.price}</Price>}
            </RowBetween>
          </Body>
        </Row>
      </Wrap>
    </Press>
  );
});

export const CartCard = observer(
  ({ event, full, remove, program: prg, ...r }) => {
    const { from, error, client, ...ev } = event,
      { quant: qt } = full ? r : client,
      type = ev.privat ? "private" : "group",
      ageName = ages.find((a) => ev.age <= a.id)?.name || "17-25",
      dur = durtnText((ev.to - from) / 60000, true),
      start = (
        <>
          {dayjs(from).format("D MMM  ").toLowerCase()}
          <Text style={{ color: LINEGRAY }}>|</Text>
          {dayjs(from).format("  HH:mm")}
        </>
      );
    return (
      <CartWrap style={!full && { height: cartHeight }}>
        {error && (
          <WhiteCover>
            <Row style={{ marginTop: 16 }}>
              <MarkView>
                <Medium16 style={{ color: "white" }}>{error}</Medium16>
              </MarkView>
            </Row>
          </WhiteCover>
        )}
        {!full && <IconClose onPress={remove} />}

        <UserImage
          source={{ uri: prg.image }}
          style={{
            width: wwidth - 24 * 2,
            height: cartImgHeight,
            borderRadius: 18,
            marginHorizontal: -20,
          }}
        >
          <Gradient>
            <CartTitle>{prg.name}</CartTitle>
          </Gradient>
        </UserImage>

        {full && (
          <View style={{ marginTop: 10 }}>
            <ItemRow2>
              <Type>Type</Type>
              <Text>{type.toLowerCase()}</Text>
            </ItemRow2>
            <ItemRow2>
              <Type>Ages</Type>
              <Text>{ageName}</Text>
            </ItemRow2>
            <ItemRow2>
              <Type>Start{tmznText}</Type>
              <Text>{start}</Text>
            </ItemRow2>
            <ItemRow2>
              <Type>Duration</Type>
              <Text>{dur}</Text>
            </ItemRow2>
            <ItemRow2>
              <Type>Persons</Type>
              <Text>{qt}</Text>
            </ItemRow2>
            <ItemRow2 style={{ borderBottomWidth: 0 }}>
              <Type>Sum</Type>
              <Text>${qt * ev.price}</Text>
            </ItemRow2>
          </View>
        )}
        {!full && (
          <View style={{ paddingTop: 10, height: 150 }}>
            <ItemRow>
              <Text>{type} class</Text>
              <Text>{ageName}</Text>
            </ItemRow>
            <ItemRow style={{ paddingTop: 13, paddingBottom: 13 }}>
              <Row>
                <Text>{start}</Text>
                {tmznText}
              </Row>
              <Text>{dur}</Text>
            </ItemRow>
            <ItemRow style={{ borderBottomWidth: 0 }}>
              <Text>{qt + " person" + (qt == 1 ? "" : "s")}</Text>
              <Text>${client.sum}</Text>
            </ItemRow>
          </View>
        )}
      </CartWrap>
    );
  }
);

export const OrderEvent = observer(
  ({ event: e, only1, orderPaid, navigate, ...r }) => {
    let { id, active, privat, from, to } = e,
      cancelled = e.cancelBy || e.cancelType,
      { quant: qt, sum } = e.client,
      booked = orderPaid && active,
      nobookMark = orderPaid && !active && (
        <Text14 style={{ color: RED }}>
          {cancelled ? "cancelled" : "not booked"}
        </Text14>
      ),
      canOpen = !nobookMark && (booked || (!privat && to > Date.now())),
      refund = e.refund || (orderPaid == "card" && !active && sum),
      color = cancelled ? DGRAY : r.orderError || !active ? GRAY : DGRAY;

    return (
      <Touch
        onPress={
          nobookMark
            ? () => nobookMarkPress(e, refund, navigate)
            : canOpen
            ? () => navigate("Event", { id })
            : null
        }
      >
        <OrderWrap style={canOpen ? shadow16 : { borderWidth: 1 }}>
          {!only1 && (
            <RowBetween style={{ marginBottom: 7 }}>
              <Text style={{ color: GRAY }}>{"class #" + (r.index + 1)}</Text>
              {nobookMark}
            </RowBetween>
          )}
          <RowBetween>
            <RowCentered>
              <TimeComp {...{ color, from }} />
              <Txt style={{ color }}>{dayjs(to).format(" – HH:mm")}</Txt>
            </RowCentered>
            {only1 && nobookMark}
          </RowBetween>
          <Txt style={{ color, marginTop: 8 }} selectable>
            {r.prog?.name || "Program " + e.progID}
            <Txt style={{ color: GRAY }}>
              {"  " + ages.find((a) => a.id >= e.age).name}
            </Txt>
          </Txt>
          <RowBetween
            style={{
              alignItems: "flex-end",
              marginTop: refund ? 6 : 1,
              marginBottom: refund ? 1 : 0,
            }}
          >
            <Text12 style={{ color, marginBottom: 1 }}>
              {(qt || 1) + ` person${qt < 2 ? ", " : "s, "}`}
              {privat ? "private" : "group"}
            </Text12>
            <Text18 style={{ color }}>
              {refund && <Text14 style={{ color }}>refund </Text14>}${sum}
            </Text18>
          </RowBetween>
        </OrderWrap>
      </Touch>
    );
  }
);

let tmznText = (
  <Text style={{ color: GRAY }}>
    {"  (GMT" + (tmzn < 0 ? "" : `+`) + tmzn})
  </Text>
);

let nobookMarkPress = (event, refund) => {
  let {
      id,
      cancelBy,
      cancelType,
      cancelTime,
      client: { uid: myid, orderID },
    } = event,
    cancelled = cancelBy || cancelType,
    cancelTimeText = cancelTime
      ? `on ${dayjs(cancelTime).format("D MMM, HH:mm")}`
      : "";
  return callAlert(
    cancelled ? "Booking cancelled" : `Class wasn't booked`,
    cancelled
      ? `The booking was cancelled ${cancelTimeText} by ${
          cancelBy == "client"
            ? "you"
            : `${cancelBy}. The reason is "${cancelType}"`
        }.\n${refund ? refund + "$ were refunded" : "No refund"}`
      : "The class was changed or cancelled before payment, or the order was paid too late for booking" +
          (refund
            ? `.\n${refund}$ were refunded on your account balance ${cancelTimeText}`
            : ""),
    [
      {
        label: "Contact support",
        onClick: () => contactSuprt({ myid, orderID }),
      },
    ]
  );
};

let IconClose = (pr) => (
  <Press
    style={{
      position: "absolute",
      backgroundColor: "white",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 2,
      right: 0,
      margin: 14,
      height: 36,
      width: 36,
      borderRadius: 20,
      ...shadow2,
    }}
    {...pr}
  >
    <MinusIcon color={RED} height={2} />
  </Press>
);

export const cartImgHeight = (wwidth - 24 * 2) * 0.5,
  cartHeight = cartImgHeight + 150 + 12;

let Wrap = styled.View`
    background: white;
    border-radius: 18px;
    height: 116px;
    padding: 5px;
  `,
  CartWrap = styled(Wrap)`
    background: ${BACKGRAY};
    height: undefined;
    padding: 0 20px 12px;
  `,
  OrderWrap = styled(Wrap)`
    height: undefined;
    padding: 16px 16px 14px;
    border: 0 solid ${LITEBORDER};
  `,
  CartTitle = styled(Text28)`
    color: white;
    margin: 7px;
  `,
  Body = styled.View`
    flex: 1;
    flex-shrink: 1;
    justify-content: space-between;
    padding: 11px 11px 8px 0;
  `,
  Time = styled(Text18)`
    color: ${GREEN};
  `,
  DurView = styled.View`
    background: ${BACKGREEN};
    height: 16px;
    justify-content: center;
    border-radius: 8px;
    padding: 0 8px;
    margin-left: 10px;
  `,
  Dur = styled(Text10)`
    color: ${GREEN};
  `,
  Price = styled(Text14)`
    color: ${GRAY};
  `,
  ItemRow = styled(RowBetween)`
    border-bottom-width: 1px;
    border-bottom-color: ${LITEBORDER};
    padding: 11px 0;
  `,
  ItemRow2 = styled(ItemRow)`
    padding: 15px 0;
  `,
  Type = styled(Text)`
    color: ${DGRAY};
  `,
  WhiteCover = styled.View`
    position: absolute;
    z-index: 1;
    height: 350px;
    width: ${wwidth - 20 * 2}px;
    background: rgba(255, 255, 255, 0.65);
  `,
  Txt = styled(Text14)`
    color: ${DGRAY};
  `;

let Gradient = (pr) => (
  <LinearGradient
    colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.5)"]}
    start={{ x: 0, y: 0 }}
    end={{ x: 0, y: 1.0 }}
    style={{
      position: "absolute",
      justifyContent: "flex-end",
      padding: 13,
      paddingBottom: 11,
      bottom: 0,
      width: "100%",
      height: 80,
    }}
  >
    {pr.children}
  </LinearGradient>
);
