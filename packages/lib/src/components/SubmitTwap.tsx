import { Box, styled } from "@mui/system";
import React, { CSSProperties, ReactNode, useContext, useMemo, useState } from "react";
import { TwapContext } from "../context";
import { store, validation } from "../store/store";
import CircularProgress from "@mui/material/CircularProgress";
import { Fade } from "@mui/material";

function SubmitTwap({ onSubmit }: { onSubmit: () => void }) {
  const warning = validation.useSubmitButtonValidation();
  const { isApproved, approve, approveLoading } = store.useTokenApproval();
  const { isInvalidChain, changeNetwork, account } = store.useWeb3();
  const { wrap, shouldWrap, isLoading: wrapLoading } = store.useWrapToken();
  const { connect } = useContext(TwapContext);

  const button = useMemo(() => {
    if (!account) {
      return <ActionButton onClick={connect}>Connect Wallet</ActionButton>;
    }

    if (isInvalidChain) {
      return <ActionButton onClick={changeNetwork}>Switch network</ActionButton>;
    }

    if (warning) {
      return (
        <ActionButton disabled={true} onClick={() => {}}>
          {warning}
        </ActionButton>
      );
    }

    if (shouldWrap) {
      return (
        <ActionButton loading={wrapLoading} onClick={wrap}>
          Wrap
        </ActionButton>
      );
    }

    if (!isApproved) {
      return (
        <ActionButton loading={approveLoading} onClick={approve} disabled={!!warning}>
          Approve
        </ActionButton>
      );
    }

    return <ActionButton onClick={onSubmit}>Submit</ActionButton>;
  }, [isApproved, shouldWrap, warning, isInvalidChain, account, onSubmit, approveLoading]);

  return button;
}

export default SubmitTwap;

function ActionButton({
  children,
  style = {},
  disabled = false,
  onClick,
  loading = false,
}: {
  children: ReactNode;
  style?: CSSProperties;
  disabled?: boolean;
  onClick: () => void;
  loading?: boolean;
}) {
  return (
    <StyledContainer onClick={onClick} className="twap-submit-button" style={style} disabled={disabled || loading}>
      {loading && (
        <StyledLoader>
          <CircularProgress style={{ zoom: 0.8 }} />
        </StyledLoader>
      )}
      <Fade in={!loading}>
        <StyledChildren>{children}</StyledChildren>
      </Fade>
    </StyledContainer>
  );
}

const StyledLoader = styled(Box)({
  left: "50%",
  top: "55%",
  transform: "translate(-50%, -50%)",
  position: "absolute",
});

const StyledContainer = styled("button")(({ disabled }: { disabled: boolean }) => ({
  position: "relative",
  height: "100%",
  width: "100%",
  border: "unset",
  background: disabled ? "transparent" : "linear-gradient(114.98deg, #5D81ED 1.42%, #DB95FF 54.67%, #FF8497 105.73%)",
  boxShadow: "0px 26px 60px rgba(141, 155, 170, 0.05)",
  borderRadius: 10,
  color: disabled ? "#ADB4C0" : "white",
  fontWeight: 600,
  cursor: disabled ? "unset" : "pointer",
  fontSize: 16,
  opacity: disabled ? 0.6 : 1,
  transition: "0.2s all",
}));

const StyledChildren = styled(Box)({});
