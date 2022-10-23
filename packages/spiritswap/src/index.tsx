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

// TODO create file for styles

const { USD, Balance, Button, Icon, NumberDisplay, TimeSelector, NumericInput, Card, Label, TokenLogo, TokenName, SmallLabel, Switch, Text, IconButton, Tooltip } =
  TWAPLib.baseComponents;
const LimitPrice = TWAPLib.components.LimitPrice;
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
  mainBackground: "#000315",
  borderColor: "rgb(55, 65, 81)",
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
              <LimitPriceDisplay />
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
      <StyledCard>
        <StyledFlexBetween>
          <Text className="title">Current Market Price</Text>
          {marketPrice ? (
            <StyledMarketPriceRight>
              <Text>1</Text>
              <TokenDisplay logo={leftTokenInfo?.logoUrl} name={leftTokenInfo?.symbol} />
              <Tooltip text={marketPrice.toString()}>
                <Text>
                  = <NumberDisplay value={marketPrice.toString()} />
                </Text>
              </Tooltip>

              <TokenDisplay logo={rightTokenInfo?.logoUrl} name={rightTokenInfo?.symbol} />
              <IconButton onClick={toggleInverted}>
                <StyledIcon icon={<TbArrowsRightLeft />} />
              </IconButton>
            </StyledMarketPriceRight>
          ) : (
            <Label>-</Label>
          )}
        </StyledFlexBetween>
      </StyledCard>
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
  return (
    <TokenPanel isSrcToken={true}>
      <SrcTokenPercentSelector />
    </TokenPanel>
  );
};

const DstTokenPanel = () => {
  // add tilda to amount if market or >= if limit price
  return (
    <StyledDstToken>
      <TokenPanel isSrcToken={false} />
      <MarketPrice />
    </StyledDstToken>
  );
};

const ChangeTokensOrder = () => {
  const onChangeTokenPositions = TWAPLib.store.useChangeTokenPositions();
  return (
    <StyledChangeOrder>
      <IconButton onClick={onChangeTokenPositions}>
        <StyledIcon icon={<HiOutlineSwitchVertical />} />
      </IconButton>
    </StyledChangeOrder>
  );
};

const TradeSize = () => {
  const { srcTokenInfo, srcTokenUiAmount } = TWAPLib.store.useSrcToken();

  const { uiTradeSize, onChange, totalTrades, uiUsdValue, usdValueLoading } = TWAPLib.store.useTradeSize();

  return (
    <StyledTrade>
      <StyledCard>
        <StyledColumnGap>
          <StyledFlexBetween gap={10}>
            <Label tooltipText="Some text">Trade Size</Label>
            <StyledNumbericInput placeholder={"0"} onChange={onChange} value={uiTradeSize} maxValue={srcTokenUiAmount} />
            <TokenDisplay logo={srcTokenInfo?.logoUrl} name={srcTokenInfo?.symbol} />
          </StyledFlexBetween>
          <StyledFlexBetween>
            <SmallLabel>Total trades: {totalTrades}</SmallLabel>
            <StyledUSD value={uiUsdValue} isLoading={usdValueLoading} />
          </StyledFlexBetween>
        </StyledColumnGap>
      </StyledCard>
    </StyledTrade>
  );
};

const LimitPriceDisplay = () => {
  const { isLimitOrder, onToggleLimit } = TWAPLib.store.useLimitPrice();
  const warning = TWAPLib.validation.useLimitPriceToggleValidation();

  return (
    <StyledPrice>
      <StyledCard>
        <StyledColumnGap>
          <StyledFlexStart>
            <Tooltip text={warning}>
              <StyledSwitch disabled={!!warning} value={!isLimitOrder} onChange={onToggleLimit} />
            </Tooltip>
            <Label tooltipText="some text">Limit Price</Label>
          </StyledFlexStart>
          {isLimitOrder && <LimitPrice placeholder="0" />}
        </StyledColumnGap>
      </StyledCard>
    </StyledPrice>
  );
};

const MaxDuration = () => {
  const { onChange } = TWAPLib.store.useMaxDuration();
  const { maxDurationMillis, maxDurationTimeFormat } = TWAPLib.store.useMaxDuration();

  return (
    <StyledCard>
      <StyledFlexBetween gap={10}>
        <Label tooltipText="Some text">Max Duration</Label>
        <TimeSelector millis={maxDurationMillis} selectedTimeFormat={maxDurationTimeFormat} onChange={onChange} />
      </StyledFlexBetween>
    </StyledCard>
  );
};

const TradeInterval = () => {
  const { tradeIntervalMillis, tradeIntervalTimeFormat, customInterval, onChange, onCustomIntervalClick } = TWAPLib.store.useTradeInterval();

  return (
    <StyledCard>
      <StyledFlexBetween gap={10}>
        <Label tooltipText="Some text">Trade Interval</Label>
        <StyledIntervalTimeSelect>
          <Tooltip text={customInterval ? "" : "Some text"}>
            <TimeSelector disabled={!customInterval} onChange={onChange} millis={tradeIntervalMillis} selectedTimeFormat={tradeIntervalTimeFormat} />
          </Tooltip>
        </StyledIntervalTimeSelect>
        {!customInterval && (
          <IconButton tooltip="Some text" onClick={onCustomIntervalClick}>
            <StyledIcon icon={<AiFillEdit />} />
          </IconButton>
        )}
      </StyledFlexBetween>
    </StyledCard>
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
  children?: ReactNode;
  isSrcToken?: boolean;
}

const TokenPanel = ({ children, isSrcToken }: TokenPanelProps) => {
  const { usdValueLoading, usdValue, disabled, balanceLoading, balance, value, onSelect, selectedToken, onChange, tokenListOpen, toggleTokenList } =
    TWAPLib.store.useTokenPanel(isSrcToken);

  const { chain, account } = TWAPLib.store.useWeb3();
  const { TokenSelectModal }: { TokenSelectModal: any } = useContext(TwapContext);

  const onOpen = () => {
    if (chain != null) {
      toggleTokenList(true);
    }
  };

  return (
    <StyledTokenPanel>
      <TokenSelectModal isOpen={tokenListOpen} chainId={chain} selectedTokens={selectedToken} onClose={() => toggleTokenList(false)} onSelect={onSelect} />
      <StyledCard>
        <StyledColumnGap>
          <StyledFlexBetween>
            <StyledNumbericInput loading={false} disabled={disabled} placeholder="0" onChange={onChange ? onChange : () => {}} value={value} />
            <Tooltip text={!account ? "Connect wallet" : undefined}>
              <StyledTokenSelect onClick={onOpen}>
                <TokenDisplay logo={selectedToken?.logoUrl} name={selectedToken?.symbol} />
                <StyledIcon icon={<IoIosArrowDown size={20} />} />
              </StyledTokenSelect>
            </Tooltip>
          </StyledFlexBetween>
          <StyledFlexBetween>
            <StyledUSD value={usdValue} isLoading={usdValueLoading} />
            <Balance isLoading={balanceLoading} value={balance} />
          </StyledFlexBetween>
          {children}
        </StyledColumnGap>
      </StyledCard>
    </StyledTokenPanel>
  );
};

const SubmitButton = () => {
  const { loading, text, onClick, disabled, showConfirmation, closeConfirmation } = TWAPLib.store.useSubmitOrder();

  return (
    <>
      <StyledButton loading={loading} onClick={onClick} disabled={disabled}>
        {text}
      </StyledButton>
      <OrderConfirmation open={showConfirmation} onClose={closeConfirmation} />
    </>
  );
};

const OrderConfirmation = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const { uiUsdValue: srcTokenUsdValue, srcTokenUiAmount, srcTokenInfo } = TWAPLib.store.useSrcToken();
  const { uiUsdValue: dstTokenUsdValue, dstTokenUiAmount, dstTokenInfo } = TWAPLib.store.useDstToken();
  const [accepted, setAccepted] = useState(false);
  const { ellipsisAccount } = TWAPLib.store.useWeb3();
  return (
    <StyledTradeInfoModal open={open} onClose={onClose}>
      <StyledOrderConfirmation>
        <StyledColumnGap gap={20}>
          <StyledColumnGap gap={20}>
            <TokenOrderPreview title="From" amount={srcTokenUiAmount} usdPrice={srcTokenUsdValue} name={srcTokenInfo?.symbol} logo={srcTokenInfo?.logoUrl} />
            <TokenOrderPreview title="To" amount={dstTokenUiAmount} usdPrice={dstTokenUsdValue} name={dstTokenInfo?.symbol} logo={dstTokenInfo?.logoUrl} />
            <OrderConfirmationLimitPrice />
            <TradeInfoDetailsDisplay />
            <TradeDetails />
          </StyledColumnGap>
          <StyledColumnGap gap={20}>
            <StyledDisclaimer>
              <SmallLabel>Accept Disclaimer</SmallLabel>
              <Switch value={accepted} onChange={() => setAccepted(!accepted)} />
            </StyledDisclaimer>
            <Text className="output-text">Output will be sent to {ellipsisAccount}</Text>

            <StyledButton onClick={() => {}} disabled={!accepted}>
              Confirm order
            </StyledButton>
          </StyledColumnGap>
        </StyledColumnGap>
      </StyledOrderConfirmation>
    </StyledTradeInfoModal>
  );
};

const StyledOrderConfirmation = styled(Box)({
  "& .output-text": {
    textAlign: "center",
    width: "100%",
    fontSize: 15,
  },
});

const StyledDisclaimer = styled(Box)({
  display: "flex",
  gap: 5,
});

const TradeDetails = () => {
  return (
    <StyledCard>
      <StyledColumnGap className="trade-info-explanation" gap={20}>
        <TradeInfoExplanation />
      </StyledColumnGap>
    </StyledCard>
  );
};

const TradeInfoDetailsDisplay = () => {
  return (
    <StyledCard>
      <StyledColumnGap gap={10}>
        <TradeInfoDetails />
      </StyledColumnGap>
    </StyledCard>
  );
};

const OrderConfirmationLimitPrice = () => {
  const { isLimitOrder, toggleInverted, uiPrice, leftTokenInfo, rightTokenInfo } = TWAPLib.store.useLimitPrice();

  return (
    <StyledLimitPrice>
      <StyledFlexBetween>
        <Label tooltipText="some text">Limit Price</Label>
        {isLimitOrder ? (
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
      <StyledCard>
        <StyledColumnGap gap={10}>
          <StyledFlexBetween>
            <Label>{title}</Label>
            <StyledUSD value={usdPrice} />
          </StyledFlexBetween>
          <StyledFlexBetween>
            <TokenDisplay name={name} logo={logo} />
            <SmallLabel>
              <NumberDisplay value={amount} />
            </SmallLabel>
          </StyledFlexBetween>
        </StyledColumnGap>
      </StyledCard>
    </StyledTokenOrder>
  );
};

const StyledUSD = styled(USD)({
  opacity: 0.6,
});

const StyledButton = styled(Button)({
  background: colors.submitButton,
  border: `1px solid ${colors.submitButtonBorder}`,
  height: 40,
  borderRadius: 4,
  fontWeight: 500,
  color: "white",
});

const StyledNumbericInput = styled(NumericInput)({
  "& input": {
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
});

const StyledCard = styled(Card)({
  padding: 12,
  background: colors.cardBackground,
  borderRadius: "0.375rem",
});

const StyledIcon = styled(Icon)({
  "& path": {
    color: colors.icon,
  },
  "& line": {
    color: colors.icon,
  },
});

const StyledTradeInfoModal = styled(TradeInfoModal)({
  "& .twap-modal-content": {
    background: colors.mainBackground,
    border: `1px solid ${colors.borderColor}`,
    maxHeight: "85vh",
    overflow: "auto",
    borderRadius: "10px",
    padding: 15,
    paddingTop: 30,
  },
});

// ----------- styles -------------- //

const StyledTokenOrder = styled(Box)({ width: "100%" });

const globalStyle = {
  "*": {
    fontFamily: "inherit",
  },
  a: {
    color: "white",
    fontWeight: 500,
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
  background: colors.borderColor,
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

const StyledSwitch = styled(Switch)({
  "& .MuiSwitch-thumb": {
    background: colors.icon,
  },
  "& .MuiSwitch-track": {
    background: colors.mainBackground,
  },
  "& .Mui-checked+.MuiSwitch-track": {
    background: colors.mainBackground,
  },
});

const StyledLayout = styled(Box)(({ theme }) => ({
  width: "100%",
  "& *": {
    color: colors.text,
    fontFamily: "inherit",
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

  "& .twap-time-selector-list": {
    background: colors.mainBackground,
    border: `1px solid ${colors.borderColor}`,
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
