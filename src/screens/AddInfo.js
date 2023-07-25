import React from "react";
import { View } from "react-native";
import styled from "styled-components/native";
import { observer } from "mobx-react-lite";
import { useSchool } from "../commons/Stores";
import {
  DGRAY,
  PageTitle,
  Text15,
  PageImage,
  Body,
  Press,
} from "../commons/UI";
import { wheight, wwidth } from "../commons/utils";
import BottomSheet from "../comp/BottomSheet";

export default observer(
  ({ navigation: { navigate, push, goBack }, route: { params } }) => {
    const { id, coachID } = params || {},
      item = params && useSchool()[id ? "programs" : "coaches"][id || coachID],
      { bio, edu, image: uri, name, desc } = item || {};

    if (coachID)
      return (
        <BottomSheet snaps={[wheight * 0.6, wheight * 0.9]} {...{ goBack }}>
          <Body style={{ paddingTop: 16 }}>
            {bio && <Desc selectable>{bio}</Desc>}
            {edu && <Desc selectable>Education: {edu}</Desc>}
          </Body>
        </BottomSheet>
      );
    if (id)
      return (
        <BottomSheet
          snaps={[wheight * (uri ? 0.9 : 0.66), wheight * 0.94]}
          {...{ goBack }}
        >
          {uri && (
            <Press onPress={() => navigate("Image", { uri })}>
              <PageImage source={{ uri }} style={{ height: wwidth / 2 + 18 }} />
            </Press>
          )}
          <Body>
            <PageTitle selectable>{name}</PageTitle>
            {desc && <Desc selectable>{desc}</Desc>}
          </Body>
        </BottomSheet>
      );
  }
);

export const Desc = styled(Text15)`
  line-height: 22px;
  color: ${DGRAY};
  margin-top: 12px;
`;
