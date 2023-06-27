import { Box, styled } from "@mui/material";
import { Components, Styles } from "@orbs-network/twap-ui";

const getTootlipStyles = () => {
  return {
    background: "white",
    color: "#736394",
    fontSize: 15,
    borderRadius: 10,
    padding: "10px 15px",
    "*": {
      color: "inherit",
    },
  };
};

export const StyledSubmit = styled(Components.SubmitButton)({
  height: 48,
  fontWeight: 600,
  fontSize: 16,
  boxShadow: "rgba(14, 14, 44, 0.4) 0px -1px 0px 0px inset",
  borderRadius: 16,
  background: "#1fc7d4",
  transition: "0.2s all",
  marginTop: 20,
  "&:hover": {
    opacity: 0.65,
  },
  "*": {
    color: "#191326",
  },
});

export const configureStyles = (darkMode?: boolean) => {
  return {
    ".twap-order": {
      background: "#362F47!important",
      borderRadius: 16,
      padding: 15,
    },
    ".twap-orders-header-tabs": {
      background: "#372f47",
      ".Mui-selected": {
        color: "white!important",
      },
      ".MuiTabs-indicator": {
        background: "#2D2836",
      },
    },
    ".twap-order-progress": {
      background: "#2D2836!important",
      "&::after": {
        display: "none!important",
      },
      ".MuiLinearProgress-bar": {
        background: "#9a6aff!important",
      },
    },

    ".twap-switch": {
      ".MuiSwitch-thumb": {
        background: "#f4eeff!important",
      },
      ".MuiSwitch-track": {
        backgroundColor: "#362F47!important",
        opacity: "1!important",
      },
      ".Mui-checked+.MuiSwitch-track": {
        background: "#31D0AA!important",
      },
    },
    ".twap-time-selector-selected": {
      "&:hover": {
        opacity: 0.65,
      },
    },
    ".twap-time-selector-list": {
      background: "#27262C",
    },
    ".twap-time-selector-list-item": {
      "&:hover": {
        opacity: 0.65,
      },
    },
    ".twap-button-disabled": {
      background: "#3c3742!important",
      opacity: "1!important",
      cursor: "not-allowed!important",
      "*": {
        color: "#666171!important",
      },
    },
    ".twap-tooltip": {
      ".MuiTooltip-arrow": {
        color: "white!important",
      },
      "& .MuiTooltip-tooltip": {
        ...getTootlipStyles(),
      },
    },
    ".twap-loader": {
      background: "rgba(255,255,255, 0.1)!important",
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
      },
    },
    ".twap-label, .twap-market-price .title": {
      fontSize: 14,
    },
    ".twap-limit-price-input": {
      ".twap-token-logo": {
        display: "none",
      },
    },
    ".twap-input": {
      input: {
        color: "#f4eeff",
        fontSize: 16,
        fontWeight: 500,
        "&::placeholder": {
          color: "inherit",
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
  };
};

export const StyledContainer = styled(Styles.StyledColumnFlex)({});

export const StyledContainerContent = styled(Styles.StyledColumnFlex)<{ enabled?: number }>(({ enabled }) => ({
  background: enabled ? "#362F47" : "#3c3742",
  padding: 10,
  borderRadius: 16,
}));

export const StyledTokenPanelInput = styled(Components.TokenInput)({});

export const StyledBalance = styled(Components.TokenBalance)({
  fontSize: 12,
  color: "#b8add2",
  "*": {
    color: "inherit",
  },
});

export const StyledUSD = styled(Components.TokenUSD)({});

export const StyledEmptyUSD = styled(Box)({
  height: 18,
  opacity: 0,
});

export const StyledTokenSelect = styled(Components.TokenSelect)({
  ".twap-token-name": {
    fontWeight: 600,
    fontSize: 16,
  },
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

export const StyledTokenChangeContainer = styled(Styles.StyledRowFlex)({
  marginTop: 16,
  width: 32,
  height: 32,
  marginLeft: "auto",
  marginRight: "auto",
  "&:hover": {
    button: {
      background: "#1fc7d4",
      opacity: 0.65,
    },
    svg: {
      color: "white",
      fill: "white",
    },
  },
});

export const StyledTokenChange = styled(Components.ChangeTokensOrder)({
  button: {
    boxShadow: "rgba(0, 0, 0, 0.1) 0px -2px 0px inset",
    background: "#372f47",
    width: "100%",
    height: "100%",
    transition: "unset",
    svg: {
      color: "#b8add2",
      fill: "#b8add2",
      width: 17,
      height: 17,
    },
  },
});

export const StyledTokenPanelInputContainer = styled(Styles.StyledColumnFlex)({
  gap: 0,
  background: "#362F47",
  borderRadius: 16,
  padding: "12px 14px",
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

export const StyledChunksSlider = styled(Components.ChunksSliderSelect)({
  marginLeft: 10,
  ".MuiSlider-valueLabel": {
    ...getTootlipStyles(),
  },
});
