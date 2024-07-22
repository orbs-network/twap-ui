import { Components, Styles } from "@orbs-network/twap-ui";
import { DefaultTheme, styled } from "styled-components";

export const lightTheme = {
  palette: {
    mode: "light",
  },

  typography: {
    fontFamily: "inherit",
  },
};
const isDark = (theme: DefaultTheme) => theme.palette.mode === "dark";

export const darkTheme = {
  palette: {
    mode: "dark",
  },
  typography: {
    fontFamily: "inherit",
  },
};

const lightStyles = {
  gradient: "linear-gradient(to right,rgba(59,130,246,.15),rgba(236,72,153,.15))",
  textMain: "rgba(0,0,0, 0.8)",
  modalBackground: "#F4F5F6",
  card: "#F4F5F6",
  disabledCard: "#F4F5F6",
  backdrop: "rgba(255,255,255,.4)",
  switchTrack: "rgba(0,0,0, 0.3)",
};

const darkStyles = {
  gradient: "linear-gradient(to right,rgba(59,130,246,.15),rgba(236,72,153,.15))",
  textMain: "#BFBFBF",
  modalBackground: "#151515",
  card: "rgba(8,8,8,1)",
  disabledCard: "rgba(8,8,8,0.5)",
  backdrop: "rgba(0, 0, 0, 0.424)",
  switchTrack: "hsla(0,0%,100%,.3)",
};

const baseStyles = (theme: DefaultTheme) => (isDark(theme) ? darkStyles : lightStyles);

export const StyledChunkSize = styled(Components.Base.Card)({
  ".twap-token-logo": {
    width: 30,
    height: 30,
  },
  ".twap-chunks-size-usd": {
    "*": {
      fontSize: 14,
    },
  },
});

export const StyledPanelRight = styled(Styles.StyledColumnFlex)<{ isSrcToken: number }>(({ isSrcToken, theme }) => {
  const styles = baseStyles(theme);
  return {
    width: "100%",
    ".twap-input": {
      width: "100%",
      background: isSrcToken ? styles.card : styles.disabledCard,
      cursor: isSrcToken ? "auto" : "not-allowed",
      padding: 10,
      minHeight: 60,
      borderRadius: 10,
      height: "100%",
      input: {
        paddingTop: 4,
        height: "100%",
        fontSize: 25.6,
        fontWeight: 600,
      },
    },
  };
});

export const StyledBalanceAndUSD = styled(Styles.StyledRowFlex)({
  width: "100%",
  justifyContent: "space-between",
  "*": {
    color: "rgba(87,87,87,1)",
    fontSize: 12,
  },
  ".twap-usd": {
    paddingLeft: 5,
  },
});

export const StyledUSD = styled(Components.TokenUSD)({
  maxWidth: "unset",
});

export const StyledBalance = styled(Components.TokenBalance)({
  maxWidth: "unset",
  paddingRight: 5,
});

export const StyledTop = styled(Styles.StyledColumnFlex)({
  gap: 20,
  padding: "0px 30px 0px 20px",
  marginBottom: 20,
});

export const StyledTokenChange = styled(Components.ChangeTokensOrder)(({ theme }) => {
  const isDarkTheme = isDark(theme);
  return {
    justifyContent: "flex-start",
    button: {
      background: isDarkTheme ? "rgba(16,16,16,1)" : "rgb(243 244 246/1)",
      width: 62,
      height: 62,
      borderRadius: "50%",
      border: "2px solid black",
      "&:hover": {
        background: isDarkTheme ? "rgba(16,16,16,1)" : "rgb(243 244 246/1)",
      },
    },
    svg: {
      width: 27,
      height: 27,
      fill: "white",
    },
  };
});

export const StyledContainer = styled(Styles.StyledColumnFlex)({
  gap: 15,
});

export const StyledTokenPanel = styled(Styles.StyledRowFlex)({
  justifyContent: "space-between",
});

export const StyledColumnFlex = styled(Styles.StyledColumnFlex)({
  gap: 12,
});

export const StyledSubmit = styled(Components.SubmitButton)({});

export const StyledPoweredBy = styled(Components.PoweredBy)({
  marginTop: 20,
});

export const StyledTokenSelect = styled(Styles.StyledRowFlex)({
  alignItems: "center",
  width: "auto",
  gap: 10,
  "*": {
    whiteSpace: "nowrap",
  },
  ".twap-token-name": {
    fontSize: 25.6,
    fontWeight: 600,
  },
  ".twap-token-select-text": {
    fontSize: 24,
    fontWeight: 700,
  },
  ".twap-token-logo": {
    width: "54px!important",
    height: "54px!important",
  },
  ".twap-token-svg": {
    width: "55px!important",
    height: "55px!important",
  },
  cursor: "pointer",
  ".twap-token-select-title": {
    fontSize: 12,
    color: "rgba(87,87,87,1)",
  },
  ".twap-token-select-icon": {
    width: 23,
    height: 23,
  },
});

export const StyledAdapter = styled("div")(({ theme }) => {
  const styles = baseStyles(theme);

  return {
    ".MuiSlider-valueLabel": {
      backgroundColor: "#2D3545",
      fontSize: 15,
    },
    "*": {
      color: styles.textMain,
    },
    ".MuiSlider-thumb ": {
      background: "rgb(59 130 246/1)",
    },
    ".MuiSlider-track": {
      background: "rgb(59 130 246/1)",
      border: "1px solid rgb(59 130 246/1)",
    },
    ".twap-button-disabled": {
      pointer: "unset",
      background: "rgba(21,21,21,0.8)!important",
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
      background: "#151519",
      border: "1px solid rgba(191,191,191,1)",
    },
    ".twap-time-selector-list-item": {
      "&:hover": {
        background: "rgba(255,255,255,0.03)",
      },
    },
  };
});

const buttonStyles = {
  borderRadius: 12,
  background: "#e2107b",
  minHeight: 52,
  fontWeight: 500,
  fontSize: 16,
  lineHeight: "24px",
  padding: 10,
  color: "white",
  "*, p": {
    fontWeight: "inherit",
    fontSize: "inherit",
    lineHeight: "inherit",
    color: "white!important",
  },
};

export const configureStyles = (theme: DefaultTheme) => {
  const styles = baseStyles(theme);
  const isDarkMode = isDark(theme);
  return {
    ".twap-odnp-button": {
      ...buttonStyles,
      border: "unset",
      minHeight: "unset",
      p: {
        fontWeight: "600!important",
      },
    },
    ".twap-button": {
      ...buttonStyles,
    },
    ".twap-modal-content": {
      padding: "56px 16px 16px 16px",
      background: `${styles.modalBackground}!important`,
      border: "1px solid rgb(0, 0, 0)",
      boxShadow: "rgba(0, 0, 0, 0.05) 0px 4px 8px 0px",
      maxHeight: "90vh",
      overflowY: "auto",
      width: "calc(100vw - 40px)",
      borderRadius: 16,
      color: styles.textMain,
      ".twap-ui-close": {
        color: styles.textMain,
      },
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
      background: isDarkMode ? "#080808" : "#F4F5F6",
      padding: 12,
      borderRadius: 12,
      border: isDarkMode ? "3px solid rgba(16,16,16,1)" : "unset",
    },

    ".MuiBackdrop-root": {
      background: styles.backdrop,
      backdropFilter: "blur(10px) saturate(190%) contrast(70%) brightness(80%)",
    },
    ".twap-time-selector": {
      ".twap-input": {
        input: {
          height: 40,
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
      background: styles.gradient,
    },
    ".MuiSwitch-track": {
      background: `${styles.switchTrack}!important`,
      height: 20,
    },
    ".twap-disclaimer-switch": {
      p: {
        fontSize: 15,
        fontWeight: 500,
      },
    },
    ".Mui-checked+.MuiSwitch-track": {
      background: "#6034b1!important",
      opacity: "1!important",
    },

    ".twap-tooltip": {
      "& .MuiTooltip-tooltip": {
        backgroundColor: isDarkMode ? "#151519" : "#F9F9FA",
        borderRadius: "8px",
        fontSize: 14,
        padding: 10,
        fontFamily: "Inter",
        fontWeight: 400,
        color: isDarkMode ? "rgba(191,191,191,1)" : "rgb(107 114 128/1)",
        lineHeight: "20px",
        border: "1px solid rgba(191,191,191,1)",
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
