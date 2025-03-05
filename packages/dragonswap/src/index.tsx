import { Configs, eqIgnoreCase, getNetwork } from "@orbs-network/twap-sdk";
import { Translations, Styles, Widget, TwapProps, TwapProvider, Components, Types } from "@orbs-network/twap-ui";
import translations from "./i18n/en.json";
import { createContext, useContext, useMemo, ReactNode, useCallback, useState, useEffect } from "react";
import { darkTheme, lightTheme, StyledTop, GlobalStyles, StyledTwapInputs } from "./styles";
import { ThemeProvider } from "styled-components";
import { checksumAddress } from "viem";

const parseToken = (token?: any) => {
  try {
    if (!token || !token.address) return;

    return {
      address: checksumAddress(token.address),
      decimals: token.decimals,
      symbol: token.symbol,
      logoUrl: token.logoURI,
    };
  } catch (error) {
    console.error("Invalid token", token);
  }
};

type DexToken = {
  symbol: string;
  address: `0x${string}`;
  name: string;
  decimals: number;
  chainId: number;
  about: string;
  tags: string[];
  logoURI: string;
};

interface AdapterProps extends Partial<TwapProps> {
  srcTokenAddress?: string;
  dstTokenAddress?: string;
  dexTokens?: DexToken[];
  title: string;
}

const useParsedTokens = () => {
  const { dexTokens } = useAdapterContext();
  return useMemo(() => {
    return dexTokens?.map((t: any) => {
      return parseToken(t);
    });
  }, [dexTokens]);
};

const useSelectedParsedTokens = () => {
  const props = useAdapterContext();
  return useMemo(() => {
    const srcToken = props.dexTokens?.find((it: any) => eqIgnoreCase(it.address || "", props.srcTokenAddress || ""));
    const dstToken = props.dexTokens?.find((it: any) => eqIgnoreCase(it.address || "", props.dstTokenAddress || ""));
    return {
      srcToken: parseToken(srcToken),
      dstToken: parseToken(dstToken),
    };
  }, [props.srcToken, props.dstToken, props.dexTokens, props.srcTokenAddress, props.dstTokenAddress]);
};

const useToken = (addressOrSymbol?: string) => {
  const parsedTokens = useParsedTokens();
  return useMemo(
    () =>
      parsedTokens?.find((it) => {
        return eqIgnoreCase(it?.address || "", addressOrSymbol || "") || eqIgnoreCase(it?.symbol || "", addressOrSymbol || "");
      }),
    [parsedTokens, addressOrSymbol],
  );
};

const configs = [Configs.DragonSwap];
const useConfig = () => {
  return useMemo(() => {
    return configs[0];
  }, []);
};

const useOnSwitchFromNativeToWrapped = () => {
  const props = useAdapterContext();
  const config = useConfig();

  const wTokenAddress = useMemo(() => getNetwork(config?.chainId)?.wToken.address, [config?.chainId]);

  return useCallback(() => {
    const token = props.dexTokens?.find((it) => eqIgnoreCase(it.address || "", wTokenAddress || ""));

    if (token) {
      return props.callbacks?.onSrcTokenSelect?.(token);
    }
  }, [props.callbacks, props.dexTokens, wTokenAddress]);
};

const useMarketPriceLoading = () => {
  const [isLoading, setIsLoading] = useState(false);
  const context = useAdapterContext();

  useEffect(() => {
    setIsLoading(true);
  }, [context.srcToken?.address, context.dstToken?.address]);

  useEffect(() => {
    setIsLoading(Boolean(context.marketReferencePrice?.isLoading));
  }, [context.marketReferencePrice?.isLoading]);

  return isLoading;
};

const Content = () => {
  const props = useAdapterContext();
  const theme = useMemo(() => (props.isDarkTheme ? darkTheme : lightTheme), [props.isDarkTheme]);
  const { srcToken, dstToken } = useSelectedParsedTokens();
  const config = useConfig();
  const marketPriceLoading = useMarketPriceLoading();
  return (
    <ThemeProvider theme={theme}>
      <TwapProvider
        config={config}
        minChunkSizeUsd={props.minChunkSizeUsd}
        translations={translations as Translations}
        provider={props.provider}
        srcToken={srcToken}
        dstToken={dstToken}
        isLimitPanel={props.isLimitPanel}
        srcUsd1Token={props.srcUsd1Token || 0}
        dstUsd1Token={props.dstUsd1Token || 0}
        marketReferencePrice={{
          value: props.marketReferencePrice?.value,
          isLoading: marketPriceLoading,
        }}
        isExactAppoval={props.isExactAppoval}
        components={props.components!}
        useToken={useToken}
        modals={props.modals!}
        callbacks={props.callbacks!}
        srcBalance={props.srcBalance}
        dstBalance={props.dstBalance}
      >
        <GlobalStyles />
        <Styles.StyledColumnFlex gap={16}>
          {props.isLimitPanel ? <LimitPanel /> : <TWAPPanel />}
          <Widget.ShowConfirmationButton />
        </Styles.StyledColumnFlex>
      </TwapProvider>
    </ThemeProvider>
  );
};

const AdapterContext = createContext<AdapterProps | undefined>(undefined);

export const useAdapterContext = () => {
  const context = useContext(AdapterContext);
  if (!context) {
    throw new Error("useAdapter must be used within a AdapterProvider");
  }
  return context;
};

const TWAP = (props: AdapterProps) => {
  return (
    <AdapterContext.Provider value={props}>
      <Content />
    </AdapterContext.Provider>
  );
};

const InputsPanel = () => {
  const { title } = useAdapterContext();
  return (
    <>
      <Styles.StyledRowFlex className="twap-inputs-panel">
        <Styles.StyledText> {title}</Styles.StyledText>
        <Widget.PriceSwitch />
      </Styles.StyledRowFlex>
      <LimitPrice />
      <StyledTop>
        <TokenPanel isSrcToken={true} />
        <Widget.SwitchTokens />
        <TokenPanel isSrcToken={false} />
      </StyledTop>
    </>
  );
};

const LimitPrice = () => {
  return (
    <>
      <Widget.LimitPricePanel>
        <Widget.LimitPricePanel.Main />
      </Widget.LimitPricePanel>
    </>
  );
};

const TWAPPanel = () => {
  return (
    <>
      <InputsPanel />
      <StyledTwapInputs>
        <Widget.FillDelayPanel>
          <Widget.FillDelayPanel.Main />
        </Widget.FillDelayPanel>
        <Widget.TradesAmountPanel>
          <Widget.TradesAmountPanel.Main />
        </Widget.TradesAmountPanel>
      </StyledTwapInputs>
    </>
  );
};

const TokenPanel = ({ isSrcToken }: { isSrcToken?: boolean }) => {
  return (
    <Widget.TokenPanel isSrcToken={Boolean(isSrcToken)}>
      <div className="twap-token-panel-header">
        <Widget.TokenPanel.Label />
        <Widget.TokenPanel.BalanceSelect />
      </div>
      <Styles.StyledRowFlex className={`twap-token-panel-top`}>
        <Widget.TokenPanel.Input />
        <Widget.TokenPanel.Select />
      </Styles.StyledRowFlex>
      <Styles.StyledRowFlex className={`twap-token-panel-bottom`}>
        <Widget.TokenPanel.Usd />
        <Widget.TokenPanel.Balance />
      </Styles.StyledRowFlex>
    </Widget.TokenPanel>
  );
};

const LimitPanel = () => {
  return (
    <>
      <InputsPanel />
      <Widget.DurationPanel>
        <Widget.DurationPanel.Main />
      </Widget.DurationPanel>
    </>
  );
};

TWAP.LimitPriceWarning = Widget.LimitPriceMessage;
TWAP.Orders = Widget.Orders;
TWAP.PoweredByOrbs = Widget.PoweredByOrbs;

const Portal = ({ children, containerId }: { children: ReactNode; containerId: string }) => {
  return <Components.Base.Portal containerId={containerId}>{children}</Components.Base.Portal>;
};

export { TWAP, Portal, Types };
