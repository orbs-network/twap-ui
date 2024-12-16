import { Components, Styles } from "@orbs-network/twap-ui";
import { ReactNode } from "react";
import { createGlobalStyle, DefaultTheme, styled } from "styled-components";
export const lightTheme = {
  palette: {
    mode: "light",
  },
};

export const darkTheme = {
  palette: {
    mode: "dark",
  },
};

const isDark = (theme: DefaultTheme) => theme.palette.mode === "dark";

const getStyles = (theme?: DefaultTheme) => {
  const isDarkMode = theme?.palette.mode === "dark" ? 1 : 0;

  return {
    isDarkMode,
    accent: isDarkMode ? "#ffffff14" : "#00000014",
    darkText: isDarkMode ? "rgb(148 163 184/1)" : "rgb(107 114 128/1)",
    darkTextHover: isDarkMode ? "rgb(203 213 225/1)" : "rgb(37 99 235/1)",
    warningText: "rgb(239 68 68/1)",
    textColorPrimary: isDarkMode ? "rgb(248 250 252/1)" : "rgb(17 24 39/1)",
    textColorDark: isDarkMode ? "#8D8D8D" : "rgb(255 255 255/1)",
    messageText: isDarkMode ? "#94a3b8" : "#6b7280",
    boxHover: isDarkMode ? "rgba(255,255,255, 0.09)" : "rgba(0,0,0, 0.03)",
    buttonBg: isDarkMode ? "linear-gradient(to bottom, #0154fe, #37C0DF)" : "",
  };
};

const baseStyles = (theme: DefaultTheme) => {
  const darkMode = isDark(theme);
  return {
    mainBackground: "#111111",
    button: "rgb(1, 84, 254)",
    buttonColor: darkMode ? "rgb(18, 17, 34)" : "rgb(49, 65, 94)",
    secondaryBackground: "#333333",
    iconsColor: "white",
    textColor: darkMode ? "white" : "rgb(77, 103, 147)",
    tooltipBackground: darkMode ? "white" : "#D8DEEA",
    tooltipTextColor: darkMode ? "rgb(40, 13, 95)" : "rgb(77, 103, 147)",
    spinnerColor: darkMode ? "white" : "rgb(77, 103, 147)",
    cardBackground: darkMode ? "linear-gradient(to top, rgb(0, 0, 0), rgb(34, 34, 34))" : "rgb(228, 233, 241)",
    progressBarColor: darkMode ? "rgb(140, 140, 227)" : "rgb(102, 101, 221)",
    progressBarTrackColor: darkMode ? "#373E55" : "#D8DEEA",
    selectTokenBackground: darkMode ? "rgba(255, 255, 255, 0.05)" : "rgb(242, 244, 248)",
    selectedTokenBackground: darkMode ? "rgba(255, 255, 255, 0.87)" : "rgb(242, 244, 248)",
    skeletonLoaderBackground: darkMode ? "rgba(255, 255, 255, 0.2)" : "rgb(0, 0, 0, 0.1)",
  };
};

export const StyledMaxButton = styled("button")(({ theme }) => {
  return {
    color: "rgb(55, 192, 223)",
    background: "transparent",
    border: "none",
    fontSize: 14,
    cursor: "pointer",
    fontWeight: 600,
    padding: 0,
    "&:hover": {
      color: "white",
      textDecoration: "underline",
    },
  };
});

export const StyledBalance = styled("div")<{ isSrc: number }>(({ theme, isSrc }) => {
  const styles = getStyles(theme);
  return {
    display: "flex",
    gap: "4px",
    alignItems: "center",
    cursor: isSrc ? "pointer" : "default",
    p: {
      fontSize: 14,
      color: styles.textColorDark,
      transition: "0.2s all",
    },
    svg: {
      color: styles.textColorDark,
      width: 16,
    },
    "&:hover": {
      p: {
        color: isSrc ? styles.textColorPrimary : styles.textColorDark,
      },
    },
  };
});

export const StyledTopGrid = styled(Styles.StyledColumnFlex)({
  gap: 3,
});

export const StyledTokenPanelBalanceAndMax = styled(Styles.StyledRowFlex)({
  width: "auto",
  alignItems: "center",
  flex: 1,
});
export const StyledTokenPanelRight = styled(Styles.StyledColumnFlex)({
  alignItems: "flex-end",
  flex: 1,
});

export const StyledInputPanelLeft = styled(Styles.StyledColumnFlex)({});

export const StyledTokenPanelInput = styled(Components.TokenPanelInput)(({ theme }) => {
  const styles = getStyles(theme);
  return {
    width: "100%",
    ".twap-loader": {
      left: "auto",
      right: 0,
    },
    input: {
      textAlign: "left",
      fontSize: 28,
      color: styles.textColorPrimary,
    },
  };
});

const buttonStyles = (theme: DefaultTheme) => {
  const styles = getStyles(theme);
  return {
    background: styles.buttonBg,
    boxShadow: "0.1rem 0.1rem 0.1rem 0px rgba(255, 255, 255, 0.5) inset,-0.1rem -0.1rem 0.1rem 0px rgba(0, 0, 0, 0.15) inset,0.1rem 0.1rem 0.1rem 0px rgba(0, 0, 0, 0.07)",
    "*": {
      color: "white",
    },
  };
};

export const StyledChangeTokensOrder = styled(Components.ChangeTokensOrder)(({ theme }) => {
  return {
    height: 0,
    cursor: "pointer",
    zIndex: 1,
    button: {
      transition: "0s all",
      ...buttonStyles(theme),
      border: `none`,
      borderRadius: "50%",
      width: 40,
      height: 40,
      svg: {
        width: 20,
        height: 20,
      },
    },
  };
});

export const StyledTradeSize = styled(Components.Base.Card)({});

export const StyledPriceCard = styled(Components.Base.Card)({});

export const StyledReset = styled("div")(({ theme }) => {
  const styles = baseStyles(theme);
  return {
    border: "1px solid #fff",
    padding: "0px 10px",
    borderRadius: 12,
    cursor: "pointer",
    color: styles.textColor,
    p: {
      fontSize: 13,
    },
    svg: {
      width: 12,
      height: 12,
      path: {
        stroke: styles.iconsColor,
      },
    },
    "&:hover": {
      opacity: 0.8,
    },
  };
});

export const StyledSubmitContainer = styled("div")({
  width: "100%",
  button: {
    width: "100%",
    boxShadow: "none!important",
    border: "unset!important",
  },
});

const StyledCard = styled("div")(({ theme }) => {
  const styles = baseStyles(theme);
  return {
    width: "100%",
    background: "linear-gradient(135deg, #001a4d 70%, #001a4d 85%, #000e24 100%),radial-gradient(circle at center, rgba(0, 255, 255, 0.07) 0%, transparent 40%)",
    borderRadius: 12,
    padding: 16,
    boxShadow:
      "20px 20px 50px 0px rgba(0, 0, 0, 0.25) inset,10px 10px 25px 0px rgba(0, 0, 0, 0.18) inset,2px 2px 11px 0px rgba(0, 0, 0, 0.19) inset,0px 0px 1px 0px #FFFFFF40 inset",
    color: styles.textColor,
  };
});

export const Card = ({ className = "", children }: { className?: string; children: ReactNode }) => {
  return <StyledCard className={className}>{children}</StyledCard>;
};

export const StyledTokenPanel = styled(Card)({
  display: "flex",
  flexDirection: "row",
  gap: 5,
});

export const GlobalStyles = createGlobalStyle(({ theme }) => {});

export const StyledTokenSelect = styled("div")({
  display: "flex",
  alignItems: "center",
  gap: "2px",
  cursor: "pointer",
  background: "radial-gradient(circle, rgba(11, 61, 145, 0.5) 10%, #000)",
  borderRadius: 12,
  minWidth: 170,
  minHeight: 45,
  padding: "5px 15px",
  justifyContent: "center",
  boxShadow: "0px 0px 0px 1px #00000005,1px 1px 1px -0.5px #0000000F,3px 3px 3px -1.5px #0000000F,6px 6px 6px -3px #0000001A,-0.5px -0.5px 0px 0px #FFFFFF33",
  p: {
    fontSize: 20,
    fontWeight: 500,
  },
  ".twap-token-display": {
    gap: 0,
  },
  ".twap-token-logo": {
    width: 32,
    height: 32,
  },
  ".twap-icon": {
    width: 14,
    height: 14,
    color: "rgba(255, 255, 255, 0.4)",
  },
});
