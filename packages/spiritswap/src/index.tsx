import { CssBaseline } from "@mui/material";
import { Box, styled } from "@mui/system";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import TWAPLib from "@orbs-network/twap-ui";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const NumericInput = TWAPLib.components.NumericInput;
const Card = TWAPLib.components.Card;
const Label = TWAPLib.components.Label;
const TokenLogo = TWAPLib.components.TokenLogo;
const TokenName = TWAPLib.components.TokenName;
const SmallLabel = TWAPLib.components.SmallLabel;
const Switch = TWAPLib.components.Switch;
const PriceInput = TWAPLib.components.PriceInput;
const TimeSelector = TWAPLib.components.TimeSelector;
const ActionButton = TWAPLib.components.ActionButton;

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
              <Price />
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
  const { onSrcTokenChange } = TWAPLib.actions();
  const { srcTokenAddress, srcTokenAmount } = TWAPLib.state();  

  return (
    <StyledTokenInput>
      <Card>
        <StyledColumnGap>
          <Label>From:</Label>
          <StyledFlexStart>
            <TokenSelect address={srcTokenAddress}  onClick={() => {}}  />
            <NumericInput placeholder={"0.00"} onChange={onSrcTokenChange} value={srcTokenAmount} />
          </StyledFlexStart>
        </StyledColumnGap>
      </Card>
    </StyledTokenInput>
  );
};

const DstTokenCard = () => {
  const { dstTokenAmount, dstTokenAddress } = TWAPLib.state();

  return (
    <StyledTokenInput>
      <Card>
        <StyledColumnGap>
          <Label>To:</Label>
          <StyledFlexStart>
            <TokenSelect address={dstTokenAddress} onClick={() => {}} />
            <NumericInput placeholder={"0.00"} onChange={() => {}} disabled value={dstTokenAmount} />
          </StyledFlexStart>
        </StyledColumnGap>
      </Card>
    </StyledTokenInput>
  );
};

const ChangeTokensOrder = () => {
  const { onChangeTokenPositions } = TWAPLib.actions();
  return <StyledChangeOrder image={"https://i.postimg.cc/BQWmSW9S/Mediamodifier-Design.png"} onClick={onChangeTokenPositions} />;
};

const TradeSize = () => {
  const { onTradeSizeChange } = TWAPLib.actions();
  const { tradeSize, srcTokenAddress } = TWAPLib.state();

  const usd = 10;

  return (
    <StyledTrade>
      <Card>
        <StyledColumnGap>
          <StyledFlexBetween>
            <Label tooltipText="Some text">Trade Size</Label>
            <NumericInput placeholder ={'0'} onChange={onTradeSizeChange} value={tradeSize} />
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
width:'100%',
"& .twap-input" :{
  textAlign:'right',
  paddingRight: 20
}
})


const Price = () => {
  const { srcTokenAddress, dstTokenAddress } = TWAPLib.state();
  return (
    <StyledPrice>
      <Card>
        <StyledColumnGap>
          <StyledFlexStart>
            <Switch value={false} onChange={() => {}} />
            <Label tooltipText="some text">Limit Price</Label>
          </StyledFlexStart>
          <PriceInput srcTokenAddress={srcTokenAddress} dstTokenAddress={dstTokenAddress} onChange={() => {}} />
        </StyledColumnGap>
      </Card>
    </StyledPrice>
  );
};


const StyledPrice = styled(Box)({
  width:'100%',
  "& .twap-input":{
    textAlign:'center',
    width: 100,
  },
  "& .twap-price":{
    width: '100%',
    marginLeft:'auto',
 

  }
})

const MaxDuration = () => {
  const { onMaxDurationChange } = TWAPLib.actions();
  const {maxDurationMillis, maxDurationFormat} = TWAPLib.state();

  return (
    <Card>
      <Label tooltipText="Some text">Max Duration</Label>
      <TimeSelector millis={maxDurationMillis} timeFormat={maxDurationFormat} onChange={onMaxDurationChange} />
    </Card>
  );
};

const TradeInterval = () => {
  const { onTradeIntervalChange } = TWAPLib.actions();

  return (
    <Card>
      <Label tooltipText="Some text">Trade Interval</Label>
      <TimeSelector onChange={onTradeIntervalChange} />
    </Card>
  );
};

const SubmitButton = () => {
  const warning = TWAPLib.validation().useSubmitButtonValidation();

  return <ActionButton onClick={() => {}}>{warning || "Submit"}</ActionButton>;
};


const TokenDisplay = ({address}:{address: string}) => {
      return (
        <StyledTokenDisplay className="token-display">
          <TokenLogo address={address} />
          <TokenName address={address} />
        </StyledTokenDisplay>
      );
}


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
  cursor:'pointer'
}));

const StyledTokenDisplay = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 10
});



const StyledFlexBetween = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width:'100%'
});

const StyledFlexStart = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  gap: 10,
  width:'100%'
});

const StyledChangeOrder = styled(TWAPLib.components.ChangeTokensOrder)({});



const StyledTokenInput = styled(Box)({
    width:'100%',
    "& .twap-input":{
      textAlign:'end'
    }
})


const StyledColumnGap = styled(Box)(({ gap }: { gap?: number }) => ({
  display: "flex",
  flexDirection: "column",
  gap: gap || 10,
  alignItems:'flex-start',
  width:'100%'
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
