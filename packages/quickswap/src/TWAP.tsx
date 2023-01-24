import { GlobalStyles } from "@mui/material";
import { Components, hooks, Translations, TwapAdapter, useTwapContext, Styles as TwapStyles, TWAPTokenSelectProps } from "@orbs-network/twap-ui";
import { memo, useCallback, useState } from "react";
import { Configs } from "@orbs-network/twap";
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
import { QuickSwapTWAPProps } from ".";

const ModifiedTokenSelectModal = (props: TWAPTokenSelectProps) => {
  const TokenSelectModal = useAdapterContext().TokenSelectModal;
  return <TokenSelectModal tokenSelected={undefined} onSelect={props.onSelect} isOpen={props.isOpen} onClose={props.onClose} />;
};

const TWAP = (props: QuickSwapTWAPProps) => {
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
      config={Configs.QuickSwap}
      maxFeePerGas={props.maxFeePerGas}
      priorityFeePerGas={props.priorityFeePerGas}
      translations={translations as Translations}
      provider={provider}
      account={props.account}
    >
      <GlobalStyles styles={globalStyles} />
      <AdapterContextProvider value={{ ...adapterContextProps, ModifiedTokenSelectModal }}>
        <div className="twap-container">
          <TokenPanel isSrcToken={true} />
          <Components.TWAP.ChangeTokensOrder />
          <TokenPanel />
          <LimitPrice />
          <TradeSize />
          <MaxDuration />
          <TradeInterval />
          <Components.TWAP.SubmitButton />
          <OrderSummary />
          <Components.TWAP.PoweredBy />
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
          <Components.TWAP.ChunksSliderSelect />
          <Components.TWAP.ChunksInput />
        </TwapStyles.StyledRowFlex>
        <TwapStyles.StyledRowFlex className="twap-chunks-size" justifyContent="space-between">
          <TwapStyles.StyledRowFlex justifyContent="flex-start" width="fit-content">
            <TwapStyles.StyledRowFlex>
              <Components.Labels.ChunksAmountLabel />
              <Components.TWAP.ChunksAmount />
            </TwapStyles.StyledRowFlex>
            <Components.TWAP.TokenLogoAndSymbol isSrc={true} />
          </TwapStyles.StyledRowFlex>
          <Components.TWAP.ChunksUSD />
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
          <Components.TWAP.LimitPriceToggle />
        </TwapStyles.StyledRowFlex>
        <Components.TWAP.LimitPriceInput placeholder="0" />
      </TwapStyles.StyledColumnFlex>
    </Components.Base.Card>
  );
};

const MaxDuration = () => {
  return (
    <Components.Base.Card>
      <TwapStyles.StyledRowFlex gap={10} justifyContent="space-between">
        <Components.Labels.MaxDurationLabel />
        <Components.TWAP.PartialFillWarning />
        <Components.TWAP.MaxDurationSelector />
      </TwapStyles.StyledRowFlex>
    </Components.Base.Card>
  );
};

const TradeInterval = () => {
  return (
    <Components.Base.Card>
      <TwapStyles.StyledRowFlex>
        <Components.Labels.TradeIntervalLabel />
        <Components.TWAP.FillDelayWarning />
        <TwapStyles.StyledRowFlex style={{ flex: 1 }}>
          <Components.TWAP.TradeIntervalSelector />
        </TwapStyles.StyledRowFlex>
      </TwapStyles.StyledRowFlex>
    </Components.Base.Card>
  );
};

const TokenPanel = ({ isSrcToken }: { isSrcToken?: boolean }) => {
  const [tokenListOpen, setTokenListOpen] = useState(false);
  const { ModifiedTokenSelectModal, onSrcTokenSelected, onDstTokenSelected, getTokenImageUrl } = useAdapterContext();
  const translations = useTwapContext().translations;

  const onClose = useCallback(() => {
    setTokenListOpen(false);
  }, []);

  return (
    <>
      <Components.TWAP.TokenSelectModal
        Component={ModifiedTokenSelectModal}
        onSrcSelect={onSrcTokenSelected}
        onDstSelect={onDstTokenSelected}
        isOpen={tokenListOpen}
        onClose={onClose}
        isSrc={isSrcToken}
        parseToken={(token) => parseToken(token, getTokenImageUrl)}
      />
      <TwapStyles.StyledColumnFlex gap={4} className="twap-token-panel">
        <TwapStyles.StyledRowFlex justifyContent="space-between">
          <Components.Base.SmallLabel className="twap-panel-title">{isSrcToken ? translations.from : `${translations.to} (${translations.estimated})`}</Components.Base.SmallLabel>
          {isSrcToken && <SrcTokenPercentSelector />}
        </TwapStyles.StyledRowFlex>
        <Components.Base.Card>
          <TwapStyles.StyledColumnFlex gap={15}>
            <TwapStyles.StyledRowFlex justifyContent="space-between">
              <Components.TWAP.TokenInput isSrc={isSrcToken} />
              <Components.TWAP.TokenSelect isSrc={isSrcToken} onClick={() => setTokenListOpen(true)} />
            </TwapStyles.StyledRowFlex>
            <TwapStyles.StyledRowFlex justifyContent="space-between">
              <TwapStyles.StyledOverflowContainer>
                <Components.TWAP.TokenUSD isSrc={isSrcToken} />
              </TwapStyles.StyledOverflowContainer>
              <Components.TWAP.TokenBalance isSrc={isSrcToken} />
            </TwapStyles.StyledRowFlex>
          </TwapStyles.StyledColumnFlex>
        </Components.Base.Card>
      </TwapStyles.StyledColumnFlex>
    </>
  );
};

const OrderSummary = () => {
  return (
    <Components.TWAP.OrderSummaryModalContainer>
      <TwapStyles.StyledColumnFlex gap={14}>
        <TwapStyles.StyledColumnFlex gap={14}>
          <Components.Base.Card>
            <Components.TWAP.OrderSummaryTokenDisplay isSrc={true} />
          </Components.Base.Card>
          <Components.Base.Card>
            <Components.TWAP.OrderSummaryTokenDisplay />
          </Components.Base.Card>
          <Components.TWAP.OrderSummaryLimitPrice />
          <Components.Base.Card>
            <Components.TWAP.OrderSummaryDetails />
          </Components.Base.Card>
          <Components.Base.Card>
            <TwapStyles.StyledColumnFlex gap={10}>
              <Components.TWAP.DisclaimerText />
            </TwapStyles.StyledColumnFlex>
          </Components.Base.Card>
        </TwapStyles.StyledColumnFlex>
        <Components.Base.Card>
          <TwapStyles.StyledColumnFlex gap={12}>
            <Components.TWAP.AcceptDisclaimer />
            <Components.TWAP.OutputAddress />
          </TwapStyles.StyledColumnFlex>
        </Components.Base.Card>
        <Components.TWAP.SubmitButton />
      </TwapStyles.StyledColumnFlex>
    </Components.TWAP.OrderSummaryModalContainer>
  );
};
