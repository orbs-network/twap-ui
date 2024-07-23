import {
  Components,
  Styles as TwapStyles,
  Translations,
  TwapAdapter,
  TWAPProps,
  useTwapContext,
  TwapContextUIPreferences,
  hooks,
  TooltipProps,
  Configs,
  Token,
} from "@orbs-network/twap-ui";
import translations from "./i18n/en.json";
import { createContext, useCallback, useContext, useMemo } from "react";
import Web3 from "web3";
import {
  configureStyles,
  darkTheme,
  lightTheme,
  StyledChangeTokensOrder,
  StyledInputAndSelect,
  StyledMaxButton,
  StyledTokenBalance,
  StyledTokenPanel,
  StyledTokenPanelBalanceAndMax,
  StyledTokenPanelBottom,
  StyledTokenPanelInput,
  StyledTokenSelect,
  StyledTopGrid,
  StyledTradeSize,
} from "./styles";
import { isNativeAddress, network } from "@defi.org/web3-candies";
import { memo, ReactNode } from "react";
import { BsQuestionCircle } from "@react-icons/all-files/bs/BsQuestionCircle";
import { AiOutlineArrowDown } from "@react-icons/all-files/ai/AiOutlineArrowDown";
import { GrPowerReset } from "@react-icons/all-files/gr/GrPowerReset";
import { styled } from "styled-components";

const config = Configs.BaseSwap;

const Button = (props: any) => {
  const DappButton = useAdapterContext().Button;

  return (
    <DappButton text={props.text} onClick={props.onClick} disabled={props.disabled} isLoading={props.loading}>
      {props.loading ? "Loading..." : props.children}
    </DappButton>
  );
};

const uiPreferences: TwapContextUIPreferences = {
  infoIcon: BsQuestionCircle,
  usdSuffix: " USD",
  usdPrefix: `≈ `,
};

const MaxButton = () => {
  const onPercentClick = hooks.useOnSrcAmountPercent();
  const translations = useTwapContext().translations;

  return <StyledMaxButton onClick={() => onPercentClick(1)}>{translations.max.toUpperCase()}</StyledMaxButton>;
};

const TokenPanel = ({ isSrcToken }: { isSrcToken?: boolean }) => {
  const { useModal, TokenSelectModal } = useAdapterContext();
  // const { rawDstToken: dstToken, rawSrcToken: srcToken } = useTwapContext();
  const selectToken = hooks.useTokenSelect();

  const onSelect = useCallback(
    (token: any) => {
      selectToken({ isSrc: !!isSrcToken, token });
    },
    [selectToken, isSrcToken],
  );
  // const [onPresentCurrencyModal] = useModal(<TokenSelectModal otherSelectedCurrency={dstToken} selectedCurrency={srcToken} onCurrencySelect={onSelect} />);

  return (
    <>
      <StyledTokenPanel>
        <StyledInputAndSelect>
          <StyledTokenSelect>{/* <Components.TokenSelect hideArrow={false} isSrc={isSrcToken} onClick={onPresentCurrencyModal} /> */}</StyledTokenSelect>
          <StyledTokenPanelInput dstDecimalScale={3} isSrc={isSrcToken} />
        </StyledInputAndSelect>
        <StyledTokenPanelBottom>
          <StyledTokenPanelBalanceAndMax>
            <StyledTokenBalance isSrc={isSrcToken} />
            {isSrcToken && <MaxButton />}
          </StyledTokenPanelBalanceAndMax>
          <Components.TokenUSD isSrc={isSrcToken} />
        </StyledTokenPanelBottom>
      </StyledTokenPanel>
    </>
  );
};

const Tooltip = (props: TooltipProps) => {
  return <div></div>;
};

const nativeToken = network(config.chainId).native;

const parseToken = (rawToken: any, getTokenLogoURL: (address: string) => string): Token | undefined => {
  if (!rawToken.symbol) {
    console.error("Invalid token", rawToken);
    return;
  }
  if (!rawToken.address || isNativeAddress(rawToken.address)) {
    return nativeToken;
  }
  return {
    address: Web3.utils.toChecksumAddress(rawToken.address),
    decimals: rawToken.decimals,
    symbol: rawToken.symbol,
    logoUrl: rawToken.tokenInfo?.logoURI || getTokenLogoURL(rawToken),
  };
};
const AdapterContext = createContext({} as BaseSwapTWAPProps);

const AdapterContextProvider = AdapterContext.Provider;

const useAdapterContext = () => useContext(AdapterContext);

interface BaseSwapTWAPProps extends TWAPProps {
  connect: () => void;
  provider?: any;
  useModal?: any;
  Button: any;
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
      onDstTokenSelected={props.onDstTokenSelected}
      onSrcTokenSelected={props.onSrcTokenSelected}
      parsedTokens={[]}
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
      <StyledSubmitButton isMain={true} />
      <Components.PoweredBy />
    </>
  );
};

const ChangeTokensOrder = () => {
  return <StyledChangeTokensOrder icon={<AiOutlineArrowDown />} />;
};

const LimitPanel = () => {
  return (
    <>
      <StyledTopGrid>
        <TokenPanel isSrcToken={true} />
        <ChangeTokensOrder />
        <TokenPanel />
      </StyledTopGrid>
      <StyledSubmitButton isMain={true} />
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

export const SubmitButton = ({ className = "", isMain }: { className?: string; isMain?: boolean }) => {
  const { loading, onClick, disabled, text } = hooks.useSubmitOrderButton();

  return (
    <Button text={text} className={`twap-submit ${className}`} onClick={onClick || (() => {})}>
      {text}
    </Button>
  );
};

export const StyledSubmitButton = styled(SubmitButton)({
  marginTop: 10,
});
