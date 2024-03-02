import React from "react";
import { styled, Typography } from "@mui/material";
import Modal from "./Modal";
import { StyledColumnFlex, StyledText } from "../../styles";

import { BsCheckCircle } from "@react-icons/all-files/bs/BsCheckCircle";

function SuccessTxModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <StyledModal disableBackdropClick={true} open={open} onClose={onClose}>
      <StyledContainer>
        <BsCheckCircle className="twap-success-modal-icon" />
        <StyledColumnFlex gap={5} style={{ alignItems: "center" }}>
          <Typography>Transaction #0842</Typography>
          <Typography>created successfully</Typography>
        </StyledColumnFlex>
        <StyledClose onClick={onClose}>
          <StyledText>Close</StyledText>
        </StyledClose>
      </StyledContainer>
    </StyledModal>
  );
}

const StyledContainer = styled(StyledColumnFlex)({
  alignItems: "center",
  gap: 20,
});

const StyledClose = styled("button")({
  background: "unset",
  border: "unset",
  fontSize: 14,
  color: "inherit",
  cursor: "pointer",
});
const StyledModal = styled(Modal)({
  ".twap-modal-content": {
    width: "auto",
    padding: "0px 30px 30px 30px",
    ".twap-ui-close": {
      display: "none",
    },
  },
  ".twap-success-modal-icon": {
    width: 40,
    height: 40,
  },
});

export default SuccessTxModal;
