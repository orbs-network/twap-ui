import { Config, Configs } from "@orbs-network/twap-sdk";
import { Translations, hooks, Styles, getNetwork, Widget, UIPreferences, WidgetProps, WidgetProvider, useWidgetContext, Token } from "@orbs-network/twap-ui";
import translations from "./i18n/en.json";
import { createContext, useContext, useEffect, useMemo } from "react";
import Web3 from "web3";
import React, { useCallback, useState } from "react";
import { darkTheme, lightTheme, StyledTop, GlobalStyles, StyledLimitAndInputs, StyledTwapInputs } from "./styles";
import BN from "bignumber.js";
import { IoIosArrowDown } from "@react-icons/all-files/io/IoIosArrowDown";
import { eqIgnoreCase, isNativeAddress } from "@defi.org/web3-candies";
import { ThemeProvider } from "styled-components";

const uiPreferences: UIPreferences = {
  input: { disableThousandSeparator: false, placeholder: "0" },
  tokenSelect: { icon: <IoIosArrowDown style={{ width: 14 }} /> },
  menu: { icon: <IoIosArrowDown style={{ width: 14 }} /> },
  usd: { prefix: "~$ " },
};

const useParseToken = () => {
  const config = useConfig();

  return useCallback(
    (token?: any) => {
      try {
        if (!token || !token.symbol) {
          return;
        }

        return {
          address: Web3.utils.toChecksumAddress(token.address),
          decimals: token.decimals,
          symbol: token.symbol,
          logoUrl: token.logoURI,
        };
      } catch (error) {
        console.error("Invalid token", token);
      }
    },
    [config.chainId],
  );
};

interface AdapterProps extends Partial<WidgetProps> {
  useUSD: (address?: any) => string | undefined;
  srcToken?: any;
  dstToken?: any;
  connector?: any;
  dappTokens?: any;
  useMarketPrice: (srcToken?: string, dstToken?: string, amount?: string) => { outAmount?: string };
}

const useWToken = () => {
  const props = useAdapterContext();
  const config = useConfig();

  return useMemo(() => {
    const wTokenAddress = getNetwork(config.chainId)?.wToken.address;

    return props.dappTokens?.find((it: any) => eqIgnoreCase(it.address || "", wTokenAddress || ""));
  }, [props.dappTokens, config]);
};

const useIsNative = () => {
  const config = useConfig();

  return useCallback(
    (token?: any) => {
      if (token?.isNative || token?.symbol === getNetwork(config.chainId)?.native.symbol) {
        return true;
      }
    },
    [config.chainId],
  );
};

const useAddresses = () => {
  const props = useAdapterContext();
  const wrappedAddress = useWToken()?.address;
  const isNative = useIsNative();

  return useMemo(() => {
    return {
      srcAddress: isNative(props.srcToken) ? wrappedAddress : props.srcToken?.address,
      dstAddress: isNative(props.dstToken) ? wrappedAddress : props.dstToken?.address,
    };
  }, [props.srcToken, props.dstToken, isNative, wrappedAddress]);
};

const useMarketPrice = () => {
  const props = useAdapterContext();
  const { srcAddress, dstAddress } = useAddresses();
  const { srcToken } = useSelectedParsedTokens();
  const amount = hooks.useAmountBN(srcToken?.decimals, "1");

  const trade = props.useMarketPrice(srcAddress, dstAddress, BN(amount || 0).isZero() ? undefined : amount);

  return trade?.outAmount;
};

const useUsd = () => {
  const props = useAdapterContext();
  const wToken = useWToken();
  const tokens = useAddresses();

  const srcAddress = isNativeAddress(tokens.srcAddress || "") ? wToken?.address : tokens.srcAddress;
  const dstAddress = isNativeAddress(tokens.dstAddress || "") ? wToken?.address : tokens.dstAddress;

  return {
    srcUsd: props.useUSD(srcAddress),
    dstUsd: props.useUSD(dstAddress),
  };
};

const useParsedTokens = () => {
  const { dappTokens } = useAdapterContext();
  const parseToken = useParseToken();
  return useMemo(() => {
    return dappTokens.map((t: any) => {
      return parseToken(t);
    });
  }, [dappTokens, parseToken]);
};

const useSelectedParsedTokens = () => {
  const props = useAdapterContext();
  const parseToken = useParseToken();
  return useMemo(() => {
    return {
      srcToken: parseToken(props.srcToken),
      dstToken: parseToken(props.dstToken),
    };
  }, [props.srcToken, props.dstToken, parseToken]);
};

export const useProvider = () => {
  const props = useAdapterContext();
  const [provider, setProvider] = useState<any>(undefined);

  const setProviderFromConnector = useCallback(async () => {
    setProvider(undefined);
    try {
      const res = await props.connector?.getProvider();
      setProvider(res);
    } catch (error) {}
  }, [setProvider, props.connector, props.chainId, props.account]);

  useEffect(() => {
    setProviderFromConnector();
  }, [setProviderFromConnector]);

  return provider;
};

const useToken = (addressOrSymbol?: string) => {
  const parsedTokens = useParsedTokens();
  return useMemo(
    () =>
      parsedTokens?.find((it: Token) => {
        return eqIgnoreCase(it.address, addressOrSymbol || "") || eqIgnoreCase(it.symbol, addressOrSymbol || "");
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

const Content = () => {
  const props = useAdapterContext();
  const provider = useProvider();
  const theme = useMemo(() => (props.isDarkTheme ? darkTheme : lightTheme), [props.isDarkTheme]);
  const { srcToken, dstToken } = useSelectedParsedTokens();
  const { srcUsd, dstUsd } = useUsd();
  const marketPrice = useMarketPrice();
  const config = useConfig();

  return (
    <ThemeProvider theme={theme}>
      <WidgetProvider
        connect={props.connect!}
        config={config}
        maxFeePerGas={props.maxFeePerGas}
        priorityFeePerGas={props.priorityFeePerGas}
        translations={translations as Translations}
        provider={provider}
        account={props.account}
        srcToken={srcToken}
        dstToken={dstToken}
        onSrcTokenSelected={props.onSrcTokenSelected}
        onDstTokenSelected={props.onDstTokenSelected}
        isLimitPanel={props.isLimitPanel}
        uiPreferences={uiPreferences}
        onSwitchTokens={props.onSwitchTokens}
        srcUsd={srcUsd ? Number(srcUsd) : 0}
        dstUsd={dstUsd ? Number(dstUsd) : 0}
        marketPrice={marketPrice}
        chainId={props.chainId}
        isExactAppoval={true}
        components={props.components!}
        useToken={useToken}
      >
        <GlobalStyles />
        <Styles.StyledColumnFlex gap={16}>
          {props.isLimitPanel ? <LimitPanel /> : <TWAPPanel />}
          <Widget.ErrorMessage />
          <Widget.SubmitOrderPanel />
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
  return (
    <>
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
      <Widget.PriceSwitch />
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
      <Widget.Panel.Header>
        <Widget.TokenPanel.Label />
        <Widget.TokenPanel.BalanceSelect />
      </Widget.Panel.Header>
      <Styles.StyledRowFlex className={`${Widget.TokenPanel.ClassName}-top`}>
        <Widget.TokenPanel.Input />
        <Widget.TokenPanel.Select />
      </Styles.StyledRowFlex>
      <Styles.StyledRowFlex className={`${Widget.TokenPanel.ClassName}-bottom`}>
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

export { TWAP };
