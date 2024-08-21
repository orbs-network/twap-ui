import { Box, Button, createTheme, styled, Theme, Typography } from "@mui/material";
import { display } from "@mui/system";
import { Components, OrdersContainer, Styles } from "@orbs-network/twap-ui";
import { CSSProperties, ReactNode } from "react";
const isDarkMode = (theme: Theme) => theme.palette.mode === "dark";

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

export const lightTheme = createTheme({
  palette: {
    mode: "light",
  },
});

export const baseStyles = (theme: Theme) => {
  const darkMode = isDarkMode(theme);
  return {
    primaryColor: "#1fc7d4",
    cardColor: darkMode ? "#362F47" : "#eee",
    primaryTextColor: darkMode ? "#FBF4EF" : "#453936",
    secondaryColor: darkMode ? "#767676" : "#866C65",
    secondarySubTextColor: darkMode ? "#866C65" : "#767676",
    cardBox: darkMode ? "#2A2A27" : "#E4CAB4",
    editableCardBox: darkMode ? "#20201D" : "#EFD9C7",
    inputShadow: darkMode ? "" : "inset 0px 2px 2px -1px rgba(74,74,104,.1)",
    border: darkMode ? "#383241" : "#e7e3eb",
    labelIcon: darkMode ? "#f4eeff" : "black",
    darkMode,
    subtitle: darkMode ? "#2A2A27" : "#E4CAB4",
    subValue: darkMode ? "#FBF4EF" : "#453936",
  };
};

const getTootlipStyles = (theme: Theme) => {
  const darkTheme = isDarkMode(theme);

  return {
    background: darkTheme ? "white" : "#27262C",
    color: darkTheme ? "#27262C" : "white",
    fontSize: 15,
    borderRadius: 10,
    padding: "10px 15px",
    lineHeight: "20px",
    fontWeight: 400,
    "*": {
      color: "inherit",
    },
  };
};

const getButtonStyles = (theme: Theme) => {
  const styles = baseStyles(theme);
  return {
    fontWeight: 600,
    fontSize: 16,
    boxShadow: "rgba(14, 14, 44, 0.4) 0px -1px 0px 0px inset",
    borderRadius: 16,
    background: styles.primaryColor,
    transition: "0.2s all",
    color: isDarkMode(theme) ? "#191326" : "white",
    border: "unset",
    "&:hover": {
      opacity: 0.65,
    },
    "*, p": {
      color: isDarkMode(theme) ? "#191326" : "white",
    },
  };
};

export const StyledCardBody = styled(Box)<{ editable?: number; opacity?: number }>(({ theme, editable, opacity = 100 }) => {
  const styles = baseStyles(theme);

  return {
    opacity: opacity / 100,
    display: "flex",
    flexDirection: "row",
    width: "100%",
    pointerEvents: editable ? "all" : "none",
    background: editable ? styles.editableCardBox : styles.cardBox,
    padding: 16,
    borderRadius: 16,
    boxShadow: "0 2px 0px rgba(213, 186, 165, 0.76)",
  };
});

export const StyledPoweredBy = styled(Components.PoweredBy)(({ theme }) => {
  const styles = baseStyles(theme);

  return {
    color: styles.primaryTextColor,
    marginTop: 20,
    fontSize: 14,

    "*": {
      color: "inherit",
    },
  };
});

export const configureStyles = (theme: Theme) => {
  const styles = baseStyles(theme);

  const darkMode = isDarkMode(theme);

  return {
    ".twap-order-expanded-cancel-wraper": {
      marginTop: "40px",
      button: {
        color: !darkMode ? "white!important" : "#191326!important",
      },
    },
    ".twap-cancel-order": {
      background: "unset!important",
      borderRadius: "30px!important",
      fontWeight: 500,
      fontSize: "14px!important",
      padding: "6px 40px!important",
      transition: "0.2s all",
      height: "unset!important",
      cursor: "pointer",
      marginTop: "20px",
      minHeight: "unset!important",
      boxShadow: "unset!important",
    },
    ".twap-token-input-loading": {
      opacity: 0.5,
    },
    ".twap-odnp-button": {
      ...getButtonStyles(theme),
      background: darkMode ? "#B8ADD2" : "#492F79",
      padding: "6px 12px!important",
      width: "fit-content",
      boxShadow: "unset",
      marginLeft: "auto",
      fontWeight: 500,
      "&-children": {
        gap: "5px!important",
      },
    },
    ".twap-label": {
      p: {
        fontWeight: "400!important",
        color: styles.primaryTextColor,
      },
      svg: {
        color: `${styles.labelIcon}!important`,
        maxWidth: 14,
        maxHeight: 14,
      },
    },
    ".twap-container": {
      color: styles.primaryTextColor,
    },
    ".twap-button": {
      minHeight: 48,
      ...getButtonStyles(theme),
      padding: "10px",
    },
    ".twap-order-separator": {
      background: `${styles.primaryTextColor}!important`,
      opacity: 0.4,
    },
    ".twap-spinner": {
      color: `${styles.primaryTextColor}!important`,
    },
    ".twap-orders-lists": {
      width: "100%",
    },
    ".twap-orders-list": {
      padding: 0,
      width: "100%",
      gap: "15px!important",
    },
    ".twap-order-token-display": {
      flex: "unset!important",
    },
    ".twap-adapter-wrapper": {
      width: "100%",
      background: "transparent",
    },
    ".twap-modal": {
      ".MuiBackdrop-root": {
        background: darkMode ? "rgba(244, 238, 255, 0.6)" : "",
      },
    },

    ".twap-modal-content": {
      background: darkMode ? "#27262C" : "white",
      color: styles.primaryTextColor,
      display: "flex",
      flexDirection: "column",
      padding: "0px",
      maxWidth: "370px!important",
      borderRadius: 32,
      minHeight: "415px",
      overflow: "hidden",
      "*::-webkit-scrollbar": {
        display: "none",
      },
      "&-header": {
        marginBottom: 10,
      },
    },
    ".twap-trade-size": {
      ".twap-label": {
        whiteSpace: "nowrap",
      },
      ".twap-token-logo": {
        display: "none",
      },
      "*": {
        color: styles.primaryTextColor,
      },
    },
    ".twap-orders-title": {
      p: {
        fontWeight: 600,
        color: `${styles.primaryTextColor}!important`,
      },
    },
    ".twap-order": {
      border: `1px solid ${styles.border}`,
      borderRadius: 16,
      padding: 15,
      transition: "0.2s all",
      color: `${styles.primaryTextColor}!important`,
      background: darkMode ? "#362F47" : "#EEEAF4",
      ".twap-order-expanded-right": {
        fontWeight: "400!important",
      },
      ".twap-market-price-section": {
        "*": {
          fontSize: 13,
          fontWeight: "400!important",
        },
      },
    },
    ".twap-order-progress": {
      background: darkMode ? "#2D2836!important" : "#1fc7d4!important",
      "&::after": {
        display: "none!important",
      },
      ".MuiLinearProgress-bar": {
        background: darkMode ? `${styles.subtitle}!important` : "#7a6eaa!important",
      },
    },

    ".twap-switch": {
      ".MuiSwitch-thumb": {
        background: darkMode ? `#27262C!important` : "white!important",
      },
      ".MuiSwitch-track": {
        backgroundColor: darkMode ? `#b8add2!important` : "#EDEAF4!important",
        opacity: "1!important",
      },
      ".Mui-checked+.MuiSwitch-track": {
        background: "#32D0AA!important",
      },
    },
    ".twap-time-selector": {
      ".twap-input": {
        input: {
          fontWeight: 400,
        },
      },
    },
    ".twap-price-impact-selector": {
      border: `1px solid ${styles.cardBox}`,
      borderRadius: 16,

      ".twap-input": {
        input: {
          fontWeight: 700,
          fontSize: 16,
        },
      },
    },
    ".twap-time-selector-selected": {
      "*": {
        color: `${styles.primaryTextColor}!important`,
      },
    },
    ".twap-time-selector-list": {
      background: styles.cardBox,
      border: `1px solid ${styles.border}`,
      borderRadius: "16px!important",
      padding: "0px!important",
    },
    ".twap-time-selector-list-item": {
      p: { color: styles.primaryTextColor, fontWeight: "400!important" },

      "&:hover": {
        background: darkMode ? "rgba(255,255,255, 0.06)" : "rgba(0,0,0, 0.06)",
      },
    },
    ".twap-button-disabled": {
      background: darkMode ? "#3c3742!important" : "#e9eaeb!important",
      opacity: "1!important",
      cursor: "not-allowed!important",
      boxShadow: "unset!important",
      "*": {
        color: "#bdc2c4!important",
      },
      p: {
        opacity: "0.4!important",
      },
    },
    ".twap-tooltip": {
      ".MuiTooltip-arrow": {
        color: darkMode ? "white!important" : "#27262C!important",
      },
      "& .MuiTooltip-tooltip": {
        ...getTootlipStyles(theme),
        fontFamily: "Kanit",
      },
    },
    ".twap-loader": {
      background: darkMode ? "rgba(255,255,255, 0.1)!important" : "rgba(0,0,0, 0.1)!important",
      right: 0,
    },
    ".twap-market-price": {
      justifyContent: "center!important",
      width: "100%",
      ".twap-price-compare": {
        justifyContent: "center",
      },
      ">div": {
        width: "100%",
      },
      "*": {
        fontSize: 14,
        color: styles.primaryTextColor,
      },
    },
    ".twap-label, .twap-market-price .title": {
      fontSize: 13,
      color: styles.primaryTextColor,
      fontWeight: 600,
      "*, p": {
        color: "inherit",
        fontWeight: "inherit",
      },
    },
    ".twap-input": {
      input: {
        color: styles.primaryTextColor,
        fontSize: 24,
        fontWeight: 700,
        "&::placeholder": {
          color: `${styles.primaryTextColor}!important`,
          opacity: 0.5,
          fontWeight: "inherit",
        },
      },
    },
    ".twap-usd": {
      fontSize: 12,
      "*": {
        color: styles.subtitle,
      },
    },
    "@media (max-width:970px)": {
      ".twap-orders-title": {
        p: {
          fontSize: "14px!important",
        },
      },
      ".twap-order-expanded": {
        ".twap-token-logo": {
          display: "none",
        },
      },
      ".twap-order-preview-tokens": {
        ".twap-order-preview-icon svg": {
          width: "16px!important",
          height: "16px!important",
          position: "relative",
          top: 5,
        },
        ".twap-token-logo": {
          display: "none",
        },
      },
    },
  };
};

export const StyledText = styled(Styles.StyledText)(({ theme }) => {
  const styles = baseStyles(theme);
  return {
    color: styles.secondaryColor,
    fontSize: 16,
    fontWeight: 400,
  };
});

export const StyledTokenPanelInput = styled(Components.TokenPanelInput)({
  input: {
    width: "100%",
  },
});

export const StyledBalanceContainer = styled("div")({
  flex: 1,
  overflow: "hidden",
  display: "flex",
  justifyContent: "flex-end",
});
export const StyledBalance = styled(Components.TokenBalance)(({ theme }) => {
  const styles = baseStyles(theme);
  return {
    cursor: "pointer",
    fontSize: 12,
    color: styles.primaryTextColor,
    fontWeight: "400",
    "*": {
      color: "inherit",
      fontWeight: "700",
    },
  };
});

export const StyledMarketPrice = styled(Components.MarketPrice)({
  flexDirection: "column",
  alignItems: "flex-start",

  gap: 5,
  ".twap-loader": {
    marginLeft: "auto",
  },

  ".twap-price-compare": {
    justifyContent: "flex-end",
    width: "auto",
    marginLeft: "auto",
    "*": {
      fontSize: 13,
    },
  },
});

export const StyledMarketPriceContainer = styled(Styles.StyledRowFlex)(({ theme }) => {
  const darkMode = baseStyles(theme).darkMode;
  return {
    position: "relative",
    padding: 12,
    borderRadius: 16,
    background: darkMode ? "#20201D" : "#EFD9C7",
    justifyContent: "space-between",
    p: { color: darkMode ? "#767676" : "#866C65", fontWeight: "400!important" },
    ".twap-token-logo": {
      display: "none",
    },
    ".twap-label": {
      p: {
        whiteSpace: "nowrap",
      },
    },
    "@media(max-width: 700px)": {
      ".twap-label": {
        p: {
          fontSize: "12px!important",
        },
      },
    },
  };
});

export const StyledTokenSelect = styled(Components.TokenSelect)(({ theme }) => {
  const styles = baseStyles(theme);
  return {
    background: styles.cardBox,
    borderRadius: 16,
    padding: 12,

    ".twap-token-name": {
      fontWeight: 700,
      fontSize: 12,
      color: styles.primaryTextColor,
    },
  };
});

export const StyledColumnFlex = styled(Styles.StyledColumnFlex)({
  gap: 14,
});

export const StyledPercentSelect = styled(Styles.StyledRowFlex)({
  marginTop: 14,
  gap: 5,
  justifyContent: "flex-end",
});

export const StyledTokenChangeContainer = styled(Styles.StyledRowFlex)(({ theme }) => {
  const styles = baseStyles(theme);

  const darkMode = isDarkMode(theme);
  return {
    width: 32,
    height: 32,
    marginLeft: "auto",
    marginRight: "auto",
    "&:hover": {
      button: {
        opacity: darkMode ? 0.65 : 1,
      },
    },
  };
});

export const StyledTokenChange = styled(Components.ChangeTokensOrder)(({ theme }) => {
  const styles = baseStyles(theme);
  return {
    button: {
      width: "100%",
      height: "100%",
      transition: "unset",
      svg: {
        color: styles.primaryTextColor,
        fill: styles.primaryTextColor,
        width: 17,
        height: 17,
      },
    },
  };
});

export const StyledLimitPrice = styled(Styles.StyledRowFlex)(({ theme }) => {
  const styles = baseStyles(theme);
  return {
    justifyContent: "space-between",
    marginTop: 10,
    ".twap-limit-price-input": {
      "*": {
        color: styles.primaryTextColor,
      },
      input: {
        position: "relative",
        top: -2,
      },
    },
    ".twap-token-logo": {
      display: "none",
    },
    ".twap-limit-reset": {
      left: 10,
      "*": {
        stroke: styles.primaryColor,
      },
    },
  };
});

export const StyledLimitPriceInput = styled(Components.LimitPriceInput)({
  paddingLeft: 0,
});

const borderButtonStyles = {
  background: "unset",
  borderRadius: 16,
  fontWeight: 600,
  fontSize: 12,
  border: "2px solid #1fc7d4",
  color: "#1fc7d4",
  padding: "0px 8px",
  transition: "0.2s all",
  cursor: "pointer",
  "&:hover": {
    opacity: 0.65,
  },
};

export const StyledButton = styled("button")<{ selected?: number }>(({ theme, selected }) => {
  const styles = baseStyles(theme);
  return {
    ...borderButtonStyles,
    background: selected ? styles.primaryColor : "unset",
    color: !selected ? "#1fc7d4" : styles.darkMode ? "#191326" : "white",
  };
});

export const StyledReset = styled(StyledButton)({
  p: {
    fontSize: 13,
    color: "#DE7F3B",
  },
  border: "none",
  padding: "0px",
});

export const StyledAcceptDisclaimer = styled(Components.AcceptDisclaimer)({
  justifyContent: "space-between",
});

export const StyledOutputAddress = styled(Components.OutputAddress)({
  marginTop: 20,
  fontSize: 14,
});

export const StyledOrderSummary = styled(Styles.StyledColumnFlex)(({ theme }) => {
  const styles = baseStyles(theme);
  return {
    ".twap-order-summary-output-address": {
      alignItems: "center",
      fontSize: 14,
    },
    ".twap-order-summary-details-item": {
      ".twap-label": {
        maxWidth: "unset",
        fontSize: 14,
        fontWeight: 400,
      },
      ".twap-token-display": {
        order: 1,
      },
    },
    ".twap-order-summary-limit-price": {
      p: {
        fontSize: 14,
      },
    },
    ".twap-order-summary-details-item-right": {
      fontSize: 14,
      gap: 3,
    },
    ".twap-ui-close": {
      "*": {
        color: `${styles.primaryTextColor}`,
      },
    },
    ".twap-card": {
      border: `1px solid ${styles.border}`,
      borderRadius: 16,
      padding: 12,
      transition: "0.2s all",

      background: styles.darkMode ? "#353547" : "#D5BAA5",
      "*": {
        color: `${styles.primaryTextColor}`,
      },
    },
    ".twap-label": {
      p: {
        color: styles.primaryTextColor,
      },
      svg: {
        color: `${styles.labelIcon}!important`,
      },
    },

    ".twap-orders-summary-token-display-amount": {
      p: {
        fontSize: 16,
      },
    },
    ".twap-orders-summary-token-display": {
      ".twap-token-logo": {
        width: 35,
        height: 35,
      },
    },
    "@media (max-width:700px)": {
      ".twap-order-summary-limit-price": {
        "*": {
          fontSize: "12px!important",
        },
      },
    },
  };
});

export const Card = ({ children, className = "" }: { children: ReactNode; className?: string }) => {
  return (
    <StyledColumnFlex gap={5} className={className}>
      {children}
    </StyledColumnFlex>
  );
};

const CardHeader = ({ children, className = "" }: { children: ReactNode; className?: string }) => {
  return (
    <Styles.StyledRowFlex className={className} justifyContent="space-between">
      {" "}
      {children}
    </Styles.StyledRowFlex>
  );
};

const CardBody = ({ children, editable, className = "", opacity }: { children: ReactNode; editable?: boolean; className?: string; opacity?: number }) => {
  return (
    <StyledCardBody className={className} editable={editable ? 1 : 0} opacity={opacity}>
      {children}
    </StyledCardBody>
  );
};

Card.Body = CardBody;
Card.Header = CardHeader;

export const StyledDisabledCardBody = styled(Card.Body)(({ opacity = 1 }: { opacity: number }) => ({
  opacity: opacity,
}));

export const StyledTokenPanel = styled(Card)({
  width: "100%",
  gap: 7,
  ".twap-input": {
    width: "100%",
    input: {
      textAlign: "left",
    },
  },
  ".twap-token-logo": {
    width: 24,
    height: 24,
  },
});

export const StyledTradeSize = styled(Styles.StyledRowFlex)({
  justifyContent: "space-between",
  flexWrap: "wrap",
  alignItems: "center",
});

export const StyledOrders = styled(OrdersContainer)(({ theme }) => {
  const styles = baseStyles(theme);
  return {
    gap: 0,
    ".twap-orders-empty-list": {
      marginBottom: "40px",
      paddingTop: "30px",
      color: styles.primaryTextColor,
      justifyContent: "center",
      alignItems: "center",
      display: "flex",
      flexDirection: "column",
    },
    ".twap-orders-pagination": {
      color: styles.primaryTextColor,
      "*": {
        color: styles.primaryTextColor,
      },
    },
  };
});

export const StyledTimeSelect = styled(Styles.StyledColumnFlex)({
  display: "flex",
  alignItems: "flex-end",
  width: "auto",
  padding: 2,
  flex: 1,
});

export const StyledTimeSelectBody = styled(CardBody)({
  display: "flex",
  alignItems: "center",

  padding: "4px 10px",
  width: "auto",
  boxShadow: "none",
});

export const StyledTimeSelectContainer = styled(Styles.StyledRowFlex)(({ theme }) => {
  const styles = baseStyles(theme);

  return {
    background: styles.editableCardBox,
    borderRadius: 16,
    padding: 16,
    ".MuiButtonBase-root": {
      padding: "0px!important",
      background: "unset!important",
      height: "100%",
      p: {
        fontSize: "12px!important",
        fontWeight: 400,
      },
    },
    ".twap-input": {
      input: {
        fontSize: 14,
        paddingRight: 3,
      },
    },
  };
});

export const StyledTimeSelectHeader = styled(Card.Header)({
  marginTop: 1,
  width: "auto",
});

export const StyledOrdersHeader = styled(Box)(({ theme }) => {
  const styles = baseStyles(theme);
  return {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    background: styles.darkMode ? "#20201D" : "#EFD9C7",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: 60,
    width: "100%",
    padding: "0px 0px",
    position: "relative",
  };
});

export const StyledOrdersTab = styled(Box)<{ selected: number }>(({ selected, theme }) => {
  const styles = baseStyles(theme);
  const selectedColor = styles.darkMode ? "#FBF4EF" : "#453936";
  return {
    cursor: "pointer",
    background: selected ? (theme.palette.mode === "dark" ? "#2A2A27" : "#E4CAB4") : "transparent",
    height: "100%",
    padding: "0px 24px",
    display: "flex",
    alignItems: "center",
    borderRadius: "16px",
    flex: 1,
    justifyContent: "center",
    color: selectedColor,
    "@media (max-width:700px)": {
      fontSize: 12,
      padding: "0px 10px",
    },
  };
});

export const StyledOrdersTabs = styled(Box)(({ theme }) => {
  const styles = baseStyles(theme);
  return {
    display: "flex",
    flex: 1,
    border: `1px solid ${styles.darkMode ? "#353531" : "#D5BAA5"}`,
    alignItems: "center",
    padding: "2px",
    borderRadius: 16,
    justifyContent: "space-between",
    height: "100%",

    "@media (max-width:700px)": {},
  };
});

export const StyledLimitPriceBody = styled(Card.Body)({
  padding: "10px 10px",
  alignItems: "center",
  position: "relative",
  input: {
    textAlign: "right",
  },
});

export const StyledResetLimitButton = styled(Components.ResetLimitButton)({
  position: "absolute",
  top: "0",
  right: "0",
  zIndex: 1,
});

export const StyledLimitPriceLabel = styled(Styles.StyledRowFlex)({
  width: "auto",
  minHeight: 24,
});

export const StyledSubmitButtonContainer = styled(Styles.StyledRowFlex)({
  button: {
    width: "100%",
  },
});

export const StyledModalHeaderClose = styled("button")(({ theme }) => {
  const darkMode = baseStyles(theme).darkMode;

  return {
    margin: 0,
    marginLeft: "auto",
    background: "transparent",
    padding: 0,
    border: "unset",
    width: 48,
    height: 48,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
    svg: {
      color: darkMode ? "#f4eeff" : "#1fc7d4",
      width: 20,
      height: 20,
    },
    "&:hover": {
      opacity: 0.8,
    },
  };
});

export const StyledModalHeader = styled(Styles.StyledRowFlex)<{ withTitle: number }>(({ theme, withTitle }) => {
  const darkMode = baseStyles(theme).darkMode;

  return {
    justifyContent: "space-between",
    alignItems: "center",
    background: !withTitle ? "transparent" : darkMode ? "#3B394D" : "linear-gradient(111.68deg,#f2ecf2,#e8f2f6)",
    padding: "12px 24px",
    paddingBottom: !withTitle ? "0" : "12px",
    borderBottom: !withTitle ? "1px solid transparent" : darkMode ? "1px solid #383241" : "1px solid #e7e3eb",
  };
});

export const StyledSwapModalContent = styled(Styles.StyledColumnFlex)<{ style: CSSProperties }>(({ style }) => ({
  padding: "0px 24px 24px 24px",
  alignItems: "center",
  justifyContent: "center",
  flex: 1,
  overflowY: "auto",
  ...style,
}));
export const StyledModalHeaderTitle = styled(Typography)(({ theme }) => {
  const darkMode = baseStyles(theme).darkMode;
  return {
    fontSize: 20,
    fontWeight: 600,
    color: darkMode ? "#f4eeff" : "#280d5f",
  };
});

export const StyledBody = styled(Styles.StyledColumnFlex)(({ theme }) => {
  const styles = baseStyles(theme);
  return {
    padding: "15px 20px 20px 20px",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    alignItems: "center",
    gap: 15,
    backgroundColor: styles.darkMode ? "#20201D" : "#EFD9C7",
  };
});

export const StyledButtonTab = styled("button")<{ selected?: boolean }>(({ selected, theme }) => {
  const styles = baseStyles(theme);

  let color;

  if (styles.darkMode) {
    color = selected ? "#DE7F3B" : "#767676";
  } else {
    color = selected ? "#DE7F3B" : "#866C65";
  }

  return {
    color: color,
    backgroundColor: "inherit",
    border: "none",
    padding: "5px",
    cursor: "pointer",
    outline: "none",
    fontSize: 16,
    fontWeight: 700,
  };
});

export const StyledLine = styled(Box)(({ theme }) => {
  const styles = baseStyles(theme);
  return {
    height: "1px",
    backgroundColor: styles.darkMode ? "#FBF4EF" : "#D5BAA5",
    width: "95%",
    margin: "0 auto",
  };
});
