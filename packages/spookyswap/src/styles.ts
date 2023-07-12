import { StylesConfig } from "@orbs-network/twap-ui";

interface Styles extends StylesConfig {
  lighterTextColor: string;
}

// Styles configuration
export const darkModeStylesConfig: Styles = {
  iconsColor: "rgb(140, 140, 227)",
  textColor: "rgba(255, 255, 255, 0.6)",
  lighterTextColor: "rgba(255, 255, 255, 0.87)",
  tooltipBackground: "rgb(30, 29, 45)",
  tooltipTextColor: "rgba(255, 255, 255, 0.6)",
  spinnerColor: "white",
  containerBackground: "#192239",
  cardBackground: "rgb(18, 17, 34)",
  progressBarColor: "rgb(140, 140, 227)",
  progressBarTrackColor: "#373E55",
  orderHistorySelectedTabBackground: "rgb(115, 204, 231)",
  orderHistoryTabColor: "white",
  orderHistorySelectedTabColor: "rgb(18, 17, 34)",
  buttonBackground: "rgb(115, 204, 231)",
  buttonColor: "rgb(18, 17, 34)",
  disabledButtonBackground: "rgba(255, 255, 255, 0.09)",
  disabledButtonColor: "rgba(255, 255, 255, 0.87)",
  selectTokenBackground: "rgba(255, 255, 255, 0.05)",
  selectTokenTextColor: "rgba(255, 255, 255, 0.87)",
  selectedTokenBackground: "rgba(255, 255, 255, 0.6)",
  selectedTokenTextColor: "rgba(255, 255, 255, 0.87)",
};

export const lightModeStylesConfig: Styles = {
  iconsColor: "rgb(140, 140, 227)",
  textColor: "rgb(77, 103, 147)",
  lighterTextColor: "rgb(49, 65, 94)",
  tooltipBackground: "#D8DEEA",
  tooltipTextColor: "rgb(77, 103, 147)",
  spinnerColor: "rgb(77, 103, 147)",
  containerBackground: "rgb(242, 244, 248)",
  cardBackground: "rgb(228, 233, 241)",
  progressBarColor: "rgb(102, 101, 221)",
  progressBarTrackColor: "#D8DEEA",
  orderHistorySelectedTabBackground: "rgb(102, 101, 221)",
  orderHistoryTabColor: "rgb(102, 101, 221)",
  orderHistorySelectedTabColor: "white",
  buttonBackground: "rgb(242, 244, 248)",
  buttonColor: "rgb(49, 65, 94)",
  disabledButtonBackground: "rgb(242, 244, 248)",
  disabledButtonColor: "rgb(49, 65, 94)",
  selectTokenBackground: "rgb(242, 244, 248)",
  selectTokenTextColor: "rgb(49, 65, 94)",
  selectedTokenBackground: "rgb(242, 244, 248)",
  selectedTokenTextColor: "rgb(49, 65, 94)",
};

const getButtonStyles = (darkMode?: boolean) => {
  const styles = darkMode ? darkModeStylesConfig : lightModeStylesConfig;
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
  };
};

export const configureStyles = (darkMode?: boolean) => {
  const styles = darkMode ? darkModeStylesConfig : lightModeStylesConfig;
  return {
    ".twap-order-summary": {
      padding: 30,
    },
    ".twap-limit-price-input": {
      background: styles.containerBackground,
      borderRadius: 10,
      gap: 10,
      padding: "5px 0px",
      ".twap-input": {
        "& input": {
          fontSize: 16,
          textAlign: "center" as const,
        },
      },
    },
    ".twap-percent-selector": {
      button: {
        background: "unset",
        border: "unset",
        color: styles.iconsColor,
        fontSize: 14,
        fontWeight: 700,
      },
    },
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
        fontFamily: "inherit",
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
      backgroundColor: `${styles.skeletonLoaderBackground || "rgba(255,255,255, 0.1)"}!important`,
    },
    ".twap-modal": {
      background: "unset",
      fontFamily: "Red Hat Display",
      color: styles.textColor,
      "& *": {
        color: styles.textColor,
        "&::-webkit-scrollbar": {
          display: "none",
        },
      },
      "& .MuiBackdrop-root": {
        background: "rgba(18, 17, 34, 0.55)",
      },
    },
    ".twap-button-loader": {
      color: `${styles.spinnerColor}!important`,
      zoom: `0.55!important`,
    },
    ".twap-time-selector": {
      ".twap-time-selector-selected": {
        padding: ".5rem",
        border: "1px solid rgba(255,255,255,0.87)",
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
      boxShadow: "1px 1px 14px 0px rgba(0,0,0,0.65)",
      right: 0,
      ".twap-time-selector-list-item": {
        "&:hover": {
          background: darkMode ? "rgba(255,255,255, 0.03)" : "rgba(0,0,0, 0.03)",
        },
      },
    },
    ".twap-card": {
      minHeight: 50,
      padding: "10px 15px",
      paddingBottom: 5,
      background: styles.cardBackground,
      borderRadius: "0.375rem",
      boxShadow: darkMode ? "unset" : "rgb(49 65 94 / 8%) 0px 2px 4px inset, rgb(49 65 94 / 4%) 0px 4px 8px inset",
    },
    ".twap-create-order-btn": {
      marginTop: 20,
    },
    ".twap-container": {
      width: "100%",
      display: "flex",
      flexDirection: "column" as const,
      gap: 15,
      marginTop: 20,
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
      position: "relative" as const,
      background: "transparent",
      border: "unset",
      padding: 10,
      borderRadius: 0,
      transition: ".15s all linear",

      "&:after": {
        content: '""',
        position: "absolute" as const,
        left: "50%",
        transform: "translate(-50%)",
        bottom: 0,
        width: "calc(100% + 20px)",
        height: 1,
        background: darkMode ? "rgba(255, 255, 255, 0.05)" : "rgb(188, 200, 220)",
      },
      "&:hover": {
        backgroundColor: "rgba(255, 255, 255, 0.09)",
      },

      "& .twap-order-preview-tokens": {
        "& .twap-order-token-display": {
          "& .twap-token-display-amount-and-symbol": {
            fontSize: 14,
          },
          "& .twap-order-token-display-usd": {
            fontSize: 12,
          },
        },
      },
      "& .twap-order-expanded-row": {
        alignItems: "flex-start",
        fontSize: 14,
      },
      ".twap-market-price-section": {
        width: "100%",
      },
      "& .twap-order-expanded-colored": {
        padding: "12px 0",
      },
      "& .twap-order-main-progress-bar": {
        height: 21,
        background: `${styles.progressBarTrackColor}!important`,
      },
      "& .MuiLinearProgress-bar": {
        background: styles.orderHistorySelectedTabBackground,
      },
      "& .twap-order-progress": {
        "&::after": {
          background: `${styles.progressBarTrackColor}!important`,
        },
      },
    },
    ".twap-order-expanded-wrapper": {
      "&:hover": {
        backgroundColor: "transparent",
      },
      backgroundColor: "rgba(255, 255, 255, 0.09)!important",
    },
    ".twap-orders": {
      gap: "0!important",
      color: styles.textColor,
      ".twap-orders-header": {
        ".twap-label p": {
          fontSize: "21px!important",
          fontWeight: 700,
        },
        padding: 0,
      },
      ".twap-orders-list": {
        overflowX: "hidden",
        gap: 0,
      },
    },
    ".twap-orders-header": {
      "& .twap-orders-header-tabs": {
        borderRadius: 0,
        padding: 0,
        minHeight: 28,
        ".twap-orders-header-tabs-tab": {
          background: "none",
          padding: 0,
          minHeight: 28,
          minWidth: 0,
          transition: ".15s all linear",
          borderBottom: `2px solid ${styles.textColor}`,
        },
        border: "unset",
        "& .MuiTabs-indicator": {
          backgroundColor: "transparent",
        },
        "& .MuiButtonBase-root": {
          color: styles.textColor,
          fontWeight: 400,
        },
        "& .Mui-selected": {
          color: `${styles.orderHistorySelectedTabBackground}!important`,
          borderBottom: `2px solid ${styles.orderHistorySelectedTabBackground}`,
          fontWeight: 700,
        },
      },
    },
    ".twap-trade-size": {
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
        },
      },
    },
    ".twap-change-tokens-order": {
      button: {
        background: "rgba(255, 255, 255, 0.05)",
        width: 24,
        height: 24,
      },
      ".twap-icon": {
        width: 16,
        height: 16,
      },
    },

    ".twap-token-panel": {
      ".twap-usd": {
        maxWidth: "unset",
        textAlign: "left" as const,
      },
      ".twap-panel-title": {
        p: {
          fontSize: 14,
          fontWeight: 700,
        },
      },

      ".twap-balance-container": {
        position: "relative" as const,
        paddingTop: 5,
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
      ".twap-balance": {
        fontSize: 14,
        maxWidth: "unset",

        width: "100%",
        p: {
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
        },
        span: {
          marginRight: 5,
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
    },
    ".twap-input": {
      input: {
        fontFamily: "inherit",
        fontWeight: 400,
        outline: "1px solid transparent",
        borderRadius: "0.375rem",
        transition: "0.2s all",
        color: styles.lighterTextColor,
        "&::placeholder": {
          color: styles.textColor,
          opacity: 0.8,
        },
      },
    },
    ".twap-button": {
      ...getButtonStyles(darkMode),
    },
    ".twap-submit": {
      minWidth: 180,
    },
    ".twap-odnp-button": {
      ...getButtonStyles(darkMode),
    },

    ".twap-button-disabled": {
      background: styles.disabledButtonBackground,
      color: styles.disabledButtonColor,
    },
    ".twap-disclaimer-text": {
      "*": {
        fontSize: "14px!important",
      },
    },
    ".twap-disclaimer-switch": {
      fontSize: 14,
    },
    ".twap-order-summary-output-address": {
      fontSize: 14,
    },
    ".twap-order-summary-details": {
      ".twap-order-summary-details-item": {
        p: {
          fontSize: 14,
        },
      },
    },
    ".twap-modal-content": {
      background: styles.containerBackground,
      overflow: "auto",
      borderRadius: "10px",
      padding: 15,
      paddingTop: 30,
      paddingBottom: 60,
      "& a": {
        fontWeight: 500,
        textDecoration: "underline",
      },
      "& .MuiIconButton-root": {
        color: "white",
      },
      "& *": {
        fontFamily: "inherit",
      },
    },
    ".twap-extended-order-info": {
      ".twap-icon": {
        svg: {
          color: `${styles.iconsColor}!important`,
          fill: `${styles.iconsColor}!important`,
        },
      },
    },

    ".stopwatch-icon": {
      display: "none!important",
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
    ".twap-radio": {
      input: {
        width: 12,
        height: 12,
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
