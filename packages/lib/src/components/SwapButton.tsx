import { Box, styled } from "@mui/system";
import React from "react";
import CustomButton from "../base-components/CustomButton";

function SwapButton() {
  return (
    <StyledButton>
      <CustomButton onClick={() => {}}>Place Order</CustomButton>
    </StyledButton>
  );
}

export default SwapButton;

const StyledButton = styled(Box)({
  height: 50,
  width: "100%",
});
