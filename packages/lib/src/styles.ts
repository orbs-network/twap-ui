import { Typography } from "@mui/material";
import { Box, styled } from "@mui/system";

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

export const StyledColumnGap = styled(Box)(({ gap }: { gap: number }) => ({
  display: "flex",
  flexDirection: "column",
  gap,
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

export const StyledSmallTitle = styled(Typography)({
  fontWeight: 600,
  fontSize: 12,
});
