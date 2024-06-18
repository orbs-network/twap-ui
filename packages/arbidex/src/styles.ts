import { Box, createTheme, keyframes, styled, Theme } from "@mui/material";
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
    mainBackground: "#08001E",
    button: "#08001E",
    buttonColor: darkMode ? "rgb(18, 17, 34)" : "rgb(49, 65, 94)",
    iconsColor: "white",
    textColor: darkMode ? "white" : "rgb(77, 103, 147)",
    tooltipBackground: darkMode ? "black" : "#D8DEEA",
    tooltipTextColor: darkMode ? "white" : "rgb(77, 103, 147)",
    spinnerColor: darkMode ? "white" : "rgb(77, 103, 147)",
    cardBackground: darkMode ? "rgba(5, 28, 44, 0.8)" : "rgb(228, 233, 241)",
    progressBarColor: darkMode ? "rgb(140, 140, 227)" : "rgb(102, 101, 221)",
    progressBarTrackColor: darkMode ? "#373E55" : "#D8DEEA",
    selectTokenBackground: darkMode ? "rgba(255, 255, 255, 0.05)" : "rgb(242, 244, 248)",
    selectedTokenBackground: darkMode ? "rgba(255, 255, 255, 0.87)" : "rgb(242, 244, 248)",
    skeletonLoaderBackground: darkMode ? "rgba(255, 255, 255, 0.2)" : "rgb(0, 0, 0, 0.1)",
  };
};

const glow = keyframes`
 0% { background-position: 0 0; }
 50% { background-position: 400% 0; }
 100% { background-position: 0 0; }
}
`;

const buttonStyles = (theme: Theme) => {
  const styles = baseStyles(theme);
  return {
    transition: "0s all",
    position: "relative",
    boxShadow: "rgba(14, 14, 44, 0.4) 0px -1px 0px 0px inset",
    color: styles.textColor,
    padding: "0px 5px",
    background: "transparent",
    border: "0.5px solid white!important",
    cursor: "pointer",
    textTransform: "uppercase",
    letterSpacing: 3,
    fontWeight: 500,
    fontSize: 16,
    borderRadius: 8,
    ".twap-button-loader": {
      zIndex: 1,
      transform: "translate(-50%,-50%) scale(0.5)",
      zoom: "unset!important",
    },
    ".twap-button-children": {
      zIndex: 1,
      position: "relative",
    },
    "&:active": {
      "&:after": {
        opacity: 0,
      },
    },
    "&:hover": {
      transform: "translateY(1px)",
    },
    "&:before": {
      content: "''",
      position: "absolute",
      width: "calc(100% + 4px)",
      height: "calc(100% + 4px)",
      left: "50%",
      top: "50%",
      transform: "translate(-50%,-50%)",
      background: "linear-gradient(45deg,#f86c0d,red,#ec38bc,#7303c0,#f86c0d)",
      borderRadius: 8,
      animation: `${glow} 30s linear infinite`,
      transition: "opacity .3s ease-in-out",
      filter: "blur(7px)",
      backgroundSize: "400%",
      // zIndex: -1,
    },
    "&:after": {
      transition: "0.2s all",
      content: "''",
      position: "absolute",
      width: "100%",
      height: "100%",
      background: styles.mainBackground,
      left: 0,
      top: 0,
      borderRadius: 8,
      // zIndex: -1,
    },
  };
};

export const StyledMaxButton = styled("div")(({ theme }) => ({
  ...(buttonStyles(theme) as any),
  color: baseStyles(theme).mainBackground,
}));

export const StyledTopGrid = styled(Styles.StyledColumnFlex)({
  gap: 24,
});
export const StyledTokenBalance = styled(Components.TokenBalance)({
  "*": {
    fontSize: 14,
    fontWeight: 400,
    textTransform: "uppercase",
  },
});

export const StyledTokenPanel = styled(Components.Base.Card)({});

export const StyledTokenPanelInput = styled(Components.TokenInput)({
  width: "100%",
  ".twap-loader": {},
  input: {
    textAlign: "left",
    fontSize: 28,
  },
});
export const StyledMarketPrice = styled(Components.MarketPrice)({
  padding: "0px 12px",
  ".title": {
    fontSize: 12,
    fontWeight: 600,
  },
  [`@media(max-width:${MOBILE}px)`]: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
});

// const getButtonStyles = (theme: Theme) => {};
export const StyledTokenInputContainer = styled(Styles.StyledColumnFlex)(({ theme }) => ({
  border: "3px solid white",
  padding: 16,
  background: baseStyles(theme).cardBackground,
}));

export const StyledTokenSelect = styled(Box)({
  marginRight: 10,
  ".twap-token-logo": {
    width: 48,
    height: 48,
    boxShadow: "rgb(255, 255, 255) 1px 0px 4px",
  },
  ".twap-token-display": {
    gap: 14,
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
      ...buttonStyles(theme),
      boxShadow: "rgb(216, 250, 241) 0px 0px 4px",
      border: "unset",
      width: 40,
      height: 35,
      padding: 0,
      ".MuiTouchRipple-root": {
        display: "none",
      },
      ".twap-icon": {
        width: "100%",
        height: "100%",
        borderRadius: 8,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      },
      svg: {
        width: 15,
        height: 15,
        color: styles.textColor,
        position: "relative",
        zIndex: 1,
      },
      "&:hover": {
        transform: "translateY(1px)",
        ".twap-icon": {
          boxShadow: "rgb(0, 0, 0) 0px 0px 12px inset, rgb(216, 250, 241) 0px 0px 12px",
        },
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
    fontFamily: "Quicksand",
    ".twap-order": {
      "@media(max-width:1200px)": {
        ".twap-market-price-section": {
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 5,
        },
        ".twap-order-expanded-row": {
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 5,
        },
      },
    },
    ".twap-cancel-order": {
      ...buttonStyles(theme),
      fontWeight: 400,
      fontSize: 16,
      padding: "10px 20px",
    },
    ".twap-market-price-section": {
      ".twap-label": {
        fontSize: 14,
      },
    },
    color: styles.textColor,
    ".twap-orders-header-tabs": {
      background: "black",
      border: "1px solid white",
      minHeight: 40,
      button: {
        minHeight: 40,
        fontSize: 14,
      },
      ".Mui-selected": {
        position: "relative",
        fontWeight: 600,
        color: "white",
        "&:before": {
          background: "linear-gradient(90deg,#f86c0d,#33f,#7303c0,#f86c0d)",
          filter: "blur(2px)",
          content: "''",
          position: "absolute",
          width: "100%",
          height: "100%",
          animation: `${glow} 60s linear infinite`,
          transition: "opacity 1s ease-in-out",
          left: 0,
          top: 0,
          backgroundSize: "400%",
          borderRadius: 8,
          zIndex: -1,
        },
      },
      ".MuiTabs-indicator": {
        display: "none",
      },
      ".MuiTouchRipple-root": {
        display: "none",
      },
      "@media(max-width:1200px)": {
        button: {
          fontSize: 12,
        },
      },
    },
  };
});

export const StyledOrderSummaryModal = styled(Components.OrderSummaryModalContainer)(({ theme }) => ({
  ".twap-modal-content": {
    paddingTop: 50,
    a: {
      color: baseStyles(theme).textColor,
    },
    ".twap-disclaimer-text": {
      p: {
        fontSize: 14,
      },
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
    ".twap-modal": {
      color: styles.textColor,
      fontFamily: "Quicksand",
      ".twap-ui-close": {
        "*": {
          color: `${styles.textColor}`,
        },
      },
      "*": {
        "&::-webkit-scrollbar": {
          display: "none",
        },
      },
      ".twap-modal-content": {
        overflow: "auto",
        borderRadius: 12,
        background: "#000000",
        padding: 20,
        border: "1px solid white",
        boxShadow:
          "rgb(255, 255, 255) 0px 0px 36px, rgb(115, 3, 192) 0px 0px 44px, rgb(255, 255, 255) 0px 0px 48px, rgb(248, 108, 13) 0px 0px 60px, rgb(115, 3, 192) 0px 0px 72px, rgb(255, 255, 255) 0px 0px 96px, rgb(255, 255, 255) 0px -10px 12px",
      },
    },
    ".twap-card": {
      background: styles.cardBackground,
      padding: "15px 20px",
      borderRadius: 12,
      ".twap-label": {
        fontSize: 14,
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
        fontFamily: "Quicksand",
        lineHeight: "normal",
        padding: 16,
        fontWeight: 400,
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
      fontFamily: "Quicksand",
      "*": {
        color: styles.textColor,
        fontFamily: "Quicksand",
        "&::-webkit-scrollbar": {
          display: "none",
        },
      },
    },
    ".twap-slider": {
      height: "5px!important",
      ".MuiSlider-rail": {
        color: styles.button,
        opacity: "1!important",
      },
      "& .MuiSlider-valueLabel": {
        background: styles.tooltipBackground,
      },
      "& .MuiSlider-valueLabelLabel": {
        color: styles.tooltipTextColor,
      },
      "& .MuiSlider-track": {
        color: "white",
        border: "unset",
      },
      "& .MuiSlider-thumb": {
        background: "white",
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
        background: `#1D2635!important`,
        opacity: "1!important",
      },
      "& .Mui-checked+.MuiSwitch-track": {
        backgroundColor: `#FFFFFF!important`,
        opacity: "1!important",
      },
      "& .Mui-checked .MuiSwitch-thumb": {
        background: "#8A8A8A",
      },
    },

    ".twap-input": {
      input: {
        fontFamily: "inherit",
        fontWeight: 500,
        outline: "1px solid transparent",
        transition: "0.2s all",
        color: styles.textColor,
        "&::placeholder": {
          color: styles.textColor,
          opacity: 0.7,
        },
      },
    },

    ".twap-submit": {
      ...buttonStyles(theme),
      minHeight: 40,
      padding: "5px 10px",
      height: "auto",
      maxWidth: "90%",
      marginLeft: "auto",
      marginRight: "auto",
    },
    ".twap-odnp-link": {
      minHeight: 40,
      border: "1px solid white",
      borderRadius: 8,
      color: "white",
    },
    ".twap-odnp-separator": {
      background: `${styles.textColor}!important`,
    },
    ".twap-odnp-button": {
      height: 32,
      ...buttonStyles(theme),
      p: {
        fontSize: "12px!important",
      },
      ".twap-odnp-button-children": {
        position: "relative",
        zIndex: 1,
      },
    },

    ".twap-button-disabled": {
      cursor: "not-allowed!important",
      opacity: "1!important",
      "&:hover": {
        transform: "translateY(0px)",
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
