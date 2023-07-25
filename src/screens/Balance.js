import React, { useEffect, useState } from "react";
import { View, FlatList, ScrollView } from "react-native";
import styled from "styled-components/native";
import { observer } from "mobx-react-lite";
import { ref, onValue } from "firebase/database";
import orderBy from "lodash/orderBy";
import useStore from "../commons/Stores";
import {
  copytext,
  rdb,
  contactsAlert,
  getBalance,
  wwidth,
} from "../commons/utils";
import {
  DGRAY,
  Touch,
  Body,
  Loader,
  RowCentered,
  Row,
  Text18,
  CopyIcon,
  GRAY,
  CloseIcon,
  Text15,
  Text16,
  Medium18,
  Button,
  Container,
  PageTitle,
  RowBetween,
  BLUE,
} from "../commons/UI";
import { ZoomTitle, ZoomView } from "./Event";

export default observer(
  ({ navigation: { goBack, navigate }, route: { params: p } }) => {
    const { total } = p || {}, // if navigated from Order, means order total sum is passed & it's > balance. But if new balance get updated and it's >= total, we goback to Order
      {
        auth: {
          checkDBUser,
          profile: { uid: myid, email, balance: balStory },
        },
        client: { balance },
      } = useStore(),
      [payWays, setPayWays] = useState({}),
      array = orderBy(Object.values(payWays), "num"),
      [picked, setPicked] = useState();

    useEffect(() => {
      checkDBUser().then(
        (u) => total && getBalance(u.balance) >= total && goBack()
      );
      onValue(ref(rdb, "payWays"), (v) => setPayWays(v.val()));
    }, []);

    const renderItem = ({ item: it }) => (
      <Touch onPress={() => setPicked(it)}>
        <Text16 style={{ color: BLUE, paddingVertical: 10 }}>{it.name}</Text16>
      </Touch>
    );

    const Wrap = picked ? ScrollView : Container;

    return (
      <Container>
        <RowBetween style={{ marginLeft: 24 }}>
          <PageTitle>Make a deposit</PageTitle>
          <CloseIcon
            onPress={goBack}
            style={{ padding: 20, paddingRight: 24, alignSelf: "flex-end" }}
          />
        </RowBetween>
        <Wrap contentContainerStyle={{ flexGrow: 1, maxWidth: wwidth }}>
          <Body style={{ paddingTop: 0 }}>
            <Desc>
              To book classes, you can either pay by card or charge your account
              deposit balance.
            </Desc>
            <Desc onPress={balStory ? () => navigate("BalanceStory") : null}>
              Your balance is
              <Medium18 style={{ color: balStory ? BLUE : DGRAY }}>
                {` ${balance}$ ${balStory ? "(open history)" : ""}`}
              </Medium18>{" "}
            </Desc>
            <Desc style={{ marginTop: 20, marginBottom: picked ? 10 : 5 }}>
              1. To debit the account, pick a method:
            </Desc>
            {!picked && (
              <FlatList
                data={array}
                {...{ renderItem, keyExtractor }}
                scrollEnabled={false}
                ListEmptyComponent={Loader}
              />
            )}
            {picked && (
              <>
                <PayWay {...picked} close={() => setPicked()} />
                <Desc style={{ marginTop: 32 }}>
                  2. After a payment, send us the confirmation (link or
                  screenshot) via this button
                </Desc>
                <Button
                  transp
                  text="Send a confirmation"
                  onPress={() =>
                    contactsAlert(
                      `ACCOUNT BALANCE`,
                      `Hello! I've just transfered money via ${picked.name} to my BLOSS account (${email}, id is ${myid}).\nHere is the payment confirmation: `
                    )
                  }
                  style={{ marginTop: 16 }}
                />
              </>
            )}
          </Body>
        </Wrap>
      </Container>
    );
  }
);

let keyExtractor = (p) => p.id;

let PayWay = ({ name, opts, desc, close }) => (
  <ZoomView style={{ marginTop: 4 }}>
    <Row>
      <View style={{ flex: 1 }}>
        <Text18 selectable>{name}</Text18>
        {desc && (
          <Text15 style={{ color: GRAY, marginTop: 2 }} selectable>
            {desc}
          </Text15>
        )}
      </View>
      <CloseIcon
        onPress={close}
        size={30}
        style={{
          padding: 16,
          marginTop: -20,
          marginBottom: -14,
          marginRight: -20,
        }}
      />
    </Row>
    {opts.map((o, i) => (
      <RowCentered style={i == 0 && { marginTop: 4 }} key={o.name}>
        <ZoomTitle
          style={{ flexShrink: 0, width: undefined }}
          numberOfLines={1}
          selectable
        >
          {o.name + "   "}
        </ZoomTitle>
        <Touch
          onPress={() => copytext(o.data)}
          style={{ flexShrink: 1, paddingVertical: 6 }}
        >
          <Row>
            <Text18 numberOfLines={1}>{o.data}</Text18>
            <CopyIcon />
          </Row>
        </Touch>
      </RowCentered>
    ))}
  </ZoomView>
);

let Desc = styled(Text16)`
  color: ${DGRAY};
`;
