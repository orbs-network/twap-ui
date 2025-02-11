import { Styles } from "@orbs-network/twap-ui";
import { DefaultTheme, styled, createGlobalStyle } from "styled-components";

type ThemeMode = "lynex-dark" | "ocelex-dark";

export const lynexDark = {
  palette: {
    mode: "lynex-dark" as ThemeMode,
  },
};

export const ocelexDark = {
  palette: {
    mode: "ocelex-dark" as ThemeMode,
  },
};

const getColors = (theme: DefaultTheme) => {
  const isOcelex = theme.palette.mode === "ocelex-dark";
  return {
    success: {
      100: isOcelex ? "hsl(142.5, 61.5%, 94.9%)" : "hsl(142.5, 61.5%, 94.9%)",
      200: isOcelex ? "hsl(144.7, 65.4%, 89.8%)" : "hsl(144.7, 65.4%, 89.8%)",
      300: isOcelex ? "hsl(143.3, 65%, 79.8%)" : "hsl(143.3, 65%, 79.8%)",
      400: isOcelex ? "hsl(144, 64.1%, 69.4%)" : "hsl(144, 64.1%, 69.4%)",
      500: isOcelex ? "hsl(143.5, 64.3%, 59.4%)" : "hsl(143.5, 64.3%, 59.4%)",
      600: isOcelex ? "hsl(143.7, 66.5%, 49.2%)" : "hsl(143.7, 66.5%, 49.2%)",
      700: isOcelex ? "hsl(143.5, 66.2%, 39.4%)" : "hsl(143.5, 66.2%, 39.4%)",
      800: isOcelex ? "hsl(144, 66.7%, 29.4%)" : "hsl(144, 66.7%, 29.4%)",
      900: isOcelex ? "hsl(143.3, 66.3%, 19.8%)" : "hsl(143.3, 66.3%, 19.8%)",
      950: isOcelex ? "hsl(144.7, 68%, 9.8%)" : "hsl(144.7, 68%, 9.8%)",
    },
    primary: {
      100: isOcelex ? "hsl(30, 51.4%, 85.5%)" : "hsl(216, 100%, 95.1%)",
      200: isOcelex ? "hsl(29.2, 55.7%, 72.5%)" : "hsl(66.2, 89.9%, 46.7%)",
      300: isOcelex ? "hsl(29.5, 81.4%, 72.5%)" : "hsl(64.3, 74.8%, 56.5%)",
      400: isOcelex ? "hsl(29.1, 81.3%, 68.6%)" : "hsl(66.2, 89.9%, 46.7%)",
      500: isOcelex ? "hsl(28.9, 73.2%, 56.1%)" : "hsl(64.3, 74.8%, 56.5%)",
      600: isOcelex ? "hsl(28.6, 73.3%, 52.9%)" : "hsl(64.3, 74.8%, 56.5%)",
      700: isOcelex ? "hsl(28.9, 83.6%, 42.9%)" : "hsl(64.3, 74.8%, 56.5%)",
      800: isOcelex ? "hsl(29, 90.5%, 37.3%)" : "hsl(64.3, 74.8%, 56.5%)",
      900: isOcelex ? "hsl(28.9, 91.8%, 23.9%)" : "hsl(0, 0%, 7.8%)",
      950: isOcelex ? "hsl(28.9, 97.6%, 16.3%)" : "hsl(40, 25%, 4.7%)",
    },
    neutral: {
      50: isOcelex ? "hsl(30, 8.3%, 95.3%)" : "hsl(0, 0%, 98%)",
      100: isOcelex ? "hsl(40, 7.7%, 92.4%)" : "hsl(0, 0%, 96.1%)",
      200: isOcelex ? "hsl(40, 7.7%, 84.7%)" : "hsl(0, 0%, 89.8%)",
      300: isOcelex ? "hsl(35, 7.7%, 69.4%)" : "hsl(0, 0%, 83.1%)",
      400: isOcelex ? "hsl(44.2, 8.2%, 54.3%)" : "hsl(0, 0%, 63.9%)",
      500: isOcelex ? "hsl(38.4, 12.6%, 39%)" : "hsl(0, 0%, 45.1%)",
      600: isOcelex ? "hsl(36.8, 25.6%, 23.7%)" : "hsl(0, 0%, 32.2%)",
      700: isOcelex ? "hsl(36, 25.8%, 19%)" : "hsl(0, 0%, 25.1%)",
      800: isOcelex ? "hsl(34.7, 26%, 14.3%)" : "hsl(0, 0%, 18%)",
      900: isOcelex ? "hsl(30, 25%, 9.4%)" : "hsl(0, 0%, 13.7%)",
      950: isOcelex ? "hsl(40, 25%, 4.7%)" : "hsl(0, 0%, 9%)",
    },
    focus: isOcelex ? "hsl(35.9, 92.5%, 68.8%)" : "hsl(214.6, 100%, 50%)",
  };
};

const panelLabelStyles = (theme: DefaultTheme) => {
  const styles = getColors(theme);

  return {
    color: styles.neutral[200],
    fontSize: 14,
    fontWeight: 400,
  };
};

const panelBodyStyles = (theme: DefaultTheme) => {
  const styles = getColors(theme);
  return {
    width: "100%",
    background: "transparent",
    padding: 16,
    height: "100%",
    gap: 0,
    borderRadius: 12,
    color: "white",
    border: `1px solid ${styles.neutral[700]}`,
  };
};

const tokenSelectStyles = (theme: DefaultTheme) => {
  const styles = getColors(theme);
  return {
    display: "flex",
    gap: 8,
    background: styles.neutral[600],
    padding: "0.375rem 0.5rem 0.375rem 0.375rem",
    borderRadius: 9999,
    border: "none",
    cursor: "pointer",
    alignItems: "center",
    transition: "background 0.2s",
    ".twap-token-logo": {
      width: 24,
      height: 24,
    },
    svg: {
      width: "16px!important",
      height: 16,
      color: "#8E8194",
      stroke: {
        color: "#8E8194",
      } as any,
    },
    p: {
      fontSize: 15,
      color: styles.neutral[200],
      fontWeight: 400,
    },
    "&:hover": {
      background: styles.neutral[700],
    },
  };
};

const selectButtons = (theme: DefaultTheme) => {
  const styles = getColors(theme);
  return {
    display: "flex",
    gap: 4,
    marginLeft: "auto",
    button: {
      color: styles.neutral[200],
      background: "transparent",
      border: "none",
      fontSize: 12,
      padding: "0.5rem 0.7rem",
      fontWeight: 500,
      cursor: "pointer",
      transition: "background 0.2s",
      borderRadius: 4,
      "&:hover": {
        color: styles.neutral[100],
        background: styles.neutral[800],
      },
    },
  };
};

const tokenPanelStyles = (theme: DefaultTheme) => {
  const styles = getColors(theme);

  return {
    display: "flex",
    flexDirection: "column" as const,
    gap: 0,
    ".twap-panel-body": {
      gap: 12,
    },

    ".twap-token-panel-balance-buttons": {
      ...selectButtons(theme),
    },

    ".twap-token-panel-bottom": {
      display: "flex",
      justifyContent: "space-between",
      ".twap-token-panel-usd": {
        color: styles.neutral[500],
        fontSize: 14,
      },
      ".twap-token-panel-balance": {
        fontSize: "0.875rem",
        color: styles.neutral[500],
        span: {
          color: styles.neutral[500],
        },
      },
    },
  };
};

const buttonStyles = (theme: DefaultTheme) => {
  const styles = getColors(theme);
  return {
    background: styles.neutral[700],
    color: styles.neutral[100],
    fontWeight: 500,
    width: "100%",
    padding: "12px 16px 12px 16px",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 16
  };
};

const switchTokensStyles = (theme: DefaultTheme) => {
  const styles = getStyles(theme);
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
      background: styles.switchTokensBg,
      borderRadius: 8,
      border: `unset`,
      width: 32,
      height: 32,
      color: styles.textColor,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      cursor: "pointer",
      transition: "background 0.2s",
      svg: {
        width: 18,
        height: 18,
      },
      "&:hover": {
        background: styles.switchTokensBgHover,
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
    ".twap-inputs-panel": {
      justifyContent: "space-between",
      p: {
        color: styles.textColor,
        fontSize: 16,
        fontWeight: 400,
      },
    },
    ".twap-order-modal-failed-logo": {
      color: styles.error,
      width: 60,
      height: 60,
      svg: {
        height: "100%",
        width: "100%",
      },
    },
    ".twap-order-modal-link": {
      color: styles.textColor,
      textDecoration: "none",
    },
    ".twap-order-token-progress-bar": {
      flex: 1,
      height: 4,
      position: "relative",
      background: styles.isDarkMode ? styles.darkText : "rgba(0,0,0,0.1)",
      overflow: "hidden",
      borderRadius: 20,
    },
    ".twap-order-token-progress-bar-filled": {
      position: "absolute",
      left: 0,
      height: "100%",
      background: styles.isDarkMode ? "rgb(36 99 235)" : "rgb(29 64 176 /0.5)",
    },
    ".twap-order-history-list": {
      "&::-webkit-scrollbar": {
        display: "none",
      },
    },
    ".twap-limit-price-message": {
      background: styles.tokenSelectBg,
      color: styles.textColor,
      padding: "12px 16px",
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
        color: styles.textColor,
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
      background: styles.isDarkMode ? styles.color2 : "rgb(191 219 254/0.7)",
      marginBottom: 8,
    },
    ".twap-order-history-header-back-icon": {
      color: styles.textColor,
      position: "relative",
      top: 2,
    },
    ".twap-loader": {
      background: styles.isDarkMode ? "rgba(255,255,255, 0.1)" : "rgba(0,0,0, 0.08)",
    },
    ".twap-orders-list-loader": {
      ".twap-loader": {
        width: "100%",
        height: 70,
        borderRadius: 16,
      },
    },
    ".orbs_Spinner": {
      border: isDarkMode ? "" : `3px solid rgba(0,0,0, 0.7)`,
      borderBottomColor: isDarkMode ? "" : `rgba(0,0,0, 0.2)`,
    },
    ".orbs_MainTokenUsd": {
      color: styles.darkText,
    },
    ".orbs_MainTokenLeft": {
      gap: 4,
    },
    ".orbs_Main-wrapper": {
      width: "100%",
    },
    ".orbs_MainTokenAmount": {
      fontWeight: 400,
    },
    ".orbs_MainTokenLogo": {
      width: 40,
      height: 40,
    },
    ".twap-order-display-token": {
      width: "100%",
    },
    ".orbs_MainTokenTitle": {
      color: styles.textColor,
      fontSize: 14,
      fontWeight: 400,
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
        color: styles.textColor,
        fontWeight: 400,
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
      color: styles.textColor,
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
      ...panelBodyStyles(theme),
      "&-buttons": {
        gap: 5,
      },
      "&-button": {},
      ".twap-label": {
        ...panelLabelStyles(theme),
      },
    },

    ".twap-order-history-button": {
      background: styles.tokenSelectBg,
      borderRadius: 20,
      padding: "12px 16px",
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
      color: styles.textColor,
      "&:hover": {
        background: styles.isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
      },
    },
    ".twap-input": {
      input: {
        fontWeight: 400,
        color: styles.textColor,
        fontSize: "1.25rem",
        "&::placeholder": {
          color: styles.textColor,
          opacity: "0.5!important",
        },
      },
    },
    ".twap-limit-price-panel-title": {
      ".twap-token-select": {
        p: {
          fontSize: 14,
        },
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
      width: "100%",
    },
    ".twap-panel-body": {
      ...panelBodyStyles(theme),
    },
    ".twap-trade-interval-panel, .twap-trades-amount-panel": {
      ".twap-panel-body": {
        paddingTop: 10,
        paddingBottom: 10,
      },
      ".twap-input": {
        input: {
          fontSize: 18,
          color: styles.textColor,
          fontWeight: 400,
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
      ".twap-panel-body": {
        gap: 12,
      },
    },
    ".twap-limit-price-panel-percent": {
      ...selectButtons(theme),
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
      color: styles.textColor,
      padding: 10,
      fontSize: 14,
      gap: 8,
      border: `1px solid ${styles.errorBorder}`,
      borderRadius: 12,

      svg: {
        color: styles.error,
        width: `20px!important`,
        height: 20,
        top: -1,
      },
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
      p: {
        fontSize: 14,
        color: styles.textColor,
        fontWeight: 400,
      },
    },
    ".twap-select-menu-list": {
      background: styles.color2,
      borderRadius: 12,
      padding: 8,
      "&-item": {
        borderRadius: 8,
        color: styles.textColor,
        fontSize: 14,
        padding: "5px 8px 5px 8px",
        fontWeight: 400,
        "&:hover": {
          background: styles.isDarkMode ? "#ffffff0f" : "rgb(239 246 255)",
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
      background: styles.switchHandle,
    },
    ".twap-switch": {
      background: styles.switchBg,
    },
    ".twap-switch-checked": {
      background: styles.switchBgActive,
      ".twap-switch-handle": {
        background: styles.switchHandleActive,
      },
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
  gap: 4,
  "@media(max-width: 1000px)": {
    gap: 4,
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
