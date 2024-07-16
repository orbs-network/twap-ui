import { createTheme, styled, Theme } from "@mui/material";
import { Components, Styles, OrdersPanel } from "@orbs-network/twap-ui";

const isDarkMode = (theme: Theme) => theme.palette.mode === "dark";

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

export const lightTheme = createTheme({
  palette: {
    mode: "light",
  },
});

export const baseStyles = (theme: Theme) => {
  return {
    secondaryBg: "rgb(66 45 76/1)",
    borderMain: "1px solid rgb(53 36 61/1)",
    colorMain: "rgb(243 242 244/1)",
    colorDark: "rgb(104 87 112/1)",
    fontFamily: "Inter",
  };
};

const cardStyles = (theme: Theme) => {
  const styles = baseStyles(theme);
  return {
    width: "100%",
    borderRadius: 12,
    background: " transparent",
    border: styles.borderMain,
    padding: 12,
  };
};

export const StyledPanelInput = styled(Components.TokenPanelInput)({
  width: "100%",
  input: {
    fontSize: 20,
    height: 40,
  },
});

export const StyledCard = styled(Components.Base.Card)(({ theme }) => ({
  ...cardStyles(theme),
}));

export const StyledTokenPanelTop = styled(Styles.StyledRowFlex)({
  justifyContent: "space-between",
});

export const StyledBalance = styled(Components.TokenBalance)(({ theme }) => {
  const styles = baseStyles(theme);
  return {
    maxWidth: "unset",
    "*": {
      fontSize: "14px!important",
      color: styles.colorDark,
    },
  };
});

export const StyledTokenPanelUsd = styled(Components.TokenUSD)(({ theme }) => {
  const styles = baseStyles(theme);
  return {
    "*": {
      fontSize: "14px!important",
      color: styles.colorDark,
    },
  };
});

export const StyledPercentSelector = styled(Styles.StyledRowFlex)(({ theme }) => {
  return {
    width: "fit-content",
    gap: 4,
    marginLeft: "auto",
    button: {
      background: "transparent",
      border: "unset",
      padding: "6px 12px",
      fontSize: 14,
      fontWeight: 500,
      borderRadius: 4,
      color: "rgb(217 213 219/1)",
      cursor: "pointer",
      "&:hover": {
        background: "rgb(40 27 46/1)",
      },
      "@media(max-width: 600px)": {
        fontSize: 12,
        padding: "0px 7px",
      },
    },
    "@media(max-width: 600px)": {
      gap: 4,
    },
  };
});

export const StyledLimitPriceContainer = styled(StyledCard)({
  display: "flex",
  flexDirection: "column",
  gap: 14,
});

export const StyledTopColumn = styled(Styles.StyledColumnFlex)({
  gap: 4,
});

const buttonStyles = (theme: Theme) => {
  const styles = baseStyles(theme);
  return {
    background: "rgb(53 36 61/1)",
    padding: "0px 10px",
    fontWeight: 500,
    fontSize: 16,
    borderRadius: 8,
    height: 44,
    color: styles.colorMain,
    cursor: "pointer",
    border: "unset",
    "&:hover": {
      background: styles.secondaryBg,
    },
    "*": {
      color: "inherit",
      stroke: styles.colorMain,
    },
    "&:disabled": {
      background: "rgb(53 36 61/1)",
      pointerEvents: "none",
      color: "rgb(104 87 112/1)",
      cursor: "not-allowed",
      opacity: 1,
    },
  };
};

export const StyledLimitPriceInverter = styled("div")(({ theme }) => {
  return {
    cursor: "pointer",
    position: "relative",
    top: 2,
    svg: {
      width: 22,
      height: 22,
    },
  };
});

export const StyledButton = styled("button")(({ theme }) => {
  return {
    ...buttonStyles(theme),
  };
});

export const StyledReset = styled(StyledButton)({
  display: "flex",
  alignItems: "center",
  gap: 6,
  height: "auto",
  padding: "5px 10px",
  p: {
    fontSize: 13,
  },
  svg: {
    width: 12,
    height: 12,
  },
});

export const StyledTokenChange = styled(Components.ChangeTokensOrder)(({ theme }) => {
  const styles = baseStyles(theme);
  return {
    height: 0,
    position: "relative",
    button: {
      background: "rgb(53 36 61/1)",
      borderRadius: 8,
      width: 42,
      height: 42,
      "&:hover": {
        background: styles.secondaryBg,
      },
    },
  };
});

export const StyledContainer = styled(Styles.StyledColumnFlex)({
  gap: 15,
});

export const StyledColumnFlex = styled(Styles.StyledColumnFlex)({
  gap: 8,
});

export const StyledSubmit = styled(Components.SubmitButton)<{ connected?: number }>(({ theme, connected }) => {
  return {
    ...buttonStyles(theme),
    background: connected ? "rgb(53 36 61/1)" : "rgb(220 0 212/1)",
    marginTop: 20,
    "&:hover": {
      background: connected ? "rgb(53 36 61/1)" : "rgb(220 0 212/1)",
    },
  };
});

export const StyledPoweredBy = styled(Components.PoweredBy)({
  marginTop: 20,
});

export const StyledTokenSelect = styled(Components.TokenSelect)(({ theme }) => {
  const styles = baseStyles(theme);
  return {
    gap: 10,
    background: styles.secondaryBg,
    padding: "6px 8px 6px 6px",
    borderRadius: "20px",
    ".twap-token-not-selected": {
      padding: "0px 0px 0px 10px",
    },
    ".twap-token-logo": {
      width: 24,
      height: 24,
    },
    ".twap-token-name": {
      fontSize: 14,
      fontWeight: 400,
      lineHeight: "24px",
      color: "rgb(217 213 219/1)",
    },
    svg: {
      fill: "rgb(217 213 219/1)",
      width: 16,
      height: 16,
    },
    ".twap-token-display": {
      gap: 10,
    },
  };
});

export const StyledOrders = styled(OrdersPanel)(({ theme }) => {
  const styles = baseStyles(theme);
  return {
    color: styles.colorMain,
    ".twap-odnp-button": {
      ...buttonStyles(theme),
      background: "rgb(220 0 212/1)",
      "&:hover": {
        background: "rgb(220 0 212/1)",
      },
    },
    ".twap-orders-mobile-button": {
      ...buttonStyles(theme),
    },

    ".twap-cancel-order": {
      ...buttonStyles(theme),
      fontSize: 14,
      minWidth: 160,
      marginTop: 40,
    },
    ".twap-order-expanded-wrapper": {
      background: "rgb(40 27 46/1)!important",
    },
    ".twap-order": {
      ...cardStyles(theme),

      ".twap-label p": {
        fontSize: 14,
      },

      ".twap-order-separator": {
        display: "none",
      },
      ".twap-market-price-section": {
        width: "100%",
        borderRadius: 8,
        "*": {
          fontSize: "13px",
        },
        ".twap-small-label p": {
          fontSize: "14px!important",
        },
      },
      ".MuiLinearProgress-root": {
        background: styles.secondaryBg,
      },
      ".MuiLinearProgress-bar": {
        background: "rgb(220 0 212/1)",
      },
      ".MuiLinearProgress-root::after": {
        display: "none",
      },
      "&:hover": {
        background: "rgb(40 27 46/1)",
      },
    },
    ".twap-orders-header-tabs": {
      background: "rgb(40 27 46/1)!important",
      border: "unset",
    },
    ".Mui-selected": {
      background: "rgb(53 36 61/1)!important",
      color: `${styles.colorMain}!important`,
    },
    ".MuiTouchRipple-root": {
      display: "none",
    },
    ".MuiTabs-indicator": {
      display: "none!important",
    },
    ".MuiButtonBase-root": {
      borderRadius: 4,
      transition: "0.3s all",
      color: "rgb(179 171 183/1)",
    },
    ".twap-orders-header": {
      ".twap-label": {
        p: {
          fontSize: "16px!important",
        },
      },
    },
    "@media(min-width: 600px)": {
      ".twap-time-selector-list": {
        "&-item": {
          "&:hover": {
            background: "rgba(255,255,255,0.05)",
          },
        },
      },
    },
  };
});

export const StyledOrderSummary = styled(Components.OrderSummaryModalContainer)(({ theme }) => {
  const styles = baseStyles(theme);
  return {
    fontFamily: styles.fontFamily,

    ".twap-modal-content": {
      ".twap-card": {
        ...cardStyles(theme),
      },
      svg: {
        color: styles.colorMain,
      },
      "twap-order-summary-details": {},
      ".twap-order-summary-details-item": {
        flexWrap: "wrap",
        div: {
          "&:last-of-type": {
            "*": {
              fontSize: 14,
            },
          },
        },
      },
    },
    ".twap-price-compare": {
      fontSize: 14,
      "*": {
        fontSize: 14,
      },
    },
    ".twap-orders-summary-token-display": {
      ".twap-token-logo": {
        width: 45,
        height: 45,
      },
    },
    "@media(max-width: 600px)": {},
  };
});

export const configureStyles = (theme: Theme) => {
  const styles = baseStyles(theme);
  return {
    ".twap-orders-mobile-menu": {
      ".MuiPopover-paper": {
        background: styles.secondaryBg,
      },
      "*": {
        color: "white",
      },
    },
    ".twap-odnp-link": {
      ...buttonStyles(theme),
    },
    ".twap-time-selector-selected": {
      p: {
        fontSize: "13px!important",
      },
    },
    ".twap-time-selector-list": {
      background: styles.secondaryBg,
      borderRadius: "12px!important",
    },

    ".MuiSwitch-track": {
      background: "#422D4C!important",
    },
    ".MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track": {
      background: "rgb(220 0 212/1)!important",
    },

    ".twap-modal-content": {
      padding: "20px 20px 20px 20px",
      maxHeight: "90vh",
      overflowY: "auto",
      width: "calc(100vw - 40px)",
      background: "#1B121E",
      borderRadius: 12,
      color: styles.colorMain,
      ".twap-ui-close": {
        color: "inherit",
      },
      ".MuiCircularProgress-root": {
        color: "rgb(220 0 212/1)",
      },
    },
    ".twap-container": {
      "*": {
        color: styles.colorMain,
      },
    },
    ".twap-slider": {
      ".MuiSlider-valueLabel": {
        backgroundColor: "rgb(16 22 69/1)",
      },
    },

    ".twap-input": {
      input: {
        padding: 0,
        color: styles.colorMain,
        "&::placeholder": {
          color: styles.colorMain,
          opacity: 0.4,
        },
      },
    },
    ".MuiBackdrop-root": {
      background: "rgba(13, 9, 15, 0.8)!important",
    },
    ".twap-time-selector": {
      ".twap-input": {
        input: {
          height: 30,
          background: styles.secondaryBg,
          borderRadius: 8,
          padding: "12px 10px 12px 10px",
          paddingRight: "13px!important",
          maxWidth: 170,
          marginLeft: "auto",
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
    ".twap-label": {
      p: {
        fontSize: 15,
        fontWeight: 500,
      },
    },

    ".twap-usd": {
      p: {
        fontSize: 14,
      },
    },

    ".twap-tooltip": {
      "& .MuiTooltip-tooltip": {
        background: styles.secondaryBg,
        borderRadius: "8px",
        fontSize: 14,
        lineHeight: 1.5,
        padding: 12,
        fontFamily: "Inter",
        "& *": {
          color: "inherit",
          fontSize: 14,
        },
      },
      "& .MuiTooltip-arrow": {
        display: "none",
      },
    },

    ".twap-orders-header": {
      padding: "0px!important",
    },
    ".twap-orders": {
      maxWidth: "unset!important",

      "*": {
        fontFamily: "inherit",
      },
    },
  };
};

export const StyledDisclaimerText = styled(Components.DisclaimerText)(({}) => ({
  "*": {},
}));
