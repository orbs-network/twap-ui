import { Components, Styles as TwapStyles, Translations, TwapAdapter, TWAPProps, TwapContextUIPreferences, hooks, useTwapContext, TooltipProps } from "@orbs-network/twap-ui";
import translations from "./i18n/en.json";
import { Configs, TokenData } from "@orbs-network/twap";
import { createContext, useCallback, useContext, useMemo } from "react";
import Web3 from "web3";
import {
  configureStyles,
  darkTheme,
  lightTheme,
  StyledChangeTokensOrder,
  StyledSubmitButton,
  StyledTokenBalance,
  StyledTokenPanel,
  StyledTokenPanelInput,
  StyledTokenSelect,
  StyledTopGrid,
  StyledTradeSize,
} from "./styles";
import { isNativeAddress } from "@defi.org/web3-candies";
import { memo } from "react";
import { BsQuestionCircle } from "@react-icons/all-files/bs/BsQuestionCircle";
import { HiArrowDown } from "@react-icons/all-files/hi/HiArrowDown";
const config = Configs.Arbidex;

const uiPreferences: TwapContextUIPreferences = {
  infoIcon: BsQuestionCircle,
  switchVariant: "ios",
  usdSuffix: " USD",
  usdPrefix: "≈ ",
};

const TokenPanel = ({ isSrcToken }: { isSrcToken?: boolean }) => {
  const { useModal, TokenSelectModal } = useAdapterContext();
  // const { rawDstToken: dstToken, rawSrcToken: srcToken } = useTwapContext();
  const selectToken = hooks.useTokenSelect();

  const onSelect = useCallback(
    (token: any) => {
      selectToken({ isSrc: !!isSrcToken, token });
    },
    [selectToken, isSrcToken]
  );
  // const [onPresentCurrencyModal] = useModal(<TokenSelectModal otherSelectedCurrency={dstToken} selectedCurrency={srcToken} onCurrencySelect={onSelect} />);

  return (
    <>
      <StyledTokenPanel>
        <TwapStyles.StyledRowFlex justifyContent="space-between">
          <TwapStyles.StyledColumnFlex style={{ flex: 1, width: "auto", gap: 24 }}>
            <StyledTokenPanelInput isSrc={isSrcToken} />
            <Components.TokenUSD isSrc={isSrcToken} hideIfZero={true} />
            <StyledTokenBalance isSrc={isSrcToken} />
          </TwapStyles.StyledColumnFlex>
          <StyledTokenSelect>{/* <Components.TokenSelect hideArrow={false} isSrc={isSrcToken} onClick={onPresentCurrencyModal} /> */}</StyledTokenSelect>
        </TwapStyles.StyledRowFlex>
      </StyledTokenPanel>
    </>
  );
};

const parseToken = (rawToken: any): TokenData | undefined => {
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
    logoUrl: getTokenImageUrl(rawToken),
  };
};
const AdapterContext = createContext({} as BaseSwapTWAPProps);

const AdapterContextProvider = AdapterContext.Provider;

const useAdapterContext = () => useContext(AdapterContext);

const getTokenImageUrl = (token: any) => {
  return `https://arbidex.fi/images/tokens/${token.address.toLowerCase()}.png`;
};

interface BaseSwapTWAPProps extends TWAPProps {
  connect: () => void;
  provider?: any;
  useModal?: any;
}

const Tooltip = (props: TooltipProps) => {
  return <div></div>;
};

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
      connectedChainId={props.connectedChainId}
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
      <StyledSubmitButton />

      <Components.PoweredBy />
    </>
  );
};

const ChangeTokensOrder = () => {
  return <StyledChangeTokensOrder icon={<HiArrowDown />} />;
};

const LimitPanel = () => {
  return (
    <>
      <StyledTopGrid>
        <TokenPanel isSrcToken={true} />
        <ChangeTokensOrder />
        <TokenPanel />
      </StyledTopGrid>
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
