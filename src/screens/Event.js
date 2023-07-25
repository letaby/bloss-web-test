import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useLayoutEffect,
} from "react";
import { ScrollView, View } from "react-native";
import styled from "styled-components/native";
import { observer } from "mobx-react-lite";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import dayjs from "dayjs";
import { useClient } from "../commons/Stores";
import {
  db,
  ages,
  copytext,
  showToast,
  wwidth,
  contactSuprt,
  openRefundPlcy,
  callAlert,
} from "../commons/utils";
import {
  RowBetween,
  Button,
  CopyIcon,
  Row,
  RowCentered,
  Text18,
  DGRAY,
  GRAY,
  Text14,
  Text16,
  QuantButton,
  PageTitle,
  Touch,
  ShowMore,
  Press,
  Loader,
  LITEBORDER,
  Text28,
  BACKGRAY,
  Body,
  PageImage,
  BACKBLUE,
  GREEN,
  Container,
  AbsLoader,
  shadow4,
  Medium28,
} from "../commons/UI";
import { Desc } from "./AddInfo";
import CoachCard from "../comp/CoachCard";
import { DurComp, TimeComp } from "../comp/TimeComp";
import { PressPopup, SettingsView, Setting } from "../comp/ProfileHeader";

// что если это занятие щас омтенится

export default observer(
  ({
    navigation: nav,
    route: {
      params: { id, passed: ispasd },
    },
  }) => {
    const {
        myid,
        groups: { [id]: group },
        privats: { [id]: priv },
        programs: { [(group || priv)?.progID]: prog },
      } = useClient(),
      event = group || priv,
      { privat, active, coachID, ...ev } = event || {},
      book = ev?.clientsIds?.includes(myid),
      uri = active && prog?.image,
      [popup, setPopup] = useState(false),
      togglePopup = useCallback(() => setPopup((prv) => !prv), []);

    useLayoutEffect(() => {
      nav.setOptions({
        headerRight: () =>
          book ? (
            <Press onPress={togglePopup}>
              {/* <SettingsIcon style={{ margin: 12 }} /> */}
              <Medium28 style={{ margin: 12, marginBottom: 20 }}>...</Medium28>
            </Press>
          ) : null,
      });
    }, [!book]);

    if (!event) return <Current {...{ id }} {...nav} />;

    return (
      <Container>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          style={{ width: wwidth }}
        >
          {uri && (
            <Press onPress={() => nav.push("Image", { uri })}>
              <PageImage source={{ uri }} style={{ height: wwidth / 2 }} />
            </Press>
          )}
          <Body
            style={{
              flex: 1,
              paddingBottom: 28,
              ...(uri && { paddingTop: 20 }),
            }}
          >
            <Press onPress={() => copytext("sfsd")}>
              <PageTitle>{prog?.name || "Program " + ev.progID}</PageTitle>
            </Press>
            <RowBetween style={{ marginTop: 16 }}>
              <RowCentered>
                <TimeComp big cancel={!active} {...ev} />
                <DurComp big cancel={!active} {...ev} />
              </RowCentered>
              {!book && (
                <Age selectable>{ages.find((a) => ev.age <= a.id).name}</Age>
              )}
              {book && active && !ispasd && (
                <Text16 onPress={togglePopup} style={{ color: GREEN }}>
                  booked
                </Text16>
              )}
            </RowBetween>

            {book && <BookInfo {...{ myid }} {...event} />}

            <Current {...{ event, book, prog }} {...nav} />
          </Body>
        </ScrollView>
        {book && popup && (
          <BookSettings
            toggle={togglePopup}
            {...{ ispasd, ...event, ...nav }}
          />
        )}
      </Container>
    );
  }
);

let Current = observer(({ event, book, prog, navigate, ...pr }) => {
  const mount = useRef(true),
    id = event?.id || pr.id,
    dbref = doc(db, "events", id),
    { privat, active, coachID, from, ...ev } = event || {},
    { name: progName, desc } = prog || {},
    { myid, updateEvent, deleteEvent } = useClient(),
    offer = active && !book && !privat && from > Date.now() - 5 * 60000,
    [quant, setQuant] = useState(1);

  const remove = (type) => (
    showToast(
      "The class is " + (type == "cancel" ? "cancelled" : "already passed")
    ),
    !book && pr.goBack(),
    event && (!book || type == "passed") && deleteEvent(id)
  );

  useEffect(() => {
    if (!event)
      getDoc(dbref).then((dc) => {
        if (!mount.current) return;
        if (!dc.exists)
          return callAlert("Class is already passed or cancelled", 0, [
            {
              label: "Copy id & contact",
              onClick: () => setTimeout(() => contactSuprt(myid, id), 200),
            },
          ]);
        let d = dc.data();
        // if booking or active group, add event
        if (d.clientsIds?.includes(myid) || (d.active && !d.privat))
          updateEvent(d);
        else remove("cancel");
      });
    return () => (mount.current = false);
  }, []);

  // offer listener. No need for book listener, since auto-update comes from all books listener (EffectsProvider.js)
  // useEffect(() => {
  //   if (offer) {
  //     const listener = onSnapshot(
  //       dbref,
  //       (dc) => {
  //         if (!mount.current) return;
  //         if (!dc.exists) return remove("passed");
  //         let d = dc.data(),
  //           dbook = d.clientsIds?.includes(myid);
  //         if (!d.active || d.privat) return remove("cancel");
  //         if (dbook || d.edited != ev.edited)
  //           updateEvent(d),
  //             showToast(
  //               "The class was just " + (dbook ? "booked" : "updated"),
  //               3000
  //             );
  //       },
  //       (er) => console.log("ERROR onSnapshot Event =" + er)
  //     );
  //     return () => listener();
  //   }
  // }, [offer, book]);

  useEffect(() => {
    if (ev && prog && ev.progName != progName) updateDoc(dbref, { progName });
  }, [ev && prog && ev.progName != progName]);

  if (!event) return <Loader big />;

  const order = () =>
    from > Date.now() - 5 * 60000
      ? navigate("Cart", { eventID: id, quant })
      : alert(`The class is already going on. Can't book it`);

  return (
    <>
      {offer && desc && (
        <>
          <Desc numberOfLines={2} style={{ marginTop: 16 }} selectable>
            {desc}
          </Desc>
          <ShowMore onPress={() => navigate("AddInfo", { id: ev.progID })} />
        </>
      )}

      <CoachCard
        {...{ myid, coachID, navigate }}
        style={{ marginTop: offer ? 21 : active ? 4 : 24 }}
      />

      {book && active && <ZoomComp {...ev} style={{ marginTop: 20 }} />}

      {offer && (
        <>
          <View style={{ flex: 1 }} />
          <ButtonsView>
            <QuantButton
              text={"Persons: " + quant}
              plus={() => setQuant((prv) => prv + 1)}
              minus={quant > 1 ? () => setQuant((prv) => prv - 1) : null}
            />
            <Button
              big
              text={"Book, $" + ev.price * quant}
              onPress={order}
              style={{ marginTop: 16 }}
            />
          </ButtonsView>
        </>
      )}
    </>
  );
});

let BookSettings = observer(({ toggle, id, from, privat, ...r }) => {
  const { myid, cancelBook } = useClient(),
    { time, orderID, sum } = r.clients[myid],
    [load, setLoad] = useState(false);

  return (
    <>
      <PressPopup
        onPress={toggle}
        style={{ backgroundColor: "rgba(255,255,255,0.7)" }}
      >
        <SettingsView style={{ marginTop: 16, marginRight: 20, ...shadow4 }}>
          <Touch
            onPress={() => (r.navigate("Order", { id: orderID }), toggle())}
          >
            <Setting>Open order {dayjs(time).format("(D MMM)")}</Setting>
          </Touch>
          {!r.ispasd && r.active && (
            <Touch
              onPress={() => {
                toggle();
                let alertDesc =
                  from > Date.now() + 8 * 60 * 60000
                    ? `You'll be refunded ${sum}$ on your account balance, if you confirm no later than ${dayjs(
                        from - 8 * 60 * 60000
                      ).format("HH:mm, D MMM")}`
                    : "No refund, since the class is in less than 8 hours";
                return callAlert("Cancel booking?", alertDesc, [
                  {
                    label: "Yes, cancel it",
                    onClick: async () => (
                      setLoad(true),
                      await cancelBook(id, privat ? null : setLoad)
                    ),
                  },
                  { label: "Refunds policy", onClick: openRefundPlcy },
                ]);
              }}
            >
              <Setting>Cancel booking</Setting>
            </Touch>
          )}
          <Touch onPress={() => (contactSuprt({ myid, id }), toggle())}>
            <Setting>Contact support</Setting>
          </Touch>
        </SettingsView>
      </PressPopup>
      {load && <AbsLoader />}
    </>
  );
});

let BookInfo = observer(
  ({ myid, privat, age, active, clients: { [myid]: client } }) => {
    return (
      <>
        <ItemRow style={{ marginTop: 18 }}>
          <Type>Type</Type>
          <Text16>{privat ? "private" : "group"}</Text16>
        </ItemRow>
        <ItemRow>
          <Type>Age</Type>
          <Text16>{ages.find((a) => age <= a.id).name}</Text16>
        </ItemRow>
        <ItemRow>
          <Type>Persons</Type>
          <Text16>{client?.quant}</Text16>
        </ItemRow>
        {!active && (
          <CancelView>
            <Text28 style={{ color: DGRAY }}>Cancelled</Text28>
          </CancelView>
        )}
      </>
    );
  }
);

let ZoomComp = ({ zoom, zoomPass, style }) => {
  return (
    <ZoomView {...{ style }}>
      {[zoom, zoomPass].map((it, i) => (
        <Touch onPress={() => copytext(it)} key={String(i)}>
          <RowCentered style={{ paddingVertical: 5 }}>
            <ZoomTitle>{i == 0 ? "Zoom ID" : "Password"}</ZoomTitle>
            {it && (
              <Row>
                <Text18>{it}</Text18>
                <CopyIcon />
              </Row>
            )}
            {!it && <ZoomTitle style={{ color: GRAY }}>soon</ZoomTitle>}
          </RowCentered>
        </Touch>
      ))}
    </ZoomView>
  );
};

export const ZoomView = styled.View`
    background: ${BACKBLUE};
    border-radius: 10px;
    padding: 15px 16px;
    margin-top: 4px;
  `,
  ZoomTitle = styled(Text16)`
    color: ${DGRAY};
    width: 88px;
    margin-top: 1px;
  `;

let Age = styled(Text18)`
    color: ${DGRAY};
    text-align: right;
    flex: 1;
  `,
  ItemRow = styled(RowBetween)`
    border-top-width: 1px;
    border-top-color: ${LITEBORDER};
    padding: 15px 0;
  `,
  Type = styled(Text16)`
    color: ${DGRAY};
  `,
  ButtonsView = styled.View`
    /* flex: 1; */
    /* background: red; */
    justify-content: flex-end;
    margin-top: 32px;
  `,
  CancelView = styled.View`
    justify-content: center;
    align-items: center;
    background: ${BACKGRAY};
    height: 72px;
    border-radius: 10px;
    margin-top: 8px;
  `;
