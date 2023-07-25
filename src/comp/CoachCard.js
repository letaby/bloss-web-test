import React, { useEffect } from "react";
import { View } from "react-native";
import styled from "styled-components/native";
import { observer } from "mobx-react-lite";
import { useSchool } from "../commons/Stores";
import { getRate } from "../commons/utils";
import {
  UserPic,
  Press,
  Row,
  Medium10,
  Text18,
  Text10,
  DGRAY,
  GRAY,
  GREEN,
  BACKGREEN,
  Touch,
  Loader,
  LITEBORDER,
  BACKBLUE,
  Text21,
  RowBetween,
  ACTIVEGRAY,
} from "../commons/UI";

export default observer(({ full, myid, programs, ...r }) => {
  const coachID = full ? r.coach.uid : r.coachID;

  let { coach } = full ? r : {},
    getCoach;

  if (!full)
    ({
      coaches: { [coachID]: coach },
      getCoach,
    } = useSchool());

  const { programs: progs, name, ...c } = coach || { name: "Coach " + coachID },
    isactive = c?.status == "approved",
    rate = getRate(c.rates);

  useEffect(() => {
    if (!full && !coach) getCoach(coachID);
  }, []);

  const onPress = () => r.navigate(full ? "Coach" : "CoachModal", { coachID });

  const renderProgs = (id) => {
    let { name: pname, short } = programs[id] || {};
    return short || pname || "";
  };

  return (
    <Touch {...{ onPress }}>
      <Container style={[full ? { height: 106 + 10 } : border, r.style]}>
        <UserPic
          big={full}
          {...{ name }}
          photo={isactive && c.photo}
          color={!isactive && ACTIVEGRAY}
        />
        <Body>
          <Row>
            <View style={{ flex: 1 }}>
              <Text18 numberOfLines={1}>{name}</Text18>
              {c.price && <Price>${c.grPrice + "-" + c.price} per hour</Price>}
            </View>
          </Row>
          {!coach && (
            <Row>
              <Loader small style={{ marginTop: 8 }} />
            </Row>
          )}
          {progs && (
            <RowBetween
              style={{ marginTop: 8, alignItems: full ? "flex-end" : "center" }}
            >
              <View style={{ flexShrink: 1 }}>
                <Row>
                  <ExpView>
                    <Exp1>{c.expCoach || 4}</Exp1>
                  </ExpView>
                  <ExpView style={{ backgroundColor: BACKBLUE }}>
                    <Exp2>{c.expAthl || 7}</Exp2>
                  </ExpView>
                </Row>
                {full && (
                  <Program numberOfLines={1} style={{ marginTop: 10 }}>
                    {progs.map(renderProgs).join("  ")}
                  </Program>
                )}
              </View>
              {rate && <Rate>{rate}</Rate>}
            </RowBetween>
          )}
        </Body>
      </Container>
    </Touch>
  );
});

let border = { borderWidth: 1, borderColor: LITEBORDER },
  Container = styled(Row)`
    background: white;
    border-radius: 18px;
    padding: 5px;
  `,
  Body = styled.View`
    flex: 1;
    flex-shrink: 1;
    padding: 8px 8px 6px 0;
  `,
  Price = styled(Text10)`
    color: ${DGRAY};
    margin-top: 1px;
  `,
  Program = styled(Medium10)`
    color: ${GRAY};
    letter-spacing: 0.3px;
  `,
  ExpView = styled.View`
    justify-content: center;
    align-items: center;
    width: 23px;
    height: 23px;
    border-radius: 12px;
    background: ${BACKGREEN};
    margin-right: 8px;
  `,
  Exp1 = styled(Medium10)`
    color: ${GREEN};
  `,
  Exp2 = styled(Medium10)`
    color: ${DGRAY};
  `,
  Rate = styled(Text21)`
    color: ${DGRAY};
    margin: 0 2px 0 12px;
  `;
