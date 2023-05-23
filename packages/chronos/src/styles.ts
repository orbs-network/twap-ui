import { Box, styled } from "@mui/material";
import { Components } from "@orbs-network/twap-ui";

const stops = `#9E5BF1,#356FF4`;
const gradient = `linear-gradient(to right,${stops} )`;
const zoom = 1.175;
const lightStyles = {
  containerBg: "rgb(255 255 255/1)",
  textColor: "rgb(10 9 62/1)",
  loader: "rgba(0, 0, 0, 0.3)",
  spinner: "#9e5bf1",
  tooltipBackground: "white",
};

const darkStyles = {
  containerBg: "rgb(255 255 255/1)",
  textColor: "white",
  loader: "rgba(255, 255, 255, 0.2)",
  spinner: "white",
  tooltipBackground: "#0A093E",
};

const cardStyles = {
  position: "relative",
  "&:after": {
    pointerEvents: "none",
    borderRadius: 30,
    left: 0,
    top: 0,
    content: "''",
    background: lightStyles.containerBg,
    position: "absolute",
    opacity: 0.5,
    mixBlendMode: "overlay",
    width: "100%",
    height: "100%",
    zIndex: 0,
  },
};

export const StyledCard = styled(Components.Base.Card)({
  padding: 0,
  ...(cardStyles as any),
  ".twap-card-children": {
    position: "relative",
    width: "100%",
    height: "100%",
    padding: "18px 17px 18px 17px",
  },
});

export const StyledPoweredBy = styled(Components.PoweredBy)({
  marginTop: "20px",
});

export const StyledBalance = styled(Box)({
  ".twap-balance": {
    borderRadius: "12px 2px 0px 12px",
    overflow: "hidden",
    marginLeft: "auto",
    padding: "3px 6px",
    background: `linear-gradient(to right, #9e5bf1,#356ff4)`,
    maxWidth: "unset",
    position: "absolute",
    right: 0,
    top: 20,
    zIndex: 1,
    ".twap-number-display": {
      fontWeight: "600",
    },
    "*": {
      color: "white",
    },
    ".twap-balance-title": {
      fontWeight: 400,
      fontSize: 14,
    },

    "&>p": {
      flexDirection: "column",
      display: "flex",
    },
  },
});

export const StyledColumnFlex = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: 16,
});

export const StyledChange = styled(Box)({
  position: "relative",
  height: 0,
  display: "flex",
  justifyContent: "center",
  width: "100%",
  alignItems: "center",
  zIndex: 1,
});

export const configureStyles = () => {
  return {
    ".twap-powered-by": {
      a: {
        color: lightStyles.textColor,
      },
    },
    ".twap-change-tokens-order": {
      maxWidth: 46,
      height: 46,
      background: gradient,
      borderRadius: 10,
      svg: {
        color: "white",
        "*": {
          color: "white",
        },
      },
    },
    ".twap-limit-price-input": {
      ...cardStyles,
      padding: "10px 15px",
    },
    ".twap-time-selector-list": {
      background: "rgb(10 9 62/1)",
    },
    ".twap-time-selector-list-item": {
      "&:hover": {
        background: "rgba(255,255,255, 0.05)",
      },
    },
    ".twap-time-selector": {
      ".twap-input": {
        input: {
          fontSize: 18,
          "&::placeholder": {
            opacity: 0.5,
            color: "inherit!important",
          },
        },
      },
    },

    ".twap-time-selectore-selected": {
      padding: "5px 15px",
    },
    ".twap-label": {
      fontSize: "16px",
      fontWeight: "700",
      p: {
        fontSize: "inherit",
        fontWeight: "inherit",
      },
    },

    ".twap-trade-size": {
      ".twap-chunks-size": {
        ".twap-label": {
          fontSize: 15,
          fontWeight: 500,
        },
      },
      ".twap-token-logo": {
        width: 18,
        height: 18,
      },
      ".twap-token-name": {
        fontSize: 14,
      },
      ".twap-input": {
        height: "100%",
        input: {
          fontSize: 16,
        },
      },

      ".MuiSlider-rail": {
        color: "#40475A",
      },
      ".MuiSlider-track": {
        color: gradient,
      },
    },

    ".twap-percent-selector": {
      ".twap-card": {
        ".twap-card-children": {
          padding: "0px",
          height: "auto",
        },
        "&::after": {
          borderRadius: 10,
          opacity: ".5!important",
        },
      },
      button: {
        padding: "1px 10px",
        background: "transparent",
        border: "unset",
        fontWeight: `300!important`,
        fontSize: 12.8,
        textTransform: "uppercase" as const,
        cursor: "pointer",
        position: "relative",
        zIndex: 1,
      },
    },
    ".twap-warning": {
      opacity: 1,
      p: {
        fontSize: 14,
      },
      "*": {
        fill: "rgb(255 0 0/1)!important",
        color: "rgb(255 0 0/1)!important",
      },
    },
    ".twap-odnp": {
      marginRight: "0px!important",
      width: 119,
      minWidth: 119,
      height: 31,
      border: "1px solid #5969F4",
      borderRadius: "20px!important",
      padding: "0 10px!important",
      "*": {
        color: "black",
      },
      p: {
        fontSize: "13px!important",
        fontWeight: "500!important",
      },
      img: {
        width: "17px!important",
        height: 17,
      },
      background: "transparent",
    },
    ".twap-input-loader": {
      left: 0,
      right: "unset",
    },
    ".twap-spinner": {
      color: `${lightStyles.spinner}!important`,
    },
    ".twap-token-select": {
      img: {
        width: 70,
        height: 70,
      },
      svg: {
        minWidth: 70,
        minHeight: 70,
      },
    },

    ".twap-market-price": {
      padding: "0px 20px 0px 0px",
      "*": {
        color: lightStyles.textColor,
      },

      ".title": {
        minHeight: 34,
        borderRadius: 30,
        height: "100%",
        background: `linear-gradient(to left,transparent, ${stops})`,
        flex: 1,
        paddingLeft: 20,
        whiteSpace: "nowrap",
        color: "white",
      },
      img: {
        width: "25px!important",
        minWidth: "25px!important",
        height: "25px!important",
        minHeight: "25px!important",
      },
      p: {
        display: "flex",
        alignItems: "center",
        fontSize: "15px",
        fontWeight: 700,
        color: lightStyles.textColor,
      },
    },

    ".twap-tooltip": {
      "& .MuiTooltip-tooltip": {
        backgroundColor: lightStyles.tooltipBackground,
        borderRadius: "4px",
        color: lightStyles.textColor,
        fontSize: 14,
        fontFamily: "inherit",
        lineHeight: 1.5,
        maxWidth: 400,
        padding: 10,
        "& *": {
          color: "inherit",
          fontSize: 14,
        },
      },
      "& .MuiTooltip-arrow": {
        color: lightStyles.tooltipBackground,
      },
    },
    ".twap-loader": {
      backgroundColor: lightStyles.loader,
    },

    ".twap-container": {
      padding: 0,
      width: "100%",
      fontWeight: 500,
      zoom,
      "*": {
        fontFamily: "inherit!important",
        letterSpacing: ".01em!important",
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
      "& .MuiSlider-valueLabel": {
        // background: styles.tooltipBackground,
        boxShadow: "none!important",
      },
      "& .MuiSlider-valueLabelLabel": {
        // color: styles.tooltipTextColor,
      },
      "& .MuiSlider-thumb": {
        background: gradient,
        width: 13,
        height: 13,
      },
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
      position: "relative",
      zIndex: 10,
      "& .MuiSwitch-thumb": {
        width: 16,
        height: 16,
        background: gradient,
        zIndex: 0,
      },
      "& .MuiSwitch-track": {
        width: 46,
        height: 24,
        borderRadius: 20,
        border: `1px solid #9e5bf1`,
        background: "white",
      },
      "& .Mui-checked+.MuiSwitch-track": {
        padding: "0!important",
        opacity: "1!important",
      },
      "& .Mui-checked .MuiSwitch-thumb": {
        padding: "0!important",
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
          lineHeight: 2,
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
      ...cardStyles,
      border: "unset",
      padding: 20,
      background: "transparent",
      ".MuiCollapse-root": {
        transition: "0s all!important",
      },
      ".MuiPaper-root": {
        position: "relative",
        zIndex: 1,
      },

      ".twap-order-main-progress-bar": {
        // background: styles.progressBarTrackColor,
      },
      ".twap-order-progress": {
        height: 6,
        borderRadius: 4,
        background: gradient,
        ".MuiLinearProgress-bar": {
          background: "inherit",
        },
      },
    },
    ".twap-chunks-size": {
      ".twap-token-logo": {
        width: 20,
        height: 20,
      },
    },
    ".twap-orders": {
      paddingBottom: 24,
      fontWeight: 500,
      "*": {
        fontWeight: "inherit!important",
        "&::-webkit-scrollbar": {
          display: "none",
        },
      },
    },

    ".twap-orders-header": {
      paddingBottom: "20px!important",
      ...cardStyles,
      "> div": {
        position: "relative",
        zIndex: 1,
      },
      ".twap-orders-header-tabs": {
        border: "unset",

        ".twap-orders-header-tabs-tab": {
          transition: "0.1s all",
          borderRadius: 10,
          color: lightStyles.textColor,
        },
        "& .MuiTabs-indicator": {
          display: "none",
        },
        "& .MuiButtonBase-root": {
          fontWeight: "600!important",
        },
        "& .Mui-selected": {
          color: "white",
          background: "#9e5bf1",
        },
      },
    },
    ".twap-token-panel": {
      padding: "20px 0px 20px 20px",
      ".twap-token-name": {
        cursor: "pointer",
        ...cardStyles,
        borderRadius: 100,
        padding: "3px 8px",
        fontSize: 13,
        "&::after": {
          background: "rgb(241 245 249/0.2)",
          opacity: 1,
        },
      },
      ".twap-input": {
        input: {
          fontSize: 28,
          fontWeight: `400!important`,
          textAlign: "left" as const,
        },
      },
    },
    ".twap-input": {
      "& input": {
        fontFamily: "inherit",
        textIndent: 0,
        outline: "1px solid transparent",
        borderRadius: "0.375rem",
        transition: "0.15s all",
        paddingRight: 0,
        "&::placeholder": {
          color: "rgba(0,0,0, 0.55)",
        },
      },
    },
    ".twap-button": {
      height: 50,
      width: "100%!important",
      borderRadius: 8,
      background: gradient,
      color: "white",
      fontWeight: `700!important`,
      fontSize: "14px!important",
      textTransform: "uppercase",
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
      color: `white!important`,
      opacity: "0.6!important",
    },
    ".twap-button-loader": {
      color: "white!important",
    },
    "#twap-modal-content": {
      maxWidth: 600,
      width: "calc(100% - 30px)",
      fontSize: "14px",
      padding: 20,
      paddingTop: 50,
      background: "rgb(238 238 238/1)",
      border: `2px solid #9e5bf1`,
      color: lightStyles.textColor,
      "*": {
        fontFamily: "inherit",
        color: "inherit",
      },
      ".twap-label": {
        p: {
          fontSize: "15px",
          fontWeight: "500",
        },
      },

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
      ".twap-disclaimer-text p, .twap-disclaimer-text a": {
        fontSize: "14px",
      },
      maxHeight: "85vh",
      overflow: "auto",
      borderRadius: "24px",
      "& a": {
        fontWeight: 500,
        textDecoration: "underline",
      },
      ".twap-order-summary-limit-price": {
        paddingRight: 20,
        ".twap-label": {
          whiteSpace: "nowrap",
          background: `linear-gradient(to left,transparent, ${stops})`,
          minHeight: 40,
          paddingLeft: 20,
          borderRadius: 30,
          flex: 1,
          color: "white",
        },
      },
    },

    ".twap-input input": {
      paddingRight: "0!important",
    },

    ".adapter-wrapper": {
      fontFamily: "inherit",
      width: "100%",
    },

    ".twap-order-separator": {
      display: "none",
    },

    ".twap-orders-wrapper": {
      zoom,
      fontFamily: "inherit",
      maxWidth: "100%!important",
      color: lightStyles.textColor,
      "p, span": {
        fontFamily: "inherit",
      },
    },

    ".MuiBackdrop-root": {
      background: "rgba(10,9, 62, 0.5)!important",
    },
    ".twap-card": {
      "*": {
        color: lightStyles.textColor,
      },
    },
    ".dark": {
      ".twap-market-price": {
        "*": {
          color: darkStyles.textColor,
        },
      },
      ".twap-input": {
        "& input": {
          "&::placeholder": {
            color: "rgba(255,255,255, 0.3)!important",
          },
        },
      },
      ".twap-powered-by": {
        a: {
          color: darkStyles.textColor,
        },
      },
      ".twap-orders-header": {
        paddingBottom: "20px!important",
        ".twap-orders-header-tabs": {
          ".twap-orders-header-tabs-tab": {
            color: darkStyles.textColor,
          },

          ".Mui-selected": {
            color: darkStyles.textColor,
          },
        },
      },

      ".twap-spinner": {
        color: `${darkStyles.spinner}!important`,
      },
      ".twap-orders-wrapper": {
        color: darkStyles.textColor,
      },

      ".twap-switch": {
        ".MuiSwitch-track": {
          width: 46,
          height: 24,
          borderRadius: 20,
          border: `1px solid white`,
          background: "rgb(10 9 62/1)!important",
          opacity: 1,
        },
      },
      ".twap-tooltip": {
        "& .MuiTooltip-tooltip": {
          backgroundColor: darkStyles.tooltipBackground,
          color: darkStyles.textColor,
        },
        "& .MuiTooltip-arrow": {
          color: darkStyles.tooltipBackground,
        },
      },
      "#twap-modal-content": {
        background: "rgb(10 9 62/1)",
        color: darkStyles.textColor,
      },
      ".MuiBackdrop-root": {
        background: "rgba(12, 11, 41, 0.5)!important",
      },

      ".twap-loader": {
        backgroundColor: darkStyles.loader,
      },

      ".twap-card": {
        "*": {
          color: darkStyles.textColor,
        },
        "&::after": {
          background: darkStyles.containerBg,
        },
      },
      ".twap-percent-selector": {
        button: {
          color: darkStyles.textColor,
        },
      },
    },

    "@media(max-width:550px)": {
      ".twap-percent-selector": {
        ".twap-card": {
          padding: "5px 6px",
        },
        button: {
          fontSize: 11,
        },
      },
      ".twap-token-select": {
        ".twap-token-logo": {
          width: 50,
          height: 50,
        },
      },
      ".twap-card": {
        padding: "20px 10px",
      },
      ".twap-balance": {
        ".twap-balance-title": {
          display: "none",
        },
      },
      "#twap-modal-content": {
        ".twap-order-summary-limit-price": {
          flexWrap: "wrap",
        },
        ".twap-order-summary-details-item ": {
          flexDirection: "column",
          alignItems: "flex-start",
        },
      },

      ".twap-market-price": {
        flexWrap: "wrap",
      },
      ".twap-limit-price-input": {
        ".twap-token-display img": {
          display: "none",
        },
      },
    },
  };
};
