import { styled } from "@mui/material";
import { Components, Styles } from "@orbs-network/twap-ui";
const gradient = "linear-gradient(to right, rgb(216, 0, 183), rgb(177, 0, 222), rgb(177, 0, 222), rgb(216, 0, 183))";

export const StyledPanelInput = styled(Components.TokenInput)({
  width: "100%",
  input: {
    fontSize: 20,
    height: 40,
  },
});

export const StyledCard = styled("div")<{ isDarkTheme: number }>(({ isDarkTheme }) => ({
  width: "100%",
  padding: 1,
  borderRadius: 3,
  background: "transparent linear-gradient(128deg,#ed00c9,#bd00ed) 0 0 no-repeat padding-box",
  ".twap-card-children": {
    minHeight: 50,
    borderRadius: 3,
    padding: 10,
    background: isDarkTheme ? "rgb(9 3 51/1)" : "white",
    display: "flex",
    alighItems: "center",
  },
}));

export const StyledTokenPanelTop = styled(Styles.StyledRowFlex)({
  justifyContent: "space-between",
});

export const StyledBalance = styled(Components.TokenBalance)({
  maxWidth: "unset",
  "*": {
    fontWeight: 600,
    fontSize: 14,
    "@media(max-width: 600px)": {
      fontSize: 14,
    },
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
    cursor: "pointer",
    "@media(max-width: 600px)": {
      fontSize: 12,
      padding: "0px 7px",
    },
  },
  "@media(max-width: 600px)": {
    gap: 4,
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
  minHeight: 57,
  fontWeight: 700,
  fontSize: 17,
  textTransform: "uppercase",
  lineHeight: "24px",
  padding: 10,
  color: "white!important",
  "*": {
    fontWeight: "inherit",
    fontSize: "inherit",
    lineHeight: "inherit",
    color: "white!important",
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
    fontSize: 18,
    fontWeight: 600,
  },
  p: {
    fontSize: 14,
    fontWeight: 600,
  },
  ".twap-token-display": {
    gap: 10,
  },
});

export const StyledLimitPrice = styled(Components.LimitPriceInput)({
  ".twap-input": {
    height: "auto",
    input: {
      fontSize: 15,
    },
  },
});

export const StyledOrders = styled("div")<{ isDarkMode: number }>(({ isDarkMode }) => ({
  "*": {
    color: isDarkMode ? "white" : "rgb(10 9 62/1)",
  },
  ".twap-order": {
    background: "rgb(16 22 69/1)",
    padding: 20,
    borderRadius: 5,
    ".twap-label p": {
      fontSize: 14,
    },
    ".twap-order-separator": {
      display: "none",
    },
    ".twap-market-price-section": {
      background: "#090333",
      width: "100%",
      padding: "5px 10px",
      borderRadius: 8,
      "*": {
        fontSize: "13px",
      },
      ".twap-small-label p": {
        fontSize: "14px!important",
      },
    },
    ".MuiLinearProgress-root": {
      background: "rgba(255,255,255,0.1)",
    },
    ".MuiLinearProgress-bar": {
      background: gradient,
    },
    ".MuiLinearProgress-root::after": {
      display: "none",
    },
  },
  ".twap-odnp": {
    background: "unset",
    border: "1px solid #BD01D2",
    transition: "0.2s all",
    "&:hover": {
      background: "#BD01D2",
      border: "1px solid transparent",
    },
  },
  ".twap-orders-header": {
    ".twap-label": {
      p: {
        fontSize: "16px!important",
      },
    },
    ".twap-orders-header-tabs": {
      border: "1px solid #BD01D2",
    },
    ".MuiButtonBase-root": {
      borderRadius: 4,
      transition: "0.3s all",
      color: isDarkMode ? "white" : "rgb(10 9 62/1)",
    },
    ".Mui-selected": {
      background: gradient,
      color: "white!important",
    },
    ".MuiTabs-indicator": {
      display: "none",
    },
  },
}));

export const StyledOrderSummary = styled(Components.OrderSummaryModalContainer)<{ isDarkMode: number }>(({ isDarkMode }) => ({
  fontFamily: "Figtree",
  "*": {
    color: isDarkMode ? "white" : "rgb(10 9 62/1)",
  },
  ".twap-modal-content": {
    padding: "50px 20px 20px 20px",
    background: isDarkMode ? "rgb(16 22 69/1)" : "white",
    border: "1px solid rgb(0 0 175/1)",
    maxHeight: "90vh",
    overflowY: "auto",
    width: "calc(100vw - 40px)",
    borderRadius: 8,
    ".twap-card": {
      background: isDarkMode ? "rgb(13 18 56/1)" : "transparent",
      border: isDarkMode ? "1px solid transparent" : "1px solid rgb(13 18 56/1)",
      borderRadius: 8,
      padding: 20,
    },
    "twap-order-summary-details": {},
    ".twap-order-summary-details-item": {
      div: {
        "&:last-of-type": {
          "*": {
            fontSize: 14,
          },
        },
      },
    },
  },
  ".twap-orders-summary-token-display": {
    ".twap-token-logo": {
      width: 45,
      height: 45,
    },
  },
  "@media(max-width: 600px)": {
    ".twap-order-summary-details-item": {
      flexDirection: "column",
      alignItems: "flex-start",
    },
    ".twap-orders-summary-token-display-flex": {
      "&:last-of-type": {
        flexDirection: "column",
        alignItems: "flex-start",
      },
    },
  },
}));

export const configureStyles = (isDarkMode?: boolean) => {
  return {
    ".odnp": {
      "*": {
        color: "black",
      },
    },
    ".twap-input": {
      input: {
        "&::placeholder": {
          color: isDarkMode ? "white!important" : "rgb(10 9 62/1)!important",
          opacity: 0.4,
        },
      },
    },
    ".twap-limit-price-input": {
      paddingLeft: "5px!important",
      background: isDarkMode ? "rgb(16 22 69 / 1)" : "#F4F5F6",
      borderRadius: 8,
    },
    ".MuiBackdrop-root": {
      background: isDarkMode ? "rgb(9 3 51/0.88)!important" : "white!important",
      opacity: isDarkMode ? "unset" : "0.7!important",
    },
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
    ".MuiSlider-thumb": {
      background: gradient,
    },
    ".MuiSwitch-track": {
      backgroundColor: isDarkMode ? "white!important" : "rgb(10 9 62/1)!important",
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
        backgroundColor: isDarkMode ? "rgb(16 22 69/1)" : "white",
        borderRadius: "4px",
        color: isDarkMode ? "white" : "rgb(10 9 62/1)",
        fontSize: 14,
        lineHeight: 1.5,
        padding: 10,
        border: "1px solid rgb(0 0 175/1)",
        fontFamily: "Figtree",
        "& *": {
          color: "inherit",
          fontSize: 14,
        },
      },
      "& .MuiTooltip-arrow": {
        display: "none",
      },
    },
    ".twap-adapter-wrapper": {
      "*": {
        color: isDarkMode ? "white" : "rgb(10 9 62/1)",
        fontFamily: "inherit",
      },
    },

    ".twap-orders-header": {
      padding: "0px!important",
    },
    ".twap-orders": {
      maxWidth: "unset!important",
      color: isDarkMode ? "white" : "rgb(10 9 62/1)",
      "*": {
        fontFamily: "inherit",
      },
    },
  };
};
