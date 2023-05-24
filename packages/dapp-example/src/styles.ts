import { Box, styled } from "@mui/system";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import IconButton from "@mui/material/IconButton";
import { Styles as TwapStyles } from "@orbs-network/twap-ui";
import { DappLayout } from "./Components";
export const globalStyle = {
  "& *": {
    color: "white",
  },
  ".twap-container": {
    zoom: "1!important",
  },
  ".twap-orders-wrapper": {
    zoom: "1!important",
  },
  ".twap-ui-chronos-modal": {
    fontFamily: "Space Grotesk",
  },
};

export const StyledSpiritSwapBox = styled(Box)(({ isDarkMode }: { isDarkMode: number }) => ({
  background: isDarkMode ? "rgb(16, 23, 38)" : "#FBFBFB",
  border: `1px solid rgb(55, 65, 81)`,
  borderRadius: 10,
  padding: "0.5rem",
  fontFamily: "Jost",
}));

export const StyledDapp = styled(Box)({
  width: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  minHeight: "100vh",
  paddingBottom: 100,
});

export const StyledDappLayoutContent = styled(Box)({
  gap: 20,
  display: "flex",
  flexDirection: "column",
  paddingTop: 30,
});

export const StyledQuickswapBox = styled(Box)(({ isDarkMode }: { isDarkMode: number }) => ({
  background: isDarkMode ? "#1b1e29" : "#FBFBFB",
  padding: 20,
  borderRadius: 10,
}));

export const StyledThenaGradient = styled(Box)({
  background: "transparent linear-gradient(128deg,#ed00c9,#bd00ed) 0 0 no-repeat padding-box",
  padding: 1,
  borderRadius: 10,
});

export const StyledThenaBox = styled(Box)<{ isDarkMode: number }>(({ isDarkMode }) => ({
  background: isDarkMode ? "transparent linear-gradient(90deg,#1d023b,#17023e) 0 0 no-repeat padding-box" : "white",
  padding: 20,
  borderRadius: 10,
}));

export const StyledStellaSwapBox = styled(Box)<{ isDarkMode: number }>(({ isDarkMode }) => ({
  background: isDarkMode ? "#0E1126" : "white",
  padding: 20,
  borderRadius: 10,
}));

export const StyledThena = styled(StyledDapp)<{ isDarkMode: number }>(({ isDarkMode }) => ({
  background: isDarkMode ? "#090333" : "#F4F5F6",
  fontFamily: "Figtree",
  ".ui-selector-btn": {
    background: isDarkMode ? "rgba(255,255,255, 0.1)" : "white",
    color: isDarkMode ? "white" : "black",
  },
  ".ui-selector-btn-selected": {
    background: "linear-gradient(to right, rgb(216, 0, 183), rgb(177, 0, 222), rgb(177, 0, 222), rgb(216, 0, 183))",
    color: "white",
  },
}));

export const StyledStella = styled(StyledDapp)<{ isDarkMode: number }>(({ isDarkMode }) => ({
  background: isDarkMode ? "#251842" : "#F4F5F6",
  fontFamily: "Figtree",
  ".ui-selector-btn": {
    background: isDarkMode ? "#0E1126" : "white",
    color: isDarkMode ? "white" : "black",
  },
  ".ui-selector-btn-selected": {
    background: "#e2107b",
    color: "white",
  },
}));

export const StyledSushi = styled(StyledDapp)<{ isDarkMode: number }>(({ isDarkMode }) => ({
  background: isDarkMode ? "#0F172A" : "#F4F5F6",
  fontFamily: "Inter",
  ".menu-button": {
    "*": {
      color: isDarkMode ? "white" : "black",
    },
  },
  ".ui-selector-btn": {
    background: isDarkMode ? "hsla(0,0%,100%,.06)" : "white",
    color: isDarkMode ? "white" : "black",
  },
  ".ui-selector-btn-selected": {
    background: "rgb(59 130 246/1)",
    color: "white",
  },
}));

export const StyledQuickswap = styled(StyledDapp)<{ isDarkMode: number }>(({ isDarkMode }) => ({
  background: isDarkMode ? "#12131a" : "#F8F7F7",
  ".ui-selector-btn-selected": {
    borderBottom: "2px solid white",
  },
}));

export const StyledSpiritSwap = styled(StyledDapp)<{ isDarkMode: number }>(({ isDarkMode }) => ({
  background: isDarkMode ? "#000315" : "#FBFBFB",
  ".menu-button": {
    svg: {
      "* ": {
        color: isDarkMode ? "#FBFBFB" : "#000315",
      },
    },
  },
}));

export const StyledPangolinBox = styled(Box)({
  borderRadius: 10,
  overflow: "hidden",
  fontFamily: "Poppins",

  "& .twap-container": {
    paddingTop: 20,
  },
});
export const StyledPangolinDaasBox = styled(StyledPangolinBox)({
  borderRadius: 10,
  border: "1px solid #FFC800",
});

export const StyledPangolin = styled(StyledDapp)<{ isDarkMode: number }>(({ isDarkMode }) => ({
  background: isDarkMode ? "#1c1c1c" : "white",
  ".menu-button": {
    svg: {
      "* ": {
        color: "#FFC800",
      },
    },
  },
}));

export const StyledSpookySwapLayout = styled(DappLayout)({
  maxWidth: 520,
  width: "calc(100% - 30px)",
});

export const StyledSpiritSwapLayout = styled(DappLayout)({
  maxWidth: 520,
  width: "calc(100% - 30px)",
});

export const StyledStellaSwapLayout = styled(DappLayout)({
  maxWidth: 650,
  width: "calc(100% - 30px)",
});

export const StyledSpookySwap = styled(StyledDapp)<{ isDarkMode: number }>(({ isDarkMode }) => ({
  background: isDarkMode ? "rgb(18, 17, 34)" : "rgb(250, 249, 250)",
  ".menu-button": {
    svg: {
      "* ": {
        color: isDarkMode ? "rgb(250, 249, 250)" : "rgb(18, 17, 34)",
      },
    },
  },
}));

export const StyledSpookySwapBox = styled(Box)<{ isDarkMode: number }>(({ isDarkMode }) => ({
  background: isDarkMode ? "#192239" : "rgb(242, 244, 248)",
  borderRadius: 10,
  padding: 24,
  fontFamily: "Red Hat Display",
}));

export const StyledChronos = styled(StyledDapp)(({ isDarkMode }: { isDarkMode: number }) => ({
  fontFamily: "Space Grotesk",
  background: isDarkMode ? "rgb(10 9 62/1)" : "rgb(224 239 253/1)",
  backgroundImage: isDarkMode ? `url("chronos.svg")` : "unset",
  backgroundRepeat: "no-repeat",
  backgroundSize: "cover",
  backgroundPosition: "left",
  ".ui-selector-btn": {
    background: isDarkMode ? "rgba(255,255,255, 0.08)" : "white",
    color: isDarkMode ? "white" : "black",
  },
  ".ui-selector-btn-selected": {
    background: "linear-gradient(to right,#9E5BF1,#356FF4 )",
    color: "white",
  },
  ".menu-button": {
    svg: {
      "* ": {
        color: isDarkMode ? "white" : "black",
      },
    },
  },
}));

export const StyledChronosLayout = styled(DappLayout)({
  maxWidth: 620,
  width: "calc(100% - 30px)",
});

export const StyledQuickswapLayout = styled(DappLayout)({
  maxWidth: 520,
  width: "calc(100% - 30px)",
});

export const StyledThenaLayout = styled(DappLayout)({
  maxWidth: 520,
  width: "calc(100% - 30px)",
});

export const StyledSushiLayout = styled(DappLayout)({
  maxWidth: 490,
  width: "calc(100% - 30px)",
});

export const StyledPangolinLayout = styled(DappLayout)({
  maxWidth: 520,
  width: "calc(100% - 30px)",
});

export const StyledLayoutSpookyswap = styled(Box)(({ mode }: { mode: string }) => ({
  background: mode === "dark" ? "#192239" : "rgb(242, 244, 248)",
  borderRadius: 10,
  padding: 24,
  fontFamily: "Red Hat Display",
}));

// export const StyledLayoutPangolinDaasTWAP = styled(StyledPangolinTWAP)({
//   border: "1px solid #FFC800",
// });

// export const StyledLayoutPangolinDaasOrders = styled(StyledPangolin)({
//   border: "1px solid #FFC800",
// });

export const StyledCloseIcon = styled("button")({
  position: "absolute",
  background: "transparent",
  top: 30,
  right: 30,
  border: "unset",
  cursor: "pointer",
  "& .icon": {
    width: 20,
    height: 20,
    "* ": {
      fill: "white",
    },
  },
});

export const StyledModalContent = styled(Box)({
  width: "calc(100vw - 20px)",
  height: 500,
  border: "1px solid rgb(55, 65, 81)",
  background: "black",
  maxWidth: 500,
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  display: "flex",
  flexDirection: "column",
});

export const StyledListToken = styled(Box)({
  cursor: "pointer",
  display: "flex",
  gap: 10,
  alignItems: "center",
  padding: "10px 30px",
  transition: "0.2s all",
  "&:hover": {
    background: "rgba(255,255,255, 0.07)",
  },
  ".balance": {
    opacity: 0.6,
  },
});

export const StyledApp = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",
  "& *::-webkit-scrollbar": {
    display: "none",
    width: 0,
  },
  "@media (max-width:1100px)": {
    gap: 20,
  },
});

export const StyledDappSelector = styled(Box)({
  "& .MuiSelect-select": {
    fontSize: 18,
  },
});

export const StyledMenuLogo = styled("img")({
  width: 40,
  height: 40,
  borderRadius: 50,
});

export const StyledMenuListItemButton = styled(ListItemButton)({
  gap: 20,
  height: 60,
});

export const StyledMenuList = styled(List)({
  paddingTop: 30,
});

export const StyledMenuDrawer = styled(Drawer)({
  display: "flex",
  flexDirection: "column",
});

export const StyledDrawerContent = styled(Box)({
  display: "flex",
  flexDirection: "column",
  zIndex: 10,
  height: "100%",
});

export const StyledMenuMobileToggle = styled(IconButton)({
  marginRight: "auto",
  marginLeft: 20,
  zoom: 1.4,
  marginTop: 20,
});

export const StyledStatus = styled(TwapStyles.StyledColumnFlex)({
  padding: "20px",
  marginTop: "auto",
});

export const StyledStatusSection = styled(TwapStyles.StyledColumnFlex)({
  gap: 2,
});
export const StyledStatusSectionTitle = styled(TwapStyles.StyledText)({
  fontWeight: 700,
  fontSize: 9,
  lineHeight: "normal",
});

export const StyledStatusSectionText = styled(TwapStyles.StyledText)({
  fontSize: 9,
  lineHeight: "normal",
});

export const StyledThemeToggle = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 10,
  cursor: "pointer",
  marginTop: 20,
  marginLeft: "auto",
  marginRight: 20,
  "& button": {
    background: "unset",
    border: "unset",
    cursor: "pointer",
  },
});

export const StyledSearchInput = styled("input")({
  height: 50,
  width: "100%",
  background: "rgba(255,255,255, 0.05)",
  color: "white",
  fontFamily: "inherit",
  fontSize: 18,
  border: "unset",
  outline: "unset",
  textIndent: 20,
});

export const StyledTokens = styled(Box)({
  display: "flex",
  flexDirection: "column",
  flex: 1,
  padding: 0,
  width: "100%",
  margin: 0,
  overflow: "hidden",
});

export const StyledTokensList = styled(Box)({
  flex: 1,
  display: "flex",
  overflow: "auto",
  width: "100%",
  paddingTop: 10,
});

export const StyledUISelector = styled(Box)({});

export const StyledUISelectorButtons = styled(TwapStyles.StyledRowFlex)({
  marginBottom: 20,
});
export const StyledUISelectorButton = styled("button")({
  background: "transparent",
  cursor: "pointer",
  transition: "0.2s all",
  borderBottom: "2px solid transparent",
  padding: "10px 20px",
  border: "unset",
  borderRadius: 10,
  fontSize: 14,
  fontWeight: 500,
});
