import React, { ReactNode } from "react";
import MuiModal from "@mui/material/Modal";
import { Box, styled } from "@mui/system";
import { IconButton, Typography } from "@mui/material";
import { IoMdClose } from "react-icons/io";
import Backdrop from "@mui/material/Backdrop";

export interface Props {
  open: boolean;
  handleClose: () => void;
  children: ReactNode;
  title?: string;
  className?: string;
  disableBackdropClick?: boolean;
}

function Modal({ handleClose, open, children, title, className = "", disableBackdropClick }: Props) {
  return (
    <StyledModal open={open} onClose={handleClose} className={`${className} twap-modal`} hideBackdrop>
      <>
        <Backdrop open={open} onClick={disableBackdropClick ? () => {} : handleClose}></Backdrop>
        <StyledModalContent className="twap-modal-content">
          <StyledClose onClick={handleClose}>
            <IoMdClose />
          </StyledClose>
          {title && <StyledTitle>{title}</StyledTitle>}
          <StyledSeparator />
          {children}
        </StyledModalContent>
      </>
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
  right: 10,
  top: 10,
});

const StyledModal = styled(MuiModal)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const StyledModalContent = styled(Box)({
  maxWidth: 500,
  width: "100%",
  position: "relative",
});
