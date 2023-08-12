import React, { useState } from "react";
import {
  View,
  StatusBar,
  ActivityIndicator,
  Pressable,
  TouchableOpacity as Touchbl,
  ImageBackground,
  Linking,
} from "react-native";
import styled from "styled-components/native";
// // import { LazyLoadImage } from "react-lazy-load-image-component";
// import "react-lazy-load-image-component/src/effects/blur.css";
import { RefreshControl } from "react-native-web-refresh-control";
import AntDesign from "@expo/vector-icons/AntDesign";
import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { wheight, wwidth, contactSuprt } from "./utils";
import { useClient } from "./Stores";
import { SafeAreaView } from "react-native-web";

export const GRAY = "#999",
  DGRAY = "#444",
  BACKGRAY = "#f4f4f4",
  LINEGRAY = "#bebebe",
  BORDERGRAY = "#D7D7D7",
  ACTIVEGRAY = "#6C6C6C",
  LITEBORDER = "#E9EBF0",
  BLUE = "#253b6e",
  LINEBLUE = "#9BA5BC",
  BACKBLUE = "#F0F1F5", // '#f2f0f8',
  GREEN = "#4E9F4E",
  BACKGREEN = "#EEFDEE",
  ORANGE = "#fac32d",
  RED = "#C72415"; //'#ea4335';

export const Image = ImageBackground,
  Image2 = ({ style, source: s }) => (
    <Image //LazyLoadImage
      src={s.uri}
      effect="blur"
      placeholderSrc={s.uri}
      // {...{ style }}
      // wrapperProps={{ style }}
      width={style.width}
      height={style.height}
    />
  );

export const Press = Pressable,
  Row = styled.View`
    flex-direction: row;
  `,
  RowCentered = styled(Row)`
    align-items: center;
  `,
  RowBetween = styled(RowCentered)`
    justify-content: space-between;
  `,
  Touch = ({ ao, onPress, ...pr }) => (
    <Touchbl
      activeOpacity={onPress ? ao || 0.7 : 1}
      onPress={onPress || null}
      {...pr}
    />
  ),
  Text14 = styled.Text`
    font-family: "CeraPro-Regular";
    color: black;
    font-size: 14px;
    line-height: 18px;
    flex-shrink: 1;
    text-align-vertical: top;
    /* include-font-padding: false;  // для разных line-height по разному себя ведет  */
  `,
  Text10 = styled(Text14)`
    font-size: 10px;
    line-height: 13px;
  `,
  Text11 = styled(Text10)`
    font-size: 11px;
  `,
  Text12 = styled(Text14)`
    font-size: 12px;
    line-height: 15px;
  `,
  Text15 = styled(Text14)`
    font-size: 15px;
    line-height: 20px;
  `,
  Text16 = styled(Text14)`
    font-size: 16px;
    line-height: 22px;
  `,
  Text18 = styled(Text14)`
    font-size: 18px;
    line-height: 23px;
  `,
  Text21 = styled(Text14)`
    font-size: 21px;
    line-height: 26px;
  `,
  Text24 = styled(Text14)`
    font-size: 24px;
    line-height: 30px;
  `,
  Text28 = styled(Text14)`
    font-size: 28px;
    line-height: 35px;
  `,
  Medium10 = styled(Text10)`
    font-family: "CeraPro-Medium";
  `,
  Medium12 = styled(Text12)`
    font-family: "CeraPro-Medium";
  `,
  Medium14 = styled(Text14)`
    font-family: "CeraPro-Medium";
  `,
  Medium16 = styled(Text16)`
    font-family: "CeraPro-Medium";
  `,
  Medium18 = styled(Text18)`
    font-family: "CeraPro-Medium";
  `,
  Medium21 = styled(Text21)`
    font-family: "CeraPro-Medium";
  `,
  Medium24 = styled(Text24)`
    font-family: "CeraPro-Medium";
  `,
  Medium28 = styled(Text28)`
    font-family: "CeraPro-Medium";
  `,
  PageTitle = styled(Text28)`
    color: ${DGRAY};
  `,
  Title = Text24,
  Title2 = Medium21;

export let GrayContainer = styled(SafeAreaView)`
    flex: 1;
    width: ${wwidth}px;
    /* max-width: ${wwidth}px; */
    align-self: center;
    background: ${BACKGRAY};
  `,
  Container = styled(GrayContainer)`
    background: white;
  `,
  Body = styled.View`
    /* flex: 1; */
    flex-shrink: 1;
    background: white;
    padding: 26px 24px 24px;
    border-top-left-radius: 18px;
    border-top-right-radius: 18px;
  `,
  // PageImage = ({ style, ...r }) => (
  //   <Image
  //     {...r}
  //     style={{
  //       width: wwidth,
  //       height: wwidth,
  //     backgroundColor: BACKGRAY,
  //       marginBottom: -18,
  //     overflow: "hidden",
  //       ...style,
  //     }}
  //   />
  // );
  PageImage = styled(Image)`
    width: ${wwidth}px;
    height: ${wwidth}px;
    background: ${BACKGRAY};
    margin-bottom: -18px;
    overflow: hidden;
  `;

export const BackTouch = ({ color, goBack, ...r }) => {
  return (
    <Press onPress={goBack}>
      <BackIconView {...r}>
        <BackIcon style={color && { backgroundColor: color }} />
      </BackIconView>
    </Press>
  );
};

let BackIconView = styled.View`
  width: 66px;
  height: 60px;
  justify-content: center;
  align-items: center;
`;
export const BackIcon = styled.View`
  width: 21px;
  height: 1px;
  background: ${LINEGRAY};
  transform: rotate(-45deg);
`;

export const MarkView = styled.View`
  background: ${RED};
  border-radius: 6px;
  padding: 2px 8px;
  margin-left: 18px;
`;

export let toastConfig = {
  basic: (pr) => (
    <Press onPress={pr.onPress}>
      <ToastView>
        <Text16 style={{ color: "white" }} numberOfLines={2}>
          {pr.text1}
        </Text16>
      </ToastView>
    </Press>
  ),
};

let ToastView = styled.View({
  width: wwidth - 24 * 2,
  minHeight: 54,
  justifyContent: "center",
  backgroundColor: "rgba(0,0,0,0.75)",
  borderRadius: 8,
  paddingVertical: 12,
  paddingHorizontal: 16,
  zIndex: 1000,
});

export const WhiteStatusBar = (
  <StatusBar barStyle="dark-content" backgroundColor="white" />
);

export const UserPic = ({ photo: uri, big, small, style: style0, ...r }) => {
  let size = r.size || (big ? 106 : small ? 32 : 84),
    style = [
      { width: size, height: size },
      small && { borderRadius: 7 },
      r.right ? { marginLeft: 18 } : { marginRight: 18 },
      { backgroundColor: r.color || BLUE },
      style0,
    ];
  if (uri) return <UserImage source={{ uri }} {...{ style }} />;
  else
    return (
      <BlankUser {...{ style }}>
        <BlankUserChar
          style={[small && { fontSize: 20 }, big && { fontSize: 44 }]}
        >
          {r.name ? r.name[0] : "A"}
        </BlankUserChar>
      </BlankUser>
    );
};

// export const UserImage = ({ style, ...r }) => (
//     <Image
//       {...r}
//       style={{
//         width: 84,
//         height: 84,
//         borderRadius: 15,
//         overflow: "hidden",
//         ...style,
//       }}
//     />
//   ),
export const UserImage = styled(Image)`
    width: 84px;
    height: 84px;
    border-radius: 15px;
    overflow: hidden;
  `,
  BlankUser = styled.View`
    justify-content: center;
    align-items: center;
    width: 84px;
    height: 84px;
    border-radius: 15px;
  `,
  BlankUserChar = styled.Text`
    font-family: "CeraPro-Medium";
    font-size: 32px;
    color: #fff;
    text-transform: capitalize;
  `;

export const Refresher = ({ update, ...pr }) => {
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => (
    setRefreshing(true), await update(), setRefreshing(false)
  );
  return <RefreshControl {...{ refreshing, onRefresh }} {...pr} />;
};

export const InputComp = (r) => (
  <View>
    <Caption style={{ marginBottom: !r.multiline ? -2 : 0 }}>
      {r.caption}
    </Caption>
    <Input ref={r.reff} {...r} />
  </View>
);

export const Caption = styled(Text12)`
  line-height: 12px;
  color: ${GRAY};
  text-transform: uppercase;
  letter-spacing: 0.3px;
  margin-top: 28px;
`;

export const Input = styled.TextInput`
  font-family: "CeraPro-Regular";
  font-size: 16px;
  line-height: 20px;
  color: black;
  padding: 8px 0;
  border-bottom-width: 1px;
  border-color: #eee;
`;

export const BlankImgCircle = styled.View`
  position: absolute;
  z-index: 2;
  width: 100px;
  height: 100px;
  border-radius: 50px;
  border: 3px solid white;
`;

export const ShowMore = (pr) =>
  pr ? (
    <Touch {...pr}>
      <Text14 style={{ color: BLUE, marginTop: 6 }}>{"·  Show more"}</Text14>
    </Touch>
  ) : (
    <Text14 style={{ color: BLUE, marginTop: 6 }}>{"·  Show more"}</Text14>
  );

export const LogOut = ({ white, text, logout, style }) => (
  <RowBetween>
    <View />
    <Touch onPress={logout} ao={0.5}>
      <Medium16
        style={[{ paddingVertical: 12 }, white && { color: "white" }, style]}
      >
        {text || "Log out"}
      </Medium16>
    </Touch>
  </RowBetween>
);

export const Button = ({ text, ...r }) => (
  <ButtonComp {...r} activeOpacity={r.ao || (r.onPress ? 0.7 : 1)}>
    {r.children || (
      <ButtonText
        style={[
          r.big && { fontSize: 21 },
          { color: r.color || (r.transp ? BLUE : "white") },
        ]}
        numberOfLines={1}
      >
        {text}
      </ButtonText>
    )}
  </ButtonComp>
);

const ButtonComp = ({ big, ...r }) => {
  let style = [{ height: big ? 65 : 50 }, r.style];
  return r.transp ? (
    <ButtonTouchTransp {...r} {...{ style }} />
  ) : (
    <ButtonTouch {...r} {...{ style }} />
  );
};

const ButtonTouch = styled(Touchbl)`
  flex-direction: row;
  justify-content: center;
  align-items: center;
  background: ${BLUE};
  border-radius: 10px;
`;

export const ButtonTouchTransp = styled(ButtonTouch)`
  background: rgba(0, 0, 0, 0);
  border: 1px solid ${BORDERGRAY};
`;

const ButtonText = styled(Text18)`
  text-align: center;
  padding: 8px 16px;
`;

export const SocButtons = ({ appleLogin, googleLogin, style }) => {
  let iconstyle = { marginRight: 12, marginTop: -2 };
  return (
    <View style={{ width: wwidth - 24 * 2, ...style }}>
      {["1", "2"].map((e, i) => (
        <Button
          onPress={i == 0 ? googleLogin : appleLogin}
          style={{
            backgroundColor: "white",
            height: 54,
            marginTop: i == 0 ? 0 : 24,
            ...shadow16,
          }}
          key={e}
        >
          {i == 0 ? (
            <GoogleIcon size={16} style={iconstyle} />
          ) : (
            <SocIcon provider="apple" size={16} style={iconstyle} />
          )}
          <Text21>Sign in with {i == 0 ? "Google" : "Apple"}</Text21>
        </Button>
      ))}
    </View>
  );
};

export const QuantButton = ({ text, color, minus, plus, ...pr }) => (
  <Button transp ao={1} {...pr}>
    <Press style={{ padding: (50 - 17) / 2 }} onPress={minus}>
      <MinusIcon {...{ color }} active={minus} />
    </Press>
    <ButtonText style={{ flex: 1, fontSize: 16 }} numberOfLines={1}>
      {text}
    </ButtonText>
    <Press onPress={plus} style={{ padding: (50 - 17) / 2 }}>
      <PlusIcon size={15} {...{ color }} active={plus} />
    </Press>
  </Button>
);

export const DropDown = ({ text, icon, style, ...r }) => (
  <Button
    transp
    style={[{ paddingRight: 14, paddingLeft: 14 + (icon ? 8 : 0) }, style]}
    {...r}
  >
    <DropText numberOfLines={1}>{text}</DropText>
    {icon && <IconDown />}
  </Button>
);

export const DropText = styled(Text16)`
  text-align: center;
  flex: 1;
`;

export const ModalBack = styled(Press)`
  flex: 1;
  background: rgba(0, 0, 0, 0);
`;

export const backgroundComponent = (pr) => <BackView {...pr} />;
const BackView = styled.View({
  backgroundColor: "white",
  borderTopLeftRadius: 0,
  borderTopRightRadius: 0,
});

export const handleComponent = () => <HandleLine />;

const HandleLine = styled.View`
  position: absolute;
  align-self: center;
  top: -14px;
  width: 48px;
  height: 5px;
  background: #f4f4f4;
  border-radius: 3px;
`;

export const FilterButton = ({ active, ...r }) => (
  <Touch {...r}>
    <FilterView style={active && { backgroundColor: BLUE, borderWidth: 0 }}>
      <FilterText style={active && { color: "white" }} numberOfLines={1}>
        {r.text}
      </FilterText>
    </FilterView>
  </Touch>
);

let FilterView = styled.View`
    justify-content: center;
    height: 32px;
    background: white;
    /* border: 1px solid ${BORDERGRAY}; */
    border-radius: 16px;
    padding: 0 14px;
  `,
  FilterText = styled(Text14)`
    text-align: center;
    color: ${DGRAY};
    min-width: 52px;
    max-width: 120px;
  `;

/// ICONS

export const EventIcon = (pr) => (
  <AntDesign name="calendar" color={"#BDBDBD"} size={16} {...pr} />
);

export const PlayIcon = (props) => (
  <Entypo
    name="controller-play"
    color="rgba(255,255,255,0.80)"
    size={130}
    {...props}
  />
);

export const WalletIcon = (pr) => (
  <Entypo name="wallet" color={BORDERGRAY} size={32} {...pr} />
);

export const AbsLoader = ({ style }) => (
  <Loader
    big
    style={[
      {
        position: "absolute",
        height: wheight,
        zindex: 11,
        elevation: 11,
        backgroundColor: "rgba(255, 255, 255, 0.75)",
      },
      style,
    ]}
  />
);

export const Loader = ({ style, small, big }) =>
  big ? (
    <LoadView {...{ style }}>
      <ActivityIndicator size="large" color={DGRAY} />
    </LoadView>
  ) : (
    <ActivityIndicator
      size={small ? "small" : "large"}
      color={DGRAY}
      style={[!small && { paddingVertical: 12 }, style]}
    />
  );

const LoadView = styled.View`
  flex-grow: 1;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 32px;
`;

export const Contacts = ({ id, orderID }) => {
  const { myid } = useClient();
  return (
    <Touch onPress={() => contactSuprt({ myid, id, orderID })}>
      <Contact style={{ marginBottom: -16 }}>
        Have an issue with the {orderID ? "order" : "booking"}?
        <Medium18 style={{ color: GRAY }}>{" Contact us"}</Medium18>
      </Contact>
    </Touch>
  );
};

let Contact = styled(Text14)`
  color: ${GRAY};
  text-align: center;
  padding: 16px 0 16px;
`;

export const Telegram = () => <FontAwesome name="telegram" size={18} />;

export const EmailIcon = ({ size, color }) => (
  <CircleView
    style={{
      width: size || 18,
      height: size || 18,
      backgroundColor: color || "black",
    }}
  >
    <Email>@</Email>
  </CircleView>
);

const CircleView = styled.View`
  border-radius: 20px;
  justify-content: center;
  align-items: center;
`;

const Email = styled.Text`
  font-family: "CeraPro-Medium";
  font-size: 13px;
  color: white;
  margin: -1px -1px 0 0;
`;

export const CopyIcon = (pr) => (
  <Ionicons
    name="copy-outline"
    size={16}
    color={LINEGRAY}
    style={{ marginLeft: 8, marginTop: 2 }}
    {...pr}
  />
);

export const CommentIcon = ({ style, ...pr }) => (
  <Ionicons
    name="chatbubble-sharp"
    size={14}
    color={BLUE}
    {...pr}
    style={[{ transform: [{ scaleX: -1 }] }, style]}
  />
);

export const SocIcon = ({ hasback, ...r }) => (
  <View
    style={
      hasback && {
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: BACKBLUE,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 6,
        ...r.style,
      }
    }
  >
    <FontAwesome
      name={r.provider}
      size={r.size || 11}
      color="black"
      style={hasback ? undefined : r.style}
    />
  </View>
);

export const IconDown = ({ size, color, style }) => (
  <Entypo
    name="chevron-thin-down"
    color={color || DGRAY}
    size={size || 16}
    style={[{ width: size + 1 || 17, marginLeft: 8 }, style]}
  />
);

export const SettingsIcon = ({ size, ...r }) => (
  // <Entypo  name="dots-three-horizontal"  size={size || 22}color={DGRAY}  {...rest}/>
  <Medium28 style={{ lineHeight: 4, marginTop: -16, ...r }}>...</Medium28>
);

export const CloseIcon = ({ size, color, ...r }) => (
  <Press {...r}>
    <AntDesign
      name="close"
      size={size || 34}
      color={color || LINEGRAY}
      style={[{ marginHorizontal: -2 }, color == "white" && shadow4]}
    />
  </Press>
);

export const RemoveIcon = ({ onPress, style, height, ...pr }) => (
  <Press {...{ onPress, style }}>
    <View style={{ height, paddingHorizontal: 16, justifyContent: "center" }}>
      <AntDesign name="closecircle" size={22} />
    </View>
  </Press>
);

export const TrashIcon = ({ color, size, ...r }) => (
  <Ionicons
    name="ios-trash-outline"
    color={color || GRAY}
    size={size || 22}
    {...r}
  />
);

export const SearchIcon = (pr) => (
  <AntDesign name="search1" size={24} color={BORDERGRAY} {...pr} />
);

export const WarnIcon = () => (
  <AntDesign name="exclamationcircleo" size={15} style={{ marginRight: 6 }} />
);

export const RadioIcon = ({ isactive }) =>
  !isactive ? <RadioView /> : <ActiveRadioView />;
const RadioView = styled.View`
  width: 16px;
  height: 16px;
  border-radius: 10px;
  border-width: 1px;
  border-color: #d3d3d3;
  margin: 2px 14px 0 0;
`;
const ActiveRadioView = styled(RadioView)`
  border-width: 5px;
  border-color: #fac32d;
`;

export const CheckboxIcon = ({ active, ...r }) =>
  active ? <CheckIcon {...r} /> : <CheckboxView {...r} />;
const CheckboxView = styled.View`
  width: 18px;
  height: 18px;
  border-radius: 4px;
  border-width: 1px;
  border-color: #d9dbe2;
  justify-content: center;
`;

const CheckIcon = ({ size, color, style }) => (
  <MaterialIcons
    name="check"
    size={size || 26}
    color={color || "white"}
    style={[{ marginLeft: -2 }, style]}
  />
);

export const ReplyIcon = (pr) => (
  <Entypo name="reply" size={24} color={BLUE} {...pr} />
);

export const RightIcon = () => (
  <Entypo
    name="chevron-right"
    color="#d3d3d3"
    size={24}
    style={{ marginRight: -5 }}
  />
);

export const MapIcon = () => (
  <Entypo
    name="location" //"globe"
    color="#b9b9b9"
    size={14}
    style={{ marginTop: -2, marginRight: 10 }}
  />
);

export const InfoIcon = () => (
  <Entypo
    name="info-with-circle"
    color="#d3d3d3"
    size={20}
    style={{ paddingRight: 18, paddingTop: 2 }}
  />
);

export const FilterIcon = () => (
  <MaterialIcons name="filter-list" size={13} style={{ marginTop: -3 }} />
);

export const PhoneIcon = () => (
  <FontAwesome
    name="phone"
    size={19}
    color="#888"
    style={{ marginRight: 10 }}
  />
);

export const MinusIcon = ({ size = 17, ...r }) => (
  <View style={{ justifyContent: "center", height: size, width: size }}>
    <View
      style={{
        height: r.height || 1,
        backgroundColor: r?.color || (r?.active ? DGRAY : BORDERGRAY),
      }}
    />
    {r.children}
  </View>
);

export const PlusIcon = (pr) => (
  <MinusIcon {...pr}>
    <View
      style={{
        position: "absolute",
        alignSelf: "center",
        width: 1,
        height: pr.size || 17,
        backgroundColor: pr.color || (pr.active ? DGRAY : BORDERGRAY),
      }}
    />
  </MinusIcon>
);

export const TimeIcon = (pr) => <Entypo name="time-slot" size={22} {...pr} />;

export const InputIcons = ({ onPress, onPress2 }) => (
  <Row>
    <SendIcon onPress={onPress} style={!onPress2 && { paddingRight: 10 }} />
    {onPress2 && <DelIcon onPress={onPress2} />}
  </Row>
);

export const SendIcon = (pr) => (
  <Touch onPress={pr.onPress} ao={0.5}>
    <View style={{ padding: 16, paddingVertical: 8 }}>
      <MaterialIcons name="send" size={32} color={BLUE} {...pr} />
    </View>
  </Touch>
);

export const AddPhotoIcon = (pr) => (
  <MaterialIcons name="add-to-photos" color="white" size={28} {...pr} />
);

export const InstaIcon = () => (
  <View
    style={{
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: ACTIVEGRAY,
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <View
      style={{
        height: 28,
        width: 28,
        borderRadius: 9,
        backgroundColor: BACKGRAY,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Ionicons
        name="logo-instagram"
        size={33}
        color={ACTIVEGRAY}
        style={{ margin: -4 }}
      />
    </View>
  </View>
);

export const FacbkIcon = () => (
  <View
    style={{
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: ACTIVEGRAY,
      justifyContent: "flex-end",
      alignItems: "center",
    }}
  >
    <FontAwesome
      name="facebook-f"
      size={42}
      color={BACKGRAY}
      style={{ marginBottom: -4, marginRight: -8 }}
    />
  </View>
);

export const YoutbIcon = ({ red }) => (
  <View
    style={
      red
        ? {
            backgroundColor: "white",
            alignSelf: "center",
          }
        : {
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: ACTIVEGRAY,
            justifyContent: "center",
            alignItems: "center",
          }
    }
  >
    <Entypo
      name="youtube"
      size={red ? 66 : 26}
      color={red ? "#FF0000" : BACKGRAY}
      style={red && { margin: -8, marginVertical: -22 }}
    />
  </View>
);

// ШАБЛОНЫ
// box-shadow: x-offset y-offset blur-radius spread-radius color | inset
export const shadow2 = {
    shadowOffset: { height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    boxShadow: "0 2px 2px rgba(0,0,0,0.1)",
  },
  shadow4 = {
    shadowOffset: { height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    boxShadow: "0 4px 8px rgba(0,0,0,0.12)",
  },
  shadow16 = {
    shadowOpacity: 0.16,
    shadowOffset: { height: 8 },
    shadowRadius: 16,
    elevation: 5,
    boxShadow: "0 8px 16px rgba(0,0,0,0.16)",
  };

export const BlankView = styled.View`
    flex: 1;
    /* flex-grow: 1; */
    justify-content: center;
    align-items: center;
    padding: 24px 0;
    /* background: red; */
  `,
  BlankText = styled(Text16)`
    text-align: center;
    color: ${GRAY};
    /* margin: 24px; */
  `;

export const smileIcon = {
  uri: "https://firebasestorage.googleapis.com/v0/b/ullo-9c5aa.appspot.com/o/smile.png?alt=media&token=ea3d7fb2-f586-4ce1-bca4-8f387b09865b",
};

export const sadIcon = {
  uri: "https://firebasestorage.googleapis.com/v0/b/ullo-9c5aa.appspot.com/o/sad.png?alt=media&token=b528bb4b-98e6-4481-8e66-571b0e031a16",
};

const GoogleIcon = (props) => (
  <svg
    width={13}
    height={13}
    viewBox="0 0 13 13"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M12.861 6.646a7.53 7.53 0 00-.103-1.23h-6.12V7.86h3.504a3.018 3.018 0 01-1.3 1.94v1.625h2.091c1.224-1.133 1.928-2.8 1.928-4.778z"
      fill="#4285F4"
    />
    <path
      d="M6.638 13c1.755 0 3.223-.585 4.296-1.576L8.843 9.799c-.585.39-1.327.628-2.205.628-1.695 0-3.13-1.143-3.645-2.687H.837v1.674A6.49 6.49 0 006.638 13z"
      fill="#34A853"
    />
    <path
      d="M2.992 7.74a3.772 3.772 0 01-.206-1.24c0-.433.076-.85.206-1.24V3.586H.836a6.425 6.425 0 000 5.828l2.156-1.673z"
      fill="#FBBC05"
    />
    <path
      d="M6.638 2.573c.959 0 1.815.33 2.492.975l1.852-1.853C9.862.645 8.393 0 6.638 0A6.49 6.49 0 00.837 3.586L2.993 5.26c.514-1.544 1.95-2.687 3.645-2.687z"
      fill="#EA4335"
    />
  </svg>
);

export const HomeIcon = ({ foc, ...props }) => (
  <svg
    width={26}
    height={21}
    viewBox="0 0 26 21"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M0 20.909v-3.83a7.613 7.613 0 012.258-5.402A7.733 7.733 0 017.702 9.44c2.042 0 4 .805 5.444 2.237a7.613 7.613 0 012.258 5.401v3.83H0z"
      fill={foc ? BLUE : "#CDCDCD"}
    />
    <path
      d="M13.206 5.507a5.507 5.507 0 11-11.013 0 5.507 5.507 0 0111.013 0z"
      fill="#EFEFEF"
    />
    <path
      d="M17.307 21h7.867v-5.319a6.22 6.22 0 00-1.845-4.413A6.318 6.318 0 0018.88 9.44a6.319 6.319 0 00-4.425 1.805 7.862 7.862 0 012.852 6.054V21z"
      fill={foc ? BLUE : "#CDCDCD"}
    />
    <path d="M23.378 6.073a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" fill="#EFEFEF" />
  </svg>
);

export const UserIcon = ({ foc, ...props }) => (
  <svg
    width={17}
    height={22}
    viewBox="0 0 17 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M0 22v-4.03a8.01 8.01 0 012.375-5.683 8.136 8.136 0 015.729-2.354c2.149 0 4.209.847 5.729 2.354a8.01 8.01 0 012.375 5.682V22H0z"
      fill={foc ? BLUE : "#CDCDCD"}
    />
    <path
      d="M13.896 5.794a5.794 5.794 0 11-11.589 0 5.794 5.794 0 0111.589 0z"
      fill="#EFEFEF"
    />
  </svg>
);

export const LOGO = () => (
  <Touch onPress={() => window.open("https://bloss.am/")}>
    <svg
      width={129}
      height={30}
      viewBox="0 0 129 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14.654.154c-7.996 0-14.5 6.505-14.5 14.5 0 7.996 6.505 14.5 14.5 14.5s14.5-6.504 14.5-14.5c0-7.995-6.505-14.5-14.5-14.5zm0 27.996c-7.441 0-13.495-6.054-13.495-13.496 0-7.441 6.054-13.495 13.495-13.495 7.441 0 13.495 6.054 13.495 13.495 0 7.442-6.054 13.496-13.495 13.496z"
        fill={BLUE}
      />
      <path
        d="M10.49 3.342a12.575 12.575 0 00-7.176 6.924.502.502 0 00.928.386 11.567 11.567 0 016.6-6.37.502.502 0 00-.351-.94zM39.745 7.093h-.01c2.02 0 3.71 1.673 3.748 3.673 0 .402-.14.869-.261 1.243 1.72.747 3.261 2.448 3.261 4.831 0 1.44-.514 2.673-1.542 3.701s-2.262 1.542-3.7 1.542h-5.243V7.093h3.747zm-.757 4.794h.748c.504 0 .906-.383.906-.878a.917.917 0 00-.906-.925h-.748v1.803zm2.243 7.196c1.234 0 2.252-1.01 2.252-2.233a2.18 2.18 0 00-.663-1.599c-.44-.439-.972-.467-1.589-.467h-2.243v4.3h2.243zm6.383-12.036h3.018v12.046h6.019v3.018h-9.037V7.047zm17.392-.076c2.093 0 3.887.748 5.382 2.243 1.496 1.495 2.243 3.29 2.243 5.383 0 2.094-.747 3.888-2.243 5.373-1.495 1.486-3.29 2.234-5.383 2.234s-3.887-.748-5.373-2.234c-1.485-1.485-2.233-3.28-2.233-5.373 0-2.093.747-3.887 2.233-5.383 1.486-1.495 3.28-2.243 5.373-2.243zm0 3.038c-1.262 0-2.337.448-3.225 1.345-.887.898-1.336 1.972-1.336 3.225 0 1.261.449 2.336 1.336 3.224.888.888 1.963 1.336 3.224 1.336 1.253 0 2.327-.448 3.225-1.336.897-.888 1.345-1.963 1.345-3.224 0-1.253-.448-2.327-1.345-3.225-.898-.897-1.972-1.345-3.225-1.345zm13.204 9.13l-.01-.019c.832 0 1.524-.691 1.524-1.523 0-.645-.252-1.056-.766-1.243-1.084-.402-.823-.308-1.879-.673a6.01 6.01 0 01-2.831-2.084c-.412-.56-.617-1.252-.617-2.084 0-1.252.448-2.327 1.346-3.224.897-.897 1.971-1.345 3.233-1.345 1.252 0 2.327.448 3.224 1.345.897.897 1.346 1.972 1.346 3.224h-3.037c0-.822-.692-1.514-1.514-1.514-.832 0-1.523.692-1.523 1.524 0 .542.214.953.654 1.233.897.58.794.467 1.869.785a5.807 5.807 0 012.925 1.981c.42.542.635 1.243.635 2.094 0 1.261-.448 2.336-1.346 3.233-.897.897-1.971 1.346-3.224 1.346-1.261 0-2.336-.449-3.233-1.346-.897-.897-1.346-1.972-1.346-3.233h3.047c0 .84.682 1.523 1.523 1.523zm10.439 0l-.01-.019c.832 0 1.524-.691 1.524-1.523 0-.645-.253-1.056-.767-1.243-1.084-.402-.822-.308-1.878-.673a6.01 6.01 0 01-2.832-2.084c-.41-.56-.616-1.252-.616-2.084 0-1.252.448-2.327 1.345-3.224.897-.897 1.972-1.345 3.234-1.345 1.252 0 2.327.448 3.224 1.345.897.897 1.346 1.972 1.346 3.224H90.18c0-.822-.691-1.514-1.514-1.514-.831 0-1.523.692-1.523 1.524 0 .542.215.953.654 1.233.897.58.795.467 1.87.785a5.807 5.807 0 012.924 1.981c.42.542.636 1.243.636 2.094 0 1.261-.449 2.336-1.346 3.233-.897.897-1.972 1.346-3.224 1.346-1.262 0-2.336-.449-3.233-1.346-.897-.897-1.346-1.972-1.346-3.233h3.046c0 .84.683 1.523 1.524 1.523zm5.775 1.393c0-1.066.86-1.926 1.925-1.926 1.066 0 1.925.86 1.925 1.925 0 1.066-.86 1.926-1.925 1.926a1.922 1.922 0 01-1.925-1.925zm10.374-3.402h2.663L106.134 14l-1.336 3.13zm-1.234 2.663l-.038.112-.981 2.168H99.293l6.831-15.307 6.85 15.307H109.712l-.971-2.177-.047-.103h-5.131.001zm10.541-13.027l7.346 10.074 7.345-10.074v15.345h-3.018v-6.215l-4.327 5.972-4.327-5.971v6.214h-3.018l-.001-15.345z"
        fill={BLUE}
      />
    </svg>
  </Touch>
);
