import React, { useEffect, useRef } from "react";
import { FlatList, ScrollView, View } from "react-native";
import styled from "styled-components/native";
import { observer } from "mobx-react-lite";
import useStore from "../commons/Stores";
import {
  getRate,
  isDesktop,
  modalWidth,
  screenWidth,
  tabbarHeight,
  wheight,
  wwidth,
} from "../commons/utils";
import {
  DGRAY,
  Row,
  RowCentered,
  Touch,
  shadow4,
  EventIcon,
  Text21,
  PageTitle as Title,
  ShowMore,
  Press,
  PageImage,
  Body,
  Loader,
  Text12,
  BLUE,
  Button,
  Refresher,
  Container,
  GrayContainer,
  ModalCloseButton,
} from "../commons/UI";
import Program, { width as progWidth } from "../comp/ProgramCard";
import CoachGroups from "../comp/CoachGroups";
import CoachPrivats, { Desc } from "../comp/CoachPrivats";
import { StatsComp } from "../comp/ProfileHeader";

const Coach = observer(
  ({
    navigation: { navigate },
    route: {
      params: { coachID, offset },
    },
    modal,
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
      scrollOffset = offset && { y: wheight + 540 };

    useEffect(() => {
      if (!coach) getCoach(coachID);
    }, []);

    useEffect(() => {
      if (offset)
        //scrollref.current.scrollTo(600)
        scrollref.current.scrollTo(0, 600);
    }, [scrollref.current, offset]);

    if (!coach) return <Loader big />;

    const renderProgs = ({ item: id }) => (
      <Program {...{ ...programs[id], navigate }} key={id} />
    );

    const rowView = isDesktop && !modal;

    const bodyWidth =
      rowView &&
      (screenWidth < 700
        ? screenWidth * 0.67
        : screenWidth < 1000
        ? screenWidth * 0.6
        : screenWidth < 1200
        ? screenWidth - wwidth
        : screenWidth - modalWidth);

    const Wrap = (pr) =>
      rowView ? (
        <Row style={{ flex: 1 }}>
          <PageImage
            style={{
              width: screenWidth - bodyWidth,
              height: wheight - tabbarHeight,
              backgroundImage: `url(${uri})`,
            }}
            onClick={() => navigate("Image", { uri })}
          />
          <Container>{pr.children}</Container>
        </Row>
      ) : (
        <GrayContainer>
          {modal && !isDesktop && <ModalCloseButton />}
          {pr.children}
        </GrayContainer>
      );

    return (
      <Wrap>
        <ScrollView
          ref={scrollref}
          contentContainerStyle={{ flexGrow: 1 }}
          contentOffset={offset ? scrollOffset : undefined}
          refreshControl={modal ? undefined : <Refresh {...{ coachID }} />}
          // style={{            width: wwidth,          }}
        >
          {!rowView && (
            <PageImage
              style={{ height: wwidth, backgroundImage: `url(${uri})` }}
              onClick={() => navigate("Image", { uri })}
            />
          )}
          <Body>
            <View
              style={
                rowView && {
                  paddingRight: bodyWidth > 500 ? bodyWidth - 500 : 0,
                }
              }
            >
              <Name
                style={{ textAlign: rowView ? "left" : "center" }}
                selectable
              >
                {c.name || "Coach " + coachID}
              </Name>

              {bio && (
                <Touch onPress={() => navigate("AddInfo", { coachID })}>
                  <Desc numberOfLines={isDesktop ? 3 : 2} selectable>
                    {bio}
                  </Desc>
                  <ShowMore />
                </Touch>
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
            </View>

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
                paddingVertical: 20,
              }}
              style={{ marginHorizontal: -24 }}
            />

            {modal && (
              <Button
                big
                text="Coach classes"
                onPress={() => navigate("Coach", { coachID, offset: true })}
                style={{ marginTop: 24, marginBottom: cart[0] ? 80 : 16 }}
              />
            )}
          </Body>

          {!modal && (
            <>
              <CoachGroups
                incartIds={cart.filter((e) => !e.privat).map((e) => e.id)}
                {...{ coachID, navigate }}
                style={{
                  paddingRight: bodyWidth > 450 ? bodyWidth - 450 : 24,
                }}
              />
              <CoachPrivats
                incarts={cart.filter((e) => e.privat)}
                style={{
                  paddingBottom: cart[0] && !isDesktop ? 60 + 24 + 32 : 56,
                  paddingRight: bodyWidth > 450 ? bodyWidth - 450 : 24,
                }}
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
      </Wrap>
    );
  }
);

export default Coach;

export const CoachModal = (pr) => <Coach {...pr} modal />;

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
