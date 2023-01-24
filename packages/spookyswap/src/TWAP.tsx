import { GlobalStyles } from "@mui/material";
import { Components, hooks, Styles as TwapStyles, TWAPTokenSelectProps, Translations, TwapAdapter, useTwapContext } from "@orbs-network/twap-ui";
import { memo, useCallback, useState } from "react";
import translations from "./i18n/en.json";
import { Configs } from "@orbs-network/twap";
import { AdapterContextProvider, useAdapterContext, useGetProvider, useGlobalStyles, useParseTokenList, usePrepareAdapterContextProps, useTokensFromDapp } from "./hooks";
import { SpookySwapTWAPProps } from ".";

const ModifiedTokenSelectModal = (props: TWAPTokenSelectProps) => {
  const TokenSelectModal = useAdapterContext().TokenSelectModal;
  return <TokenSelectModal commonTokens={[]} tokenSelected={undefined} onSelect={props.onSelect} isOpen={props.isOpen} onClose={props.onClose} />;
};

const TWAP = (props: SpookySwapTWAPProps) => {
  const tokenList = useParseTokenList(props.getTokenImageUrl, props.dappTokens);
  useTokensFromDapp(props.srcToken, props.dstToken, props.account ? tokenList : undefined);
  const provider = useGetProvider(props.getProvider, props.account);
  const adapterContextProps = usePrepareAdapterContextProps(props);
  const globalStyles = useGlobalStyles(props.isDarkTheme);
  const connect = useCallback(() => {
    props.connect();
  }, []);

  return (
    <TwapAdapter
      connect={connect}
      config={Configs.SpookySwap}
      maxFeePerGas={props.maxFeePerGas}
      priorityFeePerGas={props.priorityFeePerGas}
      translations={translations as Translations}
      provider={provider}
      account={props.account}
      connectedChainId={props.connectedChainId}
    >
      <GlobalStyles styles={globalStyles} />

      <AdapterContextProvider value={{ ...adapterContextProps, ModifiedTokenSelectModal }}>
        <div className="twap-container">
          <TokenPanel isSrcToken={true} />
          <Components.ChangeTokensOrder />
          <TokenPanel />
          <LimitPrice />
          <TradeSize />
          <MaxDuration />
          <TradeInterval />
          <TwapStyles.StyledRowFlex className="twap-create-order-btn">
            <Components.SubmitButton />
          </TwapStyles.StyledRowFlex>
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
    <TwapStyles.StyledRowFlex className="twap-percent-selector">
      <button onClick={() => onClick(0.5)}>50%</button>
      <button onClick={() => onClick(1)}>{translations.max}</button>
    </TwapStyles.StyledRowFlex>
  );
};

const TradeSize = () => {
  return (
    <Components.Base.Card className="twap-trade-size">
      <TwapStyles.StyledColumnFlex gap={5}>
        <TwapStyles.StyledRowFlex gap={15} justifyContent="space-between" style={{ minHeight: 40 }}>
          <Components.Labels.TotalTradesLabel />
          <Components.ChunksSliderSelect />
          <Components.ChunksInput />
        </TwapStyles.StyledRowFlex>
        <TwapStyles.StyledRowFlex className="twap-chunks-size" justifyContent="space-between">
          <TwapStyles.StyledRowFlex justifyContent="flex-start" width="fit-content">
            <TwapStyles.StyledRowFlex>
              <Components.Labels.ChunksAmountLabel />
              <Components.ChunksAmount />
            </TwapStyles.StyledRowFlex>
            <Components.TokenLogoAndSymbol isSrc={true} />
          </TwapStyles.StyledRowFlex>
          <Components.ChunksUSD />
        </TwapStyles.StyledRowFlex>
      </TwapStyles.StyledColumnFlex>
    </Components.Base.Card>
  );
};

const LimitPrice = () => {
  return (
    <Components.Base.Card className="twap-limit-price">
      <TwapStyles.StyledColumnFlex>
        <TwapStyles.StyledRowFlex justifyContent="space-between">
          <Components.Labels.LimitPriceLabel />
          <Components.LimitPriceToggle />
        </TwapStyles.StyledRowFlex>
        <Components.LimitPriceInput placeholder="0" />
      </TwapStyles.StyledColumnFlex>
    </Components.Base.Card>
  );
};
const MaxDuration = () => {
  return (
    <Components.Base.Card>
      <TwapStyles.StyledRowFlex gap={10} justifyContent="space-between">
        <Components.Labels.MaxDurationLabel />
        <Components.PartialFillWarning />
        <Components.MaxDurationSelector />
      </TwapStyles.StyledRowFlex>
    </Components.Base.Card>
  );
};

const TradeInterval = () => {
  return (
    <Components.Base.Card>
      <TwapStyles.StyledRowFlex>
        <Components.Labels.TradeIntervalLabel />
        <Components.FillDelayWarning />
        <TwapStyles.StyledRowFlex style={{ flex: 1 }}>
          <Components.TradeIntervalSelector />
        </TwapStyles.StyledRowFlex>
      </TwapStyles.StyledRowFlex>
    </Components.Base.Card>
  );
};

const TokenPanel = ({ isSrcToken }: { isSrcToken?: boolean }) => {
  const [tokenListOpen, setTokenListOpen] = useState(false);
  const { ModifiedTokenSelectModal, onSrcTokenSelected, onDstTokenSelected } = useAdapterContext();
  const translations = useTwapContext().translations;
  const marketPrice = hooks.useMarketPrice().marketPrice;

  const onClose = useCallback(() => {
    setTokenListOpen(false);
  }, []);

  return (
    <>
      <Components.TokenSelectModal
        Component={ModifiedTokenSelectModal}
        onSrcSelect={onSrcTokenSelected}
        onDstSelect={onDstTokenSelected}
        isOpen={tokenListOpen}
        onClose={onClose}
        isSrc={isSrcToken}
      />
      <TwapStyles.StyledColumnFlex gap={4} className="twap-token-panel">
        <TwapStyles.StyledRowFlex justifyContent="space-between">
          <Components.Base.SmallLabel className="twap-panel-title">{isSrcToken ? translations.from : `${translations.to} (${translations.estimated})`}</Components.Base.SmallLabel>
          {isSrcToken && <SrcTokenPercentSelector />}
          {!isSrcToken && marketPrice !== "0" && (
            <TwapStyles.StyledRowFlex className="twap-token-panel-price">
              <TwapStyles.StyledText>Price</TwapStyles.StyledText> <Components.Base.NumberDisplay value={marketPrice} /> <Components.TokenSymbol isSrc={isSrcToken} />
            </TwapStyles.StyledRowFlex>
          )}
        </TwapStyles.StyledRowFlex>
        <Components.Base.Card>
          <TwapStyles.StyledColumnFlex gap={15}>
            <TwapStyles.StyledRowFlex justifyContent="space-between">
              <Components.TokenInput isSrc={isSrcToken} />
              <Components.TokenSelect isSrc={isSrcToken} onClick={() => setTokenListOpen(true)} />
            </TwapStyles.StyledRowFlex>
            <TwapStyles.StyledRowFlex justifyContent="space-between">
              <TwapStyles.StyledOverflowContainer>
                <Components.TokenUSD isSrc={isSrcToken} />
              </TwapStyles.StyledOverflowContainer>
              <Components.TokenBalance isSrc={isSrcToken} />
            </TwapStyles.StyledRowFlex>
          </TwapStyles.StyledColumnFlex>
        </Components.Base.Card>
      </TwapStyles.StyledColumnFlex>
    </>
  );
};

const OrderSummary = () => {
  return (
    <Components.OrderSummaryModalContainer>
      <TwapStyles.StyledColumnFlex gap={14}>
        <TwapStyles.StyledColumnFlex gap={14}>
          <Components.Base.Card>
            <Components.OrderSummaryTokenDisplay isSrc={true} />
          </Components.Base.Card>
          <Components.Base.Card>
            <Components.OrderSummaryTokenDisplay />
          </Components.Base.Card>
          <Components.OrderSummaryLimitPrice />
          <Components.Base.Card>
            <Components.OrderSummaryDetails />
          </Components.Base.Card>
          <Components.Base.Card>
            <TwapStyles.StyledColumnFlex gap={10}>
              <Components.DisclaimerText />
            </TwapStyles.StyledColumnFlex>
          </Components.Base.Card>
        </TwapStyles.StyledColumnFlex>
        <Components.Base.Card>
          <TwapStyles.StyledColumnFlex gap={12}>
            <Components.AcceptDisclaimer />
            <Components.OutputAddress />
          </TwapStyles.StyledColumnFlex>
        </Components.Base.Card>
        <Components.SubmitButton />
      </TwapStyles.StyledColumnFlex>
    </Components.OrderSummaryModalContainer>
  );
};
