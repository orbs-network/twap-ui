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
}

function Modal({ handleClose, open, children, title, className = "" }: Props) {
  return (
    <StyledModal open={open} onClose={handleClose} className={`${className} twap-modal`} hideBackdrop>
      <>
        <Backdrop open={open} onClick={handleClose}></Backdrop>
        <StyledModalContent className="twap-modal-content">
          <StyledClose onClick={handleClose}>
            <IoMdClose />
          </StyledClose>
          {title && <StyledTitle>{title}</StyledTitle>}
          {children}
        </StyledModalContent>
      </>
    </StyledModal>
  );
}

export default Modal;

const StyledTitle = styled(Typography)({});

const StyledClose = styled(IconButton)({});

const StyledModal = styled(MuiModal)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 20,
});

const StyledModalContent = styled(Box)({
  maxWidth: 500,
  width: "100%",
  position: "relative",
  padding: 30,
});
