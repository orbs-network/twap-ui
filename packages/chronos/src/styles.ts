import { Box, createTheme, styled, Theme } from "@mui/material";
import { Components, Styles } from "@orbs-network/twap-ui";

export const lightTheme = createTheme({
  palette: {
    mode: "light",
    text: {
      primary: "#535992",
    },
  },

  typography: {
    fontFamily: "TT Firs Neue Trl",
  },
});
const isDark = (theme: Theme) => theme.palette.mode === "dark";

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    text: {
      primary: "#ffffff",
    },
  },
  typography: {
    fontFamily: "TT Firs Neue Trl",
  },
});

const darkStyles = {
  lightBg: "#454062",
  textColor: "white",
  button: "linear-gradient(49deg, #3F4AB3 0%, #7A64D0 100%)",
  icon: "white",
  confirmationBorder: "rgba(113, 122, 196, 0.3)",
  border: "#555879",
};

const lightStyles = {
  lightBg: "rgba(255,255,255, 0.5)",
  textColor: "#535992",
  button: "linear-gradient(49deg, #7079D2 0%, #9A89DF 100%)",
  icon: "#535992",
  confirmationBorder: "rgba(83, 89, 146, 0.2)",
  border: "#C5C7DB",
};

const baseStyles = (theme: Theme) => {
  return isDark(theme) ? darkStyles : lightStyles;
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

export const StyledUSD = styled(Styles.StyledRowFlex)<{ disabled: number }>(({ theme, disabled }) => {
  const styles = baseStyles(theme);

  const darkTheme = isDark(theme);
  const disabledFigureColor = !darkTheme ? "#9196C6" : "";
  return {
    overflow: "hidden",
    background: disabled ? "unset" : darkTheme ? "unset" : "#E0E0F5",
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
      color: styles.textColor,
    },
    figure: {
      background: disabled ? disabledFigureColor : darkTheme ? "#44486D" : styles.button,
      color: darkTheme ? "inherit" : "white",
      padding: 0,
      margin: 0,
      borderRadius: 100,
      width: 45,
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      fontFamily: "Space Grotesk!important",
    },
    "&:before": {
      display: disabled ? "block" : darkTheme ? "block" : "none",
      ...overlayStyles,
      background: "rgba(255, 255, 255, 0.2)",
    },
  };
});

export const StyledTokenPanelInput = styled(Components.TokenInput)({
  width: "100%",
  input: {
    fontSize: 30,
    fontWeight: "300!important",
  },
});

export const StyledPercentSelect = styled(Styles.StyledRowFlex)(({ theme }) => {
  const styles = baseStyles(theme);

  return {
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
      color: styles.textColor,
      transition: "0.2s all",
      position: "relative",
      background: "transparent",
      "&:hover": {
        background: styles.button,
        p: {
          color: "white",
        },
        "&:before": {
          display: "none",
        },
      },
      "&:before": {
        ...overlayStyles,
        background: isDark(theme) ? "rgba(255, 255, 255, 0.3)" : "rgba(255, 255, 255, 0.6)",
      },
    },
  };
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

export const StyledChunksSlider = styled(Components.Base.Card)(({ theme }) => {
  const darkMode = isDark(theme);
  return {
    padding: "5px 20px",
    borderRadius: 100,
    width: "100%",
    ".twap-slider": {
      width: "100%",
      marginLeft: 0,
      "& .MuiSlider-thumb": {
        background: darkMode ? "white" : "#535992",
        width: 14,
        height: 14,
      },
      ".MuiSlider-track": {
        background: darkMode ? "linear-gradient(270deg, #555879 0%, #464965 100%)" : "#A2A6C3",
        border: "unset",
        opacity: 1,
      },
      ".MuiSlider-rail": {
        background: darkMode ? "#221E31" : "#ECEFF4",
        opacity: 1,
      },
    },
  };
});
export const StyledOrders = styled(Styles.StyledColumnFlex)(({ theme }) => ({
  gap: 40,
  color: theme.palette.text.primary,
  "*": {
    color: "inherit",
  },
  ".twap-order-separator": {
    background: baseStyles(theme).border,
  },
}));

export const StyledOrdersHeader = styled(Styles.StyledRowFlex)({});

export const StyledOrderHeaderRight = styled(Styles.StyledRowFlex)({
  height: 38,
  justifyContent: "space-between",
  marginLeft: "auto",
  width: "auto",
});

export const StyledOrdersTabs = styled(Components.Orders.OrdersSelectTabs)(({ theme }) => {
  const styles = baseStyles(theme);
  return {
    marginLeft: "auto",
    minHeight: "unset",
    padding: "unset",
    border: "unset",
    height: "100%",
    width: "auto",
    ".MuiTabs-flexContainer": {
      height: "100%",
    },
    ".MuiTabs-indicator, .MuiTouchRipple-root": {
      display: "none",
    },
    ".MuiTab-root": {
      minHeight: "unset",
      height: "100%",
      background: "rgba(85, 88, 121, 0.30)",
      borderRadius: 20,
      fontSize: 14,
      width: "auto",
      padding: "0px 20px",
      marginLeft: 10,
      lineHeight: "normal",
      fontWeight: 400,
      color: styles.textColor,
    },
    ".Mui-selected": {
      background: styles.button,
      color: "white!important",
    },
  };
});

export const StyledOrdersList = styled(Components.Orders.SelectedOrders)(({ theme }) => {
  const darkTheme = isDark(theme);
  return {
    width: "100%",
    ".twap-order": {
      padding: 25,
      ".MuiLinearProgress-root": {
        background: darkTheme ? darkStyles.lightBg : "#ECEFF4",
        "&::after": {
          display: "none",
        },
      },
      ".MuiLinearProgress-bar": {
        background: darkTheme ? "#5253BD" : "#A2A6C3",
      },
      ".twap-market-price-section": {
        marginBottom: 5,
      },
      ".twap-extended-order-info": {
        gap: 15,
      },
      ".twap-label p": {
        fontSize: 15,
        fontWeight: 500,
      },
    },
  };
});
export const StyledTokenSelect = styled(Styles.StyledColumnFlex)(({ theme }) => {
  const styles = baseStyles(theme);

  return {
    background: styles.lightBg,
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
      color: styles.textColor,
    },
    ".twap-token-logo": {
      width: 45,
      height: 45,
    },
    svg: {
      position: "relative",
      top: -2,
      "*": {
        color: styles.textColor,
      },
    },
  };
});

export const StyledTokenInputBalance = styled(Styles.StyledRowFlex)(({ theme }) => {
  const styles = baseStyles(theme);
  return {
    position: "absolute",
    width: 175,
    right: 22,
    top: 0,
    padding: "7px 14px",
    background: styles.lightBg,
    borderRadius: "0px 0px 20px 20px",
    svg: {
      width: 19,
      height: 17,
    },
    ".twap-balance": {
      maxWidth: 120,
    },
    "*": {
      color: styles.textColor,
      fontSize: 12,
    },
  };
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

export const StyledChangeOrder = styled(Box)(({ theme }) => ({
  position: "relative",
  height: 0,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  marginLeft: "auto",
  marginRight: "auto",
  zIndex: 5,
  button: {
    background: isDark(theme) ? "#4F4974" : lightStyles.button,
    borderRadius: 15,
    width: 45,
    height: 45,
    transition: "0s all",
    "&:hover": {
      background: darkStyles.button,
    },
    svg: {
      "*": {
        color: "white",
      },
    },
  },
}));

export const StyledPoweredByOrbs = styled(Components.PoweredBy)(({ theme }) => ({
  a: {
    flexDirection: "column",
    img: {
      width: 26,
      height: 26,
      order: 1,
    },
    p: {
      order: 2,
      opacity: isDark(theme) ? 0.4 : 1,
      fontSize: 14,
    },
  },
  marginTop: 30,
}));

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

export const StyledTimeSelectCard = styled(StyledDisabledCard)(({ theme }) => {
  const darkTheme = isDark(theme);
  const styles = baseStyles(theme);
  return {
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
        border: `1px solid ${styles.border}`,
        borderRadius: 20,
        textIndent: 10,
      },
    },
    ".twap-time-selector-selected": {
      background: darkTheme ? "rgba(85, 88, 121, 0.30)" : styles.button,
      padding: "0px 20px",
      borderRadius: 20,
      height: 40,
      p: {
        fontSize: 14,
        fontWeight: 400,
        color: "white",
      },
      svg: {
        transform: "rotate(180deg)",
        "*": { color: "white" },
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
  };
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
    "*": {
      color: "white",
    },
  },
  p: {
    fontSize: 14,
    color: "white",
  },
});

export const StyledBigBorder = styled(Styles.StyledRowFlex)(({ theme }) => {
  const styles = baseStyles(theme);
  return {
    width: "auto",
    gap: 0,
    height: 60,
    border: `1px solid ${styles.border}`,
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
  };
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

export const configureStyles = (theme: Theme) => {
  const styles = baseStyles(theme);

  const darkTheme = isDark(theme);

  return {
    ".twap-odnp-button": {},
    ".twap-container": {
      color: styles.textColor,
    },
    ".twap-market-price": {
      width: "auto!important",
    },
    ".twap-price-compare": {
      border: `1px solid ${styles.border}`,
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
        color: styles.icon,
      },
    },
    ".twap-limit-reset": {
      "*": {
        stroke: styles.icon,
      },
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
      color: styles.textColor,
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
    ".twap-button-loading": {
      opacity: "1!important",
    },
    ".twap-button-loader": {
      color: "white!important",
    },
    ".twap-usd-zero": {
      opacity: 0.5,
    },
    ".twap-tooltip": {
      "*": {
        fontFamily: "inherit",
      },
      ".MuiTooltip-tooltip": {
        background: darkTheme ? "#44486D" : "white",
        borderRadius: 15,
        padding: "10px 15px",
        fontSize: 13,
        color: styles.textColor,
        "*": {
          color: "inherit",
        },
        ".MuiTooltip-arrow": {
          display: "none",
        },
      },
    },

    ".twap-time-selector-list": {
      background: darkTheme ? "#44486D" : "white",
      "&-item": {
        "&:hover": {
          background: darkTheme ? "rgba(255,255,255, 0.03)" : "rgba(0,0,0, 0.03)",
        },
      },
    },
    ".twap-input": {
      input: {
        fontWeight: 400,
        fontFamily: "inherit",
        color: styles.textColor,
        "&::placeholder": {
          color: `${styles.textColor}!important`,
          opacity: 0.5,
        },
      },
    },
    ".twap-loader": {
      background: darkTheme ? "rgba(255,255,255, 0.1)!important" : "#CDD0E0!important",
    },
    ".twap-input-loader": {
      background: darkTheme ? "rgba(255,255,255, 0.1)!important" : "#CDD0E0!important",
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
        background: "rgba(255, 255, 255, 0.31)",
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
        borderRadius: 10,
        background: darkTheme ? "#44486D" : "white",
      },
    },
    ".twap-switch": {
      ".MuiSwitch-switchBase": {},

      ".MuiSwitch-switchBase.Mui-checked": {},
      ".MuiSwitch-thumb": {
        background: "#4F4974",
      },
      ".Mui-checked .MuiSwitch-thumb": {
        background: darkTheme ? "white" : styles.button,
      },
      ".MuiSwitch-track": {
        border: `1.5px solid ${styles.border}`,
        background: "transparent!important",
        opacity: "1!important",
      },
      ".Mui-checked+.MuiSwitch-track": {
        background: "transparent!important",
        border: `1.5px solid ${styles.border}!important`,
      },
    },
  };
};

export const StyledSeparator = styled(Box)({
  width: "100%",
  height: 2,
  background: darkStyles.lightBg,
});
