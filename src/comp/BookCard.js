import React from "react";
import { Image } from "react-native";
// import FastImage from "react-native-fast-image";
import styled from "styled-components/native";
import { observer } from "mobx-react-lite";
import { ages } from "../commons/utils";
import {
  RowBetween,
  Press,
  RowCentered,
  Medium14,
  GREEN,
  GRAY,
  Touch,
  DGRAY,
  Text14,
  Text21,
  BACKGREEN,
  Text12,
  ACTIVEGRAY,
  Text16,
  CloseIcon,
  BACKGRAY,
} from "../commons/UI";
import { DurComp, TimeComp } from "./TimeComp";

export default observer(({ event, passed, ...r }) => {
  const { id, active, from, to, coachID, age } = event, // || r.events[r.id],
    isnow = Date.now(),
    going = active && from < isnow && to > isnow,
    cancel = !active,
    color = going ? GREEN : active ? DGRAY : GRAY,
    name = r.coaches[coachID]?.name || "Coach " + coachID;
  return (
    <Touch onPress={() => r.navigate("Event", { id, passed })}>
      <Wrap style={[going && { backgroundColor: BACKGREEN }, r.style]}>
        <RowBetween>
          <RowCentered>
            <TimeComp {...{ from, going, passed, cancel }} />
            {passed && <DurComp passed {...{ from, to, cancel }} />}
          </RowCentered>
          {going && <Caption>ongoing</Caption>}
          {cancel &&
            (passed ? (
              <Text14 style={{ color }}>cancel</Text14>
            ) : (
              <Caption>cancel</Caption>
            ))}
          {!going && !cancel && !passed && <DurComp {...{ from, to }} />}
        </RowBetween>
        <Text14 style={{ color, marginTop: 8 }} numberOfLines={1}>
          {r.program?.name || "Cancelled program"}
          <Gray14 style={going && { color, opacity: 0.7 }}>
            {"  " + ages.find((a) => a.id >= age).name}
          </Gray14>
        </Text14>
        <Text12 style={{ color, marginTop: 8 }} numberOfLines={1}>
          {name}
        </Text12>
        {cancel && !passed && (
          <Button onPress={() => r.markViewed(id)}>
            <CloseIcon size={20} color="white" />
            <Text16 style={{ color: "white", marginLeft: 8 }}>OK</Text16>
          </Button>
        )}
      </Wrap>
    </Touch>
  );
});

export const CommentImage = styled(Image)`
    width: 86px;
    height: 57px;
    background: ${BACKGRAY};
    border-radius: 6px;
    margin: 4px 0 0 14px;
  `,
  Comment = styled(Text14)`
    color: ${DGRAY};
    flex: 1;
    line-height: 20px;
  `;

let Wrap = styled.View`
    background: white;
    height: 100px;
    border-radius: 18px;
    padding: 16px;
  `,
  Gray14 = styled(Text14)`
    color: ${GRAY};
  `,
  Caption = styled(Medium14)`
    color: ${DGRAY};
    margin-left: 20px;
  `,
  Button = styled(Press)`
    position: absolute;
    right: 8px;
    bottom: 8px;
    flex-direction: row;
    align-items: center;
    background: ${ACTIVEGRAY};
    padding: 8px 12px;
    border-radius: 14px;
  `,
  BookView = styled.View`
    background: white;
    border-radius: 18px;
    padding: 20px;
  `,
  BookTitle = styled(Text21)`
    height: 28px;
    color: ${DGRAY};
  `,
  CircleView = styled.View`
    justify-content: center;
    width: 50px;
    height: 50px;
    background: ${BACKGREEN};
    border-radius: 25px;
    border: 0 solid ${GREEN};
  `,
  Rate = styled(Text21)`
    font-size: 24px;
    text-align: center;
    color: ${GREEN};
  `;
