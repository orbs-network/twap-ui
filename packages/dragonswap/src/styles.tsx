import { Components, Styles } from "@orbs-network/twap-ui";
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
    darkText: isDarkMode ? "rgb(191 219 254/0.3)" : "rgb(107 114 128/1)",
    darkTextHover: isDarkMode ? "rgb(203 213 225/1)" : "rgb(37 99 235/1)",
    warningText: "rgb(239 68 68/1)",
    textColor: isDarkMode ? "rgb(248 250 252/1)" : "rgb(17 24 39/1)",
    messageText: isDarkMode ? "#94a3b8" : "#6b7280",
    boxHover: isDarkMode ? "rgba(255,255,255, 0.09)" : "rgba(0,0,0, 0.03)",
    cardBg: isDarkMode ? "rgb(13,20,58)" : "rgb(255, 255, 255)",
    label: isDarkMode ? "rgb(191 219 254)" : "rgb(107 114 128/1)",
    inputColor: isDarkMode ? "rgb(239 246 255)" : "rgb(17 24 39/1)",
    errorBorder: isDarkMode ? "rgb(239 68 68)" : "",
    focusBorder: isDarkMode ? "rgb(8 96 219)" : "",
    color2: isDarkMode ? "rgb(36 54 109)" : "rgb(107 114 128/1)",
    error: isDarkMode ? "rgb(239 68 68)" : "rgb(239 68 68)",
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
        color: styles.darkText,
        fontSize: 14,
      },
      ".twap-token-panel-balance": {
        fontSize: 14,
        span: {
          color: styles.darkText,
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

export const GlobalStyles = createGlobalStyle(({ theme }) => {
  const styles = getStyles(theme);
  const isDarkMode = styles.isDarkMode;
  return {
    ".twap-switch-tokens": {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width:'100%',
        height: 0,
        position:'relative',
        button: {
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgb(29 64 176)',
          borderRadius:'50%',
          border:'4px solid rgb(13 20 58)',
          width: 48,
          height: 48,
          color:'white',
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          cursor: "pointer",
          svg: {
            width: 20,
            height: 20,
          }
        }
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
      paddingTop:10,
      paddingBottom: 10,
      ".twap-input": {
        input: {
          fontSize: 18
        }
      }
    },
    ".twap-trades-amount-panel": {
      p: {
        color: styles.darkText,
        textTransform:'lowercase',
        fontWeight: 500,
        fontSize:  14
      }
    },
  
    ".twap-panel-header": {
      marginBottom: 8,
      display: "flex",
      justifyContent: "space-between",
      ".twap-label": {
        color: styles.label,
        fontSize: 14,
        textTransform: "uppercase",
        fontWeight: 500,
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
    ".twap-limit-price-panel-percent-button-selected": {
      ...selectButtonStyles(theme, 1),
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
      textTransform: "capitalize",
     
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
    ".twap-loader": {
      background: isDarkMode ? "rgba(255,255,255,0.1)!important" : "rgba(0,0,0,0.1)!important",
    },

    ".twap-switch-handle": {
      background: isDarkMode ? "rgb(15 23 42/1)" : "rgb(249 250 251/1)",
    },
    ".twap-switch": {
      background: isDarkMode ? "hsla(0,0%,100%,.1)" : "rgba(0,0,0,.1)",
    },
    ".twap-switch-checked": {
      background: "rgb(59 130 246/1)",
      ".twap-switch-handle": {
        background: "white",
      },
    },

    ".twap-orders-header": {
      padding: "0px!important",
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

const selectButtonStyles = (theme?: DefaultTheme, selected?: number) => {
  const styles = getStyles(theme);
  const selectedBg = styles.isDarkMode ? "rgba(255,255,255, 0.15) " : "rgb(59 130 246/1)";
  const selectedColor = styles.isDarkMode ? styles.textColor : "white";
  return {
    background: "transparent",
    color: selected ? styles.focusBorder : styles.textColor,
    fontWeight: 500,
    padding: "5px 7px",
    borderRadius: 8,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 50,
    transition: "0.2s all",
    border: selected ? `1px solid ${styles.focusBorder}` : `1px solid ${styles.isDarkMode ? "rgba(255,255,255, 0.2)" : "transparent"}`,
    height: 28,
    fontSize: 14,
    svg: {
      fill: selectedColor,
    },
    "&:hover": {
      border: `1px solid ${styles.focusBorder}`,
    },
  };
};

export const StyledTop = styled(Styles.StyledColumnFlex)({
  gap: 4,
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
