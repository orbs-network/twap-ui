import React, { ReactNode } from "react";
import { Fade, IconButton, Box, styled, Modal as MuiModal, Backdrop } from "@mui/material";
import { IoMdClose } from "@react-icons/all-files/io/IoMdClose";
import { StyledRowFlex } from "../../styles";
import { useTwapContext } from "../../context";

export interface Props {
  open: boolean;
  onClose?: () => void;
  children: ReactNode;
  title?: string;
  className?: string;
  disableBackdropClick?: boolean;
  header?: ReactNode;
  hideHeader?: boolean;
}

function Modal({ onClose, open, children, title, className = "", disableBackdropClick = false, header, hideHeader }: Props) {
  const modalStyles = useTwapContext().uiPreferences.modal?.styles || {};
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
      style={{ zIndex: 999, ...modalStyles }}
    >
      <Fade in={open}>
        <StyledModalContent className="twap-modal-content" id="twap-modal-content">
          {!header && !hideHeader ? (
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
  marginBottom: 10,
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
