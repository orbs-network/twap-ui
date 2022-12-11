import { Typography } from "@mui/material";
import { Box, styled } from "@mui/system";
import {MakeGlobalStylesArgs} from './types'
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

export const StyledOneLineText = styled(Typography)({
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
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

export const StyledRowFlex = styled(Box)(({ gap = 10, justifyContent = "center" }: { gap?: number; justifyContent?: "flex-start" | "flex-end" | "center" | "space-between" }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent,
  width: "100%",
  gap,
}));

export const StyledText = styled(Typography)({
  fontFamily: "inherit",
});

