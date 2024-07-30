import styled from "styled-components";
import { CSSProperties } from "react";

export const StyledShadowContainer = styled("div")({
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

export const StyledText = styled("p")({
  margin: 0,
});

export const StyledColumnFlex = styled("div")<{ gap?: number }>(({ gap = 10 }) => ({
  display: "flex",
  flexDirection: "column",
  gap,
  alignItems: "flex-start",
  width: "100%",
}));

export const StyledBorderWrapper = styled("div")({
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

export const StyledSmallTextDetail = styled("p")({
  fontWeight: 400,
  fontSize: "12px",
});

export const StyledBoxWithDetails = styled(StyledColumnFlex)({
  gap: 10,
});

export const StyledRowFlex = styled("div")<{
  gap?: number;
  justifyContent?: "flex-start" | "flex-end" | "center" | "space-between";
  width?: string | number;
}>(({ gap = 10, justifyContent = "center", width = "100%" }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent,
  width,
  gap,
}));

export const StyledOverflowContainer = styled(StyledRowFlex)({
  ...textOverflow,
  justifyContent: "flex-start",
});
