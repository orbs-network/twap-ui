import { Box, styled } from "@mui/system";
import { CSSProperties } from "react";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import IconButton from "@mui/material/IconButton";
import { Styles as TwapStyles } from "@orbs-network/twap-ui";
export const globalStyle = {
  "& *": {
    color: "white",
  },
};

export const StyledLayoutSpiritswap = styled(Box)({
  background: "rgb(16, 23, 38)",
  border: `1px solid rgb(55, 65, 81)`,
  borderRadius: 10,
  padding: "0.5rem",
  fontFamily: "Jost",
  maxWidth: 500,
});

export const StyledLayoutQuickswap = styled(Box)({
  background: "#1b1e29",
  borderRadius: 24,
  padding: 24,
  fontFamily: "Inter",
  maxWidth: 500,
});

export const StyledLayoutSpookyswap = styled(Box)(({ mode }: { mode: string }) => ({
  background: mode === "dark" ? "#192239" : "rgb(242, 244, 248)",
  borderRadius: 10,
  padding: 50,
  fontFamily: "Red Hat Display",
}));

export const StyledPangolin = styled(Box)({
  borderRadius: 10,
  fontFamily: "Poppins",
  overflow: "hidden",
  "& .twap-container": {
    paddingTop: 20,
  },
});

export const StyledPangolinTWAP = styled(StyledPangolin)({

});

export const StyledLayoutPangolinDaasTWAP = styled(StyledPangolinTWAP)({
  border: "1px solid #FFC800",
});

export const StyledLayoutPangolinDaasOrders = styled(StyledPangolin)({
  border: "1px solid #FFC800",
});

export const StyledDappContainer = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: 30,
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

export const StyledModalList = styled("ul")({
  listStyleType: "none",
  flex: 1,
  overflow: "auto",
  display: "flex",
  flexDirection: "column",
  padding: 0,
  width: "100%",
  height: "calc(100% - 50px)",
  margin: 0,
  paddingTop: 10,
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
});

export const StyledModalListItem = styled("li")({
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
  paddingBottom: 50,
  background: "black",
  minHeight: "100vh",
  gap: 30,
  "& *::-webkit-scrollbar": {
    display: "none",
    width: 0,
  },
  "@media (max-width:1100px)": {
    gap: 20,
  },
});

export const StyledContent = styled(Box)(({ styles }: { styles?: CSSProperties }) => ({
  flex: 1,
  maxWidth: 500,
  width: "calc(100% - 30px)",
  overflow: "auto",
  ...styles,
  display: "flex",
  flexDirection: "column",
  gap: 10,
}));

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
});

export const StyledMenuMobileToggle = styled(IconButton)({
  marginRight: "auto",
  marginLeft: 20,
  zoom: 1.4,
  marginTop: 20,
});

export const StyledDappLayout = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: 20,
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
