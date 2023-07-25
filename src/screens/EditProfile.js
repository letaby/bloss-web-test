import React, { useCallback, useLayoutEffect, useRef, useState } from "react";
import { Keyboard, ScrollView, View } from "react-native";
import styled from "styled-components/native";
import { observer } from "mobx-react-lite";
import PhoneInput from "react-phone-number-input/input";
import { useAuth } from "../commons/Stores";
import {
  ages,
  paddBottom,
  paddTop,
  showToast,
  wwidth,
  colors,
} from "../commons/utils";
import {
  Button,
  AbsLoader,
  InputComp,
  Caption,
  QuantButton,
  Body,
  UserPic,
  BlankUserChar,
  Container,
  Press,
  Row,
  shadow4,
  Medium18,
} from "../commons/UI";

let toast = (tx) => showToast(tx, 0, 120);

export default observer(({ navigation: nav, route: { params: p } }) => {
  const { profile: prf, updateFields, addDBUser } = useAuth();

  if (!prf) return nav.replace("Login");

  const {
      name: name0,
      photo: photo0,
      bio: bio0,
      age: age0,
      phone: phone0,
      exp: exp0,
    } = prf,
    [color] = useState(prf.color || colors[Math.round(Math.random() * 27)]),
    [name, setName] = useState(name0 || ""),
    [photo, setPhoto] = useState(photo0 || ""),
    [bio, setBio] = useState(bio0 || ""),
    [phone, setPhone] = useState(phone0 || ""),
    [age, setAge] = useState(age0 || 14),
    ageIndex = ages.findIndex((a) => age <= a.id),
    [load, setLoad] = useState(),
    [nameref, bioref, telref] = [useRef(), useRef(), useRef()],
    [trname, trphoto, trbio, trphone] = trm([
      name,
      photo,
      bio,
      String(phone || ""),
    ]);

  useLayoutEffect(() => {
    if (age0) nav.setOptions({ headerStyle: { backgroundColor: color } });
  }, []);

  const noChange =
    trname == name0 &&
    (trphoto == photo0 || (!trphoto && !photo0)) &&
    (trbio == bio0 || (!trbio && !bio0)) &&
    age == age0 &&
    (trphone == phone0 || (!trphone[1] && !phone0));

  const save = async () => {
    Keyboard.dismiss();
    if (load || noChange) return;
    if (!trname[1]) return toast("Too short name");
    if (!trbio[1]) return toast("Please, fill in your experience");
    if (trphoto[0] && !trphoto[7]) return toast("Incorrect photo");
    if (trphone[0] && !trphone[7]) return toast("Incorrect phone");
    setLoad(true);
    let obj = {
      name: trname,
      age,
      color,
      photo: trphoto || null,
      bio: trbio || null,
      phone: trphone[7] ? trphone : null,
    };
    if (!age0) return addDBUser({ ...prf, ...obj });
    await updateFields(obj, nav.goBack);
  };

  return (
    <Container>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1, paddingTop: age0 ? 0 : paddTop }}
        style={{ backgroundColor: color }}
      >
        <BackColor style={{ backgroundColor: color }}>
          {!trphoto[11] && (
            <Row style={{ alignItems: "flex-end", marginRight: -28 }}>
              <BlankUserChar style={{ fontSize: 0.27 * wwidth }}>
                {name[0] || ""}
              </BlankUserChar>
            </Row>
          )}
        </BackColor>
        {trphoto[11] && (
          <ImageBack style={!age0 && { marginTop: paddTop }}>
            <ImageBack2 style={{ backgroundColor: color, opacity: 0.4 }} />
            <UserPic
              {...{ color }}
              photo={trphoto}
              size={imgwidth}
              style={{ margin: 3 }}
            >
              <View style={{ flex: 1 }} />
              <Row style={{ justifyContent: "flex-end" }}>
                <Press onPress={() => setPhoto("")}>
                  <RemoveText style={shadow4}>remove</RemoveText>
                </Press>
              </Row>
            </UserPic>
          </ImageBack>
        )}
        <Body
          style={{
            flex: 1,
            paddingTop: 8,
            paddingBottom: age0 ? 28 : 24 + paddBottom,
          }}
        >
          <View style={{ flex: 1 }}>
            <InputComp
              reff={nameref}
              caption="name"
              defaultValue={name}
              onChangeText={setName}
              onSubmitEditing={() => bio.current.focus()}
              blurOnSubmit={false}
              returnKeyType="next"
              autoFocus={!age0}
            />
            <InputComp
              reff={bioref}
              caption="Experience, goals"
              defaultValue={bio}
              onChangeText={setBio}
              onSubmitEditing={() => telref.current.focus()}
              blurOnSubmit={false}
              returnKeyType="next"
            />
            <PhoneInput
              ref={telref}
              caption="Contact phone, WhatsApp if possible"
              smartCaret={false}
              inputComponent={PhoneTextInput}
              value={phone}
              onChange={setPhone}
              onSubmitEditing={save}
              maxLength={17}
              keyboardType="phone-pad"
              returnKeyType="next"
              autoFocus={!!p?.phone}
            />
            <Caption>Student's age</Caption>
            <QuantButton
              text={ages[ageIndex].name}
              plus={age < 36 ? () => setAge(ages[ageIndex + 1].id) : null}
              minus={age > 5 ? () => setAge(ages[ageIndex - 1].id) : null}
              style={{ marginTop: 12 }}
            />
          </View>

          <Button
            big
            onPress={save}
            text="Save"
            style={[
              noChange && { backgroundColor: "#f4f4f4" },
              { marginTop: 48 },
            ]}
          />
        </Body>
      </ScrollView>
      {load && <AbsLoader />}
    </Container>
  );
});

let trm = (arr) => arr.map((t) => t.trim()),
  imgwidth = wwidth - 2 * 24 - 2 * 3;

let BackColor = styled.View({
    width: wwidth,
    height: imgwidth + 40,
    marginBottom: -24,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 24,
  }),
  ImageBack = styled.View({
    position: "absolute",
    top: 24,
    left: 24,
    width: imgwidth + 6,
    height: imgwidth + 6,
    backgroundColor: "#fff",
    borderRadius: 17,
    zIndex: 1,
    overflow: "hidden",
  }),
  ImageBack2 = styled.View({
    position: "absolute",
    width: imgwidth + 6,
    height: imgwidth + 6,
  }),
  RemoveText = styled(Medium18)`
    color: white;
    text-align: right;
    padding: 12px 16px;
  `;

function PhoneTextInput({ onChange, ...rest }, ref) {
  const onChangeText = useCallback(
    (value) => {
      onChange({
        preventDefault() {
          this.defaultPrevented = true;
        },
        target: { value },
      });
    },
    [onChange]
  );
  return <InputComp reff={ref} {...{ onChangeText, ...rest }} />;
}
PhoneTextInput = React.forwardRef(PhoneTextInput);
