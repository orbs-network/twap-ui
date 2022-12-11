import { Box, styled } from "@mui/system";
import { Components, Styles as TwapStyles } from "@orbs-network/twap-ui";
import { CSSProperties } from "react";

export const colors = {
  cardBackground: "rgb(18, 17, 34)",
  submitButton: "rgb(29, 147, 132)",
  submitButtonBorder: "1px solid rgba(100, 221, 192, 0.15)",
  text: "rgba(255,255,255, 0.6)",
  icon: "#60E6C5",
  selectTokenFocus: "#1F2937",
  mainBackground: "#000315",
  borderColor: "rgb(55, 65, 81)",
  tooltipBackground: "rgb(30, 29, 45)",
};

export const Text = styled(TwapStyles.StyledText)({});

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

export const StyledButton = styled(Components.Button)({
  background: "rgb(115, 204, 231)",
  height: 40,
  borderRadius: "60px",
  fontWeight: 500,
  "& *": {
    color: "rgb(18, 17, 34)",
    fontWeight: 700,
  },
});

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
    textAlign: "right",
    outline: "1px solid transparent",
    borderRadius: "0.375rem",
    height: 40,
    transition: "0.2s all",
    paddingRight: 0,
    "&:focus": {},
    "&::placeholder": {
      color: colors.text,
    },
  },
});

const cardStyles: CSSProperties = {
  padding: 12,
  background: "rgb(18, 17, 34)",
  borderRadius: "0.375rem",
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



export const StyledTradeInfoModal = styled(Components.Modal)({
  "& a": {
    color: "white",
    fontWeight: 500,
    textDecoration: "underline",
  },
  "& *": {
    boxSizing: "border-box",
  },
  "& .MuiIconButton-root": {
    color: "white",
  },
  "& .twap-modal-content": {
    maxHeight: "85vh",
    overflow: "auto",
    borderRadius: "10px",
    padding: 15,
    paddingTop: 30,
    background: "linear-gradient(rgb(49, 65, 94) 0%, rgba(49, 65, 94, 0) 100%),rgba(18, 17, 34, 0.6)",
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
  "& .twap-label": {
    "& p": {
      color: colors.text,
    },
  },
  "& .odnp": {
    "*": {
      color: "black",
    },
    "& button": {
      color: "white",
    },
  },
  ".twap-loader": {
    backgroundColor: "rgba(255,255,255, 0.1)!important",
  },
  "& .twap-modal": {
    "& *": {
      color: colors.text,
    },
    "& .twap-modal-content": {
      position: "relative",
      background: "#19233B!important",
    },
  },
  "& .twap-button": {
    "& .twap-button-loader": {
      color: "white",
    },
  },
  "& .twap-container": {
    display: "flex",
    gap: 15,
    "*": {
      boxSizing: "border-box",
      color: colors.text,
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
      background: colors.text,
    },
  },

  "& .twap-tooltip": {
    "& .MuiTooltip-tooltip": {
      backgroundColor: colors.tooltipBackground,
      borderRadius: "4px",
      color: colors.text,
      fontSize: 14,
      fontFamily: "inherit",
      lineHeight: 1.5,
      padding: 16,
      maxWidth: 500,
    },
    "& .MuiTooltip-arrow": {
      color: colors.tooltipBackground,
    },
  },
  "& .twap-tooltip-icon": {
    fill: colors.icon,
  },
  ".twap-order-summary": {},
  ".twap-order-summary-rows": {
  },
};




export const StyledTrade = styled(Box)({
  width: "100%",
  "& .twap-input": {
    textAlign: "right",
    paddingRight: 10,
  },
});

export const StyledPrice = styled(Box)(() => ({
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
  gap: 10,
});

export const StyledPercentBtn = styled("button")({
  background: "transparent",
  border: "unset",
  cursor: "pointer",
  color: "rgb(140, 140, 227)",
  fontWeight: 700,
  fontSize: 14,
});

export const StyledIntervalTimeSelect = styled(Box)({
  flex: 1,
});
export const StyledTokenSelect = styled("button")(() => ({
  background: "rgba(255, 255, 255, 0.05)",
  border: "unset",
  padding: "6px 10px",
  borderRadius: 60,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: 5,
  "& .twap-token-name": {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.87)",
    fontWeight: 700,
  },

  "&:hover": {
    background: colors.selectTokenFocus,
  },
}));

export const StyledTokenDisplay = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 6,
});

export const StyledChangeOrder = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
}));

export const StyledTokenPanel = styled(Box)({
  width: "100%",
  "& .twap-input": {
    textAlign: "right",
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

export const StyledSwitch = styled(Components.Switch)({
  "& .MuiSwitch-thumb": {
    background: "white",
  },
  "& .MuiSwitch-track": {
    background: "#19202F",
    opacity: "1!important",
  },
  "& .Mui-checked+.MuiSwitch-track": {
    backgroundColor: "#19202F!important",
    opacity: "1!important",
  },
  "& .Mui-checked .MuiSwitch-thumb": {
    background: colors.icon,
  },
});

export const StyledMarketPrice = styled(Box)({
  "& .twap-card": {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    background: "rgba(255, 255, 255, 0.05)",
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
    fontFamily: "inherit",
    color: "white",
    boxSizing: "border-box",
  },
  "& .twap-order-details-progress": {
    background: "rgba(255, 255, 255, 0.05)",
  },
  "& .twap-orders-lists": {
    maxHeight: 600,
  },
  "& .twap-order": {
    border: "unset",
  },
  "& .twap-order-main-progress-bar": {
    background: "#22353C",
    "& .MuiLinearProgress-bar ": {
      background: "rgb(115, 204, 231)",
    },
  },
  "& .twap-orders-header": {
    "& .MuiTabs-root": {
      background: "rgba(255, 255, 255, 0.05)",
      "& .MuiTabs-indicator": {
        backgroundColor: colors.mainBackground,
      },
      "& .MuiButtonBase-root": {
        color: "#FFFFFF",
        fontWeight: 400,
      },
      "& .Mui-selected": {
        color: "#60E6C5",
      },
    },
  },
});

export const StyledTokenOrderPreviewAmount = styled(Components.SmallLabel)({
  fontSize: 19,
});
