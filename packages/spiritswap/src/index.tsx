import { CssBaseline } from "@mui/material";
import { Box, styled } from "@mui/system";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import TWAPLib from "@orbs-network/twap-ui";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import React, { useMemo } from "react";

const NumericInput = TWAPLib.baseComponents.NumericInput;
const Card = TWAPLib.baseComponents.Card;
const Label = TWAPLib.baseComponents.Label;
const TokenLogo = TWAPLib.baseComponents.TokenLogo;
const TokenName = TWAPLib.baseComponents.TokenName;
const SmallLabel = TWAPLib.baseComponents.SmallLabel;
const Switch = TWAPLib.baseComponents.Switch;
const Price = TWAPLib.components.Price;
const TimeSelector = TWAPLib.baseComponents.TimeSelector;
const ActionButton = TWAPLib.baseComponents.ActionButton;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: Infinity,
    },
  },
});

type Props = {
  chainId?: number;
  account?: string | null;
  provider: any;
};

const TWAP = (props: Props) => {
  TWAPLib.initializer(props.provider);

  return (
    <TWAPLib.providers.TWAPPropsProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={getTheme("dark")}>
          <CssBaseline />
          <StyledLayout>
            <StyledColumnGap gap={15}>
              <SrcTokenCard />
              <ChangeTokensOrder />
              <DstTokenCard />
              <PriceDisplay />
              <TradeSize />
              <MaxDuration />
              <TradeInterval />
              <SubmitButton />
            </StyledColumnGap>
          </StyledLayout>
        </ThemeProvider>
        <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
      </QueryClientProvider>
    </TWAPLib.providers.TWAPPropsProvider>
  );
};

export default TWAP;

const SrcTokenCard = () => {
  const { onChange } = TWAPLib.actions.useSrcTokenActions();
  const address = TWAPLib.state.useSrcTokenAddress();
  const amount = TWAPLib.state.useSrcTokenAmount();

  return (
    <StyledTokenInput>
      <Card>
        <StyledColumnGap>
          <Label>From:</Label>
          <StyledFlexStart>
            <TokenSelect address={address} onClick={() => {}} />
            <NumericInput placeholder={"0.00"} onChange={onChange} value={amount} />
          </StyledFlexStart>
        </StyledColumnGap>
      </Card>
    </StyledTokenInput>
  );
};

const DstTokenCard = () => {
  const address = TWAPLib.state.useDstTokenAddress();
  const amount = TWAPLib.state.useDstTokenAmount();
  return (
    <StyledTokenInput>
      <Card>
        <StyledColumnGap>
          <Label>To:</Label>
          <StyledFlexStart>
            <TokenSelect address={address} onClick={() => {}} />
            <NumericInput placeholder={"0.00"} onChange={() => {}} disabled value={amount} />
          </StyledFlexStart>
        </StyledColumnGap>
      </Card>
    </StyledTokenInput>
  );
};

const ChangeTokensOrder = () => {
  const onChangeTokenPositions = TWAPLib.actions.useChangeTokenPositions();
  return (
    <StyledChangeOrder onClick={onChangeTokenPositions}>
      <img src={"https://i.postimg.cc/BQWmSW9S/Mediamodifier-Design.png"} />
    </StyledChangeOrder>
  );
};

const TradeSize = () => {
  const { onChange } = TWAPLib.actions.useTradeSizeActions();
  const srcTokenAddress = TWAPLib.state.useSrcTokenAddress();

  const { tradeSize } = TWAPLib.state.useTradeSize();

  console.log(tradeSize);

  const usd = 10;

  return (
    <StyledTrade>
      <Card>
        <StyledColumnGap>
          <StyledFlexBetween>
            <Label tooltipText="Some text">Trade Size</Label>
            <NumericInput placeholder={"0"} onChange={onChange} value={tradeSize} />
            <TokenName address={srcTokenAddress} />
          </StyledFlexBetween>
          <StyledFlexBetween>
            <SmallLabel>Balance: 10</SmallLabel>
            <SmallLabel>${usd}</SmallLabel>
          </StyledFlexBetween>
        </StyledColumnGap>
      </Card>
    </StyledTrade>
  );
};

const StyledTrade = styled(Box)({
  width: "100%",
  "& .twap-input": {
    textAlign: "right",
    paddingRight: 20,
  },
});

const PriceDisplay = () => {
  const { showPrice } = TWAPLib.state.usePrice();

  const { togglePrice} = TWAPLib.actions.usePriceActions();

  return (
    <StyledPrice>
      <Card>
        <StyledColumnGap>
          <StyledFlexStart>
            <Switch value={!showPrice} onChange={() => togglePrice(!showPrice)} />
            <Label tooltipText="some text">Limit Price</Label>
          </StyledFlexStart>
          {showPrice && <Price />}
        </StyledColumnGap>
      </Card>
    </StyledPrice>
  );
};

const StyledPrice = styled(Box)(({ theme }) => ({
  width: "100%",
  "& .twap-price": {
    background: theme.palette.primary.main,
    padding: 10,
    borderRadius: 10,
  },
}));

const MaxDuration = () => {
  const { onChange } = TWAPLib.actions.useMaxDurationActions();
  const { maxDurationMillis, maxDurationTimeFormat } = TWAPLib.state.useMaxDuration();

  return (
    <Card>
      <Label tooltipText="Some text">Max Duration</Label>
      <TimeSelector millis={maxDurationMillis} timeFormat={maxDurationTimeFormat} onChange={onChange} />
    </Card>
  );
};

const TradeInterval = () => {
  const { onChange } = TWAPLib.actions.useTradeIntervalActions();
  const { tradeIntervalMillis, tradeIntervalTimeFormat } = TWAPLib.state.useTradeInterval();

  return (
    <Card>
      <Label tooltipText="Some text">Trade Interval</Label>
      <TimeSelector onChange={onChange} millis={tradeIntervalMillis} timeFormat={tradeIntervalTimeFormat} />
    </Card>
  );
};

const SubmitButton = () => {
  const warning = TWAPLib.validation().useSubmitButtonValidation();

  return <ActionButton onClick={() => {}}>{warning || "Submit"}</ActionButton>;
};

const TokenDisplay = ({ address }: { address: string }) => {
  return (
    <StyledTokenDisplay className="token-display">
      <TokenLogo address={address} />
      <TokenName address={address} />
    </StyledTokenDisplay>
  );
};

const TokenSelect = ({ address, onClick }: { address: string; onClick: () => void }) => {
  return (
    <StyledTokenSelect onClick={onClick}>
      <TokenDisplay address={address} />
    </StyledTokenSelect>
  );
};

const StyledTokenSelect = styled("button")(({ theme }) => ({
  background: theme.palette.primary.light,
  border: "unset",
  padding: "6px 12px",
  borderRadius: 38,
  cursor: "pointer",
}));

const StyledTokenDisplay = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 10,
});

const StyledFlexBetween = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
});

const StyledFlexStart = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  gap: 10,
  width: "100%",
});

const StyledChangeOrder = styled(Box)({
  display:'flex',
  alignItems:'center',
  justifyContent:'center',
  width:'100%',
  "& img": {
    width: 40,
    height: 40
  }
});

const StyledTokenInput = styled(Box)({
  width: "100%",
  "& .twap-input": {
    textAlign: "end",
  },
});

const StyledColumnGap = styled(Box)(({ gap }: { gap?: number }) => ({
  display: "flex",
  flexDirection: "column",
  gap: gap || 10,
  alignItems: "flex-start",
  width: "100%",
}));

const StyledLayout = styled(Box)(({ theme }) => ({
  background: theme.palette.primary.main,
  padding: 24,
  borderRadius: 20,
  maxWidth: 500,
  width: "100%",
  "& *": {
    color: theme.palette.text.primary,
  },
  "& .twap-card": {
    padding: 20,
    background: theme.palette.secondary.main,
    borderRadius: 10,
  },
  "& .twap-change-order": {
    width: 50,
    height: 50,
  },
  "& .twap-token-name": {
    fontSize: 15,
  },
  "& .twap-token-logo": {
    width: 30,
    height: 30,
  },
  "& .twap-input": {
    color: theme.palette.text.primary,
    fontSize: 20,
    fontWeight: 500,
  },
  "& .twap-action-button": {
    background: "linear-gradient(180deg,#448aff,#004ce6)",
    height: 56,
  },
  "& .twap-time-selector-list": {
    background: theme.palette.primary.light,
  },
  "& .twap-switch": {
    "& .MuiSwitch-track": {
      background: theme.palette.primary.main,
      opacity: 1,
    },
  },
}));

const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#ffffff",
      light: "#404557",
    },
    secondary: {
      main: "#ffffff",
    },
    text: {
      primary: "blank",
    },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#1b1e29",
      light: "#404557",
    },
    secondary: {
      main: "#232734",
    },
    text: {
      primary: "white",
    },
  },
  typography: {},
});

const getTheme = (mode: "light" | "dark") => {
  switch (mode) {
    case "dark":
      return darkTheme;
    case "light":
      return lightTheme;

    default:
      return lightTheme;
  }
};
