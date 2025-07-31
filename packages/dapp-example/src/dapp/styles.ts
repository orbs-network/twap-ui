import { createGlobalStyle } from "styled-components";

const getColors = (isDarkMode?: boolean) => {
  return {
    text: {
      main: isDarkMode ? "white" : "black",
      error: isDarkMode ? "#FF5F52" : "#FF5F52",
      dark: isDarkMode ? "rgb(155, 155, 155)" : "rgb(155, 155, 155)",
    },
  };
};

export const GlobalStyles = createGlobalStyle<{ isDarkMode?: boolean }>(({ isDarkMode }) => {
  const colors = getColors(isDarkMode);
  return {
    p: {
      color: colors.text.main,
    },
    "*": {
      boxSizing: "border-box",
    },
    ".twap-orders": {
      display: "flex",
      flexDirection: "column",
      gap: 10,
    },
    "#twap-orders-portal": {
      width: "100%",
    },
    ".twap-orders__button": {
      padding: 16,
      background: "#1B1B1B",
      borderRadius: 20,
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-start",
      height: 48,
      width: "100%",
      color: colors.text.main,
      fontSize: 14,
      border: "1px solid rgba(255, 255, 255, 0.1)",
      cursor: "pointer",
      "&:hover": {
        background: "rgba(255, 255, 255, 0.07)",
      },
      svg: {
        marginLeft: "auto",
      },
    },

    ".twap-orders__selected-order": {
      button: {
        width: "100%",
        marginTop: 20,
      },
    },
    ".twap-orders__selected-order-bottom": {
      marginTop: 20,
      width: "100%",
    },
    ".twap-orders__selected-order-summary": {
      padding: 12,
    },
    ".twap-create-order-bottom": {
      marginTop: 20,
      display: "flex",
      gap: 10,
      flexDirection: "column",
      width: "100%",
    },
    ".orbs_MainTokenLeft": {
      gap: 2,
    },
    ".twap-orders__selected-order-summary-title": {
      fontWeight: 500,
      fontSize: 14,
    },
    ".twap-orders__selected-order-details": {
      gap: 5,
      padding: 12,
      paddingTop: 0,
    },
    ".twap-order-details": {
      gap: 8,
      display: "flex",
      flexDirection: "column",
    },
    ".twap-orders__selected-order-accordions": {
      display: "flex",
      flexDirection: "column",
      gap: 8,
      marginTop: 20,
    },
    ".twap-cancel-order": {
      marginTop: 20,
    },
    ".twap-orders__selected-order-accordion": {
      borderRadius: 16,
      background: "#1B1B1B",
      "&-trigger": {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 12px 12px 12px",
        cursor: "pointer",
        fontSize: 15,
      },
      "&-details": {
        padding: "5px 12px 12px 12px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      },
    },
    ".twap-order-details__detail-row": {
      display: "flex",
      alignItems: "center",
      gap: 5,
      justifyContent: "space-between",
      a: {
        color: colors.text.main,
        textDecoration: "none",
      },
      "&-label": {
        "*": {
          fontSize: 14,
          fontWeight: 500,
        },
      },
      "&-value": {
        fontSize: 14,
      },
    },
    ".twap-order-details__fill-delay-text": {
      fontSize: 14,
      fontWeight: 500,
    },
    ".twap-duration-panel": {
      marginTop: 5,
    },
    ".twap-create-order-details": {
      padding: 12,
      background: "#1B1B1B",
      borderRadius: 16,
      display: "flex",
      flexDirection: "column",
      gap: 8,
    },
    ".orbs_Logo img": {
      objectFit: "cover",
    },

    ".twap-orders__list-item-progress": {
      display: "flex",
      alignItems: "center",
      gap: 15,
    },
    ".twap-orders__list-item-progress-bar": {
      flex: 1,
      background: "rgba(255, 255, 255, 0.07)",
      height: 5,
      borderRadius: 999,
      overflow: "hidden",
    },
    ".twap-orders__list-item-progress-bar-filled": {
      background: "rgb(252, 114, 255)",
      height: "100%",
    },
    ".twap-loader": { background: "rgba(255, 255, 255, 0.07)" },
    ".twap-orders__list-item-token-logo": {
      background: "rgba(255, 255, 255, 0.1)",
      borderRadius: 999,
      width: 20,
      height: 20,
      img: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
        borderRadius: "50%",
      },
    },
    ".twap-orders__selected-order-header": {
      gap: 10,
      marginBottom: 20,
      "&-title": {
        fontSize: 13,
      },
    },
    ".twap-orders__list": {
      maxHeight: "60vh",
      height: 700,
    },
    ".twap-orders__list-empty": {
      textAlign: "center",
      marginTop: 20,
      marginBottom: 20,
    },
    ".twap-orders__list-item": {
      cursor: "pointer",
      background: "#1B1B1B",
      padding: 12,
      borderRadius: 16,
      marginBottom: 6,
      display: "flex",
      flexDirection: "column",
      gap: 8,
      "&:hover": {
        background: "rgba(255,255,255, 0.06)",
      },
      "&-header": {
        display: "flex",
        alignItems: "center",
        gap: 5,
        justifyContent: "space-between",
        "&-title": {
          fontSize: 13,
          span: {
            fontSize: 12,
            opacity: 0.7,
          },
        },
        "&-status": {
          fontSize: 13,
          opacity: 0.7,
        },
      },
    },

    ".twap-orders__list-item-token": {
      display: "flex",
      alignItems: "center",
      gap: 5,
    },
    ".twap-orders__list-item-tokens": {
      display: "flex",
      alignItems: "center",
      gap: 5,
    },

    ".orbs_StepIndicatorLine": {
      "--line-bg-color": "rgb(252, 114, 255)",
    },
    ".orbs_StepIndicator": {
      // "--indicator-margin-bottom": "10px",
    },
    ".twap-limit-price-panel-body": {
      display: "flex",
      gap: 5,
      ".twap-input": {
        flex: 1,
      },
    },
    ".twap-panel-content": {
      display: "flex",
      justifyContent: "space-between",
    },
    ".twap-limit-price-panel-percent": {
      marginLeft: "auto",
      gap: 5,
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",
    },

    ".twap-limit-price-panel": {
      marginBottom: 5,
      display: "flex",
      flexDirection: "column",
      gap: 5,
      ".twap-input": {
        input: {
          fontSize: 34,
        },
      },
    },

    ".order-delay": {
      flex: 1,
    },
    ".twap-input-panel": {
      input: {
        fontSize: 18,
      },
    },
    ".twap-token-panel": {
      display: "flex",
      flexDirection: "column",
      gap: 10,
      ".twap-input": {
        input: {
          fontSize: 34,
        },
      },
    },
    ".twap-token-panel-usd": {
      color: colors.text.dark,
      fontSize: 14,
      fontWeight: 500,
    },
    ".twap-panel-header": {
      marginBottom: 10,
    },
    ".twap-token-panel-balance": {
      color: colors.text.dark,
      fontSize: 14,
      fontWeight: 500,
    },
    ".orbs_MainToken": {
      alignItems: "center",

      ".orbs_MainTokenLeft": {
        display: "flex",
        flexDirection: "column",
        gap: 5,
        ".orbs_MainTokenTitle": {
          fontSize: 15,
        },
        ".orbs_MainTokenAmount": {
          fontSize: 20,
          fontWeight: 500,
        },
        ".orbs_MainTokenUsd": {
          fontSize: 13,
          opacity: 0.7,
        },
      },

      ".orbs_MainTokenLogo": {
        background: "rgba(255, 255, 255, 0.1)",
        borderRadius: 999,
        img: {
          width: 40,
          height: 40,
          objectFit: "cover",
          borderRadius: "50%",
        },
      },
    },

    ".twap-token-panel-top": {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
    },
    ".twap-token-panel-middle": {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
    },
    ".twap-token-panel-bottom": {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
    },
    ".twap-label": {
      color: colors.text.dark,
      fontWeight: 500,
      fontSize: 15,
      display: "flex",
      alignItems: "center",
      gap: 5,
      svg: {
        position: "relative",
        top: 2,
      },
    },
  };
});
