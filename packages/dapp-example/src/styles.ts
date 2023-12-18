import { Box, createTheme, styled, Theme } from "@mui/material";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import IconButton from "@mui/material/IconButton";
import { Styles as TwapStyles } from "@orbs-network/twap-ui";
import { DappLayout } from "./Components";
import { Configs } from "@orbs-network/twap";

const darktheme = createTheme({
  palette: {
    mode: "dark",
  },
});

const lightTheme = createTheme({
  palette: {
    mode: "light",
  },
});

export const getTheme = (isDark: boolean) => {
  return isDark ? darktheme : lightTheme;
};

const isDarkMode = (theme: Theme) => theme.palette.mode === "dark";

const fonts = {
  [Configs.Chronos.name]: "TT Firs Neue Trial",
  [Configs.SpiritSwap.name]: "Jost",
  [Configs.QuickSwap.name]: "Inter",
  [Configs.Thena.name]: "Figtree",
  [Configs.Pangolin.name]: "Poppins",
  [Configs.PangolinDaas.name]: "Poppins",
  [Configs.SpookySwap.name]: "Red Hat Display",
  [Configs.PancakeSwap.name]: "Kanit",
  [Configs.BaseSwap.name]: "Outfit",
  StellaSwap: "DM Sans",
  Lynex: "Montserrat",
  [Configs.Arbidex.name]: "Quicksand",
  SyncSwap: "Inter",
};

export const globalStyle = (name?: string) => {
  const font = fonts[name || ""];
  return {
    "*, p": {
      fontFamily: `${font || "Helvetica"}!important`,
    },
  };
};

export const StyledSpiritSwapBox = styled(Box)(({ theme }) => ({
  background: isDarkMode(theme) ? "rgb(16, 23, 38)" : "#FBFBFB",
  border: `1px solid rgb(55, 65, 81)`,
  borderRadius: 10,
  padding: "0.5rem",
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

export const StyledSyncSwapBox = styled(Box)({
  padding: 20,
  borderRadius: 10,
});

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
  ".ui-selector-btn": {
    background: isDarkMode ? "rgba(255,255,255, 0.1)" : "white",
    color: isDarkMode ? "white" : "black",
  },
  ".ui-selector-btn-selected": {
    background: "linear-gradient(to right, rgb(216, 0, 183), rgb(177, 0, 222), rgb(177, 0, 222), rgb(216, 0, 183))",
    color: "white",
  },
}));

export const StyledPancake = styled(StyledDapp)<{ isDarkTheme: number }>(({ isDarkTheme }) => ({
  background: isDarkTheme ? "#383258" : "#EAF7FF",
  ".ui-selector-btn": {
    background: "#1fc7d4",
    color: isDarkTheme ? "white" : "black",
  },
  ".ui-selector-btn-selected": {
    background: "#7a6eaa",
    color: "white",
  },
  ".menu-button": {
    svg: {
      "* ": {
        color: isDarkTheme ? "#FBFBFB" : "#000315",
      },
    },
  },
}));

export const StyledStella = styled(StyledDapp)<{ isDarkMode: number }>(({ isDarkMode }) => ({
  background: isDarkMode ? "#251842" : "#F4F5F6",
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
    borderBottom: isDarkMode ? "2px solid white" : "2px solid black",
  },
  ".ui-selector-btn": {
    color: isDarkMode ? "white" : "black",
    borderRadius: "unset",
  },
}));

export const StyledSyncSwap = styled(StyledDapp)(({ color }: { color: string }) => ({
  ".ui-selector-btn-selected": {
    borderBottom: `2px solid ${color}`,
  },
  ".ui-selector-btn": {
    color: color,
    borderRadius: "unset",
  },
}));

export const StyledSpiritSwap = styled(StyledDapp)(({ theme }) => ({
  background: isDarkMode(theme) ? "#000315" : "#FBFBFB",
  ".menu-button": {
    svg: {
      "* ": {
        color: isDarkMode(theme) ? "#FBFBFB" : "#000315",
      },
    },
  },
}));

export const StyledPangolinBox = styled(Box)({
  borderRadius: 10,
  overflow: "hidden",

  "& .twap-container": {
    paddingTop: 20,
  },
});
export const StyledPangolinDaasBox = styled(StyledPangolinBox)({
  borderRadius: 10,
  border: "1px solid #FFC800",
});

export const StyledPangolin = styled(StyledDapp)(({ theme }) => ({
  background: isDarkMode(theme) ? "#1c1c1c" : "white",
  ".ui-selector-btn": {
    color: isDarkMode(theme) ? "white" : "black",
  },
  ".menu-button": {
    svg: {
      "* ": {
        color: "#FFC800",
      },
    },
  },
}));

export const StyledSpookySwapLayout = styled(DappLayout)({
  maxWidth: 420,
  width: "calc(100% - 30px)",
});

export const StyledBaseSwapLayout = styled(DappLayout)({
  maxWidth: 420,
  width: "calc(100% - 30px)",
});

export const StyledArbidexLayout = styled(DappLayout)({
  maxWidth: 540,
  width: "calc(100% - 30px)",
  "@media(max-width:1200px)": {
    maxWidth: 405,
  },
});

export const StyledLynexLayout = styled(DappLayout)({
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

export const StyledSpookySwap = styled(StyledDapp)(({ theme }) => ({
  background: isDarkMode(theme) ? "rgb(18, 17, 34)" : "rgb(250, 249, 250)",
  ".ui-selector-btn": {
    color: isDarkMode(theme) ? "white" : "black",
  },
  ".menu-button": {
    svg: {
      "* ": {
        color: isDarkMode(theme) ? "rgb(250, 249, 250)" : "rgb(18, 17, 34)",
      },
    },
  },
}));

export const StyledBaseSwap = styled(StyledDapp)(({ theme }) => ({
  background: isDarkMode(theme) ? "rgb(17, 17, 17)" : "rgb(250, 249, 250)",
  ".ui-selector-btn": {
    color: isDarkMode(theme) ? "white" : "black",
  },
  ".menu-button": {
    svg: {
      "* ": {
        color: isDarkMode(theme) ? "white" : "black",
      },
    },
  },
}));

export const StyledArbidexSwap = styled(StyledDapp)(({ theme }) => ({
  background: isDarkMode(theme) ? "rgb(8, 0, 30)" : "rgb(250, 249, 250)",
  ".ui-selector-btn": {
    color: isDarkMode(theme) ? "white" : "black",
  },
  ".menu-button": {
    svg: {
      "* ": {
        color: isDarkMode(theme) ? "white" : "black",
      },
    },
  },
}));

export const StyledLynex = styled(StyledDapp)(({ theme }) => ({
  background: isDarkMode(theme) ? "#1A1918" : "#1A1918",
  ".ui-selector-btn": {
    color: isDarkMode(theme) ? "white" : "black",
  },
  ".menu-button": {
    svg: {
      "* ": {
        color: isDarkMode(theme) ? "white" : "black",
      },
    },
  },
}));

export const StyledSpookySwapBox = styled(Box)(({ theme }) => ({
  background: isDarkMode(theme) ? "#192239" : "rgb(242, 244, 248)",
  borderRadius: 10,
  padding: 24,
}));

export const StyledBaseSwapBox = styled(Box)(({ theme }) => ({
  background: isDarkMode(theme) ? "#0D0D0D" : "rgb(242, 244, 248)",
  borderRadius: 12,
  padding: 16,
  border: "2px solid rgb(1, 84, 253)",
}));

export const StyledArbidexBox = styled(Box)(({ theme }) => ({
  background: isDarkMode(theme) ? "linear-gradient(270deg, rgb(10, 10, 20), rgb(10, 0, 40))" : "rgb(242, 244, 248)",
  borderRadius: 12,
  padding: 16,
  border: "3px solid white",
  backdropFilter: "blur(2px)",
}));

export const StyledLynexBox = styled(Box)(({ theme }) => ({
  background: isDarkMode(theme) ? "#393737" : "#393737",
  borderRadius: 10,
  padding: 16,
}));

export const StyledChronos = styled(StyledDapp)(({ isDarkMode }: { isDarkMode: number }) => ({
  background: isDarkMode ? "#29253A" : "rgb(224 239 253/1)",
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
  width: "calc(100% - 30px)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
});

export const StyledStyledChronosPanel = styled(Box)({
  width: "100%",
  maxWidth: 600,
});

export const StyledStyledChronosOrders = styled(Box)({
  width: "100%",
  maxWidth: 930,
  "@media (max-width:1400px)": {
    maxWidth: 700,
    ".twap-chronos-orders-header": {
      gap: 20,
      flexDirection: "column",
      alignItems: "flex-start",
      "&-right": {
        marginLeft: "unset",
      },
    },
  },
});

export const StyledQuickswapLayout = styled(DappLayout)({
  maxWidth: 600,
  width: "calc(100% - 30px)",
});

export const StyledThenaLayout = styled(DappLayout)({
  maxWidth: 600,
  width: "calc(100% - 30px)",
});

export const StyledPancakeTwap = styled(Box)<{ isDarkTheme: number }>(({ isDarkTheme }) => ({
  background: isDarkTheme ? "#27262C" : "#FFFFFF",
  padding: 16,
  borderRadius: 24,
  position: "relative",
  width: "100%",
}));

export const StyledPancakeBackdrop = styled(Box)<{ isDarkTheme: number }>(({ isDarkTheme }) => ({
  width: "calc(100% + 2px)",
  height: "calc(100% + 4px)",
  position: "absolute",
  left: "50%",
  top: -1,
  transform: "translateX(-50%)",
  background: isDarkTheme ? "#383241" : "#e7e3eb",
  zIndex: 0,
  borderRadius: 24,
}));

export const StyledPancakeLayout = styled(DappLayout)({
  width: "calc(100% - 30px)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  position: "relative",
  maxWidth: 530,
});

export const StyledSushiLayout = styled(DappLayout)({
  maxWidth: 490,
  width: "calc(100% - 30px)",
});

export const StyledPangolinLayout = styled(DappLayout)({
  maxWidth: 520,
  width: "calc(100% - 30px)",
});

export const StyledPangolinOrdersLayout = styled("div")({
  maxWidth: 800,
  width: "calc(100% - 30px)",
  marginTop: 20,
});

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
  width: "100%",
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
  "*, p": {
    fontFamily: "Helvetica Neue, sans-serif!important",
    color: "white",
  },
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
  "*": {
    color: "white",
  },
});

export const StyledTokensList = styled(Box)({
  flex: 1,
  display: "flex",
  overflow: "auto",
  width: "100%",
  paddingTop: 10,
});

export const StyledUISelector = styled(TwapStyles.StyledRowFlex)({});

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
