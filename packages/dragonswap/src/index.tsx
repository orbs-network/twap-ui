import { Config } from "@orbs-network/twap-sdk";
import { Components, Translations, hooks, Styles, getNetwork, Widget, UIPreferences, WidgetProps, WidgetProvider } from "@orbs-network/twap-ui";
import translations from "./i18n/en.json";
import { useEffect, useMemo } from "react";
import Web3 from "web3";
import React, { useCallback, useState } from "react";
import { darkTheme, lightTheme, StyledTop, GlobalStyles, StyledLimitAndInputs, StyledTwapInputs } from "./styles";
import BN from "bignumber.js";
import { IoIosArrowDown } from "@react-icons/all-files/io/IoIosArrowDown";
import { eqIgnoreCase, isNativeAddress } from "@defi.org/web3-candies";
import { ThemeProvider } from "styled-components";

const uiPreferences: UIPreferences = {
  input: { disableThousandSeparator: false, placeholder: "0" },
  tokenSelect: { icon: <IoIosArrowDown style={{width: 14}} /> },
  menu: { icon: <IoIosArrowDown style={{width: 14}} /> },
};

const useParseToken = (props: AdapterProps) => {
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
    [props.config.chainId]
  );
};

interface AdapterProps extends Partial<WidgetProps> {
  useUSD: (address?: any) => string | undefined;
  srcToken?: any;
  dstToken?: any;
  connector?: any;
  config: Config;
  dappTokens?: any;
  useMarketPrice: (srcToken?: string, dstToken?: string, amount?: string) => { outAmount?: string };
}

const useWToken = (props: AdapterProps) => {
  return useMemo(() => {
    const wTokenAddress = getNetwork(props.config.chainId)?.wToken.address;

    return props.dappTokens?.find((it: any) => eqIgnoreCase(it.address || "", wTokenAddress || ""));
  }, [props.dappTokens, props.config]);
};

const useIsNative = (props: AdapterProps) => {
  return useCallback(
    (token?: any) => {
      if (token?.isNative || token?.symbol === getNetwork(props.config.chainId)?.native.symbol) {
        return true;
      }
    },
    [props.config.chainId]
  );
};

const useAddresses = (props: AdapterProps) => {
  const wrappedAddress = useWToken(props)?.address;
  const isNative = useIsNative(props);

  return useMemo(() => {
    return {
      srcAddress: isNative(props.srcToken) ? wrappedAddress : props.srcToken?.address,
      dstAddress: isNative(props.dstToken) ? wrappedAddress : props.dstToken?.address,
    };
  }, [props.srcToken, props.dstToken, isNative, wrappedAddress]);
};

const useMarketPrice = (props: AdapterProps) => {
  const { srcAddress, dstAddress } = useAddresses(props);
  const { srcToken } = useSelectedParsedTokens(props);
  const amount = hooks.useAmountBN(srcToken?.decimals, "1");

  const trade = props.useMarketPrice(srcAddress, dstAddress, BN(amount || 0).isZero() ? undefined : amount);

  return trade?.outAmount;
};

const useUsd = (props: AdapterProps) => {
  const wToken = useWToken(props);
  const tokens = useAddresses(props);

  const srcAddress = isNativeAddress(tokens.srcAddress || "") ? wToken?.address : tokens.srcAddress;
  const dstAddress = isNativeAddress(tokens.dstAddress || "") ? wToken?.address : tokens.dstAddress;

  return {
    srcUsd: props.useUSD(srcAddress),
    dstUsd: props.useUSD(dstAddress),
  };
};

const useSelectedParsedTokens = (props: AdapterProps) => {
  const parseToken = useParseToken(props);
  return useMemo(() => {
    return {
      srcToken: parseToken(props.srcToken),
      dstToken: parseToken(props.dstToken),
    };
  }, [props.srcToken, props.dstToken, parseToken]);
};

export const useProvider = (props: AdapterProps) => {
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

const TWAP = (props: AdapterProps) => {
  const provider = useProvider(props);
  const theme = useMemo(() => (props.isDarkTheme ? darkTheme : lightTheme), [props.isDarkTheme]);
  const { srcToken, dstToken } = useSelectedParsedTokens(props);
  const { srcUsd, dstUsd } = useUsd(props);
  const marketPrice = useMarketPrice(props);

  return (
    <ThemeProvider theme={theme}>
      <WidgetProvider
        connect={props.connect!}
        config={props.config}
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
      >
        <GlobalStyles />
        <Styles.StyledColumnFlex gap={16}>
          {props.isLimitPanel ? <LimitPanel /> : <TWAPPanel />}
          <Widget.ErrorMessage />
          <Widget.SubmitOrderPanel />
          <Components.LimitPriceMessage />
          <Widget.Orders />
          <Widget.PoweredByOrbs />
        </Styles.StyledColumnFlex>
      </WidgetProvider>
    </ThemeProvider>
  );
};

const InputsPanel = () => {
  return (
    <StyledTop>
      <TokenPanel isSrcToken={true} />
      <Widget.SwitchTokens />
      <TokenPanel isSrcToken={false} />
    </StyledTop>
  );
};

const LimitPrice = () => {
  return (
    <>
      <Widget.LimitPriceSwitch />
      <Widget.LimitPricePanel>
        <Widget.LimitPricePanel.Main />
      </Widget.LimitPricePanel>
    </>
  );
};

const TWAPPanel = () => {
  return (
    <>
      <LimitPrice />
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
        <Components.Base.Label>{isSrcToken ? "Allocate" : "Buy"}</Components.Base.Label>
        <Widget.TokenPanel.BalanceSelect />
      </Widget.Panel.Header>
      <Styles.StyledRowFlex className={`${Widget.TokenPanel.ClassName}-top`}>
        <Widget.TokenPanel.Input />
        <Widget.TokenPanel.Select />
      </Styles.StyledRowFlex>
      <Styles.StyledRowFlex className={`${Widget.TokenPanel.ClassName}-bottom`}>
        <Widget.TokenPanel.Usd prefix={"~$ "} />
        <Widget.TokenPanel.Balance prefix={<span> Balance: </span>} />
      </Styles.StyledRowFlex>
    </Widget.TokenPanel>
  );
};

const LimitPanel = () => {
  return (
    <>
      <StyledLimitAndInputs>
        <LimitPrice />
        <InputsPanel />
      </StyledLimitAndInputs>
      <Widget.DurationPanel>
        <Widget.DurationPanel.Main />
      </Widget.DurationPanel>
    </>
  );
};

export { TWAP };
