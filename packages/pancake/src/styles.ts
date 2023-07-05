import { Box, createTheme, styled, Theme } from "@mui/material";
import { Components, Styles } from "@orbs-network/twap-ui";
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

const baseStyles = (theme: Theme) => {
  const darkMode = isDarkMode(theme);
  return {
    primaryColor: darkMode ? "#1fc7d4" : "#1fc7d4",
    cardColor: darkMode ? "#08060B" : "#FAF9FA",
    primaryTextColor: darkMode ? "#f4eeff" : "#280d5f",
    secondaryColor: darkMode ? "#9a6aff" : "#7645d9",
    subtitle: darkMode ? "#b8add2" : "#7a6eaa",
    inputBox: darkMode ? "#362F47" : "#EEEAF4",
    displayBox: darkMode ? "#3C3743" : "#E9EAEB",
    inputShadow: darkMode ? "" : "inset 0px 2px 2px -1px rgba(74,74,104,.1)",
    displayBoxBorder: darkMode ? "#262130" : "#d7caec",
    cardBorder: darkMode ? "#383241" : "#e7e3eb",
  };
};

const getTootlipStyles = (theme: Theme) => {
  const darkTheme = isDarkMode(theme);

  return {
    background: darkTheme ? "white" : "#27262C",
    color: darkTheme ? "#736394" : "white",
    fontSize: 15,
    borderRadius: 10,
    padding: "10px 15px",
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
    marginTop: 20,
    color: "#191326",
    "&:hover": {
      opacity: 0.65,
    },
    "*": {
      color: "#191326",
    },
  };
};

export const StyledPoweredBy = styled(Components.PoweredBy)(({ theme }) => {
  const styles = baseStyles(theme);

  return {
    color: styles.primaryColor,
    marginTop: 20,
    fontSize: 14,

    "*": {
      color: "inherit",
    },
  };
});

export const StyledSubmit = styled(Components.SubmitButton)(({ theme }) => ({
  height: 48,
  ...getButtonStyles(theme),
}));

export const configureStyles = (theme: Theme) => {
  const styles = baseStyles(theme);

  const darkMode = isDarkMode(theme);

  return {
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
        background: darkMode ? "#f4eeff99" : "",
        opacity: "0.7!important",
      },
    },
    ".twap-modal-content": {
      background: darkMode ? "#2D2836" : "white",
      padding: "40px 24px 24px 24px",
      borderRadius: 20,
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
    ".twap-icon": {
      color: `${styles.primaryTextColor}!important`,
      "*": {
        color: `${styles.primaryTextColor}!important`,
      },
    },
    ".odnp": {
      "*": {
        color: "black",
      },
    },
    ".twap-odnp": {
      border: darkMode ? `2px solid ${styles.primaryColor}` : "2px solid transparent",
      borderRadius: 20,
      background: darkMode ? "transparent" : "#eeeaf4",
      color: darkMode ? `${styles.primaryColor}!important` : "#7a6eaa!important",
      fontWeight: "600!important",
      minHeight: 38,
      "&:hover": {
        opacity: 0.7,
      },
      p: {
        fontSize: "14px!important",
      },
    },
    ".twap-orders-title": {
      p: {
        fontWeight: 600,
        color: `${styles.primaryTextColor}!important`,
      },
    },
    ".twap-order": {
      border: `1px solid ${styles.cardBorder}`,
      borderRadius: 16,
      padding: 15,
      transition: "0.2s all",
      color: `${styles.primaryTextColor}!important`,
      background: styles.cardColor,
      "*": {},
    },

    ".twap-orders-header-tabs": {
      minHeight: "unset!important",
      height: 35,
      padding: "0px!important",
      border: "unset!important",
      ".MuiTabs-flexContainer": {
        height: "100%",
      },
      ".MuiTouchRipple-root": {
        display: "none!important",
      },
      "& .MuiButtonBase-root": {
        color: darkMode ? "#b8add2" : "#7a6eaa",
        fontWeight: 600,
        fontSize: 14,
        height: "100%",
        minHeight: "unset!important",
      },
      borderRadius: "16px!important",
      background: darkMode ? "#372f47" : "#eeeaf4",
      ".Mui-selected": {
        color: darkMode ? "#372f47!important" : "white!important",
      },
      ".MuiTabs-indicator": {
        background: darkMode ? styles.primaryColor : "#7a6eaa",

        borderRadius: "16px!important",
      },
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
        background: darkMode ? `#27262C!important` : "",
      },
      ".MuiSwitch-track": {
        backgroundColor: darkMode ? `${styles.inputBox}!important` : "#E9EAEB!important",
        opacity: "1!important",
      },
      ".Mui-checked+.MuiSwitch-track": {
        background: "#31D0AA!important",
      },
    },
    ".twap-time-selector-selected": {
      "*": {
        color: `${styles.primaryTextColor}!important`,
      },
      "&:hover": {
        opacity: 0.65,
      },
    },
    ".twap-time-selector-list": {
      background: darkMode ? styles.displayBox : "white",
      border: `1px solid ${styles.cardBorder}`,
      borderRadius: "16px!important",
      padding: "0px!important",
    },
    ".twap-time-selector-list-item": {
      p: { color: styles.primaryTextColor },
      "&:hover": {
        background: darkMode ? "#262130" : "rgba(0,0,0, 0.06)",
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
      ".twap-token-logo": {
        // display: "none",
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
      color: styles.secondaryColor,
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
        color: "#b8add2",
      },
    },
    "@media (max-width:500px)": {
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

export const StyledContainer = styled(Styles.StyledColumnFlex)({});

export const StyledContainerContent = styled(Styles.StyledColumnFlex)<any>(({ theme, enabled, viewOnly }) => {
  const styles = baseStyles(theme);
  return {
    pointerEvents: viewOnly ? "all" : !enabled ? "none" : "all",
    background: viewOnly ? styles.cardColor : enabled ? styles.inputBox : styles.displayBox,
    padding: 10,
    borderRadius: 16,
    boxShadow: enabled && styles.inputShadow,
    border: !enabled ? `1px solid ${styles.displayBoxBorder}` : "1px solid transparent",
  };
});

export const StyledTokenPanelInput = styled(Components.TokenInput)({});

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

export const StyledTokenPanel = styled(Styles.StyledColumnFlex)({
  ".twap-token-logo": {
    width: 24,
    height: 24,
  },
});

export const StyledPercentSelect = styled(Styles.StyledRowFlex)({
  marginTop: 6,
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
      background: styles.inputBox,
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

export const StyledTokenPanelInputContainer = styled(Styles.StyledColumnFlex)({
  gap: 0,

  alignItems: "flex-end",
  ".twap-input": {
    width: "100%",
    input: {
      textAlign: "right",
    },
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

export const StyledChunksSlider = styled(Components.ChunksSliderSelect)(({ theme }) => {
  const styles = baseStyles(theme);
  return {
    marginLeft: 10,
    ".MuiSlider-thumb": {
      background: styles.primaryTextColor,
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

export const StyledButton = styled("button")({
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
  gap: 20,
});

export const StyledOutputAddress = styled(Components.OutputAddress)({
  marginTop: 20,
  fontSize: 14,
});

export const StyledSummaryModal = styled(Components.OrderSummaryModalContainer)(({ theme }) => {
  const styles = baseStyles(theme);
  return {
    ".twap-modal-content": {
      padding: "50px 15px 40px 15px",
      maxWidth: 400,
      overflowY: "auto",
      "&::-webkit-scrollbar": {
        display: "none",
      },
      "*": {
        color: styles.primaryTextColor,
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
    ".twap-card": {
      border: `1px solid ${styles.cardBorder}`,
      borderRadius: 16,
      padding: 15,
      transition: "0.2s all",
      color: `${styles.primaryTextColor}!important`,
      background: styles.cardColor,
    },
    ".twap-label": {
      color: styles.primaryTextColor,
    },
    ".twap-orders-summary-token-display": {
      ".twap-token-logo": {
        width: 40,
        height: 40,
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
