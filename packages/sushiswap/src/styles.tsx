import { Box, createTheme, styled, Theme } from "@mui/material";
import { Components, Styles } from "@orbs-network/twap-ui";
import { ReactNode } from "react";

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

const getStyles = (theme?: Theme) => {
  const isDarkMode = theme?.palette.mode === "dark" ? 1 : 0;

  return {
    isDarkMode,
    accent: isDarkMode ? "#ffffff14" : "#00000014",
    darkText: isDarkMode ? "rgb(148 163 184/1)" : "rgb(107 114 128/1)",
    darkTextHover: isDarkMode ? "rgb(203 213 225/1)" : "rgb(37 99 235/1)",
    warningText: "rgb(239 68 68/1)",
    textColor: isDarkMode ? "rgb(248 250 252/1)" : "rgb(17 24 39/1)",
    messageText: isDarkMode ? "#94a3b8" : "#6b7280",
    boxHover: isDarkMode ? "rgba(255,255,255, 0.09)" : "rgba(0,0,0, 0.03)",
  };
};

export const StyledPanelInput = styled(Components.TokenPanelInput)({
  input: {
    fontSize: 30,
    height: 44,
    fontWeight: 500,
    "@media (max-width: 600px)": {
      fontSize: 24,
    },
  },
});

export const StyledSmallText = styled("span")(({ theme }) => {
  const styles = getStyles(theme);
  return {
    color: styles.darkText,
    fontWeight: "500!important",
    fontSize: 17,
    small: {
      fontSize: 14,
      color: styles.darkText,
      fontWeight: "500!important",
    },
  };
});

export const StyledBalance = styled(Styles.StyledRowFlex)<{ disabled?: number }>(({ theme, disabled }) => {
  const styles = getStyles(theme);
  const darkDisabled = disabled ? "rgb(100 116 139/1)" : styles.darkText;
  const lightDisabled = disabled ? "rgb(107 114 128/1)" : "rgb(59 130 246/1)";
  const color = styles.isDarkMode ? darkDisabled : lightDisabled;
  const hover = disabled ? "" : styles.darkTextHover;

  return {
    gap: 5,
    cursor: disabled ? "auto" : "pointer",
    width: "auto",
    "*": {
      color: color,
    },
    small: {
      color: color,
    },
    svg: {
      fill: color,
      width: 20,
      height: 20,
    },
    "&:hover": {
      "*": {
        color: hover,
      },
      svg: {
        fill: hover,
      },
    },
  };
});

export const StyledUSD = styled(Styles.StyledText)(({ theme }) => {
  const styles = getStyles(theme);
  return {
    color: styles.darkText,
    fontWeight: 500,
  };
});

export const StyledTokenChange = styled(Components.ChangeTokensOrder)(({ theme }) => {
  const styles = getStyles(theme);
  const bg = styles.isDarkMode ? "#0f172a" : "#f4f5f6";
  return {
    height: 0,
    button: {
      position: "absolute",
      border: `1px solid ${styles.accent}`,
      background: bg,
      width: 30,
      height: 30,
      borderRadius: "50%",
      "&:hover": {
        background: bg,
        svg: {
          transform: "rotate(180deg)",
        },
      },
    },
    svg: {
      transition: "0.2s all",
      width: 27,
      height: 27,
      fill: "rgb(59 130 246/1)",
    },
    "@media(max-width: 1000px)": {
      height: "auto",
      button: {
        position: "static",
      },
    },
  };
});

export const StyledContainer = styled(Styles.StyledColumnFlex)({
  gap: 15,
});

export const StyledColumnFlex = styled(Styles.StyledColumnFlex)({
  gap: 16,
});

const buttonStyles = {
  borderRadius: 12,
  background: "rgb(59 130 246/1)",
  minHeight: 52,
  fontWeight: 500,
  fontSize: 16,
  lineHeight: "24px",
  padding: 10,
  color: "white",
  "*": {
    fontWeight: "inherit",
    fontSize: "inherit",
    lineHeight: "inherit",
    color: "white!important",
  },
};

export const StyledSubmit = styled(Components.SubmitButton)({});

export const StyledPoweredBy = styled(Components.PoweredBy)({
  marginTop: 20,
});

const selectTokenStyles = (theme: Theme) => {
  const styles = getStyles(theme);

  return {
    gap: 8,
    background: styles.isDarkMode ? "#ffffff0a" : "#0000000a",
    padding: 8,
    borderRadius: 30,
    color: styles.textColor,
    "*": {
      color: "inherit",
    },
    svg: {
      width: 15,
      height: 15,
    },

    ".twap-token-logo": {
      width: 28,
      height: 28,
    },
    ".twap-token-name": {
      fontSize: 18,
      fontWeight: 500,
    },
    p: {
      fontSize: 16,
      fontWeight: 600,
    },
    ".twap-token-display": {
      gap: 8,
    },
  };
};

export const StyledTokenSelect = styled(Components.TokenSelect)(({ theme }) => {
  const styles = getStyles(theme);
  return {
    ...selectTokenStyles(theme),
  };
});

export const StyledTokenSelectLimit = styled(Styles.StyledRowFlex)(({ theme }) => {
  return {
    ...selectTokenStyles(theme),
    width: "auto",
  };
});

const cardBodyStyles = (theme?: Theme) => {
  const styles = getStyles(theme);
  return {
    background: styles.isDarkMode ? "rgb(30 41 59/1)" : "white",
    borderRadius: 12,
    padding: 12,
    border: `1px solid ${styles.accent}`,
  };
};

const tooltipStyles = (theme?: Theme) => {
  const styles = getStyles(theme);

  return {
    backgroundColor: styles.isDarkMode ? "rgba(30,41,59,.5)" : "#F9F9FA",
    backdropFilter: "blur(10px) saturate(190%) contrast(70%) brightness(80%)",
    borderRadius: "12px",
    fontSize: 14,
    padding: 16,
    fontWeight: 400,
    color: styles.isDarkMode ? "#94a3b8" : "rgb(107 114 128/1)",
    border: `1px solid ${styles.accent}`,
    lineHeight: "20px",
    "& *": {
      color: "inherit",
      fontSize: "inherit",
      fontWeight: "inherit",
    },
  };
};
export const configureStyles = (theme?: Theme) => {
  const styles = getStyles(theme);
  const isDarkMode = styles.isDarkMode;
  return {
    ".twap-order-menu": {
      ...cardBodyStyles(theme),
      minWidth: "100%",
      borderRadius: 6,
      overflow: "hidden",
      padding: 0,
      top: "calc(100% + 4px)",
      "&-item": {
        fontSize: 14,
        padding: "7px 10px",
        "&:hover": {
          background: isDarkMode ? "#ffffff0a" : "#0000000a",
        },
      },
    },
    ".twap-adapter-wrapper": {
      ".MuiTouchRipple-root": {
        display: "none",
      },
      "*": {
        fontFamily: "inherit",
      },
    },
    ".twap-order-container": {
      ...cardBodyStyles(theme),
      background: styles.isDarkMode ? "#ffffff0a" : "white",
      transition: "0.2s all",
      "&:hover": {
        background: styles.boxHover,
      },
    },
    ".twap-separator": {
      background: isDarkMode ? "rgba(255, 255, 255, 0.07)" : "rgba(0, 0, 0, 0.07)",
    },
    ".twap-order-display": {
      ".twap-token-logo": {
        width: "40px!important",
        height: "40px!important",
      },
      ".twap-custom-usd": {},
      ".twap-order-display-token-amount": {
        fontWeight: 500,
        fontSize: 17,
      },
      ".twap-order-modal-market-warning": {
        background: styles.accent,
      },
      ".twap-order-display-details": {
        ...cardBodyStyles(theme),
        background: styles.isDarkMode ? "#ffffff0a" : "white",
        gap: 10,
      },
      ".twap-label p": {
        fontWeight: 500,
      },
      ".twap-order-display-details-row-right": {
        color: styles.isDarkMode ? "#94a3b8" : "#6b7280",
        fontSize: 13,
        "*": {
          color: styles.isDarkMode ? "#94a3b8" : "#6b7280",
          fontSize: 13,
        },
      },
      ".twap-order-display-separator": {
        background: "unset",
        margin: "8px 0px!important",
      },
    },
    ".twap-time-selector-menu": {
      ".MuiMenu-paper": {
        ...cardBodyStyles(theme),
        padding: 0,
      },
    },
    ".twap-order-modal-submitted-logo": {
      svg: {
        fill: "rgb(59 130 246/1)",
      },
    },
    ".twap-limit-price-message": {
      ...cardBodyStyles(theme),
      "*": {
        color: styles.messageText,
      },
    },
    "*": {
      color: styles.textColor,
    },

    ".twap-button-disabled": {
      opacity: 0.7,
      pointer: "disabled",
    },
    ".twap-label": {
      p: {
        color: "inherit",
        fontSize: 15,
        fontWeight: 600,
        letterSpacing: "-.025em",
      },
    },
    ".twap-modal-content": {
      outline: "none!important",
      padding: "10px 16px 16px 16px",
      background: isDarkMode ? "rgb(30 41 59/1)" : "#F4F5F6",
      border: "unset",
      maxHeight: "90vh",
      overflowY: "auto",
      width: "calc(100vw - 40px)",
      borderRadius: 16,
      color: styles.textColor,
      ".twap-ui-close": {
        color: styles.textColor,
      },
    },
    ".twap-button": {
      ...buttonStyles,
    },
    ".twap-odnp-button": {
      ...buttonStyles,
      minHeight: "unset",
      border: "unset",
    },

    ".twap-input": {
      input: {
        boxShadow: "none!important",
        border: "none!important",
        outline: "none!important",
        "&::placeholder": {
          color: isDarkMode ? "white!important" : "rgb(17 24 39/1)!important",
          opacity: 0.4,
        },
      },
    },
    ".twap-card": {
      background: isDarkMode ? "rgb(30 41 59/1)" : "white",
      padding: 12,
      borderRadius: 12,
    },
    ".twap-limit-price-input": {
      paddingLeft: "0px!important",
    },
    ".MuiBackdrop-root": {
      background: isDarkMode ? "rgba(0,0,0,.4)!important" : "rgba(255,255,255,.4)!important",
      backdropFilter: "blur(10px) saturate(190%) contrast(70%) brightness(80%)",
    },
    ".twap-time-selector": {
      ".twap-input": {
        input: {
          height: 30,
        },
      },
      ".twap-loader": {
        right: 0,
      },
    },
    ".twap-loader": {
      background: isDarkMode ? "rgba(255,255,255,0.1)!important" : "rgba(0,0,0,0.1)!important",
    },

    ".MuiSwitch-thumb": {
      color: isDarkMode ? "rgb(15 23 42/1)!important" : "rgb(249 250 251/1)!important",
    },
    ".MuiSwitch-track": {
      background: isDarkMode ? "hsla(0,0%,100%,.1)!important" : "rgba(0,0,0,.1)!important",
      height: 20,
    },
    ".twap-disclaimer-switch": {
      p: {
        fontSize: 15,
        fontWeight: 500,
      },
    },
    ".Mui-checked+.MuiSwitch-track": {
      background: "rgb(59 130 246/1)!important",
      opacity: "1!important",
    },
    ".Mui-checked .MuiSwitch-thumb": {
      color: "white!important",
    },
    ".twap-tooltip": {
      "& .MuiTooltip-tooltip": {
        ...tooltipStyles(theme),
      },
      "& .MuiTooltip-arrow": {
        display: "none",
      },
    },

    ".twap-orders-header": {
      padding: "0px!important",
    },
    "@media (max-width: 600px)": {
      ".twap-order-display": {
        ".twap-token-logo": {
          width: "30px!important",
          height: "30px!important",
        },
        ".twap-order-display-token-amount": {
          fontSize: 17,
        },
        ".twap-order-display-token-title": {
          fontSize: 14,
        },
      },
    },
  };
};

export const StyledLimitSwitch = styled(Components.LimitSwitch)(({ theme }) => {
  const styles = getStyles(theme);
  const isDarkMode = styles.isDarkMode;
  return {
    background: isDarkMode ? "transparent" : "white",
    border: `1px solid ${styles.accent}`,
    borderRadius: 8,
    padding: 2,
    ".MuiTabs-indicator": {
      background: isDarkMode ? "#ffffff14" : "#0000000a",
      borderRadius: 6,
      border: `1px solid ${styles.accent}`,
      transitionDuration: "0.2s",
    },
    ".MuiButtonBase-root": {
      padding: "6px 0px",
      textTransform: "none",
      minWidth: 80,
      minHeight: "unset",
      zIndex: 1,
      color: isDarkMode ? "white" : "#000",
      fontSize: 13,
      fontWeight: 500,
      opacity: 0.6,
    },
    ".Mui-selected": {
      opacity: 1,
    },
  };
});

const StyledCardHeader = styled(Styles.StyledRowFlex)({
  justifyContent: "space-between",
});

export const StyledCard = styled(StyledColumnFlex)(({ theme }) => {
  const styles = getStyles(theme);
  return {
    width: "100%",
    gap: 6,
    ".twap-message": {
      color: styles.messageText,
      fontSize: 14,
      lineHeight: "20px",
    },
  };
});

export const Card = ({ children, className = "" }: { children: ReactNode; className?: string }) => {
  return <StyledCard className={className}>{children}</StyledCard>;
};

export const CardHeader = ({ children, className = "" }: { children: ReactNode; className?: string }) => {
  return <StyledCardHeader className={className}> {children}</StyledCardHeader>;
};

export const CardBody = ({ children, className = "" }: { children: ReactNode; className?: string }) => {
  return <StyledCardBody className={`${className} twap-card-body`}> {children}</StyledCardBody>;
};

Card.Header = CardHeader;
Card.Body = CardBody;

export const StyledCardBody = styled(Box)(({ theme }) => {
  return {
    ...cardBodyStyles(theme),
    width: "100%",
    minHeight: 55,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  };
});

export const StyledTokenPanel = styled(CardBody)<{ error?: number }>(({ theme, error }) => {
  const isDarkMode = getStyles(theme).isDarkMode;
  const bg = isDarkMode ? "rgba(239,68,68,.2)" : "rgba(239,68,68,.2)";
  return {
    background: error ? bg : "",
  };
});

export const StyledLimitInput = styled(Components.Base.NumericInput)({
  input: {
    fontSize: 30,
    height: 44,
    fontWeight: 500,
    "@media (max-width: 600px)": {
      fontSize: 24,
    },
  },
});

export const StyledSelectButton = styled("button")<{ selected: number }>(({ selected, theme }) => {
  const styles = getStyles(theme);
  const selectedBg = styles.isDarkMode ? "rgba(255,255,255, 0.15) " : "rgb(59 130 246/1)";
  const selectedColor = styles.isDarkMode ? "" : "white";
  return {
    background: selected ? selectedBg : "#0000000a",
    color: selected ? selectedColor : "",
    fontWeight: 500,
    padding: "5px 7px",
    borderRadius: 8,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 50,
    transition: "0.2s all",
    border: selected ? "1px solid transparent" : `1px solid ${styles.isDarkMode ? styles.accent : "transparent"}`,
    height: 28,
    svg: {
      fill: selectedColor,
    },
    "&:hover": {
      background: selectedBg,
      border: "1px solid transparent",
      color: selectedColor,
    },
  };
});

export const StyledResetLimitButtonContainer = styled(Styles.StyledRowFlex)({
  gap: 2,
  width: "auto",
});

export const StyledResetLimitButtonLeft = styled(StyledSelectButton)({
  borderTopRightRadius: 0,
  borderBottomRightRadius: 0,
});

export const StyledResetLimitButtonRight = styled(StyledSelectButton)({
  borderTopLeftRadius: 0,
  borderBottomLeftRadius: 0,
  padding: "0px 5px",
  minWidth: "unset",
  svg: {
    height: 16,
    width: 16,
  },
});

export const StyledLimitPanel = styled(Components.LimitPanel)({
  ".twap-limit-panel-title": {
    fontWeight: 500,
    fontSize: 15,
    gap: 2,
    ".twap-token-display": {
      padding: "3px 5px",
    },
  },

  ".twap-limit-panel-token-select": {
    fontWeight: 500,
    fontSize: 15,
  },
  ".twap-limit-panel-invert-button": {
    svg: {
      width: 20,
      height: 20,
    },
  },
});

export const StyledTradeInterval = styled(Components.TradeInterval)(({ theme }) => {
  const styles = getStyles(theme);
  return {
    ".twap-warning-message": {
      "*": {
        color: styles.warningText,
      },
    },
  };
});

export const StyledTradeDuration = styled(Components.TradeDuration)(({ theme }) => {
  const styles = getStyles(theme);
  return {
    ".twap-warning-message": {
      "*": {
        color: styles.warningText,
      },
    },
  };
});

export const StyledTradeIntervalInput = styled(CardBody)({
  input: {
    fontSize: 18,
  },
});

export const StyledTradeDurationRight = styled(CardBody)({
  display: "flex",
  flexDirection: "row",
  ".twap-duration-reset": {
    fontSize: 12,
    width: "auto",
    height: "auto",
    minHeight: "unset",
    padding: "2px 7px",
    fontWeight: 400,
  },
  ".twap-input": {
    flex: 1,
    width: "auto",
  },
  input: {
    fontSize: 18,
  },
});
export const StyledTradeIntervalResolution = styled(CardBody)({
  alignItems: "flex-end",
  display: "flex",
});

export const StyledChunksSelect = styled(Components.ChunkSelector)(({ theme }) => {
  const styles = getStyles(theme);
  return {
    ".twap-warning-message": {
      "*": {
        color: styles.warningText,
      },
    },
  };
});

export const StyledChunksSelectSlider = styled(CardBody)(({ theme }) => {
  const styles = getStyles(theme);
  return {
    flex: 1,
    width: "auto",
    padding: "5px 20px 5px 20px",
    ".MuiSlider-thumb": {
      backgroundColor: "#D8D8DB",
    },
    ".MuiSlider-track": {
      background: "rgb(59 130 246/1)",
      border: "none!important",
    },
    ".MuiSlider-rail": {
      backgroundColor: styles.accent,
    },
    ".MuiSlider-valueLabel": {
      ...tooltipStyles(theme),
    },
  };
});

export const StyledTop = styled(Styles.StyledColumnFlex)({
  gap: 4,
  "@media(max-width: 1000px)": {
    gap: 16,
  },
});

export const StyledChunksSelectInput = styled(CardBody)({
  width: "25%",
  minWidth: 100,
  input: {
    fontSize: 18,
    textAlign: "left!important",
    height: "100%",
  },
});

export const StyledContent = styled(StyledColumnFlex)({
  gap: 16,
  width: "100%",
});

export const StyledBalanceWarning = styled(Styles.StyledText)(({ theme }) => {
  const styles = getStyles(theme);
  return {
    color: styles.warningText,
    fontWeight: 500,
    fontSize: 17,
  };
});

export const StyledSwapModalContent = styled(StyledColumnFlex)({});

export const StyledCreateOrderModal = styled(Components.CreateOrderModal)(({ theme }) => {
  const styles = getStyles(theme);
  const summaryModalStyles = {
    ...cardBodyStyles(theme),
    background: styles.isDarkMode ? "#ffffff0a" : "white",
  };

  return {
    ".twap-order-modal-disclaimer": {
      ...summaryModalStyles,
    },
    ".twap-label-text": {
      color: styles.textColor,
      fontWeight: 500,
    },
    ".twap-create-order-confirm": {},
  };
});

export const StyledOpenOrdersButton = styled(StyledCardBody)({
  cursor: "pointer",
  marginTop: 20,
});

export const StyledOrders = styled(Components.OrderHistory)(({ theme }) => {
  const styles = getStyles(theme);
  return {
    ".twap-show-orders-btn": {
      width: "100%",
      ...cardBodyStyles(theme),
      transition: "0.2s all",
      cursor: "pointer",
      fontSize: 15,
      fontWeight: 500,
      "&:hover": {
        background: styles.boxHover,
      },
    },
  };
});

export const StyledOrdersContent = styled(Components.OrderHistory.Content)({
  ".twap-orders-list": {
    top: 0,
    height: "100%",
  },
  ".twap-order-display-details": {
    padding: 0,
  },
  ".MuiAccordionSummary-content": {
    padding: 12,
  },
  ".MuiAccordionDetails-root": {
    padding: "0px 12px 12px 12px!important",
  },
  ".twap-order-display-details-row": {},
});

export const StyledTwap = styled("div")({
  width: "100%",
});

export const StyledLimitPriceTitle = styled(Styles.StyledRowFlex)(({ theme }) => {
  const styles = getStyles(theme);
  return {
    fontSize: 14,
    gap: 3,
    justifyContent: "flex-start",
    span: {
      opacity: 0.8,
    },
    ".twap-token-display": {
      cursor: "pointer",
      transition: "0.2s all",
      borderRadius: 10,
      padding: "3px 5px",
      "&:hover": {
        background: styles.boxHover,
      },
    },
    ".twap-token-logo": {
      width: 20,
      height: 20,
    },
  };
});
