import { GlobalStyles } from "@mui/material";
import { Components, hooks, Translations, TwapAdapter, useTwapContext, Styles as TwapStyles, TWAPTokenSelectProps } from "@orbs-network/twap-ui";
import { memo, useCallback, useState } from "react";
import { AdapterContextProvider, config, parseToken, useAdapterContext, useGlobalStyles } from "./hooks";
import translations from "./i18n/en.json";
import { QuickSwapRawToken, QuickSwapTWAPProps } from "./types";
import { Box } from "@mui/system";
import { useTwapStore } from "@orbs-network/twap-ui/dist/store";

const TWAP = (props: QuickSwapTWAPProps) => {
  const parsedTokens = hooks.useParseTokens(props.dappTokens, (rawToken) => parseToken(props.getTokenLogoURL, rawToken));
  const srcToken = useTwapStore((state) => state.srcToken);
  const dstToken = useTwapStore((state) => state.dstToken);

  hooks.useSetTokensFromDapp(props.srcToken, props.dstToken);
  const globalStyles = useGlobalStyles();

  const connect = useCallback(() => {
    props.connect();
  }, []);

  const renderAdapterBody = () => {
    if (props?.simpleLimit) {
      return (
        <div className="twap-container">
          <TokenPanel isSrcToken={true} />
          <Box mt={1.5} sx={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Components.ChangeTokensOrder />
          </Box>
          <TokenPanel />
          <LimitPrice simpleLimit />
          <Box mb={2} mt={3}>
            <Components.SubmitButton simpleLimit />
          </Box>
          <OrderSummary simpleLimit />
          <Components.PoweredBy />
        </div>
      );
    }
    return (
      <div className="twap-container">
        <TokenPanel isSrcToken={true} hideArrow={!!srcToken} />
        <Box mt={1.5} sx={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <Components.ChangeTokensOrder />
        </Box>
        <TokenPanel hideArrow={!!dstToken} />
        <LimitPrice />
        <TradeSize />
        <MaxDuration />
        <TradeInterval />
        <Box mb={2}>
          <Components.SubmitButton />
        </Box>
        <OrderSummary />
        <Components.PoweredBy />
      </div>
    );
  };

  return (
    <Box className="adapter-wrapper">
      <TwapAdapter
        connect={connect}
        config={config}
        maxFeePerGas={props.maxFeePerGas}
        priorityFeePerGas={props.priorityFeePerGas}
        translations={translations as Translations}
        provider={props.provider}
        account={props.account}
        tokensList={parsedTokens}
      >
        <GlobalStyles styles={globalStyles as any} />
        <AdapterContextProvider value={props}>{renderAdapterBody()}</AdapterContextProvider>
      </TwapAdapter>
    </Box>
  );
};

export default TWAP;

const SrcTokenPercentSelector = () => {
  const onPercentClick = hooks.useCustomActions().onPercentClick;
  const translations = useTwapContext().translations;

  const onClick = (value: number) => {
    onPercentClick(value);
  };

  return (
    <TwapStyles.StyledRowFlex className="twap-percent-selector" width="fit-content">
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
            <Components.Labels.ChunksAmountLabel />
            <Components.TokenLogoAndSymbol isSrc={true} />
          </TwapStyles.StyledRowFlex>
          <Components.ChunksUSD />
        </TwapStyles.StyledRowFlex>
      </TwapStyles.StyledColumnFlex>
    </Components.Base.Card>
  );
};

const LimitPrice = ({ simpleLimit }: { simpleLimit?: boolean }) => {
  const setLimitOrder = useTwapStore((store) => store.setLimitOrder);

  setLimitOrder(simpleLimit);

  return (
    <>
      <Components.MarketPrice />
      <Components.Base.Card className="twap-limit-price">
        <TwapStyles.StyledColumnFlex>
          <TwapStyles.StyledRowFlex justifyContent="space-between">
            <Components.Labels.LimitPriceLabel />
            {!simpleLimit && <Components.LimitPriceToggle />}
          </TwapStyles.StyledRowFlex>
          <Components.LimitPriceInput placeholder="0" />
        </TwapStyles.StyledColumnFlex>
      </Components.Base.Card>
    </>
  );
};

const MaxDuration = () => {
  return (
    <Components.Base.Card style={{ marginBottom: 12 }} className="twap-max-duration-wrapper">
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
    <Components.Base.Card style={{ marginBottom: 24 }} className="twap-trade-interval-wrapper">
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

const ModifiedTokenSelectModal = (props: TWAPTokenSelectProps) => {
  const TokenSelectModal = useAdapterContext().TokenSelectModal;

  return <TokenSelectModal tokenSelected={undefined} onCurrencySelect={props.onSelect} isOpen={props.isOpen} onDismiss={props.onClose} />;
};
const memoizedTokenSelect = memo(ModifiedTokenSelectModal);

const TokenSelect = ({ open, onClose, isSrcToken }: { open: boolean; onClose: () => void; isSrcToken?: boolean }) => {
  const { onSrcTokenSelected, onDstTokenSelected, getTokenLogoURL } = useAdapterContext();

  return (
    <Components.TokenSelectModal
      Component={memoizedTokenSelect}
      onSrcSelect={onSrcTokenSelected}
      onDstSelect={onDstTokenSelected}
      isOpen={open}
      onClose={onClose}
      isSrc={isSrcToken}
      parseToken={(token: QuickSwapRawToken) => parseToken(getTokenLogoURL, token)}
    />
  );
};

const TokenPanel = ({ isSrcToken, hideArrow = true }: { isSrcToken?: boolean, hideArrow?: boolean }) => {
  const [tokenListOpen, setTokenListOpen] = useState(false);
  const translations = useTwapContext().translations;

  const onClose = useCallback(() => {
    setTokenListOpen(false);
  }, []);

  return (
    <>
      <TokenSelect onClose={onClose} open={tokenListOpen} isSrcToken={isSrcToken} />

      <TwapStyles.StyledColumnFlex gap={0} className="twap-token-panel">
        <Components.Base.Card>
          <TwapStyles.StyledColumnFlex gap={16}>
            <TwapStyles.StyledRowFlex justifyContent="space-between">
              <Components.Base.SmallLabel className="twap-token-panel-title">
                {isSrcToken ? translations.from : `${translations.to} (${translations.estimate})`}
              </Components.Base.SmallLabel>
              {isSrcToken && <SrcTokenPercentSelector />}
            </TwapStyles.StyledRowFlex>
            <TwapStyles.StyledRowFlex justifyContent="space-between">
              <Components.TokenSelect hideArrow={hideArrow} isSrc={isSrcToken} onClick={() => setTokenListOpen(true)} />
              <Components.TokenInput placeholder="0.00" isSrc={isSrcToken} />
            </TwapStyles.StyledRowFlex>
            <TwapStyles.StyledRowFlex justifyContent="space-between">
              <Components.TokenBalance isSrc={isSrcToken} />
              <Components.TokenUSD isSrc={isSrcToken} />
            </TwapStyles.StyledRowFlex>
          </TwapStyles.StyledColumnFlex>
        </Components.Base.Card>
      </TwapStyles.StyledColumnFlex>
    </>
  );
};

const OrderSummary = ({ simpleLimit }: { simpleLimit?: boolean }) => {
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
            <Components.OrderSummaryDetails simpleLimit={simpleLimit} />
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
