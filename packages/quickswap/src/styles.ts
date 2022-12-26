import { Box, styled } from "@mui/system";
import { Components, StylesConfig, Styles as TwapStyles } from "@orbs-network/twap-ui";

// Styles configuration
export const darkModeStylesConfig: StylesConfig = {
  iconsColor: "rgb(105, 108, 128)",
  textColor: "#c7cad9",
  tooltipBackground: "#1C1E29",
  tooltipTextColor: "white",
  spinnerColor: "white",
  containerBackground: "rgb(16, 23, 38)",
  cardBackground: "#232734",
  progressBarColor: "linear-gradient(180deg,#448aff,#004ce6)",
  progressBarTrackColor: "#c7cad9",
  orderHistorySelectedTabBackground: "#134DC8",
  orderHistoryTabColor: "white",
  orderHistorySelectedTabColor: "rgb(96, 230, 197)",
  buttonBackground: "linear-gradient(180deg,#448aff,#004ce6)",
  buttonColor: "white",
  disabledButtonBackground: "#12131a",
  disabledButtonColor: "#c7cad9",
  selectTokenBackground: "linear-gradient(180deg,#448aff,#004ce6)",
  selectTokenTextColor: "white",
  selectedTokenBackground: "#404557",
  selectedTokenTextColor: "#c7cad9",
};

export const Text = styled(TwapStyles.StyledText)({});

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

export const StyledTrade = styled(Box)({
  width: "100%",
  "& .twap-input": {
    textAlign: "right",
    input: {
      textIndent: "unset",
      paddingRight: 0,
    },
  },
});

export const StyledPercentSelector = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 12,
});

export const StyledIntervalTimeSelect = styled(Box)({
  flex: 1,
});

export const StyledTokenDisplay = styled(TwapStyles.StyledRowFlex)({
  alignItems: "center",
  gap: 6,
  width: "fit-content",
  fontFamily: "inherit",
});

export const StyledFlexStart = styled(TwapStyles.StyledRowFlex)({
  justifyContent: "flex-start",
  gap: 10,
});

export const StyledChangeOrder = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
}));

export const StyledTokenPanel = styled(Box)({
  width: "100%",
  ".twap-input": {
    "& input": {
      textAlign: "right",
      outline: "1px solid transparent",
      height: 40,
      transition: "0.2s all",

      "&::placeholder": {},
    },
  },
  ".twap-panel-title": {
    fontSize: 16,
  },
  "& .twap-token-logo": {
    width: "28px!important",
    height: "28px!important",
  },
  "& .twap-token-name": {
    fontSize: 16,
  },
});

export const StyledTradeSize = styled(Box)({
  maxWidth: "80%",
  display: "flex",
  alignItems: "center",
  gap: 10,

  "& .twap-label": {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  "& .twap-token-logo": {
    width: 20,
    height: 20,
  },
  "& .twap-token-name": {
    fontSize: 16,
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

export const StyledTotalTradesInput = styled(Components.NumericInput)({
  width: 70,
  flex: "unset!important",
  "& input": {
    fontSize: 16,
    textAlign: "center",
  },
});

export const StyledSliderContainer = styled(TwapStyles.StyledRowFlex)({
  height: 30,
  justifyContent: "space-between",
  gap: "10px!important",
});

export const StyledTokenOrderPreviewAmount = styled(Components.SmallLabel)({
  fontSize: 19,
});

export const configureStyles = () => {
  const styles = darkModeStylesConfig;
  return {
    ".twap-warning": {
      fontSize: 14,
      color: "white",
      opacity: 0.5,
    },
    ".twap-odnp": {
      color: styles.textColor,
      background: "transparent",
      border: "0.75px solid #26A7EF",
    },
    ".twap-limit-price": {
      width: "100%",
      ".twap-price": {
        background: "#0D1321",
        padding: 10,
        borderRadius: 10,
        gap: 10,
      },
      ".twap-input": {
        textAlign: "center" as const,
      },
    },
    ".twap-percent-button": {
      border: "unset",
      borderRadius: 4,
      cursor: "pointer",
      color: "#448aff!important",
      background: "unset",
      fontSize: 14,
      fontWeight: 600,
      textTransform: "uppercase" as const,
      margin: 0,
      padding: 0,
    },
    ".twap-token-select": {
      background: styles.selectTokenBackground,
      border: "unset",
      padding: "6px 12px",
      borderRadius: 38,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: 5,
      marginRight: 10,
      fontSize: 16,
      color: `${styles.selectTokenTextColor}!important`,
      p: {
        color: "inherit",
      },
    },

    ".twap-token-select-selected": {
      background: styles.selectedTokenBackground,
    },
    ".twap-market-price": {
      "& .twap-card": {
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        background: "#0D1321",
        paddingBottom: 5,
        paddingTop: 5,
      },
      "& .title": {
        fontSize: 13,
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

    ".twap-button-loader": {
      color: styles.spinnerColor,
    },
    ".twap-time-selector": {
      "& input": {
        "&::placeholder": {
          color: "rgba(255,255,255, 0.5)!important",
        },
      },
    },
    ".twap-time-selector-list": {
      background: styles.containerBackground,
      border: `1px solid ${styles.borderColor || "transparent"}`,
      right: 0,
    },
    ".twap-card": {
      padding: 15,
      background: styles.cardBackground,
      borderRadius: 10,
    },
    ".twap-container": {
      display: "flex",
      gap: 12,
      marginTop: 20,
      flexDirection: "column" as const,
      width: "100%",
      fontWeight: 500,
      "*": {
        color: styles.textColor,
        fontFamily: "inherit!important",
        fontWeight: "inherit!important",
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
    ".twap-order": {
      border: "unset",
      background: styles.cardBackground,
      ".twap-order-expanded-colored": {
        background: styles.containerBackground,
      },
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
    },
    ".twap-orders": {
      fontWeight: 500,
      color: styles.textColor,
      "*": {
        fontWeight: "inherit!important",
        "&::-webkit-scrollbar": {
          display: "none",
        },
      },
    },
    ".twap-orders-header": {
      "& .twap-orders-header-tabs": {
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
      color: "#696c80",
      "& *": {
        color: "inherit",
      },
    },
    "& .twap-balance": {
      color: "#696c80",
      "& *": {
        color: "inherit",
      },
    },
    ".twap-input": {
      "& input": {
        fontFamily: "inherit",
        textIndent: 0,
        outline: "1px solid transparent",
        borderRadius: "0.375rem",
        transition: "0.2s all",
        height: 35,
        fontSize: 18,
        fontWeight: 600,
        color: "#696c80",
        paddingRight: 0,
      },
    },
    ".twap-button": {
      height: 56,
      borderRadius: 10,
      background: styles.buttonBackground,
      color: styles.buttonColor,
      fontWeight: `600!important`,
      fontSize: 16,
      "& *": {
        color: "inherit",
        fontWeight: "inherit",
        fontSize: "inherit",
      },
    },
    ".twap-button-disabled": {
      background: styles.disabledButtonBackground,
      color: styles.disabledButtonColor,
    },

    ".twap-modal-content": {
      background: styles.containerBackground,

      maxHeight: "85vh",
      overflow: "auto",
      borderRadius: "10px",
      padding: 15,
      paddingTop: 30,
      color: styles.textColor,
      "& a": {
        color: "white",
        fontWeight: 500,
        textDecoration: "underline",
      },
      "& .MuiIconButton-root": {
        color: "white",
      },
      "& *": {
        fontFamily: "inherit",
        color: "inherit",
      },
    },
  };
};
