import React, { useEffect, useRef } from "react";
import { FlatList, ScrollView, View } from "react-native";
import styled from "styled-components/native";
import { observer } from "mobx-react-lite";
import useStore from "../commons/Stores";
import { getRate, paddTop, wwidth } from "../commons/utils";
import {
  GRAY,
  DGRAY,
  Row,
  RowCentered,
  Touch,
  shadow4,
  EventIcon,
  Text21,
  PageTitle as Title,
  Container,
  ShowMore,
  Press,
  PageImage,
  Body,
  Loader,
  Text12,
  BLUE,
  BACKGRAY,
  Button,
  Refresher,
  CloseIcon,
  BackIcon,
} from "../commons/UI";
import Program, { width as progWidth } from "../comp/ProgramCard";
import CoachGroups from "../comp/CoachGroups";
import CoachPrivats, { Desc } from "../comp/CoachPrivats";
import { StatsComp } from "../comp/ProfileHeader";

export default observer(
  ({
    navigation: { navigate, goBack, push },
    route: {
      params: { coachID, modal, offset },
    },
  }) => {
    const {
        school: {
          programs,
          coaches: { [coachID]: coach },
          getCoach,
        },
        cart: { getCart },
      } = useStore(),
      { photo: uri, bio, ...c } = coach || {},
      rate = getRate(c.rates),
      cart = getCart(coachID),
      scrollref = useRef(),
      scrollOffset = offset && { y: wwidth + 540 };

    useEffect(() => {
      if (!coach) getCoach(coachID);
    }, []);

    useEffect(() => {
      if (scrollref.current && offset)
        scrollref.current.scrollTo(scrollOffset), console.log("offser");
    }, [scrollref.current && offset]);

    if (!coach) return <Loader big />;

    const renderProgs = ({ item: id }) => (
      <Program {...{ ...programs[id], navigate }} key={id} />
    );

    return (
      <Container>
        <BackIconComp {...{ goBack, modal }} />
        <ScrollView
          ref={scrollref}
          contentContainerStyle={{ flexGrow: 1 }}
          contentOffset={offset ? scrollOffset : undefined}
          refreshControl={modal ? undefined : <Refresh {...{ coachID }} />}
          style={{ width: wwidth }}
        >
          {uri && (
            <Press onPress={() => push("Image", { uri })}>
              <PageImage source={{ uri }} />
              {console.log("photo", uri)}
            </Press>
          )}
          <Body
            style={[
              { flex: 1, paddingBottom: 44 },
              !uri && { paddingTop: 60 + (paddTop || 20) },
            ]}
          >
            <Row style={{ justifyContent: "center" }}>
              <Name selectable>{c.name || "Coach " + coachID}</Name>
            </Row>
            {bio && (
              <>
                <Desc numberOfLines={2} selectable>
                  {bio}
                </Desc>
                <ShowMore onPress={() => navigate("AddInfo", { coachID })} />
              </>
            )}

            <RowCentered style={{ marginVertical: 30 }}>
              <StatsComp
                row={!rate}
                num1={c.expCoach || 4}
                cap1={"years"}
                desc1={"Coach\nexperience"}
                num2={c.expAthl || 7}
                cap2={"years"}
                desc2={"Athlete\nexperience"}
                colored
                style={{ flexGrow: 3 }}
              />
              {rate && (
                <Row style={{ flexGrow: 1 }}>
                  <RateCircle>
                    <RateText>{rate}</RateText>
                    <RateCap>Rating</RateCap>
                  </RateCircle>
                </Row>
              )}
            </RowCentered>

            <Title>Programs</Title>
            <FlatList
              data={c.programs}
              renderItem={renderProgs}
              keyExtractor={progsKeys}
              ItemSeparatorComponent={ProgSeparate}
              getItemLayout={progLayout}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 24,
                paddingTop: 20,
              }}
              style={{ marginHorizontal: -24 }}
            />
            {modal && (
              <Button
                big
                text="Coach classes"
                onPress={() => navigate("Coach", { coachID, offset: true })}
                style={{ marginTop: 48, marginBottom: cart[0] ? 60 : 0 }}
              />
            )}
          </Body>
          {!modal && (
            <>
              <CoachGroups
                incartIds={cart.filter((e) => !e.privat).map((e) => e.id)}
                {...{ coachID, navigate }}
              />
              <CoachPrivats
                incarts={cart.filter((e) => e.privat)}
                style={{ paddingBottom: cart[0] ? 60 + 24 + 32 : 56 }}
                {...{ coachID, navigate }}
              />
            </>
          )}
        </ScrollView>
        {!!cart[0] && (
          <Touch onPress={() => navigate("Cart", { coachID })} ao={0.8}>
            <CartView style={shadow4}>
              <Text21 style={{ color: "white" }}>{cart.length}</Text21>
              <EventIcon
                style={{ marginLeft: 4, marginRight: -2, marginTop: -1 }}
              />
            </CartView>
          </Touch>
        )}
      </Container>
    );
  }
);

let Refresh = observer(({ coachID, ...pr }) => {
  const {
    auth: { myid },
    school: { getCoach, getCoachGroups },
  } = useStore();
  return (
    <Refresher
      update={async () =>
        await Promise.all([getCoach(coachID), getCoachGroups(coachID, myid)])
      }
      {...pr}
    />
  );
});

let progsKeys = (id) => id,
  progLayout = (_, i) => ({
    length: progWidth + 15,
    offset: (progWidth + 15) * i,
    index: i,
  });

let BackIconComp = ({ goBack, modal }) => {
  let style = {
    position: "absolute",
    top: 24,
    left: modal ? undefined : 24,
    right: modal ? 24 : undefined,
    backgroundColor: "white",
    width: 52,
    height: 52,
    borderRadius: 33,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    zIndex: 1,
    ...shadow4,
  };
  return modal ? (
    <CloseIcon size={26} onPress={goBack} {...{ style }} />
  ) : (
    <Press onPress={goBack} {...{ style }}>
      <BackIcon />
    </Press>
  );
};

let Name = styled(Title)`
    text-align: center;
  `,
  ProgSeparate = styled.View`
    width: 15px;
  `,
  CartView = styled(RowCentered)`
    position: absolute;
    bottom: 24px;
    right: 24px;
    justify-content: center;
    width: 60px;
    height: 60px;
    border-radius: 30px;
    background: ${BLUE};
  `,
  RateCircle = styled.View`
    width: 120px;
    height: 120px;
    border-radius: 60px;
    justify-content: center;
    align-items: center;
    border: 1px solid #e4e4e4;
  `,
  RateText = styled(Text21)`
    font-size: 45px;
    color: ${DGRAY};
    line-height: undefined;
  `,
  RateCap = styled(Text12)`
    color: ${DGRAY};
    position: absolute;
    top: 15px;
    right: -6px;
    z-index: 1;
  `;
