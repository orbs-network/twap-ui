import { Box, Button, createTheme, styled, Theme, Typography } from "@mui/material";
import { DefaultTheme } from "@mui/system";
import { Components, OrdersContainer, Styles } from "@orbs-network/twap-ui";
import { Children, createContext, CSSProperties, ReactNode, useCallback, useRef, useState } from "react";
import { WarningVariant } from "./context";
import { useClickOutside } from "./hooks";
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
    label: darkMode ? "#b8add2" : "#7a6eaa",
    panelBg: darkMode ? " #27262C" : "#27262C",
    bgContainer: darkMode ? "#372f47" : "#F7F6FA",
    warning: darkMode ? "#A881FC" : "#ff6b6b",
    error: darkMode ? "#ED4B9E" : "#ff6b6b",
    info: darkMode ? "#FF9D00" : "#FF9D00",
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
    padding: 12,
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
    ".twap-time-selector-selected": {
      background: "unset",
      border: "none",
      color: styles.primaryTextColor,
      p: {
        fontSize: "14px!important",
        fontWeight: "400!important",
      },
      svg: {
        color: styles.label,
        width: 20,
        height: 20,
      },
    },
    ".twap-time-selector-list": {
      ...getContainerStyles(theme),
    },
    ".twap-time-selector-list-item": {
      padding: "5px 16px",
      height: "unset",
      "&:hover": {
        background: "rgba(255,255,255,0.05)",
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

    ".twap-label": {
      p: {
        fontWeight: 400,
        color: styles.label,
        fontSize: 12,
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
      minHeight: "415px",
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
    ".twap-order": {
      border: `1px solid ${styles.border}`,
      borderRadius: 16,
      padding: '10px 12px',

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
    ".twap-order-separator": {
      display: "none",
    },
   ".twap-order-accordion": {
    borderRadius: 16,
    background: darkMode ? "#08060B" : "#EEEAF4",
    padding: 12,
    marginTop: '15px!important',
   },
   ".twap-order-details-filled": {
    span: {
      color:'#B8ADD2!important'
    }
   },
   ".twap-order-details-filled-percent": {
    color: '#A881FC!important',
    fontSize: 14,
    fontWeight: '600!important',
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
      backgroundColor: darkMode ? "rgba(255,255,255, 0.1)!important" : "rgba(0,0,0, 0.1)!important",
      right: 0,
      borderRadius: "16px!important",
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
        color: styles.label,
      },
    },
    "@media (max-width:970px)": {
      ".twap-orders-title": {
        p: {
          fontSize: "14px!important",
        },
      },
    },
  };
};

export const StyledTokenPanelInput = styled(Components.TokenPanelInput)(({ theme }) => {
  const styles = baseStyles(theme);
  return {
    ...bigInputStyle(),
  };
});
export const StyledBalanceContainer = styled(Styles.StyledRowFlex)<{ isSrc: number; hide: number }>(({ theme, isSrc, hide }) => {
  const styles = baseStyles(theme);
  return {
    gap: 2,
    flex: 1,
    overflow: "hidden",
    justifyContent: "flex-end",
    cursor: "pointer",
    alignItems: "center",
    opacity: hide ? 0 : 1,
    transition: "opacity 0.2s",
    position: "relative",
    zIndex: hide ? -1 : 1,
    svg: {
      color: styles.label,
      width: 16,
      height: 16,
    },
  };
});
export const StyledBalance = styled(Components.TokenBalance)(({ theme, isSrc }) => {
  const styles = baseStyles(theme);
  return {
    position: "relative",
    fontSize: 12,
    fontWeight: 600,
    color: styles.label,
    p: {
      color: "inherit",
      fontWeight: 600,
      fontSize: 12,
    },
  };
});

export const StyledMarketPrice = styled(Styles.StyledText)(() => {
  return {
    fontSize: 14,
  };
});

export const StyledUSD = styled(Components.TokenUSD)({
  fontSize: 14,
  fontWeight: 400,
});

export const StyledEmptyUSD = styled(Box)({
  height: 18,
  opacity: 0,
});

export const StyledTokenSelect = styled(Components.TokenSelect)(({ theme }) => {
  const styles = baseStyles(theme);
  return {
    transition: "background-color 0.2s",
    padding: "6px 2px",
    borderRadius: 16,
    ".twap-token-display": {
      gap: 6,
    },
    ".twap-token-selected": {
      gap: 2,
      transition: "opacity 0.2s",
    },
    ".twap-token-logo": {
      width: 40,
      height: 40,
    },
    ".twap-token-name": {
      fontWeight: 600,
      fontSize: 20,
      color: styles.primaryTextColor,
    },
    svg: {
      color: styles.label,
      width: 24,
      height: 24,
    },
    "&:hover": {
      backgroundColor: "#191326",
      ".twap-token-selected": {
        opacity: 0.65,
      },
    },
  };
});
export const StyledColumnFlex = styled(Styles.StyledColumnFlex)({
  gap: 14,
});

export const StyledBalanceAndPercent = styled(Styles.StyledRowFlex)({
  position: "relative",
});

export const StyledPercentSelect = styled(Styles.StyledRowFlex)<{ show: number }>(({ show, theme }) => {
  const styles = baseStyles(theme);
  return {
    gap: 5,
    justifyContent: "flex-end",
    position: "absolute",
    right: 0,
    top: 0,
    opacity: show ? 1 : 0,
    transition: show ? "0.2s all" : "0s all",
    transform: `translateX(${show ? 0 : 10}px)`,
    zIndex: show ? 1 : -1,
    button: {
      background: "transparent",
      border: "none",
      color: styles.label,
      opacity: 0.7,
      fontWeight: 600,
      paddingLeft: "0px 0px",
      fontSize: 12,
      position: "relative",
      cursor: "pointer",
      "&:after": {
        content: "''",
        position: "absolute",
        background: styles.label,
        opacity: 0.2,
        left: -3,
        height: "80%",
        width: 1,
        top: "50%",
        transform: "translateY(-50%)",
      },
      "&:first-child": {
        "&:after": {
          display: "none",
        },
      },
    },
  };
});

export const StyledTokenChange = styled(Styles.StyledRowFlex)(({ theme }) => {
  const styles = baseStyles(theme);

  const darkMode = isDarkMode(theme);
  return {
    position: "relative",
    button: {
      width: 40,
      height: 40,
      zIndex: 1,
      borderRadius: "50%",
      background: styles.panelBg,
      border: "1px solid #383241",
      padding: 0,
      transition: "background-color 0.2s",
      cursor: "pointer",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      svg: {
        transition: "color 0.2s",
        "*": {
          fill: "#48D0DB",
        },
      },
      "&:hover": {
        background: styles.label,
        svg: {
          "*": {
            fill: styles.panelBg,
          },
        },
      },
    },
    "&:before": {
      content: "''",
      width: "100%",
      top: "50%",
      left: 0,
      position: "absolute",
      height: 1,
      background: "#383241",
      transform: "translateY(-50%)",
    },
  };
});

export const StyledSlider = styled(Components.Base.Slider)(({ theme }) => {
  const styles = baseStyles(theme);
  return {
    borderRadius: 0,
    ".twap-slider-thumb": {
      width: 40,
    },
    ".MuiSlider-valueLabel": {
      display: "none",
    },
    ".MuiSlider-rail": {
      background: "#55496E",
      height: 2,
      opacity: 1,
    },
    ".MuiSlider-track": {
      background: "#1FC7D4",
      border: "3px solid #1FC7D4",
      zIndex: 1,
      transition: "0s all",
    },
    ".MuiSlider-mark": {
      background: "#55496E",
      width: 8,
      height: 8,
      borderRadius: "50%",
    },
  };
});

export const StyledSliderContainer = styled(Styles.StyledRowFlex)({
  position: "relative",
  flex: 1,
  paddingRight: 10,
  top: 4,
});

export const StyledBackBody = styled("div")({
  position: "absolute",
  left: -26,
  top: 7,
  "&:after": {
    content: "''",
    position: "absolute",
    width: 20,
    height: 10,
    background: "#1FC7D4",
    top: 3,
    left: 7,
  },
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

const getContainerStyles = (theme: Theme) => {
  const styles = baseStyles(theme);
  return {
    backgroundColor: styles.panelBg,
    borderRadius: 24,
    padding: "16px 0px 16px 0px",
    border: "1px solid #383241",
    width: "100%",
  };
};

export const StyledContainer = styled(Styles.StyledColumnFlex)(({ theme }) => {
  const styles = baseStyles(theme);
  return {
    ...getContainerStyles(theme),
    gap: 16,
  };
});

export const StyledContainerPadding = styled("div")({
  width: "100%",
  padding: "0px 16px 0px 16px",
});

export const StyledPricePanel = styled(Styles.StyledColumnFlex)(({ theme }) => {
  const styles = baseStyles(theme);
  return {
    gap: 16,
    ".twap-limit-price-panel-inputs": {
      gap: 10,
      alignItems: "stretch",
    },
    ".twap-limit-price-panel-header": {
      justifyContent: "space-between",
      p: {
        fontSize: 12,
        fontWeight: 600,
      },
      "&-sell": {
        color: styles.label,
      },
      "&-reset": {
        color: "#48D0DB",
        background: "transparent",
        border: "none",
        padding: 0,
        cursor: "pointer",
      },
    },
  };
});

export const StyledLimitPrice = styled(Styles.StyledRowFlex)(({ theme }) => {
  return {
    justifyContent: "space-between",
    gap: 8,
    p: {
      fontWeight: 600,
    },
  };
});

export const StyledLimitPriceInput = styled(Components.LimitPriceInput)({
  paddingLeft: 0,
});

const get = {
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

export const StyledButton = styled("button")(({ theme, disabled }) => {
  const styles = baseStyles(theme);
  return {
    background: disabled ? "#3C3742" : styles.primaryColor,
    borderRadius: 16,
    height: 48,
    color: disabled ? "#666171" : "black",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontWeight: 600,
    fontSize: 16,
    border: "none",
    cursor: disabled ? "auto" : "pointer",
  };
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

export const StyledBgContainer = styled(Styles.StyledColumnFlex)(({ theme }) => {
  const styles = baseStyles(theme);
  return {
    background: styles.bgContainer,
    boxShadow: "0px 2px 0px -1px #0000000F inset",
    borderRadius: 24,
    padding: 16,
    border: "1px solid #55496E",
  };
});

export const StyledTokenPanel = styled(Styles.StyledColumnFlex)({
  gap: 12,
});

export const StyledTokenPanelTitle = styled(Styles.StyledText)(({ theme }) => {
  const styles = baseStyles(theme);
  return {
    fontSize: 12,
    fontWeight: 600,
    color: styles.label,
  };
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

export const StyledOrdersHeader = styled(Styles.StyledRowFlex)(({ theme }) => {
  const styles = baseStyles(theme);
  return {
    background: styles.darkMode ? "#27262C" : "#eeeaf4",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: 64,
    padding: 10,
    justifyContent: "space-between",
  };
});

export const StyledCanceledOrdersController = styled(Styles.StyledRowFlex)(({ theme }) => {
  return {
    width: "auto",
    p: {
      color: "#B8ADD2",
      fontSize: 14,
    },
  };
});

export const StyledOrdersTab = styled(Box)<{ selected: number }>(({ selected, theme }) => {
  const styles = baseStyles(theme);
  const color = styles.darkMode ? "#b8add2" : "#7a6eaa";
  const selectedColor = styles.darkMode ? "black" : "#280d5f";
  return {
    cursor: "pointer",
    background: !selected ? "transparent" : styles.darkMode ? "#B8ADD2" : "white",
    height: "100%",
    padding: "0px 24px",
    display: "flex",
    alignItems: "center",
    borderRadius: 16,
    width: "auto",
    justifyContent: "center",
    fontWeight: 500,
    color: !selected ? color : selectedColor,
    "@media (max-width:700px)": {
      fontSize: 11,
      padding: " 0px 10px",
    },
  };
});

export const StyledOrdersTabs = styled(Box)(() => {
  return {
    display: "flex",
    alignItems: "center",
    width: "auto",
    justifyContent: "space-between",
    height: "100%",
    background: "#372F47",
    borderRadius: 16,
    overflow: "hidden",

    "@media (max-width:700px)": {},
  };
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

const bigInputStyle = () => {
  return {
    width: "100%",
    input: {
      textAlign: "right",
      fontSize: 24,
      fontWeight: 600,
      lineHeight: "36px",
    },
  };
};

export const StyledPricePanelInputRight = styled(Styles.StyledColumnFlex)({
  alignItems: "flex-end",
  flex: 1,
  gap: 0,
});

export const StyledWarning = styled(Styles.StyledRowFlex)<{ variant: WarningVariant }>(({ theme, variant }) => {
  const styles = baseStyles(theme);
  return {
    color: variant === "error" ? styles.error : variant === "info" ? styles.info : styles.primaryTextColor,
    fontWeight: 400,
    gap: 5,
    alignItems: "flex-start",
    ".twap-warning-msg-content": {
      flex: 1,
    },
    svg: {
      position: "relative",
      top: -2,
      fill: variant === "error" ? styles.error : variant === "info" ? styles.info : styles.warning,
      width: 24,
      height: 24,
    },
    fontSize: 14,
    a: {
      color: variant === "error" ? styles.error : styles.warning,
    },
  };
});

export const StyledInputContainer = styled("div")<{ focused: number }>(({ focused, theme }) => {
  const styles = baseStyles(theme);
  return {
    position: "relative",
    "&:before": {
      content: "''",
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: "calc(100% + 11px)",
      height: "calc(100% + 11px)",
      background: "#55496E",
      borderRadius: 28,
      opacity: focused ? 1 : 0,
      transition: "opacity 0.2s",
      pointerEvents: "none",
    },
    "&:after": {
      content: "''",
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: "calc(100% + 4px)",
      height: "calc(100% + 5px)",
      border: "2px solid #a881fc",
      borderRadius: 25,
      opacity: focused ? 1 : 0,
      transition: "opacity 0.2s",
      pointerEvents: "none",
    },
    ".twap-input": {
      ...bigInputStyle(),
    },
  };
});

export const StyledInputContainerChildren = styled("div")<{ focused: number; customBorder?: number }>(({ theme, focused, customBorder }) => {
  const styles = baseStyles(theme);
  const showCustomBorder = customBorder && !focused;
  return {
    position: "relative",
    zIndex: 1,
    background: styles.bgContainer,
    boxShadow: focused ? "unset" : "0px 2px 0px -1px #0000000F inset",
    borderRadius: 24,
    padding: "0px 16px 0px 16px",
    height: 80,
    "&:before": {
      content: "''",
      position: "absolute",
      width: "100%",
      height: "100%",
      border: showCustomBorder ? "unset" : `${focused ? 2 : 1}px solid  #55496E`,
      borderRadius: 24,
      left: 0,
      top: 0,
      pointerEvents: "none",
    },
    "&:after": {
      content: "''",
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: "calc(100% + 3.5px)",
      height: "calc(100% + 3.5px)",
      borderRadius: 27,
      opacity: showCustomBorder ? 1 : 0,
      transition: "opacity 0.2s",
      pointerEvents: "none",
    },
  };
});

export const InputContainer = ({
  onBlur,
  onFocus,
  children,
  disabled,
  className = "",
  customBorder,
}: {
  onBlur?: () => void;
  onFocus?: () => void;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
  customBorder?: boolean;
}) => {
  const [focused, setFocused] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => {
    setFocused(false);
    onBlur?.();
  });

  const _onFocus = useCallback(() => {
    if (disabled) return;
    onFocus?.();
    const input = ref.current?.querySelector("input");
    setFocused(true);
    if (input) {
      input.focus();
    }
  }, [disabled, onFocus]);

  return (
    <StyledInputContainer className={`twap-input-container ${className}`} ref={ref} onMouseDown={_onFocus} focused={focused ? 1 : 0}>
      <StyledInputContainerChildren customBorder={customBorder ? 1 : 0} focused={focused ? 1 : 0} className="twap-input-container-content">
        {children}
      </StyledInputContainerChildren>
    </StyledInputContainer>
  );
};

const InputContainerHeader = ({ children }: { children: ReactNode }) => {
  return <StyledInputContainerHeader className="twap-input-container-header">{children}</StyledInputContainerHeader>;
};

const StyledInputContainerHeader = styled("div")({
  marginBottom: 10,
});

export const StyledPriceCard = styled(InputContainer)(() => {
  return {
    ".twap-input-container-content": {
      height: 67,
      display: "flex",
      justifyContent: "space-between",
      width: "100%",
      padding: "0px 13px 0px 13px",
      alignItems: "center",
    },
    ".twap-small-label": {
      position: "relative",
      top: -2,
      p: {
        fontSize: 14,
      },
    },
    ".twap-input": {
      height: "auto",
      flex: "unset",
    },
    ".twap-label": {
      p: {
        fontSize: 20,
        fontWeight: 600,
      },
    },
  };
});

export const StyledPricePanelInput = styled(StyledPriceCard)(() => {
  return {
    display: "flex",
    flexDirection: "row",
    width: "auto",
    flex: 1,
    gap: 15,
    alignItems: "center",
  };
});

const InputContainerLabel = ({ label, value, tooltip }: { label: string; value?: string; tooltip?: string }) => {
  return (
    <StyledInputContainerLabel>
      <Components.Base.Tooltip title={tooltip}>
        <StyledInputContainerLabelLabel>{label}</StyledInputContainerLabelLabel>
      </Components.Base.Tooltip>
      <StyledInputContainerLabelValue>{value}</StyledInputContainerLabelValue>
    </StyledInputContainerLabel>
  );
};

const StyledInputContainerLabel = styled("div")({
  display: "flex",
  flexDirection: "row",
  gap: 5,
});
const StyledInputContainerLabelLabel = styled(Styles.StyledText)(({ theme }) => {
  const styles = baseStyles(theme);
  return {
    color: styles.label,
    fontSize: 12,
    borderBottom: `1px dashed #5B4776`,
  };
});

const StyledInputContainerLabelValue = styled(Styles.StyledText)(() => {
  return {
    fontSize: 12,
  };
});
InputContainerHeader.Label = InputContainerLabel;
InputContainer.Header = InputContainerHeader;

export const StyledPricePanelPercent = styled(StyledPriceCard)(({ theme }) => {
  const styles = baseStyles(theme);
  return {
    display: "flex",
    width: "43%",
    flexDirection: "row",
    gap: 15,
    alignItems: "center",
    ".twap-input-container-content": {
      "&:after": {
        border: `2px solid #A881FC`,
      },
    },
    ".twap-input": {
      height: "auto",
    },
    ".twap-limit-price-panel-percent-right": {
      gap: 0,
      p: {
        fontSize: 20,
        fontWeight: 600,
        color: styles.label,
      },
    },
  };
});

export const StyledTrades = styled(InputContainer)({
  width: "100%",
  ".twap-input": {
    width: 70,
    flex: "unset",
    input: {
      textAlign: "left",
    },
  },
  ".twap-input-container-content": {
    paddingTop: 12,
  },
  ".twap-input-container-header": {
    marginBottom: 3,
  },
});

const StyledDurationAndTradeInterval = styled(InputContainer)(() => {
  return {
    ".twap-input-container-header": {
      marginBottom: 3,
    },
    ".twap-input-container-content": {
      paddingTop: 12,
    },
    ".twap-input": {
      input: {
        textAlign: "left!important",
      },
    },
  };
});

export const StyledTradeInterval = styled(StyledDurationAndTradeInterval)(({ theme }) => {
  return {
    ".twap-input-container-content": {
      "&:after": {
        border: `2px solid #ED4B9E`,
      },
    },
  };
});

export const StyledDuration = styled(StyledDurationAndTradeInterval)(() => {
  return {
    ".twap-input-container-content": {
      "&:after": {
        border: `2px solid #FFB237`,
      },
    },
  };
});

export const StyledTokenPanelContent = styled(InputContainer)({
  width: "100%",
  ".twap-input-container-content": {
    height: 80,
    paddingTop: 0,
    paddingBottom: 0,
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    display: "flex",
    ".twap-input": {
      height: "fit-content",
      flex: "unset",
    },
  },
});
