import { Box, styled, Typography } from "@mui/material";
import { Components, Styles } from "@orbs-network/twap-ui";
const gradient = "linear-gradient(to right,rgba(59,130,246,.15),rgba(236,72,153,.15))";

export const StyledPanelInput = styled(Components.TokenInput)({
  input: {
    fontSize: 30,
    height: 44,
    fontWeight: 500,
    "&::placeholder": {
      color: "rgba(255,255,255, 0.3)",
    },
  },
});

export const fadedTextColor = "rgb(148 163 184/1)";

export const StyledWithIcon = styled(Styles.StyledRowFlex)({
  color: fadedTextColor,
  "*": {
    color: fadedTextColor,
  },
});

export const StyledUSD = styled(Components.TokenUSD)({
  p: {
    fontSize: 18,
    color: fadedTextColor,
    fontWeight: 500,
  },
  span: {
    fontSize: "14px!important",
    color: "inherit",
    fontWeight: "inherit",
  },
});

export const StyledBalance = styled(Styles.StyledRowFlex)({
  gap: 4,
  "*": {
    color: `${fadedTextColor}!important`,
  },
  ".twap-balance": {
    maxWidth: "unset",
    fontSize: 18,
    fontWeight: 500,
  },
  width: "auto",

  span: {
    fontSize: 14,
    fontWeight: "inherit",
  },
});

export const StyledEmpty = styled(Typography)({
  svg: {
    fill: fadedTextColor,
    color: fadedTextColor,
  },
});

export const StyledMarketPrice = styled(Components.MarketPrice)({
  background: gradient,
  padding: 12,
  borderRadius: 12,
  "> p": {
    fontSize: 15,
    fontWeight: 500,
  },
});

export const StyledTokenChange = styled(Components.ChangeTokensOrder)({
  button: {
    position: "absolute",
    background: "rgb(15 23 42/1)",
    width: 30,
    height: 30,
    borderRadius: "50%",
    "&:hover": {
      background: "rgb(15 23 42/1)",
    },
  },
  svg: {
    width: 27,
    height: 27,
    fill: "rgb(59 130 246/1)",
  },
});

export const StyledContainer = styled(Styles.StyledColumnFlex)({
  gap: 15,
});

export const StyledTokenPanel = styled(StyledContainer)({});

export const StyledColumnFlex = styled(Styles.StyledColumnFlex)({
  gap: 16,
});

export const StyledSubmit = styled(Components.SubmitButton)({
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
    color: "inherit",
  },
});

export const StyledPoweredBy = styled(Components.PoweredBy)({
  marginTop: 20,
});

export const StyledTokenSelect = styled(Components.TokenSelect)({
  gap: 6,
  background: "hsla(0,0%,100%,.06)",
  padding: 8,
  borderRadius: 30,
  color: "white",
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
});

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

export const StyledOrders = styled(Box)<{ isDarkMode: number }>({
  ".twap-orders-list": {
    gap: 16,
  },
  ".twap-order-expanded-right": {
    color: `${fadedTextColor}!important`,
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
      background: "hsla(0,0%,100%,.06)",
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
  ".twap-odnp": {
    background: "unset",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    transition: "0.2s all",
    "&:hover": {
      border: "1px solid rgba(255, 255, 255, 0.5)",
    },
  },
  ".twap-orders-header": {
    ".twap-label": {
      p: {
        fontSize: "16px!important",
      },
    },
    ".twap-orders-header-tabs": {
      border: "1px solid hsla(0,0%,100%,.06)",
    },
    ".MuiButtonBase-root": {
      borderRadius: 4,
      transition: "0.3s all",
    },
    ".Mui-selected": {
      background: "hsla(0,0%,100%,.06)",
      color: "white",
    },
    ".MuiTabs-indicator": {
      display: "none",
    },
  },
});

export const StyledOrderSummary = styled(Components.OrderSummaryModalContainer)({
  fontFamily: "Inter",
  ".twap-modal-content": {
    padding: "56px 16px 16px 16px",
    background: "#222C3D",
    border: "unset",
    maxHeight: "90vh",
    overflowY: "auto",
    width: "calc(100vw - 40px)",
    borderRadius: 16,
    ".twap-card": {
      background: "rgb(226 232 240/0.04)",
      borderRadius: 10,
      padding: 15,
    },
    ".twap-disclaimer-text": {
      "*": {
        color: fadedTextColor,
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
      color: fadedTextColor,
      p: {
        color: "inherit",
      },
    },
    ".twap-label": {
      fontSize: 14,
      fontWeight: 600,
      color: "white",
      p: {
        fontSize: "inherit",
        fontWeight: "inherit",
        color: "inherit",
      },
    },
    ".twap-order-summary-details-item": {},
    ".twap-order-summary-details-item-right": {
      color: fadedTextColor,
      fontSize: 14,
      fontWeight: 600,
      "*": {
        color: fadedTextColor,
        fontSize: 14,
        fontWeight: 600,
      },
    },
  },
  ".twap-order-summary-output-address": {
    p: {
      color: fadedTextColor,
      fontSize: 15,
      fontWeight: 500,
    },
  },
  ".twap-orders-summary-token-display": {
    ".twap-small-label": {
      p: {
        color: fadedTextColor,
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
});

export const StyledAdapter = styled(Box)({
  ".MuiSlider-valueLabel": {
    backgroundColor: "#2D3545",
    fontSize: 15,
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
});

export const configureStyles = () => {
  return {
    ".twap-card": {
      background: "rgb(30 41 59/1)",
      padding: 12,
      borderRadius: 12,
    },
    ".twap-limit-price-input": {
      paddingLeft: "0px!important",
    },
    ".MuiBackdrop-root": {
      background: "rgba(0,0,0,.4)!important",
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
      background: "hsla(0,0%,100%,.3)!important",
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
        backgroundColor: "#283449",
        borderRadius: "4px",
        fontSize: 12,
        padding: 10,
        fontFamily: "Inter",
        fontWeight: 500,
        color: "rgb(148 163 184/1)",
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
    ".twap-orders": {
      maxWidth: "unset!important",
      color: "white",
      "*": {
        fontFamily: "inherit",
      },
    },
  };
};
