import { CssBaseline } from "@mui/material";
import { Box, styled } from "@mui/system";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import TWAPLib from "@orbs-network/twap-ui";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { AiFillEdit } from "react-icons/ai";
import { IoIosArrowDown } from "react-icons/io";
import { HiOutlineSwitchVertical } from "react-icons/hi";
import { ReactNode } from "react";
import { GlobalStyles } from "@mui/material";

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

type ColorsScheme = {
  submitButton: string;
  text: string;
  icon: string;
  submitButtonBorder: string;
  cardBackground: string;
  selectTokenFocus: string;
  percentButtonBackground: string;
  mainBackground: string;
};

const colors: ColorsScheme = {
  cardBackground: "#18202F",
  submitButton: "rgb(29, 147, 132)",
  submitButtonBorder: "1px solid rgba(100, 221, 192, 0.15)",
  text: "#ffffff",
  icon: "#60E6C5",
  selectTokenFocus: "#1F2937",
  percentButtonBackground: "rgb(55, 65, 81)",
  mainBackground: "#000315",
};

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

const globalStyle = {
  "& .twap-tooltip": {
    "& .MuiTooltip-tooltip": {
      backgroundColor: colors.mainBackground,
      fontSize: 14,
      fontFamily: "inherit",
    },
  },
};

const TWAP = (props: Props) => {
  TWAPLib.initializer(props.provider);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={getTheme("dark")}>
        <CssBaseline />
        <GlobalStyles styles={globalStyle} />
        <StyledLayout>
          <StyledColumnGap gap={15}>
            <SrcTokenPanel />
            <ChangeTokensOrder />
            <DstTokenPanel />
            <PriceDisplay />
            <TradeSize />
            <MaxDuration />
            <TradeInterval />
            <SubmitButton account={props.account} connect={props.connect} />
          </StyledColumnGap>
        </StyledLayout>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
    </QueryClientProvider>
  );
};

export default TWAP;

const SrcTokenPercentSelector = () => {
  const onClick = (value: number) => {
    console.log(value);
  };

  return (
    <StyledSrcTokenPercentSelector>
      <StyledPercentBtn onClick={() => onClick(25)}>25%</StyledPercentBtn>
      <StyledPercentBtn onClick={() => onClick(50)}>50%</StyledPercentBtn>
      <StyledPercentBtn onClick={() => onClick(75)}>75%</StyledPercentBtn>
      <StyledPercentBtn onClick={() => onClick(100)}>Max</StyledPercentBtn>
    </StyledSrcTokenPercentSelector>
  );
};

const SrcTokenPanel = () => {
  const { onChange, srcTokenAddress, srcTokenUiAmount, usdValueLoading, uiUsdValue, uiBalance, balanceLoading } = TWAPLib.store.useSrcToken();
  console.log({ uiBalance });

  return (
    <TokenPanel
      usdValue={uiUsdValue}
      usdValueLoading={usdValueLoading}
      value={srcTokenUiAmount}
      address={srcTokenAddress}
      onChange={onChange}
      balance={uiBalance}
      balanceLoading={balanceLoading}
    >
      <SrcTokenPercentSelector />
    </TokenPanel>
  );
};

const DstTokenPanel = () => {
  const { dstTokenAddress, dstTokenUiAmount, isLoading, uiUsdValue, usdValueLoading, uiBalance, balanceLoading } = TWAPLib.store.useDstToken();

  return (
    <TokenPanel
      usdValueLoading={usdValueLoading}
      usdValue={uiUsdValue}
      disabled={true}
      value={dstTokenUiAmount}
      address={dstTokenAddress}
      isLoading={isLoading}
      balance={uiBalance}
      balanceLoading={balanceLoading}
    />
  );
};

const ChangeTokensOrder = () => {
  const onChangeTokenPositions = TWAPLib.store.useChangeTokenPositions();
  return (
    <StyledChangeOrder>
      <IconButton onClick={onChangeTokenPositions}>
        <HiOutlineSwitchVertical className="icon" />
      </IconButton>
    </StyledChangeOrder>
  );
};

const TradeSize = () => {
  const { srcTokenAddress } = TWAPLib.store.useSrcToken();

  const { uiTradeSize, onChange, totalTrades, uiUsdValue, usdValueLoading } = TWAPLib.store.useTradeSize();

  return (
    <StyledTrade>
      <Card>
        <StyledColumnGap>
          <StyledFlexBetween gap={10}>
            <Label tooltipText="Some text">Trade Size</Label>
            <NumericInput placeholder={"0"} onChange={onChange} value={uiTradeSize} />
            <TokenName address={srcTokenAddress} />
          </StyledFlexBetween>
          <StyledFlexBetween>
            <SmallLabel>Total trades: {totalTrades}</SmallLabel>
            <SmallLabel loading={usdValueLoading} style={{ opacity: 0.6 }}>
              ${uiUsdValue}
            </SmallLabel>
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
    paddingRight: 10,
  },
});

const PriceDisplay = () => {
  const { showPrice, togglePrice } = TWAPLib.store.usePrice();

  return (
    <StyledPrice>
      <Card>
        <StyledColumnGap>
          <StyledFlexStart>
            <Tooltip text="Some text">
              <Switch value={!showPrice} onChange={() => togglePrice(!showPrice)} />
            </Tooltip>
            <Label tooltipText="some text">Limit Price</Label>
          </StyledFlexStart>
          {showPrice && <Price placeholder="0" />}
        </StyledColumnGap>
      </Card>
    </StyledPrice>
  );
};

const StyledPrice = styled(Box)(({ theme }) => ({
  width: "100%",
  "& .twap-price": {
    background: colors.mainBackground,
    padding: 10,
    borderRadius: 10,
    gap: 10,
  },
  "& .twap-price-icon * ": {
    color: colors.icon,
  },
  "& .twap-input": {
    textAlign: "center",
  },
}));

const MaxDuration = () => {
  const { onChange } = TWAPLib.store.useMaxDuration();
  const { maxDurationMillis, maxDurationTimeFormat } = TWAPLib.store.useMaxDuration();

  return (
    <Card>
      <StyledFlexBetween gap={10}>
        <Label tooltipText="Some text">Max Duration</Label>
        <TimeSelector millis={maxDurationMillis} selectedTimeFormat={maxDurationTimeFormat} onChange={onChange} />
      </StyledFlexBetween>
    </Card>
  );
};

const TradeInterval = () => {
  const { onChange } = TWAPLib.store.useTradeInterval();
  const { tradeIntervalMillis, tradeIntervalTimeFormat, customInterval } = TWAPLib.store.useTradeInterval();
  const { onCustomIntervalClick } = TWAPLib.store.useTradeInterval();

  return (
    <Card>
      <StyledFlexBetween gap={10}>
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
      </StyledFlexBetween>
    </Card>
  );
};

const SubmitButton = ({ account, connect }: { account?: string | null; connect: () => void }) => {
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

interface TokenPanelProps {
  value?: string;
  onChange?: (value: string) => void;
  address?: string;
  balance?: string;
  children?: ReactNode;
  disabled?: boolean;
  isLoading?: boolean;
  usdValue?: string;
  usdValueLoading?: boolean;
  balanceLoading?: boolean;
}

const TokenPanel = ({
  value,
  onChange,
  address,
  balance = "",
  balanceLoading = false,
  children,
  disabled = false,
  isLoading = false,
  usdValue = "0",
  usdValueLoading = false,
}: TokenPanelProps) => {
  return (
    <StyledTokenPanel>
      <Card>
        <StyledColumnGap>
          <StyledFlexBetween>
            <NumericInput loading={isLoading} disabled={disabled} placeholder="0" onChange={onChange ? onChange : () => {}} value={value} />
            <StyledTokenSelect onClick={() => {}}>
              <TokenDisplay address={address} />
              <IoIosArrowDown style={{ fill: colors.icon }} size={20} />
            </StyledTokenSelect>
          </StyledFlexBetween>
          <StyledFlexBetween>
            <SmallLabel loading={usdValueLoading} style={{ opacity: 0.6 }}>
              ~ ${usdValue}
            </SmallLabel>
            <SmallLabel loading={balanceLoading}>Balance: {balance} </SmallLabel>
          </StyledFlexBetween>
          {children}
        </StyledColumnGap>
      </Card>
    </StyledTokenPanel>
  );
};

// ----------- styles -------------- //

const StyledSrcTokenPercentSelector = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 5,
  width: "100%",
});

const StyledPercentBtn = styled("button")({
  background: colors.percentButtonBackground,
  height: 22,
  width: "25%",
  border: "unset",
  borderRadius: 4,
  cursor: "pointer",
  transition: "0.2s all",
  "&:hover": {
    background: "rgba(100, 221, 192, 0.15)",
    color: "rgb(96, 230, 197)",
  },
});

const StyledIntervalTimeSelect = styled(Box)({
  flex: 1,
});
const StyledTokenSelect = styled("button")(({ theme }) => ({
  background: "transparent",
  border: "unset",
  padding: "6px",
  borderRadius: 2,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: 5,
  marginLeft: 10,

  "&:hover": {
    background: colors.selectTokenFocus,
  },
}));

const StyledTokenDisplay = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 6,
});

const StyledFlexBetween = styled(Box)(({ gap = 0 }: { gap?: number }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  gap,
}));

const StyledFlexStart = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  gap: 10,
  width: "100%",
});

const StyledChangeOrder = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  "& .icon *": {
    color: colors.icon,
  },
}));

const StyledTokenPanel = styled(Box)({
  width: "100%",
  "& .twap-input": {
    textAlign: "left",
  },
  "& .twap-token-name": {
    fontSize: 22,
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
    color: colors.text,
    fontFamily: "inherit",
  },

  "& .twap-card": {
    padding: 12,
    background: colors.cardBackground,
    borderRadius: "0.375rem",
  },

  "& .twap-small-label": {
    fontSize: 14,
    opacity: 1,
  },
  "& .twap-change-order": {
    width: 50,
    height: 50,
  },
  "& .twap-token-name": {
    fontSize: 18,
  },
  "& .twap-token-logo": {
    width: 28,
    height: 28,
  },
  "& .twap-input": {
    color: colors.text,
    fontSize: 24,
    fontWeight: 400,
    textAlign: "right",
    outline: "1px solid transparent",
    borderRadius: "0.375rem",
    height: 40,
    transition: "0.2s all",
    "&:focus": {
      outline: "1px solid #1D9391",
    },
    "&::placeholder": {
      color: "white",
    },
  },
  "& .twap-action-button": {
    background: colors.submitButton,
    border: `1px solid ${colors.submitButtonBorder}`,
    height: 40,
    borderRadius: 4,
    fontWeight: 500,
    "&:hover": {
      opacity: 0.8,
    },
  },
  "& .twap-time-selector-list": {
    background: colors.mainBackground,
    border: "1px solid rgb(55, 65, 81)",
    right: 0,
    "& .twap-time-selector-list-item": {
      "&:hover": {
        background: "rgba(255,255,255, 0.05)",
      },
    },
    "& .twap-time-selector-list-item-selected": {
      background: "rgba(255,255,255, 0.05)",
    },
  },
  "& .twap-switch": {
    "& .MuiSwitch-thumb": {
      background: colors.icon,
    },
    "& .MuiSwitch-track": {
      background: colors.mainBackground,
    },
    "& .Mui-checked+.MuiSwitch-track": {
      background: colors.mainBackground,
    },
  },
}));

// ------------- theme --------------- //
const lightTheme = createTheme({
  palette: {
    mode: "light",
  },
});

const darkTheme = createTheme({
  palette: {
    mode: "dark",
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
