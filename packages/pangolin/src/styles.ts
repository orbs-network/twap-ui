import { Box, styled } from "@mui/system";
import { Components, StylesConfig } from "@orbs-network/twap-ui";

const mainPadding = 10;
const mainBorderRadius = 8;

interface PangolinStyles extends StylesConfig {
  labelColor: string;
}

export const StyledOrdersContainer = styled(Components.Base.SwipeContainer)({
  zIndex: 99
});

const parseTheme = (theme: any): PangolinStyles => {
  const isDarkMode = theme.textInput.backgroundColor !== "#FFFFFF";

  return {
    labelColor: theme.textInput.labelText,
    iconsColor: theme.textInput.text,
    iconBackground: theme.swapWidget.interactiveBgColor,
    textColor: theme.textInput.text,
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
    skeletonLoaderBackground: isDarkMode ? "rgba(255,255,255, 0.1)" : "rgba(0,0,0, 0.1)",
  };
};

const getButtonStyles = (theme: any) => {
  return {
    marginTop: "auto",
    minHeight: 50,
    borderRadius: 8,
    background: theme.button.primary.background,
    color: theme.button.primary.background,
    "& *": {
      fontWeight: 500,
      fontSize: 16,
      color: "black",
    },
  };
};

export const configureStyles = (theme: any) => {
  const styles = parseTheme(theme);
  return {
    ".twap-trade-size": {
      ".twap-input": {
        input: {
          border: "1px solid transparent",
          transition: "0.2s all",
          "&:focus": {
            border: "1px solid #1D9391",
          },
        },
      },
      ".twap-slider": {},
    },
    ".twap-token-select": {
      border: "unset",
      padding: "6px 8px 6px 10px",
      borderRadius: 12,
      minHeight: 40,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: 8,
      "*": {
        fontWeight: `500!important`,
      },
    },
    ".twap-disclaimer-text": {
      "*": {
        fontSize: "14px!important",
      },
    },
    ".twap-orders-summary-token-display": {
      ".twap-token-logo": {
        width: 36,
        height: 36,
      },
      ".twap-token-name": {
        fontSize: 16,
      },
    },
    ".twap-token-not-select": {
      background: styles.selectTokenBackground,
      "*": {
        color: `black!important`,
      },
      "& .twap-icon": {
        "* ": {
          fill: "black",
        },
      },
    },
    ".twap-token-selected": {
      background: styles.selectedTokenBackground,
      "& .twap-token-name": {
        color: `${styles.selectedTokenTextColor}!important`,
      },
      "& .twap-icon": {
        "* ": {
          fill: styles.selectedTokenTextColor,
        },
      },
    },
    ".twap-usd": {
      fontSize: 14,
    },
    "& .twap-balance": {
      fontSize: 14,
    },
    ".twap-chunks-size": {
      ".twap-token-logo": {
        width: 18,
        height: 18,
      },
      ".twap-token-name": {
        fontSize: 16,
      },
      ".twap-label": {
        fontSize: 14,
      },
    },
    ".twap-token-panel": {
      "& .twap-input": {
        textAlign: "left",
      },
      "& .twap-token-logo": {
        width: "24px",
        height: "24px",
      },
      "& .twap-token-name": {
        fontSize: 20,
      },
      ".twap-token-panel-price": {
        width: "fit-content",
        fontSize: "12",
        gap: 5,
        ".twap-token-name": {
          fontSize: "inherit",
        },
      },
    },
    ".twap-powered-by": {
      "*": {
        color: `${theme.swapWidget.primary}!important`,
      },
    },
    ".twap-percent-button": {
      background: "transparent",
      border: "unset",
      cursor: "pointer",
      fontSize: 16,
      color: styles.textColor,
    },

    ".twap-change-tokens-order": {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      ".twap-icon": {
        "*": {
          color: `${styles.iconsColor}!important`,
        },
      },
      button: {
        width: 35,
        height: 35,
        background: styles.iconBackground,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      },
    },
    ".twap-limit-price-input": {
      background: styles.containerBackground,
      padding: 5,
      borderRadius: mainBorderRadius,
      "*": {
        color: `${theme.swapWidget.primary}!important`,
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
      backgroundColor: `${styles.skeletonLoaderBackground}!important`,
    },
    ".twap-spinner": {
      color: `${styles.spinnerColor}!important`,
    },
    ".twap-button-loader": {
      color: styles.spinnerColor,
    },
    ".twap-time-selector": {
      ".twap-time-selector-list": {
        right: 0,
        top: "-30%",
      },
      ".twap-time-selector-selected": {
        background: styles.selectTokenBackground,
        padding: "6px 8px",
        borderRadius: 10,
        p: {
          fontWeight: 500,
          color: "black",
          fontSize: 14,
        },
      },
      ".twap-input": {
        input: {
          fontSize: 18,
          "&::placeholder": {
            color: `${styles.textColor}!important`,
          },
        },
      },
    },
    ".twap-time-selector-list": {
      background: styles.selectTokenBackground,
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
    ".twap-swipe-container": {
      background: styles.containerBackground,
      borderRadius: 10,
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
      position: "relative",
      display: "flex",
      gap: 12,
      flexDirection: "column",
      width: "100%",
      background: styles.containerBackground,
      padding: 10,
      borderRadius: "0px 0px 10px 10px",
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
      ".MuiSlider-thumb": {
        background: styles.selectTokenBackground,
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
    ".twap-button": {
      ...getButtonStyles(theme),
    },
    ".twap-odnp-button": {
      ...getButtonStyles(theme),
      color: `black!important`,
      fontWeight: 500,
      minHeight: "unset",
      border:'unset'
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
      color: styles.textColor,
      ".twap-ui-close": {
        color: styles.textColor,
      },
      "& a": {
        fontWeight: 500,
        textDecoration: "underline",
      },
      "& .MuiIconButton-root": {},
      "& *": {
        fontFamily: "inherit",
      },
    },
    ".twap-order-summary-output-address": {
      fontSize: 14,
    },
    ".twap-disclaimer-switch": {
      fontSize: 14,
    },

    ".twap-order-summary-details": {
      ".twap-order-summary-details-item": {
        "*": {
          fontSize: 14,
        },
      },
    },
    ".twap-close": {
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

export const StyledOrders = styled(Box)({
  width: "100%",
  height: "100%",
  ".twap-orders": {
    width: "100%",
    height: "100%",
  },
});

export const StyledShowOrdersButton = styled(Components.Base.Button)({
  width: "unset",
  height: "unset",
  padding: "6px 20px",
  borderRadius: 10,

  minHeight: "unset",
  "*": {
    fontSize: 14,
    fontWeight: 500,
  },
});
