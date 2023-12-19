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

export const StyledPercentSelect = styled(Styles.StyledRowFlex)({
  width: "auto",
  marginLeft: "auto",
  button: {
    background: "rgb(255 255 255/0.08)",
    border: "unset",
    height: 28,
    padding: "0px 10px",
    fontSize: 16,
    fontWeight: 500,
    color: "white",
    cursor: "pointer",
  },
});

const baseStyles = (theme: Theme) => {
  const darkMode = isDark(theme);
  return {
    mainBackground: "#3C3837",
    button: "linear-gradient(to right, rgb(223, 131, 47), rgb(227, 151, 79), rgb(230, 161, 96), rgb(223, 131, 47))",
    buttonColor: darkMode ? "white" : "rgb(49, 65, 94)",
    secondaryBackground: "#333333",
    iconsColor: "white",
    textColor: darkMode ? "white" : "rgb(77, 103, 147)",
    tooltipBackground: darkMode ? "white" : "#D8DEEA",
    tooltipTextColor: darkMode ? "rgb(40, 13, 95)" : "rgb(77, 103, 147)",
    spinnerColor: darkMode ? "white" : "rgb(77, 103, 147)",
    cardBackground: darkMode ? "rgb(250 240 240)" : "rgb(228, 233, 241)",
    progressBarColor: darkMode ? "rgb(140, 140, 227)" : "rgb(102, 101, 221)",
    progressBarTrackColor: darkMode ? "#373E55" : "#D8DEEA",
    skeletonLoaderBackground: darkMode ? "rgba(255, 255, 255, 0.2)" : "rgb(0, 0, 0, 0.1)",
    cardTextColor: "rgb(20 20 20/1)",
  };
};

const buttonStyles = (theme: Theme) => {
  const styles = baseStyles(theme);
  return {
    color: styles.textColor,
    height: 28,
    padding: "0px 5px",
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
    border: `2px solid ${styles.button}!important`,
    transition: "0.2s all",
    textTransform: "uppercase",
    borderRadius: 10,
    backgroundImage: "linear-gradient(to right, rgb(223, 131, 47), rgb(227, 151, 79), rgb(230, 161, 96), rgb(223, 131, 47))",
    backgroundSize: "300% 100%",
    "&:hover": {
      backgroundPosition: "100% 0%",
    },
  };
};

export const StyledPoweredBy = styled(Components.PoweredBy)({
  p: {
    color: "white",
  },
});

export const StyledTopGrid = styled(Styles.StyledColumnFlex)({
  gap: 20,
});
export const StyledTokenBalance = styled(Components.TokenBalance)({
  maxWidth: "unset",
  "*": {
    fontSize: 16,
    fontWeight: 500,
    color: "white",
  },
});

export const StyledTokenPanel = styled(Styles.StyledColumnFlex)({
  ".twap-label": {
    p: {
      color: "rgb(184 182 203/1)",
    },
  },
});

export const StyledTokenPanelInput = styled(Components.TokenInput)({
  width: "100%",
  ".twap-loader": {
    backgroundColor: `rgba(0,0,0, 0.2)!important`,
  },
  input: {
    textAlign: "left",
    fontSize: 24,
    height: 40,
  },
});
export const StyledMarketPrice = styled(Components.MarketPrice)({
  ".title": {
    fontSize: 14,
    color: "rgb(184 182 203/1)",
  },
  ".twap-price-compare": {
    color: "white",
  },
  [`@media(max-width:${MOBILE}px)`]: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
});

export const StyledLimitPriceInput = styled(Components.LimitPriceInput)(({ theme }) => {
  return {
    background: "transparent",
    borderRadius: 5,
    padding: "3px 5px",
    border: "2px solid rgb(223 131 47/1)",
    svg: {
      "*": {
        color: baseStyles(theme).cardTextColor,
      },
    },
  };
});

export const StyledTokenSelect = styled(Box)(({ theme }) => ({
  "*": {
    fontSize: 15,
    fontWeight: 500,
    color: baseStyles(theme).cardTextColor,
  },

  ".twap-token-logo": {
    width: 28,
    height: 28,
  },

  svg: {
    width: 15,
    height: 15,
    "*": {
      fill: baseStyles(theme).cardTextColor,
    },
  },
}));

export const StyledChangeTokensOrder = styled(Components.ChangeTokensOrder)({
  button: {
    background: "rgb(255 255 255/0.08)",
    width: 42,
    height: 42,
    borderRadius: 5,
    ".MuiTouchRipple-root": {
      display: "none",
    },
    svg: {
      width: 25,
      height: 25,
    },
  },
});

export const StyledTradeSize = styled(Components.Base.Card)({});

export const StyledPriceCard = styled(Components.Base.Card)({});

export const StyledSubmitButton = styled(Components.SubmitButton)({
  marginTop: 20,
  height: 57,
  marginLeft: "auto",
  marginRight: "auto",
  "*": {
    fontSize: 17,
    fontWeight: 600,
  },
});

export const StyledOrdersPanel = styled(OrdersPanel)(({ theme }) => {
  const styles = baseStyles(theme);
  return {
    fontFamily: "Montserrat",
    ".twap-order": {
      background: "#141414",
      border: "2px solid rgb(223 131 47/1)",
      ".twap-order-expanded-row": {
        alignItems: "flex-start",
        ".twap-label": {
          flex: 1,
        },
      },
    },
    svg: {
      fill: styles.textColor,
    },
    ".twap-cancel-order": {
      ...buttonStyles(theme),
      fontWeight: 400,
      fontSize: 16,
    },
    ".twap-price-compare": {
      "*, p": {
        fontSize: 13,
      },
    },
    ".twap-market-price-section": {
      alignItems: "flex-start",
      ".twap-label": {
        fontSize: 13,
      },
    },
    ".twap-order-expanded-right": {
      fontWeight: 400,
    },
    ".twap-order-expanded-row": {
      ".twap-label": {
        fontSize: 13,
      },
    },
    color: styles.textColor,
    ".twap-orders-header-tabs": {
      background: "#141414",
      border: "2px solid rgb(223 131 47/1)",
      ".Mui-selected": {
        background: "#DC812E",
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

export const StyledOrderSummaryModal = styled(Components.OrderSummaryModalContainer)(({ theme }) => {
  const styles = baseStyles(theme);
  return {
    ".twap-modal-content": {
      paddingTop: 50,
      overflowY: "auto",
      ".twap-card": {
        background: styles.mainBackground,
        "*, svg": {
          color: styles.textColor,
          fill: styles.textColor,
        },
        ".twap-label": {
          fontSize: 14,
        },
      },
      a: {
        color: baseStyles(theme).textColor,
      },
      ".twap-order-summary-details-item-right": {
        p: {
          fontSize: 14,
        },
      },
      ".twap-disclaimer-text": {
        "*": {
          fontSize: 14,
        },
      },
    },
  };
});

export const configureStyles = (theme: Theme) => {
  const styles = baseStyles(theme);
  const darkMode = isDark(theme);
  return {
    ".twap-usd": {
      p: {
        color: "rgb(20 20 20/1)",
        fontSize: 14,
      },
    },
    ".twap-button": {
      ...buttonStyles(theme),
    },
    ".twap-ui-close": {
      "*": {
        color: darkMode ? "white" : "black",
      },
    },
    ".twap-modal": {
      color: styles.textColor,
      fontFamily: "Montserrat",
      ".twap-modal-content": {
        background: "black",
        padding: 20,
        border: "1px solid rgb(223,131,47)",
      },
    },
    ".twap-card": {
      background: styles.cardBackground,
      borderRadius: 3,
      padding: "8px 8px",
      minHeight: 50,
      "*, p": {
        color: styles.cardTextColor,
      },
      svg: {
        fill: styles.cardTextColor,
      },
      ".twap-label": {
        fontSize: 16,
        "*": {
          fontWeight: 500,
        },
      },
    },

    ".twap-tooltip": {
      "& .MuiTooltip-tooltip": {
        backgroundColor: styles.tooltipBackground,
        borderRadius: 6,
        color: styles.cardTextColor,
        fontSize: 15,
        fontFamily: "Montserrat",
        lineHeight: "22px",
        padding: 10,
        "& *": {
          color: styles.cardTextColor,
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
        p: {
          color: styles.cardTextColor,
        },
      },
      ".twap-input": {
        input: {
          fontSize: 17,
        },
      },
    },
    ".twap-time-selector-list": {
      background: "#3B3735",
      border: darkMode ? "1px solid white" : "1px solid rgba(0,0,0,0.1)",
      right: 0,
      p: {
        color: "white",
      },
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
      "*": {
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
        color: styles.cardTextColor,
        "&::placeholder": {
          color: "rgb(20,20,20)!important",
          opacity: 0.5,
        },
      },
    },

    ".twap-submit": {
      width: "100%",
      height: 50,
      "*": {
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
      ...buttonStyles(theme),
      height: 32,
      border: "unset",
      borderRadius: 14,
      fontWeight: 500,
      textTransform: "unset",
      "&:hover": {
        backgroundPosition: "70% 0%",
      },
    },

    ".twap-button-disabled": {
      cursor: "not-allowed!important",
      background: "#838180",
      opacity: "1!important",
      "*": {
        color: "black",
      },
    },

    ".twap-order-preview": {
      ".twap-order-progress": {
        height: 4,
        background: "rgba(255,255,255, 0.1)!important",
        ".MuiLinearProgress-bar": {
          height: 4,
          background: "rgb(0, 128, 0)",
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
