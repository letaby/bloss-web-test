import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import styled from "styled-components/native";
import { observer } from "mobx-react-lite";
import { useSchool } from "../commons/Stores.js";
import { ages, wheight } from "../commons/utils";
import {
  DGRAY,
  CheckboxIcon,
  RowCentered,
  Touch,
  Text21,
  PageTitle,
  Text18,
  Text24,
  Press,
  Medium18,
  LITEBORDER,
  BLUE,
  BACKBLUE,
  LINEBLUE,
  shadow4,
} from "../commons/UI";
import BottomSheet from "../comp/BottomSheet.js";

export default observer(
  ({ navigation: { navigate, goBack }, route: { params: p } }) => {
    const { coachID, from } = p || {},
      bothFilters = ["Home", "Coach"].includes(from);

    if (bothFilters) {
      const global = from == "Home",
        {
          programs,
          filter,
          setFilter,
          coaches: { [coachID]: coach },
        } = useSchool(),
        progs = coachID
          ? coach.programs.map((id) => programs[id])
          : Object.values(programs),
        [progID, setProgID] = useState(global ? filter["progID"] : p.progID),
        [age, setAge] = useState(global ? filter["age"] : p.age);

      const renderGroups = (items, ind) => {
        let isprogs = ind == 0;
        let renderItem = ({ id, name }) => {
          let picked = id == (isprogs ? progID : age),
            setState = isprogs ? setProgID : setAge,
            onPress = () =>
              global ? setState(!picked && id) : picked ? null : setState(id);
          return (
            <Filter
              {...{ isprogs, id, name, picked, onPress, navigate }}
              type={2}
              key={id}
            />
          );
        };
        return (
          <View key={String(ind)}>
            {isprogs && <Title2>Programs</Title2>}
            {!isprogs && <Title2 style={{ marginTop: 24 }}>Age</Title2>}
            {items.map(renderItem)}
          </View>
        );
      };

      const save = () => {
        let nochange = global
          ? progID == filter.progID && age == filter.age
          : progID == p.progID && age == p.age;
        return nochange
          ? goBack()
          : global
          ? (setFilter({ progID, age }), goBack())
          : navigate(from, { coachID, progID, age });
      };

      return (
        <BottomSheet snaps={[wheight * 0.94, wheight * 0.95]} {...{ goBack }}>
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              padding: 24,
              paddingBottom: 100,
            }}
            showsVerticalScrollIndicator={false}
          >
            {[progs, ages].map(renderGroups)}
          </ScrollView>
          <FloatButton onPress={save} style={shadow4}>
            <CheckboxIcon active size={32} />
          </FloatButton>
        </BottomSheet>
      );
    }

    if (!bothFilters) {
      const type = "progID",
        home = from == "Home",
        {
          coaches: { [coachID]: coach },
          programs,
          filter,
          setFilter,
        } = useSchool(),
        { [type]: value } = filter,
        current = home ? value : p[type],
        items = coachID
          ? coach.programs.map((id) => programs[id])
          : Object.values(programs);

      const renderItem = ({ id, name }) => {
        let picked = id == current;
        let onPress = () =>
          home
            ? (setFilter({ ...filter, [type]: !picked && id }), goBack())
            : picked
            ? goBack()
            : navigate(from, { coachID, filter: { [type]: id } });
        return (
          <Filter
            isprogs
            {...{ id, name, picked, onPress, navigate }}
            key={id}
          />
        );
      };

      return (
        <BottomSheet scroll {...{ goBack }}>
          <View style={{ paddingHorizontal: 24 }}>
            <PageTitle style={{ marginTop: 32, marginBottom: 24 }}>
              Programs
            </PageTitle>
            {items.map(renderItem)}
          </View>
        </BottomSheet>
      );
    }
  }
);

let Filter = ({ type, id, name, onPress, picked, isprogs, navigate }) => {
  let Row = type == 2 ? FilterRow2 : FilterRow,
    Text = type == 2 ? Text18 : Text21,
    hasMark = isprogs && !picked;
  return (
    <Touch {...{ onPress }}>
      <Row style={picked && { backgroundColor: BLUE }}>
        <RowCentered style={{ flex: 1, marginRight: hasMark ? 6 : 16 }}>
          <Text style={picked && { color: "white" }} numberOfLines={1}>
            {name}
          </Text>
          {hasMark && (
            <Press onPress={() => navigate("AddInfo", { id })}>
              <Quest style={type == 2 && { width: 28, height: 28 }} />
            </Press>
          )}
        </RowCentered>
        {picked && <CheckboxIcon active style={{ marginRight: -3 }} />}
      </Row>
    </Touch>
  );
};

let Title2 = styled(Text24)`
    color: ${DGRAY};
    margin: 2px 0 16px;
  `,
  FilterRow = styled(RowCentered)`
    height: 65px;
    background: ${BACKBLUE};
    border-radius: 10px;
    padding: 0 22px;
    margin-bottom: 14px;
  `,
  FilterRow2 = styled(FilterRow)`
    height: 44px;
    padding: 0 16px;
    margin-bottom: 12px;
  `,
  Quest = ({ style }) => (
    <View
      style={{
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: LITEBORDER,
        margin: 10,
        ...style,
      }}
    >
      <Medium18 style={{ color: LINEBLUE }}>?</Medium18>
    </View>
  );

let FloatButton = styled(Press)`
  position: absolute;
  bottom: 24px;
  right: 24px;
  justify-content: center;
  align-items: center;
  width: 60px;
  height: 60px;
  border-radius: 30px;
  background: ${BLUE};
`;
