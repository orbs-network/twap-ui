import { Box, styled } from "@mui/system";
import { Components, Styles as TwapStyles, StylesConfig } from "@orbs-network/twap-ui";
import { PangolinTheme } from "./types";

type StylesType = StylesConfig;

const mainPadding = 10;
const mainBorderRadius = 8;

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
  "& .twap-token-logo": {
    width: 22,
    height: 22,
  },
});

export const StyledSliderContainer = styled(TwapStyles.StyledRowFlex)({
  height: 40,
  justifyContent: "space-between",
});

const parseTheme = (theme: any): StylesConfig => {
  console.log(theme.swapWidget);

  return {
    iconsColor: theme.swapWidget.interactiveColor,
    iconBackground: theme.swapWidget.interactiveBgColor,
    textColor: theme.swapWidget.secondary,
    tooltipBackground: "white",
    tooltipTextColor: "black",
    spinnerColor: theme.swapWidget.secondary,
    containerBackground: theme.swapWidget.backgroundColor,
    cardBackground: theme.textInput.backgroundColor,
    progressBarColor: theme.button.primary.background,
    progressBarTrackColor: theme.swapWidget.secondary,
    orderHistorySelectedTabBackground: theme.button.primary.background,
    orderHistoryTabColor: theme.swapWidget.secondary,
    orderHistorySelectedTabColor: "black",
    buttonBackground: theme.button.primary.background,
    buttonColor: theme.button.primary.color,
    disabledButtonBackground: theme.button.disable.background,
    disabledButtonColor: theme.button.disable.color,
    selectTokenBackground: theme.currencySelect.defaultBackgroundColor,
    selectTokenTextColor: theme.currencySelect.defaultText,
    selectedTokenBackground: theme.currencySelect.selectedBackgroundColor,
    selectedTokenTextColor: theme.currencySelect.selectedText,
  };
};

//
export const configureStyles = (theme: any) => {
  const styles = parseTheme(theme);
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
      color: styles.textColor,
    },

    ".twap-odnp": {
      color: theme.swapWidget.primary,
      background: "transparent",
      border: `1px solid ${theme.swapWidget.primary}`,
    },

    ".twap-token-select": {
      background: styles.selectTokenBackground,
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
      },
      "& .twap-icon": {
        "* ": {
          fill: styles.selectTokenTextColor,
        },
      },
    },
    ".twap-token-select-selected": {
      background: styles.selectedTokenBackground,
      "& .twap-token-name": {
        color: styles.selectedTokenTextColor,
      },
      "& .twap-icon": {
        "* ": {
          fill: styles.selectedTokenTextColor,
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
        background: styles.iconBackground,
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
    ".twap-panel-title": {
      color: styles.textColor,
    },
    ".twap-market-price": {
      width: "100%",
      background: styles.containerBackground,
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
        border: "1.5px solid rgba(0,0,0, 0.15)",

        "& *": {
          color: styles.textColor,
          fontSize: 14,
        },
      },
      "& .MuiTooltip-arrow": {
        display: "none",
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
      ".twap-time-selectore-selected": {
        borderBottom: `1px solid ${styles.textColor}`,

        p: {
          fontWeight: 500,
        },
      },
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
      background: styles.buttonBackground,
      border: `1px solid ${styles.borderColor || "transparent"}`,
      right: 0,
      ".twap-time-selector-list-item": {
        color: "black!important",
        "*": { color: "inherit" },
        "&:hover": {
          background: "rgba(255,255,255, 0.1)",
        },
      },
    },
    ".twap-card": {
      padding: mainPadding,
      borderRadius: 8,
      background: styles.cardBackground,
      width: "100%",
    },
    ".twap-orders": {
      padding: 10,
      color: styles.textColor,
      background: styles.containerBackground,

      "*": {
        "&::-webkit-scrollbar": {
          display: "none",
        },
      },
    },

    ".twap-container": {
      position: "relative",
      display: "flex",
      gap: 12,
      flexDirection: "column",
      width: "100%",
      background: styles.containerBackground,
      padding: 10,
      "*": {
        color: theme.swapWidget.secondary,

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
        background: styles.buttonBackground,
      },
    },
    ".twap-order-expanded-colored": {
      background: styles.containerBackground,
    },
    ".twap-order": {
      background: styles.cardBackground,
      color: styles.textColor,
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
        background: styles.cardBackground,
        border: "unset",
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
      background: theme.button.primary.background,
      color: theme.button.primary.background,
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
    ".twap-summary": {
      background: theme.drawer.backgroundColor,
    },
    ".twap-summary-close": {
      ".twap-icon": {
        svg: {
          "*": {
            stroke: `${theme.swapWidget.primary}!important`,
          },
        },
      },
    },
  };
};

export const StyledOrderSummaryContent = styled(Box)({
  flex: 1,
  overflow: "auto",
});

export const StyledSummary = styled(Box)({
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  paddingTop: 30,
  display: "flex",
  transition: "0.2s all",
});

export const StyledTokenSummary = styled(Components.Card)({
  ".twap-token-logo": {
    width: 38,
    height: 38,
  },
});

export const StyledSummaryCloseButton = styled("button")({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 0,
  border: "unset",
  background: "unset",
  top: 0,
  right: 0,
  position: "absolute",
  cursor: "pointer",
});
