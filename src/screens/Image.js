import React, { useEffect, useRef } from "react";
import { StatusBar, ActivityIndicator } from "react-native";
import styled from "styled-components/native";
import ImageViewer from "react-native-image-zoom-viewer";
import { paddBottom } from "../commons/utils";
import { ModalBack, Text16 } from "../commons/UI";

export default ({ route: { params: p }, navigation: { goBack } }) => {
  const mount = useRef(true);
  useEffect(() => () => (mount.current = false), []);
  return (
    <ModalBack onPress={goBack} style={{ backgroundColor: "rgba(0,0,0,0.7)" }}>
      <ImageViewer
        backgroundColor="rgba(0,0,0,0)"
        imageUrls={[{ url: p.uri }]}
        enableSwipeDown
        swipeDownThreshold={100}
        renderIndicator={() => null}
        loadingRender={() => <ActivityIndicator size="large" color="white" />}
        renderFooter={() => <Text>Press or swipe down to close</Text>}
        footerContainerStyle={{ width: "100%" }}
        onCancel={goBack}
      />
    </ModalBack>
  );
};

const Text = styled(Text16)`
  text-align: center;
  color: white;
  padding: 18px 0 ${18 + paddBottom}px;
`;
