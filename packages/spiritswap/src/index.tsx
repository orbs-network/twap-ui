import { CssBaseline } from "@mui/material";
import { Box, styled } from "@mui/system";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import TWAPLib from "@orbs-network/twap-ui";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { AiFillEdit } from "react-icons/ai";
import { IoIosArrowDown } from "react-icons/io";
import { HiOutlineSwitchVertical } from "react-icons/hi";
import { TbArrowsRightLeft } from "react-icons/tb";
import { ReactNode, useContext, useState } from "react";
import { GlobalStyles } from "@mui/material";
import axios from "axios";
import BigNumber from "bignumber.js";

const NumericInput = TWAPLib.baseComponents.NumericInput;
const Card = TWAPLib.baseComponents.Card;
const Label = TWAPLib.baseComponents.Label;
const TokenLogo = TWAPLib.baseComponents.TokenLogo;
const TokenName = TWAPLib.baseComponents.TokenName;
const SmallLabel = TWAPLib.baseComponents.SmallLabel;
const Switch = TWAPLib.baseComponents.Switch;
const Price = TWAPLib.components.Price;
const TimeSelector = TWAPLib.baseComponents.TimeSelector;
const SubmitTwap = TWAPLib.components.SubmitTwap;
const Tooltip = TWAPLib.baseComponents.Tooltip;
const IconButton = TWAPLib.baseComponents.IconButton;
const Text = TWAPLib.baseComponents.Text;
const NumberDisplay = TWAPLib.baseComponents.NumberDisplay;
const TwapContext = TWAPLib.TwapContext;
const TwapProvider = TWAPLib.TwapProvider;
const TradeInfoModal = TWAPLib.components.TradeInfoModal;
const TradeInfoDetails = TWAPLib.components.TradeInfoDetails;
const PriceToggle = TWAPLib.baseComponents.PriceToggle;
const TradeInfoExplanation = TWAPLib.components.TradeInfoExplanation;

const dappIntegrationChainId = 250;

const getUsdPrice = async (srcToken: string, srcDecimals: number): Promise<BigNumber> => {
  const amount = BigNumber(10).pow(srcDecimals);

  const result = await axios.get(
    `https://apiv5.paraswap.io/prices/?srcToken=${srcToken}&destToken=0x04068DA6C83AFCFA0e13ba15A6696662335D5B75&srcDecimals=${srcDecimals}&destDecimals=8&amount=${amount}&side=SELL&network=${dappIntegrationChainId}`
  );

  return BigNumber(result.data.priceRoute.destUSD);
};

const colors = {
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

const TWAP = (props: { provider: any; connect: () => void; TokenSelectModal: any }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <TwapProvider
        getUsdPrice={getUsdPrice}
        dappIntegration="spiritswap"
        provider={props.provider}
        connect={props.connect}
        integrationChainId={dappIntegrationChainId}
        TokenSelectModal={props.TokenSelectModal}
      >
        <ThemeProvider theme={getTheme("dark")}>
          <CssBaseline />
          <GlobalStyles styles={globalStyle} />

          <StyledLayout>
            <StyledColumnGap gap={10}>
              <SrcTokenPanel />
              <ChangeTokensOrder />
              <DstTokenPanel />
              <PriceDisplay />
              <TradeSize />
              <MaxDuration />
              <TradeInterval />
              <SubmitButton />
            </StyledColumnGap>
          </StyledLayout>
        </ThemeProvider>
      </TwapProvider>
      <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
    </QueryClientProvider>
  );
};

export default TWAP;

const MarketPrice = () => {
  const { marketPrice, toggleInverted, leftTokenInfo, rightTokenInfo } = TWAPLib.store.useMarketPrice();

  return (
    <StyledMarketPrice>
      <Card>
        <StyledFlexBetween>
          <Text className="title">Current Market Price</Text>
          {marketPrice ? (
            <StyledMarketPriceRight>
              <Text>1</Text>
              <TokenDisplay logo={leftTokenInfo?.logoUrl} name={leftTokenInfo?.symbol} />
              <Tooltip text={marketPrice.toString()}>
                <Text>= {marketPrice.toFixed(4)}</Text>
              </Tooltip>

              <TokenDisplay logo={rightTokenInfo?.logoUrl} name={rightTokenInfo?.symbol} />
              <IconButton onClick={toggleInverted}>
                <TbArrowsRightLeft className="icon" />
              </IconButton>
            </StyledMarketPriceRight>
          ) : (
            <Label>-</Label>
          )}
        </StyledFlexBetween>
      </Card>
    </StyledMarketPrice>
  );
};

const SrcTokenPercentSelector = () => {
  const { onChangePercent } = TWAPLib.store.useSrcToken();

  const onClick = (value: number) => {
    onChangePercent(value);
  };

  return (
    <StyledSrcTokenPercentSelector>
      <StyledPercentBtn onClick={() => onClick(0.25)}>25%</StyledPercentBtn>
      <StyledPercentBtn onClick={() => onClick(0.5)}>50%</StyledPercentBtn>
      <StyledPercentBtn onClick={() => onClick(0.75)}>75%</StyledPercentBtn>
      <StyledPercentBtn onClick={() => onClick(1)}>Max</StyledPercentBtn>
    </StyledSrcTokenPercentSelector>
  );
};

const SrcTokenPanel = () => {
  const { onChange, srcTokenInfo, srcTokenUiAmount, usdValueLoading, uiUsdValue, uiBalance, balanceLoading, onSrcTokenSelect } = TWAPLib.store.useSrcToken();
  const { TokenSelectModal } = useContext(TwapContext);

  return (
    <TokenPanel
      TokenSelectModal={TokenSelectModal}
      usdValue={uiUsdValue}
      usdValueLoading={usdValueLoading}
      value={srcTokenUiAmount}
      onChange={onChange}
      balance={uiBalance}
      balanceLoading={balanceLoading}
      selectedToken={srcTokenInfo}
      onSelect={onSrcTokenSelect}
    >
      <SrcTokenPercentSelector />
    </TokenPanel>
  );
};

const DstTokenPanel = () => {
  const { dstTokenUiAmount, uiUsdValue, usdValueLoading, uiBalance, balanceLoading, dstTokenInfo, onDstTokenSelect } = TWAPLib.store.useDstToken();
  const { TokenSelectModal } = useContext(TwapContext);

  return (
    <StyledDstToken>
      <TokenPanel
        TokenSelectModal={TokenSelectModal}
        usdValueLoading={usdValueLoading}
        usdValue={uiUsdValue}
        disabled={true}
        value={dstTokenUiAmount}
        selectedToken={dstTokenInfo}
        isLoading={false}
        balance={uiBalance}
        balanceLoading={balanceLoading}
        onSelect={onDstTokenSelect}
      />
      <MarketPrice />
    </StyledDstToken>
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
  const { srcTokenInfo } = TWAPLib.store.useSrcToken();

  const { uiTradeSize, onChange, totalTrades, uiUsdValue, usdValueLoading } = TWAPLib.store.useTradeSize();

  return (
    <StyledTrade>
      <Card>
        <StyledColumnGap>
          <StyledFlexBetween gap={10}>
            <Label tooltipText="Some text">Trade Size</Label>
            <NumericInput placeholder={"0"} onChange={onChange} value={uiTradeSize} />
            <TokenDisplay logo={srcTokenInfo?.logoUrl} name={srcTokenInfo?.symbol} />
          </StyledFlexBetween>
          <StyledFlexBetween>
            <SmallLabel>Total trades: {totalTrades}</SmallLabel>
            <Usd isLoading={usdValueLoading} value={uiUsdValue} />
          </StyledFlexBetween>
        </StyledColumnGap>
      </Card>
    </StyledTrade>
  );
};

const PriceDisplay = () => {
  const { showLimit, onToggleLimit } = TWAPLib.store.useLimitPrice();

  return (
    <StyledPrice>
      <Card>
        <StyledColumnGap>
          <StyledFlexStart>
            <Tooltip text="Some text">
              <Switch value={!showLimit} onChange={() => onToggleLimit()} />
            </Tooltip>
            <Label tooltipText="some text">Limit Price</Label>
          </StyledFlexStart>
          {showLimit && <Price placeholder="0" />}
        </StyledColumnGap>
      </Card>
    </StyledPrice>
  );
};

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

const TokenDisplay = ({ logo, name }: { logo?: string; name?: string }) => {
  return (
    <StyledTokenDisplay className="token-display">
      <TokenLogo logo={logo} />
      <TokenName name={name} />
    </StyledTokenDisplay>
  );
};

interface TokenPanelProps {
  value?: string;
  onChange?: (value: string) => void;
  balance?: string;
  children?: ReactNode;
  disabled?: boolean;
  isLoading?: boolean;
  usdValue?: number | string;
  usdValueLoading?: boolean;
  balanceLoading?: boolean;
  TokenSelectModal: any;
  onSelect: (token: any) => void;
  selectedToken?: any;
}

const TokenPanel = ({
  selectedToken,
  TokenSelectModal,
  value,
  onChange,
  balance = "",
  balanceLoading = false,
  children,
  disabled = false,
  isLoading = false,
  usdValue = 0,
  usdValueLoading = false,
  onSelect,
}: TokenPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { chain, account } = TWAPLib.store.useWeb3();

  const onSelectClick = (token: any) => {
    setIsOpen(false);
    onSelect(token);
  };

  const onOpen = () => {
    if (chain != null) {
      setIsOpen(true);
    }
  };

  return (
    <StyledTokenPanel>
      <TokenSelectModal isOpen={isOpen} chainId={chain} selectedTokens={selectedToken} onClose={() => setIsOpen(false)} onSelect={onSelectClick} />
      <Card>
        <StyledColumnGap>
          <StyledFlexBetween>
            <NumericInput loading={isLoading} disabled={disabled} placeholder="0" onChange={onChange ? onChange : () => {}} value={value} />
            <Tooltip text={!account ? "Connect wallet" : undefined}>
              <StyledTokenSelect onClick={onOpen}>
                <TokenDisplay logo={selectedToken?.logoUrl} name={selectedToken?.symbol} />
                <IoIosArrowDown style={{ fill: colors.icon }} size={20} />
              </StyledTokenSelect>
            </Tooltip>
          </StyledFlexBetween>
          <StyledFlexBetween>
            <Usd isLoading={usdValueLoading} value={usdValue} />
            <SmallLabel loading={balanceLoading}>
              Balance: <NumberDisplay value={balance} />
            </SmallLabel>
          </StyledFlexBetween>
          {children}
        </StyledColumnGap>
      </Card>
    </StyledTokenPanel>
  );
};

const Usd = ({ isLoading = false, value }: { isLoading?: boolean; value?: string | number }) => {
  return (
    <SmallLabel loading={isLoading} style={{ opacity: 0.6 }}>
      ~$
      {value ? <NumberDisplay value={value} /> : "0"}
    </SmallLabel>
  );
};

const SubmitButton = () => {
  const [open, seOpen] = useState(false);
  return (
    <>
      <SubmitTwap onSubmit={() => seOpen(true)} />
      <SubmitOrderConfirmation open={open} onClose={() => seOpen(false)} />
    </>
  );
};

const SubmitOrderConfirmation = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const { uiUsdValue: srcTokenUsdValue, srcTokenUiAmount, srcTokenInfo } = TWAPLib.store.useSrcToken();
  const { uiUsdValue: dstTokenUsdValue, dstTokenUiAmount, dstTokenInfo } = TWAPLib.store.useDstToken();
  return (
    <TradeInfoModal open={open} onClose={onClose}>
      <StyledColumnGap gap={20}>
        <TokenOrderPreview title="From" amount={srcTokenUiAmount} usdPrice={srcTokenUsdValue} name={srcTokenInfo?.symbol} logo={srcTokenInfo?.logoUrl} />
        <TokenOrderPreview title="To" amount={dstTokenUiAmount} usdPrice={dstTokenUsdValue} name={dstTokenInfo?.symbol} logo={dstTokenInfo?.logoUrl} />
        <LimitPrice />
        <TradeInfoDetailsDisplay />
        <TradeDetails />
      </StyledColumnGap>
    </TradeInfoModal>
  );
};

const TradeDetails = () => {
  return (
    <Card>
      <StyledColumnGap className="trade-info-explanation" gap={20}>
        <TradeInfoExplanation />
      </StyledColumnGap>
    </Card>
  );
};

const TradeInfoDetailsDisplay = () => {
  return (
    <Card>
      <StyledColumnGap gap={10}>
        <TradeInfoDetails />
      </StyledColumnGap>
    </Card>
  );
};

const StyledTradeInfoDetails = styled(Box)({});

const LimitPrice = () => {
  const { showLimit, toggleInverted, uiPrice, leftTokenInfo, rightTokenInfo } = TWAPLib.store.useLimitPrice();

  return (
    <StyledLimitPrice>
      <StyledFlexBetween>
        <Label tooltipText="some text">Limit Price</Label>
        {showLimit ? (
          <div className="right">
            <Text>1</Text> <TokenDisplay logo={leftTokenInfo?.logoUrl} name={leftTokenInfo?.symbol} /> <Text>=</Text>
            <Tooltip text={uiPrice}>
              <Text>
                <NumberDisplay value={uiPrice || "0"} />
              </Text>
            </Tooltip>
            <TokenDisplay logo={rightTokenInfo?.logoUrl} name={rightTokenInfo?.symbol} />
            <PriceToggle onClick={toggleInverted} />
          </div>
        ) : (
          <Text>NONE</Text>
        )}
      </StyledFlexBetween>
    </StyledLimitPrice>
  );
};

const StyledOrderDetails = styled(Box)({});

const StyledLimitPrice = styled(Box)({
  width: "100%",
  "& .right": {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  "& .twap-token-logo": {
    width: 22,
    height: 22,
  },
});

const TokenOrderPreview = ({ title, logo, name, usdPrice, amount }: { title: string; logo?: string; name?: string; usdPrice?: string; amount?: string }) => {
  return (
    <StyledTokenOrder>
      <Card>
        <StyledColumnGap gap={10}>
          <StyledFlexBetween>
            <Label>{title}</Label>
            <Usd value={usdPrice} />
          </StyledFlexBetween>
          <StyledFlexBetween>
            <TokenDisplay name={name} logo={logo} />
            <SmallLabel>
              <NumberDisplay value={amount} />
            </SmallLabel>
          </StyledFlexBetween>
        </StyledColumnGap>
      </Card>
    </StyledTokenOrder>
  );
};

// ----------- styles -------------- //

const StyledTokenOrder = styled(Box)({ width: "100%" });

const globalStyle = {
  "& .twap-card": {
    padding: 12,
    background: colors.cardBackground,
    borderRadius: "0.375rem",
  },
  "& .twap-trade-info-modal": {
    "& .twap-modal-content": {
      background: colors.mainBackground,
      maxHeight: "85vh",
      overflow: "auto",
    },
  },
  "& .twap-tooltip": {
    "& .MuiTooltip-tooltip": {
      backgroundColor: colors.mainBackground,
      fontSize: 14,
      fontFamily: "inherit",
    },
  },
};

const StyledTrade = styled(Box)({
  width: "100%",
  "& .twap-input": {
    textAlign: "right",
    paddingRight: 10,
  },
});

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

const StyledDstToken = styled(Box)({
  width: "100%",
});

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
  "& .icon *": {
    color: colors.icon,
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
  "& .twap-submit-button": {
    background: colors.submitButton,
    border: `1px solid ${colors.submitButtonBorder}`,
    height: 40,
    borderRadius: 4,
    fontWeight: 500,
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

const StyledMarketPrice = styled(Box)({
  "& .twap-card": {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    background: "rgba(24, 32, 47, 0.5)",
    paddingBottom: 5,
  },
  "& .title": {
    fontSize: 13,
    opacity: 0.8,
  },
});

const StyledMarketPriceRight = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 5,
  "& .twap-token-logo": {
    order: 2,
    width: 20,
    height: 20,
  },
  "& .twap-token-name": {
    order: 1,
    fontSize: 14,
  },
  "& .twap-text": {
    fontSize: 14,
  },
  "& .icon": {
    width: 20,
    height: 20,
  },
});

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
