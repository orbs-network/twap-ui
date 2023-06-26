import { Box, styled } from "@mui/material";
import { Components, Styles } from "@orbs-network/twap-ui";

const lightStyles = { lightBg: "#454062", darkTextColor: "rgba(255,255,255, 0.5)", textColor: "white" };
const darkStyles = {
  lightBg: "#454062",
  textColor: "white",
  button: "linear-gradient(49deg, #3F4AB3 0%, #7A64D0 100%)",
};

const overlayStyles = {
  mixBlendMode: "overlay",
  width: "100%",
  height: "100%",
  position: "absolute",
  content: "''",
  top: 0,
  left: 0,
  zIndex: 0,
  borderRadius: "inherit",
};

const getButtonStyles = () => {
  return {
    background: darkStyles.button,
    border: "unset",
    borderRadius: 100,
    fontSize: 14,
    color: "white",
    transition: "0.2s all",
    height: 42,
    padding: "0px 20px",
    fontFamily: "inherit",
    "*": {
      fontSize: "inherit",
      color: "inherit",
    },
  };
};

export const StyledUSD = styled(Styles.StyledRowFlex)({
  overflow: "hidden",
  ".twap-usd": {
    maxWidth: 60,
  },
  ".twap-number-display": {
    marginTop: 10,
  },
  width: 125,
  borderRadius: 100,
  height: 35,
  justifyContent: "flex-start",
  "*": {
    fontSize: 14,
    color: darkStyles.textColor,
  },
  figure: {
    background: "#44486D",
    padding: 0,
    margin: 0,
    borderRadius: 100,
    width: 45,
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  "&:before": {
    ...overlayStyles,
    background: "rgba(255, 255, 255, 0.2)",
  },
});

export const StyledTokenPanelInput = styled(Components.TokenInput)({
  input: {
    fontSize: 30,
    fontWeight: "300!important",
  },
});

export const StyledPercentSelect = styled(Styles.StyledRowFlex)({
  marginLeft: "auto",
  width: "auto",
  justifyContent: "flex-end",
  gap: 7,
  button: {
    cursor: "pointer",
    border: "unset",
    borderRadius: 100,
    padding: "7px 15px",
    fontFamily: "inherit",
    fontSize: 14,
    color: darkStyles.textColor,
    transition: "0.2s all",
    position: "relative",
    background: "transparent",
    "&:hover": {
      background: darkStyles.button,
      "&:before": {
        display: "none",
      },
    },
    "&:before": {
      ...overlayStyles,
      background: "rgba(255, 255, 255, 0.3)",
    },
  },
});

export const StyledPanelRight = styled(Styles.StyledColumnFlex)({
  gap: 8,
  width: "auto",
  flex: 1,
  padding: "24px 30px 22px 0px",
});

export const StyledTokenSelect = styled(Styles.StyledColumnFlex)({
  background: darkStyles.lightBg,
  width: 101,
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 25,
  padding: "0px 13px",
  cursor: "pointer",
  ".twap-token-svg": {
    width: "45px!important",
    height: "45px!important",
  },
  ".twap-token-name": {
    fontSize: 14,
    ...Styles.textOverflow,
  },
  ".twap-token-logo": {
    width: 45,
    height: 45,
  },
});

export const StyledTokenInputBalance = styled(Styles.StyledRowFlex)({
  position: "absolute",
  width: 175,
  right: 22,
  top: 0,
  padding: "7px 14px",
  background: darkStyles.lightBg,
  borderRadius: "0px 0px 20px 20px",
  svg: {
    width: 19,
    height: 17,
  },
  ".twap-balance": {
    maxWidth: 120,
  },
  "*": {
    color: "rgba(255,255,255, 0.7)",
    fontSize: 12,
  },
});

export const StyledTokenPanel = styled(Components.Base.Card)({
  padding: 0,
  display: "flex",
  gap: 20,
  alignItems: "stretch",
});

export const StyledColumnFlex = styled(Styles.StyledColumnFlex)({
  gap: 13,
});

export const StyledTopColumnFlex = styled(Styles.StyledColumnFlex)({
  gap: 6.5,
});

export const StyledMarketPrice = styled(Components.Base.Card)({
  borderRadius: 15,
  paddingTop: 8,
  paddingBottom: 8,
  ".title": {
    fontWeight: 600,
    fontSize: 14,
  },
});

export const StyledChangeOrder = styled(Box)({
  position: "relative",
  height: 0,
  display: "flex",
  justifyContent: "center",
  width: "100%",
  alignItems: "center",
  zIndex: 5,
  button: {
    background: "#4F4974",
    borderRadius: 15,
    width: 45,
    height: 45,
    transition: "0s all",
    "&:hover": {
      background: darkStyles.button,
    },
  },
});

const smallInputFontSize = 14;

const getSmallInputStyles = () => {
  return {
    padding: "7px 15px",
    borderRadius: 10,
    background: darkStyles.lightBg,
  };
};

export const StyledPoweredByOrbs = styled(Components.PoweredBy)({
  marginTop: 30,
});

export const StyledLimitPrice = styled(Components.Base.Card)({
  ".twap-limit-price-input": {
    borderRadius: 15,
    padding: "10px 10px",
    position: "relative",
    "&:before": {
      ...overlayStyles,
      background: "rgba(255, 255, 255, 0.2)",
    },
    ".twap-input": {
      position: "relative",
      borderRadius: 12,
      "&:before": {
        ...overlayStyles,
        background: "rgba(0, 0, 0, 0.15)",
      },
      input: {
        height: 40,
        position: "relative",
        fontSize: 16,
      },
    },
  },
});

export const StyledTradeSize = styled(Components.Base.Card)({
  ".twap-token-logo": {
    width: 25,
    height: 25,
  },
  ".twap-input": {
    width: "fit-content",
    maxWidth: 100,
    height: "100%",
    ...getSmallInputStyles(),
    input: {
      fontSize: smallInputFontSize,
    },
  },
});

export const StyledTradeInterval = styled(Components.Base.Card)({
  ".twap-input": {
    marginLeft: "auto",
    width: 100,
    input: {
      textAlign: "center!important",
      padding: "0px!important",
      fontSize: smallInputFontSize,
    },
    ...getSmallInputStyles(),
  },
});

export const StyledMaxDuration = styled(Components.Base.Card)({
  ".twap-input": {
    marginLeft: "auto",
    ...getSmallInputStyles(),
    width: 100,
    input: {
      textAlign: "center!important",
      padding: "0px!important",
      fontSize: smallInputFontSize,
    },
  },
});

export const StyledSubmit = styled(Components.SubmitButton)({
  ...getButtonStyles(),
  height: 47,
});

export const StyledWarningMsg = styled(Components.WarningMessage)({
  background: "#DF3C64F5",
  borderRadius: 15,
  svg: {
    width: 22,
    height: 22,
  },
  p: {
    fontSize: 14,
  },
});

export const configureStyles = () => {
  return {
    ".odnp": {
      "*": {
        color: "black",
      },
    },
    ".twap-odnp": {
      background: darkStyles.button,
      border: "unset",
      borderRadius: "20px!important",
    },
    ".twap-modal": {
      ".MuiBackdrop-root": {
        backdropFilter: "blur(15px)",
        background: "rgba(26, 28, 48, 0.50)",
      },
    },
    ".twap-modal-content": {
      overflowY: "auto",
      background: "#34385F",
      borderRadius: 30,
      padding: "50px 20px 20px 20px",
      maxWidth: "600px!important",
      "*": {
        "-ms-overflow-style": "none",
      },
      "&::-webkit-scrollbar": {
        display: "none",
      },
      ".twap-card": {
        background: "#45497D",
        "&:before": {
          display: "none",
        },
      },
    },
    ".twap-disclaimer-text": {
      paddingRight: 15,
      fontSize: 14,
      "p, *": {
        fontSize: "inherit",
      },
    },
    ".twap-order-summary-details-item-right": {
      fontSize: 14,
      "*": {
        fontSize: "inherit",
      },
    },
    ".twap-token-display": {
      ".twap-token-logo": {
        width: 50,
        height: 50,
      },
      ".twap-token-name": {},
    },

    ".twap-button-disabled": {
      opacity: "0.5!important",
    },
    ".twap-usd-zero": {
      opacity: 0.5,
    },
    ".twap-tooltip": {
      "*": {
        fontFamily: "inherit",
      },
      ".MuiTooltip-tooltip": {
        background: "#44486D",
        borderRadius: 15,
        padding: "10px 15px",
        fontSize: 13,

        ".MuiTooltip-arrow": {
          display: "none",
        },
      },
    },
    ".twap-time-selector-selected": {
      ...getButtonStyles(),
      height: 32,
      borderRadius: 10,
      P: {
        fontWeight: "400!important",
      },
    },
    ".twap-time-selector-list": {
      background: "#44486D",
      "&-item": {
        "&:hover": {
          background: "rgba(255,255,255, 0.03)",
        },
      },
    },
    ".twap-input": {
      input: {
        fontWeight: 400,
        fontFamily: "inherit",
        color: darkStyles.textColor,
        "&::placeholder": {
          color: `${darkStyles.textColor}!important`,
          opacity: 0.5,
        },
      },
    },
    ".twap-loader": {
      background: "rgba(255,255,255, 0.1)!important",
    },
    ".twap-card": {
      borderRadius: 25,
      padding: "14px 18px",
      position: "relative",
      "*": {
        position: "relative",
      },

      "&:before": {
        ...overlayStyles,
        background: "rgba(255, 255, 255, 0.3)",
      },
    },
    ".twap-label": {
      p: {
        fontWeight: 600,
        fontSize: 14,
      },
    },

    ".twap-slider": {
      ".MuiSlider-valueLabel": {
        background: "#44486D",
      },
    },
    ".twap-switch": {
      ".MuiSwitch-track": {
        background: "#29253A",
        opacity: "1!important",
      },
      ".Mui-checked+.MuiSwitch-track": {
        background: "#6C5EC9!important",
      },
    },
    //orders
    ".twap-orders": {
      ".twap-order-expanded-row": {
        ".twap-label": {
          "*": {
            fontWeight: 400,
          },
        },
      },
      ".twap-market-price-section": {
        ".twap-label": {
          "*": {
            fontWeight: 400,
          },
        },
        position: "relative",
        padding: "5px 15px",
        borderRadius: 15,
        "&:before": {
          ...overlayStyles,
          background: "rgba(255, 255, 255, 0.2)",
        },
        ".twap-price-compare": {
          "*": {
            fontSize: 13,
          },
        },
      },
    },

    ".twap-orders-header": {
      padding: "0px!important",
      ".MuiTabs-root": {
        height: 50,
        background: "#333248",
        border: "unset",
        padding: 0,
        borderRadius: 30,
      },
      ".Mui-selected": {
        color: "white!important",
      },
      ".MuiTabs-indicator": {
        background: "#484566",
        borderRadius: "30px!important",
      },
    },
  };
};

export const StyledSeparator = styled(Box)({
  width: "100%",
  height: 2,
  background: darkStyles.lightBg,
});
