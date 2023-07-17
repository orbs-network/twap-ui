import React from "react";
import { styled, Typography, CircularProgress } from "@mui/material";
import Modal from "./Modal";
import { StyledColumnFlex, StyledText } from "../../styles";

function PendingTxModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <StyledModal disableBackdropClick={true} open={open} onClose={onClose}>
      <StyledContainer>
        <StyledLoader style={{ width: 70, height: 70 }} className="twap-loading-modal-loader" />
        <StyledColumnFlex gap={5} style={{ alignItems: "center" }}>
          <Typography>Waiting for your transaction</Typography>
          <Typography>to be confirmed on the blockchain</Typography>
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

const StyledLoader = styled(CircularProgress)({});

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
    padding: 30,
    ".twap-ui-close": {
      display: "none",
    },
  },
});

export default PendingTxModal;
