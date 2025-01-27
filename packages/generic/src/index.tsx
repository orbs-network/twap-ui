import { Config, TimeUnit } from "@orbs-network/twap-sdk";
import { Components, Translations, hooks, Styles, compact, size, getNetwork, Widget, useWidgetContext, UIPreferences, WidgetProps } from "@orbs-network/twap-ui";
import translations from "./i18n/en.json";
import { useEffect, useMemo } from "react";
import Web3 from "web3";
import React, { memo, ReactNode, useCallback, useState } from "react";

import {
  StyledTokenChange,
  darkTheme,
  lightTheme,
  Card,
  StyledLimitPanel,
  StyledTradeIntervalInput,
  StyledTradeIntervalResolution,
  StyledTradeInterval,
  StyledChunksSelect,
  StyledChunksSelectInput,
  StyledContent,
  StyledTop,
  StyledTwap,
  GlobalStyles,
  StyledLimitAndInputs,
  StyledChunksWarning,
  StyledLimitPanelExpiration,
  StyledLimitPanelExpirationButtons,
  StyledLimitPanelExpirationButton,
  StyledFee,
  StyledShowConfirmationButtonContainer,
  StyledChunksSelectText,
  StyledTokenPanelBalance,
  StyledTokenPanelUsd,
  StyledTokenPanelSelect,
  StyledTokenPanelBalanceSelect,
} from "./styles";
import { IoMdClose } from "@react-icons/all-files/io/IoMdClose";
import BN from "bignumber.js";
import { BsArrowDownShort } from "@react-icons/all-files/bs/BsArrowDownShort";
import { eqIgnoreCase, isNativeAddress } from "@defi.org/web3-candies";
import { Token } from "@orbs-network/twap-ui";
import { ThemeProvider } from "styled-components";

const uiPreferences: UIPreferences = {
  input: { disableThousandSeparator: true },
};

const TokenChange = () => {
  return <StyledTokenChange icon={<BsArrowDownShort />} />;
};

const useParseToken = (props: AdapterProps) => {
  return useCallback(
    (token?: any) => {
      const nativeToken = getNetwork(props.config.chainId)?.native;
      try {
        if (!token || !token.symbol) {
          return;
        }

        if (token.isNative && nativeToken) {
          return {
            ...nativeToken,
            logoUrl: props.getTokenLogo(token) || nativeToken.logoUrl,
          };
        }
        return {
          address: Web3.utils.toChecksumAddress(token.address),
          decimals: token.decimals,
          symbol: token.symbol,
          logoUrl: props.getTokenLogo(token),
        };
      } catch (error) {
        console.error("Invalid token", token);
      }
    },
    [props.config.chainId, props.getTokenLogo],
  );
};

interface AdapterProps extends Partial<WidgetProps> {
  getTokenLogo: (token: any) => string;
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
    [props.config.chainId],
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

const useParsedTokens = (props: AdapterProps) => {
  const parseToken = useParseToken(props);
  return useMemo(() => {
    if (!size(props.dappTokens)) {
      return [];
    }
    let parsed = props.dappTokens.map((rawToken: any) => {
      return parseToken(rawToken);
    });
    return compact(parsed) as Token[];
  }, [props.dappTokens, parseToken]);
};

const TokenSelect = ({ isSrcToken }: { isSrcToken?: boolean }) => {
  const {
    components: { TokensListModal },
    onSrcTokenSelected,
    onDstTokenSelected,
  } = useWidgetContext();

  const onSelect = useCallback(
    (token: any) => {
      isSrcToken ? onSrcTokenSelected?.(token) : onDstTokenSelected?.(token);
    },
    [isSrcToken, onSrcTokenSelected, onDstTokenSelected],
  );

  return (
    <TokensListModal isOpen={true} onClose={() => {}} onSelect={onSelect}>
      <div>Select</div>
    </TokensListModal>
  );
};

const TWAP = (props: AdapterProps) => {
  const provider = useProvider(props);

  const theme = useMemo(() => (props.isDarkTheme ? darkTheme : lightTheme), [props.isDarkTheme]);

  const parsedTokens = useParsedTokens(props);
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
          tokens={parsedTokens}
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
  const { hidePanel } = Widget.LimitPanel.usePanel();

  if (hidePanel) return null;

  return (
    <StyledLimitPanel>
      <Card>
        <Card.Header>
          <Widget.LimitPanel.Switch />
        </Card.Header>
        <Card.Body>
          <Widget.LimitPanel.Main />
        </Card.Body>
      </Card>
    </StyledLimitPanel>
  );
};

const ShowConfirmationButton = () => {
  return (
    <StyledShowConfirmationButtonContainer>
      <StyledFee>Fee: 0.25%</StyledFee>
      <Widget.ShowConfirmationButton />
    </StyledShowConfirmationButtonContainer>
  );
};
const TWAPPanel = () => {
  return (
    <StyledContent>
      <LimitPrice />
      <StyledTop>
        <Widget.TokenPanel.Main isSrcToken={true} />
        <TokenChange />
        <Widget.TokenPanel.Main isSrcToken={false} />
      </StyledTop>
      <TradeIntervalSelect />
      <TotalTrades />
      <ShowConfirmationButton />
    </StyledContent>
  );
};

const LimitPanel = () => {
  return (
    <StyledContent>
      <StyledLimitAndInputs>
        <LimitPrice />
        <StyledTop>
          <Widget.TokenPanel.Main isSrcToken={true} />
          <TokenChange />
          <Widget.TokenPanel.Main isSrcToken={false} />
        </StyledTop>
      </StyledLimitAndInputs>
      <LimitPanelExpiration />
      <ShowConfirmationButton />
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
  const selectedExpiry = hooks.useDuration().millis;

  const setCustomDuration = hooks.useSetDuration();
  const onChange = useCallback(
    (unit: TimeUnit) => {
      setCustomDuration({ unit, value: 1 });
    },
    [setCustomDuration],
  );

  return (
    <StyledLimitPanelExpiration>
      <Components.Labels.MaxDurationLabel />
      <StyledLimitPanelExpirationButtons>
        {LimitPanelExpirationOptions.map((it) => {
          return (
            <StyledLimitPanelExpirationButton key={it.value} onClick={() => onChange(it.value)} selected={selectedExpiry === it.value ? 1 : 0}>
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
    <Card>
      <Card.Header>
        <Widget.TradesAmountSelect.Label />
      </Card.Header>
      <StyledChunksSelect>
        <Styles.StyledRowFlex style={{ alignItems: "stretch" }}>
          <StyledChunksSelectInput>
            <Widget.TradesAmountSelect.Input />
            <StyledChunksSelectText>Orders</StyledChunksSelectText>
          </StyledChunksSelectInput>
        </Styles.StyledRowFlex>
      </StyledChunksSelect>
    </Card>
  );
};

const TradeIntervalSelect = () => {
  return (
    <Card>
      <Card.Header>
        <Widget.FillDelaySelect.Label />
      </Card.Header>
      <StyledTradeInterval>
        <Styles.StyledRowFlex style={{ alignItems: "stretch" }}>
          <StyledTradeIntervalInput>
            <Widget.FillDelaySelect.Input />
          </StyledTradeIntervalInput>
          <StyledTradeIntervalResolution>
            <Widget.FillDelaySelect.Resolution />
          </StyledTradeIntervalResolution>
        </Styles.StyledRowFlex>
      </StyledTradeInterval>
    </Card>
  );
};

export { TWAP };
