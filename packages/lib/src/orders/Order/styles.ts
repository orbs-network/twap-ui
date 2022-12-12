import { Accordion, AccordionSummary, LinearProgress, Typography } from "@mui/material";
import { Box, styled } from "@mui/system";
import { Styles as TwapStyles } from "../..";
import { Button, Card, SmallLabel, TokenLogo } from "../../components";

export const StyledFlex = styled(TwapStyles.StyledRowFlex)({
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
