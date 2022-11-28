import { Box, styled } from "@mui/system";
import { CSSProperties } from "react";

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
});

export const StyledLayoutSpookyswap = styled(Box)({
  background: "linear-gradient(rgb(49, 65, 94) 0%, rgba(49, 65, 94, 0) 100%), rgba(18, 17, 34, 0.6)",
  borderRadius: 10,
  padding: 20,
  fontFamily: "Red Hat Display",
});

export const StyledLayoutPangolin = styled(Box)({
  background: "rgb(17, 17, 17)",
  borderRadius: 10,
  padding: "20px 10px 10px 10px",
  fontFamily: "Poppins",
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
  maxWidth: 500,
  width: "calc(100vw - 20px)",
  height: 500,
  overflow: "auto",
  background: "black",
  border: "1px solid rgb(55, 65, 81)",
  display: "flex",
  flexDirection: "column",
  padding: 0,
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
});

export const StyledApp = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",
  gap: 48,
  paddingBottom: 50,
  paddingTop: 40,
  background: "black",
  minHeight: "100vh",
  "& *::-webkit-scrollbar": {
    display: "none",
    width: 0,
  },
});

export const StyledContent = styled(Box)(({ styles }: { styles?: CSSProperties }) => ({
  flex: 1,
  maxWidth: 500,
  width: "calc(100% - 30px)",
  overflow: "auto",
  ...styles,
}));

export const StyledDappSelector = styled(Box)({
  "& .MuiSelect-select": {
    fontSize: 18,
  },
});
