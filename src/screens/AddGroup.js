import React, { useState } from "react";
import styled from "styled-components/native";
import { observer } from "mobx-react-lite";
import useStore from "../commons/Stores";
import { Button, QuantButton } from "../commons/UI";
import BottomSheet from "../comp/BottomSheet";
import { modalWidth } from "../commons/utils";

export default observer(
  ({
    navigation: { goBack, replace },
    route: {
      params: { id },
    },
  }) => {
    const {
        school: {
          groups: {
            [id]: { price, coachID },
          },
        },
        cart: { add: addCart },
      } = useStore(),
      [quant, setQuant] = useState(1),
      sum = price * quant;

    const save = async () => {
      await addCart({ coachID, id, client: { quant, sum } });
      replace("Cart", { coachID });
    };

    return (
      <BottomSheet height={28 + 50 + 22 + 65 + 36} {...{ goBack }}>
        <Body>
          <QuantButton
            text={"Persons: " + quant}
            plus={() => setQuant((pr) => pr + 1)}
            minus={quant > 1 ? () => setQuant((pr) => pr - 1) : null}
          />
          <Button
            big
            text={"Add to cart, $" + sum}
            onPress={save}
            style={{ marginTop: 22 }}
          />
        </Body>
      </BottomSheet>
    );
  }
);

let Body = styled.View`
  flex: 1;
  justify-content: center;
  padding: 28px 24px 24px;
`;
