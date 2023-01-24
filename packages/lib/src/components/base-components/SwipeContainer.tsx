import { Slide } from "@mui/material";
import { Box, styled } from "@mui/system";
import { ReactNode } from "react";
import Icon from "./Icon";
import { GrClose } from "react-icons/gr";

const SwipeContainer = ({ show, children, close }: { show: boolean; children: ReactNode; close: () => void }) => {
  return (
    <Slide direction="left" in={show} className="twap-swipe-container">
      <StyledSwipeContainer>
        <button onClick={close} className="twap-close">
          <Icon icon={<GrClose style={{ width: 20, height: 20 }} />} />
        </button>
        <StyledSwipeContainerChildren>{children}</StyledSwipeContainerChildren>
      </StyledSwipeContainer>
    </Slide>
  );
};

export default SwipeContainer;

export const StyledSwipeContainerChildren = styled(Box)({
  width: "100%",
  height: "100%",
  overflow: "auto",
});

export const StyledSwipeContainer = styled(Box)({
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  padding: "40px 10px 10px 10px",
  ".twap-close": {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    border: "unset",
    background: "unset",
    top: 10,
    right: 10,
    position: "absolute",
    cursor: "pointer",
  },
});
