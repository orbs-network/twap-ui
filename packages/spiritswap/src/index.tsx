import { CssBaseline } from "@mui/material";
import { Box } from "@mui/system";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import TWAPLib from "@orbs-network/twap-ui";
import { ThemeProvider } from "@mui/material/styles";
import { AiFillEdit } from "react-icons/ai";
import { IoIosArrowDown } from "react-icons/io";
import { HiOutlineSwitchVertical } from "react-icons/hi";
import { TbArrowsRightLeft } from "react-icons/tb";
import { ReactNode, useContext, useState } from "react";
import { GlobalStyles } from "@mui/material";
import axios from "axios";
import BigNumber from "bignumber.js";
import {
  getTheme,
  globalStyle,
  StyledButton,
  StyledCard,
  StyledChangeOrder,
  StyledColumnGap,
  StyledDstToken,
  StyledFlexBetween,
  StyledFlexStart,
  StyledIcon,
  StyledIntervalTimeSelect,
  StyledLayout,
  StyledLimitPrice,
  StyledMarketPrice,
  StyledMarketPriceRight,
  StyledNumbericInput,
  StyledOrderConfirmation,
  StyledPercentBtn,
  StyledPrice,
  StyledSrcTokenPercentSelector,
  StyledSwitch,
  StyledTokenDisplay,
  StyledTokenOrder,
  StyledTokenPanel,
  StyledTokenSelect,
  StyledTrade,
  StyledTradeInfoModal,
  StyledUSD,
} from "./styles";

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
  const { amountPrefix, usdValueLoading, usdValue, disabled, balanceLoading, balance, value, onSelect, selectedToken, onChange, tokenListOpen, toggleTokenList } =
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
            <StyledNumbericInput prefix={amountPrefix} loading={false} disabled={disabled} placeholder="0" onChange={onChange ? onChange : () => {}} value={value} />
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
  const { srcTokenUsdValue, srcTokenUiAmount, srcTokenInfo, dstTokenUsdValue, dstTokenUiAmount, dstTokenInfo } = TWAPLib.store.useConfirmation();
  const [accepted, setAccepted] = useState(false);
  const { ellipsisAccount, account } = TWAPLib.store.useWeb3();
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
            <Box style={{ display: "flex", gap: 5 }}>
              <SmallLabel>Accept Disclaimer</SmallLabel>
              <Switch value={accepted} onChange={() => setAccepted(!accepted)} />
            </Box>
            <Text className="output-text">
              Output will be sent to <Tooltip text={account}>{ellipsisAccount}</Tooltip>
            </Text>
            <StyledButton onClick={() => {}} disabled={!accepted}>
              Confirm order
            </StyledButton>
          </StyledColumnGap>
        </StyledColumnGap>
      </StyledOrderConfirmation>
    </StyledTradeInfoModal>
  );
};

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
