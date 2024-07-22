import {
  Components,
  Styles as TwapStyles,
  Translations,
  TwapAdapter,
  TWAPProps,
  hooks,
  TWAPTokenSelectProps,
  useTwapContext,
  TwapContextUIPreferences,
} from "@orbs-network/twap-ui";
import translations from "./i18n/en.json";
import { Configs, TokenData } from "@orbs-network/twap";
import { createContext, useContext, useMemo } from "react";
import Web3 from "web3";
import {
  configureStyles,
  darkTheme,
  lightTheme,
  StyledChangeTokensOrder,
  StyledPercentSelector,
  StyledSubmitButton,
  StyledTokenBalance,
  StyledTokenPanel,
  StyledTokenSelect,
  StyledTradeSize,
} from "./styles";
import { isNativeAddress } from "@defi.org/web3-candies";
import { memo, ReactNode, useCallback, useState } from "react";

import { BsQuestionCircle } from "@react-icons/all-files/bs/BsQuestionCircle";

const config = Configs.SpookySwap;

const uiPreferences: TwapContextUIPreferences = {
  infoIcon: BsQuestionCircle,
};

const ModifiedTokenSelectModal = (props: TWAPTokenSelectProps) => {
  const { TokenSelectModal, dappTokens, account, connectedChainId } = useAdapterContext();
  const { srcToken, dstToken } = useTwapContext();

  const selectedCurrency = useMemo(() => {
    if (!!dappTokens && srcToken) {
      return dappTokens[srcToken.address];
    }
  }, [srcToken?.address]);

  const otherSelectedCurrency = useMemo(() => {
    if (!!dappTokens && dstToken) {
      return dappTokens[dstToken.address];
    }
  }, [dstToken?.address]);

  return (
    <TokenSelectModal
      otherSelectedCurrency={otherSelectedCurrency}
      selectedCurrency={selectedCurrency}
      onCurrencySelect={props.onSelect}
      isOpen={props.isOpen}
      onDismiss={props.onClose}
      account={account}
      chainId={connectedChainId}
    />
  );
};
const memoizedTokenSelect = memo(ModifiedTokenSelectModal);

const TokenSelect = ({ open, onClose, isSrcToken }: { open: boolean; onClose: () => void; isSrcToken?: boolean }) => {
  return <Components.TokenSelectModal Component={memoizedTokenSelect} isOpen={open} onClose={onClose} isSrc={isSrcToken} />;
};

const SrcTokenPercentSelector = () => {
  const onPercentClick = hooks.useCustomActions();
  const translations = useTwapContext().translations;

  const onClick = (value: number) => {
    onPercentClick(value);
  };

  return (
    <StyledPercentSelector>
      <button onClick={() => onClick(0.5)}>50%</button>
      <button onClick={() => onClick(1)}>{translations.max.toUpperCase()}</button>
    </StyledPercentSelector>
  );
};

const TokenPanel = ({ isSrcToken }: { isSrcToken?: boolean }) => {
  const [tokenListOpen, setTokenListOpen] = useState(false);
  const translations = useTwapContext().translations;
  const onClose = useCallback(() => {
    setTokenListOpen(false);
  }, []);

  return (
    <>
      <TokenSelect onClose={onClose} open={tokenListOpen} isSrcToken={isSrcToken} />
      <StyledTokenPanel>
        <TwapStyles.StyledRowFlex justifyContent="space-between">
          <Components.Base.SmallLabel className="twap-panel-title">{isSrcToken ? translations.from : `${translations.to} (estimated)`}</Components.Base.SmallLabel>
          {isSrcToken && <SrcTokenPercentSelector />}
        </TwapStyles.StyledRowFlex>
        <TwapStyles.StyledRowFlex justifyContent="space-between">
          <StyledTokenSelect>
            <Components.TokenSelect isSrc={isSrcToken} onClick={() => setTokenListOpen(true)} />
          </StyledTokenSelect>
          <TwapStyles.StyledOverflowContainer style={{ width: "fit-content", flex: 1 }}>
            <TwapStyles.StyledColumnFlex style={{ alignItems: "flex-end" }} gap={2}>
              <Components.TokenPanelInput isSrc={isSrcToken} />
              <Components.TokenUSD isSrc={isSrcToken} />
            </TwapStyles.StyledColumnFlex>
          </TwapStyles.StyledOverflowContainer>
        </TwapStyles.StyledRowFlex>
        <StyledTokenBalance>
          <Components.Base.SmallLabel>{translations.balance}</Components.Base.SmallLabel>
          <Components.TokenBalance isSrc={isSrcToken} hideLabel={true} />
        </StyledTokenBalance>
      </StyledTokenPanel>
    </>
  );
};

const parseToken = (rawToken: any, getTokenLogoURL: (address: string) => string): TokenData | undefined => {
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
    logoUrl: rawToken.tokenInfo?.logoURI || getTokenLogoURL(rawToken),
  };
};
const AdapterContext = createContext({} as SpookySwapTWAPProps);

const AdapterContextProvider = AdapterContext.Provider;

const useAdapterContext = () => useContext(AdapterContext);

const getTokenImageUrl = (token: any) => {
  return token?.logoUri || `https://assets.spooky.fi/tokens/${token?.symbol}.png`;
};

interface SpookySwapTWAPProps extends TWAPProps {
  connect: () => void;
  provider?: any;
  isLimit?: boolean;
}

const Tooltip = () => {
  return <div></div>;
};

const TWAP = (props: SpookySwapTWAPProps) => {
  const theme = useMemo(() => {
    return props.isDarkTheme ? darkTheme : lightTheme;
  }, [props.isDarkTheme]);

  return (
    <TwapAdapter
      connect={props.connect}
      config={config}
      uiPreferences={uiPreferences}
      maxFeePerGas={props.maxFeePerGas}
      priorityFeePerGas={props.priorityFeePerGas}
      translations={translations as Translations}
      provider={props.provider}
      account={props.account}
      connectedChainId={props.connectedChainId}
      dappTokens={props.dappTokens}
      parsedTokens={[]}
      onDstTokenSelected={props.onDstTokenSelected}
      onSrcTokenSelected={props.onSrcTokenSelected}
      isLimitPanel={props.isLimit}
      Components={{ Tooltip }}
    >
      <AdapterContextProvider value={props}>
        {/* <ThemeProvider theme={theme}>
          <GlobalStyles styles={configureStyles(theme)} />
          <div className="twap-container">{props.limit ? <LimitPanel /> : <TWAPPanel />}</div>
        </ThemeProvider> */}
      </AdapterContextProvider>
    </TwapAdapter>
  );
};

const TWAPPanel = () => {
  return (
    <>
      <TokenPanel isSrcToken={true} />
      <ChangeTokensOrder />
      <TokenPanel />
      <TradeSize />
      <TradeInterval />
      <MaxDuration />
      <StyledSubmitButton />

      <Components.PoweredBy />
    </>
  );
};

const ChangeTokensOrder = () => {
  return <StyledChangeTokensOrder icon={<BsQuestionCircle />} />;
};

const LimitPanel = () => {
  return (
    <>
      <TokenPanel isSrcToken={true} />
      <ChangeTokensOrder />
      <TokenPanel />
      <StyledSubmitButton />

      <Components.PoweredBy />
    </>
  );
};

const TradeSize = () => {
  return (
    <StyledTradeSize>
      <TwapStyles.StyledColumnFlex gap={5}>
        <TwapStyles.StyledRowFlex gap={15} justifyContent="space-between" style={{ minHeight: 40 }}>
          <Components.Labels.TotalTradesLabel />
        </TwapStyles.StyledRowFlex>
        <TwapStyles.StyledRowFlex className="twap-chunks-size" justifyContent="space-between">
          <Components.TradeSize hideSymbol={true} />
          <Components.ChunksUSD />
        </TwapStyles.StyledRowFlex>
      </TwapStyles.StyledColumnFlex>
    </StyledTradeSize>
  );
};

const MaxDuration = () => {
  return (
    <Components.Base.Card>
      <TwapStyles.StyledRowFlex gap={10} justifyContent="space-between">
        <Components.Labels.MaxDurationLabel />
      </TwapStyles.StyledRowFlex>
    </Components.Base.Card>
  );
};

const TradeInterval = () => {
  return (
    <Components.Base.Card>
      <TwapStyles.StyledRowFlex>
        <Components.Labels.TradeIntervalLabel />
        <TwapStyles.StyledRowFlex style={{ flex: 1 }}>
          <Components.TradeIntervalSelector />
        </TwapStyles.StyledRowFlex>
      </TwapStyles.StyledRowFlex>
    </Components.Base.Card>
  );
};

const memoizedTWAP = memo(TWAP);
export { memoizedTWAP as TWAP };
