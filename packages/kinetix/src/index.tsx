import {
  Components,
  Styles as TwapStyles,
  Translations,
  TwapAdapter,
  TWAPProps,
  useTwapContext,
  TwapContextUIPreferences,
  hooks,
  TWAPTokenSelectProps,
  TooltipProps,
  Configs,
  Token,
} from "@orbs-network/twap-ui";
import translations from "./i18n/en.json";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import Web3 from "web3";
import {
  configureStyles,
  darkTheme,
  lightTheme,
  StyledChangeTokensOrder,
  StyledMaxButton,
  StyledPoweredBy,
  StyledTokenBalance,
  StyledTokenPanel,
  StyledTokenPanelHeader,
  StyledTokenPanelInput,
  StyledTokenSelect,
  StyledTopGrid,
  StyledTradeSize,
} from "./styles";
import { isNativeAddress, network, zeroAddress } from "@defi.org/web3-candies";
import { memo, ReactNode } from "react";
// eslint-disable-next-line import/no-extraneous-dependencies
import { BsQuestionCircle } from "@react-icons/all-files/bs/BsQuestionCircle";

const config = Configs.Lynex;

const uiPreferences: TwapContextUIPreferences = {
  infoIcon: BsQuestionCircle,
  inputPlaceholder: "0.00",
};

const MaxSelector = () => {
  const onPercentClick = hooks.useOnSrcAmountPercent();

  const onClick = (value: number) => {
    onPercentClick(value);
  };

  return <StyledMaxButton onClick={() => onClick(1)}>Max</StyledMaxButton>;
};

const ModifiedTokenSelectModal = (props: TWAPTokenSelectProps) => {
  const { TokenSelectModal, dappTokens } = useAdapterContext();

  return (
    <TokenSelectModal
      otherAsset={props.dstTokenSelected}
      selectedAsset={props.srcTokenSelected}
      setSelectedAsset={props.onSelect}
      popup={props.isOpen}
      setPopup={props.onClose}
      baseAssets={dappTokens}
      setOtherAsset={props.onSelect}
    />
  );
};
const memoizedTokenSelect = memo(ModifiedTokenSelectModal);

const TokenSelect = ({ open, onClose, isSrcToken }: { open: boolean; onClose: () => void; isSrcToken?: boolean }) => {
  return <Components.TokenSelectModal Component={memoizedTokenSelect} isOpen={open} onClose={onClose} isSrc={isSrcToken} />;
};

const TokenPanel = ({ isSrcToken }: { isSrcToken?: boolean }) => {
  const translations = useTwapContext().translations;
  const [tokenListOpen, setTokenListOpen] = useState(false);

  const onClose = useCallback(() => {
    setTokenListOpen(false);
  }, []);

  return (
    <>
      <TokenSelect onClose={onClose} open={tokenListOpen} isSrcToken={isSrcToken} />
      <StyledTokenPanel>
        <TwapStyles.StyledColumnFlex gap={10}>
          <TwapStyles.StyledRowFlex justifyContent="space-between">
            <StyledTokenPanelHeader>
              <Components.Base.Label>{isSrcToken ? translations.from : translations.to}</Components.Base.Label>
              <Components.TokenUSD emptyUi={<></>} isSrc={isSrcToken} prefix=": $" />
            </StyledTokenPanelHeader>
            <TwapStyles.StyledRowFlex width="auto">
              <StyledTokenBalance emptyUi={<>0.00</>} isSrc={isSrcToken} />
              {isSrcToken && <MaxSelector />}
            </TwapStyles.StyledRowFlex>
          </TwapStyles.StyledRowFlex>

          <TwapStyles.StyledRowFlex>
            <StyledTokenPanelInput isSrc={isSrcToken} />
            <StyledTokenSelect>
              <Components.TokenSelect hideArrow={false} isSrc={isSrcToken} onClick={() => setTokenListOpen(true)} />
            </StyledTokenSelect>
          </TwapStyles.StyledRowFlex>
        </TwapStyles.StyledColumnFlex>
      </StyledTokenPanel>
    </>
  );
};
const nativeToken = network(config.chainId).native;
const parseToken = (rawToken: any): Token | undefined => {
  if (!rawToken.symbol) {
    console.error("Invalid token", rawToken);
    return;
  }
  const address = rawToken.address === "ETH" ? zeroAddress : rawToken.address;
  if (!address || isNativeAddress(address)) {
    return nativeToken;
  }
  return {
    address: Web3.utils.toChecksumAddress(address),
    decimals: rawToken.decimals,
    symbol: rawToken.symbol,
    logoUrl: rawToken.logoURI,
  };
};

const Tooltip = (props: TooltipProps) => {
  return <div></div>;
};
const AdapterContext = createContext({} as BaseSwapTWAPProps);

const AdapterContextProvider = AdapterContext.Provider;

const useAdapterContext = () => useContext(AdapterContext);

interface BaseSwapTWAPProps extends TWAPProps {
  connect: () => void;
  provider?: any;
  useModal?: any;
}

const TWAP = (props: BaseSwapTWAPProps) => {
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
      chainId={props.connectedChainId}
      dappTokens={props.dappTokens}
      parsedTokens={[]}
      onDstTokenSelected={props.onDstTokenSelected}
      onSrcTokenSelected={props.onSrcTokenSelected}
      isLimitPanel={props.limit}
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
      <StyledTopGrid>
        <TokenPanel isSrcToken={true} />
        <ChangeTokensOrder />
        <TokenPanel />
      </StyledTopGrid>
      <TradeSize />
      <TradeInterval />
      <MaxDuration />

      <StyledPoweredBy />
    </>
  );
};

const ChangeTokensOrder = () => {
  return <StyledChangeTokensOrder />;
};

const LimitPanel = () => {
  return (
    <>
      <StyledTopGrid>
        <TokenPanel isSrcToken={true} />
        <ChangeTokensOrder />
        <TokenPanel />
      </StyledTopGrid>

      <StyledPoweredBy />
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
