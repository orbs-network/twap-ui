import { Accordion } from "@mui/material";
import { Box, styled } from "@mui/system";
import { Card } from "../../components/base";
import { StyledRowFlex } from "../../styles";

export const StyledFlex = styled(StyledRowFlex)({
  justifyContent: "space-between",
  fontSize: 14,
});

export const StyledTokenDisplay = styled(Box)({
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "center",
  gap: 10,
  "& .top": {
    display: "flex",
    alignItems: "center",
    gap: 8,
    "& *": {
      fontSize: 18,
    },
  },

  "& .twap-token-name": {},
  "& .twap-text": {},
});

export const StyledContainer = styled(Card)({});

export const StyledAccordion = styled(Accordion)({
  width: "100%",
  fontFamily: "inherit",
  padding: 0,
  margin: 0,
  background: "transparent",
  boxShadow: "unset",
  "& .MuiAccordionSummary-content": {
    margin: "0!important",
    width: "100%",
  },
});

export const StyledSpace = styled(Box)({
  height: 20,
});

export const StyledPreview = styled(Box)({
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  width: "100%",
  marginTop: 18,
  fontSize: 18,

  "& .usd": {
    fontSize: 14,
  },
  "@media(max-width: 600px)": {
    zoom: 0.85,
  },
});

export const StyledSeperator = styled(Box)({
  width: "100%",
  height: 1,
  background: "#373E55",
});
