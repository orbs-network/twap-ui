import { Box, styled } from "@mui/system";
import React from "react";
import Text from "./Text";
import LinearProgress from "@mui/material/LinearProgress";
import TokenName from "./TokenName";
import TokenLogo from "./TokenLogo";
import NumberDisplay from "./NumberDisplay";
import { BsArrowRight } from "react-icons/bs";
import Icon from "./Icon";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import { Typography } from "@mui/material";
import Label from "./Label";

function LimitOrder() {
  return (
    <StyledContainer>
      <StyledSummary>
        <StyledSummaryContent>
          <StyledHeader>
            <Text>#123</Text>
            <Text>12 oct 22 10:00</Text>
          </StyledHeader>
          <PreviewProgressBar progress={80} />
          <StyledFlexStart>
            <TokenDetails />
            <StyledIcon icon={<BsArrowRight style={{ width: 30, height: 30 }} />} />
            <TokenDetails />
          </StyledFlexStart>
        </StyledSummaryContent>
      </StyledSummary>

      <FullData />
    </StyledContainer>
  );
}

const StyledFlexStart = styled(Box)({
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
});

const StyledIcon = styled(Icon)({
  position: "relative",
  top: 4,
});

export default LimitOrder;

const StyledSummary = styled(AccordionSummary)({
  flexDirection: "column",
  display: "flex",
  width: "100%",
  padding: 0,
});

const StyledSummaryContent = styled(Box)({
  display: "flex",
  flexDirection: "column",
  width: "100%",
  gap: 15,
});

const StyledContainer = styled(Accordion)({
  width: "100%",
  fontFamily: "inherit",
  padding: 10,
  margin: 0,
  background: "transparent",
  boxShadow: "unset",
  "& .MuiAccordionSummary-content": {
    margin: 0,
    width: "100%",
  },
  "& *": {
    color: "white",
  },
});
const StyledHeader = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
});

const PreviewProgressBar = ({ progress, emptyBarColor }: { progress: number; emptyBarColor?: string }) => {
  return <StyledPreviewLinearProgress variant="determinate" value={progress} emptybarcolor={emptyBarColor} />;
};

const TokenDetails = () => {
  return (
    <StyledTokenDetails>
      <Box className="flex">
        <TokenLogo logo="" />
        <Text>
          <NumberDisplay value="10" />
        </Text>
        <TokenName name="" />
      </Box>
      <Text className="usd">
        ~$ <NumberDisplay value={100000} />
      </Text>
    </StyledTokenDetails>
  );
};

const StyledTokenDetails = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  "& .flex": {
    display: "flex",
    alignItems: "center",
    gap: 10,
    "& *": {
      fontSize: 18,
    },
  },
  "& .twap-token-logo": {
    width: 28,
    height: 28,
  },
  "& .twap-token-name": {},
  "& .twap-text": {},
  "& .usd": { fontSize: 14 },
});

const StyledPreviewLinearProgress = styled(LinearProgress)(({ emptybarcolor }: { emptybarcolor?: string }) => ({
  height: 5,
  marginLeft: "auto",
  marginRight: "auto",
  width: "100%",
  borderRadius: 50,
  background: "transparent",
  "&::after": {
    position: "absolute",
    background: emptybarcolor || "white",
    top: "50%",
    left: 0,
    transform: "translate(0, -50%)",
    height: 1,
    content: '""',
    width: "100%",
  },
  "& .MuiLinearProgress-bar": {
    height: 5,
    zIndex: 1,
    borderRadius: 50,
  },
}));

const FullData = () => {
  return (
    <StyledFullData aria-expanded={true}>
      <StyledBgContainer>
        <Label>progress</Label>
        <StyledFlex>
          <TokenDetails />
          <TokenDetails />
        </StyledFlex>
        <MainProgressBar progress={60} />
        <StyledFlex>
          <TokenDetails />
          <TokenDetails />
        </StyledFlex>
      </StyledBgContainer>
    </StyledFullData>
  );
};

const MainProgressBar = ({ progress, emptyBarColor }: { progress: number; emptyBarColor?: string }) => {
  return <StyledMainProgressBar variant="determinate" value={progress} />;
};

const StyledMainProgressBar = styled(LinearProgress)({
  height: 21,
  background: "#22353C",
  borderRadius: 2,
  "& .MuiLinearProgress-bar": {
    borderRadius: "4px",
  },
});

const StyledFlex = styled(Box)({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
});

const StyledBgContainer = styled(Box)({
  width: "100%",
  padding: 20,
  background: "#3C404E",
  borderRadius: 6,
});

const StyledFullData = styled(AccordionDetails)({
  padding: 0,
});
