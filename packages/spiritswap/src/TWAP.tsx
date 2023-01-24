import { GlobalStyles } from "@mui/material";
import { Box } from "@mui/system";
import { Components, hooks, Translations, TwapAdapter, useTwapContext, Styles as TwapStyles, store, StateComponents } from "@orbs-network/twap-ui";
import { IoIosArrowDown } from "react-icons/io";
import { memo, ReactNode, useCallback, useState } from "react";
import * as AdapterStyles from "./styles";
import { Configs, TokenData } from "@orbs-network/twap";
import {
  AdapterContextProvider,
  parseToken,
  useAdapterContext,
  useGetProvider,
  useGlobalStyles,
  useParseTokenList,
  usePrepareAdapterContextProps,
  useSetTokensFromDapp,
} from "./hooks";
import translations from "./i18n/en.json";
import { SpiritSwapTWAPProps } from ".";

const TWAP = (props: SpiritSwapTWAPProps) => {
  const { getTokenImageUrl, dappTokens } = props;
  const tokenList = useParseTokenList(getTokenImageUrl, dappTokens);
  useSetTokensFromDapp(props.srcToken, props.dstToken, props.account ? tokenList : undefined);
  const provider = useGetProvider(props.getProvider, props.account);
  const adapterContextProps = usePrepareAdapterContextProps(props);
  const globalStyles = useGlobalStyles();

  const connect = useCallback(() => {
    props.connect();
  }, []);

  return (
    <TwapAdapter
      connect={connect}
      config={Configs.SpiritSwap}
      maxFeePerGas={props.maxFeePerGas}
      priorityFeePerGas={props.priorityFeePerGas}
      translations={translations as Translations}
      provider={provider}
      account={props.account}
    >
      <GlobalStyles styles={globalStyles} />
      <AdapterContextProvider value={adapterContextProps}>
        <div className="twap-container">
          <TokenPanel isSrcToken={true} />
          <StateComponents.ChangeTokensOrder />
          <TokenPanel />
          <LimitPrice />
          <TradeSize />
          <MaxDuration />
          <TradeInterval />
          <SubmitButton />
          <OrderSummary />
          <Components.PoweredBy />
        </div>
      </AdapterContextProvider>
    </TwapAdapter>
  );
};

export default memo(TWAP);



const SrcTokenPercentSelector = () => {
  const { onPercentClick } = hooks.useCustomActions();
  const translations = useTwapContext().translations;

  const onClick = (value: number) => {
    onPercentClick(value);
  };

  return (
    <AdapterStyles.StyledPercentSelector>
      <button className="twap-percent-button" onClick={() => onClick(0.25)}>
        25%
      </button>
      <button className="twap-percent-button" onClick={() => onClick(0.5)}>
        50%
      </button>
      <button className="twap-percent-button" onClick={() => onClick(0.75)}>
        75%
      </button>
      <button className="twap-percent-button" onClick={() => onClick(1)}>
        {translations.max}
      </button>
    </AdapterStyles.StyledPercentSelector>
  );
};


const TradeSize = () => {
  return (
    <Components.Card className="twap-trade-size">
      <TwapStyles.StyledColumnFlex gap={5}>
        <TwapStyles.StyledRowFlex gap={15} justifyContent="space-between" style={{ minHeight: 40 }}>
          <StateComponents.TotalTradesLabel />
          <StateComponents.ChunksSliderSelect />
          <StateComponents.ChunksInput />
        </TwapStyles.StyledRowFlex>
        <TwapStyles.StyledRowFlex className="twap-chunks-size" justifyContent="space-between">
          <TwapStyles.StyledRowFlex justifyContent="flex-start" width="fit-content">
            <TwapStyles.StyledRowFlex>
              <StateComponents.ChunksAmountLabel />
              <StateComponents.ChunksAmount />
            </TwapStyles.StyledRowFlex>
            <StateComponents.TokenLogoAndSymbol isSrc={true} />
          </TwapStyles.StyledRowFlex>
          <StateComponents.ChunksUSD />
        </TwapStyles.StyledRowFlex>
      </TwapStyles.StyledColumnFlex>
    </Components.Card>
  );
};

const LimitPrice = () => {
  return (
    <Components.Card className="twap-limit-price">
      <TwapStyles.StyledColumnFlex>
        <TwapStyles.StyledRowFlex justifyContent="space-between">
          <StateComponents.LimitPriceLabel />
          <StateComponents.LimitPriceToggle />
        </TwapStyles.StyledRowFlex>
        <StateComponents.LimitPriceInput placeholder="0" />
      </TwapStyles.StyledColumnFlex>
    </Components.Card>
  );
};

const MaxDuration = () => {
  return (
    <Components.Card>
      <TwapStyles.StyledRowFlex gap={10} justifyContent="space-between">
        <StateComponents.MaxDurationLabel />
        <StateComponents.PartialFillWarning />
        <StateComponents.MaxDurationSelector />
      </TwapStyles.StyledRowFlex>
    </Components.Card>
  );
};

const TradeInterval = () => {
  return (
    <Components.Card>
      <TwapStyles.StyledRowFlex>
        <StateComponents.TradeIntervalLabel />
        <StateComponents.FillDelayWarning />
        <TwapStyles.StyledRowFlex style={{ flex: 1 }}>
          <StateComponents.TradeIntervalSelector />
        </TwapStyles.StyledRowFlex>
      </TwapStyles.StyledRowFlex>
    </Components.Card>
  );
};

const TokenDisplay = ({ logo, name }: { logo?: string; name?: string }) => {
  return (
    <AdapterStyles.StyledTokenDisplay className="token-display">
      <Components.TokenLogo logo={logo} />
      <Components.TokenName name={name} />
    </AdapterStyles.StyledTokenDisplay>
  );
};

const TokenPanel = ({ isSrcToken }: { isSrcToken?: boolean }) => {
  const [tokenListOpen, setTokenListOpen] = useState(false);
  const { TokenSelectModal, onSrcTokenSelected, onDstTokenSelected, getTokenImageUrl } = useAdapterContext();
  const translations = useTwapContext().translations;
  const marketPrice = hooks.useMarketPrice().marketPrice;

  const onClose = useCallback(() => {
    setTokenListOpen(false);
  }, []);

  return (
    <>
      <StateComponents.TokenSelectModal
        Modal={TokenSelectModal}
        onSrcSelect={onSrcTokenSelected}
        onDstSelect={onDstTokenSelected}
        isOpen={tokenListOpen}
        onClose={onClose}
        isSrc={isSrcToken}
        parseToken={(token) => parseToken(token, getTokenImageUrl)}
      />
      <TwapStyles.StyledColumnFlex gap={4} className="twap-token-panel">
        <TwapStyles.StyledRowFlex justifyContent="space-between">
          <Components.SmallLabel className="twap-panel-title">{isSrcToken ? translations.from : `${translations.to} (${translations.estimated})`}</Components.SmallLabel>
        </TwapStyles.StyledRowFlex>
        <Components.Card>
          <TwapStyles.StyledColumnFlex gap={15}>
            <TwapStyles.StyledRowFlex justifyContent="space-between">
              <StateComponents.TokenInput isSrc={isSrcToken} />
              <StateComponents.TokenSelect isSrc={isSrcToken} onClick={() => setTokenListOpen(true)} />
            </TwapStyles.StyledRowFlex>
            <TwapStyles.StyledRowFlex justifyContent="space-between">
              <TwapStyles.StyledOverflowContainer>
                <StateComponents.TokenUSD isSrc={isSrcToken} />
              </TwapStyles.StyledOverflowContainer>
              <StateComponents.TokenBalance isSrc={isSrcToken} />
            </TwapStyles.StyledRowFlex>
            {isSrcToken && <SrcTokenPercentSelector />}
          </TwapStyles.StyledColumnFlex>
        </Components.Card>
        {!isSrcToken && <StateComponents.MarketPrice />}
      </TwapStyles.StyledColumnFlex>
    </>
  );
};


const SubmitButton = () => {
  const { loading, text, onClick, disabled } = hooks.useSubmitButton();
  return (
    <Components.Button loading={loading} onClick={onClick || (() => {})} disabled={disabled}>
      {text}
    </Components.Button>
  );
};

const OrderSummary = () => {
  const twapStore = store.useTwapStore();
  const translations = useTwapContext().translations;
  const minimumDelayMinutes = store.useTwapStore((state) => state.getMinimumDelayMinutes());

  return (
    <>
      <Components.Modal open={twapStore.showConfirmation} onClose={() => twapStore.setShowConfirmation(false)}>
        <AdapterStyles.StyledOrderConfirmation className="twap-order-summary">
          <TwapStyles.StyledColumnFlex gap={15}>
            <TwapStyles.StyledColumnFlex gap={15}>
              <Components.Card>
                <StateComponents.OrderSummaryTokenDisplay isSrc={true} />
              </Components.Card>
              <Components.Card>
                <StateComponents.OrderSummaryTokenDisplay />
              </Components.Card>
              <OrderConfirmationLimitPrice />

              <Components.Card className="twap-order-summary-rows">
                <TwapStyles.StyledColumnFlex gap={12}>
                  <SummaryRow tooltip={translations.confirmationDeadlineTooltip} label={translations.expiration}>
                    <AdapterStyles.Text>{twapStore.getDeadlineUi()}</AdapterStyles.Text>
                  </SummaryRow>
                  <SummaryRow tooltip={translations.confirmationOrderType} label={translations.orderType}>
                    <AdapterStyles.Text>{twapStore.isLimitOrder ? translations.limitOrder : translations.marketOrder}</AdapterStyles.Text>
                  </SummaryRow>
                  <SummaryRow tooltip={translations.confirmationTradeSizeTooltip} label={translations.tradeSize}>
                    <TwapStyles.StyledRowFlex justifyContent="flex-end">
                      <Components.TokenName name={twapStore.srcToken?.symbol} />
                      <Components.TokenLogo logo={twapStore.srcToken?.logoUrl} />
                      <AdapterStyles.Text>
                        <Components.NumberDisplay value={twapStore.getSrcChunkAmountUi()} />
                      </AdapterStyles.Text>
                    </TwapStyles.StyledRowFlex>
                  </SummaryRow>
                  <SummaryRow tooltip={translations.confirmationTotalTradesTooltip} label={translations.totalTrades}>
                    <AdapterStyles.Text>{twapStore.getChunks()}</AdapterStyles.Text>
                  </SummaryRow>
                  <SummaryRow tooltip={translations.confirmationtradeIntervalTooltip.replace("{{minutes}}", minimumDelayMinutes.toString())} label={translations.tradeInterval}>
                    <AdapterStyles.Text>{twapStore.getFillDelayText(translations)}</AdapterStyles.Text>
                  </SummaryRow>
                  <SummaryRow
                    tooltip={twapStore.isLimitOrder ? translations.confirmationMinDstAmountTootipLimit : translations.confirmationMinDstAmountTootipMarket}
                    label={`${translations.minReceivedPerTrade}:`}
                  >
                    <TwapStyles.StyledRowFlex justifyContent="flex-end">
                      <Components.TokenName name={twapStore.dstToken?.symbol} />
                      <Components.TokenLogo logo={twapStore.dstToken?.logoUrl} />
                      <AdapterStyles.Text>{twapStore.isLimitOrder ? <Components.NumberDisplay value={twapStore.getDstMinAmountOutUi()} /> : translations.none}</AdapterStyles.Text>
                    </TwapStyles.StyledRowFlex>
                  </SummaryRow>
                </TwapStyles.StyledColumnFlex>
              </Components.Card>
              <TradeInfoDetailsDisplay />
            </TwapStyles.StyledColumnFlex>
            <Components.Card>
              <TwapStyles.StyledColumnFlex gap={12}>
                <Box style={{ display: "flex", gap: 5 }}>
                  <Components.SmallLabel>{translations.acceptDisclaimer}</Components.SmallLabel>
                  <Components.Switch value={twapStore.disclaimerAccepted} onChange={() => twapStore.setDisclaimerAccepted(!twapStore.disclaimerAccepted)} />
                </Box>
                <AdapterStyles.Text className="output-text">{translations.outputWillBeSentTo}</AdapterStyles.Text>
                <AdapterStyles.Text className="output-text">{twapStore.lib?.maker}</AdapterStyles.Text>
              </TwapStyles.StyledColumnFlex>
            </Components.Card>
            <SubmitButton />
          </TwapStyles.StyledColumnFlex>
        </AdapterStyles.StyledOrderConfirmation>
      </Components.Modal>
    </>
  );
};

const SummaryRow = ({ label, tooltip, children }: { label: string; tooltip: string; children: ReactNode }) => {
  return (
    <AdapterStyles.StyledSummaryRow>
      <Components.Label placement="right" tooltipText={tooltip}>
        {label}
      </Components.Label>
      <Box className="twap-summary-row-children">{children}</Box>
    </AdapterStyles.StyledSummaryRow>
  );
};

const TradeInfoDetailsDisplay = () => {
  return (
    <Components.Card>
      <TwapStyles.StyledColumnFlex gap={10}>
        <StateComponents.DisclaimerText />
      </TwapStyles.StyledColumnFlex>
    </Components.Card>
  );
};

const OrderConfirmationLimitPrice = () => {
  const { isLimitOrder, toggleInverted, limitPrice, leftToken, rightToken } = hooks.useLimitPrice();
  const translations = useTwapContext().translations;

  return (
    <AdapterStyles.StyledLimitPrice>
      <TwapStyles.StyledRowFlex justifyContent="space-between">
        <Components.Label tooltipText={translations.confirmationLimitPriceTooltip}>{translations.limitPrice}</Components.Label>
        {isLimitOrder ? (
          <Components.TokenPriceCompare leftToken={leftToken} rightToken={rightToken} price={limitPrice} toggleInverted={toggleInverted} />
        ) : (
          <AdapterStyles.Text>{translations.none}</AdapterStyles.Text>
        )}
      </TwapStyles.StyledRowFlex>
    </AdapterStyles.StyledLimitPrice>
  );
};

const TokenOrderPreview = ({
  isLimitOrder,
  token,
  title,
  usdPrice,
  amount,
  isSrc,
}: {
  isLimitOrder?: boolean;
  token?: TokenData;
  name?: string;
  title: string;
  usdPrice?: string;
  amount?: string;
  isSrc?: boolean;
}) => {
  return (
    <AdapterStyles.StyledTokenOrder>
      <Components.Card>
        <TwapStyles.StyledColumnFlex gap={10}>
          <TwapStyles.StyledRowFlex justifyContent="space-between">
            <Components.Label>{title}</Components.Label>
            <Components.USD value={usdPrice} />
          </TwapStyles.StyledRowFlex>
          <TwapStyles.StyledRowFlex justifyContent="space-between">
            <TokenDisplay name={token?.symbol} logo={token?.logoUrl} />
            <AdapterStyles.StyledTokenOrderPreviewAmount>
              {!isSrc && <> {isLimitOrder ? "≥ " : "~ "}</>} <Components.NumberDisplay value={amount} decimalScale={token?.decimals} />
            </AdapterStyles.StyledTokenOrderPreviewAmount>
          </TwapStyles.StyledRowFlex>
        </TwapStyles.StyledColumnFlex>
      </Components.Card>
    </AdapterStyles.StyledTokenOrder>
  );
};
