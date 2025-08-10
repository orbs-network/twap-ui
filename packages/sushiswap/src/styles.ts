import { Box, styled, Typography } from "@mui/material";
import { Components, OrdersPanel, Styles } from "@orbs-network/twap-ui";
const gradient = "linear-gradient(to right,rgba(59,130,246,.15),rgba(236,72,153,.15))";

export const StyledPanelInput = styled(Components.TokenInput)({
  input: {
    fontSize: 30,
    height: 44,
    fontWeight: 500,
  },
});

const getTextColor = (isDarkMode?: number) => (!isDarkMode ? "rgba(0,0,0, 0.8)" : "white");
const getFadedTextColor = (isDarkMode?: number) => (!isDarkMode ? "rgb(107 114 128/1)" : "rgb(148 163 184/1)");

export const StyledWithIcon = styled(Styles.StyledRowFlex)({
  color: getFadedTextColor(),
  "*": {
    color: getFadedTextColor(),
  },
});

export const StyledUSD = styled(Components.TokenUSD)<{ isDarkMode: number }>(({ isDarkMode }) => ({
  "*": {
    color: getFadedTextColor(isDarkMode),
    fontWeight: 500,
  },
  p: {
    fontSize: 18,
  },
  span: {
    fontSize: "14px!important",
    color: "inherit",
    fontWeight: "inherit",
  },
}));

export const StyledBalance = styled(Styles.StyledRowFlex)<{ isDarkMode: number }>(({ isDarkMode }) => ({
  color: `${getFadedTextColor(isDarkMode)}!important`,
  gap: 4,
  "*": {
    fontWeight: "500!important",
  },
  ".twap-balance": {
    maxWidth: "unset",
    fontSize: 18,
    fontWeight: "500!important",
  },
  width: "auto",

  span: {
    fontSize: 14,
    fontWeight: "inherit",
  },
}));

export const StyledEmpty = styled(Typography)({
  svg: {
    fill: getFadedTextColor(),
    color: getFadedTextColor(),
  },
});

export const StyledTokenChange = styled(Components.ChangeTokensOrder)<{ isDarkTheme: number }>(({ isDarkTheme }) => ({
  button: {
    position: "absolute",
    background: isDarkTheme ? "rgb(15 23 42/1)" : "rgb(243 244 246/1)",
    width: 30,
    height: 30,
    borderRadius: "50%",
    "&:hover": {
      background: isDarkTheme ? "rgb(15 23 42/1)" : "rgb(243 244 246/1)",
    },
  },
  svg: {
    width: 27,
    height: 27,
    fill: "rgb(59 130 246/1)",
  },
}));

export const StyledContainer = styled(Styles.StyledColumnFlex)({
  gap: 15,
});

export const StyledTokenPanel = styled(StyledContainer)({});

export const StyledColumnFlex = styled(Styles.StyledColumnFlex)({
  gap: 16,
});

const buttonStyles = {
  borderRadius: 12,
  background: "rgb(59 130 246/1)",
  minHeight: 52,
  fontWeight: 500,
  fontSize: 16,
  lineHeight: "24px",
  padding: 10,
  color: "white",
  "*": {
    fontWeight: "inherit",
    fontSize: "inherit",
    lineHeight: "inherit",
    color: "white!important",
  },
};

export const StyledSubmit = styled(Components.SubmitButton)({});

export const StyledPoweredBy = styled(Components.PoweredBy)({
  marginTop: 20,
});

export const StyledTokenSelect = styled(Components.TokenSelect)<{ isDarkMode: number }>(({ isDarkMode }) => ({
  gap: 6,
  background: isDarkMode ? "hsla(0,0%,100%,.06)" : "rgba(0,0,0,.06)",
  padding: 8,
  borderRadius: 30,
  color: getTextColor(isDarkMode),
  "*": {
    color: "inherit",
  },
  ".twap-token-logo": {
    width: 28,
    height: 28,
  },
  ".twap-token-name": {
    fontSize: 16,
    fontWeight: 500,
  },
  p: {
    fontSize: 16,
    fontWeight: 600,
  },
  ".twap-token-display": {
    gap: 5,
  },
}));

export const StyledLimitPrice = styled(Components.LimitPriceInput)({
  background: "hsla(0,0%,100%,.06)",
  borderRadius: 12,
  padding: 5,
  "*": {
    fontSize: `14px!important`,
    fontWeight: 500,
  },
  ".twap-input": {
    height: "auto",
    input: {
      fontSize: `15px!important`,
    },
  },
});

export const StyledOrders = styled(OrdersPanel)<{ isDarkMode: number }>(({ isDarkMode }) => ({
  maxWidth: "unset!important",
  "*": {
    color: getTextColor(isDarkMode),
  },
  ".twap-orders-list": {
    gap: 16,
  },
  ".twap-order-expanded-right": {
    color: `${getFadedTextColor(isDarkMode)}!important`,
    fontWeight: 500,
    "*": {
      color: `inherit`,
      fontWeight: `inherit`,
    },
  },
  ".twap-token-display-amount-and-symbol": {
    fontSize: 15,
    fontWeight: 500,
  },
  ".twap-order": {
    padding: 20,

    ".twap-label p": {
      fontSize: 14,
      fontWeight: 500,
    },

    ".twap-order-separator": {
      display: "none",
    },
    ".twap-market-price-section": {
      background: isDarkMode ? "hsla(0,0%,100%,.06)" : "#F4F5F6",
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
      background: "hsla(0,0%,100%,.06)",
    },
    ".MuiLinearProgress-bar": {
      background: "rgb(59 130 246/1)",
    },
    ".MuiLinearProgress-root::after": {
      display: "none",
    },
  },
  ".twap-orders-header": {
    ".twap-label": {
      p: {
        fontSize: "16px!important",
        fontWeight: 500,
      },
    },
    ".twap-orders-header-tabs": {
      border: isDarkMode ? "1px solid hsla(0,0%,100%,.06)" : "1px solid rgb(59 130 246/1)",
    },
    ".MuiButtonBase-root": {
      borderRadius: 4,
      transition: "0.3s all",
      color: "inherit",
    },
    ".Mui-selected": {
      background: isDarkMode ? "hsla(0,0%,100%,.06)" : "rgb(59 130 246/1)",
      color: "white",
    },
    ".MuiTabs-indicator": {
      display: "none",
    },
  },
}));

export const StyledOrderSummary = styled(Components.OrderSummaryModalContainer)<{ isDarkTheme: number }>(({ isDarkTheme }) => ({
  fontFamily: "Inter",

  ".twap-modal-content": {
    ".twap-card": {
      background: isDarkTheme ? "rgb(226 232 240/0.04)" : "white",
      borderRadius: 10,
      padding: 15,
    },
    ".twap-disclaimer-text": {
      "*": {
        color: getFadedTextColor(isDarkTheme),
        fontSize: 14,
        lineHeight: "18px",
      },
    },
    ".twap-ui-close": {
      padding: 5,
      background: "hsla(0,0%,100%,.06)",
      top: 10,
      right: 10,
      svg: {
        width: 20,
        height: 20,
      },
      "&:hover": {
        background: "hsla(0,0%,100%,.1)",
      },
    },
    ".twap-order-summary-limit-price": {
      fontSize: 14,
      color: getFadedTextColor(isDarkTheme),
      p: {
        color: "inherit",
      },
    },
    ".twap-label": {
      fontSize: 14,
      fontWeight: 600,
      color: getTextColor(isDarkTheme),
      p: {
        fontSize: "inherit",
        fontWeight: "inherit",
        color: "inherit",
      },
    },
    ".twap-order-summary-details-item": {},
    ".twap-order-summary-details-item-right": {
      color: getFadedTextColor(isDarkTheme),
      fontSize: 14,
      fontWeight: 600,
      "*": {
        color: getFadedTextColor(isDarkTheme),
        fontSize: 14,
        fontWeight: 600,
      },
    },
  },
  ".twap-order-summary-output-address": {
    p: {
      color: getFadedTextColor(),
      fontSize: 15,
      fontWeight: 500,
    },
  },
  ".twap-orders-summary-token-display": {
    ".twap-small-label": {
      p: {
        color: getFadedTextColor(),
        fontSize: 16,
        fontWeight: 500,
      },
    },
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

export const StyledAdapter = styled(Box)<{ isDarkMode: number }>(({ isDarkMode }) => ({
  ".MuiSlider-valueLabel": {
    backgroundColor: "#2D3545",
    fontSize: 15,
  },
  "*": {
    color: getTextColor(isDarkMode),
  },
  ".MuiSlider-thumb ": {
    background: "rgb(59 130 246/1)",
  },
  ".MuiSlider-track": {
    background: "rgb(59 130 246/1)",
    border: "1px solid rgb(59 130 246/1)",
  },
  ".twap-button-disabled": {
    opacity: 0.7,
    pointer: "disabled",
    "*": {},
  },

  ".twap-label": {
    p: {
      color: "inherit",
      fontSize: 15,
      fontWeight: 500,
    },
  },
  ".twap-time-selector-list": {
    background: "#0F172A",
    border: "1px solid rgba(255,255,255, 0.1)",
  },
  ".twap-time-selector-list-item": {
    "&:hover": {
      background: "rgba(255,255,255,0.03)",
    },
  },
}));

export const configureStyles = (isDarkMode?: boolean) => {
  return {
    ".twap-modal-content": {
      padding: "56px 16px 16px 16px",
      background: isDarkMode ? "#222C3D" : "#F4F5F6",
      border: "unset",
      maxHeight: "90vh",
      overflowY: "auto",
      width: "calc(100vw - 40px)",
      borderRadius: 16,
      color: getTextColor(isDarkMode ? 1 : 0),
      ".twap-ui-close": {
        color: getTextColor(isDarkMode ? 1 : 0),
      },
    },
    ".twap-button": {
      ...buttonStyles,
    },
    ".twap-odnp-button": {
      ...buttonStyles,
      minHeight: "unset",
      border: "unset",
    },

    ".twap-input": {
      input: {
        "&::placeholder": {
          color: isDarkMode ? "white!important" : "rgb(17 24 39/1)!important",
          opacity: 0.4,
        },
      },
    },
    ".twap-card": {
      background: isDarkMode ? "rgb(30 41 59/1)" : "white",
      padding: 12,
      borderRadius: 12,
    },
    ".twap-limit-price-input": {
      paddingLeft: "0px!important",
    },
    ".MuiBackdrop-root": {
      background: isDarkMode ? "rgba(0,0,0,.4)!important" : "rgba(255,255,255,.4)!important",
      backdropFilter: "blur(10px) saturate(190%) contrast(70%) brightness(80%)",
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
    ".MuiSwitch-track": {
      background: isDarkMode ? "hsla(0,0%,100%,.3)!important" : "rgba(0,0,0, 0.3)!important",
      height: 20,
    },
    ".twap-disclaimer-switch": {
      p: {
        fontSize: 15,
        fontWeight: 500,
      },
    },
    ".Mui-checked+.MuiSwitch-track": {
      background: "rgb(59 130 246/1)!important",
      opacity: "1!important",
    },

    ".twap-tooltip": {
      "& .MuiTooltip-tooltip": {
        backgroundColor: isDarkMode ? "#283449" : "#F9F9FA",
        borderRadius: "4px",
        fontSize: 12,
        padding: 10,
        fontFamily: "Inter",
        fontWeight: 500,
        color: isDarkMode ? "rgb(148 163 184/1)" : "rgb(107 114 128/1)",
        lineHeight: "16px",
        "& *": {
          color: "inherit",
          fontSize: "inherit",
          fontWeight: "inherit",
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
  };
};
