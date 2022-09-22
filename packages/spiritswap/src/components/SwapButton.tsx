import { Box, styled } from "@mui/system";
import React from "react";
import CustomButton from "../base-components/CustomButton";
import { useSubmitButtonValidation } from "../store/store";

function SwapButton() {
  const warning = useSubmitButtonValidation();

  return (
    <StyledButton>
      <CustomButton disabled={!!warning} onClick={() => {}}>
        {warning || "Place order"}
      </CustomButton>
    </StyledButton>
  );
}

export default SwapButton;

const StyledButton = styled(Box)({
  height: 50,
  width: "100%",
});
