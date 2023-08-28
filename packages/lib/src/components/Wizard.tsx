import { styled } from "@mui/material";
import React, { useCallback, useMemo } from "react";
import { BsFillCheckCircleFill } from "react-icons/bs";
import { useWizardStore, WizardAction, WizardActionStatus } from "../store";
import { StyledColumnFlex, StyledText } from "../styles";
import { Modal, Spinner } from "./base";
import { BiSolidErrorCircle } from "react-icons/bi";
export function Wizard() {
  const store = useWizardStore();
  const content = useContent();

  const onClose = useCallback(() => {
    store.setOpen(false);
  }, []);

  return (
    <StyledModal open={store.open} onClose={onClose}>
      <StyledContainer>{content}</StyledContainer>
    </StyledModal>
  );
}

const useContent = () => {
  const store = useWizardStore();
  return useMemo(() => {
    if (store.action === WizardAction.APPROVE) {
      return <Approval status={store.status} error={store.error} />;
    }

    if (store.action === WizardAction.CREATE_ORDER) {
      return <CreateOrder status={store.status} error={store.error} />;
    }
    if (store.action === WizardAction.WRAP) {
      return <Wrap status={store.status} error={store.error} />;
    }
  }, [store.action, store.status]);
};

const Wrap = ({ status, error }: { status?: WizardActionStatus; error?: string }) => {
  if (status === WizardActionStatus.PENDING) {
    return (
      <>
        <StyledSpinner />
        <StyledTitle>Wrapping</StyledTitle>
      </>
    );
  }

  if (status === WizardActionStatus.SUCCESS) {
    return (
      <>
        <StyledSuccessIcon className="twap-icon" />
        <StyledTitle>Wrap successful</StyledTitle>
      </>
    );
  }

  if (status === WizardActionStatus.ERROR) {
    return (
      <>
        <StyledErrorIcon className="twap-icon" />
        <StyledTitle>Wrap failed</StyledTitle>
        <StyledMessage>{error}</StyledMessage>
      </>
    );
  }

  return null;
};

const Approval = ({ status, error }: { status?: WizardActionStatus; error?: string }) => {
  if (status === WizardActionStatus.PENDING) {
    return (
      <>
        <StyledSpinner />
        <StyledTitle>Approving</StyledTitle>
      </>
    );
  }

  if (status === WizardActionStatus.SUCCESS) {
    return (
      <>
        <StyledSuccessIcon className="twap-icon" />
        <StyledTitle>Approval successful</StyledTitle>
      </>
    );
  }

  if (status === WizardActionStatus.ERROR) {
    return (
      <>
        <StyledErrorIcon className="twap-icon" />
        <StyledTitle>Approval failed</StyledTitle>
        <StyledMessage>{error}</StyledMessage>
      </>
    );
  }

  return null;
};

const CreateOrder = ({ status, error }: { status?: WizardActionStatus; error?: string }) => {
  if (status === WizardActionStatus.PENDING) {
    return (
      <>
        <StyledSpinner />
        <StyledTitle>Submitting order</StyledTitle>
      </>
    );
  }

  if (status === WizardActionStatus.SUCCESS) {
    return (
      <>
        <StyledSuccessIcon className="twap-icon" />
        <StyledTitle>Order submitted successfully</StyledTitle>
      </>
    );
  }

  if (status === WizardActionStatus.ERROR) {
    return (
      <>
        <StyledErrorIcon className="twap-icon" />
        <StyledTitle>Submit order failed</StyledTitle>
        <StyledMessage>{error}</StyledMessage>
      </>
    );
  }

  return null;
};

const StyledSpinner = styled(Spinner)({
  width: "50px!important",
  height: "50px!important",
});

const StyledSuccessIcon = styled(BsFillCheckCircleFill)({
  "*": {
    color: "#28a745!important",
  },
});

const StyledErrorIcon = styled(BiSolidErrorCircle)({
  "*": {
    color: "#FF3233!important",
  },
});

const StyledTitle = styled(StyledText)({
  fontSize: 23,
  fontWeight: 600,
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
});

const StyledMessage = styled(StyledText)({
  fontSize: 16,
  textAlign: "center",
  width: "100%",
  marginTop: 10,
});

const StyledModal = styled(Modal)({});
