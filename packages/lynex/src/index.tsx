import { Configs } from "@orbs-network/twap-sdk";
import { Translations, Styles, Widget, UIPreferences, WidgetProps, WidgetProvider, Components, Types } from "@orbs-network/twap-ui";
import translations from "./i18n/en.json";
import { createContext, useContext, useEffect, useMemo, ReactNode } from "react";
import Web3 from "web3";
import React, { useCallback } from "react";
import { darkTheme, lightTheme, StyledTop, GlobalStyles, StyledTwapInputs } from "./styles";
import { IoIosArrowDown } from "@react-icons/all-files/io/IoIosArrowDown";
import { MdErrorOutline } from "@react-icons/all-files/md/MdErrorOutline";

import { eqIgnoreCase } from "@defi.org/web3-candies";
import { ThemeProvider } from "styled-components";

const uiPreferences: UIPreferences = {
  input: { disableThousandSeparator: true, placeholder: "0.0" },
  tokenSelect: { icon: <IoIosArrowDown style={{ width: 14 }} /> },
  menu: { icon: <IoIosArrowDown style={{ width: 14 }} /> },
  usd: { prefix: "$" },
  message: { errorIcon: <MdErrorOutline style={{ width: 14 }} /> },
};

const useParseToken = () => {
  const config = useConfig();

  return useCallback(
    (token?: any) => {
      try {
        if (!token) return;

        if (!token.address) return;

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
    [config.chainId]
  );
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
  title: string;
}

const useParsedTokens = () => {
  const { dexTokens } = useAdapterContext();
  const parseToken = useParseToken();
  return useMemo(() => {
    return dexTokens?.map((t: any) => {
      return parseToken(t);
    });
  }, [dexTokens, parseToken]);
};

const useSelectedParsedTokens = () => {
  const props = useAdapterContext();
  const parseToken = useParseToken();
  return useMemo(() => {
    const srcToken = props.dexTokens?.find((it: any) => eqIgnoreCase(it.address || "", props.srcTokenAddress || ""));
    const dstToken = props.dexTokens?.find((it: any) => eqIgnoreCase(it.address || "", props.dstTokenAddress || ""));
    return {
      srcToken: parseToken(srcToken),
      dstToken: parseToken(dstToken),
    };
  }, [props.srcToken, props.dstToken, parseToken, props.dexTokens, props.srcTokenAddress, props.dstTokenAddress]);
};

const useToken = (addressOrSymbol?: string) => {
  const parsedTokens = useParsedTokens();
  return useMemo(
    () =>
      parsedTokens?.find((it) => {
        return eqIgnoreCase(it?.address || "", addressOrSymbol || "") || eqIgnoreCase(it?.symbol || "", addressOrSymbol || "");
      }),
    [parsedTokens, addressOrSymbol]
  );
};

const configs = [Configs.Lynex];
const useConfig = () => {
  const { chainId } = useAdapterContext();

  return useMemo(() => {
    return configs.find((it) => it.chainId === chainId) || configs[0];
  }, [chainId]);
};

const Content = () => {
  const props = useAdapterContext();
  const theme = useMemo(() => (props.isDarkTheme ? darkTheme : lightTheme), [props.isDarkTheme]);
  const { srcToken, dstToken } = useSelectedParsedTokens();

  const config = useConfig();

  return (
    <ThemeProvider theme={theme}>
      <WidgetProvider
        connect={props.connect!}
        config={config}
        minChunkSizeUsd={props.minChunkSizeUsd}
        translations={translations as Translations}
        walletProvider={props.walletProvider}
        walletClientTransport={props.walletClientTransport}
        account={props.account}
        srcToken={srcToken}
        dstToken={dstToken}
        onSrcTokenSelected={props.onSrcTokenSelected}
        onDstTokenSelected={props.onDstTokenSelected}
        isLimitPanel={props.isLimitPanel}
        uiPreferences={uiPreferences}
        onSwitchTokens={props.onSwitchTokens}
        srcUsd1Token={props.srcUsd1Token ? Number(props.srcUsd1Token) : 0}
        dstUsd1Token={props.dstUsd1Token ? Number(props.dstUsd1Token) : 0}
        marketPrice={props.marketPrice}
        marketPriceLoading={props.marketPriceLoading}
        chainId={props.chainId}
        isExactAppoval={props.isExactAppoval}
        components={props.components!}
        useToken={useToken}
        callbacks={props.callbacks}
        onSwitchFromNativeToWtoken={props.onSwitchFromNativeToWtoken}
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
        <Widget.LimitPricePanel.Main className="twap-panel-body" />
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
          <Widget.FillDelayPanel.Main className="twap-panel-body" />
        </Widget.FillDelayPanel>
        <Widget.TradesAmountPanel>
          <Widget.TradesAmountPanel.Main className="twap-panel-body" />
        </Widget.TradesAmountPanel>
      </StyledTwapInputs>
    </>
  );
};

const TokenPanel = ({ isSrcToken }: { isSrcToken?: boolean }) => {
  return (
    <Widget.TokenPanel isSrcToken={Boolean(isSrcToken)}>
      {isSrcToken && (
        <Widget.Panel.Header>
          <Widget.TokenPanel.BalanceSelect />
        </Widget.Panel.Header>
      )}
      <Styles.StyledColumnFlex className="twap-panel-body">
        <Styles.StyledRowFlex className={`${Widget.TokenPanel.ClassName}-top`}>
          <Widget.TokenPanel.Input />
          <Widget.TokenPanel.Select />
        </Styles.StyledRowFlex>
        <Styles.StyledRowFlex className={`${Widget.TokenPanel.ClassName}-bottom`}>
          <Widget.TokenPanel.Usd />
          <Widget.TokenPanel.Balance prefix={<span> Balance: </span>} />
        </Styles.StyledRowFlex>
      </Styles.StyledColumnFlex>
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
