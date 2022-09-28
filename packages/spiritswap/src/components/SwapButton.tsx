import { Box, styled } from "@mui/system";
import React from "react";
import TWAPLib from "@orbs-network/twap-ui";

function SwapButton() {
  const warning = TWAPLib.validation().useSubmitButtonValidation();

  return (
    <StyledButton>
      <TWAPLib.components.CustomButton disabled={!!warning} onClick={() => {}}>
        {warning || "Place order"}
      </TWAPLib.components.CustomButton>
    </StyledButton>
  );
}

export default SwapButton;

const StyledButton = styled(Box)({
  height: 50,
  width: "100%",
});
