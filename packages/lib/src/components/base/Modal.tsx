import React, { ReactNode } from "react";
import MuiModal from "@mui/material/Modal";
import { Box, styled } from "@mui/system";
import { Fade, IconButton } from "@mui/material";
import { IoMdClose } from "react-icons/io";
import Backdrop from "@mui/material/Backdrop";

export interface Props {
  open: boolean;
  onClose?: () => void;
  children: ReactNode;
  title?: string;
  className?: string;
  disableBackdropClick?: boolean;
}

function Modal({ onClose, open, children, title, className = "", disableBackdropClick = false }: Props) {
  return (
    <StyledModal
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          timeout: 500,
        },
      }}
      aria-labelledby="transition-modal-title"
      aria-describedby="transition-modal-description"
      open={open}
      onClose={!disableBackdropClick ? onClose : () => {}}
      className={`${className} twap-modal`}
      closeAfterTransition={true}
    >
      <Fade in={open}>
        <StyledModalContent className="twap-modal-content" id="twap-modal-content">
          {onClose && (
            <StyledClose className="twap-ui-close" onClick={onClose}>
              <IoMdClose />
            </StyledClose>
          )}
          {title && (
            <>
              <StyledTitle>{title}</StyledTitle>
              <StyledSeparator />
            </>
          )}

          {children}
        </StyledModalContent>
      </Fade>
    </StyledModal>
  );
}

export default Modal;

const StyledSeparator = styled(Box)({
  height: 20,
});

const StyledTitle = styled(Box)({
  textAlign: "center",
  fontWeight: 500,
  fontSize: 17,
});

const StyledClose = styled(IconButton)({
  position: "absolute",
  right: 7,
  top: 7,
  svg: {
    width: 25,
    height: 25,
  },
});

const StyledModal = styled(MuiModal)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const StyledModalContent = styled(Box)({
  maxWidth: 500,
  width: "calc(100% - 30px)",
  position: "relative",
  maxHeight: "95vh",
});
