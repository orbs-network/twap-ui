import { Box, styled } from "@mui/system";
import TWAPLib from "@orbs-network/twap-ui";
import { createTheme } from "@mui/material/styles";
import { CSSProperties } from "react";
import { GlobalStylesProps } from "@mui/material";

const { USD, Button, Icon, NumericInput, Card, Switch, SmallLabel } = TWAPLib.baseComponents;

const { TradeInfoModal } = TWAPLib.components;

export const colors = {
  cardBackground: "#18202F",
  submitButton: "rgb(29, 147, 132)",
  submitButtonBorder: "1px solid rgba(100, 221, 192, 0.15)",
  text: "#ffffff",
  icon: "#60E6C5",
  light: "#60E6C5",
  selectTokenFocus: "#1F2937",
  mainBackground: "#000315",
  borderColor: "rgb(55, 65, 81)",
};

export const StyledUSD = styled(USD)({
  opacity: 0.6,
  maxWidth: "20%",
  "& p": {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
});

export const StyledButton = styled(Button)({
  background: colors.submitButton,
  border: `1px solid ${colors.submitButtonBorder}`,
  height: 40,
  borderRadius: 4,
  fontWeight: 500,
  color: "white",
});

export const StyledSlider = styled(Box)({
  flex: 1,
  paddingLeft: 30,
  paddingRight: 10,
  position: "relative",
  top: 2,
});

export const StyledNumbericInput = styled(NumericInput)({
  "& input": {
    color: colors.text,
    fontSize: 24,
    fontWeight: 400,
    textAlign: "right",
    outline: "1px solid transparent",
    borderRadius: "0.375rem",
    height: 40,
    transition: "0.2s all",
    "&:focus": {
      outline: "1px solid #1D9391",
    },
    "&::placeholder": {
      color: "white",
    },
  },
});

const cardStyles: CSSProperties = {
  padding: 12,
  background: colors.cardBackground,
  borderRadius: "0.375rem",
};

export const StyledCard = styled(Card)({
  ...cardStyles,
});

export const StyledIcon = styled(Icon)({
  "& path": {
    color: colors.icon,
  },
  "& line": {
    color: colors.icon,
  },
});

export const StyledTradeInfoModal = styled(TradeInfoModal)({
  "& .twap-modal-content": {
    background: colors.mainBackground,
    border: `1px solid ${colors.borderColor}`,
    maxHeight: "85vh",
    overflow: "auto",
    borderRadius: "10px",
    padding: 15,
    paddingTop: 30,
  },
});

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
  "& .twap-container": {
    display: "flex",
    gap: 15,
    marginTop: 20,
    "*": {
      boxSizing: "border-box",
      color: "white",
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

  a: {
    color: "white",
    fontWeight: 500,
  },

  "& .twap-tooltip": {
    "& .MuiTooltip-tooltip": {
      backgroundColor: colors.mainBackground,
      fontSize: 14,
      fontFamily: "inherit",
    },
  },
};

export const StyledTrade = styled(Box)({
  width: "100%",
  "& .twap-input": {
    textAlign: "right",
    paddingRight: 10,
  },
});

export const StyledPrice = styled(Box)(({ theme }) => ({
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
  width: "100%",
});

export const StyledPercentBtn = styled("button")({
  background: colors.borderColor,
  height: 22,
  width: "25%",
  border: "unset",
  borderRadius: 4,
  cursor: "pointer",
  transition: "0.2s all",
  "&:hover": {
    background: "rgba(100, 221, 192, 0.15)",
    color: "rgb(96, 230, 197)",
  },
});

export const StyledIntervalTimeSelect = styled(Box)({
  flex: 1,
});
export const StyledTokenSelect = styled("button")(({ theme }) => ({
  background: "transparent",
  border: "unset",
  padding: "6px",
  borderRadius: 2,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: 5,
  marginLeft: 10,

  "&:hover": {
    background: colors.selectTokenFocus,
  },
}));

export const StyledTokenDisplay = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 6,
});

export const StyledFlexBetween = styled(Box)(({ gap = 0 }: { gap?: number }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  gap,
}));

export const StyledFlexStart = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  gap: 10,
  width: "100%",
});

export const StyledChangeOrder = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
}));

export const StyledTokenPanel = styled(Box)({
  width: "100%",
  "& .twap-input": {
    textAlign: "left",
  },
  "& .twap-token-logo": {
    width: "28px!important",
    height: "28px!important",
  },
  "& .twap-token-name": {
    fontSize: 22,
  },
});

export const StyledColumnGap = styled(Box)(({ gap }: { gap?: number }) => ({
  display: "flex",
  flexDirection: "column",
  gap: gap || 10,
  alignItems: "flex-start",
  width: "100%",
}));
globalStyle;
export const StyledSwitch = styled(Switch)({
  "& .MuiSwitch-thumb": {
    background: "white",
  },
  "& .MuiSwitch-track": {
    background: colors.mainBackground,
  },
  "& .Mui-checked+.MuiSwitch-track": {
    background: colors.mainBackground,
  },
  "& .Mui-checked .MuiSwitch-thumb": {
    background: colors.icon,
  },
});

export const StyledMarketPrice = styled(Box)({
  "& .twap-card": {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    background: "#0D1321",
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

export const StyledTotalTrades = styled(SmallLabel)({
  minWidth: 50,
  justifyContent: "flex-end",
  "& p": {
    fontSize: 18,
    textAlign: "right",
  },
});

export const StyledTotalTradesInput = styled(StyledNumbericInput)({
  width: 70,
  flex: "unset!important",
  "& input": {
    fontSize: 16,
  },
});
