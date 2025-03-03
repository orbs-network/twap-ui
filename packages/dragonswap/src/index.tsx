import { Configs, getNetwork } from "@orbs-network/twap-sdk";
import { Translations, Styles, Widget, UIPreferences, WidgetProps, WidgetProvider, Components, Types } from "@orbs-network/twap-ui";
import translations from "./i18n/en.json";
import { createContext, useContext, useMemo, ReactNode, useCallback, useState, useEffect } from "react";
import { darkTheme, lightTheme, StyledTop, GlobalStyles, StyledTwapInputs } from "./styles";
import { IoIosArrowDown } from "@react-icons/all-files/io/IoIosArrowDown";
import { eqIgnoreCase } from "@defi.org/web3-candies";
import { ThemeProvider } from "styled-components";
import { checksumAddress } from "viem";

const uiPreferences: UIPreferences = {
  input: { disableThousandSeparator: true, placeholder: "0" },
  tokenSelect: { icon: <IoIosArrowDown style={{ width: 14 }} /> },
  menu: { icon: <IoIosArrowDown style={{ width: 14 }} /> },
  usd: { prefix: "~$ " },
};

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

interface AdapterProps extends Partial<WidgetProps> {
  srcTokenAddress?: string;
  dstTokenAddress?: string;
  dexTokens?: DexToken[];
  title?: ReactNode;
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
  const { chainId } = useAdapterContext();

  return useMemo(() => {
    return configs.find((it) => it.chainId === chainId) || configs[0];
  }, [chainId]);
};

const useOnSwitchFromNativeToWrapped = () => {
  const props = useAdapterContext();
  const config = useConfig();

  const wTokenAddress = useMemo(() => getNetwork(config?.chainId)?.wToken.address, [config?.chainId]);

  return useCallback(() => {
    const token = props.dexTokens?.find((it) => eqIgnoreCase(it.address || "", wTokenAddress || ""));

    if (token) {
      return props.actions?.onSrcTokenSelect?.(token);
    }
  }, [props.actions, props.dexTokens, wTokenAddress]);
};

const useMarketPriceLoading = () => {
  const [isLoading, setIsLoading] = useState(false);
  const context = useAdapterContext();

  useEffect(() => {
    setIsLoading(true);
  }, [context.srcToken?.address, context.dstToken?.address]);

  useEffect(() => {
    setIsLoading(Boolean(context.marketPriceLoading));
  }, [context.marketPriceLoading]);

  return isLoading;
};

const Content = () => {
  const props = useAdapterContext();
  const theme = useMemo(() => (props.isDarkTheme ? darkTheme : lightTheme), [props.isDarkTheme]);
  const { srcToken, dstToken } = useSelectedParsedTokens();
  const config = useConfig();
  const onSwitchFromNativeToWrapped = useOnSwitchFromNativeToWrapped();
  const marketPriceLoading = useMarketPriceLoading();
  return (
    <ThemeProvider theme={theme}>
      <WidgetProvider
        config={config}
        minChunkSizeUsd={props.minChunkSizeUsd}
        translations={translations as Translations}
        web3Provider={props.web3Provider}
        walletClientTransport={props.walletClientTransport}
        account={props.account}
        srcToken={srcToken}
        dstToken={dstToken}
        isLimitPanel={props.isLimitPanel}
        uiPreferences={uiPreferences}
        srcUsd1Token={props.srcUsd1Token || 0}
        dstUsd1Token={props.dstUsd1Token || 0}
        marketPrice={props.marketPrice}
        marketPriceLoading={marketPriceLoading}
        chainId={props.chainId}
        isExactAppoval={props.isExactAppoval}
        components={props.components!}
        useToken={useToken}
        actions={{
          ...props.actions!,
          onSwitchFromNativeToWrapped,
        }}
        srcBalance={props.srcBalance}
        dstBalance={props.dstBalance}
      >
        <GlobalStyles />
        <Styles.StyledColumnFlex gap={16}>
          {props.isLimitPanel ? <LimitPanel /> : <TWAPPanel />}
          <Widget.ErrorMessage />
          <Widget.ShowConfirmationButton />
        </Styles.StyledColumnFlex>
      </WidgetProvider>
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
        {title}
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
        <Widget.TokenPanel.Balance prefix={<span> Balance: </span>} />
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

TWAP.LimitPriceWarning = Widget.LimitPriceWarning;
TWAP.Orders = Widget.Orders;
TWAP.PoweredByOrbs = Widget.PoweredByOrbs;

const Portal = ({ children, containerId }: { children: ReactNode; containerId: string }) => {
  return <Components.Base.Portal containerId={containerId}>{children}</Components.Base.Portal>;
};

export { TWAP, Portal, Types };
