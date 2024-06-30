import { Box, Button, createTheme, styled, Theme, Typography } from "@mui/material";
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
    primaryTextColor: darkMode ? "#f4eeff" : "#280d5f",
    secondaryColor: darkMode ? "#9a6aff" : "#7645d9",
    cardBox: darkMode ? "#3c3742" : "#EEEAF4",
    editableCardBox: darkMode ? "#362F47" : "#EEEAF4",
    inputShadow: darkMode ? "" : "inset 0px 2px 2px -1px rgba(74,74,104,.1)",
    border: darkMode ? "#383241" : "#e7e3eb",
    labelIcon: darkMode ? "#f4eeff" : "black",
    darkMode,
    subtitle: darkMode ? "#b8add2" : "#7a6eaa",
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

export const StyledCardBody = styled(Box)(({ theme }) => {
  const styles = baseStyles(theme);

  return {
    width: "100%",
    background: styles.editableCardBox,
    padding: 12,
    borderRadius: 16,
    boxShadow: styles.inputShadow,
  };
});

export const StyledCard = styled(Styles.StyledColumnFlex)(({ theme }) => {
  return {
    width: "100%",
    gap: 10,
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
    ".twap-warning": {
      color: "rgb(155, 155, 155)",
    },
    ".twap-message": {
      fontSize: "14px",
      small: {
        opacity: 0.7,
      },
    },
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

      overflow: "hidden",
      "*::-webkit-scrollbar": {
        display: "none",
      },
      "&-header": {
        marginBottom: 10,
      },
    },
    ".twap-orders-title": {
      p: {
        fontWeight: 600,
        color: `${styles.primaryTextColor}!important`,
      },
    },
    ".twap-order": {},
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
        fontSize: 16,
        fontWeight: 500,
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

export const StyledTokenPanelInput = styled(Components.TokenPanelInput)({});
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
    color: styles.subtitle,
    "*": {
      color: "inherit",
    },
  };
});

export const StyledUSD = styled(Components.TokenUSD)({});

export const StyledEmptyUSD = styled(Box)({
  height: 18,
  opacity: 0,
});

export const StyledTokenSelect = styled(Components.TokenSelect)(({ theme }) => {
  const styles = baseStyles(theme);
  return {
    ".twap-token-name": {
      fontWeight: 600,
      fontSize: 16,
      color: styles.primaryTextColor,
    },
  };
});

export const StyledSelectAndBalance = styled(Styles.StyledRowFlex)({
  justifyContent: "space-between",
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
    marginTop: 25,
    marginBottom: 15,
    width: 32,
    height: 32,
    marginLeft: "auto",
    marginRight: "auto",
    "&:hover": {
      button: {
        background: darkMode ? styles.primaryColor : "#75DBE3",
        opacity: darkMode ? 0.65 : 1,
      },
      svg: {
        color: "white",
        fill: "white",
      },
    },
  };
});

export const StyledTokenChange = styled(Components.ChangeTokensOrder)(({ theme }) => {
  const styles = baseStyles(theme);
  return {
    button: {
      boxShadow: "rgba(0, 0, 0, 0.1) 0px -2px 0px inset",
      background: styles.editableCardBox,
      width: "100%",
      height: "100%",
      transition: "unset",
      svg: {
        color: styles.primaryColor,
        fill: styles.primaryColor,
        width: 17,
        height: 17,
      },
    },
  };
});

export const StyledChunksSelect = styled(Components.ChunkSelector)(({ theme }) => {
  const styles = baseStyles(theme);
  return {
    marginLeft: 10,
    ".MuiSlider-thumb": {
      background: styles.darkMode ? styles.primaryTextColor : "#1fc7d4",
    },
    ".MuiSlider-track": {
      background: styles.primaryColor,
      border: `1px solid ${styles.primaryColor}`,
    },
    ".MuiSlider-valueLabel": {
      ...getTootlipStyles(theme),
    },
  };
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

export const StyledMenuButton = styled("button")<{ selected?: number }>(({ theme, selected }) => {
  const styles = baseStyles(theme);
  return {
    ...borderButtonStyles,
    background: selected ? styles.primaryColor : "unset",
    color: !selected ? "#1fc7d4" : styles.darkMode ? "#191326" : "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };
});

export const StyledChunkSelectMaxButton = styled(StyledMenuButton)({
  fontSize: 11,
  marginLeft: 5,
});

export const StyledResetLimitButtonContainer = styled(Styles.StyledRowFlex)({
  gap: 2,
  width: "auto",
});

export const StyledResetLimitButtonLeft = styled(StyledMenuButton)({
  borderTopRightRadius: 0,
  borderBottomRightRadius: 0,
});

export const StyledResetLimitButtonRight = styled(StyledMenuButton)({
  borderTopLeftRadius: 0,
  borderBottomLeftRadius: 0,
});

export const StyledReset = styled(StyledMenuButton)({
  p: {
    fontSize: 13,
  },
  svg: {
    width: 12,
    height: 12,
  },
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

      background: styles.darkMode ? "#353547" : "#FAF9FA",
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
  return <StyledCard className={className}>{children}</StyledCard>;
};

const CardHeader = ({ children, className = "" }: { children: ReactNode; className?: string }) => {
  return <StyledCardHeader className={className}> {children}</StyledCardHeader>;
};

const CardBody = ({ children, className = "" }: { children: ReactNode; className?: string }) => {
  return <StyledCardBody className={className}> {children}</StyledCardBody>;
};

const StyledCardHeader = styled(Styles.StyledRowFlex)({
  justifyContent: "space-between",
});

Card.Header = CardHeader;
Card.Body = CardBody;

export const StyledTokenPanel = styled(Card)({
  width: "100%",
  gap: 7,
  ".twap-input": {
    width: "100%",
    input: {
      textAlign: "right",
    },
  },
  ".twap-token-logo": {
    width: 24,
    height: 24,
  },
});

export const StyledLimitPriceTokenSelect = styled(Components.Base.TokenDisplay)({
  gap: 6,
  cursor: "pointer",
  "&:hover": {
    opacity: 0.8,
  },
  ".twap-token-logo": {
    width: 16,
    height: 16,
  },
  fontSize: 14,
});
export const StyledLimitPriceTitle = styled(Styles.StyledRowFlex)({
  justifyContent: "flex-start",
  gap: 8,
  fontSize: 14,
  span: {
    opacity: 0.7,
  },
});

export const StyledTradeSize = styled(Styles.StyledRowFlex)({
  justifyContent: "space-between",
  flexWrap: "wrap",
  alignItems: "center",
});

export const StyledTotalChunks = styled(Card)({
  ".twap-input": {
    height: 25,
  },
});

export const StyledTradeSizeRight = styled(Styles.StyledColumnFlex)({
  gap: 0,
  width: "auto",
  alignItems: "center",
});

export const StyledOrdersMenuButton = styled(Button)(({ theme }) => ({
  width: "auto!important",
  background: baseStyles(theme).darkMode ? "#353547" : "",
}));

export const StyledOrders = styled(OrdersContainer)(({ theme }) => {
  const styles = baseStyles(theme);
  return {
    gap: 0,
    ".twap-orders-empty-list": {
      marginBottom: "40px",
      paddingTop: "30px",
      color: styles.primaryTextColor,
    },
    ".twap-orders-pagination": {
      color: styles.primaryTextColor,
      "*": {
        color: styles.primaryTextColor,
      },
    },
  };
});

export const StyledOrdersHeader = styled(Box)(({ theme }) => {
  const styles = baseStyles(theme);
  return {
    display: "flex",
    flexDirection: "column",
    background: styles.darkMode ? "#372f47" : "#eeeaf4",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: 48,
  };
});

export const StyledOrdersTab = styled(Box)<{ selected: number }>(({ selected, theme }) => {
  const styles = baseStyles(theme);
  const color = styles.darkMode ? "#b8add2" : "#7a6eaa";
  const selectedColor = styles.darkMode ? "#f4eeff" : "#280d5f";
  return {
    cursor: "pointer",
    background: !selected ? "transparent" : styles.darkMode ? "#27262c" : "white",
    height: "100%",
    padding: " 0px 24px",
    display: "flex",
    alignItems: "center",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    flex: 1,
    justifyContent: "center",
    fontWeight: 500,
    color: !selected ? color : selectedColor,
    "@media (max-width:700px)": {
      fontSize: 11,
      padding: " 0px 10px",
    },
  };
});

export const StyledOrdersTabs = styled(Box)({
  display: "flex",
  alignItems: "center",
  width: "100%",
  justifyContent: "space-between",
  height: "100%",
  flex: 1,
  "@media (max-width:700px)": {},
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

export const StyledTradeIntervalResolution = styled(CardBody)({
  width: "50%",
});

export const StyledTradeIntervalInput = styled(CardBody)({
  width: "50%",
});

export const StyledChunksSelectSlider = styled(CardBody)({
  flex: 1,
  width: "auto",
  padding: "10px 16px 0px 16px",
});

export const StyledChunksSelectInput = styled(CardBody)({
  width: 80,
});

export const StyledLimitSwitch = styled(Components.LimitSwitch)(({ theme }) => {
  const styles = baseStyles(theme);
  return {
    background: "#372f47",
    ".MuiTabs-indicator": {
      background: "#27262c",
    },
    ".MuiButtonBase-root": {
      padding: "6px 0px",
      minWidth: 80,
      minHeight: "unset",
      zIndex: 1,
      color: "white!important",
      fontSize: 13,
      fontWeight: 400,
    },
  };
});

export const StyledShowConfirmation = styled(Components.ShowConfirmation)({
  ".twap-warning-message": {
    borderRadius: 12,
    padding: "8px 10px",
    border: "1px solid #383241",
  },
});
