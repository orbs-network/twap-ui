import { Box, createTheme, styled, Theme } from "@mui/material";
import { Components, OrdersPanel, Styles } from "@orbs-network/twap-ui";
const MOBILE = 500;
export const lightTheme = createTheme({
  palette: {
    mode: "light",
  },

  typography: {
    fontFamily: "inherit",
  },
});
const isDark = (theme: Theme) => theme.palette.mode === "dark";

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
  typography: {
    fontFamily: "inherit",
  },
});

const baseStyles = (theme: Theme) => {
  const darkMode = isDark(theme);
  return {
    mainBackground: "#111111",
    button: "#0154FE",
    buttonColor: darkMode ? "rgb(18, 17, 34)" : "rgb(49, 65, 94)",
    secondaryBackground: "#333333",
    iconsColor: "white",
    textColor: darkMode ? "white" : "rgb(77, 103, 147)",
    tooltipBackground: darkMode ? "white" : "#D8DEEA",
    tooltipTextColor: darkMode ? "rgb(40, 13, 95)" : "rgb(77, 103, 147)",
    spinnerColor: darkMode ? "white" : "rgb(77, 103, 147)",
    cardBackground: darkMode ? "linear-gradient(to bottom,#000 20%,#111)" : "rgb(228, 233, 241)",
    progressBarColor: darkMode ? "rgb(140, 140, 227)" : "rgb(102, 101, 221)",
    progressBarTrackColor: darkMode ? "#373E55" : "#D8DEEA",
    selectTokenBackground: darkMode ? "rgba(255, 255, 255, 0.05)" : "rgb(242, 244, 248)",
    selectedTokenBackground: darkMode ? "rgba(255, 255, 255, 0.87)" : "rgb(242, 244, 248)",
    skeletonLoaderBackground: darkMode ? "rgba(255, 255, 255, 0.2)" : "rgb(0, 0, 0, 0.1)",
  };
};

const buttonStyles = (theme: Theme) => {
  const styles = baseStyles(theme);
  return {
    background: styles.button,
    color: styles.textColor,
    height: 28,
    padding: "0px 5px",
    borderRadius: 2,
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
    border: `2px solid ${styles.button}!important`,
    transition: "0.2s all",
    textTransform: "uppercase",
    "&:hover": {
      background: styles.mainBackground,
      color: styles.button,
    },
  };
};

export const StyledMaxButton = styled("div")(({ theme }) => ({
  ...(buttonStyles(theme) as any),
  color: baseStyles(theme).mainBackground,
}));

export const StyledTopGrid = styled(Styles.StyledColumnFlex)({
  gap: 8,
});
export const StyledTokenBalance = styled(Components.TokenBalance)({
  "*": {
    fontSize: 14,
    fontWeight: 500,
    textTransform: "uppercase",
  },
});

export const StyledTokenPanel = styled(Styles.StyledColumnFlex)(({ theme }) => ({
  background: baseStyles(theme).cardBackground,
}));
export const StyledTokenPanelInput = styled(Components.TokenInput)({
  width: "100%",
  ".twap-loader": {
    left: "auto",
    right: 0,
  },
  input: {
    textAlign: "right",
    fontSize: 28,
  },
});
export const StyledMarketPrice = styled(Components.MarketPrice)({
  ".title": {
    fontSize: 12,
    color: "rgb(204, 204, 204)",
    fontWeight: 600,
  },
  [`@media(max-width:${MOBILE}px)`]: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
});

// const getButtonStyles = (theme: Theme) => {};
export const StyledTokenInputContainer = styled(Styles.StyledColumnFlex)({
  border: "3px solid white",
  padding: 16,
});
export const StyledLimitPriceInput = styled(Components.LimitPriceInput)(({ theme }) => {
  return {
    background: baseStyles(theme).secondaryBackground,
    borderRadius: 5,
    padding: "3px 5px",
    input: {
      letterSpacing: "unset",
    },
  };
});

export const StyledTokenSelect = styled(Box)({
  paddingLeft: 20,
  ".twap-token-logo": {
    width: 60,
    height: 60,
    boxShadow: "rgb(0, 0, 0) 0px 1px 4px, rgb(104, 185, 255) 0px 4px 12px, rgb(255, 255, 255) 0px 4px 4px, rgb(1, 84, 253) 4px 0px 12px, rgb(104, 185, 255) -4px 0px 12px",
  },
  ".twap-token-name": {
    fontSize: 22.4,
    fontWeight: 600,
  },
  svg: {
    width: 15,
    height: 15,
  },
});

export const StyledChangeTokensOrder = styled(Components.ChangeTokensOrder)(({ theme }) => {
  const styles = baseStyles(theme);
  return {
    button: {
      background: styles.button,
      border: "2px solid white",
      borderRadius: 0,
      width: 60,
      height: 40,
      ".MuiTouchRipple-root": {
        display: "none",
      },
      svg: {
        width: 18,
        height: 18,
      },
      "&:hover": {
        background: styles.button,
        boxShadow: "rgb(255, 255, 255) 0px 0px 4px, rgb(1, 84, 253) 0px 0px 12px",
      },
    },
  };
});

export const StyledTradeSize = styled(Components.Base.Card)({});

export const StyledPriceCard = styled(Components.Base.Card)({});

export const StyledSubmitButton = styled(Components.SubmitButton)({
  marginTop: 20,
  marginLeft: "auto",
  marginRight: "auto",
});

export const StyledOrdersPanel = styled(OrdersPanel)(({ theme }) => {
  const styles = baseStyles(theme);
  return {
    fontFamily: "Outfit",
    ".twap-order": {
      ".twap-order-expanded-row": {
        flexDirection: "column",
        alignItems: "flex-start",
      },
    },
    ".twap-cancel-order": {
      ...buttonStyles(theme),
      fontWeight: 400,
      fontSize: 16,
    },
    ".twap-market-price-section": {
      flexDirection: "column",
      alignItems: "flex-start",
      ".twap-label": {
        fontSize: 14,
      },
    },
    color: styles.textColor,
    ".twap-orders-header-tabs": {
      border: "1px solid white",
      ".Mui-selected": {
        background: styles.button,
        color: styles.textColor,
      },
      ".MuiTabs-indicator": {
        display: "none",
      },
      ".MuiTouchRipple-root": {
        display: "none",
      },
    },
  };
});

export const StyledOrderSummaryModal = styled(Components.OrderSummaryModalContainer)({
  ".twap-modal-content": {
    paddingTop: 50,
  },
});

export const configureStyles = (theme: Theme) => {
  const styles = baseStyles(theme);
  const darkMode = isDark(theme);
  return {
    ".twap-button": {
      ...buttonStyles(theme),
    },
    ".twap-modal": {
      color: styles.textColor,
      fontFamily: "Outfit",
      ".twap-modal-content": {
        background: styles.mainBackground,
        padding: 20,
        border: "2px solid white",
      },
    },
    ".twap-card": {
      border: "1px solid white",
      background: styles.cardBackground,
      padding: "12px 16px",
      ".twap-label": {
        fontSize: 16,
        "*": {
          fontWeight: 600,
        },
      },
    },

    ".twap-order-summary": {},

    ".twap-icon": {
      "& *": {
        color: `${styles.iconsColor}!important`,
      },
    },
    ".twap-tooltip": {
      "& .MuiTooltip-tooltip": {
        backgroundColor: styles.tooltipBackground,
        borderRadius: "10px",
        color: styles.tooltipTextColor,
        fontSize: 16,
        fontFamily: "Outfit",
        lineHeight: "24px",
        padding: 16,
        "& *": {
          color: styles.tooltipTextColor,
          fontSize: "inherit",
        },
      },
      "& .MuiTooltip-arrow": {
        color: styles.tooltipBackground,
      },
    },
    ".twap-loader": {
      backgroundColor: `${styles.skeletonLoaderBackground}!important`,
    },
    ".twap-button-loader": {
      color: `${styles.spinnerColor}!important`,
      zoom: `0.55!important`,
    },
    ".twap-time-selector": {
      ".twap-time-selector-selected": {
        padding: ".5rem",
        border: darkMode ? "1px solid white" : "1px solid rgba(0,0,0,0.5)",
        marginBottom: "5px",
        borderRadius: "8px",
      },
      ".twap-input": {
        input: {
          fontSize: 17,
        },
      },
    },
    ".twap-time-selector-list": {
      background: styles.mainBackground,
      border: darkMode ? "1px solid white" : "1px solid rgba(0,0,0,0.1)",
      right: 0,
      ".twap-time-selector-list-item": {
        "&:hover": {
          background: darkMode ? "rgba(255,255,255, 0.1)" : "rgba(0,0,0, 0.03)",
        },
      },
    },

    ".twap-container": {
      width: "100%",
      display: "flex",
      flexDirection: "column" as const,
      gap: 15,
      marginTop: 20,
      fontFamily: "Outfit",
      "*": {
        color: styles.textColor,
        fontFamily: "Outfit",
        "&::-webkit-scrollbar": {
          display: "none",
        },
      },
    },
    ".twap-slider": {
      "& .MuiSlider-valueLabel": {
        background: styles.tooltipBackground,
      },
      "& .MuiSlider-valueLabelLabel": {
        color: styles.tooltipTextColor,
      },
      "& .MuiSlider-track": {
        color: styles.button,
      },
      "& .MuiSlider-thumb": {
        background: styles.iconsColor,
      },
    },

    ".twap-token-name": {
      fontSize: 18,
    },
    ".twap-token-logo": {
      width: 28,
      height: 28,
    },
    ".twap-switch": {
      "& .MuiSwitch-thumb": {
        background: "white",
      },
      "& .MuiSwitch-track": {
        background: `${styles.secondaryBackground}!important`,
        opacity: "1!important",
      },
      "& .Mui-checked+.MuiSwitch-track": {
        backgroundColor: `${styles.secondaryBackground}!important`,
        opacity: "1!important",
      },
      "& .Mui-checked .MuiSwitch-thumb": {
        background: styles.button,
      },
    },

    ".twap-input": {
      input: {
        fontFamily: "inherit",
        fontWeight: 500,
        outline: "1px solid transparent",
        transition: "0.2s all",
        color: styles.textColor,
        letterSpacing: "2px",
        "&::placeholder": {
          color: styles.textColor,
        },
      },
    },

    ".twap-submit": {
      width: "100%",
      height: 50,
      "*": {
        letterSpacing: "0.03em",
        fontWeight: 500,
        fontSize: 16,
      },
    },
    ".twap-odnp-link": {
      padding: "10px 20px!important",
      minHeight: 40,
    },
    ".twap-odnp-separator": {
      background: `${styles.textColor}!important`,
    },
    ".twap-odnp-button": {
      height: 32,
      border: "unset",
      background: styles.button,
      borderRadius: 14,
      fontWeight: 500,
    },

    ".twap-button-disabled": {
      border: `1px solid ${styles.button}!important`,
      cursor: "not-allowed!important",
      background: styles.mainBackground,
      opacity: "1!important",
      "*": {
        color: styles.button,
        textTransform: "uppercase",
      },
    },

    ".twap-order-preview": {
      ".twap-order-progress": {
        height: 4,
        background: "#373E55!important",
        ".MuiLinearProgress-bar": {
          height: 4,
        },
      },
    },
    ".MuiBackdrop-root": {
      backdropFilter: "blur(15px)",
      background: "rgba(0,0,0,.4)!important",
    },
    "@media(max-width:450px)": {
      ".twap-limit-price-input": {
        ".twap-token-display img": {
          display: "none",
        },
      },
      ".twap-trade-size": {
        ".twap-chunks-size": {
          display: "flex",
          flexDirection: "column",
        },
      },
    },
  };
};
