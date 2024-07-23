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

const baseStyles = (theme: DefaultTheme) => {
  const darkMode = isDark(theme);
  return {
    iconsColor: "rgb(140, 140, 227)",
    textColor: darkMode ? "rgba(255, 255, 255, 0.6)" : "rgb(77, 103, 147)",
    lighterTextColor: darkMode ? "rgba(255, 255, 255, 0.87)" : "rgb(49, 65, 94)",
    tooltipBackground: darkMode ? "rgb(30, 29, 45)" : "#D8DEEA",
    tooltipTextColor: darkMode ? "rgba(255, 255, 255, 0.6)" : "rgb(77, 103, 147)",
    spinnerColor: darkMode ? "white" : "rgb(77, 103, 147)",
    containerBackground: darkMode ? "#192239" : "rgb(242, 244, 248)",
    cardBackground: darkMode ? "rgb(18, 17, 34)" : "rgb(228, 233, 241)",
    progressBarColor: darkMode ? "rgb(140, 140, 227)" : "rgb(102, 101, 221)",
    progressBarTrackColor: darkMode ? "#373E55" : "#D8DEEA",
    orderHistorySelectedTabBackground: darkMode ? "rgb(115, 204, 231)" : "rgb(46, 179, 220)",
    orderHistoryTabColor: darkMode ? "white" : "rgb(102, 101, 221)",
    orderHistorySelectedTabColor: darkMode ? "rgb(18, 17, 34)" : "white",
    buttonBackground: darkMode ? "rgb(115, 204, 231)" : "rgb(242, 244, 248)",
    buttonColor: darkMode ? "rgb(18, 17, 34)" : "rgb(49, 65, 94)",
    disabledButtonBackground: darkMode ? "rgba(255, 255, 255, 0.09)" : "rgb(242, 244, 248)",
    selectTokenBackground: darkMode ? "rgba(255, 255, 255, 0.05)" : "rgb(242, 244, 248)",
    selectedTokenBackground: darkMode ? "rgba(255, 255, 255, 0.87)" : "rgb(242, 244, 248)",
    skeletonLoaderBackground: darkMode ? "rgba(255, 255, 255, 0.05)" : "rgb(0, 0, 0, 0.1)",
  };
};

export const StyledTokenBalance = styled(Styles.StyledRowFlex)(({ theme }) => ({
  justifyContent: "space-between",
  width: "100%",
  position: "relative" as const,
  paddingTop: 5,
  "&:after": {
    content: '""',
    position: "absolute" as const,
    left: "50%",
    transform: "translate(-50%)",
    top: 0,
    width: "calc(100% + 15px)",
    height: 1,
    background: isDark(theme) ? "rgba(255, 255, 255, 0.05)" : "rgb(188, 200, 220)",
  },

  ".twap-balance": {
    fontSize: 14,
    maxWidth: "unset",
    justifyContent: "space-between",

    p: {
      width: "100%",
      display: "flex",
      justifyContent: "space-between",
    },
    span: {
      marginRight: 5,
    },
  },
}));

export const StyledPercentSelector = styled(Styles.StyledRowFlex)(({ theme }) => ({
  width: "fit-content",
  gap: 14,
  button: {
    background: "unset",
    border: "unset",
    color: baseStyles(theme).iconsColor,
    fontSize: 14,
    fontWeight: 700,
    padding: 0,
    cursor: "pointer",
  },
}));

export const StyledTokenPanel = styled(Components.Base.Card)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: 7,
  ".twap-usd": {
    maxWidth: "unset",
    textAlign: "left" as const,
    "*": {
      color: baseStyles(theme).lighterTextColor,
    },
  },
  ".twap-panel-title": {
    p: {
      fontSize: 14,
      fontWeight: 700,
    },
  },
  ".twap-input": {
    width: "100%",
    ".twap-loader": {
      left: "unset",
      right: 0,
    },
    input: {
      padding: 0,
      height: 35,
      fontSize: 18,
      textAlign: "right" as const,
    },
  },
}));

const getButtonStyles = (theme: DefaultTheme) => {
  const styles = baseStyles(theme);
  const darkMode = isDark(theme);
  return {
    height: 30,
    borderRadius: 60,
    background: styles.buttonBackground,
    color: `${styles.buttonColor}!important`,
    width: "fit-content!important",
    padding: "0px 16px",

    boxShadow: darkMode ? "unset" : "rgb(49 65 94 / 8%) 0px 10px 17px, rgb(49 65 94 / 4%) 0px 5px 26px",
    border: darkMode ? "1.75px solid transparent!important" : "1.75px solid rgb(49, 65, 94)!important",

    "& *": {
      color: "inherit",
      fontWeight: "700",
      fontSize: 14,
    },
    "&:hover": {
      boxShadow: "unset",
    },
  };
};

export const StyledTokenSelect = styled("div")(({ theme }) => {
  const darkMode = isDark(theme);
  const styles = baseStyles(theme);
  return {
    ".twap-token-select": {
      boxShadow: darkMode ? "unset" : "rgb(49 65 94 / 8%) 0px 10px 17px, rgb(49 65 94 / 4%) 0px 5px 26px",
      background: darkMode ? "rgba(255, 255, 255, 0.05)" : "rgb(242, 244, 248)",
      border: "unset",
      padding: "0px 20px 0px 6px",
      borderRadius: 60,
      height: 32,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: 5,
    },
    ".twap-token-selected": {
      "& .twap-token-name": {
        fontSize: 16,
        color: styles.lighterTextColor,
        fontWeight: 700,
      },
      "& .twap-token-logo": {
        width: 24,
        height: 24,
      },
    },
    ".twap-token-not-selected": {
      paddingLeft: 14,
      paddingRight: 14,
      p: {
        fontSize: 14,
      },
    },
  };
});

export const StyledChangeTokensOrder = styled(Components.ChangeTokensOrder)({
  "& button": {
    width: 28,
    height: 28,
    background: "rgba(255, 255, 255, 0.05)",
    border: "unset",
    padding: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 50,
    cursor: "pointer",
    transition: "0.2s all",
    "&:hover": {
      background: "rgba(255, 255, 255, 0.03)",
    },
  },
});

export const StyledTradeSize = styled(Components.Base.Card)({
  ".twap-token-logo": {
    width: 20,
    height: 20,
  },
  ".twap-token-name": {
    fontSize: 14,
  },
  ".twap-input": {
    input: {
      height: 30,
      textAlign: "right",
    },
  },
  ".twap-chunks-size": {
    ".twap-label": {
      fontSize: 13,
      fontWeight: 400,
    },
  },
});

export const StyledPriceCard = styled(Components.Base.Card)({
  ".twap-radio": {
    // marginLeft: -4,
    svg: { width: 16, height: 16 },
    ".MuiRadio-root": {
      padding: 7,
    },
    ".MuiFormControlLabel-label": {
      fontSize: 14,
    },
  },
});

export const configureStyles = (theme: DefaultTheme) => {
  const styles = baseStyles(theme);
  const darkMode = isDark(theme);
  return {
    ".twap-modal": {
      color: styles.textColor,
      "*": {
        fontFamily: "Red Hat Display",
      },
      ".twap-modal-content": {
        fontFamily: "Red Hat Display",
        background: styles.containerBackground,
        overflow: "auto",
        borderRadius: "10px",
        padding: 35,
        a: {
          color: styles.textColor,
        },
        ".twap-ui-close": {
          svg: {
            color: styles.iconsColor,
          },
        },
      },
    },
    ".twap-card": {
      minHeight: 50,
      padding: "8px 14px",
      paddingBottom: 5,
      background: styles.cardBackground,
      borderRadius: "8px",
      boxShadow: darkMode ? "unset" : "rgb(49 65 94 / 8%) 0px 2px 4px inset, rgb(49 65 94 / 4%) 0px 4px 8px inset",
    },
    ".twap-label": {
      fontWeight: "bold",
      p: {
        fontWeight: "inherit",
        fontSize: 14,
      },
    },
    ".twap-order-summary": {
      padding: 30,
    },
    ".twap-market-price": {
      position: "relative" as const,
      borderRadius: "0px 0px 5px 5px",
      paddingTop: 5,
      ".title": {
        fontSize: 13,
      },
      "&:after": {
        content: '""',
        position: "absolute" as const,
        left: "50%",
        transform: "translate(-50%)",
        top: 0,
        width: "calc(100% + 20px)",
        height: 1,
        background: darkMode ? "rgba(255, 255, 255, 0.05)" : "rgb(188, 200, 220)",
      },
    },
    ".twap-icon": {
      "& *": {
        color: `${styles.iconsColor}!important`,
      },
    },
    ".twap-tooltip": {
      "& .MuiTooltip-tooltip": {
        backgroundColor: styles.tooltipBackground,
        borderRadius: "4px",
        color: styles.tooltipTextColor,
        fontSize: 14,
        fontFamily: "Red Hat Display",
        lineHeight: 1.5,
        padding: 10,
        "& *": {
          color: styles.tooltipTextColor,
          fontSize: 14,
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
        border: darkMode ? "1px solid rgba(255,255,255,0.87)" : "1px solid rgba(0,0,0,0.5)",
        marginBottom: "5px",
        borderRadius: "8px",
      },
      ".twap-input": {
        input: {
          fontSize: 16,
          "&::placeholder": {
            color: styles.textColor,
          },
        },
      },
    },
    ".twap-time-selector-list": {
      background: styles.containerBackground,
      border: darkMode ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)",
      right: 0,
      ".twap-time-selector-list-item": {
        "&:hover": {
          background: darkMode ? "rgba(255,255,255, 0.03)" : "rgba(0,0,0, 0.03)",
        },
      },
    },

    ".twap-container": {
      width: "100%",
      display: "flex",
      flexDirection: "column" as const,
      gap: 15,
      marginTop: 20,
      "*": {
        color: styles.textColor,
        fontFamily: "Red Hat Display",
        "&::-webkit-scrollbar": {
          display: "none",
        },
      },
    },
    ".twap-small-label": {
      fontSize: 14,
      opacity: 1,
    },
    ".twap-slider": {
      "& .MuiSlider-valueLabel": {
        background: styles.tooltipBackground,
      },
      "& .MuiSlider-valueLabelLabel": {
        color: styles.tooltipTextColor,
      },
      "& .MuiSlider-track": {
        color: styles.buttonBackground,
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
        background: `${styles.containerBackground}!important`,
        opacity: "1!important",
      },
      "& .Mui-checked+.MuiSwitch-track": {
        backgroundColor: `${styles.containerBackground}!important`,
        opacity: "1!important",
      },
      "& .Mui-checked .MuiSwitch-thumb": {
        background: styles.iconsColor,
      },
    },

    ".twap-input": {
      input: {
        fontFamily: "inherit",
        fontSize: 18,
        fontWeight: 500,
        outline: "1px solid transparent",
        transition: "0.2s all",
        color: styles.lighterTextColor,
        "&::placeholder": {
          color: styles.textColor,
          opacity: 0.8,
        },
      },
    },
    ".twap-button": {
      ...getButtonStyles(theme),
    },
    ".twap-submit": {
      minWidth: 180,
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
      boxShadow: darkMode ? "unset" : "rgb(49 65 94 / 8%) 0px 10px 17px, rgb(49 65 94 / 4%) 0px 5px 26px",
      background: darkMode ? "rgba(255, 255, 255, 0.05)" : "rgb(242, 244, 248)",
      borderRadius: 14,
      fontWeight: 500,
    },

    ".twap-button-disabled": {
      background: styles.disabledButtonBackground,
      color: styles.lighterTextColor,
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
      ".twap-market-price": {
        display: "flex",
        flexDirection: "column",
      },
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
