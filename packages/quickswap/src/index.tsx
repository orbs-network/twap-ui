import { CssBaseline } from "@mui/material";
import { Box, styled } from "@mui/system";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import TWAPLib from "@orbs-network/twap-ui";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { AiFillEdit } from "react-icons/ai";

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
const Tooltip = TWAPLib.baseComponents.Tooltip;
const IconButton = TWAPLib.baseComponents.IconButton;

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
  connect: () => void;
};

const TWAP = (props: Props) => {
  TWAPLib.initializer(props.provider);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={getTheme("dark")}>
        <CssBaseline />
        <StyledLayout>
          <StyledColumnGap gap={10}>
            <SrcTokenCard />
            <ChangeTokensOrder />
            <DstTokenCard />
            <PriceDisplay />
            <TradeSize />
            <MaxDuration />
            <TradeInterval />
            <SubmitTwapButton account={props.account} connect={props.connect} />
          </StyledColumnGap>
        </StyledLayout>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
    </QueryClientProvider>
  );
};

export default TWAP;

const SrcTokenCard = () => {
  const { onChange, srcTokenAddress, srcTokenUiAmount } = TWAPLib.store.useSrcToken();

  return (
    <StyledTokenInput>
      <Card>
        <StyledColumnGap>
          <Label>From:</Label>
          <StyledFlexStart>
            <TokenSelect address={srcTokenAddress} onClick={() => {}} />
            <NumericInput placeholder={"0.00"} onChange={onChange} value={srcTokenUiAmount} />
          </StyledFlexStart>
        </StyledColumnGap>
      </Card>
    </StyledTokenInput>
  );
};

const DstTokenCard = () => {
  const { dstTokenAddress, dstTokenUiAmount } = TWAPLib.store.useDstToken();
  return (
    <StyledTokenInput>
      <Card>
        <StyledColumnGap>
          <Label>To:</Label>
          <StyledFlexStart>
            <TokenSelect address={dstTokenAddress} onClick={() => {}} />
            <NumericInput placeholder={"0.00"} onChange={() => {}} disabled value={dstTokenUiAmount} />
          </StyledFlexStart>
        </StyledColumnGap>
      </Card>
    </StyledTokenInput>
  );
};

const ChangeTokensOrder = () => {
  const onChangeTokenPositions = TWAPLib.store.useChangeTokenPositions();
  return (
    <StyledChangeOrder onClick={onChangeTokenPositions}>
      <img src={"https://i.postimg.cc/BQWmSW9S/Mediamodifier-Design.png"} />
    </StyledChangeOrder>
  );
};

const TradeSize = () => {
  const { srcTokenAddress } = TWAPLib.store.useSrcToken();

  const { uiTradeSize, onChange, totalTrades } = TWAPLib.store.useTradeSize();

  const usd = 10;

  return (
    <StyledTrade>
      <Card>
        <StyledColumnGap>
          <StyledFlexBetween>
            <Label tooltipText="Some text">Trade Size</Label>
            <NumericInput placeholder={"0"} onChange={onChange} value={uiTradeSize} />
            <TokenName address={srcTokenAddress} />
          </StyledFlexBetween>
          <StyledFlexBetween>
            <SmallLabel>Total trades: {totalTrades}</SmallLabel>
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
  const { showLimit, onToggleLimit } = TWAPLib.store.useLimitPrice();

  return (
    <StyledPrice>
      <Card>
        <StyledColumnGap>
          <StyledFlexStart>
            <Switch value={!showLimit} onChange={() => onToggleLimit()} />
            <Label tooltipText="some text">Limit Price</Label>
          </StyledFlexStart>
          {showLimit && <Price />}
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
  const { onChange } = TWAPLib.store.useMaxDuration();
  const { maxDurationMillis, maxDurationTimeFormat } = TWAPLib.store.useMaxDuration();

  return (
    <Card>
      <Label tooltipText="Some text">Max Duration</Label>
      <TimeSelector millis={maxDurationMillis} selectedTimeFormat={maxDurationTimeFormat} onChange={onChange} />
    </Card>
  );
};

const TradeInterval = () => {
  const { onChange } = TWAPLib.store.useTradeInterval();
  const { tradeIntervalMillis, tradeIntervalTimeFormat, customInterval } = TWAPLib.store.useTradeInterval();
  const { onCustomIntervalClick } = TWAPLib.store.useTradeInterval();

  return (
    <Card>
      <Label tooltipText="Some text">Trade Interval</Label>
      <StyledIntervalTimeSelect>
        <Tooltip text={customInterval ? "" : "Some text"}>
          <TimeSelector disabled={!customInterval} onChange={onChange} millis={tradeIntervalMillis} selectedTimeFormat={tradeIntervalTimeFormat} />
        </Tooltip>
      </StyledIntervalTimeSelect>
      {!customInterval && (
        <IconButton tooltip="Some text" onClick={onCustomIntervalClick}>
          <AiFillEdit />
        </IconButton>
      )}
    </Card>
  );
};

const SubmitTwapButton = ({ account, connect }: { account?: string | null; connect: () => void }) => {
  const warning = TWAPLib.validation.useSubmitButtonValidation();

  if (!account) {
    return <ActionButton onClick={connect}>Connect Wallet</ActionButton>;
  }

  return (
    <ActionButton disabled={!!warning} onClick={() => {}}>
      {warning || "Submit"}
    </ActionButton>
  );
};

const TokenDisplay = ({ address }: { address?: string }) => {
  return (
    <StyledTokenDisplay className="token-display">
      <TokenLogo address={address} />
      <TokenName address={address} />
    </StyledTokenDisplay>
  );
};

const TokenSelect = ({ address, onClick }: { address?: string; onClick: () => void }) => {
  return (
    <StyledTokenSelect onClick={onClick}>
      <TokenDisplay address={address} />
    </StyledTokenSelect>
  );
};

// ----------- styles -------------- //

const StyledIntervalTimeSelect = styled(Box)({
  flex: 1,
});
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
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  "& img": {
    width: 40,
    height: 40,
  },
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
  width: "100%",
  "& *": {
    color: theme.palette.text.primary,
  },
  "& .twap-card": {
    padding: 20,
    background: theme.palette.secondary.main,
    borderRadius: 10,
  },
  "& .twap-small-label": {
    fontSize: 14,
    opacity: 0.6,
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

// ------------- theme --------------- //
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
