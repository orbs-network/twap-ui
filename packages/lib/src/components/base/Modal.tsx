import React, { ReactNode } from "react";
import { Fade, IconButton, Box, styled, Modal as MuiModal, Backdrop } from "@mui/material";
import { IoMdClose } from "@react-icons/all-files/io/IoMdClose";
import { StyledRowFlex } from "../../styles";

export interface Props {
  open: boolean;
  onClose?: () => void;
  children: ReactNode;
  title?: string;
  className?: string;
  disableBackdropClick?: boolean;
  header?: ReactNode;
}

function Modal({ onClose, open, children, title, className = "", disableBackdropClick = false, header }: Props) {
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
      style={{ zIndex: 1 }}
    >
      <Fade in={open}>
        <StyledModalContent className="twap-modal-content" id="twap-modal-content">
          {!header ? (
            <StyledHeader className="twap-modal-content-header">
              {title && (
                <>
                  <StyledTitle className="twap-modal-content-title">{title}</StyledTitle>
                  <StyledSeparator />
                </>
              )}
              {onClose && (
                <StyledClose className="twap-ui-close" onClick={onClose}>
                  <IoMdClose />
                </StyledClose>
              )}
            </StyledHeader>
          ) : (
            header
          )}

          {children}
        </StyledModalContent>
      </Fade>
    </StyledModal>
  );
}

export default Modal;

const StyledHeader = styled(StyledRowFlex)({
  justifyContent: "space-between",
});

const StyledSeparator = styled(Box)({
  height: 20,
});

const StyledTitle = styled(Box)({
  textAlign: "center",
  fontWeight: 500,
  fontSize: 17,
});

const StyledClose = styled(IconButton)({
  marginLeft: "auto",
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
