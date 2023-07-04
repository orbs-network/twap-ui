import { Box, styled } from "@mui/material";
import { Components, Styles } from "@orbs-network/twap-ui";

const darkStyles = {
  lightBg: "#454062",
  textColor: "white",
  button: "linear-gradient(49deg, #3F4AB3 0%, #7A64D0 100%)",
  icon: "white",
  confirmationBorder: "rgba(113, 122, 196, 0.3)",
};

export const StyledCardColumn = styled(Styles.StyledColumnFlex)({
  gap: 18,
});

export const StyledDisabledCard = styled(Components.Base.Card)<{ disabled: number }>(({ disabled }) => ({
  ".twap-card-children": {
    opacity: disabled ? 0.5 : 1,
    pointerEvents: disabled ? "none" : "unset",
  },
}));
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
  width: "100%",
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
  "@media(max-width: 600px)": {
    ".twap-token-panel-flex-right-bottom": {
      gap: 20,
      flexDirection: "column",
      alignItems: "flex-start",
    },
  },
});

export const StyledChunksSlider = styled(Components.Base.Card)({
  padding: "5px 20px",
  borderRadius: 100,
  width: "100%",
  ".twap-slider": {
    width: "100%",
    marginLeft: 0,
    "& .MuiSlider-thumb": {
      background: "linear-gradient(0deg, #FFF 0%, #FFF 100%), #FFF",
      width: 14,
      height: 14,
    },
    ".MuiSlider-track": {
      background: "linear-gradient(270deg, #555879 0%, #464965 100%)",
      border: "unset",
      opacity: 1,
    },
    ".MuiSlider-rail": {
      background: "#221E31",
      opacity: 1,
    },
  },
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
  svg: {
    position: "relative",
    top: -2,
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

export const StyledMarketPrice = styled(Components.Base.Card)<{ disabled: number }>(({ disabled }) => ({
  paddingTop: 20,
  paddingBottom: 20,
  ".twap-market-price": {
    width: "100%!important",
    justifyContent: "space-between",
  },
  ".twap-price-compare": {
    opacity: disabled ? 0.5 : 1,
  },
  ".title": {
    fontWeight: 400,
    fontSize: 16,
  },
}));

export const StyledChangeOrder = styled(Box)({
  position: "relative",
  height: 0,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  marginLeft: "auto",
  marginRight: "auto",
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

export const StyledPoweredByOrbs = styled(Components.PoweredBy)({
  marginTop: 30,
});

export const StyledLimitPrice = styled(StyledDisabledCard)({
  paddingBottom: 30,
  paddingTop: 25,
  ".twap-limit-price-input": {
    padding: "0px",
    position: "relative",

    ".twap-input": {
      position: "relative",

      input: {
        height: 40,
        position: "relative",
        fontSize: 16,
      },
    },
  },
});

export const StyledLimitPriceInput = styled(Styles.StyledRowFlex)({});

export const StyledTradeSize = styled(StyledDisabledCard)({
  paddingBottom: 30,
  paddingTop: 25,
  ".twap-tooltip-children": {
    flex: 1,
  },

  ".twap-trade-size-value": {
    fontSize: 14,
    position: "relative",
    top: 2,
  },
  ".twap-input": {
    width: "100%",
    height: "100%",
    input: {
      fontSize: 14,
      textAlign: "left!important",
    },
  },
  "@media(max-width: 600px)": {
    fontSize: 10,
    minWidth: "unset",
  },
});

export const StyledTimeSelectCard = styled(StyledDisabledCard)({
  ".twap-input": {
    marginLeft: "auto",
    width: 65,
    height: 40,
    div: {
      height: "100%",
    },
    input: {
      height: "100%",
      textAlign: "left!important",
      fontSize: 14,
      border: "1px solid #555879",
      borderRadius: 20,
      textIndent: 10,
    },
  },
  ".twap-time-selector-selected": {
    background: "rgba(85, 88, 121, 0.30)",
    padding: "0px 20px",
    borderRadius: 20,
    height: 40,
    p: {
      fontSize: 14,
      fontWeight: 400,
    },
    svg: {
      transform: "rotate(180deg)",
    },
  },
  "@media(max-width: 600px)": {
    ".twap-time-selector": {
      marginLeft: "auto",
    },
    ".twap-trade-interval-flex": {
      gap: 20,
      flexDirection: "column",
      alignItems: "flex-start",
    },
  },
});

export const StyledSubmit = styled(Components.SubmitButton)({
  background: darkStyles.button,
  border: "unset",
  borderRadius: 15,
  fontSize: 14,
  color: "white",
  transition: "0.2s all",
  height: 47,
  padding: "0px 20px",
  fontFamily: "inherit",
  fontWeight: 400,
  "*": {
    fontSize: "inherit",
    color: "inherit",
    fontWeight: "inherit",
  },
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

export const StyledBigBorder = styled(Styles.StyledRowFlex)({
  width: "auto",
  gap: 0,
  height: 60,
  border: "1px solid rgba(85, 88, 121, 1)",
  borderRadius: 20,
  padding: 12,
  ".twap-icon-btn": {
    width: "100%",
    height: "100%",
  },
  ".twap-input": {
    height: "100%",
    div: {
      height: "100%",
    },
    input: {
      height: "100%",
    },
  },
  "*": {
    fontSize: 14,
    fontWeight: 400,
  },
  ".twap-token-logo": {
    width: 35,
    height: 35,
  },
});

export const StyledRecipient = styled(Components.Base.Card)({
  background: "rgba(61, 67, 117, 0.3)!important",
  borderRadius: "unset",
  padding: "20px 30px",
});

export const StyledStyledDisclaimerTextCard = styled(Components.Base.Card)({
  paddingRight: 10,
});

export const StyledDisclaimerText = styled(Components.DisclaimerText)({
  maxHeight: 200,
  paddingRight: 10,
  "*": {
    opacity: 0.7,
  },
});

export const StyledOrderSummaryModalHeader = styled(Styles.StyledRowFlex)({
  justifyContent: "flex-start",
  borderBottom: `2px solid ${darkStyles.confirmationBorder}`,
  paddingBottom: 20,
  marginBottom: 40,
  gap: 2,
  p: {
    fontSize: 20,
    fontWeight: 500,
  },
  svg: {
    width: 33,
    height: 33,
  },
});

export const StyledDisclaimer = styled(Components.AcceptDisclaimer)({
  marginTop: 20,
});
export const StyledOrderSummaryModalPadding = styled(Box)({
  padding: "0px 30px",
  width: "100%",
});
export const StyledOrderSummaryModal = styled(Components.OrderSummaryModalContainer)({
  ".twap-ui-close": {
    display: "none",
  },
  ".twap-modal-content": {
    padding: "30px 0px 30px 0px",
    ".twap-label": {
      p: {
        fontWeight: 500,
        fontSize: 15,
      },
    },
  },

  ".twap-order-summary-details": {
    gap: 20,
  },
  ".twap-order-summary-details-item": {
    borderBottom: `2px solid ${darkStyles.confirmationBorder}`,
    paddingBottom: 15,

    "&-right": {
      "*": {
        fontSize: 18,
        fontWeight: 300,
      },
    },
    "&:last-child": {
      border: "unset",
    },
  },
});

export const configureStyles = () => {
  return {
    ".twap-market-price": {
      width: "auto!important",
    },
    ".twap-price-compare": {
      border: "1px solid rgba(85, 88, 121, 1)",
      borderRadius: 100,
      padding: "0px 18px",
      height: 34,

      ".twap-token-logo": {
        width: 16,
        height: 16,
        minWidth: 16,
        minHeight: 16,
      },
      "p, span": {
        position: "relative",
        top: 2,
        fontSize: 14,
      },
    },
    ".twap-icon": {
      "*": {
        color: darkStyles.icon,
        // stroke: darkStyles.icon,
      },
    },
    ".twap-limit-reset": {
      "*": {
        stroke: darkStyles.icon,
      },
    },
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
    ".twap-input-loader": {
      background: "rgba(255,255,255, 0.1)!important",
      maxWidth: "60%",
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
        fontWeight: 400,
        fontSize: 16,
      },
    },

    ".twap-slider": {
      ".MuiSlider-valueLabel": {
        background: "#44486D",
      },
    },
    ".twap-switch": {
      height: "24px!important",
      width: "45px!important",

      ".MuiSwitch-switchBase": {
        margin: "10%!important",
      },
      ".MuiSwitch-input": {
        width: "400%!important",
        height: "40px!important",
        top: "-10px!important",
      },
      ".MuiSwitch-switchBase.Mui-checked": {
        transform: "translateX(22px)!important",
      },
      ".MuiSwitch-thumb": {
        width: "15px!important",
        height: "15px!important",
        background: "#4F4974",
      },
      ".Mui-checked .MuiSwitch-thumb": {
        background: "white",
      },
      ".MuiSwitch-track": {
        border: "1.5px solid #4F4974",
        background: "transparent!important",
        opacity: "1!important",
      },
      ".Mui-checked+.MuiSwitch-track": {
        background: "transparent!important",
        border: "1.5px solid #4F4974!important",
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
