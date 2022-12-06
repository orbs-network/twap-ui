import { Box, styled } from "@mui/system";
import { Components, Styles as TwapStyles } from "@orbs-network/twap-ui";
import { CSSProperties } from "react";

export const colors = {
  cardBackground: "rgb(18, 17, 34)",
  submitButtonBorder: "1px solid rgba(100, 221, 192, 0.15)",
  text: "rgb(113, 113, 113)",
  icon: "#60E6C5",
  light: "#60E6C5",
  selectTokenFocus: "#1F2937",
  mainBackground: "rgb(17, 17, 17)",
  borderColor: "rgb(55, 65, 81)",
  yellow: "rgb(255, 200, 0)",
};

export const Text = styled(TwapStyles.StyledText)({});

const coloredBoxStyles = {
  background: "rgb(28, 28, 28)",
  padding: 10,
  borderRadius: 8,
};

export const StyledTradeSizeContent = styled(TwapStyles.StyledColumnFlex)({
  ...coloredBoxStyles,
});

export const StyledColoredFlex = styled(TwapStyles.StyledRowFlex)({
  minHeight: 60,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  ...coloredBoxStyles,
});

export const StyledUSD = styled(Components.USD)({
  marginLeft: "auto",
  opacity: 0.6,
  "& p": {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
});

export const StyledBalance = styled(TwapStyles.StyledRowFlex)({
  borderTop: "1px solid rgba(255, 255, 255, 0.05)",
  paddingTop: 8,
  justifyContent: "space-between",
  "& *": {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 15,
  },
});

export const StyledButton = styled(Components.Button)(({ disabled }: { disabled?: boolean }) => ({
  background: disabled ? "rgb(229, 229, 229)" : colors.yellow,
  height: 50,
  borderRadius: 8,
  color: disabled ? colors.text : "black",

  "& *": {
    color: disabled ? colors.text : "black",
    fontWeight: 500,
    fontSize: 16,
  },
}));

export const StyledSlider = styled(Box)({
  flex: 1,
  paddingLeft: 30,
  paddingRight: 10,
  position: "relative",
  top: 2,
});

export const StyledNumbericInput = styled(Components.NumericInput)({
  "& input": {
    color: colors.text,
    fontSize: 24,
    fontWeight: 400,
    textAlign: "left",
    outline: "1px solid transparent",
    borderRadius: "0.375rem",
    height: 40,
    transition: "0.2s all",
    paddingRight: 0,
    textIndent: 0,
    "&:focus": {},
    "&::placeholder": {
      color: colors.text,
    },
  },
});

const cardStyles: CSSProperties = {
  padding: 12,
  background: colors.mainBackground,
  borderRadius: "0.375rem",
  width: "100%",
};

export const StyledCard = styled(Components.Card)({
  ...cardStyles,
});

export const StyledIcon = styled(Components.Icon)({
  "& path": {
    color: colors.icon,
  },
  "& line": {
    color: colors.icon,
  },
});

export const StyledOrderSummary = styled(Components.Modal)({
  "& a": {
    color: colors.text,
    fontWeight: 500,
    textDecoration: "underline",
  },
  "& *": {
    boxSizing: "border-box",
  },
  "& .MuiIconButton-root": {
    color: colors.text,
  },
  "& .twap-modal-content": {
    maxHeight: "85vh",
    overflow: "auto",
    borderRadius: "10px",
    padding: 15,
    paddingTop: 30,
    background: colors.mainBackground,
  },
});
export const StyledOrderSummaryContent = styled(Box)({});

export const StyledOrderConfirmation = styled(Box)({
  "& .output-text": {
    textAlign: "center",
    width: "100%",
    fontSize: 15,
  },
});

export const StyledLimitPrice = styled(Box)({
  width: "100%",
  "& .right": {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  "& .twap-token-logo": {
    width: 22,
    height: 22,
  },
});

export const StyledTokenOrder = styled(Box)({ width: "100%" });

export const globalStyle = {
  "& .odnp": {
    "*": {
      color: "black",
    },
    "& button": {
      color: colors.text,
    },
  },
  ".twap-loader": {
    backgroundColor: "rgba(255,255,255, 0.1)!important",
  },
  "& .twap-modal": {
    "& *": {
      color: colors.text,
    },
  },
  "& .twap-button": {
    "& .twap-button-loader": {
      color: colors.text,
    },
  },
  "& .twap-container": {
    display: "flex",
    gap: 15,
    "*": {
      boxSizing: "border-box",
      color: colors.text,
      fontFamily: "inherit!important",
    },
  },
  "& .twap-small-label": {
    fontSize: 14,
    opacity: 1,
  },
  "& .twap-change-order": {
    width: 50,
    height: 50,
  },
  "& .twap-token-name": {
    fontSize: 18,
  },
  "& .twap-token-logo": {
    width: 28,
    height: 28,
  },

  "& .twap-time-selector-list": {
    background: colors.mainBackground,
    border: `1px solid ${colors.borderColor}`,
    right: 0,
  },
  "& .twap-time-selector-list-item": {
    "&:hover": {
      background: "rgba(255,255,255, 0.05)",
    },
  },
  "& .twap-time-selector-list-item-selected": {
    background: "rgba(255,255,255, 0.05)",
  },

  "& .twap-card": { ...cardStyles },
  "& .twap-order-progress-line-preview": {
    "&::after": {
      background: "#373E55!important",
    },
    "& .MuiLinearProgress-bar": {
      background: colors.light,
    },
  },

  "& .twap-tooltip": {
    "& .MuiTooltip-tooltip": {
      backgroundColor: "rgba(32, 32, 34, 0.9)",
      borderRadius: "4px",
      color: colors.light,
      fontSize: 14,
      lineHeight: 1.5,
      padding: 16,
      maxWidth: 500,
    },
  },
  "& .twap-tooltip-icon": {
    fill: colors.icon,
  },
};

export const StyledTrade = styled(TwapStyles.StyledColumnFlex)({
  width: "100%",
  ...coloredBoxStyles,
  "& .twap-input": {
    textAlign: "left",
    paddingRight: 10,
  },
});

export const StyledPrice = styled(StyledColoredFlex)(() => ({
  width: "100%",
  "& .twap-price": {
    background: colors.mainBackground,
    padding: 10,
    borderRadius: 10,
    gap: 10,
  },
  "& .twap-price-icon * ": {
    color: colors.icon,
  },
  "& .twap-input": {
    textAlign: "center",
  },
}));

export const StyledDstToken = styled(Box)({
  width: "100%",
});

export const StyledSrcTokenPercentSelector = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 5,
});

export const StyledPercentBtn = styled("button")({
  background: "transparent",
  border: "unset",
  cursor: "pointer",
  color: colors.text,
  fontSize: 16,
  "&:hover": {
    color: "white",
  },
});

export const StyledIntervalTimeSelect = styled(Box)({
  flex: 1,
});
export const StyledTokenSelect = styled("button")(() => ({
  background: colors.mainBackground,
  border: "unset",
  padding: "6px 8px",
  borderRadius: 12,
  minHeight: 40,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: 10,
  "& .twap-token-name": {
    color: "white",
    fontWeight: 500,
  },
}));

export const StyledTokenDisplay = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 10,
});

export const StyledFlexStart = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  gap: 10,
  width: "100%",
});

export const StyledFlex = styled(Box)(({ gap = 10, justifyContent = "center" }: { gap?: number; justifyContent?: "flex-start" | "flex-end" | "center" }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent,
  width: "100%",
  gap,
}));

export const StyledFlexEnd = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  gap: 10,
  width: "100%",
});

export const StyledChangeOrder = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  "& button": {
    width: 35,
    height: 35,
    background: "rgb(28, 28, 28)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
}));

export const StyledTokenPanel = styled(Box)({
  width: "100%",
  "& .twap-input": {
    textAlign: "left",
  },
  "& .twap-token-logo": {
    width: "24px!important",
    height: "24px!important",
  },
  "& .twap-token-name": {
    fontSize: 20,
  },
});

export const StyledSwitch = styled(Components.Switch)({
  "& .MuiSwitch-thumb": {
    background: "white",
  },
  "& .MuiSwitch-track": {
    background: colors.mainBackground,
    opacity: "1!important",
  },
  "& .Mui-checked+.MuiSwitch-track": {
    backgroundColor: colors.mainBackground,
    opacity: "1!important",
  },
  "& .Mui-checked .MuiSwitch-thumb": {
    background: colors.yellow,
  },
});

export const StyledMarketPrice = styled(Box)({
  "& .twap-card": {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    background: "rgba(255, 255, 255, 0.03)",
    paddingBottom: 5,
  },
  "& .title": {
    fontSize: 13,
    opacity: 0.8,
  },
});

export const StyledMarketPriceRight = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 5,
  "& .twap-token-logo": {
    order: 2,
    width: 20,
    height: 20,
  },
  "& .twap-token-name": {
    order: 1,
    fontSize: 14,
  },
  "& .twap-text": {
    fontSize: 14,
  },
  "& .icon": {
    width: 20,
    height: 20,
  },
});

export const StyledTradeSize = styled(Box)({
  maxWidth: "80%",
  display: "flex",
  alignItems: "center",
  gap: 10,

  "& .twap-label": {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  "& .twap-token-logo": {
    width: 20,
    height: 20,
  },
  "& .twap-token-name": {
    fontSize: 16,
  },
});

export const StyledTotalTradesInput = styled(StyledNumbericInput)({
  width: 70,
  flex: "unset!important",
  "& input": {
    fontSize: 16,
  },
});

export const StyledSliderContainer = styled(TwapStyles.StyledRowFlex)({
  height: 30,
  justifyContent: "space-between",
});

export const StyledPanelLabel = styled(Components.SmallLabel)({
  "& *": {
    fontWeight: 700,
    color: "rgba(255, 255, 255, 0.6)",
  },
});

export const StyledOrdersContainer = styled(Box)({
  "& *": {
    color: colors.text,
    boxSizing: "border-box",
  },
  "& .twap-orders-lists": {
    maxHeight: 600,
  },
  "& .twap-order-separator": {
    background: "rgba(255,255,255, 0.5)",
  },
  "& .twap-order-details-progress": {
    background: colors.mainBackground,
  },
  "& .twap-order": {
    background: "rgb(28, 28, 28)",
  },
  "& .twap-order-main-progress-bar": {
    background: "rgb(28, 28, 28)",
    "& .MuiLinearProgress-bar ": {
      background: colors.yellow,
    },
  },
  "& .twap-orders-header": {
    "& .MuiTabs-root": {
      "& .MuiTabs-indicator": {
        background: colors.yellow,
      },
      "& .MuiButtonBase-root": {
        color: "#FFFFFF",
        fontWeight: 400,
      },
      "& .Mui-selected": {
        color: "black",
      },
    },
  },
});
