import React, { useState, useEffect } from "react";
import { FlatList, ScrollView, View } from "react-native";
import styled from "styled-components/native";
import { observer } from "mobx-react-lite";
import { doc, onSnapshot } from "firebase/firestore";
import dayjs from "dayjs";
import orderBy from "lodash/orderBy";
import useStore from "../commons/Stores";
import { db, paddBottom, showToast, callAlert } from "../commons/utils";
import { orderChecks } from "../commons/orderChecks";
import {
  Button,
  Text14,
  Container,
  CloseIcon,
  AbsLoader,
  BLUE,
  BACKGRAY,
} from "../commons/UI";
import { CartCard, cartHeight } from "../comp/EventCard";

export default observer(
  ({
    navigation: { goBack, navigate },
    route: {
      params: { coachID, eventID, quant },
    },
  }) => {
    const {
        school: {
          programs,
          groups: { [eventID]: evt },
          updateGroup,
          deleteGroup,
        },
        client: { myid, balance, createOrder },
        cart: { cart: cartObj, remove, clearCart, update: updateCart },
      } = useStore(),
      [load, setLoad] = useState();

    const cart =
        coachID && orderBy(Object.values(cartObj[coachID] || {}), "from"),
      cartOnly1 = eventID || cart.length == 1;

    const total = eventID
      ? evt?.price * quant
      : cart.reduce((pr, e) => pr + e.client.sum, 0);

    const errorAlert = (ev, change) =>
      callErrorAlert(
        {
          ...ev,
          num: !cartOnly1 && cart.findIndex((c) => c.id == ev.id) + 1,
          prog: programs[ev.progID].name,
          change,
        },
        () => (remove(coachID, ev.id), cartOnly1 && goBack())
      );

    const preOrder = async (order) => {
      if (!myid) return navigate("ProfileStack");
      if (coachID && cart.some((e) => e.error))
        return errorAlert(cart.find((e) => e.error));
      if (balance > 0 && balance < total)
        return callAlert(
          "Pay by card or debit your account?",
          `You have $${balance} on your balance, but the order sum is $${total}. To pay with the account balance, add $${(
            total - balance
          ).toFixed(2)}`,
          [
            {
              label: `Add $${total - balance} to balance`,
              onClick: () => navigate("Balance", { total }),
            },
            { label: `Pay $${total} by card`, onClick: order },
          ]
        );
      else order();
    };

    const OrderButton = ({ order }) => (
      <Button
        big
        text={`Pay ${balance >= total ? "with balance" : "by card"}, $${total}`}
        onPress={() => preOrder(order)}
      />
    );

    if (coachID) {
      const order = async () => {
        setLoad(true);
        let { changed } = await orderChecks(
          cartObj[coachID],
          (id, slotID) => (cartObj[coachID][id].slotID = slotID),
          updateGroup
        );
        if (changed[0])
          return (
            setLoad(),
            changed.forEach(
              ({ id, change: error }) => (
                updateCart(coachID, id, { error }),
                errorAlert(cartObj[coachID][id], error),
                error == "cancelled or passed" && deleteGroup(id)
              )
            )
          );
        else createOrder({ total, cart }, () => clearCart(coachID));
      };

      const renderItem = ({ item: event }) => (
        <CartCard
          {...{ event }}
          remove={() => (remove(coachID, event.id), cartOnly1 && goBack())}
          program={programs[event.progID]}
        />
      );

      return (
        <Container>
          <FlatList
            data={cart}
            {...{ renderItem, ...listProps("coach") }}
            ListHeaderComponent={<CloseIcn {...{ coachID, goBack }} />}
          />
          <Footer>
            <Button
              transp
              onPress={() => navigate("Coach", { coachID, offset: true })}
              style={{ height: 56, borderWidth: 0 }}
            >
              <AddText>{"+  Add class"}</AddText>
            </Button>
            <OrderButton {...{ order }} />
          </Footer>
          {load && <AbsLoader />}
        </Container>
      );
    }

    if (eventID) {
      //   useEffect(() => {
      //     const listener = onSnapshot(doc(db, "events", eventID), (dc) => {
      //       let d = dc.exists && dc.data();
      //       if (!d?.active)
      //         return (
      //           navigate("Groups"),
      //           deleteGroup(eventID),
      //           showToast("The class is " + (d ? "cancelled" : "already passed"))
      //         );
      //       let wasEdited = d.edited != evt.edited,
      //         wasBooked = !load && d.clientsIds?.includes(myid);
      //       if (wasEdited || wasBooked)
      //         return (
      //           updateGroup(d),
      //           navigate("Event", { id: eventID }),
      //           showToast(
      //             "The class was just " + (wasEdited ? "updated" : "booked"),
      //             3000
      //           )
      //         );
      //     });
      //     return () => listener();
      //   }, [!load]);

      const order = async () => {
        if (evt.from < Date.now() - 5 * 60000)
          return alert(`The class is already going on. Can't book it`);
        setLoad(true);
        let cart = [{ ...evt, client: { quant, sum: total } }];
        createOrder({ total, cart });
      };

      return (
        <Container>
          <CloseIcn {...{ goBack }} />
          <ScrollView {...listProps()} showsVerticalScrollIndicator={false}>
            <View style={{ flex: 1, marginBottom: 32 }}>
              {evt && (
                <CartCard
                  full
                  event={evt}
                  {...{ quant }}
                  program={programs[evt.progID]}
                />
              )}
            </View>
            <OrderButton {...{ order }} />
          </ScrollView>
          {load && <AbsLoader />}
        </Container>
      );
    }
  }
);

let callErrorAlert = ({ num, from, prog, privat, change, error }, onPress) => {
  let chg = change || error;
  let changeText = chg.includes("slots")
    ? `the coach's time slots have changed`
    : chg.includes("soon")
    ? "start time is in less than 15 mins"
    : chg.includes("changed")
    ? "the class has been changed"
    : chg.includes("booked")
    ? `it's already been booked`
    : `it's been cancelled or already passed`;
  let text =
    (num
      ? `The #${num} class on ${dayjs(from).format("D MMM, HH:mm")} (${
          prog + (privat ? " private)" : " group)")
        }`
      : "The class") +
    ` can't be booked – ${changeText}.\nRemove it from here and ${
      chg == "changed" ? "add an updated" : "replace with some other"
    } one, if you wish`;
  return callAlert(`Can't book the class` + (num ? ` #${num}` : ""), text, [
    { label: "Remove", onClick: onPress },
  ]);
};

let CloseIcn = (pr) => (
  <CloseIcon
    onPress={pr.goBack}
    style={{
      padding: 20,
      paddingRight: 24,
      alignSelf: "flex-end",
      marginRight: pr.coachID ? -22 : 0,
    }}
  />
);

let keyExtractor = (it) => it.id,
  cartLayout = (_, i) => ({
    length: cartHeight + 22,
    offset: (cartHeight + 22) * i,
    index: i,
  }),
  ItemSeparatorComponent = styled.View`
    height: 22px;
  `;

let listProps = (coach) => ({
  keyExtractor,
  getItemLayout: coach ? cartLayout : undefined,
  ItemSeparatorComponent,
  contentContainerStyle: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 0,
    paddingBottom: coach ? 22 : 32,
  },
});

let Footer = styled.View`
    padding: 0 24px ${24 + paddBottom}px;
  `,
  AddText = styled(Text14)`
    color: ${BLUE};
  `;
