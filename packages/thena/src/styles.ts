import { Box, styled } from "@mui/material";
import { Styles } from "@orbs-network/twap-ui";
import { Components } from "@orbs-network/twap-ui";

export const StyledPanelInput = styled(Components.TokenInput)({
  input: {
    fontSize: 20,
    height: 40,
  },
});

export const StyledCard = styled(Box)({
  width: "100%",
  padding: 1,
  borderRadius: 3,
  background: "transparent linear-gradient(128deg,#ed00c9,#bd00ed) 0 0 no-repeat padding-box",
  ".twap-card-children": {
    minHeight: 50,
    borderRadius: 3,
    padding: 10,
    background: "rgb(9 3 51/1)",
    display: "flex",
    alighItems: "center",
  },
});

export const StyledTokenPanelTop = styled(Styles.StyledRowFlex)({});
export const StyledBalance = styled(Components.TokenBalance)({
  "*": {
    fontWeight: 600,
    fontSize: 15,
  },
});

export const StyledPercentSelector = styled(Styles.StyledRowFlex)({
  width: "fit-content",
  gap: 8,
  button: {
    background: "rgb(255 255 255/0.08)",
    border: "unset",
    height: 28,
    padding: "0px 10px",
    fontSize: 14,
    fontWeight: 600,
  },
});

export const StyledTokenChange = styled(Components.ChangeTokensOrder)({
  button: {
    background: "rgb(255 255 255/0.08)",
    borderRadius: "unset",
    width: 45,
    height: 45,
  },
});

export const StyledContainer = styled(Styles.StyledColumnFlex)({
  gap: 15,
});

export const StyledColumnFlex = styled(Styles.StyledColumnFlex)({
  gap: 20,
});

export const StyledSubmit = styled(Components.SubmitButton)({
  borderRadius: 3,
  background: "linear-gradient(to right, rgb(216, 0, 183), rgb(177, 0, 222), rgb(177, 0, 222), rgb(216, 0, 183))",
  height: 57,
  fontWeight: 700,
  fontSize: 18,
  textTransform: "uppercase",
  "*": {
    fontWeight: "inherit",
    fontSize: "inherit",
  },
});

export const StyledPoweredBy = styled(Components.PoweredBy)({
  marginTop: 20,
});

export const StyledTokenSelect = styled(Components.TokenSelect)({
  gap: 15,
  ".twap-token-logo": {
    width: 28,
    height: 28,
  },
  ".twap-token-name": {
    fontSize: 14,
    fontWeight: 600,
  },
  p: {
    fontSize: 14,
    fontWeight: 600,
  },
  ".twap-token-display": {
    gap: 5,
  },
});

const gradient = "linear-gradient(to right, rgb(216, 0, 183), rgb(177, 0, 222), rgb(177, 0, 222), rgb(216, 0, 183))";

export const configureStyles = (isDarkMode?: boolean) => {
  return {
    ".twap-time-selector": {
      ".twap-input": {
        input: {
          height: 30,
        },
      },
      ".twap-loader": {
        right: 0,
      },
    },
    ".twap-loader": {
      background: "rgba(255,255,255,0.1)!important",
    },
    ".twap-trade-size": {
      ".twap-token-logo": {
        width: 24,
        height: 24,
      },
      ".twap-token-name": {
        fontSize: 14,
        fontWeight: 600,
      },
    },
    ".MuiSwitch-thumb ": {
      background: gradient,
    },
    ".MuiSwitch-track": {
      backgroundColor: "white!important",
    },
    ".twap-label": {
      p: {
        fontSize: 16,
        fontWeight: 500,
      },
    },
    ".twap-time-selector-list": {
      background: "rgb(16 22 69/1)",
      border: "1px solid rgb(0 0 175/1)",
    },
    ".twap-time-selector-list-item": {
      "&:hover": {
        background: "rgba(255,255,255,0.03)",
      },
    },
    ".twap-usd": {
      p: {
        fontSize: 14,
        fontWeight: 600,
      },
    },
    ".twap-token-panel-title": {
      "*": {
        color: "rgb(184 182 203/1)",
        fontSize: "16!important",
        fontWeight: "500!important",
      },
    },
    ".twap-tooltip": {
      "& .MuiTooltip-tooltip": {
        backgroundColor: "rgb(16 22 69/1)",
        borderRadius: "4px",
        color: "white",
        fontSize: 14,
        lineHeight: 1.5,
        padding: 10,
        border: "1px solid rgb(0 0 175/1)",
        fontFamily: "Figtree",
        "& *": {
          color: "white",
          fontSize: 14,
        },
      },
      "& .MuiTooltip-arrow": {
        display: "none",
      },
    },
    ".twap-adapter-wrapper": {
      "*": {
        fontFamily: "inherit",
      },
    },

    ".twap-orders-header": {
      padding: "0px!important",
    },
    ".twap-orders": {
      maxWidth: "unset!important",
    },
  };
};
