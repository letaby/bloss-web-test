import React, { useCallback, useRef } from "react";
// import Sheet from "react-modal-sheet";
import { BottomSheet } from "react-spring-bottom-sheet";
import "react-spring-bottom-sheet/dist/style.css";
import { wheight, wwidth } from "../commons/utils";
import { ModalBack, Press } from "../commons/UI";

export default ({ height = wheight * 0.9, snaps = [height], goBack, ...r }) => {
  const sheetRef = useRef(),
    dismissed = useRef(false);

  let onDismiss = useCallback(
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
        // skipInitialTransition
        // initialFocusRef
        {...{ onDismiss }}
        // style={{ maxWidth: wwidth }}
      >
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
