import React, { useCallback, useState } from "react";
import { Alert, ScrollView, View } from "react-native";
import styled from "styled-components/native";
import { observer } from "mobx-react-lite";
import { useFocusEffect } from "@react-navigation/native";
import useStore from "../commons/Stores";
import { ages, callAlert, copytext, wwidth } from "../commons/utils";
import {
  SocIcon,
  UserPic,
  Text14,
  Text12,
  Row,
  RowCentered,
  Press,
  GRAY,
  DGRAY,
  Text18,
  SettingsIcon,
  Medium16,
  Touch,
  GREEN,
  Medium18,
  Text10,
  BACKGREEN,
  BORDERGRAY,
  BLUE,
  BACKBLUE,
  shadow4,
} from "../commons/UI";

export default observer(({ navigate }) => {
  const {
      auth: { profile },
      client: { handleLogout, balance },
    } = useStore(),
    { phone, bio, age, email, stat, ...p } = profile,
    [showSets, setShowSets] = useState(false),
    toggleSets = () => setShowSets(!showSets);

  useFocusEffect(useCallback(() => () => setShowSets(false), []));

  const askLogout = () =>
    callAlert("Log out?", 0, [{ label: "Log out", onClick: handleLogout }]);

  return (
    <>
      <Press onPress={toggleSets}>
        <HeadRow>
          <UserPic big {...p} style={{ height: 144 }} />
          <View style={{ flex: 1, flexShrink: 1, marginTop: 6 }}>
            <RowCentered>
              <Text18 style={{ flex: 1 }} numberOfLines={1}>
                {p.name}
              </Text18>
              <SettingsIcon style={{ marginLeft: 20 }} />
            </RowCentered>
            <Bio numberOfLines={1} selectable>
              {ages.find((a) => a.id >= age).name + " " + (bio || "")}
            </Bio>
            <Row>
              <Touch
                onPress={
                  phone
                    ? toggleSets
                    : () => navigate("EditProfile", { phone: "1" })
                }
              >
                <Bio style={{ color: GRAY }} numberOfLines={1} selectable>
                  {phone || "add contact"}
                </Bio>
              </Touch>
            </Row>
            <ScrollView
              horizontal
              contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 18 }}
              showsHorizontalScrollIndicator={false}
              style={{ marginTop: 12, marginHorizontal: -18 }}
            >
              <Touch onPress={() => navigate("Balance")}>
                <StatCircle style={{ backgroundColor: "white" }}>
                  <StatNum style={{ color: BLUE }}>{balance}</StatNum>
                  <StatCap style={{ left: 28, color: BLUE }}>
                    $, balance
                  </StatCap>
                </StatCircle>
              </Touch>
              <Press style={{ flexGrow: 2 }}>
                <StatsComp
                  row
                  num1={stat?.classes || 0}
                  cap1={"classes"}
                  num2={Math.round(stat?.hours || 0)}
                  cap2={"hours"}
                  style={{ flex: 1 }}
                />
              </Press>
            </ScrollView>
          </View>
        </HeadRow>
      </Press>
      {showSets && (
        <PressPopup onPress={toggleSets}>
          <SettingsView style={{ marginRight: 40, ...shadow4 }}>
            <Touch onPress={() => copytext(email)}>
              <RowCentered style={{ paddingVertical: 10 }}>
                <SocIcon {...p} hasback />
                <Email numberOfLines={1}>{email}</Email>
              </RowCentered>
            </Touch>
            <Touch onPress={() => navigate("EditProfile")}>
              <Setting>Edit profile</Setting>
            </Touch>
            <Touch onPress={askLogout}>
              <Setting>Log out</Setting>
            </Touch>
          </SettingsView>
        </PressPopup>
      )}
    </>
  );
});

export const StatsComp = ({ colored, desc1, desc2, row, ...r }) => {
  let greentx = colored && { color: GREEN },
    Wrap = row ? Row : View;
  return (
    <Wrap {...r}>
      <RowCentered style={desc1 && { flex: 1 }}>
        <StatCircle
          style={[
            colored ? { backgroundColor: BACKGREEN } : { borderWidth: 1 },
            desc1 && { marginRight: 16 },
          ]}
        >
          <StatNum style={greentx}>{Math.round(r.num1)}</StatNum>
          <StatCap style={greentx}>{r.cap1}</StatCap>
        </StatCircle>
        {desc1 && <StatDesc style={greentx}>{desc1}</StatDesc>}
      </RowCentered>
      <RowCentered style={[desc1 && { flex: 1 }, !row && { marginTop: 20 }]}>
        <StatCircle
          style={[
            colored ? { backgroundColor: BACKBLUE } : { borderWidth: 1 },
            { marginRight: desc2 ? 16 : 8 },
          ]}
        >
          <StatNum>{Math.round(r.num2)}</StatNum>
          <StatCap>{r.cap2}</StatCap>
        </StatCircle>
        {desc2 && <StatDesc>{desc2}</StatDesc>}
      </RowCentered>
    </Wrap>
  );
};

export let PressPopup = styled(Press)`
    position: absolute;
    top: 0;
    height: 100%;
    width: ${wwidth}px;
    z-index: 1;
  `,
  SettingsView = styled.View`
    background: white;
    align-self: flex-end;
    min-width: 180px;
    max-width: 240px;
    border-radius: 18px;
    padding: 8px 16px;
    margin: 24px 24px 0 0;
  `,
  Setting = styled(Medium16)`
    color: ${DGRAY};
    padding: 10px 0;
  `;

let HeadRow = styled(Row)`
    padding-right: 24px;
    margin: 0 -24px 0 -4px;
  `,
  Bio = styled(Text14)`
    color: ${DGRAY};
    margin-top: 5px;
  `,
  Email = styled(Text14)`
    color: ${GRAY};
    max-width: 160px;
  `,
  StatCircle = styled.View`
    justify-content: center;
    align-items: center;
    /* background: white */
    width: 50px;
    height: 50px;
    border-radius: 25px;
    border: 0 solid ${BORDERGRAY};
    margin-right: 28px;
  `,
  StatNum = styled(Medium18)`
    font-size: 19px;
    color: ${DGRAY};
  `,
  StatCap = styled(Text10)`
    font-size: 9px;
    /* line-height: 10px; */
    width: 44px;
    color: ${DGRAY};
    position: absolute;
    top: 2px;
    left: 33px;
    z-index: 1;
  `,
  StatDesc = styled(Text14)`
    line-height: 15px;
    color: ${DGRAY};
  `,
  Dollar = styled(Text12)`
    color: ${BLUE};
    margin: 2px 0 0 -2px;
  `;
