import { Box, styled } from "@mui/system";
import { Components, Styles as TwapStyles, StylesConfig } from "@orbs-network/twap-ui";

interface StylesType extends StylesConfig {
  mainBackground: string;
}

const mainPadding = 10
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
  cardBackground: "",
  progressBarColor: "rgb(113, 113, 113)",
  progressBarTrackColor: "rgba(255,255,255, 0.1)",
  orderHistorySelectedTabBackground: green,
  orderHistoryTabColor: "rgb(113, 113, 113)",
  orderHistorySelectedTabColor: "black",
  mainBackground: "rgb(28, 28, 28)",
};

export const lightModeStylesConfig: StylesType = {
  iconsColor: "rgb(163, 163, 163)",
  textColor: "rgb(163, 163, 163)",
  tooltipBackground: "rgb(229, 229, 229)",
  tooltipTextColor: "rgb(113, 113, 113)",
  spinnerColor: "white",
  containerBackground: "#111111",
  cardBackground: "",
  progressBarColor: "rgb(163, 163, 163)",
  progressBarTrackColor: "rgba(255,255,255, 0.1)",
  orderHistorySelectedTabBackground: green,
  orderHistoryTabColor: "rgb(163, 163, 163)",
  orderHistorySelectedTabColor: "black",
  mainBackground: "rgb(28, 28, 28)",
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

export const StyledPercentBtn = styled("button")({
  background: "transparent",
  border: "unset",
  cursor: "pointer",
  fontSize: 16,
  "&:hover": {
    color: "white",
  },
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

export const StyledTokenPanel = styled(Box)(({ issrc }: { issrc: boolean }) => ({
  width: "100%",
  "& .twap-card": {
    borderBottomLeftRadius: issrc ? mainBorderRadius : 0,
     borderBottomRightRadius: issrc ? mainBorderRadius : 0,
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
export const configureStyles = (darkMode: boolean) => {
  const styles = darkMode ? darkModeStylesConfig : lightModeStylesConfig;
  return {
    ".twap-token-select": {
      background: styles.containerBackground,
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
        color: "white",
      },
    },
    ".twap-change-tokens-order": {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      "& button": {
        width: 35,
        height: 35,
        background: styles.mainBackground,
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
        borderRadius: mainBorderRadius
      },
    },
    ".twap-market-price": {
      width: "100%",
      background: "rgba(255, 255, 255, 0.03)",
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
            color: "rgba(255,255,255, 0.5)!important",
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
      background: styles.mainBackground,
      width: "100%",
    },
    ".twap-orders": {
      color: styles.textColor,
      "& .twap-orders-header-tabs": {
        border: "1px solid rgba(255,255,255, 0.1)",
      },
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
      background: "rgba(0,0,0, 0.5)",
    },
    ".twap-order": {
      background: styles.mainBackground,
      color: styles.textColor,

      "& .twap-order-progress": {
        "&::after": {
          background: `${styles.progressBarTrackColor}!important`,
        },
        "& .MuiLinearProgress-bar": {
          background: styles.progressBarColor,
        },
      },
      "& .twap-order-separator": {
        background: styles.progressBarTrackColor,
      },
    },
    ".twap-orders-header": {
      "& .MuiTabs-root": {
        "& .MuiTabs-indicator": {
          backgroundColor: styles.orderHistorySelectedTabBackground,
        },
        "& .MuiButtonBase-root": {
          color: styles.orderHistoryTabColor,
          fontWeight: 400,
        },
        "& .Mui-selected": {
          color: styles.orderHistorySelectedTabColor,
        },
      },
    },
    ".twap-orders-lists": {
      maxHeight: 600,
    },
    ".twap-usd": {
      opacity: 0.6,
    },
    "& .twap-balance": {
      "& *": {
        color: "#D1D5DB",
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
