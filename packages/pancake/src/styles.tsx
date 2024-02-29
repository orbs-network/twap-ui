import { Box, Button, createTheme, styled, Theme } from "@mui/material";
import { Components, OrdersContainer, Styles } from "@orbs-network/twap-ui";
import { ReactNode } from "react";
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
    cardColor: darkMode ? "#08060B" : "#eee",
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

export const StyledCardBody = styled(Box)<{ editable?: number }>(({ theme, editable }) => {
  const styles = baseStyles(theme);

  return {
    width: "100%",
    pointerEvents: editable ? "all" : "none",
    background: editable ? styles.editableCardBox : styles.cardBox,
    padding: 10,
    borderRadius: 16,
    boxShadow: editable ? styles.inputShadow : "",
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
    ".twap-token-input-loading": {
      opacity: 0.6,
    },
    ".twap-orders-menu": {
      ".MuiMenu-paper": {
        background: styles.darkMode ? "#353547" : "",
      },
    },
    ".twap-odnp-button": {
      ...getButtonStyles(theme),
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
      height: 48,
      ...getButtonStyles(theme),
    },
    ".twap-order-separator": {
      background: `${styles.primaryTextColor}!important`,
      opacity: 0.4,
    },
    ".twap-spinner": {
      color: `${styles.primaryTextColor}!important`,
    },
    ".twap-orders": {
      color: styles.primaryTextColor,
      "*": {
        color: styles.primaryTextColor,
      },
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
      padding: "24px 24px 24px 24px",
      maxWidth: 500,
      borderRadius: 32,
      overflowY: "auto",
      "&::-webkit-scrollbar": {
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
      background: styles.cardColor,
    },
    ".twap-order-progress": {
      background: darkMode ? "#2D2836!important" : "#eeeaf4!important",
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
        backgroundColor: darkMode ? `#b8add2!important` : "#1fc7d4!important",
        opacity: "1!important",
      },
      ".Mui-checked+.MuiSwitch-track": {
        background: "#31D0AA!important",
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
      p: { color: styles.primaryTextColor },
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
    },
    ".twap-tooltip": {
      ".MuiTooltip-arrow": {
        color: "white!important",
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
    "@media (max-width:500px)": {
      ".twap-orders-title": {
        p: {
          fontSize: "14px!important",
        },
      },

      ".twap-order-preview-tokens": {
        flexDirection: "column",
        alignItems: "center!important",
        ".twap-order-preview-icon": {
          transform: "rotate(90deg)",
        },
        ".twap-token-logo": {
          top: 2,
        },
      },
    },
  };
};

export const StyledTokenPanelInput = styled(Components.TokenPanelInput)({});

export const StyledBalance = styled(Components.TokenBalance)(({ theme }) => {
  const styles = baseStyles(theme);
  return {
    fontSize: 12,
    color: styles.subtitle,
    "*": {
      color: "inherit",
    },
  };
});

export const StyledMarketPrice = styled(Components.MarketPrice)({
  flexDirection: "column",
  alignItems: "flex-start",

  gap: 5,

  ".twap-price-compare": {
    justifyContent: "flex-end",
    width: "auto",
    marginLeft: "auto",
    "*": {
      fontSize: 13,
    },
  },
});

export const StyledMarketPriceContainer = styled(Styles.StyledRowFlex)({
  ".twap-token-logo": {
    display: "none",
  },
  ".twap-label": {
    p: {
      whiteSpace: "nowrap",
    },
  },
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
    marginTop: 6,
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

export const StyledChunksInput = styled(Components.ChunksInput)({
  marginLeft: "auto",
  fontWeight: 600,
  color: "#1fc7d4",
  div: {
    height: "100%",
  },
  input: {
    height: "100%",
  },
});

export const StyledChunksSlider = styled(Components.ChunksSliderSelect)(({ theme }) => {
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

export const StyledLimitPrice = styled(Styles.StyledRowFlex)(({ theme }) => {
  const styles = baseStyles(theme);
  return {
    justifyContent: "space-between",
    ".twap-limit-price-input": {
      "*": {
        color: styles.primaryTextColor,
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

export const StyledButton = styled("button")({
  ...borderButtonStyles,
});

export const StyledReset = styled(StyledButton)({
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

export const StyledSummaryModal = styled(Components.OrderSummaryModalContainer)(({ theme }) => {
  const styles = baseStyles(theme);
  return {
    ".twap-order-summary-limit-price": {
      p: {
        fontSize: 14,
      },
    },
    ".twap-order-summary-details-item-right": {
      fontSize: 14,
    },

    ".twap-disclaimer-text": {
      "*": {
        fontSize: 14,
      },
    },
    ".twap-ui-close": {
      "*": {
        color: `${styles.primaryTextColor}`,
      },
    },
    ".twap-card": {
      border: `1px solid ${styles.border}`,
      borderRadius: 16,
      padding: 15,
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
    "@media (max-width:500px)": {
      ".twap-order-summary-details-item": {
        flexDirection: "column",
        alignItems: "flex-start",
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

const CardHeader = ({ children }: { children: ReactNode }) => {
  return <Styles.StyledRowFlex justifyContent="space-between"> {children}</Styles.StyledRowFlex>;
};

const CardBody = ({ children, editable }: { children: ReactNode; editable?: boolean }) => {
  return <StyledCardBody editable={editable ? 1 : 0}>{children}</StyledCardBody>;
};

Card.Body = CardBody;
Card.Header = CardHeader;

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
  return {
    ".twap-orders-empty-list": {
      marginBottom: "20px",
      paddingTop: "10px",
    },
  };
});
