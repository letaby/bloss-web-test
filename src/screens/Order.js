import React, { useCallback, useEffect, useState } from "react";
import { View, Linking, FlatList } from "react-native";
import styled from "styled-components/native";
import { observer } from "mobx-react-lite";
import {
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import dayjs from "dayjs";
import orderBy from "lodash/orderBy";
import useStore from "../commons/Stores";
import { dbbatchOrderEvents, orderChecks } from "../commons/orderChecks";
import {
  db,
  copyAlert,
  wheight,
  dayAgo,
  copytext,
  callAlert,
  getBalance,
  wwidth,
} from "../commons/utils";
import {
  DGRAY,
  GRAY,
  Loader,
  PageTitle,
  Row,
  RowBetween,
  Text14,
  Text21,
  Text24,
  Button,
  MarkView as UIMark,
  AbsLoader,
  Medium16,
  RED,
  BACKGRAY,
  Contacts,
  Refresher,
  GREEN,
  BACKGREEN,
} from "../commons/UI";
import CoachCard from "../comp/CoachCard";
import { OrderEvent } from "../comp/EventCard";

//// ДОДЕЛАТЬ NETWORK CHECK, -> handleUrlError(..., repeatOrder)
let hasInet = navigator.onLine;

export default observer(
  ({ navigation: { navigate, goBack }, route: { params: p } }) => {
    const orderID = p.orderID || p.id,
      dbref = doc(db, "orders", orderID),
      {
        auth: { updateBalance, checkDBUser },
        school: { programs, deleteGroup, updateGroup },
        client: {
          myid,
          orders: { [orderID]: order },
          updateOrder,
          balance,
        },
        cart: { setCoachCart },
      } = useStore(),
      {
        created,
        events,
        quant: qt,
        coachID,
        receipt,
        payurl,
        total,
        status,
        method,
        time,
      } = order || {},
      eventsArr = Object.values(events || {}),
      paid = status == "paid",
      paidByBalance = paid && method == "balance",
      recent = created > dayAgo(),
      canorder = eventsArr.some(
        (e) =>
          e.active &&
          e.from > (e.privat ? Date.now() + 15 * 60000 : Date.now() - 5 * 60000)
      ),
      canpay = !paid && recent && canorder, //(payurl || balance >= total),
      expired = !paid && !canpay,
      urlError = !paid && recent && method == "card" && !payurl,
      showError = urlError && balance < total,
      [load, setLoad] = useState((p.init && payurl) || false),
      statusText =
        (paid ? "paid on" : "created on") +
        dayjs(time || created).format(" D MMM, HH:mm");

    const handleUrlError = () => {
      // if is urlError, pressing button is an Alert with option "Repeat the order"
      // If events = 1 group, "Repeat the order" is a going back to Event screen. Else it's duplicating coach's cart & going to Cart
      // let is1group = !eventsArr[1] && !eventsArr[0].privat; // If it's only 1 group event in order
      // let repeatOrder = () =>   is1group     ? navigate('Event', {id: eventsArr[0].id})         : (setCoachCart(coachID, events), navigate('Cart', {coachID}));
      //  repeatOrder, navigate);
      return callErrorAlert(total - balance, navigate);
    };

    const getOrder = useCallback(
      () => getDoc(dbref).then((d) => updateOrder(d.data())),
      []
    );

    // If the user just ordered and auto-navigated here (params.init), show load && <AbsLoader/> and close it after the payment url opened
    useEffect(() => {
      if (p.init) {
        showError && handleUrlError();
        payurl && //window.open(payurl, "_blank", "noreferrer");
          Linking.openURL(payurl)
            .catch(() =>
              copyAlert(
                `Can't redirect to a payment`,
                `Please, press Copy the payment link, then open your browser and paste it \n${payurl}`,
                payurl
              )
            )
            .finally(() => setLoad(false));
      }
      // const unsubscribe = onSnapshot(dbref, (d) => {
      //   if (!d.exists)
      //     return p.init ? 0 : (navigate("Orders"), alert(`Order's not found`));
      //   updateOrder(d.data());
      // });
      // return () => unsubscribe();
    }, []);

    if (!order) return <Loader big />;

    const renderItem = ({ item: event, index }) => (
      <OrderEvent
        {...{ event, index, navigate }}
        orderPaid={paid && method}
        orderError={urlError || expired}
        only1={!eventsArr[1]}
        prog={programs[event.progID]}
      />
    );

    const payBYBalance = async () => {
      setLoad(true);
      let updEvents = { ...events }; // if changes check gives updates, update 'updEvents' object directly

      let { changed, refund } = await orderChecks(
        updEvents,
        (eid, slotID) => (updEvents[eid].slotID = slotID), // for privats checks, update slotID if needed
        updateGroup
      );

      if (changed[0])
        changed.forEach(
          (c) => (
            (updEvents[c.id].active = false), // 'updEvents' then will be sent to update Order in store
            c.change == "cancelled or passed" && deleteGroup(c.id)
          )
        );
      if (changed.length == eventsArr.length)
        return (
          setLoad(),
          updateOrder({ id: orderID, events: updEvents }),
          alert(
            `No classes can be booked anymore:\n` +
              changed.map((c, i) => `#${i + 1} is ${c.change}`).join(", ")
          ),
          updateDoc(dbref, { events: updEvents })
        );

      let newTotal = changed[0] ? total - refund : total,
        user = await checkDBUser(),
        newBalance = getBalance(user.balance);

      if (newBalance < newTotal)
        return (
          setLoad(),
          balanceAlert(newBalance, newTotal, () =>
            navigate("Balance", { total: newTotal })
          )
        );

      let batch = writeBatch(db),
        time = Date.now(),
        quant = Object.values(updEvents).filter((e) => e.active).length,
        orderUpdates = Object.assign(
          { total: newTotal, quant, status: "paid", method: "balance", time },
          changed[0] && { events: updEvents }
        );

      batch = dbbatchOrderEvents(
        updEvents,
        batch,
        changed[0] && changed.map((c) => c.id),
        dbref
      );

      batch.update(dbref, orderUpdates);

      let error;
      batch
        .commit()
        .catch((er) => (error = er))
        .finally(() => {
          setLoad();
          if (error)
            return alert(
              `Couldn't pay, make sure you have internet connection, then try again.\n\n` +
                (error.message || error)
            );
          updateOrder(Object.assign({ id: orderID }, orderUpdates));
          updateBalance({ time, sum: -newTotal, orderID });
        });
    };

    return (
      <>
        <FlatList
          data={orderBy(eventsArr, "from")}
          {...{ keyExtractor, renderItem, ItemSeparatorComponent }}
          ListHeaderComponent={
            <>
              <RowBetween style={{ alignItems: "flex-start" }}>
                <PageTitle selectable>
                  Order {dayjs(created).format("D MMMM YYYY")}
                </PageTitle>

                {(expired || canpay) && (
                  <MarkView
                    style={!showError && !expired && { backgroundColor: RED }}
                  >
                    <Medium16 style={{ color: "white" }}>
                      {showError ? "error" : expired ? "expired" : "pending"}
                    </Medium16>
                  </MarkView>
                )}
              </RowBetween>
              <Row style={{ marginTop: 3 }}>
                <Caption onPress={() => copytext(orderID)} numberOfLines={1}>
                  {orderID}
                </Caption>
              </Row>
              <Row>
                <Caption onPress={() => copytext(statusText)}>
                  {statusText}
                </Caption>
              </Row>
              <CoachCard
                {...{ myid, coachID, navigate }}
                style={{ marginTop: 14, marginBottom: 24 }}
              />
            </>
          }
          ListFooterComponent={
            <>
              <RowBetween style={{ marginTop: 24 }}>
                <Text21 style={{ color: DGRAY }}>
                  Total {qt + " class" + (qt == 1 ? "" : "es")}
                </Text21>
                <Text24 style={{ color: DGRAY }}>${total}</Text24>
              </RowBetween>
              {(paidByBalance || receipt) && (
                <Button
                  text={
                    receipt
                      ? "Paid by card (get the check)"
                      : "Charged from the account"
                  }
                  onPress={() =>
                    receipt
                      ? Linking.openURL(receipt)
                      : balncChargeAlert(total, time, navigate)
                  }
                  color={GREEN}
                  style={{ marginTop: 16, backgroundColor: BACKGREEN }}
                />
              )}
              <View style={{ flex: 1 }} />
              {showError && (
                <Button
                  transp
                  text="Handle pay-by-card error"
                  onPress={handleUrlError}
                  style={{ marginTop: 32 }}
                />
              )}
              {canpay && (
                <Button
                  big
                  text={
                    balance >= total
                      ? "Pay with balance"
                      : payurl
                      ? "Pay by card"
                      : "Deposit to account"
                  }
                  onPress={() =>
                    balance >= total
                      ? payBYBalance()
                      : payurl
                      ? Linking.openURL(payurl)
                      : navigate("Balance", { total })
                  }
                  style={{ marginTop: urlError ? 16 : 32 }}
                />
              )}
              {paid && <Contacts {...{ orderID }} />}
            </>
          }
          ListFooterComponentStyle={{ flexGrow: 1 }}
          contentContainerStyle={{ flexGrow: 1, padding: 24, paddingTop: 22 }}
          style={{ backgroundColor: "white", width: wwidth }}
          refreshControl={<Refresher update={getOrder} />}
        />
        {load && <AbsLoader style={{ height: wheight - 120 }} />}
      </>
    );
  }
);

let keyExtractor = (e) => e.id;

let callErrorAlert = (addsum, navigate) =>
  callAlert(
    "No card payments for now",
    `Sorry, we're having a trouble with card payments currently.\nTo pay the order, please, add $${addsum} to the account balance via 5 other options`,
    [
      {
        label: `Add $${addsum} deposit`,
        onClick: () => navigate("Balance", { total: addsum }),
      },
    ]
  );

let balanceAlert = (balnc, total, onClick) =>
  callAlert(
    `Not enough balance`,
    `You have $${balnc}, but the order costs $${total}`,
    [{ label: `Add $${total - balnc}`, onClick }]
  );

let balncChargeAlert = (total, time, navigate) =>
  callAlert(
    "Charged from the account",
    `$${total} were charged from your account balance on ${dayjs(time).format(
      "D MMM YYYY, HH:mm"
    )}`,
    [{ label: "Balance history", onClick: () => navigate("BalanceStory") }]
  );

let Caption = styled(Text14)`
    color: ${GRAY};
    padding: 3px 0;
  `,
  ItemSeparatorComponent = styled.View`
    height: 18px;
  `,
  MarkView = styled(UIMark)`
    margin-top: 3px;
    background: ${DGRAY};
  `;
