import { StylesConfig } from "@orbs-network/twap-ui";

export const darkModeStylesConfig: StylesConfig = {
  iconsColor: "rgb(105, 108, 128)",
  textColor: "#D1D5DB",
  tooltipBackground: "#1C1E29",
  tooltipTextColor: "white",
  spinnerColor: "white",
  containerBackground: "rgb(16, 23, 38)",
  cardBackground: "#232734",
  wrapperBackground: "#1b1e29",
  progressBarColor: "linear-gradient(180deg,#448aff,#004ce6)",
  progressBarTrackColor: "#c7cad9",
  orderHistorySelectedTabBackground: "#134DC8",
  orderHistoryTabColor: "white",
  orderHistorySelectedTabColor: "rgb(96, 230, 197)",
  buttonBackground: "#448aff",
  buttonColor: "white",
  disabledButtonBackground: "#12131a",
  disabledButtonColor: "#c7cad9",
  selectTokenBackground: "linear-gradient(180deg,#448aff,#004ce6)",
  selectTokenTextColor: "white",
  selectedTokenBackground: "#404557",
  selectedTokenTextColor: "#c7cad9",
};
export const configureStyles = (isProMode?: boolean) => {
  const styles = darkModeStylesConfig;
  const cardBackground = isProMode ? "#404557" : styles.cardBackground;
  return {
    ".twap-trade-size": {
      paddingTop: "8px!important",
      paddingBottom: "17px!important",
      p: {
        fontSize: "14px!important",
      },
      ".twap-token-logo": {
        width: 18,
        height: 18,
      },
      ".twap-token-name": {
        fontSize: "13px!important",
        fontWeight: "400!important",
        // fontSize: 14,
      },
      input: {
        textAlign: "end!important",
        fontSize: "13px!important",
      },
      ".twap-label": {
        fontSize: "14px",
      },
      ".MuiSlider-thumb": {
        background: "white",
      },
      ".MuiSlider-rail": {
        color: "#40475A",
      },
      ".MuiSlider-track": {
        color: "#A3A8B8",
      },
    },
    ".twap-percent-selector": {
      button: {
        "&:nth-of-type(2)": {
          marginLeft: 22.5,
        },
        padding: 0,
        background: "transparent",
        border: "unset",
        color: "#448aff",
        fontWeight: `500!important`,
        fontSize: 14,
        textTransform: "uppercase" as const,
        cursor: "pointer",
      },
    },
    ".twap-warning": {
      fontSize: 14,
      color: "white",
      opacity: 0.5,
    },
    ".twap-odnp": {
      marginRight: "0px!important",
      width: 119,
      minWidth: 119,
      height: 31,
      border: "1px solid #636679",
      borderRadius: "20px!important",
      padding: "0 10px!important",

      p: {
        fontSize: "13px!important",
        fontWeight: "500!important",
      },
      img: {
        width: "17px!important",
        height: 17,
      },
      color: styles.textColor,
      background: "transparent",
    },
    ".twap-limit-price": {
      ".twap-label": {
        fontSize: 14,
      },
    },
    ".twap-limit-price-input": {
      background: "#1B1E29",
      padding: "5px 10px!important",
      marginBottom: 8,
      button: {
        padding: 0,
      },
      justifyContent: "space-between!important",
      width: "100%",
      borderRadius: 10,
      gap: 10,
      ".twap-input": {
        textAlign: "center" as const,
        input: {
          "&::placeholder": {
            color: styles.textColor,
          },
        },
      },
      p: {
        fontSize: "13px!important",
        fontWeight: "400!important",
      },
      ".twap-token-display img": {
        width: 25,
        height: 25,
      },
      div: {
        paddingLeft: "0!important",
      },
    },
    ".twap-input-loader": {
      right: 0,
      left: "unset",
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
    ".twap-label": {
      fontSize: 16,
    },
    ".twap-token-select": {
      ".twap-icon svg": {
        color: `${styles.textColor}!important`,
        fill: `${styles.textColor}!important`,
        stroke: `${styles.textColor}!important`,
      },
      background: `${styles.selectedTokenBackground}!important`,
      ".twap-token-name": {
        fontWeight: "500!important",
        fontSize: "16px!important",
      },
      height: 40,
      border: "unset",
      padding: "8px 13px 8px 8px",
      marginBottom: 2,
      borderRadius: 38,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between!important",
      color: `${styles.selectTokenTextColor}!important`,
      p: {
        color: `${styles.textColor}`,
      },
      ".twap-token-display": {
        img: {
          width: 30,
          height: 30,
          minWidth: 30,
          minHeight: 30,
        },
        p: {
          overflow: "hidden",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
        },
        justifyContent: "start",
        width: "100%",
      },
    },
    ".twap-token-not-selected": {
      display: "flex",
      paddingLeft: 12,
      justifyContent: "center",
      backgroundImage: "linear-gradient(105deg,#448aff 3%,#004ce6)!important",
      p: {
        fontSize: 16,
      },
    },

    ".twap-token-selected": {
      background: `${styles.selectedTokenBackground}!important`,
      p: {
        fontSize: 16,
      },
    },
    ".twap-market-price": {
      img: {
        width: "25px!important",
        minWidth: "25px!important",
        height: "25px!important",
        minHeight: "25px!important",
      },
      p: {
        display: "flex",
        alignItems: "center",
        fontSize: "13px",
        fontWeight: "400!important",
        span: {
          fontSize: "13px",
        },
      },
      "&:nth-of-type(2)": {
        fontSize: "13px!important",
        display: "flex",
        alignItems: "center",
      },
      padding: "13px 5px",
      ".title": {
        fontSize: 14,
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
        fontSize: "16px!important",
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
      padding: "16px",
      background: cardBackground,
      borderRadius: 10,
    },
    ".twap-container": {
      ".twap-limit-price": {},
      padding: 0,
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
      fontWeight: "500!important",
    },
    ".twap-slider": {
      ".MuiSlider-thumb.Mui-focusVisible, .MuiSlider-thumb:hover": {
        boxShadow: "none!important",
      },
      "& .MuiSlider-valueLabel": {
        background: styles.tooltipBackground,
        boxShadow: "none!important",
      },
      "& .MuiSlider-valueLabelLabel": {
        boxShadow: "none!important",
        color: styles.tooltipTextColor,
      },
      "& .MuiSlider-thumb": {
        boxShadow: "none!important",
        background: "#D9D9D9",
        width: 13,
        height: 13,
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
      width: 25,
      height: 25,
    },
    ".twap-switch": {
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",
      padding: "0!important",

      "& .MuiSwitch-thumb": {
        padding: "0!important",
        width: 16,
        height: 16,
        background: "#D9D9D9",
      },
      "& .MuiSwitch-track": {
        padding: "0!important",
        width: 46,
        height: 24,
        borderRadius: 20,
        border: "1px solid #636679",
        background: "#1B1E29",
        opacity: "1!important",
      },
      "& .Mui-checked+.MuiSwitch-track": {
        padding: "0!important",
        backgroundColor: `${styles.containerBackground}!important`,
        opacity: "1!important",
      },
      "& .Mui-checked .MuiSwitch-thumb": {
        padding: "0!important",
        background: "#D9D9D9",
      },
      "& .MuiSwitch-switchBase": {
        top: 11,
        left: 17,
        padding: "0!important",
      },
    },
    ".twap-order-expanded": {
      ".twap-market-price-section": {
        p: {
          fontSize: "13px!important",
        },
        ".twap-small-label p": {
          fontSize: "14px!important",
          fontWeight: "500!important",
        },
      },
      ".twap-order-expanded-cancel-wraper": {
        width: "100%",
        display: "flex",
        justifyContent: "center",
      },
      ".twap-button": {
        margin: "15px auto",
        width: 160,
        maxWidth: 160,
        height: 40,
        border: "1px solid #636679",
      },
      ".twap-order-expanded-colored": {
        ".twap-token-display-amount-and-symbol": {
          fontSize: "16px!important",
        },
        ".twap-order-token-display-usd": {
          p: {
            fontSize: 13,
            span: {
              fontSize: 13,
            },
          },
        },
        ".twap-order-main-progress-bar": {
          borderRadius: 0,
          height: "16px!important",
        },
        ".MuiLinearProgress-bar": {
          borderRadius: 0,
          height: "16px!important",
        },
        ".twap-order-token-display": {
          ".twap-token-logo": {
            width: 25,
            height: 25,
          },
        },
      },
      display: "block!important",
      paddingTop: "0!important",
    },
    ".twap-order": {
      border: "unset",
      background: styles.cardBackground,
      ".twap-order-expanded-colored": {
        padding: "15px 26px",
        background: styles.cardBackground,
        ".twap-order-expanded-colored-title": {
          fontSize: 16,
        },
        ".twap-order-expanded-title": {
          fontSize: 14,
        },
        ".twap-token-display-amount-and-symbol": {
          "p, span": {
            fontSize: 16,
            fontWeight: "400!important",
          },
        },
      },
      ".twap-order-main-progress-bar": {
        height: 8,
        background: `${styles.progressBarTrackColor}!important`,
      },
      "& .twap-order-progress": {
        height: 8,
        background: `${styles.progressBarTrackColor}!important`,

        "&::after": {
          background: `${styles.progressBarTrackColor}!important`,
        },
      },
      "& .MuiLinearProgress-bar": {
        height: "8px!important",
        background: "#1A5366",
      },
    },
    ".twap-chunks-size": {
      ".twap-label": {
        fontSize: 14,
      },
      ".twap-token-logo": {
        width: 20,
        height: 20,
      },
    },
    ".twap-orders": {
      paddingBottom: 24,
      background: "#1B1E29",
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
        display: "flex",
        justifyContent: "space-between",
        marginTop: 2,
        border: "none",
        minHeight: 38,
        maxHeight: 38,
        alignItems: "center",
        "& .twap-orders-header-tabs-tab": {
          display: "flex",
          alignItems: "center",
          lineHeight: "normal",
          transition: ".3s all linear",
        },
        "& .MuiTabs-indicator": {
          display: "none",
          minHeight: 38,
          maxHeight: 38,
          width: 94,
          height: 38,
          borderRadius: 100,
          background: "#3E4252",
        },
        "& .MuiButtonBase-root": {
          color: styles.orderHistoryTabColor,
          fontWeight: 400,
        },
        "& .Mui-selected": {
          minHeight: 38,
          maxHeight: 38,
          borderRadius: 100,
          background: "#3E4252",
          color: styles.textColor,
        },
        "& .MuiTabs-flexContainer": {
          height: 38,
          alignItems: "center",
          justifyContent: "space-between",
        },
      },
    },
    ".twap-token-panel": {
      ".twap-token-panel-title": {
        fontSize: 16,
      },
      ".twap-input": {
        input: {
          fontSize: 18,
          fontWeight: `600!important`,
          textAlign: "right" as const,
        },
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
        color: styles.textColor,
        paddingRight: 0,
      },
    },
    ".twap-button": {
      height: 60,
      width: "100%!important",
      borderRadius: 10,
      background: styles.buttonBackground,
      color: "white",
      fontWeight: `500!important`,
      fontSize: 16,
      "& *": {
        color: "inherit",
        fontWeight: "inherit",
        fontSize: "inherit",
      },
    },
    ".twap-submit": {
      color: "white!important",
    },
    ".twap-button-disabled": {
      background: styles.disabledButtonBackground,
      color: `${styles.disabledButtonColor}!important`,
    },

    ".twap-modal-content": {
      fontSize: "14px",
      fontFamily: "Inter",
      padding: "40px 20px 20px 20px",
      boxSizing: "border-box",
      background: styles.containerBackground,

      ".twap-orders-summary-token-display": {
        overflow: "hidden",
        textOverflow: "ellipsis",
        ".twap-token-logo": {
          width: 30,
          height: 30,
        },
        ".twap-orders-summary-token-display-amount": {
          fontSize: 16,
        },
      },
      ".twap-order-summary-details-item": {
        div: {
          fontSize: 14,
        },
        ".twap-label": {
          fontSize: 14,
          maxWidth: 120,
        },
      },
      ".twap-disclaimer-text p, .twap-disclaimer-text a": {
        fontSize: "14px",
      },
      maxHeight: "85vh",
      overflow: "auto",
      borderRadius: "24px",
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
      ".twap-order-summary-limit-price": {
        padding: "10px 26px",
      },
    },
    ".twap-change-tokens-order": {
      position: "absolute",
      width: "36px!important",
      height: 36,
      top: -24,
      background: "#1b1e29",
      border: `3px solid ${styles.cardBackground}`,
      borderRadius: 8,
      button: {
        padding: "0!important",
      },
    },
    ".twap-powered-by": {
      marginTop: "24px!important",
      marginBottom: "0px!important",
      p: {
        fontSize: "11px!important",
        fontWeight: "400!important",
      },
      img: {
        width: "18px!important",
        height: "18px!important",
      },
    },
    ".twap-input input": {
      paddingRight: "0!important",
    },
    ".twap-token-panel .twap-input input": {
      fontSize: "18px!important",
      color: `#696c80!important`,
      fontWeight: "600",
    },
    ".twap-balance": {},
    ".adapter-wrapper": {
      padding: "0px",
      width: "100%!important",
      maxWidth: "100%!important",
      margin: "auto",
      fontFamily: "Inter",
    },
    ".twap-max-duration-wrapper, .twap-trade-interval-wrapper": {
      ".twap-label": {
        fontSize: 14,
        fontWeight: 500,
      },
    },
    ".twap-label-tooltip-content svg": {
      width: "15px!important",
      height: "15px!important",
    },
    ".twap-order-preview": {
      padding: "15px 26px",
    },
    ".twap-order-preview-info": {
      fontSize: 16,
    },
    ".twap-order-preview-header": {
      marginBottom: "15px!important",
      ".twap-order-preview-date": {
        fontSize: "14px!important",
        color: "#696C81!important",
      },
    },
    ".twap-order-preview-tokens": {
      paddingTop: "17px!important",
      paddingRight: "0!important",
      alingItems: "center!important",
      ".twap-order-preview-icon": {
        color: "#636679!important",
      },
      ".twap-order-token-display": {
        ".twap-small-label": {
          "p, span": {
            fontSize: "13px!important",
          },
        },
        ".twap-token-logo": {
          width: 25,
          height: 25,
        },
        ".twap-token-display-amount-and-symbol": {
          "p, span": {
            fontSize: "16px!important",
          },
        },
      },
    },
    ".twap-orders-list": {
      ".twap-order": {
        padding: 0,
      },
    },
    ".twap-order-separator": {
      display: "none",
    },
    ".twap-market-price-section": {
      background: "#1B1E29",
      width: "100%",
      padding: "15px 26px",
      ".twap-token-logo": {
        width: "25px!important",
        height: "25px!important",
      },
      ".twap-number-display": {
        fontSize: 13,
      },
    },
    ".twap-extended-order-info": {
      gap: "15px!important",
      padding: "15px 26px",
      ".twap-order-expanded-row": {
        ".twap-label, .twap-order-expanded-right": {
          fontSize: 14,
        },
        ".twap-token-logo": {
          width: 25,
          height: 25,
        },
      },
    },
    ".twap-order-expanded-row": {},
    ".odnp *": {
      color: "black",
    },
    ".twap-limit-price .twap-label": {
      height: 38,
    },
    ".twap-token-filled": {},
    ".twap-orders-wrapper": {
      maxWidth: "100%!important",
      borderRadius: 10,
    },
    "p .twap-balance-title": {
      fontSize: 14,
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
