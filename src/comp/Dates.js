import React from "react";
import { View, FlatList } from "react-native";
import styled from "styled-components/native";
import dayjs from "dayjs";
import { Press, Text14, ACTIVEGRAY, DGRAY, BORDERGRAY } from "../commons/UI";

export default ({ dates, pick, active, style }) => {
  const renderItem = ({ item: d, index: i }) => (
    <DateParent
      day={d}
      active={d == active}
      first={i == 0}
      last={i == dates.length - 1}
      onPress={() => pick(d)}
    />
  );
  return (
    <View style={{ height: 52, ...style }}>
      <FlatList
        data={dates}
        {...{ ...listProps, renderItem }}
        getItemLayout={datesLayout}
      />
    </View>
  );
};

let datesLayout = (_, i) => ({ length: 82, offset: 82 * i, index: i });
let listProps = {
  keyExtractor: dateKeys,
  initialNumToRender: 5,
  horizontal: true,
  showsHorizontalScrollIndicator: false,
  contentContainerStyle: { paddingHorizontal: 24 },
  style: { marginHorizontal: -24 },
};

export const DateParent = ({ onPress, first, last, active, ...pr }) => (
  <Press {...{ onPress }} style={{ alignItems: "center" }}>
    <DateView
      style={[
        { width: pr.width || 82 },
        first && { borderTopLeftRadius: 10, borderBottomLeftRadius: 10 },
        last && {
          borderTopRightRadius: 10,
          borderBottomRightRadius: 10,
        },
      ]}
    >
      <InnerView
        style={active && { borderRadius: 10, backgroundColor: ACTIVEGRAY }}
      >
        <DateText style={active && { color: "white" }}>
          {dayjs(pr.day).format("D.MM\nddd").toLowerCase()}
        </DateText>
      </InnerView>
    </DateView>
    {pr.children}
  </Press>
);

let dateKeys = (d) => d;

export const DateView = styled.View`
  justify-content: center;
  background: ${DGRAY};
  height: 52px;
`;

let InnerView = styled.View`
    height: 52px;
    justify-content: center;
  `,
  DateText = styled(Text14)`
    line-height: 16px;
    color: ${BORDERGRAY};
    text-align: center;
    margin-top: 1px;
  `;
