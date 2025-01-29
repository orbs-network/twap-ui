import { Config, TimeUnit } from "@orbs-network/twap-sdk";
import { Components, Translations, hooks, Styles, getNetwork, Widget, useWidgetContext, UIPreferences, WidgetProps } from "@orbs-network/twap-ui";
import translations from "./i18n/en.json";
import { useEffect, useMemo } from "react";
import Web3 from "web3";
import React, { useCallback, useState } from "react";

import {
  StyledTokenChange,
  darkTheme,
  lightTheme,
  Card,
  StyledLimitPanel,
  StyledTradeInterval,
  StyledChunksSelect,
  StyledContent,
  StyledTop,
  StyledTwap,
  GlobalStyles,
  StyledLimitAndInputs,
  StyledLimitPanelExpiration,
  StyledLimitPanelExpirationButtons,
  StyledLimitPanelExpirationButton,
  StyledChunksSelectText,
  StyledTokenPanelBalance,
  StyledTokenPanelUsd,
  StyledTokenPanel,
  StyledTokenPanelTop,
  StyledTokenPanelBottom,
  StyledTwapInputs,
} from "./styles";
import BN from "bignumber.js";
import { IoIosArrowDown } from "@react-icons/all-files/io/IoIosArrowDown";
import { eqIgnoreCase, isNativeAddress } from "@defi.org/web3-candies";
import { ThemeProvider } from "styled-components";

const uiPreferences: UIPreferences = {
  input: { disableThousandSeparator: true, placeholder: "0" },
};

const TokenChange = () => {
  return <StyledTokenChange icon={<IoIosArrowDown />} />;
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
      <StyledTwap className="twap-adapter-wrapper">
        <Widget
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
          <StyledContent>
            {props.isLimitPanel ? <LimitPanel /> : <TWAPPanel />}
            <Components.LimitPriceMessage />
            <Widget.Orders />
            <Widget.SubmitOrderModal />
            <Widget.PoweredBy />
          </StyledContent>
        </Widget>
      </StyledTwap>
    </ThemeProvider>
  );
};

const LimitPrice = () => {
  return (
    <>
      <Widget.LimitPriceSwitch />
      <StyledLimitPanel Container={Card}>
        <Widget.LimitPricePanel.Main />
      </StyledLimitPanel>
    </>
  );
};

const TWAPPanel = () => {
  return (
    <StyledContent>
      <LimitPrice />
      <StyledTop>
        <TokenPanel isSrcToken={true} />
        <TokenChange />
        <TokenPanel isSrcToken={false} />
      </StyledTop>
      <TwapInputs />
      <Widget.SubmitOrderPanel />
    </StyledContent>
  );
};

const TwapInputs = () => {
  return (
    <StyledTwapInputs>
      <TradeIntervalSelect />
      <TotalTrades />
    </StyledTwapInputs>
  );
};

const BalanceOptions = [
  { value: 0.5, text: "50%" },
  { value: 0.75, text: "75%" },
  { value: 1, text: "MAX" },
];

const TokenPanel = ({ isSrcToken }: { isSrcToken?: boolean }) => {
  return (
    <StyledTokenPanel isSrcToken={Boolean(isSrcToken)}>
      <Card.Header>
        <Components.Base.Label>{isSrcToken ? "Allocate" : "Buy"}</Components.Base.Label>
        <Widget.TokenPanel.BalanceSelect options={BalanceOptions} />
      </Card.Header>

      <StyledTokenPanelTop>
        <Widget.TokenPanel.Input />
        <Widget.TokenPanel.Select endIcon={<IoIosArrowDown />} />
      </StyledTokenPanelTop>
      <StyledTokenPanelBottom>
        <StyledTokenPanelUsd>
          ~$ <Widget.TokenPanel.Usd />
        </StyledTokenPanelUsd>

        <StyledTokenPanelBalance>
          <span> Balance: </span>
          <Widget.TokenPanel.Balance />
        </StyledTokenPanelBalance>
      </StyledTokenPanelBottom>
    </StyledTokenPanel>
  );
};

const LimitPanel = () => {
  return (
    <StyledContent>
      <StyledLimitAndInputs>
        <LimitPrice />
        <StyledTop>
          <TokenPanel isSrcToken={true} />
          <TokenChange />
          <TokenPanel isSrcToken={false} />
        </StyledTop>
      </StyledLimitAndInputs>
      <LimitPanelExpiration />
      <Widget.SubmitOrderPanel />
    </StyledContent>
  );
};
const LimitPanelExpirationOptions = [
  {
    text: "1 Day",
    value: TimeUnit.Days,
  },
  {
    text: "1 Week",
    value: TimeUnit.Weeks,
  },
  {
    text: "1 Month",
    value: TimeUnit.Months,
  },
  {
    text: "1 Year",
    value: TimeUnit.Years,
  },
];

const LimitPanelExpiration = () => {
  const {
    twap: {
      values: { durationMilliseconds },
      actionHandlers,
    },
  } = useWidgetContext();

  const onChange = useCallback(
    (unit: TimeUnit) => {
      actionHandlers.setDuration({ unit, value: 1 });
    },
    [actionHandlers.setDuration]
  );

  return (
    <StyledLimitPanelExpiration>
      <Components.Labels.MaxDurationLabel />
      <StyledLimitPanelExpirationButtons>
        {LimitPanelExpirationOptions.map((it) => {
          return (
            <StyledLimitPanelExpirationButton key={it.value} onClick={() => onChange(it.value)} selected={durationMilliseconds === it.value ? 1 : 0}>
              {it.text}
            </StyledLimitPanelExpirationButton>
          );
        })}
      </StyledLimitPanelExpirationButtons>
    </StyledLimitPanelExpiration>
  );
};

const TotalTrades = () => {
  return (
    <StyledChunksSelect>
      <Card.Header>
        <Widget.TradesAmountSelect.Label />
      </Card.Header>
      <Widget.TradesAmountSelect>
        <Styles.StyledColumnFlex>
          <Styles.StyledRowFlex>
            <Widget.TradesAmountSelect.Input />
            <StyledChunksSelectText>Orders</StyledChunksSelectText>
          </Styles.StyledRowFlex>
        </Styles.StyledColumnFlex>
      </Widget.TradesAmountSelect>
    </StyledChunksSelect>
  );
};

const TradeIntervalSelect = () => {
  return (
    <StyledTradeInterval>
      <Card.Header>
        <Widget.FillDelaySelect.Label />
      </Card.Header>
      <Widget.FillDelaySelect>
        <Styles.StyledRowFlex>
          <Widget.FillDelaySelect.Input />
          <Widget.FillDelaySelect.Resolution />
        </Styles.StyledRowFlex>
      </Widget.FillDelaySelect>
    </StyledTradeInterval>
  );
};

export { TWAP };
