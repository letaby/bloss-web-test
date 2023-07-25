import React from "react";
import { FlatList } from "react-native";
import styled from "styled-components/native";
import { observer } from "mobx-react-lite";
import dayjs from "dayjs";
import orderBy from "lodash/orderBy";
import { useAuth } from "../commons/Stores";
import {
  callAlert,
  contactsAlert,
  copytext,
  getBalance,
  openRefundPlcy,
} from "../commons/utils";
import {
  DGRAY,
  GRAY,
  GREEN,
  LITEBORDER,
  PageTitle,
  RED,
  RowBetween,
  Text14,
  Text16,
  Touch,
} from "../commons/UI";

export default observer(({ navigation: { navigate } }) => {
  const {
      profile: { uid, balance: bal0 },
    } = useAuth(),
    story = orderBy(Object.values(bal0 || {}), "time", "desc");

  const renderItem = ({ item: rec }) => {
    let { sum, time, who, event, desc, orderID } = rec,
      isplus = sum >= 0,
      name = isplus
        ? event
          ? `Refund cancelled booking (id ${event})`
          : orderID
          ? "Refund non-booked classes"
          : "Deposit"
        : orderID
        ? "Payment"
        : "Write-off";

    const onLongPress = () => recAlert(rec, name, uid);

    return (
      <Touch
        onPress={orderID ? () => navigate("Order", { orderID }) : onLongPress}
        {...{ onLongPress }}
      >
        <RowBetween style={{ alignItems: "flex-start" }}>
          <RecordDescView>
            <Text16 style={{ color: DGRAY }} numberOfLines={1}>
              {dayjs(time).format("D MMM YYYY, HH:mm")}
            </Text16>
            <Desc numberOfLines={1}>{name}</Desc>
            {orderID && <Desc numberOfLines={1}>order {orderID}</Desc>}
            {(who || desc) && (
              <Desc>
                {desc || ""}
                {who && desc
                  ? ` (${who})`
                  : who
                  ? `by ${who == "client" ? "you" : who}`
                  : ""}
              </Desc>
            )}
          </RecordDescView>
          <Sum style={isplus && { color: GREEN }}>
            {sum > 0 ? "+" + sum : sum}$
          </Sum>
        </RowBetween>
      </Touch>
    );
  };

  return (
    <FlatList
      data={story}
      {...{ renderItem, keyExtractor, ItemSeparatorComponent }}
      ListHeaderComponent={<PageTitle>Balance {getBalance(bal0)}$</PageTitle>}
      ListHeaderComponentStyle={{ marginBottom: 16 }}
      contentContainerStyle={{ flexGrow: 1, padding: 24 }}
      style={{ backgroundColor: "white" }}
    />
  );
});

let keyExtractor = (r) => r.time;

let recAlert = ({ time, sum, who, event, desc, orderID }, name, uid) => {
  let refundis0 = sum == 0 && event,
    timeText = dayjs(time).format("D MMM YYYY, HH:mm"),
    sumText = (sum > 0 ? "+" + sum : sum) + "$";
  let copyData =
    `Operation ${sumText} (${timeText})` +
    `\n${name} \n` +
    (who ? `Made by ${who} \n` : "") +
    (desc ? `Comment: ${desc} \n` : "") +
    (orderID ? `Order id ${orderID}` : "");
  return callAlert(copyData.split("$")[0] + "$", copyData, [
    {
      label: refundis0 ? "Refunds policy" : "Copy full info",
      onClick: refundis0 ? openRefundPlcy : () => copytext(copyData),
    },
    {
      label: "Contact support",
      onClick: () =>
        contactsAlert(
          "BALANCE OPERATION",
          `Hello! I have an issue with my account balance change. \nMy id is ${uid}. \n${copyData}`
        ),
    },
  ]);
};

let Sum = styled(PageTitle)`
    flex-shrink: 0;
    color: ${RED};
  `,
  RecordDescView = styled.View`
    max-width: 280px;
    flex-shrink: 1;
    margin: 2px 20px 0 0px;
  `,
  Desc = styled(Text14)`
    color: ${GRAY};
    margin-top: 2px;
    /* text-align: right; */
  `,
  ItemSeparatorComponent = styled.View`
    height: 1px;
    background-color: ${LITEBORDER};
    margin: 16px 0 12px;
  `;
