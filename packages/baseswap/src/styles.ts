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
    button: "rgb(1, 84, 254)",
    buttonColor: darkMode ? "rgb(18, 17, 34)" : "rgb(49, 65, 94)",
    secondaryBackground: "#333333",
    iconsColor: "white",
    textColor: darkMode ? "white" : "rgb(77, 103, 147)",
    tooltipBackground: darkMode ? "white" : "#D8DEEA",
    tooltipTextColor: darkMode ? "rgb(40, 13, 95)" : "rgb(77, 103, 147)",
    spinnerColor: darkMode ? "white" : "rgb(77, 103, 147)",
    cardBackground: darkMode ? "linear-gradient(to top, rgb(0, 0, 0), rgb(34, 34, 34))" : "rgb(228, 233, 241)",
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
    padding: "0px 5px",
    borderRadius: 8,
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
    transition: "opacity 0.2s",
    textTransform: "uppercase",
    "&:hover": {
      background: styles.mainBackground,
      transform: "translateY(1px)",
    },
  };
};

export const StyledMaxButton = styled("button")(({ theme }) => {
  return {
    color: "rgb(55, 192, 223)",
    background: "transparent",
    border: "none",
    fontSize: 14,
    cursor: "pointer",
    fontWeight: 600,
    padding: 0,
    "&:hover": {
      color: "white",
      textDecoration: "underline",
    },
  };
});

export const StyledTopGrid = styled(Styles.StyledColumnFlex)({
  gap: 3,
});
export const StyledTokenBalance = styled(Components.TokenBalance)({
  "*": {
    fontSize: 14,
    fontWeight: 500,
    textTransform: "uppercase",
  },
});

export const StyledTokenPanel = styled(Components.Base.Card)({
  display: "flex",
  flexDirection: "column",
});
export const StyledTokenPanelBalanceAndMax = styled(Styles.StyledRowFlex)({
  width: "auto",
  alignItems: "center",
});
export const StyledTokenPanelBottom = styled(Styles.StyledRowFlex)({
  justifyContent: "space-between",
});

export const StyledInputAndSelect = styled(Styles.StyledRowFlex)({});

export const StyledTokenPanelInput = styled(Components.TokenPanelInput)({
  width: "100%",
  ".twap-loader": {
    left: "auto",
    right: 0,
  },
  input: {
    textAlign: "right",
    fontSize: 24,
  },
});
export const StyledMarketPrice = styled(Components.MarketPrice)({
  ".title": {
    fontSize: 12,
    color: "rgb(204, 204, 204)",
    fontWeight: 600,
  },
  svg: {
    width: 15,
    height: 15,
  },
  [`@media(max-width:${MOBILE}px)`]: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
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
  ".twap-token-logo": {
    width: 40,
    height: 40,
  },
  ".twap-token-name": {
    fontSize: 28,
  },
  svg: {
    width: 15,
    height: 15,
  },
});

export const StyledChangeTokensOrder = styled(Components.ChangeTokensOrder)(({ theme }) => {
  return {
    height: 0,
    zIndex: 1,
    button: {
      transition: "0s all",
      boxShadow: "rgba(14, 14, 44, 0.4) 0px -1px 0px 0px inset",
      background: "linear-gradient(rgb(1, 84, 254), rgb(55, 192, 223))",
      border: `1px solid rgb(204, 204, 204)`,
      borderRadius: 8,
      width: 40,
      height: 40,
      color: "rgb(204, 204, 204)",
      ".MuiTouchRipple-root": {
        display: "none",
      },
      svg: {
        width: 18,
        height: 18,
        "*": {
          color: "black!important",
        },
      },
      "&:hover": {
        background: "black",
        svg: {
          "*": {
            color: "white!important",
          },
        },
      },
    },
  };
});

export const StyledTradeSize = styled(Components.Base.Card)({});

export const StyledPriceCard = styled(Components.Base.Card)({});

export const StyledOrdersPanel = styled(OrdersPanel)(({ theme }) => {
  const styles = baseStyles(theme);
  return {
    fontFamily: "Alegreya Sans",
    ".twap-order": {
      ".twap-order-expanded-row": {
        flexDirection: "column",
        alignItems: "flex-start",
      },
      ".twap-order-progress": {
        height: 4,
        background: `white!important`,
        ".MuiLinearProgress-bar": {
          height: 4,
          background: `linear-gradient(to top, rgb(1, 84, 254), rgb(55, 192, 223))!important`,
        },
        "&:after": {
          display: "none",
        },
      },
    },
    ".twap-cancel-order": {
      ...buttonStyles(theme),
      fontWeight: 400,
      fontSize: 16,
      padding: "5px 15px",
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
      borderRadius: 12,
      ".Mui-selected": {
        background: "linear-gradient(to top, rgb(1, 84, 254), rgb(55, 192, 223))",
        color: styles.textColor,
        borderRadius: 8,
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

export const StyledOrderSummaryModal = styled(Components.OrderSummaryModalContainer)(({ theme }) => ({
  ".twap-modal-content": {
    a: {
      color: baseStyles(theme).textColor,
    },
    ".twap-order-summary-details-item-right": {
      p: {
        fontSize: 14,
      },
    },
  },
}));

export const configureStyles = (theme: Theme) => {
  const styles = baseStyles(theme);
  const darkMode = isDark(theme);
  return {
    ".twap-usd": {
      fontSize: 12,
      "*": {
        color: "#ccc!important",
      },
    },
    ".twap-order-expanded-cancel-wraper": {
      marginTop: 30,
      marginBottom: 30,
    },
    ".twap-submit": {
      marginLeft: "auto",
      marginRight: "auto",
      width: "100%",
      minHeight: 50,
      height: "auto",
      padding: "5px 15px",
      "*": {
        letterSpacing: "0.03em",
        fontWeight: 500,
        fontSize: 16,
      },
    },
    ".twap-button": {
      ...buttonStyles(theme),
    },
    ".twap-ui-close": {
      "*": {
        color: styles.textColor,
      },
    },
    ".twap-modal": {
      color: styles.textColor,
      fontFamily: "Alegreya Sans",
      ".twap-modal-content": {
        background: styles.mainBackground,
        padding: 20,
        border: `2px solid white`,
        borderRadius: 12,
        overflowY: "auto",
      },
      ".twap-spinner": {
        color: styles.button,
      },
      "*": {
        "&::-webkit-scrollbar": {
          display: "none",
        },
      },
    },
    ".twap-card": {
      border: "1px solid rgb(55, 192, 223)",
      background: styles.cardBackground,
      padding: "8px",
      borderRadius: 12,
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
        fontFamily: "Alegreya Sans",
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
    },
    ".twap-time-selector": {
      ".twap-time-selector-selected": {
        padding: ".5rem",
        border: darkMode ? "1px solid white" : "1px solid rgba(0,0,0,0.5)",
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
      fontFamily: "Alegreya Sans",
      "*": {
        color: styles.textColor,
        fontFamily: "Alegreya Sans",
        "&::-webkit-scrollbar": {
          display: "none",
        },
      },
    },
    ".twap-slider": {
      marginLeft: "10px!important",
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
        background: "linear-gradient(rgb(1, 84, 254), rgb(55, 192, 223))",
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
    ".twap-odnp-link": {
      padding: "10px 20px!important",
      minHeight: 40,
      "&:hover": {
        color: styles.textColor,
      },
    },
    ".twap-odnp-separator": {
      background: `${styles.textColor}!important`,
    },
    ".twap-odnp-button": {
      height: 32,
      background: styles.button,
      borderRadius: 8,
      fontWeight: 500,
      padding: "0px 8px!important",
      border: "1px solid transparent",
      transition: "0.2s all",
      "&:hover": {
        border: "1px solid white",
        background: "transparent",
      },
    },

    ".twap-button-disabled": {
      border: `1px solid ${styles.button}!important`,
      cursor: "not-allowed!important",
      background: styles.mainBackground,
      opacity: "1!important",
      transition: "0s all!important",
      "*": {
        color: styles.button,
        textTransform: "uppercase",
      },
      "&:hover": {
        border: `1px solid white!important`,
        "*": {
          color: "white",
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

export const StyledReset = styled("div")(({ theme }) => {
  const styles = baseStyles(theme);
  return {
    border: "1px solid #fff",
    padding: "0px 10px",
    borderRadius: 12,
    cursor: "pointer",
    color: styles.textColor,
    p: {
      fontSize: 13,
    },
    svg: {
      width: 12,
      height: 12,
      path: {
        stroke: styles.iconsColor,
      },
    },
    "&:hover": {
      opacity: 0.8,
    },
  };
});

export const StyledSubmitContainer = styled("div")({
  width: "100%",
  button: {
    width: "100%",
    boxShadow: "none!important",
    border: "unset!important",
  },
});
