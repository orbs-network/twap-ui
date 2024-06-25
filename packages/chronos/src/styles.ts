import { Box, createTheme, Menu, styled, Theme } from "@mui/material";
import { Components, Styles } from "@orbs-network/twap-ui";

const mobile = 700;

const MOBILE_FONT_SIZE = 11;

export const lightTheme = createTheme({
  palette: {
    mode: "light",
    text: {
      primary: "#535992",
    },
  },

  typography: {
    fontFamily: "inherit",
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
    fontFamily: "inherit",
  },
});

const darkStyles = {
  textColor: "white",
  gradient: "linear-gradient(49deg, #3F4AB3 0%, #7A64D0 100%)",
  icon: "white",
  confirmationBorder: "rgba(113, 122, 196, 0.3)",
  border: "#555879",
  hoverGradient: "linear-gradient(49deg, #6D78E4 0%, #7A64D0 100%)",
  cardBg: "#5558794D",
};

const lightStyles = {
  textColor: "#535992",
  gradient: "linear-gradient(49deg, #7079D2 0%, #9A89DF 100%)",
  icon: "#535992",
  confirmationBorder: "rgba(83, 89, 146, 0.2)",
  border: "#C5C7DB",
  hoverGradient: "linear-gradient(49deg, #9A89DF 0%, #7774D2 54.17%, #7079D2 100%)",
  cardBg: "rgba(255,255,255, 0.5)",
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

export const StyledUSD = styled(Styles.StyledRowFlex)<{ disabled: number }>(({ theme }) => {
  const styles = baseStyles(theme);
  const darkTheme = isDark(theme);
  return {
    overflow: "hidden",
    background: styles.cardBg,
    ".twap-usd": {
      maxWidth: 60,
    },
    ".twap-number-display": {
      marginTop: 10,
    },
    width: 111,
    borderRadius: 100,
    height: 35,
    justifyContent: "flex-start",
    "*": {
      fontSize: 14,
      color: styles.textColor,
    },
    figure: {
      background: darkTheme ? styles.cardBg : "#9196C6",
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
    },
    "&:hover": {
      background: darkTheme ? "#454168" : "",
      figure: {
        background: styles.gradient,
      },
    },
    [`@media(max-width: ${mobile}px)`]: {
      gap: 5,
      width: 70,
      height: 23,
      "*": {
        fontSize: MOBILE_FONT_SIZE,
      },
      figure: {
        width: 26,
        paddingTop: 1,
        fontSize: MOBILE_FONT_SIZE,
      },
    },
  };
});

export const StyledTokenPanelInput = styled(Components.TokenPanelInput)({
  width: "100%",
  input: {
    fontSize: 30,
    fontWeight: "400!important",
    "&:hover": {
      "&::placeholder": {
        opacity: 1,
      },
    },
    [`@media(max-width: ${mobile}px)`]: {
      fontSize: 16,
    },
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

      color: styles.textColor,
      transition: "0s all",
      position: "relative",
      background: styles.cardBg,
      overflow: "hidden",
      p: {
        fontSize: 14,
        fontFamily: "inherit",
      },
      "&:hover": {
        background: styles.gradient,
        p: {
          color: "white",
        },
      },
      "&:before": {
        background: isDark(theme) ? "rgba(255, 255, 255, 0.3)" : "rgba(255, 255, 255, 0.6)",
      },
    },
    [`@media(max-width: ${mobile}px)`]: {
      button: {
        padding: "5px 8px",
        p: {
          fontSize: 10,
        },
      },
    },
  };
});

export const StyledPanelRight = styled(Styles.StyledColumnFlex)({
  gap: 8,
  width: "auto",
  flex: 1,
  padding: "25px 25px 25px 0px",
  [`@media(max-width: ${mobile}px)`]: {
    padding: "24px 19px 21px 0px",
    ".twap-token-panel-flex-right-bottom": {
      gap: 10,
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
  gap: 25,
  color: theme.palette.text.primary,
  "*": {
    color: "inherit",
  },
  ".twap-order-separator": {
    background: baseStyles(theme).border,
  },
}));

export const StyledOrdersHeader = styled(Styles.StyledRowFlex)({
  [`@media(max-width: ${mobile}px)`]: {
    flexDirection: "row!important",
    justifyContent: "space-between",
    alignItems: "center!important",
    ".twap-label": {
      p: {
        fontSize: "11px!important",
      },
    },
    ".twap-icon": {
      width: 20,
      height: 20,
    },
  },
});

export const StyledOrderHeaderRight = styled(Styles.StyledRowFlex)({
  height: 38,
  justifyContent: "space-between",
  marginLeft: "auto",
  width: "auto",
  [`@media(max-width: ${mobile}px)`]: {
    height: 30,
  },
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
      background: isDark(theme) ? "rgba(85, 88, 121, 0.30)" : "rgba(255, 255, 255, 0.5)",
      borderRadius: 20,
      fontSize: 14,
      width: "auto",
      padding: "0px 20px",
      marginLeft: 10,
      lineHeight: "normal",
      fontWeight: 400,
      color: styles.textColor,
      position: "relative",
      "&:hover": {
        background: styles.gradient,
      },
    },
    ".Mui-selected": {
      background: styles.gradient,
      color: "white!important",
    },
  };
});

export const StyledOrdersList = styled(Components.Orders.SelectedOrders)(({ theme }) => {
  const darkTheme = isDark(theme);
  const styles = baseStyles(theme);
  return {
    width: "100%",
    ".twap-orders-empty-list": {
      background: styles.cardBg,
      borderRadius: 30,
      paddingBottom: 40,
    },
    ".twap-order": {
      padding: 25,
      ".MuiLinearProgress-root": {
        borderRadius: 30,
        background: darkTheme ? darkStyles.cardBg : "#F5F9FE",
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
      [`@media(max-width: ${mobile}px)`]: {
        "*": {
          fontSize: "11px!important",
        },
      },
    },
  };
});
export const StyledTokenSelect = styled(Styles.StyledColumnFlex)(({ theme }) => {
  const styles = baseStyles(theme);

  return {
    background: styles.cardBg,
    width: 100,
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
    "&:hover": {
      background: styles.gradient,
      svg: {
        "*": {
          color: "white",
        },
      },
      ".twap-token-name": {
        color: "white",
      },
    },
    [`@media(max-width: ${mobile}px)`]: {
      width: 65,
      padding: "0px 5px",
      ".twap-token-logo": {
        width: 28,
        height: 28,
      },
      ".twap-token-svg": {
        width: "28px!important",
        height: "28px!important",
      },
      ".twap-token-name": {
        fontSize: MOBILE_FONT_SIZE,
      },
    },
  };
});

export const StyledTokenInputBalance = styled(Styles.StyledRowFlex)(({ theme }) => {
  const styles = baseStyles(theme);
  return {
    position: "absolute",
    width: 180,
    right: 25,
    top: 0,
    padding: "7px 14px",
    background: styles.cardBg,
    borderRadius: "0px 0px 20px 20px",
    svg: {
      width: 19,
      height: 17,
    },

    "*": {
      color: styles.textColor,
      fontSize: 12,
      fontWeight: 400,
    },
    "&:hover": {
      background: styles.gradient,
      "*": {
        color: "white",
      },
    },
    [`@media(max-width: ${mobile}px)`]: {
      right: 20,
      "*": {
        fontSize: MOBILE_FONT_SIZE,
      },
    },
  };
});

export const StyledTokenPanel = styled(Components.Base.Card)({
  padding: 0,
  display: "flex",
  gap: 20,
  alignItems: "stretch",
  [`@media(max-width: ${mobile}px)`]: {
    gap: 15,
  },
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
  [`@media(max-width: ${mobile}px)`]: {
    ".title": {
      fontSize: MOBILE_FONT_SIZE,
    },
    paddingTop: 14,
    paddingBottom: 14,
    ".twap-price-compare": {
      padding: "0px 7px",
      ".twap-token-logo": {
        width: 16,
        height: 16,
        minWidth: 16,
        minHeight: 16,
      },
      "*": {
        fontSize: MOBILE_FONT_SIZE,
      },
    },
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
    background: isDark(theme) ? "rgb(79 73 116)" : "#9196C6",
    borderRadius: 15,
    width: 50,
    height: 50,
    transition: "0s all",
    [`@media(max-width: ${mobile}px)`]: {
      width: 30,
      height: 30,
      borderRadius: 10,
      svg: {
        width: 16,
        height: 16,
      },
    },
    "&:hover": {
      background: baseStyles(theme).gradient,
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
    color: baseStyles(theme).textColor,
    gap: 20,
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
  [`@media(max-width: ${mobile}px)`]: {
    paddingBottom: 17,
    paddingTop: 17,
    "*": {
      fontSize: MOBILE_FONT_SIZE,
    },
  },
});

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
  [`@media(max-width: ${mobile}px)`]: {
    fontSize: MOBILE_FONT_SIZE,
    minWidth: "unset",
    paddingBottom: 17,
    paddingTop: 17,
    ".twap-chunks-left": {
      width: "65%",
      justifyContent: "flex-start",
    },
    ".twap-chunks-right": {
      width: "35%!important",
    },
    ".twap-chunks-middle": {
      width: "100%",
      height: "auto",
      padding: "10px 20px",
    },
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
      background: darkTheme ? "rgba(85, 88, 121, 0.30)" : styles.gradient,
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
    [`@media(max-width: ${mobile}px)`]: {
      ".twap-input": {
        input: {
          fontSize: 14,
        },
      },
      ".twap-time-selector-selected": {
        padding: "0px 12px",
        P: {
          fontSize: MOBILE_FONT_SIZE,
        },
      },
    },
  };
});

const buttonStyles = (theme: Theme) => {
  const styles = baseStyles(theme);
  return {
    background: `${styles.gradient}!important`,
    border: "unset",
    borderRadius: 15,
    fontSize: "14px!important",
    color: "white",
    transition: "0.2s all",
    height: 47,
    padding: "0px 20px",
    fontFamily: "inherit",
    fontWeight: 400,
    position: "relative",
    overflow: "hidden",
    ".twap-button-children": {
      position: "relative",
      zIndex: 2,
    },
    "*": {
      fontSize: "14px!important",
      color: "inherit",
      fontWeight: "400",
    },
    "&:hover": {
      "&::after": {
        opacity: 1,
      },
    },
    [`@media(max-width: ${mobile}px)`]: {
      fontSize: 12,
    },
  };
};

export const StyledSubmit = styled(Components.SubmitButton)({});

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
    [`@media(max-width: ${mobile}px)`]: {
      height: 38,
      padding: "0px 12px",
      ".twap-token-logo": {
        width: 22,
        height: 22,
      },
    },
  };
});

export const StyledRecipient = styled(Components.Base.Card)(({ theme }) => {
  return {
    background: isDark(theme) ? "rgba(61, 67, 117, 0.3)!important" : "white!important",
    borderRadius: "unset",
    padding: "20px 30px",
    "@media(max-width: 700px)": {
      ".twap-recipient-flex": {
        flexDirection: "column",
        gap: 20,
        alignItems: "center",
      },
    },
  };
});

export const StyledStyledDisclaimerTextCard = styled(Components.Base.Card)(({ theme }) => {
  const styles = baseStyles(theme);
  return {
    paddingRight: 10,
    a: {
      color: styles.textColor,
      fontWeight: 500,
    },
  };
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
  paddingBottom: 10,
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
  "@media(max-width: 600px)": {
    marginBottom: 20,
    p: {
      fontSize: 16,
    },
    svg: {
      width: 23,
      height: 23,
    },
  },
});

export const StyledDisclaimer = styled(Components.AcceptDisclaimer)({
  marginTop: 20,
});
export const StyledOrderSummaryModalPadding = styled(Box)({
  padding: "0px 30px",
  width: "100%",
  "@media(max-width: 600px)": {
    padding: "0px 15px",
  },
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
        fontSize: 17,
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
    ".twap-odnp-modal": {
      ".twap-modal-content": {
        maxWidth: "930px!important",
      },
      ".twap-ui-close": {
        display: "none",
      },
      ".twap-odnp-separator": {
        display: "none",
      },
      ".twap-odnp-sections": {
        marginTop: 100,
      },
      ".twap-odnp-title": {
        fontSize: "25px!important",
        fontWeight: "500!important",
      },
      ".twap-odnp-section": {
        maxWidth: 360,
        background: isDark(theme) ? "#4F547D" : "white",
        borderRadius: 30,
        flex: 1,
        padding: "80px 30px 50px 30px",
        position: "relative",
      },
      ".twap-odnp-section-title": {
        fontSize: "16px!important",
        fontWeight: "400!important",
      },
      ".twap-odnp-header": {
        gap: "10px!important",
      },
      ".twap-odnp-subtitle": {
        fontSize: "14px!important",
      },
      ".twap-odnp-left-buttons": {
        flexDirection: "row",
        ".twap-odnp-link": {
          width: "50%!important",
          p: {
            fontSize: "12px!important",
            textAlign: "left",
          },
        },
      },
      ".twap-odnp-close-btn": {
        display: "block!important",
        maxWidth: 540,
      },

      ".twap-odnp-section-step": {
        position: "absolute",
        top: "-45px",
        background: isDark(theme) ? "#3A3E64" : "white",
        width: 90,
        height: 90,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
        border: isDark(theme) ? "2px solid #4F547F" : "2px solid rgba(0,0,0, 0.1)",
        fontSize: "35px!important",
        fontWeight: "300!important",
      },
    },
    ".twap-odnp-button": {
      border: "2px solid rgba(85, 88, 121, 0.50)",
      padding: "10px 20px",
      background: "transparent",
      borderRadius: 20,
      height: "100%",
      "& img": {
        width: "16px!important",
        height: "16px!important",
      },
      p: {
        fontSize: "14px!important",
      },
    },
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
      background: isDark(theme) ? "#34385F" : "#F4F5FA",
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
        background: isDark(theme) ? "#45497D" : "white",
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
    ".twap-cancel-order": {
      ...buttonStyles(theme),
      ".twap-button-loader": {
        width: "25px!important",
        height: "25px!important",
      },
    },
    ".twap-button": {
      ...buttonStyles(theme),
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
      background: styles.cardBg,
      position: "relative",
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
        color: styles.textColor,
      },
    },
    ".twap-switch": {
      ".MuiSwitch-switchBase": {
        "&:hover": {
          background: "transparent!important",
        },
      },
      ".MuiSwitch-thumb": {
        background: "#4F4974",
        transform: "scale(0.8)",
      },
      ".Mui-checked .MuiSwitch-thumb": {
        background: darkTheme ? "white" : styles.gradient,
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
    [`@media(max-width: ${mobile}px)`]: {
      ".twap-odnp-button": {
        height: "100%",
        padding: "0px 10px!important",
        p: {
          fontSize: "11px!important",
        },
      },
      ".twap-label": {
        p: { fontSize: 11 },
      },
      ".twap-market-price": {
        fontSize: MOBILE_FONT_SIZE,
      },
    },
  };
};

export const StyledSeparator = styled(Box)({
  width: "100%",
  height: 2,
  background: darkStyles.cardBg,
});

export const StyledBuyTokenText = styled(Styles.StyledOneLineText)({
  fontSize: 25,
  fontWeight: 500,
  "@media(max-width: 600px)": {
    fontSize: 18,
  },
});

export const StyledSellTokenText = styled(Styles.StyledOneLineText)({
  fontSize: 15,
  fontWeight: 400,
  opacity: 0.8,
  flex: 1,
});

export const StyledTokenSummaryDisplay = styled(Styles.StyledRowFlex)({
  gap: 0,
});

export const StyledSrcLogo = styled(Components.TokenLogo)({
  width: 24,
  height: 24,
  border: "1px solid white",
  position: "absolute",
  right: 0,
  bottom: 8,
  zIndex: 1,
});
export const StyledDstLogo = styled(Components.TokenLogo)({
  width: 58,
  height: 58,
});

export const StyledTokenSummaryLogos = styled(Box)({
  position: "relative",
});

export const StyledMobileTabsMenuButton = styled("button")(({ theme }) => {
  const styles = baseStyles(theme);
  return {
    background: styles.cardBg,
    borderRadius: 20,
    height: 30,
    padding: "0 20px",
    border: "unset",
    cursor: "pointer",
    p: {
      fontSize: 12,
    },
    svg: {
      width: 14,
      height: 14,
    },
    [`@media(max-width: ${mobile}px)`]: {
      height: "100%",
      padding: "0 8px",
    },
  };
});

export const StyledMobileTabsMenu = styled(Menu)(({ theme }) => {
  const darkTheme = isDark(theme);
  return {
    ".MuiTouchRipple-root": {
      display: "none",
    },
    ".MuiPaper-root": {
      background: darkTheme ? "#38354E" : "white",
    },
    ".MuiMenuItem-root": {
      fontSize: 14,
    },
  };
});
