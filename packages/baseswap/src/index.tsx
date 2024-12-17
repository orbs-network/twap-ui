import { Components, Translations, TwapAdapter, TWAPProps, useTwapContext, TwapContextUIPreferences, hooks, Configs, Token, compact, Styles } from "@orbs-network/twap-ui";
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
  Card,
  StyledTradeSizeContent,
  StyledTraeInterval,
  StyledTraeIntervalContent,
  StyledTraeIntervalInput,
  StyledTradeIntervalresolution,
  StyledTradeSizeInput,
  StyledTradeSizeText,
  StyledSubmitButton,
  StyledTradeWarning,
  StyledChunkSizeMessage,
} from "./styles";
import { eqIgnoreCase, isNativeAddress, network } from "@defi.org/web3-candies";
import { BsQuestionCircle } from "@react-icons/all-files/bs/BsQuestionCircle";
import { IoWalletOutline } from "@react-icons/all-files/io5/IoWalletOutline";

import { ThemeProvider } from "styled-components";
export const config = Configs.BaseSwap;

const uiPreferences: TwapContextUIPreferences = {
  infoIcon: <BsQuestionCircle size="12px" />,
  usdSuffix: "",
  usdPrefix: `$`,
  inputPlaceholder: "0",
};

const TokenPanelBalance = ({ isSrc }: { isSrc?: boolean }) => {
  const { srcToken, dstToken } = useTwapContext();
  const srcBalance = hooks.useAmountUi(srcToken?.decimals, hooks.useSrcBalance().data?.toString());
  const dstBalance = hooks.useAmountUi(dstToken?.decimals, hooks.useDstBalance().data?.toString());
  const balance = isSrc ? srcBalance : dstBalance;
  const formattedValue = hooks.useFormatNumberV2({ value: balance, decimalScale: 3 });
  const onPercent = hooks.useOnSrcAmountPercent();

  const onMax = useCallback(() => {
    if (!isSrc) return;
    onPercent(1);
  }, [onPercent]);

  return (
    <StyledTokenPanelBalance isSrc={isSrc ? 1 : 0} onClick={onMax}>
      <Styles.StyledText>{BN(balance || "").isZero() ? "0.0" : formattedValue}</Styles.StyledText>
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
          <TokenPanelUsd isSrc={isSrcToken} emptyUi="$0.00" />
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

const nativeToken = network(config.chainId).native;

const parseToken = (rawToken: any): Token | undefined => {
  if (!rawToken || !rawToken.symbol) {
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
  useUSD: (address?: any) => string | undefined;
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
      srcToken: srcToken ? parseToken(srcToken) : undefined,
      dstToken: dstToken ? parseToken(dstToken) : undefined,
    };
  }, [srcToken, dstToken]);
};

const wrappedAddress = network(config.chainId).wToken.address;

const useAddresses = () => {
  const { srcToken, dstToken } = useSelectedTokens();

  return useMemo(() => {
    return {
      srcAddress: isNativeAddress(srcToken?.address || "") ? wrappedAddress : srcToken?.address,
      dstAddress: isNativeAddress(dstToken?.address || "") ? wrappedAddress : dstToken?.address,
    };
  }, [srcToken, dstToken]);
};

const useUsd = () => {
  const context = useAdapterContext();

  const { srcAddress, dstAddress } = useAddresses();
  const srcUsd = context.useUSD(srcAddress);
  const dstUsd = context.useUSD(dstAddress);

  return useMemo(() => {
    // const wTokenAddress = network(config.chainId).wToken.address;
    return {
      srcUsd,
      dstUsd,
    };
  }, [srcUsd, dstUsd]);
};

const useMarketPrice = () => {
  const { useTrade } = useAdapterContext();
  const { srcAddress, dstAddress } = useAddresses();
  const { srcToken } = useSelectedTokens();
  const amount = hooks.useAmountBN(srcToken?.decimals, "1");

  const trade = useTrade!(srcAddress, dstAddress, BN(amount || 0).isZero() ? undefined : amount);

  return trade?.outAmount;
};

const Content = () => {
  const props = useAdapterContext();
  const theme = useMemo(() => {
    return props.isDarkTheme ? darkTheme : lightTheme;
  }, [props.isDarkTheme]);

  const parsedTokens = useParsedTokens();
  const { srcUsd, dstUsd } = useUsd();
  const marketPrice = useMarketPrice();
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
        Components={{ Tooltip: props.Tooltip }}
        onSwitchTokens={props.onSwitchTokens}
        marketPrice={marketPrice}
        srcUsd={srcUsd}
        dstUsd={dstUsd}
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
      <Styles.StyledRowFlex>
        <TradeSize />
        <TradeInterval />
      </Styles.StyledRowFlex>
     
      <ShowConfirmationButton />
      <Components.PoweredBy />
    </>
  );
};

const ShowConfirmationButton = () => {
  const context = useAdapterContext();
  return (
    <Styles.StyledColumnFlex gap={12} style={{marginTop: 18}}>
      <StyledChunkSizeMessage />
      <StyledTradeWarning />
      <StyledSubmitButton connect={context.connect} />
    </Styles.StyledColumnFlex>
  );
};



const LimitPanel = () => {
  return (
    <>
      <StyledTopGrid>
        <TokenPanel isSrcToken={true} />
        <StyledChangeTokensOrder />
        <TokenPanel />
      </StyledTopGrid>
      <Components.PoweredBy />
    </>
  );
};

const TradeSize = () => {
  return (
    <StyledTradeSize>
      <Card.Header>
        <Components.Labels.TotalTradesLabel />
      </Card.Header>
      <StyledTradeSizeContent>
        <StyledTradeSizeInput />
        <StyledTradeSizeText>Orders</StyledTradeSizeText>
      </StyledTradeSizeContent>
    </StyledTradeSize>
  );
};

const TradeInterval = () => {
  return (
    <StyledTraeInterval>
      <Card.Header>
        <Components.TradeInterval.Label />
      </Card.Header>
      <StyledTraeIntervalContent>
        <StyledTraeIntervalInput />
        <StyledTradeIntervalresolution />
      </StyledTraeIntervalContent>
    </StyledTraeInterval>
  );
};

export { TWAP };

export const SubmitButton = ({ className = "", isMain }: { className?: string; isMain?: boolean }) => {
  const { loading, onClick, disabled, text } = hooks.useSubmitOrderButton();

  return (
    <Components.Base.Button text={text} className={`twap-submit ${className}`} onClick={onClick || (() => {})}>
      {text}
    </Components.Base.Button>
  );
};
