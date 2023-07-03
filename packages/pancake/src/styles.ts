import { Box, styled } from "@mui/material";
import { Components, Styles } from "@orbs-network/twap-ui";

const baseStyles = (darkMode?: boolean) => {
  return {
    primaryColor: darkMode ? "#1fc7d4" : "",
    primaryTextColor: darkMode ? "#f4eeff" : "#280d5f",
    secondaryTextColor: darkMode ? "#b8add2" : "#7a6eaa",
    inputBox: darkMode ? "#362F47" : "#EEEAF4",
    displayBox: darkMode ? "#3C3743" : "#E9EAEB",
    inputShadow: darkMode ? "" : "inset 0px 2px 2px -1px rgba(74,74,104,.1)",
    displayBoxBorder: darkMode ? "#262130" : "#d7caec",
  };
};

const getTootlipStyles = (isDarkTheme?: boolean) => {
  return {
    background: isDarkTheme ? "white" : "#27262C",
    color: isDarkTheme ? "#736394" : "white",
    fontSize: 15,
    borderRadius: 10,
    padding: "10px 15px",
    "*": {
      color: "inherit",
    },
  };
};

const getButtonStyles = () => {
  return {
    fontWeight: 600,
    fontSize: 16,
    boxShadow: "rgba(14, 14, 44, 0.4) 0px -1px 0px 0px inset",
    borderRadius: 16,
    background: "#1fc7d4",
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

export const StyledPoweredBy = styled(Components.PoweredBy)({
  color: "#1fc7d4",
  marginTop: 20,
  fontSize: 14,

  "*": {
    color: "inherit",
  },
});

export const StyledSubmit = styled(Components.SubmitButton)({
  height: 48,
  ...getButtonStyles(),
});

export const configureStyles = (darkMode?: boolean) => {
  const styles = baseStyles(darkMode);

  return {
    ".twap-adapter-wrapper": {
      width: "100%",
    },
    ".twap-modal": {
      ".MuiBackdrop-root": {
        background: darkMode ? "#f4eeff99" : "",
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
      border: darkMode ? "2px solid #524b63" : "2px solid #e9eaeb",
      borderRadius: 16,
      padding: 15,
      transition: "0.2s all",
      color: `${styles.primaryTextColor}!important`,
      "*": {},
    },
    ".twap-order-expanded-wrapper": {
      background: darkMode ? "#362F47" : "#FAF9FA",
      border: darkMode ? "2px solid #362F47" : "2px solid #FAF9FA",
    },

    ".twap-orders-header-tabs": {
      border: "unset!important",
      ".MuiTouchRipple-root": {
        display: "none!important",
      },
      "& .MuiButtonBase-root": {
        color: darkMode ? "#b8add2" : "#7a6eaa",
        fontWeight: 600,
        fontSize: 14,
      },
      borderRadius: "16px!important",
      background: darkMode ? "#372f47" : "#eeeaf4",
      ".Mui-selected": {
        color: darkMode ? "#f4eeff!important" : "white!important",
      },
      ".MuiTabs-indicator": {
        background: darkMode ? "#2D2836" : "#7a6eaa",
        borderRadius: "16px!important",
      },
    },
    ".twap-order-progress": {
      background: darkMode ? "#2D2836!important" : "#eeeaf4!important",
      "&::after": {
        display: "none!important",
      },
      ".MuiLinearProgress-bar": {
        background: darkMode ? `${styles.primaryColor}!important` : "#7a6eaa!important",
      },
    },

    ".twap-switch": {
      ".MuiSwitch-thumb": {
        background: `${styles.primaryTextColor}!important`,
      },
      ".MuiSwitch-track": {
        backgroundColor: darkMode ? "#362F47!important" : "#E9EAEB!important",
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
      background: darkMode ? "#27262C" : "white",
      border: darkMode ? "" : "1px solid #d7caec!important",
    },
    ".twap-time-selector-list-item": {
      "&:hover": {
        opacity: 0.65,
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
        ...getTootlipStyles(darkMode),
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
      fontSize: 14,
      color: styles.primaryTextColor,
      "*": {
        color: "inherit",
      },
    },
    ".twap-limit-price-input": {
      ".twap-token-logo": {
        display: "none",
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
    "@media (min-width:700px)": {
      ".twap-order": {
        "&:hover": {
          background: darkMode ? styles.inputBox : "#FAF9FA",
          border: darkMode ? "2px solid #362F47" : "2px solid #FAF9FA",
        },
      },
    },
    "@media (max-width:700px)": {
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

export const StyledContainerContent = styled(Styles.StyledColumnFlex)<any>((props) => {
  const styles = baseStyles(!!props.isDarkTheme);
  return {
    background: props.enabled ? styles.inputBox : styles.displayBox,
    padding: 10,
    borderRadius: 16,
    boxShadow: props.enabled && styles.inputShadow,
    border: !props.enabled ? `1px solid ${styles.displayBoxBorder}` : "1px solid transparent",
    "*": {
      color: styles.secondaryTextColor,
    },
  };
});

export const StyledTokenPanelInput = styled(Components.TokenInput)({});

export const StyledBalance = styled(Components.TokenBalance)<{ isDarkTheme?: number }>(({ isDarkTheme }) => {
  const styles = baseStyles(!!isDarkTheme);
  return {
    fontSize: 12,
    color: styles.secondaryTextColor,
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
    justifyContent: "flex-start",
  },
});

export const StyledUSD = styled(Components.TokenUSD)({});

export const StyledEmptyUSD = styled(Box)({
  height: 18,
  opacity: 0,
});

export const StyledTokenSelect = styled(Components.TokenSelect)<{ isDarkTheme: number }>(({ isDarkTheme }) => {
  const styles = baseStyles(!!isDarkTheme);
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
  button: {
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
  },
});

export const StyledTokenChangeContainer = styled(Styles.StyledRowFlex)<{ isDarkTheme: number }>(({ isDarkTheme }) => {
  const styles = baseStyles(!!isDarkTheme);
  return {
    marginTop: 16,
    width: 32,
    height: 32,
    marginLeft: "auto",
    marginRight: "auto",
    "&:hover": {
      button: {
        background: isDarkTheme ? styles.primaryColor : "#75DBE3",
        opacity: isDarkTheme ? 0.65 : 1,
      },
      svg: {
        color: "white",
        fill: "white",
      },
    },
  };
});

export const StyledTokenChange = styled(Components.ChangeTokensOrder)<{ isDarkTheme: number }>(({ isDarkTheme }) => {
  const styles = baseStyles(!!isDarkTheme);
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

export const StyledChunksSlider = styled(Components.ChunksSliderSelect)<{ isDarkTheme?: number }>(({ isDarkTheme }) => ({
  marginLeft: 10,
  ".MuiSlider-valueLabel": {
    ...getTootlipStyles(!!isDarkTheme),
  },
}));
