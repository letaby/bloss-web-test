import { Linking } from "react-native";
import { confirmAlert } from "react-confirm-alert"; // Import
// import Toast from "react-native-toast-message";
// import Toast2 from "react-native-root-toast";
import { getFirestore, collection, query, where } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { toast, cssTransition } from "react-toastify";
import app from "../../config/index";
import dayjs from "dayjs";
import orderBy from "lodash/orderBy";
import { rootNavg } from "./RootNavigation";
import { ACTIVEGRAY } from "./UI";
import "./styles.css";

let utc = require("dayjs/plugin/utc"),
  zone = require("dayjs/plugin/timezone");
dayjs.extend(utc);
dayjs.extend(zone);

export const {
    innerWidth,
    innerHeight: wheight,
    localStorage: localStor,
  } = window,
  isDesktop = innerWidth > 450,
  wwidth = isDesktop ? 450 : innerWidth,
  modalWidth = innerWidth > 900 ? 550 : wwidth,
  paddTop = 0,
  paddBottom = 0,
  tabbarHeight = 62 + paddBottom,
  modalHeight = wheight - paddTop,
  SUPPORT = "anastasia_bunny@mail.ru",
  { isAndroid } = require("react-device-detect"),
  { clipboard } = navigator;

export const db = getFirestore(app),
  rdb = getDatabase(app),
  dbCoaches = collection(db, "coaches"),
  dbProgs = collection(db, "programs"),
  dbEvents = collection(db, "events"),
  dbUsers = collection(db, "users"),
  dbOrders = collection(db, "orders"),
  dbBooks = (myid) =>
    query(dbEvents, where("clientsIds", "array-contains", myid || "00"));

export const openRefundPlcy = () =>
  Linking.openURL("https://bloss.am/refunds").catch(
    () => (
      alert(
        `Couldn't launch your browser app. The policy link is copied, go to a browser and paste it there`
      ),
      copytext("https://bloss.am/refunds")
    )
  );

export const dayAgo = () => Date.now() - 24 * 60 * 60000;

export let callAlert = (title, message, buttons, afterClose) =>
  confirmAlert({
    title,
    message: message || undefined,
    buttons: [...buttons, { label: "Close", onClick: null }],
    closeOnEscape: true,
    closeOnClickOutside: true,
    keyCodeForClose: [8, 32],
    overlayClassName: "overlay-custom-class-name",
    afterClose: afterClose || undefined,
  });

export const contactsAlert = (subj, text, isSecond) =>
  callAlert(
    (isSecond ? "2. " : "") + "Whatsapp or e-mail?",
    "Choose the way to contact us",
    [
      {
        label: "Whatsapp",
        onClick: () =>
          Linking.openURL(
            `https://wa.me/79126144799?text=${subj}\n ${text}`
          ).catch(
            () => (
              copytext(`https://wa.me/79126144799?text=${subj}\n${text}`),
              alert(
                `Couldn't launch your Whatsapp app. The link with your data is copied, please, open your BROWSER and paste the copied link. It will open Whatsapp with pretyped message`
              )
            )
          ),
      },
      {
        label: "E-mail",
        onClick: () =>
          Linking.openURL(
            `mailto:${SUPPORT}?subject=${subj}&body=${text}`
          ).catch(
            () => (
              copytext(`TO: ${SUPPORT}\nSUBJECT: ${subj}\n\n${text}`),
              alert(
                `Couldn't launch your mail app. The data is copied, please, open your mail app, start a new letter and paste the copied data.\nOur support e-mail will be in the first line`
              )
            )
          ),
      },
    ]
  );

export const copyAlert = (title, desc, data, subj) => {
  let proceed = () => {
    copytext(data);
    // if (subj) setTimeout(() => contactsAlert(subj, data, 2), 200);
    return;
  };
  return callAlert(
    title,
    desc,
    [{ label: "Copy" + (subj ? " & contact us" : ""), onClick: proceed }],
    () => (console.log("afterclose"), contactsAlert(subj, data, 2))
  );
};

export const contactSuprt = ({ myid, id, orderID }) => {
  let mess = `Hello! My user id is ${myid}, i'm using your Web app.\nI have an issue${
    id || orderID
      ? " with the " + (orderID ? `order ${orderID}` : `booking ${id}`)
      : ""
  }: `;
  return copyAlert(
    `1. Copy your data`,
    `Please, press Copy these data and then paste it into your message\n\n${mess}`,
    mess,
    orderID ? "ORDER ISSUE." : id ? "BOOKING ISSUE" : "COMMON SUPPORT."
  );
};

export const tmzn = new Date().getTimezoneOffset() / -60; //dayjs.tz.guess()

export const timezoneName = new Intl.DateTimeFormat().resolvedOptions()
  .timeZone;

export const getDay = (from) => dayjs(from).format("YYYY-MM-DD");

export const getBalance = (obj) =>
  obj
    ? parseFloat(
        Object.values(obj)
          .reduce((res, curr) => res + (curr.sum || 0), 0)
          .toFixed(1)
      )
    : 0;

export const handleRoutesCheck = () => {
  let {
      index: rootIndex,
      routes: [route0],
    } = rootNavg.current.getRootState(),
    isInTabNavgIndex = rootIndex == 0 && route0.state?.index,
    isINProfileStack = isInTabNavgIndex == 1;
  return { isINProfileStack };
};

export const resetStackRoute = (screen, params) => {
  let iscoach = screen == "Coach", // screen means target screen  we need to navigate
    tabNavg = rootNavg.current.getRootState().routes[0],
    tabRoutes = tabNavg.state.routes,
    tabIndex = iscoach ? 0 : 1;
  tabRoutes[tabIndex] = {
    ...tabRoutes[tabIndex],
    params: undefined,
    state: {
      routes: [
        { name: iscoach ? "Home" : "Profile" },
        { name: screen, params },
      ],
      index: 1,
    },
  };
  return rootNavg.current.resetRoot({
    index: 0,
    routes: [
      {
        ...tabNavg,
        state: { ...tabNavg.state, routes: tabRoutes, index: tabIndex },
      },
    ],
  });
};

export const getFreeSlots = ({ id, from, to }, busies0) => {
  let now = Date.now(),
    in45min = now + 45 * 60000;
  if (to < in45min) return []; // remove slots ending in less than 45 min
  if (!busies0[0]) return [{ id, from, to }];
  let busies = orderBy(busies0, "from");
  // first
  let splitted = [{ id, from, to: busies[0].from }];
  // from second to last-1
  if (busies[1])
    busies.forEach(
      ({ from: bFrom }, i) =>
        i != 0 && splitted.push({ id, from: busies[i - 1].to, to: bFrom })
    );
  // + last
  splitted.push({ id, from: busies[busies.length - 1].to, to });
  return splitted.filter(
    (s) => s.to > in45min && s.to - s.from >= 30 * 60000 //  only ending in 45+ mins & have duration minimum 30 mins
  );
};

export const durtnText = (num, full) => {
  let hh = Math.floor(num / 60),
    mm = num % 60;
  return (
    (hh ? hh + ((full ? " hour" : "h") + (mm ? " " : "")) : "") +
    (mm ? mm + (full ? " min" : "m") : "")
  );
};

export const copytext = (tx) => {
  if (clipboard) clipboard.writeText(tx);
  else document.ex.execCommand("copy", true, tx);
  showToast("copied", 500);
};

export const showToast = (tx, dur, offset, onPress) =>
  toast(tx, {
    position: "top-center",
    autoClose: dur || 2500,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: false,
    // progress: undefined,
    onClick: onPress ? () => (onPress(), toast.dismiss()) : toast.dismiss,
    style: { backgroundColor: ACTIVEGRAY, color: "white" },
    // disable transition
    transition: cssTransition({
      enter: "Toastify__slide-enter--top-center",
      exit: "Toastify__slide-exit--top-center",
      duration: 50,
    }),
  });

// (text, dur, offset, onPress) =>
//   Toast.show({
//     position: "bottom",
//     visibilityTime: dur || 2500,
//     type: "basic",
//     text1: text,
//     bottomOffset: offset || tabbarHeight + 150,
//     onPress: onPress ? () => (onPress(), Toast.hide()) : Toast.hide,
//   });

//   Toast2.show(` ${text}  `, {
//     duration: dur || 2500,
//     position: Toast2.positions.CENTER,
//     onPress,
//   });

export const ages = [
  { id: 5, name: "3-5 y.o." },
  { id: 8, name: "6-8 y.o." },
  { id: 14, name: "9-14 y.o." },
  { id: 17, name: "15-17 y.o." },
  { id: 25, name: "18-25 y.o." },
  { id: 35, name: "26-35 y.o." },
  { id: 99, name: "36+ y.o." },
];

export const colors = [
  "#FFC08A",
  "#605884",
  "#B86C88",
  "#FF988C",
  "#273E65",
  "#0CA0AE",
  "#D9AE91",
  "#A77887",
  "#87CCC5",
  "#743F97",
  "#E1578A",
  "#4400B2",
  "#B9789F",
  "#C23A94",
  "#CE3D1D",
  "#922D25",
  "#F6522E",
  "#DCABAE",
  "#FF7A2F",
  "#EEDC7C",
  "#8EAF0C",
  "#77BD8B",
  "#117243",
  "#00CF91",
  "#2398AB",
  "#BDCCFF",
  "#51EAFF",
  "#5199FF",
];

export const getRate = (obj) => {
  let rates = Object.values(obj || {}),
    rate = rates[12] && rates.reduce((s, r) => s + r, 0) / rates.length;
  return rate?.toFixed(1);
};

export const dbQueryToObj = (query, setState) => {
  let obj = {};
  if (!query.empty)
    query.forEach((d) => {
      let [id, doc] = [d.id, d.data()];
      doc.from && (doc.day = getDay(doc.from));
      return (obj[id] = doc);
    });
  if (setState) return setState(obj);
  else return obj;
};

export const capitalize = (str) => str[0].toUpperCase() + str.substring(1);

export const groupBy = (array, property) =>
  array.reduce((result, item) => {
    const value = item[property];
    (result[value] = result[value] || []).push(item);
    return result;
  }, {});

export let loccoaches = {
    SxYzntNZWMRJQjPSGoJeFC1POpq2: {
      photo:
        "https://firebasestorage.googleapis.com/v0/b/rgonline-1d3e0.appspot.com/o/Ana.jpg?alt=media&token=5d77bd4b-5914-42f0-a057-04da79735283",
      created: 1678995599267,
      expAthl: 11,
      rates: {
        "CV7IrtFXywQIUNvqvwG5V17AvCu2-1687217355365-1-CV7IrtFXywQIUNvqvwG5V17AvCu2": 5,
        "CV7IrtFXywQIUNvqvwG5V17AvCu2-1685054643717-1-CV7IrtFXywQIUNvqvwG5V17AvCu2": 5,
        "trpKyk5b8DNDKXcSJsxQMDsLlWs1-1688457680223-1-trpKyk5b8DNDKXcSJsxQMDsLlWs1": 5,
        "CV7IrtFXywQIUNvqvwG5V17AvCu2-1684895954247-1-CV7IrtFXywQIUNvqvwG5V17AvCu2": 5,
        "CV7IrtFXywQIUNvqvwG5V17AvCu2-1688517774395-1-CV7IrtFXywQIUNvqvwG5V17AvCu2": 5,
        "CV7IrtFXywQIUNvqvwG5V17AvCu2-1685181898085-1-CV7IrtFXywQIUNvqvwG5V17AvCu2": 5,
        "lCqQMnO6a3bJXhI45ZFCgsySHRu2-1684834501711-1-lCqQMnO6a3bJXhI45ZFCgsySHRu2": 5,
        "CV7IrtFXywQIUNvqvwG5V17AvCu2-1684936115882-1-CV7IrtFXywQIUNvqvwG5V17AvCu2": 5,
        "trpKyk5b8DNDKXcSJsxQMDsLlWs1-1686554228141-1-trpKyk5b8DNDKXcSJsxQMDsLlWs1": 5,
      },
      status: "approved",
      name: "Anastasia",
      price: 40,
      slots: {
        1687452100318: {
          from: 1690801200000,
          to: 1690826400000,
          id: "1687452100318",
        },
        1689401462147: {
          id: "1689401462147",
          from: 1691845200000,
          to: 1691857800000,
        },
        1686797503747: {
          from: 1690272000000,
          id: "1686797503747",
          to: 1690291800000,
        },
        1689401410401: {
          id: "1689401410401",
          to: 1691944200000,
          from: 1691928000000,
          busy: {},
        },
        1689401488922: {
          from: 1692532800000,
          id: "1689401488922",
          to: 1692552600000,
          busy: {
            "CV7IrtFXywQIUNvqvwG5V17AvCu2-1689784489265-1": {
              from: 1692541800000,
              to: 1692549000000,
              id: "CV7IrtFXywQIUNvqvwG5V17AvCu2-1689784489265-1",
            },
          },
        },
        1689401532422: {
          to: 1693157400000,
          from: 1693134000000,
          id: "1689401532422",
          busy: {
            1690293582945: {
              from: 1693146600000,
              to: 1693149300000,
              id: "1690293582945",
            },
          },
        },
        1687452065620: {
          id: "1687452065620",
          busy: {
            "CV7IrtFXywQIUNvqvwG5V17AvCu2-1687661969994-1": {
              from: 1690727400000,
              id: "CV7IrtFXywQIUNvqvwG5V17AvCu2-1687661969994-1",
              to: 1690733700000,
            },
          },
          from: 1690722000000,
          to: 1690734600000,
        },
        1687183509050: {
          to: 1690905600000,
          id: "1687183509050",
          from: 1690876800000,
          busy: {
            "trpKyk5b8DNDKXcSJsxQMDsLlWs1-1690276823652-1": {
              id: "trpKyk5b8DNDKXcSJsxQMDsLlWs1-1690276823652-1",
              from: 1690878600000,
              to: 1690884000000,
            },
          },
        },
        1687452078900: {
          id: "1687452078900",
          to: 1691080200000,
          from: 1691060400000,
        },
        1687452172499: {
          to: 1691001000000,
          id: "1687452172499",
          from: 1690970400000,
        },
        1689401313118: {
          to: 1692698400000,
          from: 1692680400000,
          id: "1689401313118",
        },
        1689401258177: {
          id: "1689401258177",
          from: 1691478000000,
          to: 1691490600000,
        },
        1689401433285: {
          to: 1691340300000,
          busy: {
            "CV7IrtFXywQIUNvqvwG5V17AvCu2-1689784338885-1": {
              to: 1691339400000,
              from: 1691332200000,
              id: "CV7IrtFXywQIUNvqvwG5V17AvCu2-1689784338885-1",
            },
          },
          from: 1691323200000,
          id: "1689401433285",
        },
        1689401285825: {
          from: 1692075600000,
          id: "1689401285825",
          to: 1692097200000,
        },
      },
      expCoach: 8,
      timezone: 7,
      provider: "google",
      stat: { privats: 15, hours: 23.916666666666668, classes: 15 },
      bio: "Head coach and the founder of the Bloss.am. Retired professional rhythmic gymnast from Russia. I’m Master of Sports of Russia in rhythmic gymnastics. I have been a member of the national team of Sverdlovsk region in a group and an individual routines, champion of Sverdlovsk region, champion of Ural Federal District in a group routine, winner of the Ural Federal District in the team competition in individual routines, bronze medalist of the international tournament named Gorenkova, winner of all-Russian competitions.\nI graduated from economics university and university of physical culture and sports in Russia.",
      grPrice: 30,
      token: null,
      uid: "SxYzntNZWMRJQjPSGoJeFC1POpq2",
      programs: ["1644433221158", "1657214001589", "1679046800493"],
    },
    atFxsMVXYEQ1JMjnLQt5dCYEATV2: {
      price: 30,
      name: "Anton",
      photo:
        "https://firebasestorage.googleapis.com/v0/b/rgonline-1d3e0.appspot.com/o/7AE5FB3B-8440-4BA8-8403-701BDA872908.JPEG?alt=media&token=7dfaa547-c12b-4fc2-9136-5f5d48bc743a",
      timezone: 7,
      status: "approved",
      bio: "First rank in ice hockey, second rank in paragliding, multiple participant and winner of bodybuilding championships. Current athlete.\n\nПервый разряд по хоккею с шайбой, второй разряд по парапланеризму, многократный участник и призер первенств по бодибилдингу. Действующий спортсмен.",
      uid: "atFxsMVXYEQ1JMjnLQt5dCYEATV2",
      created: 1682668107097,
      rates: {
        "0M03bVjQxJQu5xPGoLrsbQXuUtX2-1687334272808-1-0M03bVjQxJQu5xPGoLrsbQXuUtX2": 5,
        "0M03bVjQxJQu5xPGoLrsbQXuUtX2-1689576957365-1-0M03bVjQxJQu5xPGoLrsbQXuUtX2": 5,
        "0M03bVjQxJQu5xPGoLrsbQXuUtX2-1687452534498-1-0M03bVjQxJQu5xPGoLrsbQXuUtX2": 5,
        "0M03bVjQxJQu5xPGoLrsbQXuUtX2-1687158308216-1-0M03bVjQxJQu5xPGoLrsbQXuUtX2": 5,
      },
      expCoach: 10,
      provider: "google",
      grPrice: 25,
      slots: {
        1689688442308: {
          from: 1689996600000,
          id: "1689688442308",
          to: 1690000200000,
        },
      },
      expAthl: 25,
      stat: { privats: 4, classes: 4, hours: 4 },
      token:
        "fB2l5dBDSmmkDjxZmoQ5KX:APA91bHgdXF24K1R2OpTcCM2ViV82U3DoG9IJ2-35I-o6qSbkZXKGSw2RSoXQQ0HtGVwChB7Qvm_iQkprMVefZGJJLBQ3cqsmXmsJ8ZaRzQq_yKFql8LFP1O_lvzkZ8TaMBk2GyOR_Yk",
      programs: ["1679044987905"],
    },
    lgeXqnXmnvXphzOsOQsTjC3Fr7s2: {
      grPrice: 20,
      bio: "I'm a coach of rhythmic gymnastics at Bloss.am. I'm a candidate for the master of sports of Russia in rhythmic gymnastics. Furthermore, I've been a winner and prize-winner of the All-Russian competitions and of international competitions. Sport is an integral part of my life, so my life is connected with rhythmic gymnastics for 15 years.\nI graduated from University in Russia in the direction of rehabilitation (physiotherapy), higher education. I've had practice with people with disabilities.",
      programs: [
        "1644433221158",
        "1657214001589",
        "1679046800493",
        "1679046814482",
      ],
      created: 1682232750895,
      provider: "apple",
      stat: { classes: 42, privats: 41, hours: 54.5 },
      photo:
        "https://firebasestorage.googleapis.com/v0/b/rgonline-1d3e0.appspot.com/o/_K2A1256.jpg?alt=media&token=139056a2-489b-43c8-870a-d8cc926f1da3",
      status: "approved",
      price: 30,
      rates: {
        "2nnzp9pUSqhJv7jq3CJ3mGMqSQV2-1687723653065-1-2nnzp9pUSqhJv7jq3CJ3mGMqSQV2": 5,
        "CV7IrtFXywQIUNvqvwG5V17AvCu2-1688517257544-1-CV7IrtFXywQIUNvqvwG5V17AvCu2": 5,
        "CV7IrtFXywQIUNvqvwG5V17AvCu2-1687214563796-1-CV7IrtFXywQIUNvqvwG5V17AvCu2": 5,
        "CV7IrtFXywQIUNvqvwG5V17AvCu2-1686792816686-1-CV7IrtFXywQIUNvqvwG5V17AvCu2": 5,
        "lCqQMnO6a3bJXhI45ZFCgsySHRu2-1687016028555-1-lCqQMnO6a3bJXhI45ZFCgsySHRu2": 5,
        "2nnzp9pUSqhJv7jq3CJ3mGMqSQV2-1688945611414-1-2nnzp9pUSqhJv7jq3CJ3mGMqSQV2": 5,
        "Kc7YbDfvcXUJhu8SPCBOJRxHo9l1-1684772543849-1-Kc7YbDfvcXUJhu8SPCBOJRxHo9l1": 5,
        "CV7IrtFXywQIUNvqvwG5V17AvCu2-1688613589501-1-CV7IrtFXywQIUNvqvwG5V17AvCu2": 5,
        "2nnzp9pUSqhJv7jq3CJ3mGMqSQV2-1688121372283-1-2nnzp9pUSqhJv7jq3CJ3mGMqSQV2": 5,
        "lCqQMnO6a3bJXhI45ZFCgsySHRu2-1686441154170-1-lCqQMnO6a3bJXhI45ZFCgsySHRu2": 5,
        "CV7IrtFXywQIUNvqvwG5V17AvCu2-1685117581248-1-CV7IrtFXywQIUNvqvwG5V17AvCu2": 5,
        "3BmCOw4bJ7NHG8W8Ai6KCsDmtJe2-1685213280813-2-3BmCOw4bJ7NHG8W8Ai6KCsDmtJe2": 5,
        "SxYzntNZWMRJQjPSGoJeFC1POpq2-1682536247842-1-SxYzntNZWMRJQjPSGoJeFC1POpq2": 5,
        "CV7IrtFXywQIUNvqvwG5V17AvCu2-1688912015405-1-CV7IrtFXywQIUNvqvwG5V17AvCu2": 5,
        "3BmCOw4bJ7NHG8W8Ai6KCsDmtJe2-1686245026345-1-3BmCOw4bJ7NHG8W8Ai6KCsDmtJe2": 5,
        "2nnzp9pUSqhJv7jq3CJ3mGMqSQV2-1689718195028-1-2nnzp9pUSqhJv7jq3CJ3mGMqSQV2": 5,
        "CV7IrtFXywQIUNvqvwG5V17AvCu2-1688830361646-1-CV7IrtFXywQIUNvqvwG5V17AvCu2": 5,
      },
      token:
        "ffkHf8WxzkytqG2g5Ubde1:APA91bEBENs4wNZKHMWlL3BxgXURrzONvxgZZU30BtRfdSzKFjhE_OH6pWyTxoVYVkscwsP49kLTCSD_KN3pkgL92vfb7FkfUyn73sePRcgIo3dCdH_czfD1Yo5-Qxsy3-X4526zwsCr",
      name: "Maria",
      uid: "lgeXqnXmnvXphzOsOQsTjC3Fr7s2",
      expAthl: 11,
      slots: {
        1689430997962: {
          id: "1689430997962",
          to: 1692651600000,
          from: 1692566100000,
        },
        1686659695934: {
          from: 1690093800000,
          id: "1686659695934",
          to: 1690146000000,
        },
        1686659743294: {
          id: "1686659743294",
          from: 1690319700000,
          to: 1690405200000,
        },
        1686659635478: {
          from: 1689948000000,
          id: "1686659635478",
          to: 1689968700000,
          busy: {
            "2nnzp9pUSqhJv7jq3CJ3mGMqSQV2-1688945611414-3": {
              from: 1689948000000,
              id: "2nnzp9pUSqhJv7jq3CJ3mGMqSQV2-1688945611414-3",
              to: 1689951600000,
            },
            "CV7IrtFXywQIUNvqvwG5V17AvCu2-1688613617499-1": {
              from: 1689951600000,
              to: 1689957000000,
              id: "CV7IrtFXywQIUNvqvwG5V17AvCu2-1688613617499-1",
            },
          },
        },
        1689430899337: {
          id: "1689430899337",
          from: 1691961300000,
          to: 1692046800000,
        },
      },
      timezone: 3,
      expCoach: 3,
    },
  },
  locprogs = {
    1644433221158: {
      name: "Rhythmic gymnastics",
      image:
        "https://firebasestorage.googleapis.com:443/v0/b/rgonline-1d3e0.appspot.com/o/programs%2FRG.jpeg?alt=media&token=5cd8fd4f-5a46-47a7-8fee-5f4694436f6f",
      short: "RG",
      desc: "Rhythmic gymnastics is a sport that combines the beauty of dance with the technical skills of gymnastics. With its graceful movements, flexibility, and precision, rhythmic gymnastics requires a great deal of discipline, training, and practice to achieve success. Therefore, the structure of practice is very important in developing the skills necessary for rhythmic gymnastics.\n\nThe structure of practice in rhythmic gymnastics consists of three main components: warm-up, skill development, and conditioning.\n\nOverall, the structure of practice in rhythmic gymnastics is essential to the success of athletes within the sport. It is through consistent practice, focusing on warm-up, skill development, and conditioning, that gymnasts learn the skills necessary to perform well in rhythmic gymnastics competitions. With dedication and commitment to this structure of practice, rhythmic gymnasts can achieve incredible feats of athleticism and artistry.",
      id: "1644433221158",
    },
    1644572404794: {
      short: "Ballet",
      name: "Ballet",
      id: "1644572404794",
      image:
        "https://firebasestorage.googleapis.com:443/v0/b/rgonline-1d3e0.appspot.com/o/programs%2FBallet.jpeg?alt=media&token=6a98490b-878e-405d-a9ce-c1e935ee4a65",
      desc: "Ballet is a highly disciplined and technical form of dance that has been practiced for centuries. One of the keys to success in ballet is having a structured practice routine.\n\nThe structure of practice in ballet typically begins with warm-up exercises. These can include stretches, pliés, and tendus, which are designed to loosen up the muscles and prepare the body for more complex movements. Following warm-up exercises, ballet dancers will typically move on to practicing specific steps or techniques. These can include pirouettes, jumps, and other movements that require precision and control.\n\nIn addition to practicing specific steps, ballet dancers will also spend time working on their overall technique and posture. This can involve practicing proper alignment, balance, and fluidity of movement. Ballet technique is built on a series of movements that are carefully designed to build muscle memory and improve overall strength and flexibility.\n\nAnother important aspect of practicing ballet is developing musicality. Ballet is often performed to classical music, and dancers must learn to move in time with the rhythm and melody of the music.",
    },
    1657214001589: {
      image:
        "https://firebasestorage.googleapis.com:443/v0/b/rgonline-1d3e0.appspot.com/o/programs%2FStretch.jpeg?alt=media&token=e132007a-19e8-4e55-baaf-48df928eeb65",
      short: "Stretch",
      desc: "The structure of practice in stretching is essential to maximizing its benefits and avoiding potential injuries. Stretching routines should start with a warm-up to prepare the muscles and joints for exercise, followed by a series of specific stretches intended to target different muscle groups.\n\nIn conclusion, the structure of practice in stretching involves a warm-up phase, followed by a specific routine of stretches, and ending with a cool down. The purpose of stretching is to increase the flexibility and range of motion of the muscles, while also reducing the risk of injury. Following a structured routine can help maximize the benefits of stretching and ensure that it is done safely.",
      id: "1657214001589",
      name: "Stretching",
    },
    1679044987905: {
      short: "Fitness",
      name: "Fitness",
      image:
        "https://firebasestorage.googleapis.com:443/v0/b/rgonline-1d3e0.appspot.com/o/programs%2FFitness.jpeg?alt=media&token=f4072c79-b0ad-4a54-98c0-c0027dc6b3c1",
      desc: "Fitness practice is all about making sure that the body is in good shape and functioning optimally. Proper fitness practice requires a proper structure, which helps in ensuring that the body is well-toned and revitalized.\n\nIn conclusion, the structure of fitness practice is significant in achieving the desired results. Proper warm-up, main workout session, cool-down and rest and recovery phase are all necessary components that must be factored in to match an individual's experience and fitness level. Preparing one’s practice in this way will result in improved health, strength and agility.",
      id: "1679044987905",
    },
    1679046800493: {
      desc: "The apparatus used in rhythmic gymnastics requires a high level of technique to perform intricate combinations, tosses, rolls, and catches with grace and fluidity. Each piece of equipment has distinct characteristics that the gymnast must understand to handle them effectively. For example, the hoop requires circular movements, rolling and flipping. On the other hand, the ball is thrown and caught during the routine, requiring the gymnast to maintain a certain level of force and speed.\n\nIn rhythmic gymnastics, the handling of the apparatus is just as important as the gymnast's movements themselves. The athlete must use the equipment as an extension of their body, and the apparatus's manipulation should enhance the routine's beauty and expression. The gymnast must also maintain control of the apparatus at all times, ensuring it never drops, bounces, or flies out of control. Every movement is calculated to ensure the equipment is a part of the performance, not a distraction.\n\nTraining in apparatus handling requires discipline, repetition, and a creative mindset. It involves various exercises to enhance coordination, balance, and fluidity while using the equipment. Learning to handle the apparatus also requires mental strength as the gymnast becomes responsible for creating and designing their unique routine, adding creativity and artistry to the performance.",
      short: "Apparatus handling",
      image:
        "https://firebasestorage.googleapis.com:443/v0/b/rgonline-1d3e0.appspot.com/o/programs%2FApparatus%20handling.jpeg?alt=media&token=c4d2b43e-15fc-4789-bb24-40b234889bab",
      name: "Apparatus handling",
      id: "1679046800493",
    },
    1679046814482: {
      short: "Routine creation",
      name: "Routine creation",
      id: "1679046814482",
      desc: "Creating a routine in rhythmic gymnastics takes a lot of effort and planning. The routine consists of four components: the music, the choice of apparatus, the composition, and the execution. Each element plays a vital role in the overall performance of the routine.\n\nCreating a routine in rhythmic gymnastics is a highly artistic process. It requires careful planning and attention to the various components of the routine, including the music, apparatus, composition, and execution. It's essential for gymnasts to embrace the creative freedom of their sport, experimenting with different elements and routines to showcase their strengths and abilities. With each routine, gymnasts have the opportunity to showcase their talent and love for their sport, leaving a lasting impression on the audience.",
      image:
        "https://firebasestorage.googleapis.com:443/v0/b/rgonline-1d3e0.appspot.com/o/programs%2FRoutine%20creation.jpeg?alt=media&token=d4206732-28a2-45f0-8e8b-f6f146e4de7f",
    },
  },
  locevents = {
    1689788478261: {
      to: 1693157400000,
      clients: {
        MzSgfDRBdagBnJoWNG5WoIfAO5k1: {
          orderID: "MzSgfDRBdagBnJoWNG5WoIfAO5k1-1689796598534",
          uid: "MzSgfDRBdagBnJoWNG5WoIfAO5k1",
          name: "oleg test",
          quant: 1,
          time: 17929239232323,
        },
      },
      created: 1689788478261,
      slotID: "1689401532422",
      clientsIds: ["MzSgfDRBdagBnJoWNG5WoIfAO5k1"],
      coachID: "SxYzntNZWMRJQjPSGoJeFC1POpq2",
      active: true,
      id: "1689788478261",
      age: 17,
      clientsQuant: 1,
      progName: "Rhythmic gymnastics",
      price: 15,
      group: true,
      progID: "1644433221158",
      from: 1693155600000,
      day: "2023-08-27",
    },
  },
  locorder = {
    id: "MzSgfDRBdagBnJoWNG5WoIfAO5k1-1689796598534",
    client: "MzSgfDRBdagBnJoWNG5WoIfAO5k1",
    method: "card",
    payurl:
      "https://checkout.stripe.com/c/pay/cs_live_a1D0TNlt1CUpQmojwOqTRm4cpCR4lUKiCHVmGdEsFoAuSzJ1ZLjX3vVf83#fidkdWxOYHwnPyd1blppbHNgWjA0S0x0akpOVUM0f3NzSTJNT2c1bXw1fHVkY1EzNTxrQnF%2FZjxAcEdHN3FwTVdLblB3UlxtSE1pUDVjT0dObW5zZGRONmtRb2xvfzFhM2thMWxzbmp8dGx1NTU3bV1JbXJTcScpJ2N3amhWYHdzYHcnP3F3cGApJ2lkfGpwcVF8dWAnPyd2bGtiaWBabHFgaCcpJ2BrZGdpYFVpZGZgbWppYWB3dic%2FcXdwYHgl",
    events: {
      1689788478261: {
        day: "2023-08-27",
        progID: "1644433221158",
        client: {
          uid: "MzSgfDRBdagBnJoWNG5WoIfAO5k1",
          quant: 1,
          orderID: "MzSgfDRBdagBnJoWNG5WoIfAO5k1-1689796598534",
          sum: 15,
          name: "Oleg Petruchik",
        },
        progName: "Rhythmic gymnastics",
        price: 15,
        slotID: "1689401532422",
        coachID: "SxYzntNZWMRJQjPSGoJeFC1POpq2",
        group: true,
        active: true,
        id: "1689788478261",
        from: 1693155600000,
        created: 1689788478261,
        age: 17,
        to: 1693157400000,
      },
    },
    total: 15,
    created: 1689796598534,
    coachID: "SxYzntNZWMRJQjPSGoJeFC1POpq2",
    status: "pending",
    name: "Oleg Petruchik",
    quant: 1,
  },
  user = {
    email: "petracome@gmail.com",
    bio: null,
    created: 1679182600839,
    phone: "+6666666",
    // photo: "https://telegra.ph/file/356d4eb538f7a8052175f.jpg",
    timezoneName: "Europe/Minsk",
    name: "Oleg Petruchik",
    stat: { classes: 4, privats: 3, hours: 3.916666666666667 },
    token:
      "eo-BM6SZn0qTvz5RNfT8pO:APA91bEOtjKVUL-w-iZ-0417cyNNBPO8LuxyCOGMNI-MjluC_v0mV0oQaJyPvAe7ZvjB69FHJSbmSMmqegINax3TLJYv6Rf9I2z4j86N6qTqkD24uKs9yF67BzIjVrguC6Fml0Tn78ME",
    color: "#DCABAE",
    device: "web",
    uid: "MzSgfDRBdagBnJoWNG5WoIfAO5k1",
    stripeID: "cus_O7K9rW9gPqCjY8",
    age: 8,
    timezone: 3,
    provider: "google",
    balance: {
      1687204014034: {
        who: "superadmin Oleg Petr",
        time: 1687204014034,
        sum: 55,
        desc: null,
      },
    },
  };
