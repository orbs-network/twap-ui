import { Box, styled } from "@mui/system";
import { Components, Styles as TwapStyles, StylesConfig } from "@orbs-network/twap-ui";

interface Styles extends StylesConfig {
  lighterTextColor: string;
}

// Styles configuration
export const darkModeStylesConfig: Styles = {
  iconsColor: "rgb(140, 140, 227)",
  textColor: "rgba(255, 255, 255, 0.6)",
  lighterTextColor: "rgba(255, 255, 255, 0.87)",
  tooltipBackground: "rgb(30, 29, 45)",
  tooltipTextColor: "rgba(255, 255, 255, 0.6)",
  spinnerColor: "white",
  containerBackground: "#192239",
  cardBackground: "rgb(18, 17, 34)",
  progressBarColor: "#60E6C5",
  progressBarTrackColor: "#373E55",
  orderHistorySelectedTabBackground: "rgba(96, 230, 197, 0.26)",
  orderHistoryTabColor: "white",
  orderHistorySelectedTabColor: "rgb(96, 230, 197)",
};

export const lightModeStylesConfig: Styles = {
  iconsColor: "rgb(140, 140, 227)",
  textColor: "rgba(255, 255, 255, 0.6)",
  lighterTextColor: "rgb(49, 65, 94)",
  tooltipBackground: "rgb(30, 29, 45)",
  tooltipTextColor: "rgba(255, 255, 255, 0.6)",
  spinnerColor: "white",
  containerBackground: "rgb(242, 244, 248)",
  cardBackground: "rgb(228, 233, 241)",
  progressBarColor: "#60E6C5",
  progressBarTrackColor: "#373E55",
  orderHistorySelectedTabBackground: "rgba(96, 230, 197, 0.26)",
  orderHistoryTabColor: "white",
  orderHistorySelectedTabColor: "rgb(96, 230, 197)",
};

export const StyledCardFlex = styled(TwapStyles.StyledRowFlex)({
  paddingLeft: 10,
  paddingRight: 10,
});

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

export const StyledSummaryRow = styled(StyledCardFlex)({
  justifyContent: "space-between",
  "& p": {
    fontSize: 14,
  },
  "& .twap-label": {
    fontSize: 14,
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

export const StyledTrade = styled(Box)({
  width: "100%",
  "& .twap-input": {
    width: 50,
    "& input": {
      textAlign: "right",
    },
  },
});

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
  "& .twap-panel-title": {
    fontWeight: 700,
    fontSize: 14,
  },
  width: "100%",
  "& .twap-input": {
    textAlign: "right",
    width: "100%",
  },
});

export const StyledColumnGap = styled(Box)(({ gap }: { gap?: number }) => ({
  display: "flex",
  flexDirection: "column",
  gap: gap || 10,
  alignItems: "flex-start",
  width: "100%",
}));

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

export const StyledTotalTradesInput = styled(Components.NumericInput)({
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
  },
});
export const StyledTokenOrderPreviewAmount = styled(Components.SmallLabel)({
  fontSize: 19,
});

export const configureStyles = (darkMode: boolean) => {
  const styles = darkMode ? darkModeStylesConfig : lightModeStylesConfig;
  return {
    ".twap-order-summary": {
      padding: 30,
    },
    ".twap-balance": {
      borderTop: "1px solid rgba(255, 255, 255, 0.05)",
      paddingTop: 5,
      fontSize: 14,
    },
    ".twap-limit-price": {
      ".twap-price": {
        background: styles.containerBackground,

        padding: "10px",
        borderRadius: 10,
        gap: 10,
      },
      ".twap-input": {
        "& input": {
          fontSize: 16,
          textAlign: "center" as const,
        },
      },
    },
    ".twap-token-select": {
      boxShadow: "rgb(49 65 94 / 8%) 0px 10px 17px, rgb(49 65 94 / 4%) 0px 5px 26px",
      background: darkMode ? "rgba(255, 255, 255, 0.05)" : "rgb(242, 244, 248)",
      border: "unset",
      padding: "0px 20px 0px 6px",
      borderRadius: 60,
      height: 32,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: 5,
      "& .twap-token-name": {
        fontSize: 16,
        color:   styles.lighterTextColor,
        fontWeight: 700,
      },
      "& .twap-token-logo": {
        width: 24,
        height: 24,
      },
    },
    ".twap-market-price": {
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
    },
    ".twap-icon": {
      "& *": {
        color: `${styles.iconsColor}!important`,
      },
    },
    ".twap-tooltip": {
      "& .MuiTooltip-tooltip": {
        backgroundColor: styles.tooltipBackground,
        borderRadius: "4px",
        color: styles.tooltipTextColor,
        fontSize: 14,
        fontFamily: "inherit",
        lineHeight: 1.5,
        maxWidth: 400,
        padding: 10,
        "& *": {
          color: styles.tooltipTextColor,
          fontSize: 14,
        },
      },
      "& .MuiTooltip-arrow": {
        color: styles.tooltipBackground,
      },
    },
    ".twap-loader": {
      backgroundColor: `${styles.skeletonLoaderBackground || "rgba(255,255,255, 0.1)"}!important`,
    },
    ".twap-modal": {
      background: "rgba(0,0,0, 0.8)",
      fontFamily: "Red Hat Display",
      color: styles.textColor,
      "& *": {
        color: styles.textColor,
        "&::-webkit-scrollbar": {
          display: "none",
        },
      },
    },
    ".twap-button-loader": {
      color: `${styles.spinnerColor}!important`,
      zoom: `0.55!important`,
    },
    ".twap-time-selector": {
      ".twap-input": {
        "& input": {
          fontSize: 16,
          "&::placeholder": {
            color: "rgba(255,255,255, 0.5)!important",
          },
        },
      },
    },
    ".twap-time-selector-list": {
      background: styles.containerBackground,
      border: `1px solid ${styles.borderColor || "transparent"}`,
      right: 0,
    },
    ".twap-card": {
      padding: "10px 5px",
      background: styles.cardBackground,
      borderRadius: "0.375rem",
    },
    ".twap-create-order-btn": {
      marginTop: 20,
    },
    ".twap-container": {
      width: "100%",
      display: "flex",
      flexDirection: "column" as const,
      gap: 8,
      marginTop: 20,
      "*": {
        color: styles.textColor,
        fontFamily: "inherit!important",
        "&::-webkit-scrollbar": {
          display: "none",
        },
      },
    },
    ".twap-small-label": {
      fontSize: 14,
      opacity: 1,
    },
    ".twap-slider": {
      "& .MuiSlider-valueLabel": {
        background: styles.tooltipBackground,
      },
      "& .MuiSlider-valueLabelLabel": {
        color: styles.tooltipTextColor,
      },
      "& .MuiSlider-thumb": {
        background: styles.iconsColor,
      },
    },
    ".twap-change-order": {
      "& button": {
        width: 28,
        height: 28,
        background: "rgba(255, 255, 255, 0.05)",
        border: "unset",
        padding: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 50,
        cursor: "pointer",
        transition: "0.2s all",
        "&:hover": {
          background: "rgba(255, 255, 255, 0.03)",
        },
      },
    },
    ".twap-token-name": {
      fontSize: 18,
    },
    ".twap-token-logo": {
      width: 28,
      height: 28,
    },
    ".twap-switch": {
      "& .MuiSwitch-thumb": {
        background: "white",
      },
      "& .MuiSwitch-track": {
        background: `${styles.containerBackground}!important`,
        opacity: "1!important",
      },
      "& .Mui-checked+.MuiSwitch-track": {
        backgroundColor: `${styles.containerBackground}!important`,
        opacity: "1!important",
      },
      "& .Mui-checked .MuiSwitch-thumb": {
        background: styles.iconsColor,
      },
    },
    ".twap-order": {
      border: "1px solid rgb(55, 65, 81)",
      "& .twap-order-expanded-colored": {
        background: "rgb(60, 64, 78)",
      },
      "& .twap-order-progress": {
        "&::after": {
          background: `${styles.progressBarTrackColor}!important`,
        },
        "& .MuiLinearProgress-bar": {
          background: styles.progressBarColor,
        },
      },
    },
    ".twap-orders-header": {
      "& .twap-orders-header-tabs": {
        "& .MuiTabs-indicator": {
          backgroundColor: styles.orderHistorySelectedTabBackground,
        },
        "& .MuiButtonBase-root": {
          color: styles.orderHistoryTabColor,
          fontWeight: 400,
        },
        "& .Mui-selected": {
          color: styles.orderHistorySelectedTabColor,
        },
      },
    },
    ".twap-orders-lists": {
      maxHeight: 600,
    },
    ".twap-usd": {
      opacity: 0.6,
    },

    ".twap-input": {
      "& input": {
        fontFamily: "inherit",
        fontWeight: 400,
        outline: "1px solid transparent",
        borderRadius: "0.375rem",
        transition: "0.2s all",
        height: 35,
        color: styles.lighterTextColor,
        fontSize: 18,
        textAlign: "right" as const,
        padding: "unset",
        "&::placeholder": {
          color: styles.lighterTextColor,
          opacity: 0.8,
        },
      },
    },
    ".twap-button": {
      height: 30,
      borderRadius: 60,
      background: "rgb(115, 204, 231)",
      color: "rgb(18, 17, 34)",
      width: "fit-content!important",
      padding: "0px 16px",
      minWidth: 180,
      marginLeft: "auto",
      marginRight: "auto",
      "& *": {
        color: "inherit",
        fontWeight: 700,
        fontSize: 14,
      },
    },
    ".twap-button-disabled": {
      background: "rgba(255, 255, 255, 0.09)",
      opacity: 0.45,
      color: "rgba(255, 255, 255, 0.38)",
    },

    ".twap-modal-content": {
      background: styles.containerBackground,

      maxHeight: "85vh",
      overflow: "auto",
      borderRadius: "10px",
      padding: 15,
      paddingTop: 30,
      "& a": {
        color: "white",
        fontWeight: 500,
        textDecoration: "underline",
      },
      "& .MuiIconButton-root": {
        color: "white",
      },
      "& *": {
        fontFamily: "inherit",
      },
    },
  };
};
