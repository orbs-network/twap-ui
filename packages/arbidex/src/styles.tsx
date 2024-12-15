import { Components, Styles } from "@orbs-network/twap-ui";
import { ReactNode } from "react";
import { createGlobalStyle, DefaultTheme, styled } from "styled-components";

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
    textMain: isDarkMode ? "white" : "rgb(107 114 128/1)",
    darkTextHover: isDarkMode ? "rgb(203 213 225/1)" : "rgb(37 99 235/1)",
    warningText: "rgb(239 68 68/1)",
    textColor: isDarkMode ? "rgb(248 250 252/1)" : "rgb(17 24 39/1)",
    messageText: isDarkMode ? "#94a3b8" : "#6b7280",
    boxHover: isDarkMode ? "rgba(255,255,255, 0.09)" : "rgba(0,0,0, 0.03)",
    loader: isDarkMode ? "rgba(255,255,255, 0.1)" : "rgb(107 114 128/1)",
  };
};

const baseStyles = (theme: DefaultTheme) => {
  const styles = getStyles(theme);
  const darkMode = styles.isDarkMode;
  return {
    mainBackground: "#08001E",
    button: "#08001E",
    buttonColor: darkMode ? "rgb(18, 17, 34)" : "rgb(49, 65, 94)",
    iconsColor: "white",
    textColor: darkMode ? "white" : "rgb(77, 103, 147)",
    tooltipBackground: darkMode ? "black" : "#D8DEEA",
    tooltipTextColor: darkMode ? "white" : "rgb(77, 103, 147)",
    spinnerColor: darkMode ? "white" : "rgb(77, 103, 147)",
    cardBackground: darkMode ? "rgba(5, 28, 44, 0.8)" : "rgb(228, 233, 241)",
    progressBarColor: darkMode ? "rgb(140, 140, 227)" : "rgb(102, 101, 221)",
    progressBarTrackColor: darkMode ? "#373E55" : "#D8DEEA",
    selectTokenBackground: darkMode ? "rgba(255, 255, 255, 0.05)" : "rgb(242, 244, 248)",
    selectedTokenBackground: darkMode ? "rgba(255, 255, 255, 0.87)" : "rgb(242, 244, 248)",
    skeletonLoaderBackground: darkMode ? "rgba(255, 255, 255, 0.2)" : "rgb(0, 0, 0, 0.1)",
  };
};

const buttonStyles = (theme: DefaultTheme) => {
  const styles = baseStyles(theme);
  return {
    transition: "0s all",
    position: "relative" as any,
    boxShadow: "rgba(14, 14, 44, 0.4) 0px -1px 0px 0px inset",
    color: styles.textColor,
    padding: "0px 5px",
    background: "transparent",
    border: "0.5px solid white!important",
    cursor: "pointer",
    textTransform: "uppercase" as any,
    letterSpacing: 3,
    fontWeight: 500,
    fontSize: 16,
    borderRadius: 8,
    ".twap-button-loader": {
      zIndex: 1,
      transform: "translate(-50%,-50%) scale(0.5)",
      zoom: "unset!important",
    },
    ".twap-button-children": {
      zIndex: 1,
      position: "relative" as any,
    },
    "&:active": {
      "&:after": {
        opacity: 0,
      },
    },
    "&:hover": {
      transform: "translateY(1px)",
    },
    "&:before": {
      content: "''",
      position: "absolute" as any,
      width: "calc(100% + 4px)",
      height: "calc(100% + 4px)",
      left: "50%",
      top: "50%",
      transform: "translate(-50%,-50%)",
      background: "linear-gradient(45deg,#f86c0d,red,#ec38bc,#7303c0,#f86c0d)",
      borderRadius: 8,
      transition: "opacity .3s ease-in-out",
      filter: "blur(7px)",
      backgroundSize: "400%",
      // zIndex: -1,
    },
    "&:after": {
      transition: "0.2s all",
      content: "''",
      position: "absolute" as any,
      width: "100%",
      height: "100%",
      background: styles.mainBackground,
      left: 0,
      top: 0,
      borderRadius: 8,
      // zIndex: -1,
    },
  };
};

export const StyledMaxButton = styled("div")(({ theme }) => ({
  ...(buttonStyles(theme) as any),
  color: baseStyles(theme).mainBackground,
}));

export const StyledTopGrid = styled(Styles.StyledColumnFlex)({
  gap: 24,
});
export const StyledTokenBalance = styled(Components.TokenBalance)({
  "*": {
    fontSize: 14,
    fontWeight: 400,
    textTransform: "uppercase",
  },
});
const StyledCard = styled("div")(() => {
  return {
    width: "100%",
    borderRadius: 12,
    padding: 12,
    boxShadow:
      "20px 20px 50px 0px rgba(0, 0, 0, 0.25) inset,10px 10px 25px 0px rgba(0, 0, 0, 0.18) inset,2px 2px 11px 0px rgba(0, 0, 0, 0.19) inset,0px 0px 1px 0px #FFFFFF40 inset",
  };
});
export const Card = ({ children, className = "" }: { children: ReactNode; className?: string }) => {
  return <StyledCard className={className}>{children}</StyledCard>;
};

export const StyledTokenPanel = styled(Card)({});

export const StyledTokenPanelInput = styled(Components.TokenPanelInput)(({ theme }) => {
  const styles = getStyles(theme);
  return {
    width: "100%",
    input: {
      textAlign: "left",
      fontSize: 28,
      color: styles.textMain,
    },
  };
});

// const getButtonStyles = (theme: Theme) => {};
export const StyledTokenInputContainer = styled(Styles.StyledColumnFlex)(({ theme }) => ({
  border: "3px solid white",
  padding: 16,
  background: baseStyles(theme).cardBackground,
}));

export const StyledTokenSelect = styled("div")({
  marginRight: 10,
  ".twap-token-logo": {
    width: 48,
    height: 48,
    boxShadow: "rgb(255, 255, 255) 1px 0px 4px",
  },
  ".twap-token-display": {
    gap: 14,
  },
  ".twap-token-name": {
    fontSize: 22.4,
    fontWeight: 600,
  },
  svg: {
    width: 15,
    height: 15,
  },
});

export const StyledChangeTokensOrder = styled(Components.ChangeTokensOrder)(({ theme }) => {
  const styles = baseStyles(theme);
  return {
    button: {
      ...buttonStyles(theme),
      boxShadow: "rgb(216, 250, 241) 0px 0px 4px",
      border: "unset",
      width: 40,
      height: 35,
      padding: 0,
      ".MuiTouchRipple-root": {
        display: "none",
      },
      ".twap-icon": {
        width: "100%",
        height: "100%",
        borderRadius: 8,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      },
      svg: {
        width: 15,
        height: 15,
        color: styles.textColor,
        position: "relative" as const,
        zIndex: 1,
      },
      "&:hover": {
        transform: "translateY(1px)",
        ".twap-icon": {
          boxShadow: "rgb(0, 0, 0) 0px 0px 12px inset, rgb(216, 250, 241) 0px 0px 12px",
        },
      },
    },
  };
});

export const StyledTradeSize = styled(Components.Base.Card)({});

export const StyledPriceCard = styled(Components.Base.Card)({});

export const StyledSubmitButton = styled("button")({
  marginTop: 20,
  marginLeft: "auto",
  marginRight: "auto",
});

export const StyledTokenPanelUsd = styled(Components.TokenUSD)({});

export const GlobalStyles = createGlobalStyle(({ theme }) => {
  const styles = getStyles(theme);

  return {
    ".twap-loader": {
      background: styles.loader,
    },
    ".twap-input-loading": {
      opacity: 0,
    },
  };
});
