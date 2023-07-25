import React, { useCallback, useRef } from "react";
import { ScrollView } from "react-native";
// import Sheet from "react-modal-sheet";
import { BottomSheet } from "react-spring-bottom-sheet";
import "react-spring-bottom-sheet/dist/style.css";
import { isDesktop, wheight, wwidth } from "../commons/utils";
import { CloseIcon, Container, ModalBack, Press } from "../commons/UI";

export default ({ height = wheight * 0.9, snaps = [height], goBack, ...r }) => {
  if (isDesktop)
    return (
      <Container>
        <CloseIcon
          onPress={goBack}
          style={{ alignSelf: "flex-end", padding: 20, marginBottom: -8 }}
        />
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          style={{ width: wwidth }}
        >
          {r.children}
        </ScrollView>
      </Container>
    );

  const sheetRef = useRef(),
    dismissed = useRef(false);

  const onDismiss = useCallback(
    () => !dismissed.current && ((dismissed.current = true), goBack()),
    []
  );

  return (
    <ModalBack onPress={onDismiss}>
      <BottomSheet
        ref={sheetRef}
        open
        draggable
        expandOnContentDrag={snaps[1]}
        defaultSnap={() => snaps[0] || height}
        snapPoints={() => snaps || [height / 3, height]}
        {...{ onDismiss }}
        // skipInitialTransition
        // style={{ maxWidth: wwidth }}
      >
        {/* Press needs to handle taps on content, otherwise ModalBack & goBack() fires  */}
        <Press>{r.children}</Press>
      </BottomSheet>
    </ModalBack>
  );
};

/*  для  "react-modal-sheet"
  return (
    <Sheet
      isOpen
      onClose={goBack}
      snapPoints={r.snaps || [height, height * 0.6]}
      initialSnap={2}
      style={{   maxWidth: wwidth,
       }}
    >
      <Sheet.Container //</Sheet>style={{ maxWidth: wwidth }}
      >
        <Sheet.Content>
          {/* <Sheet.Scroller draggableAt="both">   
          {r.children}
          {/* </Sheet.Scroller> 
        </Sheet.Content>
      </Sheet.Container>
      <Sheet.Backdrop
        onTap={goBack}
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      />
    </Sheet>
  );
};
*/
