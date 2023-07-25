//import "setimmediate";
//import { GestureHandlerRootView } from "react-native-gesture-handler";
import React, { useEffect, useRef } from "react";
import styled from "styled-components/native";
//import { RootSiblingParent } from "react-native-root-siblings";
// import { StatusBar } from "expo-status-bar";
import "react-confirm-alert/src/react-confirm-alert.css";
import "react-toastify/dist/ReactToastify.css";
import "react-lazy-load-image-component/src/effects/blur.css";
import { observer } from "mobx-react-lite";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
let Stack = createStackNavigator(),
  Tab = createBottomTabNavigator();
import { ToastContainer } from "react-toastify";
import { onAuthStateChanged } from "firebase/auth";
import { useFonts } from "expo-font";
import Toast from "react-native-toast-message";
import dayjs from "dayjs";
require("dayjs/locale/en");
dayjs.locale("en");
import { auth } from "./config/index2.js";
import { StoresProvider, useAuth, useClient } from "./src/commons/Stores.js";
import EffectsProvider from "./src/commons/EffectsProvider.js";
import { handleGoogleAuthUser } from "./src/commons/AuthStore.js";
import { rootNavg } from "./src/commons/RootNavigation";
import { tabbarHeight } from "./src/commons/utils.js";
import Login from "./src/screens/Login.js";
import Home from "./src/screens/Home";
import Coach from "./src/screens/Coach";
import Private from "./src/screens/Private";
import Cart from "./src/screens/Cart";
import Event from "./src/screens/Event";
import Profile from "./src/screens/Profile";
import EditProfile from "./src/screens/EditProfile";
import Balance from "./src/screens/Balance";
import BalanceStory from "./src/screens/BalanceStory.js";
import AddInfo from "./src/screens/AddInfo";
import AddGroup from "./src/screens/AddGroup";
import Filters from "./src/screens/Filters";
import Order from "./src/screens/Order";
import Image from "./src/screens/Image";
import {
  BackTouch,
  LOGO,
  BACKGRAY,
  BLUE,
  HomeIcon,
  Text11,
  RED,
  Row,
  GRAY,
  UserIcon,
  Text24,
  DGRAY,
} from "./src/commons/UI";

function App() {
  useEffect(() => {
    document.body.style.backgroundColor = BACKGRAY;
    document.body.style.maxWidth = 400;
  }, []);
  return (
    <>
      <StoresProvider>
        <EffectsProvider>
          <Routes />
        </EffectsProvider>
      </StoresProvider>
      <ToastContainer />
      <Toast />
    </>
  );
}
export default App;

let modal = { presentation: "modal" },
  transpModal = { presentation: "transparentModal" };

let linking = {
  config: {
    screens: {
      AddInfo: {
        path: "info",
        stringify: { id: () => ``, coachID: () => `` },
      },
      AddGroup: "add/:id",
      Balance: "balance",
      Filters: "filter",
      Image: "i",
      CoachModal: ":coachID",
      TabStack: {
        screens: {
          HomeStack: {
            screens: {
              Home: "",
              Coach: {
                path: "coaches/:coachID/:modal/:offset",
                stringify: { modal: () => ``, offset: () => `` },
              },
              Event: ":id",
            },
          },
          ProfileStack: {
            screens: {
              Profile: "profile",
              EditProfile: "edit",
              Event: ":eid",
              Order: ":orderID",
            },
          },
        },
      },
    },
  },
};

let Routes = observer(() => {
  useFonts({
    "CeraPro-Medium": require("./assets/fonts/CeraPro-Medium.ttf"),
    "CeraPro-Regular": require("./assets/fonts/CeraPro-Regular.ttf"),
  });

  const mount = useRef(true),
    { myid, age, getDBUser } = useAuth();
  // useEffect(() => {
  //   var signed = false;
  //   onAuthStateChanged(auth, (user) => {
  //     if (!user && signed) return (signed = false);
  //     if (user && !signed && !myid && mount.current)
  //       getDBUser(handleGoogleAuthUser(user)), (signed = true);
  //   });
  // }, []);

  return (
    <NavigationContainer ref={rootNavg}>
      <Stack.Navigator
        screenOptions={{ headerShown: false, animationEnabled: true }}
      >
        {myid && !age && (
          <Stack.Screen
            name="EditProfile"
            component={EditProfile}
            options={{ animationEnabled: false }}
          />
        )}
        {(!myid || (myid && age)) && (
          <>
            <Stack.Screen name="TabStack" component={TabNavigator} />
            <Stack.Group screenOptions={modal}>
              <Stack.Screen
                name="CoachModal"
                component={Coach}
                initialParams={{ modal: true }}
              />
              <Stack.Screen name="Private" component={Private} />
              <Stack.Screen name="Cart" component={Cart} />
              <Stack.Screen
                name="Filters"
                component={Filters}
                options={({ route: r }) =>
                  ["Home", "Private"].includes(r.params.from) && transpModal
                }
              />
              <Stack.Screen name="Balance" component={Balance} />
            </Stack.Group>
            <Stack.Group screenOptions={transpModal}>
              <Stack.Screen name="AddInfo" component={AddInfo} />
              <Stack.Screen name="AddGroup" component={AddGroup} />
              <Stack.Screen name="Image" component={Image} />
            </Stack.Group>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
});

let tabOptions = {
  headerShown: false,
  tabBarShowLabel: false,
  tabBarStyle: { height: tabbarHeight },
  tabBarItemStyle: {
    flex: 1,
    height: tabbarHeight,
    justifyContent: "center",
    alignItems: "center",
  },
  headerShown: false,
  tabBarActiveTintColor: BLUE,
  tabBarInactiveTintColor: "#CDCDCD",
};

const TabNavigator = observer(() => {
  const { myid } = useAuth();
  return (
    <Tab.Navigator screenOptions={tabOptions} initialRouteName={"HomeStack"}>
      <Tab.Screen
        name="HomeStack"
        component={HomeStack}
        options={{ tabBarIcon: HomeTab, tabBarLabel: "Coaches" }}
      />
      <Tab.Screen
        name="ProfileStack"
        component={myid ? ProfileStack : Login}
        options={{ tabBarIcon: UserTab, tabBarLabel: "Profile" }}
      />
    </Tab.Navigator>
  );
});

let HomeStack = () => (
  <Stack.Navigator
    initialRouteName="Home"
    screenOptions={({ route: { name }, navigation: { goBack } }) => ({
      headerShown: name != "Coach" && name != "Home",
      headerLeft: name == "Home" ? null : () => <BackTouch {...{ goBack }} />,
      headerBackVisible: false,
      headerTitle: "", //name == "Home" ? LOGO : "",
      headerTitleAlign: "center",
      headerStyle: { backgroundColor: name == "Home" ? BACKGRAY : "white" },
      animationEnabled: true,
    })}
  >
    <Stack.Screen
      name="Home"
      component={Home}
      options={{ animationEnabled: false }}
    />
    <Stack.Screen name="Coach" component={Coach} />
    {EventScreen}
    {OrderScreen}
  </Stack.Navigator>
);

let ProfileStack = () => (
  <Stack.Navigator
    initialRouteName="Profile"
    screenOptions={({ route: { name }, navigation: { goBack } }) => {
      let isEditPrf = name == "EditProfile";
      return {
        headerShown: name != "Profile",
        headerLeft: () => (
          <BackTouch color={isEditPrf && "white"} {...{ goBack }} />
        ),
        headerBackVisible: false,
        headerTitle: ["Event", "Order"].includes(name)
          ? ""
          : () => (
              <Text24
                numberOfLines={1}
                style={{ color: isEditPrf ? "white" : DGRAY }}
              >
                {isEditPrf ? "Edit profile" : "Account balance"}
              </Text24>
            ),
        headerStyle: { backgroundColor: "white" },
        animationEnabled: true,
      };
    }}
  >
    <Stack.Screen
      name="Profile"
      component={Profile}
      options={{ animationEnabled: false }}
    />
    {EventScreen}
    {OrderScreen}
    <Stack.Screen name="EditProfile" component={EditProfile} />
    <Stack.Screen name="BalanceStory" component={BalanceStory} />
  </Stack.Navigator>
);

let EventScreen = <Stack.Screen name="Event" component={Event} />,
  OrderScreen = <Stack.Screen name="Order" component={Order} />;

let HomeTab = ({ focused: foc }) => (
    <>
      <HomeIcon {...{ foc }} />
      <IconLabel i={0} text="School" {...{ foc }} />
    </>
  ),
  UserTab = ({ focused: foc }) => (
    <>
      <UserTabComp {...{ foc }} />
      <IconLabel text="Profile" {...{ foc }} />
    </>
  ),
  IconLabel = ({ foc, i, text }) => (
    <Text11
      style={{
        marginTop: i == 0 ? 5 : 4,
        color: foc ? BLUE : GRAY,
      }}
    >
      {text}
    </Text11>
  );

let UserTabComp = observer(({ foc }) => {
  const { hasUnpaidOrder } = useClient();
  return (
    <Row>
      <UserIcon {...{ foc }} />
      {!foc && hasUnpaidOrder && <Mark />}
    </Row>
  );
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
