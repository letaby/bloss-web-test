import React from "react";
import { Linking, View } from "react-native";
import styled from "styled-components/native";
import { observer } from "mobx-react-lite";
import { useAuth } from "../commons/Stores";
import { contactSuprt, deskPadding } from "../commons/utils";
import {
  Container,
  BlankView,
  SocButtons,
  AbsLoader,
  Touch,
  GRAY,
  Row,
  GooglePlayIcon,
  AppleIcon,
  ACTIVEGRAY,
  Press,
  Text16,
} from "../commons/UI";

export let rowView = deskPadding > 224;

export default observer(() => {
  const { appleLogin, googleLogin, load } = useAuth();

  return (
    <Container>
      <LoginView>
        <BlankView style={{ marginTop: 60 }}>
          <SocButtons {...{ appleLogin, googleLogin }} />
          {!rowView && <Legals />}
        </BlankView>
        {rowView && <Legals />}
        {!rowView && <AppPromo />}
      </LoginView>
      {rowView && <AppPromo />}
      {load && <AbsLoader />}
    </Container>
  );
});

export const Legals = ({ myid }) => {
  let textStyle = !myid && { style: { textAlign: "center" } };
  return (
    <DocsRow style={!myid && !rowView && { width: 300, marginTop: 32 }}>
      <View style={{ flex: 1 }}>
        {myid && (
          <Touch onPress={() => contactSuprt({ myid })}>
            <Text>Contacts, support</Text>
          </Touch>
        )}
        <Touch onPress={() => Linking.openURL("https://bloss.am/terms")}>
          <Text {...textStyle}>Terms of service</Text>
        </Touch>
      </View>
      <View style={{ flex: 1 }}>
        {myid && (
          <Touch onPress={() => Linking.openURL("https://bloss.am/refunds")}>
            <Text>Refunds policy</Text>
          </Touch>
        )}
        <Touch onPress={() => Linking.openURL("https://bloss.am/privacy")}>
          <Text {...textStyle}>Privacy policy</Text>
        </Touch>
      </View>
    </DocsRow>
  );
};

export const AppPromo = () => {
  const Wrap = rowView ? DesctopAppPromoView : View;
  return (
    <Wrap style={!rowView && { marginTop: 32 }}>
      <Row>
        {/* <img  src={require("../../assets/ios.png")}  style={{ width: imgWidth, height: imgWidth * (9 / 30) }}  onClick={() =>window.open(  "https://apps.apple.com/us/app/viola-gymnastics/id1559365312",  "_blank")}  />
      <img src={require("../../assets/google.png")} style={{   width: imgWidth,   height: imgWidth * (9 / 30),   marginLeft: 24, }} onClick={() =>   window.open(     "https://play.google.com/store/apps/details?id=com.rgonline.app",     "_blank"   ) }  /> */}
        <StoreView
          onPress={() =>
            window.open(
              "https://apps.apple.com/us/app/viola-gymnastics/id1559365312",
              "_blank"
            )
          }
        >
          <AppleIcon width={25} height={30} style={{ marginTop: -3 }} />
        </StoreView>
        <StoreView
          onPress={() =>
            window.open(
              "https://play.google.com/store/apps/details?id=com.rgonline.app",
              "_blank"
            )
          }
        >
          <GooglePlayIcon width={26} height={27} style={{ marginLeft: 3 }} />
        </StoreView>
      </Row>
      <PromoText>
        Get a mobile app to sync bookings with your calendar, view your classes
        & orders history and coaches' comments on your progress!
      </PromoText>
    </Wrap>
  );
};

let LoginView = styled.View`
    flex: 1;
    padding: 0 ${deskPadding + 24}px 16px;
  `,
  DocsRow = styled(Row)`
    margin-top: 24px;
  `,
  Text = styled(Text16)`
    color: ${GRAY};
    flex-shrink: 0;
    padding: 8px 0;
  `,
  StoreView = styled(Press)`
    width: 50px;
    height: 50px;
    background: ${ACTIVEGRAY};
    border-radius: 40px;
    justify-content: center;
    align-items: center;
    margin-right: 16px;
  `,
  DesctopAppPromoView = styled.View`
    position: absolute;
    left: 24px;
    bottom: 24px;
    width: ${deskPadding > 348 ? 300 : deskPadding - 2 * 24}px;
  `,
  PromoText = styled(Text16)`
    font-size: 14px;
    color: ${GRAY};
    margin-top: 16px;
  `;
