import { Components, Styles } from "@orbs-network/twap-ui";
import { ReactNode } from "react";
import { DefaultTheme, styled, createGlobalStyle } from "styled-components";

export const darkTheme = {
  palette: {
    mode: "dark",
  },
};

export const lightTheme = {
  palette: {
    mode: "light",
  },
};

const getStyles = (theme?: DefaultTheme) => {
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
    padding: "0px!important",
    fontWeight: 500,
    "@media (max-width: 600px)": {
      fontSize: 24,
    },
  },
});

export const StyledSmallText = styled("span")(({ theme }) => {
  const styles = getStyles(theme);
  return {
    color: `${styles.darkText}`,
    fontWeight: "500!important",
    fontSize: 17,
    small: {
      fontSize: 14,
      color: styles.darkText,
      fontWeight: "500!important",
    },
  };
});

export const StyledOrdersHeader = styled(Components.OrderHistory.Header)(({ theme }) => {
  const styles = getStyles(theme);
  return {
    "*": {
      color: styles.textColor,
    },
    ".twap-order-modal-header-title": {
      fontWeight: 500,
    },
    ".twap-order-modal-header-back": {
      borderRadius: "50%",
      width: 30,
      height: 30,
      transition: "0.2s all",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      svg: {
        width: 15,
        height: 15,
      },
      "&:hover": {
        background: styles.boxHover,
      },
    },
  };
});

export const GlobalStyles = createGlobalStyle(({ theme }) => {
  const styles = getStyles(theme);
  const isDarkMode = styles.isDarkMode;
  return {
    ".twap-error-message": {
      color: styles.messageText,
      ...cardBodyStyles(theme),
    },
    ".twap-input-loading": {
      opacity: 0,
    },
    ".twap-adapter-wrapper": {
      ".MuiTouchRipple-root": {
        display: "none",
      },
      "*": {
        fontFamily: "inherit",
      },
    },
    ".twap-spinner": {
      borderTop: `3px solid ${styles.textColor}!important`,
      border: !isDarkMode ? "3px solid rgba(0, 0, 0, 0.1)" : `3px solid rgba(255, 255, 255, 0.1)`,
    },
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
        "*": {
          color: styles.messageText,
        },
      },
      ".twap-order-display-details": {
        ...cardBodyStyles(theme),
        background: styles.isDarkMode ? "#ffffff0a" : "white",
        gap: 8,
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
    ".twap-select-menu-list": {
      ...cardBodyStyles(theme),
      padding: 0,
      "&-item": {
        color: styles.textColor,
        fontSize: 14,
        "&:hover": {
          background: styles.isDarkMode ? "#ffffff0f" : "#0000000a",
        },
      },
    },
    ".twap-select-menu-button": {
      ...selectTokenStyles(theme),
      border: "unset",
      borderRadius: 12,
      padding: "8px 13px",

      background: styles.isDarkMode ? "#ffffff0a" : "white",
      color: styles.textColor,
      p: {
        fontSize: 14,
        fontWeight: 500,
        color: "inherit",
        margin: 0,
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

    ".twap-button-disabled": {
      opacity: 0.7,
      pointer: "disabled",
    },
    ".twap-label": {
      p: {
        fontSize: 15,
        fontWeight: 600,
        letterSpacing: "-.025em",
      },
      "*": {
        color: styles.textColor,
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
        color: styles.textColor,
        "&::placeholder": {
          color: isDarkMode ? "white!important" : "rgb(17 24 39/1)!important",
          opacity: 0.4,
        },
      },
    },
    ".twap-submit-button": {
      ...buttonStyles,
      ".twap-spinner": {
        borderTop: `3px solid white!important`,
        border: "3px solid rgba(255, 255, 255, 0.1)",
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

    ".twap-switch-handle": {
      background: isDarkMode ? "rgb(15 23 42/1)" : "rgb(249 250 251/1)",
    },
    ".twap-switch": {
      background: isDarkMode ? "hsla(0,0%,100%,.1)" : "rgba(0,0,0,.1)",
    },
    ".twap-switch-checked": {
      background: "rgb(59 130 246/1)",
      ".twap-switch-handle": {
        background: "white",
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
    color: color,
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
      width: 20,
      height: 20,
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

export const StyledSubmit = styled("button")({});

export const StyledPoweredBy = styled(Components.PoweredBy)(({ theme }) => {
  const styles = getStyles(theme);
  return {
    marginTop: 20,
    color: styles.textColor,
    "*": {
      color: "inherit",
    },
  };
});

const selectTokenStyles = (theme: DefaultTheme) => {
  const styles = getStyles(theme);

  return {
    transition: "0.1s all",
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
    "&:hover": {
      background: styles.isDarkMode ? "#ffffff0f" : "#0000000a",
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

const cardBodyStyles = (theme?: DefaultTheme) => {
  const styles = getStyles(theme);
  return {
    background: styles.isDarkMode ? "rgb(30 41 59/1)" : "white",
    borderRadius: 12,
    padding: 12,
    border: `1px solid ${styles.accent}`,
  };
};

const tooltipStyles = (theme?: DefaultTheme) => {
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

export const StyledLimitSwitch = styled(Components.LimitPanel.Switch)(({ theme }) => {
  const styles = getStyles(theme);
  const isDarkMode = styles.isDarkMode;
  return {
    background: isDarkMode ? "#ffffff0a" : "white",
    border: `1px solid ${styles.accent}`,
    borderRadius: 10,
    overflow: "hidden",
    padding: 2,

    gap: 5,
    button: {
      transition: "0.2s all",
      background: "transparent",
      border: "unset",
      width: 80,
      height: 30,
      cursor: "pointer",
      borderRadius: 8,
      color: styles.textColor,
      "&:hover": {
        background: styles.accent,
      },
    },
    ".twap-limit-switch-selected": {
      background: styles.accent,
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

export const StyledCardBody = styled("div")(({ theme }) => {
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

export const StyledSelectButton = styled("button")<{ selected?: number }>(({ selected, theme }) => {
  const styles = getStyles(theme);
  const selectedBg = styles.isDarkMode ? "rgba(255,255,255, 0.15) " : "rgb(59 130 246/1)";
  const selectedColor = styles.isDarkMode ? styles.textColor : "white";
  return {
    background: selected ? selectedBg : "#0000000a",
    color: selected ? selectedColor : styles.textColor,
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

export const StyledLimitPanel = styled(Components.LimitPanel)(({ theme }) => {
  const styles = getStyles(theme);
  return {
    ".twap-input": {
      input: {
        padding: 0,
      },
    },
    ".twap-market-price-warning": {
      color: styles.messageText,
    },
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
      borderRadius: "50%",
      padding: 8,
      transition: "0.2s all",
      svg: {
        width: 16,
        height: 16,
        color: styles.textColor,
      },
      "&:hover": {
        background: styles.boxHover,
      },
    },
  };
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
  paddingTop: 0,
  paddingBottom: 0,
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
      borderRadius: 12,
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

export const StyledChunksSelectInput = styled(CardBody)(() => {
  return {
    width: "100%",
    minWidth: 100,
    input: {
      fontSize: 18,
      textAlign: "left!important" as any,
      height: "100%",
    },
  };
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

export const StyledCreateOrderModal = styled(Components.CreateOrderModal)(({ theme }) => {
  const styles = getStyles(theme);
  const summaryModalStyles = {
    ...cardBodyStyles(theme),
    background: styles.isDarkMode ? "#ffffff0a" : "white",
  };

  return {
    paddingTop: 12,
    "*": {
      color: styles.textColor,
    },
    ".twap-custom-button": {
      marginTop: 20,
    },
    ".twap-order-modal-disclaimer": {
      ...summaryModalStyles,
      a: {
        textDecoration: "underline",
        color: styles.textColor,
      },
    },
    ".twap-step-title": {
      color: styles.textColor,
      opacity: 0.7,
    },
    ".twap-step-title-selected": {
      color: styles.textColor,
      opacity: 1,
    },
    ".twap-label-text": {
      color: styles.textColor,
      fontWeight: 500,
    },
    ".twap-create-order-confirm": {},
  };
});

export const StyledOrdersButton = styled(Components.OrderHistory.Button)(({ theme }) => {
  const styles = getStyles(theme);
  return {
    width: "100%",
    ...cardBodyStyles(theme),
    transition: "0.2s all",
    cursor: "pointer",
    fontSize: 15,
    fontWeight: 500,
    color: styles.textColor,
    "&:hover": {
      background: styles.boxHover,
    },
  };
});

export const StyledOrdersContent = styled(Components.OrderHistory.Content)(({ theme }) => {
  const styles = getStyles(theme);
  return {
    ".twap-linear-progress": {
      background: styles.accent,
      "&-filled": {
        background: "rgb(59 130 246/1)",
      },
    },

    "*": {
      color: styles.textColor,
    },
    ".twap-orders-list": {
      top: 0,
      height: "100%",
    },
    ".twap-orders-selected-order-summary": {
      padding: 12,
      p: {
        fontSize: 15,
        fontWeight: 500,
      },
    },
    ".twap-orders-selected-order-details": {
      padding: "0px 12px 0px 12px",
      gap: 4,
      "&-margin": {
        marginBottom: 12,
      },
      ".twap-label": {
        fontSize: 14,
        opacity: 0.8,
      },
    },
    ".twap-order-display-details": {
      padding: "0px!important",
    },
    ".MuiLinearProgress-root": {
      borderRadius: 12,
    },
    ".twap-order-token-progress": {
      ".MuiLinearProgress-bar": {
        background: "rgb(59 130 246/1)",
      },
    },
    ".MuiAccordionSummary-content": {
      padding: 12,
    },
    ".MuiAccordionDetails-root": {
      padding: "0px 12px 12px 12px!important",
    },
    ".twap-order-display-details-row": {},
  };
});

export const StyledTwap = styled("div")({
  width: "100%",
});

export const StyledLimitPriceTitle = styled(Styles.StyledRowFlex)(({ theme }) => {
  const styles = getStyles(theme);
  return {
    color: styles.textColor,
    fontSize: 14,
    gap: 0,
    justifyContent: "flex-start",
    span: {
      opacity: 0.8,
    },
    ".twap-token-display": {
      cursor: "pointer",
      transition: "0.2s all",
      borderRadius: 10,
      padding: "1px 2px",
      margin: "0px 2px",
      gap: 5,
      "&:hover": {
        background: styles.boxHover,
      },
    },
    ".twap-token-logo": {
      width: 19,
      height: 19,
    },
  };
});

export const StyledNetworkSelect = styled("div")({
  width: "100%",
});
