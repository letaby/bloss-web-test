import React, { useState } from "react";
import styled from "styled-components/native";
import { observer } from "mobx-react-lite";
import { useSchool } from "../commons/Stores";
import {
  DGRAY,
  PageTitle,
  Text15,
  PageImage,
  Body,
  Touch,
} from "../commons/UI";
import { isDesktop, wheight, wwidth } from "../commons/utils";
import BottomSheet from "../comp/BottomSheet";

export default observer(
  ({ navigation: { navigate, push, goBack }, route: { params } }) => {
    const { id, coachID } = params || {},
      item = params && useSchool()[id ? "programs" : "coaches"][id || coachID],
      { bio, edu, image: uri, name, desc } = item;

    if (coachID)
      return (
        <BottomSheet scroll height={wheight * 0.6} {...{ goBack }}>
          <Body style={{ paddingTop: isDesktop ? 44 : 20 }}>
            {bio && <Desc selectable>{bio}</Desc>}
            {edu && <Desc selectable>Education: {edu}</Desc>}
          </Body>
        </BottomSheet>
      );

    return (
      <BottomSheet
        scroll
        snaps={[wheight * (uri ? 0.9 : 0.66), wheight * 0.94]}
        {...{ goBack }}
      >
        {uri && (
          <PageImage
            style={{ backgroundImage: `url(${uri})`, height: wwidth / 2 + 18 }}
            onClick={() => navigate("Image", { uri })}
          />
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
