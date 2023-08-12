import React, { useCallback, useRef } from "react";
import { ScrollView, View } from "react-native";
// import Sheet from "react-modal-sheet";
import { BottomSheet } from "react-spring-bottom-sheet";
import "react-spring-bottom-sheet/dist/style.css";
import { isDesktop, wheight } from "../commons/utils";
import { Container } from "../commons/UI";

export default ({ height = wheight * 0.9, snaps = [height], goBack, ...r }) => {
  if (isDesktop) {
    if (r.scroll)
      return (
        <Container>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} {...r} />
        </Container>
      );
    return <Container {...r} />;
  }

  const dismissed = useRef(false);

  const onDismiss = useCallback(
    () => !dismissed.current && ((dismissed.current = true), goBack()),
    []
  );

  return (
    <BottomSheet
      open
      draggable
      expandOnContentDrag //={!!snaps[1]}
      skipInitialTransition={!snaps[1]}
      defaultSnap={() => snaps[0] || height}
      snapPoints={() => snaps || [height / 3, height]}
      {...{ onDismiss }}
    >
      <div
        style={{
          flex: 1,
          borderTopLeftRadius: 18,
          borderTopRightRadius: 18,
          overflow: "hidden",
        }}
      >
        {r.children}
      </div>
    </BottomSheet>
  );
};

/*  для  "react-modal-sheet"
  return (
    <Sheet
      isOpen
      onClose={goBack}
      snapPoints={r.snaps || [height, height * 0.6]}
      initialSnap={2}
      
    >
      <Sheet.Container //</Sheet> 
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
