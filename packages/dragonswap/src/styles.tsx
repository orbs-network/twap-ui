import { Styles } from "@orbs-network/twap-ui";
import { DefaultTheme, styled, createGlobalStyle } from "styled-components";

export const darkTheme = {
  palette: {
    mode: "dark",
  },
};

export const lightTheme = {
  palette: {
    mode: "light",
  },
};

const getStyles = (theme?: DefaultTheme) => {
  const isDarkMode = theme?.palette.mode === "dark" ? 1 : 0;

  return {
    isDarkMode,
    darkText: isDarkMode ? "rgb(191 219 254)" : "rgb(107 114 128/1)",
    darkTextOpacity: isDarkMode ? "rgb(191 219 254/0.3)" : "rgb(107 114 128/1)",
    darkTextHover: isDarkMode ? "rgb(203 213 225/1)" : "rgb(37 99 235/1)",
    warningText: "rgb(239 68 68/1)",
    textColor: isDarkMode ? "rgb(248 250 252/1)" : "rgb(17 24 39/1)",
    messageText: isDarkMode ? "#94a3b8" : "#6b7280",
    boxHover: isDarkMode ? "rgba(255,255,255, 0.09)" : "rgba(0,0,0, 0.03)",
    cardBg: isDarkMode ? "rgb(13,20,58)" : "rgb(255, 255, 255)",
    label: isDarkMode ? "rgb(191 219 254)" : "rgb(107 114 128/1)",
    label2: isDarkMode ? "rgb(146 197 253)" : "rgb(107 114 128/1)",
    inputColor: isDarkMode ? "rgb(239 246 255)" : "rgb(17 24 39/1)",
    errorBorder: isDarkMode ? "rgb(239 68 68)" : "",
    focusBorder: isDarkMode ? "rgb(8 96 219)" : "",
    color2: isDarkMode ? "rgb(36 54 109)" : "rgb(107 114 128/1)",
    error: isDarkMode ? "rgb(239 68 68)" : "rgb(239 68 68)",
  };
};

const panelLabelStyles = (theme?: DefaultTheme) => {
  const styles = getStyles(theme);

  return {
    color: styles.label,
    fontSize: 14,
    textTransform: "uppercase" as const,
    fontWeight: 500,
  };
};

const panelStyles = (theme: DefaultTheme) => {
  const styles = getStyles(theme);
  return {
    width: "100%",
    background: styles.cardBg,
    padding: 16,
    gap: 0,
    borderRadius: 20,
    color: "white",
    border: "2px solid transparent",

    ".twap-message": {
      color: styles.messageText,
      fontSize: 14,
      lineHeight: "20px",
    },
    "&.twap-panel-error": {
      border: `2px solid ${styles.errorBorder}`,
    },
    "&.twap-panel-focused": {
      border: `2px solid ${styles.focusBorder}`,
      transition: "border 0.2s",
    },
  };
};

const tokenSelectStyles = (theme: DefaultTheme) => {
  const styles = getStyles(theme);
  return {
    display: "flex",
    gap: 3,
    background: styles.color2,
    padding: 6,
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    alignItems: "center",
    ".twap-token-logo": {
      width: 16,
      height: 16,
    },
    svg: {
      width: 20,
      height: 20,
      color: "rgb(146 197 253)",
      stroke: {
        color: "rgb(146 197 253)",
      } as any,
      marginLeft: 5,
    },
    p: {
      fontSize: 14,
    },
  };
};

const bigInputStyles = (theme: DefaultTheme) => {
  const styles = getStyles(theme);
  return {
    ".twap-input": {
      input: {
        fontSize: 30,
        fontWeight: 500,
        color: styles.inputColor,
        "&::placeholder": {
          opacity: 0.6,
        },
      },
    },
  };
};

const tokenPanelStyles = (theme: DefaultTheme) => {
  const styles = getStyles(theme);

  return {
    display: "flex",
    flexDirection: "column" as const,
    transition: "0.2s all",
    gap: 0,

    ".twap-panel-balance-buttons": {
      display: "flex",
      gap: 10,
      "&-btn": {
        color: "rgb(36 99 235)",
        background: "transparent",
        border: "none",
        fontSize: 14,
        fontWeight: 500,
        letterSpacing: "0.02em",
        padding: 0,
        cursor: "pointer",
      },
    },
    ...bigInputStyles(theme),

    ".twap-token-panel-bottom": {
      display: "flex",
      justifyContent: "space-between",
      marginTop: 8,
      ".twap-token-panel-usd": {
        color: styles.darkTextOpacity,
        fontSize: 14,
      },
      ".twap-token-panel-balance": {
        fontSize: 14,
        span: {
          color: styles.darkTextOpacity,
        },
      },
    },
  };
};

const buttonStyles = (theme: DefaultTheme) => {
  return {
    background: "radial-gradient(circle, rgba(255, 255, 255, 0.07) 0%, rgb(51, 80, 232) 55%) calc(3.44828%) calc(42.3077%) / 200% 200%, rgb(51, 80, 232)",
    color: "rgb(239 246 255 / 1)",
    fontWeight: 600,
    width: "100%",
    padding: "12px 14px 12px 14px",
    borderRadius: 12,
    cursor: "pointer",
  };
};

const switchTokensStyles = (theme: DefaultTheme) => {
  return {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: 0,
    position: "relative" as const,
    button: {
      position: "absolute" as const,
      left: "50%",
      top: "50%",
      transform: "translate(-50%, -50%)",
      background: "rgb(29 64 176)",
      borderRadius: "50%",
      border: "4px solid rgb(13 20 58)",
      width: 48,
      height: 48,
      color: "white",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      cursor: "pointer",
      svg: {
        width: 20,
        height: 20,
      },
    },
  };
};
const letterSpacing = "0.02em";
const mobile = 700;
export const GlobalStyles = createGlobalStyle(({ theme }) => {
  const styles = getStyles(theme);
  const isDarkMode = styles.isDarkMode;
  return {
    ".twap-order-token-progress-bar": {
      flex: 1,
      height: 4,
      position: "relative",
      background: styles.darkText,
      overflow: "hidden",
      borderRadius: 20,
    },
    ".twap-order-token-progress-bar-filled": {
      position: "absolute",
      left: 0,
      height: "100%",
      background: "rgb(36 99 235)",
    },
    ".twap-order-history-list": {
      "&::-webkit-scrollbar": {
        display: "none",
      },
    },
    ".twap-limit-price-message": {
      background: "#24366D",
      color: styles.textColor,
      padding: 16,
      borderRadius: 20,
      a: {
        color: styles.textColor,
      },
    },
    ".twap-orders-selected-order-bottom": {
      marginTop: 15,
    },
    ".twap-select-menu-list-item": {
      textTransform: "capitalize",
    },
    ".twap-orders-selected-order-details": {
      gap: 8,
      padding: 12,
      paddingTop: 0,
      paddingBottom: 0,
    },
    ".twap-orders-selected-order-details-expanded ": {
      paddingBottom: 12,
    },
    ".twap-order-display-details-row": {
      ".twap-label": {
        color: styles.label2,
        fontWeight: 500,
      },
      "&-right": {
        color: styles.textColor,
      },
    },
    ".twap-order-display": {
      ".twap-token-logo": {
        width: 40,
        height: 40,
      },
    },
    ".twap-order-display-token-title": {
      ...panelLabelStyles(theme),
    },
    ".twap-order-display-token-amount": {
      fontSize: 18,
      fontWeight: 500,
    },
    ".twap-order-display-fill-delay": {
      color: styles.darkText,
    },
    ".twap-order-history-order": {
      background: styles.color2,
      marginBottom: 8,
    },
    ".twap-order-history-header-back-icon": {
      color: styles.textColor,
      position: "relative",
      top: 2,
    },
    ".twap-loader": {
      background: "rgba(255,255,255, 0.1)",
    },
    ".twap-orders-list-loader": {
      ".twap-loader": {
        width: "100%",
        height: 70,
        borderRadius: 16,
      },
    },

    ".orbs_MainTokenLeft": {
      gap: 4,
    },
    ".orbs_Main-wrapper": {
      width: "100%",
    },
    ".orbs_MainTokenLogo": {
      width: 40,
      height: 40,
    },
    ".twap-order-display-token": {
      width: "100%",
    },
    ".orbs_MainTokenTitle": {
      color: styles.label,
      fontSize: 14,
      fontWeight: 500,
      textTransform: "uppercase" as const,
      opacity: 1,
    },
    ".twap-orders-selected-order-summary": {
      padding: 12,
    },

    ".twap-order-display-details": {
      background: styles.color2,
      borderRadius: 8,
      gap: 8,
      ".twap-label": {
        color: "rgb(146 197 253)",
      },
      ".twap-message": {
        background: styles.cardBg,
        letterSpacing,
        fontSize: 14,
        padding: 8,
        borderRadius: 16,
        a: {
          color: styles.textColor,
        },
        svg: {
          width: 15,
          height: 15,
          position: "relative",
          top: 3,
        },
      },
    },
    ".twap-separator": {
      background: "transparent",
      marginTop: 20,
    },
    ".orbs_StepsStep": {
      gap: 7,
    },
    ".orbs_StepsStepLogo": {
      background: styles.color2,
      border: `7px solid ${styles.color2}`,
      "*": {
        opacity: 0.7,
      },
    },

    ".orbs_SwapFlow": {
      ".twap-order-display-details": {
        marginTop: 15,
        marginBottom: 15,
        padding: 12,
      },
      ".twap-order-modal-disclaimer": {
        p: { color: styles.textColor },
        a: {
          color: styles.textColor,
        },
      },
    },
    ".twap-duration-panel": {
      ...panelStyles(theme),
      "&-buttons": {
        gap: 5,
      },
      "&-button": {
        ...selectButtonStyles(theme),
      },
      ".twap-label": {
        ...panelLabelStyles(theme),
      },
    },

    ".twap-order-history-button": {
      background: "#24366D",
      borderRadius: 20,
      padding: 16,
      transition: "0.2s all",
      cursor: "pointer",
      color: styles.textColor,

      svg: {
        marginLeft: "auto",
      },
      "&-text": {
        fontSize: 15,
      },
    },
    ".twap-powered-by": {
      p: {
        color: styles.textColor,
      },
    },
    ".twap-price-switch": {
      display: "flex",
      alignItems: "center",
      gap: 10,
      marginLeft: "auto",

      p: {
        color: styles.textColor,
        fontSize: 14,
        fontWeight: 500,
        textTransform: "uppercase" as const,
      },
    },
    ".twap-limit-price-panel-invert-button": {
      transition: "0.2s all",
      width: 35,
      height: 35,
      borderRadius: "50%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      position: "relative" as const,
      top: -3,
      right: -3,
      "&:hover": {
        background: "rgba(255,255,255,0.1)",
      },
    },
    ".twap-limit-price-panel-title-text": {
      ...panelLabelStyles(theme),
    },
    ".twap-switch-tokens": {
      ...switchTokensStyles(theme),
    },
    ".twap-button": {
      ...buttonStyles(theme),
    },
    ".twap-token-panel": {
      ...tokenPanelStyles(theme),
    },
    ".twap-panel": {
      ...panelStyles(theme),
    },
    ".twap-trade-interval-panel, .twap-trades-amount-panel": {
      paddingTop: 10,
      paddingBottom: 10,
      ".twap-input": {
        input: {
          fontSize: 18,
        },
      },
    },

    ".twap-trades-amount-panel": {
      "&-text": {
        color: styles.darkText,
        textTransform: "lowercase" as const,
        fontWeight: 500,
        fontSize: 14,
      },
    },

    ".twap-panel-header": {
      marginBottom: 8,
      display: "flex",
      justifyContent: "space-between",
      ".twap-label": {
        ...panelLabelStyles(theme),
      },
    },
    ".twap-token-select": {
      ...tokenSelectStyles(theme),
    },
    ".twap-limit-price-panel": {
      ...bigInputStyles(theme),
    },
    ".twap-limit-price-panel-percent": {
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",
      marginLeft: "auto",
    },
    ".twap-limit-price-panel-percent-button": {
      ...selectButtonStyles(theme),
    },
    ".twap-limit-price-panel-percent-reset": {
      gap: 3,
    },
    ".twap-limit-price-panel-percent-reset-button": {
      borderRadius: 0,
      borderTopLeftRadius: 8,
      borderBottomLeftRadius: 8,
    },
    ".twap-limit-price-panel-percent-reset-icon": {
      padding: "0px 7px",
      minWidth: "unset",
      borderRadius: 0,
      borderTopRightRadius: 8,
      borderBottomRightRadius: 8,
    },
    ".twap-message": {
      fontSize: 14,
    },
    ".twap-error-message": {
      color: styles.error,
    },
    ".twap-input-loading": {
      opacity: 0,
    },
    ".twap-widget": {
      width: "100%",
      "*": {
        fontFamily: "inherit",
      },
    },
    ".twap-spinner": {
      borderTop: `3px solid ${styles.textColor}!important`,
      border: !isDarkMode ? "3px solid rgba(0, 0, 0, 0.1)" : `3px solid rgba(255, 255, 255, 0.1)`,
    },

    ".twap-select-menu-button": {
      ...tokenSelectStyles(theme),
      padding: "7px",
      textTransform: "capitalize" as const,
    },
    ".twap-select-menu-list": {
      background: styles.color2,
      borderRadius: 8,
      "&-item": {
        color: styles.textColor,
        fontSize: 14,
        "&:hover": {
          background: styles.isDarkMode ? "#ffffff0f" : "#0000000a",
        },
      },
    },

    ".twap-input": {
      input: {
        color: styles.textColor,
        "&::placeholder": {
          color: isDarkMode ? "white!important" : "rgb(17 24 39/1)!important",
          opacity: 0.4,
        },
      },
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

    ".twap-switch-handle": {
      background: isDarkMode ? "rgb(239 246 255)" : "rgb(249 250 251/1)",
    },
    ".twap-switch": {
      background: isDarkMode ? "rgb(36 99 235/0.6)" : "rgba(0,0,0,.1)",
    },
    ".twap-switch-checked": {
      background: "rgb(36 99 235)",
    },

    [`@media(max-width: ${mobile}px)`]: {
      ".twap-trade-interval-panel": {
        ".twap-select-menu-button p": {
          fontSize: 12,
        },
      },
    },
  };
});

export const StyledContainer = styled(Styles.StyledColumnFlex)({
  gap: 15,
});

export const StyledColumnFlex = styled(Styles.StyledColumnFlex)({
  gap: 16,
});
export const StyledLimitAndInputs = styled(Styles.StyledColumnFlex)(({ theme }) => {
  return {
    gap: 8,
  };
});

const selectButtonStyles = (theme?: DefaultTheme) => {
  const styles = getStyles(theme);

  return {
    color: styles.darkText,
    fontWeight: 500,
    padding: "7px 7px",
    borderRadius: 8,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 50,
    transition: "0.2s all",
    border: "unset",
    fontSize: 14,
    background: "transparent",
    "&:hover": {
      background: styles.color2,
    },
    "&-selected": {
      background: styles.color2,
    },
  };
};

export const StyledTop = styled(Styles.StyledColumnFlex)({
  gap: 8,
  "@media(max-width: 1000px)": {
    gap: 8,
  },
});

export const StyledChunksSelectText = styled(Styles.StyledText)(({ theme }) => {
  const styles = getStyles(theme);
  return {
    color: styles.messageText,
    fontSize: 15,
  };
});

export const StyledTwapInputs = styled(Styles.StyledRowFlex)(({ theme }) => {
  return {
    alignItems: "stretch",
  };
});
