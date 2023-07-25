import React from "react";
import styled from "styled-components/native";
import { wwidth } from "../commons/utils";
import {
  Text14,
  DGRAY,
  Medium18,
  Touch,
  ShowMore,
  BACKGRAY,
  Image,
} from "../commons/UI";
export const width = wwidth * 0.73 < 350 ? wwidth * 0.73 : 350,
  imgheight = (width - 10 * 2) * (9 / 16);

export default ({ id, name, desc, image: uri, navigate }) => {
  let onPress = () => navigate("AddInfo", { id });
  return (
    <Touch {...{ onPress }}>
      <Container>
        <Image
          source={{ uri }}
          style={{
            backgroundColor: "white",
            width: width - 8 * 2,
            height: imgheight,
            borderRadius: 14,
            overflow: "hidden",
          }}
        />
        <Body>
          <Medium18 style={{ color: DGRAY }} selectable>
            {name}
          </Medium18>
          {desc && (
            <>
              <Desc selectable numberOfLines={3}>
                {desc}
              </Desc>
              <ShowMore {...{ onPress }} />
            </>
          )}
        </Body>
      </Container>
    </Touch>
  );
};

let Container = styled.View`
    background: ${BACKGRAY};
    width: ${width}px;
    height: ${8 + 22 + imgheight + 125 + 8}px;
    border-radius: 18px;
    padding: 8px 8px 22px;
  `,
  Body = styled.View`
    flex: 1;
    height: 125px;
    padding: 16px 6px 0;
  `,
  Desc = styled(Text14)`
    color: ${DGRAY};
    flex: 1;
    margin: 8px 0;
  `;
