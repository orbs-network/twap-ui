import { StylesConfig } from "@orbs-network/twap-ui";

// Styles configuration
export const darkModeStylesConfig: StylesConfig = {
  iconsColor: "#60E6C5",
  textColor: "white",
  tooltipBackground: "rgba(32, 32, 34, 0.9)",
  tooltipTextColor: "#60E6C5",
  spinnerColor: "white",
  containerBackground: "rgb(16, 23, 38)",
  cardBackground: "#18202F",
  progressBarColor: "#60E6C5",
  progressBarTrackColor: "#22353C",
  orderHistorySelectedTabBackground: "rgba(96, 230, 197, 0.26)",
  orderHistoryTabColor: "white",
  orderHistorySelectedTabColor: "rgb(96, 230, 197)",
  buttonBackground: "rgb(29, 147, 132)",
  buttonColor: "white",
  disabledButtonBackground: "rgb(29, 147, 132)",
  disabledButtonColor: "white",
  selectTokenBackground: "transparent",
  selectTokenTextColor: "white",
  selectedTokenBackground: "transparent",
  selectedTokenTextColor: "white",
};

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
      height: 22,
      width: "25%",
      border: "unset",
      borderRadius: 4,
      cursor: "pointer",
      transition: "0.2s all",
      background: "rgb(55, 65, 81)",
      "&:hover": {
        background: "rgba(100, 221, 192, 0.15)",
        color: "rgb(96, 230, 197)",
      },
    },
    ".twap-token-select": {
      background: "transparent",
      border: "unset",
      padding: "6px",
      borderRadius: 2,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: 5,
      marginLeft: 10,
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
        opacity: 0.8,
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
    ".twap-modal": {
      background: "rgba(0,0,0, 0.8)",
      fontFamily: "Jost",
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
      padding: 12,
      background: styles.cardBackground,
      borderRadius: "0.375rem",
    },
    ".twap-container": {
      display: "flex",
      gap: 12,
      marginTop: 20,
      flexDirection: "column" as const,
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
      border: "1px solid rgb(55, 65, 81)",
      ".twap-order-expanded-colored": {
        background: "rgb(60, 64, 78)",
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
      "*": {
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
        textIndent: 10,
        fontWeight: 400,
        outline: "1px solid transparent",
        borderRadius: "0.375rem",
        transition: "0.2s all",
        height: 35,
        "&:focus": {
          outline: "1px solid #1D9391",
        },
      },
    },
    ".twap-button": {
      height: 40,
      borderRadius: 4,
      background: styles.buttonBackground,
      "& *": {
        color: "white",
        fontWeight: 500,
        fontSize: 16,
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
        color: "white",
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
  };
};
