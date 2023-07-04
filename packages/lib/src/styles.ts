import { Tab, Tabs, Typography } from "@mui/material";
import { Box, styled } from "@mui/system";
import { CSSProperties } from "react";
export const StyledShadowContainer = styled(Box)({
  boxShadow: "0px 5px 20px rgba(85, 94, 104, 0.13)",
  borderRadius: 25,
  minWidth: 121,
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  paddingLeft: 5,
  "& p": {
    fontSize: 12,
    fontWeight: 600,
  },
});

export const StyledText = styled(Typography)({
  fontFamily: "inherit",
  fontSize: "inherit",
});

export const StyledColumnFlex = styled(Box)(({ gap = 10 }: { gap?: number }) => ({
  display: "flex",
  flexDirection: "column",
  gap,
  alignItems: "flex-start",
  width: "100%",
}));

export const StyledBorderWrapper = styled(Box)({
  display: "flex",
  alignItems: "center",
  height: 58,
  border: "1px solid #EAECF0",
  boxShadow: "0px 12px 60px rgba(141, 155, 170, 0.1)",
  borderRadius: 30,
  padding: 8,
});

export const textOverflow: CSSProperties = {
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

export const StyledOneLineText = styled(StyledText)({
  ...textOverflow,
  minWidth: 0,
});

export const StyledSmallTitle = styled(StyledOneLineText)({
  fontWeight: 600,
  fontSize: 12,
});

export const StyledSmallTextDetail = styled(Typography)({
  fontWeight: 400,
  fontSize: "12px",
});

export const StyledBoxWithDetails = styled(StyledColumnFlex)({
  gap: 10,
});

export const StyledRowFlex = styled(Box)(
  ({
    gap = 10,
    justifyContent = "center",
    width = "100%",
  }: {
    gap?: number;
    justifyContent?: "flex-start" | "flex-end" | "center" | "space-between";
    width?: string | number;
  }) => ({
    display: "flex",
    alignItems: "center",
    justifyContent,
    width,
    gap,
  })
);

export const StyledOverflowContainer = styled(StyledRowFlex)({
  ...textOverflow,
  justifyContent: "flex-start",
});

export const StyledOrdersTab = styled(Tab)({
  fontSize: 13,
  width: "calc(100% / 4)",
  padding: "0px",
  textTransform: "unset",
  fontFamily: "inherit",

  "@media(max-width: 600px)": {
    padding: "0px 20px",
    width: "unset",
  },
});

export const StyledOrdersTabs = styled(Tabs)({
  border: "1px solid #202432",
  width: "100%",
  borderRadius: 6,
  padding: 3,
  "& .MuiTabs-indicator": {
    height: "100%",

    zIndex: 1,
  },
  "& .MuiTouchRipple-root": {},
  "& .MuiButtonBase-root": {
    zIndex: 9,
  },
  "& .Mui-selected": {},
});

export const StyledOrdersLists = styled(Box)({
  overflow: "auto",
  height: "100%",
});
