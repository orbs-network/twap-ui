import { Button, GlobalStyles } from "@mui/material";
import {
  Components,
  Translations,
  TwapAdapter,
  OrdersPanel,
  useTwapContext,
  Styles as TwapStyles,
  TWAPTokenSelectProps,
  hooks,
  TWAPProps,
  store,
  Orders,
} from "@orbs-network/twap-ui";
import translations from "./i18n/en.json";
import { Box } from "@mui/system";
import { createContext, memo, ReactNode, useCallback, useContext, useState } from "react";
import { Configs, TokenData } from "@orbs-network/twap";
import Web3 from "web3";
import { configureStyles, StyledPercentSelect, StyledTokenPanelInput } from "./styles";
import { isNativeAddress } from "@defi.org/web3-candies";
import { SyncSwapPallete } from "./types";

const storeOverride = {
  isLimitOrder: true,
  chunks: 1,
  customDuration: { resolution: store.TimeResolution.Days, amount: 7 },
  customFillDelay: { resolution: store.TimeResolution.Minutes, amount: 2 },
};

interface SyncSwapProps extends TWAPProps {
  connect: () => void;
  onSrcTokenSelected: (value: any) => void;
  onDstTokenSelected: (value: any) => void;
  getTokenLogoURL: (address: string) => string;
  dappTokens: { [key: string]: QuickSwapRawToken };
  pallete: SyncSwapPallete;
}

interface QuickSwapRawToken {
  address: string;
  chainId: number;
  decimals: number;
  name: string;
  symbol: string;
  tokenInfo: {
    address: string;
    chainId: number;
    decimals: number;
    logoURI: string;
    name: string;
    symbol: string;
  };
}

const config = Configs.QuickSwap;

const parseToken = (getTokenLogoURL: (address: string) => string, rawToken: QuickSwapRawToken): TokenData | undefined => {
  if (!rawToken.symbol) {
    console.error("Invalid token", rawToken);
    return;
  }
  if (!rawToken.address || isNativeAddress(rawToken.address)) {
    return config.nativeToken;
  }
  return {
    address: Web3.utils.toChecksumAddress(rawToken.address),
    decimals: rawToken.decimals,
    symbol: rawToken.symbol,
    logoUrl: rawToken.tokenInfo?.logoURI || getTokenLogoURL(rawToken.address),
  };
};

const AdapterContext = createContext({} as SyncSwapProps);

const AdapterContextProvider = AdapterContext.Provider;

const useAdapterContext = () => useContext(AdapterContext);

const ModifiedTokenSelectModal = (props: TWAPTokenSelectProps) => {
  const TokenSelectModal = useAdapterContext().TokenSelectModal;

  return <TokenSelectModal tokenSelected={undefined} onCurrencySelect={props.onSelect} isOpen={props.isOpen} onDismiss={props.onClose} />;
};
const memoizedTokenSelect = memo(ModifiedTokenSelectModal);

const TokenSelect = ({ open, onClose, isSrcToken }: { open: boolean; onClose: () => void; isSrcToken?: boolean }) => {
  return <Components.TokenSelectModal Component={memoizedTokenSelect} isOpen={open} onClose={onClose} isSrc={isSrcToken} />;
};

const TokenPanel = ({ isSrcToken }: { isSrcToken?: boolean }) => {
  const [tokenListOpen, setTokenListOpen] = useState(false);
  const pallete = useAdapterContext().pallete;

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
              <StyledTokenPanelInput placeholder="0.00" isSrc={isSrcToken} />
              <Components.TokenSelect isSrc={isSrcToken} onClick={() => setTokenListOpen(true)} />
            </TwapStyles.StyledRowFlex>
            <TwapStyles.StyledRowFlex justifyContent="space-between">
              <Components.TokenBalance isSrc={isSrcToken} />
              <Components.TokenUSD isSrc={isSrcToken} />
            </TwapStyles.StyledRowFlex>
            {isSrcToken && <SrcTokenPercentSelector />}
          </TwapStyles.StyledColumnFlex>
        </Components.Base.Card>
      </TwapStyles.StyledColumnFlex>
    </>
  );
};

const SrcTokenPercentSelector = () => {
  const onPercentClick = hooks.useCustomActions().onPercentClick;

  const onClick = (value: number) => {
    onPercentClick(value);
  };

  return (
    <StyledPercentSelect>
      <Button fullWidth size="small" variant="outlined" onClick={() => onClick(0.25)}>
        25%
      </Button>
      <Button fullWidth size="small" variant="outlined" onClick={() => onClick(0.5)}>
        50%
      </Button>
      <Button fullWidth size="small" variant="outlined" onClick={() => onClick(0.75)}>
        75%
      </Button>
      <Button fullWidth size="small" variant="outlined" onClick={() => onClick(1)}>
        100%
      </Button>
    </StyledPercentSelect>
  );
};

const OrderSummary = ({ children }: { children: ReactNode }) => {
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
          <Components.Base.Card>{children}</Components.Base.Card>
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

const ChangeTokensOrder = () => {
  return (
    <Box mt={1.5} sx={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <Components.ChangeTokensOrder />
    </Box>
  );
};

interface Props extends SyncSwapProps {
  limit?: boolean;
}

const TWAP = (props: Props) => {
  const globalStyles = configureStyles(props.pallete);

  const connect = useCallback(() => {
    props.connect();
  }, []);

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
        dappTokens={props.dappTokens}
        parseToken={(rawToken: any) => parseToken(props.getTokenLogoURL, rawToken)}
        srcToken={props.srcToken}
        onTxSubmitted={props.onTxSubmitted}
        dstToken={props.dstToken}
        storeOverride={props.limit ? storeOverride : undefined}
        onDstTokenSelected={props.onDstTokenSelected}
        onSrcTokenSelected={props.onSrcTokenSelected}
      >
        <GlobalStyles styles={globalStyles as any} />
        <AdapterContextProvider value={props}>
          {props.limit ? <LimitPanel /> : <TWAPPanel />}
          <OrdersPanel />
        </AdapterContextProvider>
      </TwapAdapter>
    </Box>
  );
};

const LimitPanel = () => {
  return (
    <div className="twap-container">
      <TokenPanel isSrcToken={true} />
      <ChangeTokensOrder />
      <TokenPanel />
      <Components.MarketPrice />
      <TwapStyles.StyledColumnFlex gap={12}>
        <LimitPrice limit={true} />
        <Components.SubmitButton isMain />
      </TwapStyles.StyledColumnFlex>
      <OrderSummary>
        <TwapStyles.StyledColumnFlex>
          <Components.OrderSummaryDetailsDeadline />
          <Components.OrderSummaryDetailsOrderType />
          <Components.OrderSummaryDetailsChunkSize />
          <Components.OrderSummaryDetailsMinDstAmount />
        </TwapStyles.StyledColumnFlex>
      </OrderSummary>
      <Components.PoweredBy />
    </div>
  );
};

const TWAPPanel = () => {
  return (
    <div className="twap-container">
      <TokenPanel isSrcToken={true} />
      <ChangeTokensOrder />
      <TokenPanel />
      <Components.MarketPrice />
      <TwapStyles.StyledColumnFlex gap={12}>
        <LimitPrice />
        <TradeSize />
        <TradeInterval />
        <MaxDuration />
        <Components.SubmitButton isMain />
      </TwapStyles.StyledColumnFlex>
      <OrderSummary>
        <Components.OrderSummaryDetails />
      </OrderSummary>
      <Components.PoweredBy />
    </div>
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
          <Components.TradeSize />
          <Components.ChunksUSD />
        </TwapStyles.StyledRowFlex>
      </TwapStyles.StyledColumnFlex>
    </Components.Base.Card>
  );
};

const MaxDuration = () => {
  return (
    <Components.Base.Card className="twap-max-duration-wrapper">
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
    <Components.Base.Card className="twap-trade-interval-wrapper">
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

const LimitPrice = ({ limit }: { limit?: boolean }) => {
  return (
    <>
      <Components.Base.Card className="twap-limit-price">
        <TwapStyles.StyledColumnFlex>
          <TwapStyles.StyledRowFlex justifyContent="space-between">
            <Components.Labels.LimitPriceLabel />
            {!limit && <Components.LimitPriceToggle />}
          </TwapStyles.StyledRowFlex>
          <Components.LimitPriceInput placeholder="0" />
        </TwapStyles.StyledColumnFlex>
      </Components.Base.Card>
    </>
  );
};

export { Orders, TWAP };
