import React, { useEffect, useRef, useState } from "react";
import { Linking, StyleSheet, View } from "react-native";
import styled from "styled-components/native";
import "react-confirm-alert/src/react-confirm-alert.css";
// import "react-lazy-load-image-component/src/effects/blur.css";
import { observer } from "mobx-react-lite";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Toast from "react-native-toast-message";
import { onAuthStateChanged } from "firebase/auth";
import { useFonts } from "expo-font";
import Toast from "react-native-toast-message";
import dayjs from "dayjs";
require("dayjs/locale/en");
dayjs.locale("en");
import { auth } from "./config/index.js";
import { StoresProvider, useAuth, useClient } from "./src/commons/Stores.js";
import EffectsProvider from "./src/commons/EffectsProvider.js";
import { handleGoogleAuthUser } from "./src/commons/AuthStore.js";
import { rootNavg } from "./src/commons/RootNavigation";
import {
  isDesktop,
  tabbarHeight,
  modalWidth,
  deskPadding,
  wwidth,
} from "./src/commons/utils.js";
import screens from "./src/screens";
import {
  BackTouch,
  BACKGRAY,
  BLUE,
  RED,
  Row,
  UserIcon,
  Text24,
  Press,
  toastConfig,
  CloseIcon,
  GroupsIcon,
  CloseButtonStyle,
  BackIcon,
  Loader,
} from "./src/commons/UI";
import "./App.css";

let theme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: BACKGRAY },
};

export default () => {
  return (
    <>
      <StoresProvider>
        <EffectsProvider>
          <Routes />
        </EffectsProvider>
      </StoresProvider>
      <Toast config={toastConfig} />
    </>
  );
};

let Stack = createStackNavigator(),
  Tab = createBottomTabNavigator();

let transpModal = {
    presentation: "transparentModal",
    animationEnabled: false,
  },
  modal = isDesktop
    ? transpModal
    : { presentation: "modal", animationEnabled: true };

let modalWrap = (name) => {
  let Screen = screens[name];
  if (!isDesktop) return Screen;

  let width = [
    "AddInfo",
    "CoachModal",
    "Balance",
    "Order",
    "BalanceStory",
  ].includes(name)
    ? modalWidth
    : wwidth;

  return (pr) => {
    let { goBack: onPress } = pr.navigation;
    return (
      <View style={{ flex: 1, alignItems: "flex-end" }}>
        <Press
          {...{ onPress }}
          style={{
            ...StyleSheet.absoluteFill,
            backgroundColor: "rgba(0, 0, 0, 0.3)",
          }}
        >
          <CloseIcon
            {...{ onPress }}
            color="white"
            size={40}
            style={{
              alignSelf: "flex-end",
              margin: 24,
              marginRight: width + 24,
            }}
          />
        </Press>
        <View style={{ flex: 1, width, backgroundColor: "white" }}>
          <Screen {...pr} />
        </View>
      </View>
    );
  };
};

let renderModals = (name) => (
  <Stack.Screen
    {...{ name }}
    component={name == "Image" ? screens.Image : modalWrap(name)}
    options={
      ["AddInfo", "AddGroup", "Image", "Filters"].includes(name)
        ? transpModal
        : modal
    }
    key={name}
  />
);

let renderCards = (name) => (
  <Stack.Screen
    {...{ name }}
    component={isDesktop ? modalWrap(name) : screens[name]}
    options={isDesktop ? transpModal : undefined}
    key={name}
  />
);

const Routes = observer(() => {
  useFonts({
    "CeraPro-Medium": require("./assets/fonts/CeraPro-Medium.ttf"),
    "CeraPro-Regular": require("./assets/fonts/CeraPro-Regular.ttf"),
  });

  const mount = useRef(true),
    { myid, age, getDBUser, setLoad } = useAuth(),
    [params, setParams] = useState();

  useEffect(() => {
    Linking.getInitialURL().then((d) => {
      // let { path, queryParams } = Linking.parse(url);
      console.log("LINKING", d);
      if (d.length > "http://localhost:19006/profile".length)
        window.location.href = "http://localhost:19006";
      else setParams({ screen: "HomeStack" });
    });

    var signed = false;
    onAuthStateChanged(auth, (user) => {
      if (!user && signed) return (signed = false);
      if (user && !signed && !myid && mount.current)
        setLoad(true), getDBUser(handleGoogleAuthUser(user)), (signed = true);
    });
  }, []);

  if (!params) return <Loader big />;

  return (
    <NavigationContainer ref={rootNavg} {...{ linking, theme }}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {myid && !age ? (
          <Stack.Screen
            name="EditProfile"
            component={screens.EditProfile}
            options={{ animationEnabled: false }}
          />
        ) : (
          <>
            <Stack.Screen
              name="TabStack"
              component={TabNavigator}
              initialParams={params}
            />
            {[
              "CoachModal",
              "Private",
              "Cart",
              "Balance",
              "AddInfo",
              "AddGroup",
              "Filters",
              "Image",
            ].map(renderModals)}
            {isDesktop &&
              ["Event", "Order", "EditProfile", "BalanceStory"].map(
                renderModals
              )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
});

let tabOptions = {
  headerShown: false,
  tabBarShowLabel: false,
  tabBarStyle: { height: tabbarHeight, paddingHorizontal: deskPadding },
  tabBarItemStyle: {
    flex: 1,
    height: tabbarHeight,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -2,
  },
  tabBarLabelStyle: { fontFamily: "CeraPro-Regular" },
  headerShown: false,
  tabBarActiveTintColor: BLUE,
  tabBarInactiveTintColor: "#CDCDCD",
};

const TabNavigator = ({ route: r }) => {
  console.log("TAB", r.params);
  return (
    <Tab.Navigator screenOptions={tabOptions} initialRouteName={"HomeStack"}>
      <Tab.Screen
        name="HomeStack"
        component={HomeStack}
        options={{ tabBarIcon: HomeTab }}
      />
      <Tab.Screen
        name={"ProfileStack"}
        component={ProfileStack}
        options={{ tabBarIcon: UserTab }}
      />
    </Tab.Navigator>
  );
};

let HomeStack = () => (
  <Stack.Navigator
    initialRouteName="Home"
    screenOptions={({ route: { name }, navigation: { goBack } }) => ({
      headerShown: isDesktop ? name == "Coach" : name != "Home",
      headerLeft: () =>
        isDesktop ? (
          <BackButton {...{ goBack }} />
        ) : (
          <BackTouch {...{ goBack }} />
        ),
      headerBackVisible: false,
      headerTitle: "",
      headerStyle: {
        backgroundColor: name == "Home" ? BACKGRAY : "white",
        height: isDesktop ? 1 : undefined,
      },
      animationEnabled: true,
    })}
  >
    <Stack.Screen
      name="Home"
      component={screens.Home}
      options={{
        animationEnabled: false,
        title: "Rhythmic gymnastics online classes – BLOSS.am",
      }}
    />
    <Stack.Screen name="Coach" component={screens.Coach} />
    {!isDesktop && ["Event", "Order"].map(renderCards)}
  </Stack.Navigator>
);

let ProfileStack = observer(() => {
  const { myid } = useAuth();
  return (
    <Stack.Navigator
      initialRouteName={myid ? "Profile" : "Login"}
      screenOptions={({ route: { name }, navigation: { goBack } }) => {
        let isEditPrf = name == "EditProfile";
        return {
          headerShown: isDesktop ? false : !["Profile", "Login"].includes(name),
          headerLeft: () =>
            isDesktop ? (
              <BackButton {...{ goBack }} />
            ) : (
              <BackTouch color={isEditPrf && "white"} {...{ goBack }} />
            ),
          headerBackVisible: false,
          headerTitle:
            isEditPrf && !isDesktop
              ? () => (
                  <Text24 numberOfLines={1} style={{ color: "white" }}>
                    Edit profile
                  </Text24>
                )
              : "",
          headerTitleAlign: "center",
          headerStyle: {
            backgroundColor: "white",
            height: isDesktop ? 1 : undefined,
          },
          animationEnabled: true,
        };
      }}
    >
      {!myid && <Stack.Screen name="Login" component={screens.Login} />}
      {myid && (
        <>
          <Stack.Screen
            name="Profile"
            component={screens.Profile}
            options={{ animationEnabled: false }}
          />
          {!isDesktop &&
            ["EditProfile", "BalanceStory", "Event", "Order"].map(renderCards)}
        </>
      )}
    </Stack.Navigator>
  );
});

let BackButton = ({ goBack: onPress }) => (
  <Press {...{ onPress }} style={CloseButtonStyle("left")}>
    <BackIcon />
  </Press>
);

let HomeTab = ({ focused: foc }) => <GroupsIcon {...{ foc }} />;

let UserTab = ({ focused: foc }) => (
  <Row>
    <UserIcon {...{ foc }} />
    {!foc && <OrderMark />}
  </Row>
);

let OrderMark = observer(() => {
  const { hasUnpaidOrder } = useClient();
  if (!hasUnpaidOrder) return null;
  return <Mark />;
});

let Mark = styled.View`
  position: absolute;
  top: -2px;
  right: -12px;
  width: 14px;
  height: 14px;
  border-radius: 10px;
  background: ${RED};
`;

let linking = {
  config: {
    screens: {
      NotFound: "*",
      AddInfo: {
        path: "info/:id/:coachID",
        stringify: { id: () => ``, coachID: () => `` },
      },
      AddGroup: "add/:id",
      Balance: "balance",
      Filters: "filter",
      Image: {
        path: "/:uri",
        stringify: { uri: () => `` },
      },
      CoachModal: "coaches/:coachID",
      TabStack: {
        screens: {
          HomeStack: {
            screens: {
              Home: "",
              Coach: {
                path: "coaches/:coachID/:offset",
                stringify: { offset: () => `` },
              },
              ...(!isDesktop && { Event: ":id", Order: "orders/:orderID" }),
            },
          },
          ProfileStack: {
            screens: {
              Profile: "profile",
              Login: "login",
              ...(!isDesktop && {
                Event: ":id",
                EditProfile: "edit",
                Order: "orders/:orderID",
                BalanceStory: "transactions",
              }),
            },
          },
        },
      },
      ...(isDesktop && {
        Event: ":id",
        EditProfile: "edit",
        Order: "orders/:orderID",
        BalanceStory: "transactions",
      }),
    },
  },
};
