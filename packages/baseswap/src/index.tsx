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
  compact,
  Styles,
} from "@orbs-network/twap-ui";
import translations from "./i18n/en.json";
import { createContext, FC, useCallback, useContext, useMemo, useState } from "react";
import Web3 from "web3";
import BN from "bignumber.js";
import {
  darkTheme,
  GlobalStyles,
  lightTheme,
  StyledTokenPanelBalance,
  StyledChangeTokensOrder,
  StyledInputPanelLeft,
  StyledTokenPanel,
  StyledTokenPanelRight,
  StyledTokenPanelInput,
  StyledTokenSelect,
  StyledTopGrid,
  StyledTradeSize,
  TokenPanelUsd,
} from "./styles";
import { eqIgnoreCase, isNativeAddress, network } from "@defi.org/web3-candies";
import { memo } from "react";
import { BsQuestionCircle } from "@react-icons/all-files/bs/BsQuestionCircle";
import { AiOutlineArrowDown } from "@react-icons/all-files/ai/AiOutlineArrowDown";
import { IoWalletOutline } from "@react-icons/all-files/io5/IoWalletOutline";

import { styled, ThemeProvider } from "styled-components";
export const config = Configs.BaseSwap;

const uiPreferences: TwapContextUIPreferences = {
  infoIcon: BsQuestionCircle,
  usdSuffix: "",
  usdPrefix: `$`,
  inputPlaceholder: "0",
};

const TokenPanelBalance = ({ isSrc }: { isSrc?: boolean }) => {
  const { srcToken, dstToken } = useTwapContext();
  const srcBalance = hooks.useAmountUi(srcToken?.decimals, hooks.useSrcBalance().data?.toString());
  const dstBalance = hooks.useAmountUi(dstToken?.decimals, hooks.useDstBalance().data?.toString());
  const balance = isSrc ? srcBalance : dstBalance;
  const formattedValue = hooks.useFormatNumberV2({ value: balance, decimalScale: 4 });
  const onPercent = hooks.useOnSrcAmountPercent();

  const onMax = useCallback(() => {
    if (!isSrc) return;
    onPercent(1);
  }, [onPercent]);

  return (
    <StyledTokenPanelBalance isSrc={isSrc ? 1 : 0} onClick={onMax}>
      <Styles.StyledText>{BN(balance || '').isZero() ? '0.0' : formattedValue}</Styles.StyledText>
      <IoWalletOutline />
    </StyledTokenPanelBalance>
  );
};

const TokenPanel = ({ isSrcToken }: { isSrcToken?: boolean }) => {
  const { TokenSelectModal } = useAdapterContext();

  const [isOpen, setIsOpen] = useState(false);
  const [finalFocusRef, setFinalFocusRef] = useState("");

  const onOpen = useCallback(() => {
    setIsOpen(true);
    setFinalFocusRef(isSrcToken ? "tokenIn" : "tokenOut");
  }, [isSrcToken]);

  const onClose = useCallback(() => {
    setIsOpen(false);
    setFinalFocusRef("");
  }, []);

  return (
    <>
      <TokenSelectModal onOpen={() => {}} finalFocusRef={finalFocusRef as any} isOpen={isOpen} onClose={onClose} />
      <StyledTokenPanel>
        <StyledInputPanelLeft>
          <StyledTokenPanelInput dstDecimalScale={3} isSrc={isSrcToken} />
          <TokenPanelUsd isSrc={isSrcToken} emptyUi='$0.00' />
        </StyledInputPanelLeft>
        <StyledTokenPanelRight>
          <StyledTokenSelect>
            <Components.TokenSelect hideArrow={false} isSrc={isSrcToken} onClick={onOpen} />
          </StyledTokenSelect>
          <TokenPanelBalance isSrc={isSrcToken} />
        </StyledTokenPanelRight>
      </StyledTokenPanel>
    </>
  );
};

const Tooltip = (props: TooltipProps) => {
  return <div></div>;
};

const nativeToken = network(config.chainId).native;

const parseToken = (rawToken: any): Token | undefined => {
  if (!rawToken || !rawToken.symbol) {
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
    logoUrl: rawToken?.logoURI,
  };
};
const AdapterContext = createContext({} as BaseSwapTWAPProps);

const AdapterContextProvider = AdapterContext.Provider;

const useAdapterContext = () => useContext(AdapterContext);

interface BaseSwapTWAPProps extends TWAPProps {
  provider?: any;
  TokenSelectModal: FC<{ finalFocusRef: "tokenIn" | "tokenOut"; isOpen?: boolean; onOpen: () => void; onClose: () => void }>;
}

const TWAP = (props: BaseSwapTWAPProps) => {
  return (
    <AdapterContextProvider value={props}>
      <Content />
    </AdapterContextProvider>
  );
};

const useParsedTokens = () => {
  const { dappTokens } = useAdapterContext();

  return useMemo(() => {
    if (!dappTokens) return [];

    let parsed: Token[] = dappTokens.map((rawToken: any) => {
      return parseToken(rawToken);
    });

    if (!parsed.find((it) => eqIgnoreCase(it.symbol, nativeToken.symbol))) {
      parsed.push(nativeToken);
    }
    return compact(parsed) as Token[];
  }, [dappTokens]);
};

const useSelectedTokens = () => {
  const { srcToken, dstToken } = useAdapterContext();
  return useMemo(() => {
    return {
      srcToken: parseToken(srcToken),
      dstToken: parseToken(dstToken),
    };
  }, [srcToken, dstToken]);
};

const Content = () => {
  const props = useAdapterContext();
  const theme = useMemo(() => {
    return props.isDarkTheme ? darkTheme : lightTheme;
  }, [props.isDarkTheme]);

  const parsedTokens = useParsedTokens();
  const { srcToken, dstToken } = useSelectedTokens();

  return (
    <ThemeProvider theme={theme}>
      <TwapAdapter
        connect={props.connect}
        config={config}
        uiPreferences={uiPreferences}
        maxFeePerGas={props.maxFeePerGas}
        priorityFeePerGas={props.priorityFeePerGas}
        translations={translations as Translations}
        provider={props.provider}
        account={props.account}
        srcToken={srcToken}
        dstToken={dstToken}
        chainId={props.connectedChainId}
        dappTokens={props.dappTokens}
        onDstTokenSelected={() => {}}
        onSrcTokenSelected={() => {}}
        parsedTokens={parsedTokens}
        isLimitPanel={props.limit}
        Components={{ Tooltip }}
        onSwitchTokens={props.onSwitchTokens}
      >
        <GlobalStyles />
        <div className="twap-container">{props.limit ? <LimitPanel /> : <TWAPPanel />}</div>
      </TwapAdapter>
    </ThemeProvider>
  );
};

const TWAPPanel = () => {
  return (
    <>
      <StyledTopGrid>
        <TokenPanel isSrcToken={true} />
        <StyledChangeTokensOrder />
        <TokenPanel />
      </StyledTopGrid>
      <TradeSize />
      <TradeInterval />
      <MaxDuration />
      <ShowConfirmationButton />
      <Components.PoweredBy />
    </>
  );
};

const ShowConfirmationButton = () => {
  const context = useAdapterContext();
  return <Components.ShowConfirmation connect={context.connect} />;
};

const LimitPanel = () => {
  return (
    <>
      <StyledTopGrid>
        <TokenPanel isSrcToken={true} />
        <StyledChangeTokensOrder />
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
    <Components.Base.Button text={text} className={`twap-submit ${className}`} onClick={onClick || (() => {})}>
      {text}
    </Components.Base.Button>
  );
};

export const StyledSubmitButton = styled(SubmitButton)({
  marginTop: 10,
});
