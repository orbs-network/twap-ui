import { Box, styled } from "@mui/system";
import { Components, Styles as TwapStyles, StylesConfig } from "@orbs-network/twap-ui";

interface StylesType extends StylesConfig {}

const mainPadding = 10;
const mainBorderRadius = 8;

const green = "rgb(255, 200, 0)";
// Styles configuration
export const darkModeStylesConfig: StylesType = {
  iconsColor: "rgb(113, 113, 113)",
  textColor: "rgb(113, 113, 113)",
  tooltipBackground: "rgb(17, 17, 17)",
  tooltipTextColor: "rgb(113, 113, 113)",
  spinnerColor: "white",
  containerBackground: "#111111",
  cardBackground: "rgb(28, 28, 28)",
  progressBarColor: green,
  progressBarTrackColor: "rgba(255,255,255, 0.1)",
  orderHistorySelectedTabBackground: green,
  orderHistoryTabColor: "rgb(113, 113, 113)",
  orderHistorySelectedTabColor: "black",
};

export const lightModeStylesConfig: StylesType = {
  iconsColor: "rgb(163, 163, 163)",
  textColor: "rgb(163, 163, 163)",
  tooltipBackground: "rgb(229, 229, 229)",
  tooltipTextColor: "rgb(113, 113, 113)",
  spinnerColor: "white",
  containerBackground: "#F7F8FA",
  cardBackground: "white",
  progressBarColor: green,
  progressBarTrackColor: "rgba(255,255,255, 0.1)",
  orderHistorySelectedTabBackground: green,
  orderHistoryTabColor: "rgb(163, 163, 163)",
  orderHistorySelectedTabColor: "black",
};

export const Text = styled(TwapStyles.StyledText)({});
export const StyledOneLineText = styled(TwapStyles.StyledOneLineText)({});

export const StyledContent = styled(TwapStyles.StyledRowFlex)({
  justifyContent: "space-between",
});

export const StyledSlider = styled(Box)({
  flex: 1,
  paddingLeft: 30,
  paddingRight: 10,
  position: "relative",
  top: 2,
});

export const StyledOrderSummaryContent = styled(Box)({});

export const StyledOrderConfirmation = styled(Box)({
  "& .output-text": {
    textAlign: "center",
    width: "100%",
    fontSize: 15,
  },
});

export const StyledLimitPrice = styled(Box)({
  width: "100%",
  "& .right": {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  "& .twap-token-logo": {
    width: 22,
    height: 22,
  },
});

export const StyledTokenOrder = styled(Box)({ width: "100%" });

export const StyledTrade = styled(TwapStyles.StyledColumnFlex)({
  width: "100%",
  "& .twap-input": {
    textAlign: "left",
    paddingRight: 10,
  },
});

export const StyledDstToken = styled(Box)({
  width: "100%",
});

export const StyledSrcTokenPercentSelector = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 5,
});

export const StyledIntervalTimeSelect = styled(Box)({
  flex: 1,
});

export const StyledTokenDisplay = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 10,
});

export const StyledFlexStart = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  gap: 10,
  width: "100%",
});

export const StyledFlex = styled(Box)(({ gap = 10, justifyContent = "center" }: { gap?: number; justifyContent?: "flex-start" | "flex-end" | "center" }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent,
  width: "100%",
  gap,
}));

export const StyledFlexEnd = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  gap: 10,
  width: "100%",
});

export const StyledTokenPanel = styled(Box)(({ type }: { type: "src" | "dst" }) => ({
  width: "100%",
  "& .twap-card": {
    borderBottomLeftRadius: type === "src" ? mainBorderRadius : 0,
    borderBottomRightRadius: type === "src" ? mainBorderRadius : 0,
  },
  "& .twap-input": {
    textAlign: "left",
  },
  "& .twap-token-logo": {
    width: "24px!important",
    height: "24px!important",
  },
  "& .twap-token-name": {
    fontSize: 20,
  },
}));
export const StyledTradeSize = styled(TwapStyles.StyledRowFlex)({
  flex: 1,
  width: "unset",
  gap: 10,
  justifyContent: "flex-start",
  "& .twap-token-logo": {
    width: 20,
    height: 20,
  },
  "& .twap-token-name": {
    fontSize: 16,
  },
});

export const StyledTotalTradesInput = styled(Components.NumericInput)({
  width: 70,
  flex: "unset!important",
  paddingRight: "unset!important",
  input: {
    height: 35,
    fontSize: 16,
    outline: "1px solid transparent",
    textAlign: "center",
    "&:focus": {
      outline: "1px solid #1D9391",
    },
  },
});

export const StyledSummaryRow = styled(TwapStyles.StyledRowFlex)({
  justifyContent: "space-between",
  "& p": {
    fontSize: 14,
  },
  "& .twap-label": {
    fontSize: 14,
  },
});

export const StyledSliderContainer = styled(TwapStyles.StyledRowFlex)({
  height: 40,
  justifyContent: "space-between",
});

//
export const configureStyles = (darkMode?: boolean) => {
  const styles = darkMode ? darkModeStylesConfig : lightModeStylesConfig;
  return {
    ".twap-warning": {
      fontSize: 14,
      p: {
        color: "#dc3545",
      },
      "& *": {
        fill: "#dc3545",
      },
    },
    ".twap-percent-button": {
      background: "transparent",
      border: "unset",
      cursor: "pointer",
      fontSize: 16,
      "&:hover": {
        color: darkMode ? "white" : "black",
      },
    },

    ".twap-odnp": {
      color: styles.textColor,
      background: "transparent",
      border: darkMode ? "1px solid rgba(255,255,255, 0.1)" : "1px solid rgb(229, 229, 229)",
    },

    ".twap-token-select": {
      background: green,
      border: "unset",
      padding: "6px 8px 6px 10px",
      borderRadius: 12,
      minHeight: 40,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: 10,
      "& .twap-token-name": {
        fontWeight: 500,
        color: darkMode ? "white" : "black",
      },
      "& .twap-icon": {
        "* ": {
          fill: "black",
        },
      },
    },
    ".twap-token-select-selected": {
      background: darkMode ? styles.containerBackground : "rgb(247, 248, 250)",
      "& .twap-icon": {
        "* ": {
          fill: "white",
        },
      },
    },
    ".twap-change-tokens-order": {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      "& button": {
        width: 35,
        height: 35,
        background: darkMode ? "rgb(33, 36, 39)" : "rgb(229, 229, 229)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      },
    },
    ".twap-limit-price": {
      "& .twap-input": {
        "& input": {
          fontSize: 16,
          textAlign: "center",
        },
      },
      ".twap-price": {
        background: styles.containerBackground,
        padding: 5,
        borderRadius: mainBorderRadius,
      },
    },
    ".twap-market-price": {
      width: "100%",
      background: styles.cardBackground,
      padding: mainPadding,
      borderBottomLeftRadius: mainBorderRadius,
      borderBottomRightRadius: mainBorderRadius,
      "& .title": {
        fontSize: 13,
        fontWeight: 300,
      },
    },
    ".twap-disclaimer": {
      fontSize: "14px!important",
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
        fontFamily: "inherit",
        lineHeight: 1.5,
        maxWidth: 400,
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
      backgroundColor: `${styles.skeletonLoaderBackground || "rgba(255,255,255, 0.1)"}!important`,
    },
    ".twap-modal": {
      background: "rgba(0,0,0, 0.8)",
      fontFamily: "Poppins",
      color: styles.textColor,
      "& *": {
        color: styles.textColor,
        "&::-webkit-scrollbar": {
          display: "none",
        },
      },
    },
    ".twap-button-loader": {
      color: styles.spinnerColor,
    },
    ".twap-time-selector": {
      ".twap-input": {
        input: {
          fontSize: 16,
          "&::placeholder": {
            color: `${styles.textColor}!important`,
          },
        },
      },
    },
    ".twap-time-selector-list": {
      background: styles.containerBackground,
      border: `1px solid ${styles.borderColor || "transparent"}`,
      right: 0,
    },
    ".twap-card": {
      padding: mainPadding,
      borderRadius: 8,
      background: styles.cardBackground,
      width: "100%",
    },
    ".twap-orders": {
      color: styles.textColor,

      "*": {
        "&::-webkit-scrollbar": {
          display: "none",
        },
      },
    },

    ".twap-container": {
      display: "flex",
      gap: 12,
      marginTop: 20,
      flexDirection: "column",
      width: "100%",
      "*": {
        color: styles.textColor,
        fontFamily: "inherit!important",
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
      "& .MuiSlider-thumb": {
        background: styles.iconsColor,
      },
    },
    ".twap-change-order": {
      width: 50,
      height: 50,
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
        background: styles.iconsColor,
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
        background: green,
      },
    },
    ".twap-order-expanded-colored": {
      background: darkMode ? "rgba(17, 17, 17, 0.6)" : styles.containerBackground,
    },
    ".twap-order": {
      background: styles.cardBackground,
      color: styles.textColor,
      border: darkMode ? "1px solid transparent" : "1px solid rgb(229, 229, 229)",
      ".twap-order-main-progress-bar": {
        background: `${styles.progressBarTrackColor}!important`,
      },
      "& .twap-order-progress": {
        "&::after": {
          background: `${styles.progressBarTrackColor}!important`,
        },
      },
      "& .MuiLinearProgress-bar": {
        background: styles.progressBarColor,
      },
      "& .twap-order-separator": {
        background: styles.progressBarTrackColor,
      },
    },
    ".twap-orders-header": {
      "& .twap-orders-header-tabs": {
        border: darkMode ? "1px solid rgba(255,255,255, 0.1)" : "1px solid rgb(229, 229, 229)",
        "& .MuiTabs-indicator": {
          backgroundColor: styles.orderHistorySelectedTabBackground,
        },
        "& .MuiButtonBase-root": {
          color: styles.orderHistoryTabColor,
          fontWeight: 400,
        },
        "& .Mui-selected": {
          color: styles.orderHistorySelectedTabColor,
          fontWeight: 500,
        },
      },
    },
    ".twap-orders-lists": {
      maxHeight: 600,
    },
    ".twap-usd": {
      fontSize: 14,
    },
    "& .twap-balance": {
      fontSize: 14,
      "& *": {
        color: styles.textColor,
      },
    },
    ".twap-input": {
      "& input": {
        fontFamily: "inherit",
        fontWeight: 400,
        borderRadius: "0.375rem",
        transition: "0.2s all",
        height: 38,
        fontSize: 24,
        "&::placeholder": {
          color: `${styles.textColor}!important`,
        },
      },
    },

    ".twap-button": {
      height: 50,
      borderRadius: 8,
      background: green,
      "& *": {
        fontWeight: 500,
        fontSize: 16,
        color: "black",
      },
    },
    ".twap-button-disabled": {
      background: "rgb(229, 229, 229)",
      opacity: "1!important",
      "& *": {
        color: "rgb(113, 113, 113)",
      },
    },

    ".twap-modal-content": {
      background: styles.containerBackground,
      maxHeight: "85vh",
      overflow: "auto",
      borderRadius: "10px",
      padding: 15,
      paddingTop: 30,
      "& a": {
        fontWeight: 500,
        textDecoration: "underline",
      },
      "& .MuiIconButton-root": {},
      "& *": {
        fontFamily: "inherit",
      },
    },
  };
};
