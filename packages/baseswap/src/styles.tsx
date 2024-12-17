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
    textError: isDarkMode ? "#ff4d4f" : "#ff4d4f",
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

export const StyledTokenPanelBalance = styled("div")<{ isSrc: number }>(({ theme, isSrc }) => {
  const styles = getStyles(theme);
  return {
    display: "flex",
    gap: "4px",
    alignItems: "center",
    cursor: isSrc ? "pointer" : "default",
    marginTop: 5,
    p: {
      fontSize: 12,
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

export const StyledTokenPanelRight = styled(Styles.StyledColumnFlex)({
  alignItems: "flex-end",
  flex: 1,
  marginTop: 8,
  gap: 0,
});

export const StyledInputPanelLeft = styled(Styles.StyledColumnFlex)({
  gap: 0,
});

export const StyledTokenPanelInput = styled(Components.TokenPanelInput)(({ theme }) => {
  const styles = getStyles(theme);
  return {
    width: "100%",
    maxHeight: 48,
    ".twap-loader": {
      left: "auto",
      right: 0,
    },
    input: {
      textAlign: "left",
      fontSize: 32,
      color: styles.textColorPrimary,
      height: "100%",
    },
  };
});

export const TokenPanelUsd = styled(Components.TokenUSD)(({ theme }) => {
  const styles = getStyles(theme);
  return {
    color: styles.darkText,
    fontSize: 13,
  };
});

const buttonStyles = (theme: DefaultTheme) => {
  const styles = getStyles(theme);
  return {
    background: styles.buttonBg,
    border:'1px solid transparent',
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0.1rem 0.1rem 0.1rem 0px rgba(255, 255, 255, 0.5) inset,-0.1rem -0.1rem 0.1rem 0px rgba(0, 0, 0, 0.15) inset,0.1rem 0.1rem 0.1rem 0px rgba(0, 0, 0, 0.07)",
    "*": {
      color: "white",
    },
  };
};

export const StyledChangeTokensOrder = styled(Components.ChangeTokensOrder)(({ theme }) => {
  return {
    height: 0,
    zIndex: 1,
    button: {
      cursor: "pointer",
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

export const CardHeader = ({ className = "", children }: { className?: string; children: ReactNode }) => {
  return <StyledCardHeader className={className}>{children}</StyledCardHeader>;
};

export const StyledCardHeader = styled("div")(({ theme }) => {
  return {
    marginBottom: 10
  }
});

Card.Header = CardHeader;

export const StyledTokenPanel = styled(Card)({
  display: "flex",
  flexDirection: "row",
  gap: 5,
  paddingRight: 6,
  paddingLeft: 16,
});

export const GlobalStyles = createGlobalStyle(({ theme }) => {
  const styles = getStyles(theme);

  return {
    ".twap-token-input-loading": {
      input: {
        opacity: 0,
      }
    },
    ".twap-input": {
      input: {
        color: styles.textColorPrimary,
      },
      
      ".twap-loader": {
        left: '0px!important',
        right: 'auto!important',
        background: 'rgba(255,255,255,0.2)',
      }
    },
    ".twap-token-not-selected": {
      p: {
        fontSize: 16,
      },
    },
    ".twap-select": {
      "& > div": {
        height: "100%",
      }
    },
    '.twap-select-menu': {
      height: '100%',
    },
   
    ".twap-select-menu-list": {
      borderRadius:12,
      border:'1px solid rgba(255,255,255, 0.4)',
      background:'linear-gradient(135deg, #000, #001235 70%, #001a4d 100%),radial-gradient(circle at bottom left, rgba(0, 255, 255, 0.05) 0%, transparent 60%)',
    },
    ".twap-select-menu-list-item": {
      padding: '5px 10px 5px 10px',
      p: {
        fontSize: 12,
        textTransform:'capitalize'
      },
      "&:hover": {
        background: "rgba(255,255,255,0.1)",
      }
    },
    ".twap-label": {
      "&-text": {
        fontSize: 14
      }
    },

    '.twap-select-menu-button': {
      ...bgContainerStyles(theme),
      padding: "5px 10px",
      height:'100%',

      p: {
        margin: 0,
        fontSize: 12,
        textTransform:'capitalize'
      },
      svg: {
        color: styles.textColorDark,
        width:12,
        height:12
      }
    }
  };
});

const bgContainerStyles = (theme: DefaultTheme) => {
  return {
    display: "flex",
    alignItems: "center",
    gap: "2px",
    cursor: "pointer",
    background: "radial-gradient(circle, rgba(11, 61, 145, 0.5) 10%, #000)",
    borderRadius: 12,
    padding: "5px 15px",
    justifyContent: "center",
    border:'none',
    boxShadow: "0px 0px 0px 1px #00000005,1px 1px 1px -0.5px #0000000F,3px 3px 3px -1.5px #0000000F,6px 6px 6px -3px #0000001A,-0.5px -0.5px 0px 0px #FFFFFF33",
  };
};

export const StyledTokenSelect = styled("div")(({ theme }) => {
  return {
    ...bgContainerStyles(theme),
    minWidth: 170,
    minHeight: 45,
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
  };
});

export const StyledTradeSize = styled(Card)({
  flex: 1,
});
export const StyledTraeInterval = styled(Card)({
  flex: 1,
});

const smallInputStyles = (theme: DefaultTheme) => {
  return {
    flex: 1,
    border: "1px solid rgba(255, 255, 255, 0.15)",
    height: 32,
    borderRadius: 12,
    textIndent: 10,
    transition: "0.2s all",
    fontSize:14,
    "&:hover": {
      border: `1px solid rgba(255, 255, 255, 0.24)`,
    },
    "&:focus": {
      border: `1px solid rgb(204, 204, 204)`,
    },
  };
};

export const StyledTraeIntervalContent = styled(Styles.StyledRowFlex)({
  alignItems:'stretch'
});
export const StyledTraeIntervalInput = styled(Components.TradeInterval.Input)(({ theme }) => {
  return {
    input: {
      ...smallInputStyles(theme),
    },
  };
});
export const StyledTradeIntervalresolution = styled(Components.TradeInterval.Resolution)(({theme}) => {
  const styles = getStyles(theme);
 return {
 
 }
});

export const StyledTradeSizeContent = styled(Styles.StyledRowFlex)({});
export const StyledTradeSizeText = styled(Styles.StyledText)(({ theme }) => {
  const styles = getStyles(theme);
  return {
    fontSize: 13,
    color: styles.darkText,
  };
});

export const StyledChunkSizeMessage = styled(Components.ChunkSizeMessage)(({ theme }) => {
  const styles = getStyles(theme);
  return {
    color: styles.darkText,
    paddingLeft: 20,
    fontSize: 14,
    span: {
      opacity: 0.7,
    }
  }
})

export const StyledTradeWarning = styled(Components.TradeWarning)(({ theme }) => {
  const styles = getStyles(theme);
  return {
    paddingLeft: 20,
    ".twap-warning-message": {
      gap: 5
    },
    color: styles.textError,
    ".twap-warning-message-title": {
      fontSize: 14,
    },
    '.twap-warning-message-icon':{
      width: 16,
      height: 16,
      position:'relative',
      top: 2
    }
  };
})


export const StyledSubmitButton = styled(Components.ShowConfirmation)(({ theme }) => {
  return {
    ".twap-button": {
      ...buttonStyles(theme),
      borderRadius:14,
      height: 48,
      "&-children": {
        fontSize: 16,
        fontWeight: 400,
      },
      "&-disabled": {
        cursor: "not-allowed",
        background: "black",
        boxShadow: "none",
        opacity: 0.4,
        border:'1px solid #535353',
        "&:hover": {
          border:'1px solid rgba(255, 255, 255, 0.5)',
        }
      }
    },

  }
})

export const StyledTradeSizeInput = styled(Components.ChunkSelector.Input)(({ theme }) => {
  return {
    input: {
      ...smallInputStyles(theme),
    },
  };
});
