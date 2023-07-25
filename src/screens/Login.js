import React from "react";
import { Linking, View } from "react-native";
import styled from "styled-components/native";
import { observer } from "mobx-react-lite";
import { useAuth } from "../commons/Stores";
import { contactSuprt } from "../commons/utils";
import {
  Container,
  BlankView,
  SocButtons,
  AbsLoader,
  Touch,
  GRAY,
  RowCentered,
  Text14,
} from "../commons/UI";

export default observer(() => {
  const { appleLogin, googleLogin, initializing } = useAuth();

  return (
    <Container style={{ paddingBottom: 16 }}>
      <BlankView style={{ marginTop: 120 }}>
        {/* <LogoCaption> </LogoCaption> */}
        <SocButtons {...{ appleLogin, googleLogin }} />
      </BlankView>
      <Legals />
      {initializing && <AbsLoader />}
    </Container>
  );
});

export const Legals = ({ myid }) => (
  <>
    <RowCentered style={{ justifyContent: "space-around" }}>
      {myid && (
        <Touch onPress={() => contactSuprt({ myid })}>
          <Text>{"Contacts,\nsupport"}</Text>
        </Touch>
      )}
      <Touch onPress={() => Linking.openURL("https://bloss.am/refunds")}>
        <Text>{"Refund\npolicy"}</Text>
      </Touch>
      <Touch onPress={() => Linking.openURL("https://bloss.am/terms")}>
        <Text>{"Terms of\nservice"}</Text>
      </Touch>
      <Touch onPress={() => Linking.openURL("https://bloss.am/privacy")}>
        <Text>{"Privacy\npolicy"}</Text>
      </Touch>
    </RowCentered>
  </>
);

const LogoCaption = styled.Text`
  font-family: "CeraPro-Regular";
  font-size: 16px;
  line-height: 24px;
  margin-top: 8px;
`;

const Text = styled(Text14)`
  color: ${GRAY};
  text-align: center;
  padding: 6px 0;
`;
