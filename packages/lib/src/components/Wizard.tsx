import { styled } from "@mui/material";
import React, { useCallback, useMemo } from "react";
import { useWizardStore, WizardAction, WizardActionStatus } from "../store";
import { StyledColumnFlex, StyledText } from "../styles";
import { Modal, Spinner } from "./base";

import { Md3DRotation } from "@react-icons/all-files/md/Md3DRotation";

export function Wizard() {
  const store = useWizardStore();
  const content = useContent();

  const onClose = useCallback(() => {
    store.setOpen(false);
  }, []);

  return (
    <Modal open={store.open} onClose={onClose}>
      <StyledContainer>{content}</StyledContainer>
    </Modal>
  );
}

const useContent = () => {
  const store = useWizardStore();
  return useMemo(() => {
    const baseProps = {
      status: store.status,
      error: store.error,
    };
    if (store.action === WizardAction.APPROVE) {
      return <Message {...baseProps} errorMsg="Approval failed" pendingMsg="Approving" successMsg="Approval successful" />;
    }

    if (store.action === WizardAction.CREATE_ORDER) {
      return <Message {...baseProps} errorMsg="Submit order failed" pendingMsg="Submitting order" successMsg="Order submitted successfully" />;
    }
    if (store.action === WizardAction.WRAP) {
      return <Message {...baseProps} errorMsg="Wrap failed" pendingMsg="Wrapping" successMsg="Wrap successful" />;
    }
    if (store.action === WizardAction.UNWRAP) {
      return <Message {...baseProps} errorMsg="Unwrap failed" pendingMsg="Unwrapping" successMsg="Unwrap successful" />;
    }
  }, [store.action, store.status]);
};

const Message = ({
  status,
  error,
  successMsg,
  errorMsg,
  pendingMsg,
}: {
  status?: WizardActionStatus;
  error?: string;
  successMsg: string;
  errorMsg: string;
  pendingMsg: string;
}) => {
  if (status === WizardActionStatus.PENDING) {
    return (
      <>
        <StyledSpinner />
        <StyledTitle>{pendingMsg}</StyledTitle>
      </>
    );
  }

  if (status === WizardActionStatus.SUCCESS) {
    return (
      <>
        <Md3DRotation className="twap-icon twap-success-icon" />
        <StyledTitle>{successMsg}</StyledTitle>
      </>
    );
  }

  if (status === WizardActionStatus.ERROR) {
    return (
      <>
        <Md3DRotation className="twap-icon twap-error-icon" />
        <StyledTitle>{errorMsg}</StyledTitle>
        <StyledMessage>{error}</StyledMessage>
      </>
    );
  }

  return null;
};

const StyledSpinner = styled(Spinner)({
  width: "45px!important",
  height: "45px!important",
});

const StyledTitle = styled(StyledText)({
  fontSize: 22,
  fontWeight: 500,
  textAlign: "center",
  width: "100%",
});

const StyledContainer = styled(StyledColumnFlex)({
  alignItems: "center",
  gap: 12,
  ".twap-icon": {
    width: 60,
    height: 60,
  },
  ".twap-error-icon": {
    "*": {
      color: "#FF3233!important",
    },
  },
  ".twap-success-icon": {
    "*": {
      color: "#28a745!important",
    },
  },
});

const StyledMessage = styled(StyledText)({
  fontSize: 16,
  textAlign: "center",
  width: "100%",
  marginTop: 10,
});
