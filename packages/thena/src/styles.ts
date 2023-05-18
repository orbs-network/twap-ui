import { styled } from "@mui/material";
import { Components } from "@orbs-network/twap-ui";

export const StyledPanelInput = styled(Components.TokenInput)({
  background: "rgb(9 3 51/1)",
});

export const StyledSubmit = styled(Components.SubmitButton)({
  background: "linear-gradient(to right, rgb(216, 0, 183), rgb(177, 0, 222), rgb(177, 0, 222), rgb(216, 0, 183))",
  height: 57,
  fontSize: 18,
  textTransform: "uppercase",
});

export const configureStyles = (isDarkMode?: boolean) => {
  return {
    ".twap-orders-header": {
      padding: "0px!important",
    },
    ".twap-orders": {
      maxWidth: "unset!important",
    },
  };
};
