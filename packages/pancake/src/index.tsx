import { GlobalStyles, Box, ThemeProvider, Typography, styled } from "@mui/material";
import { Components, hooks, Translations, TwapAdapter, Styles as TwapStyles, store, TWAPProps, Orders, TwapContextUIPreferences, Styles } from "@orbs-network/twap-ui";
import translations from "./i18n/en.json";
import {
  Card,
  configureStyles,
  darkTheme,
  lightTheme,
  StyledAcceptDisclaimer,
  StyledButton,
  StyledChunksInput,
  StyledChunksSlider,
  StyledColumnFlex,
  StyledLimitPrice,
  StyledLimitPriceBody,
  StyledLimitPriceBottom,
  StyledLimitPriceLabel,
  StyledMarketPriceContainer,
  StyledOutputAddress,
  StyledPoweredBy,
  StyledReset,
  StyledSummaryModal,
  StyledTimeSelect,
  StyledTimeSelectBody,
  StyledTimeSelectContainer,
  StyledTimeSelectHeader,
  StyledTotalChunks,
  StyledTradeSize,
} from "./styles";
import { FaExchangeAlt } from "@react-icons/all-files/fa/FaExchangeAlt";

import { JSXElementConstructor, memo, ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import {
  StyledBalance,
  StyledEmptyUSD,
  StyledMarketPrice,
  StyledPercentSelect,
  StyledSelectAndBalance,
  StyledTokenChange,
  StyledTokenChangeContainer,
  StyledTokenPanel,
  StyledTokenPanelInput,
  StyledTokenSelect,
  StyledUSD,
} from "./styles";
import { chainId, isNativeAddress, TokenERC1155, zeroAddress } from "@defi.org/web3-candies";
import { Configs, TokenData } from "@orbs-network/twap";
import { createContext, useContext } from "react";
import Web3 from "web3";
import _ from "lodash";
import BN from "bignumber.js";

import { MdArrowDropDown } from "@react-icons/all-files/md/MdArrowDropDown";
import { AiOutlineArrowDown } from "@react-icons/all-files/ai/AiOutlineArrowDown";
import { GrPowerReset } from "@react-icons/all-files/gr/GrPowerReset";
import { BsQuestionCircle } from "@react-icons/all-files/bs/BsQuestionCircle";
import PancakeOrders from "./PancakeOrders";

const uiPreferences: TwapContextUIPreferences = {
  usdSuffix: " USD",
  usdPrefix: "~",
  usdEmptyUI: <></>,
  balanceEmptyUI: <></>,
  switchVariant: "ios",
  inputPlaceholder: "0.0",
  infoIcon: BsQuestionCircle,
  inputLoader: <></>,
  input: {
    showOnLoading: true,
  },
};

interface AdapterProps extends TWAPProps {
  dappTokens: { [key: string]: any };
  isDarkTheme?: boolean;
  ConnectButton: JSXElementConstructor<any>;
  onTokenSelectClick: (isFrom: boolean) => void;
}

const AdapterContext = createContext({} as AdapterProps);

const AdapterContextProvider = AdapterContext.Provider;

const useAdapterContext = () => useContext(AdapterContext);

const config = Configs.PancakeSwap;

const parseToken = (rawToken: any): TokenData | undefined => {
  const { address, decimals, symbol, logoURI } = rawToken;
  if (!symbol) {
    console.error("Invalid token", rawToken);
    return;
  }
  if (!address || isNativeAddress(address) || address === "BNB") {
    return config.nativeToken;
  }
  return {
    address: Web3.utils.toChecksumAddress(address),
    decimals,
    symbol,
    logoUrl: logoURI,
  };
};

const storeOverride = {
  isLimitOrder: true,
  chunks: 1,
  customDuration: { resolution: store.TimeResolution.Days, amount: 7 },
  customFillDelay: { resolution: store.TimeResolution.Minutes, amount: 2 },
};

const Balance = ({ isSrc }: { isSrc?: boolean }) => {
  const onPercentClick = hooks.useCustomActions().onPercentClick;

  return (
    <div onClick={isSrc ? () => onPercentClick(1) : () => {}}>
      <StyledBalance isSrc={isSrc} decimalScale={6} />
    </div>
  );
};

const TokenPanel = ({ isSrcToken = false }: { isSrcToken?: boolean }) => {
  const onTokenSelectClick = useAdapterContext().onTokenSelectClick;
  return (
    <StyledTokenPanel>
      <Card.Header>
        <StyledSelectAndBalance>
          <StyledTokenSelect CustomArrow={MdArrowDropDown} hideArrow={false} isSrc={isSrcToken} onClick={() => onTokenSelectClick(isSrcToken)} />
          <Balance isSrc={isSrcToken} />
        </StyledSelectAndBalance>
      </Card.Header>
      <Card.Body editable={true}>
        <Styles.StyledColumnFlex width="auto" gap={1} style={{ alignItems: "flex-end" }}>
          <StyledTokenPanelInput dstDecimalScale={3} isSrc={isSrcToken} />
          <StyledUSD decimalScale={2} isSrc={isSrcToken} emptyUi={<StyledEmptyUSD />} />
        </Styles.StyledColumnFlex>
        {isSrcToken && <SrcTokenPercentSelector />}
      </Card.Body>{" "}
    </StyledTokenPanel>
  );
};

const CurrentMarketPrice = () => {
  return (
    <StyledMarketPriceContainer justifyContent="space-between">
      <Components.Base.Label>Market price</Components.Base.Label>
      <StyledMarketPrice hideLabel={true} />
    </StyledMarketPriceContainer>
  );
};

const PERCENT = [
  { text: "25%", value: 0.25 },
  { text: "50%", value: 0.5 },
  { text: "75%", value: 0.75 },
  { text: "MAX", value: 1 },
];

const SrcTokenPercentSelector = () => {
  const onPercentClick = hooks.useCustomActions().onPercentClick;
  const { srcAmount, srcBalance, getMaxSrcInputAmount } = store.useTwapStore((state) => ({
    srcAmount: state.getSrcAmount(),
    srcBalance: state.srcBalance,
    getMaxSrcInputAmount: state.getMaxSrcInputAmount(),
  }));

  const percent = useMemo(() => {
    return srcAmount.dividedBy(srcBalance).toNumber();
  }, [srcAmount]);

  const onClick = (value: number) => {
    onPercentClick(value);
  };

  return (
    <StyledPercentSelect>
      {PERCENT.map((p) => {
        const selected = BN(srcAmount || "0").isZero()
          ? false
          : Math.round(percent * 100) === p.value * 100 || (p.value === 1 && BN(getMaxSrcInputAmount || 0).isEqualTo(srcAmount));
        return (
          <StyledButton selected={selected ? 1 : 0} key={p.text} onClick={() => onClick(p.value)}>
            {p.text}
          </StyledButton>
        );
      })}
    </StyledPercentSelect>
  );
};

const OrderSummary = ({ children }: { children: ReactNode }) => {
  return (
    <StyledSummaryModal title="Review order">
      <TwapStyles.StyledColumnFlex gap={14}>
        <TwapStyles.StyledColumnFlex gap={14}>
          <Components.Base.Card>
            <Components.OrderSummaryTokenDisplay isSrc={true} />
          </Components.Base.Card>
          <Components.Base.Card>
            <Components.OrderSummaryTokenDisplay />
          </Components.Base.Card>
          <Components.Base.Card>
            <Components.OrderSummaryLimitPrice />
          </Components.Base.Card>
          <Components.Base.Card>{children}</Components.Base.Card>
          <Components.Base.Card>
            <TwapStyles.StyledColumnFlex gap={10}>
              <Components.DisclaimerText />
            </TwapStyles.StyledColumnFlex>
          </Components.Base.Card>
        </TwapStyles.StyledColumnFlex>
        <Components.Base.Card>
          <TwapStyles.StyledColumnFlex gap={12}>
            <StyledAcceptDisclaimer />
            <StyledOutputAddress />
          </TwapStyles.StyledColumnFlex>
        </Components.Base.Card>
        <Components.SubmitButton />
      </TwapStyles.StyledColumnFlex>
    </StyledSummaryModal>
  );
};

const ChangeTokensOrder = () => {
  return (
    <StyledTokenChangeContainer>
      <StyledTokenChange icon={<AiOutlineArrowDown />} />
    </StyledTokenChangeContainer>
  );
};

const TWAP = memo((props: AdapterProps) => {
  const theme = useMemo(() => {
    return props.isDarkTheme ? darkTheme : lightTheme;
  }, [props.isDarkTheme]);

  const useTrade = (fromToken?: string, toToken?: string, value?: string) => {
    return props.useTrade!(isNativeAddress(fromToken || "") ? "BNB" : fromToken, toToken, value);
  };

  return (
    <Box className="twap-adapter-wrapper">
      <TwapAdapter
        connect={props.connect}
        config={config}
        maxFeePerGas={props.maxFeePerGas}
        priorityFeePerGas={props.priorityFeePerGas}
        translations={translations as Translations}
        provider={props.provider}
        account={props.account}
        srcToken={props.srcToken}
        dstToken={props.dstToken}
        storeOverride={props.limit ? storeOverride : undefined}
        parseToken={parseToken}
        dappTokens={props.dappTokens}
        uiPreferences={uiPreferences}
        onDstTokenSelected={props.onDstTokenSelected}
        usePriceUSD={props.usePriceUSD}
        onSrcTokenSelected={props.onSrcTokenSelected}
        useTrade={useTrade}
        isDarkTheme={props.isDarkTheme}
      >
        <ThemeProvider theme={theme}>
          <GlobalStyles styles={configureStyles(theme) as any} />
          <AdapterContextProvider value={props}>
            {props.limit ? <LimitPanel /> : <TWAPPanel />}
            <PancakeOrders />
          </AdapterContextProvider>
        </ThemeProvider>
      </TwapAdapter>
    </Box>
  );
});

const TopPanel = () => {
  return (
    <Styles.StyledColumnFlex gap={0}>
      <TokenPanel isSrcToken={true} />
      <ChangeTokensOrder />
      <TokenPanel />
    </Styles.StyledColumnFlex>
  );
};

const OpenConfirmationModalButton = () => {
  const { ConnectButton, provider } = useAdapterContext();

  if (!provider) {
    return (
      <StyledButtonContainer>
        <ConnectButton />
      </StyledButtonContainer>
    );
  }

  return (
    <StyledButtonContainer>
      <Components.SubmitButton isMain={true} />
    </StyledButtonContainer>
  );
};

const StyledButtonContainer = styled("div")({
  width: "100%",
  "> *": {
    width: "100%",
  },
  marginTop: 10,
});

const LimitPanel = () => {
  return (
    <div className="twap-container">
      <StyledColumnFlex>
        <TopPanel />
        <CurrentMarketPrice />
        <LimitPrice limitOnly={true} />
        <OpenConfirmationModalButton />
      </StyledColumnFlex>
      <OrderSummary>
        <TwapStyles.StyledColumnFlex>
          <Components.OrderSummaryDetailsDeadline />
          <Components.OrderSummaryDetailsOrderType />
          <Components.OrderSummaryDetailsChunkSize />
          <Components.OrderSummaryDetailsMinDstAmount />
        </TwapStyles.StyledColumnFlex>
      </OrderSummary>
      <StyledPoweredBy />
    </div>
  );
};

const TWAPPanel = () => {
  return (
    <div className="twap-container">
      <StyledColumnFlex>
        <TopPanel />
        <CurrentMarketPrice />
        <LimitPrice />
        <TotalTrades />
        <TradeSize />
        <TradeInterval />
        <MaxDuration />
        <OpenConfirmationModalButton />
      </StyledColumnFlex>
      <OrderSummary>
        <Components.OrderSummaryDetails />
      </OrderSummary>
      <StyledPoweredBy />
    </div>
  );
};

const TotalTrades = () => {
  const { getChunksBiggerThanOne, srcAmount } = store.useTwapStore((store) => ({
    getChunksBiggerThanOne: store.getChunksBiggerThanOne(),
    srcAmount: store.getSrcAmount(),
  }));

  if (srcAmount.isZero()) return null;

  if (!getChunksBiggerThanOne) {
    return (
      <TwapStyles.StyledRowFlex justifyContent="space-between">
        <Components.Labels.TotalTradesLabel />
        <Typography style={{ fontSize: 14 }}>1</Typography>
      </TwapStyles.StyledRowFlex>
    );
  }
  return (
    <StyledTotalChunks>
      <Card.Header>
        <Components.Labels.TotalTradesLabel />
      </Card.Header>
      <Card.Body editable={true}>
        <TwapStyles.StyledRowFlex gap={15} justifyContent="space-between">
          <StyledChunksSlider />
          <StyledChunksInput />
        </TwapStyles.StyledRowFlex>
      </Card.Body>
    </StyledTotalChunks>
  );
};

const TradeSize = () => {
  const value = store.useTwapStore((store) => store.getSrcChunkAmountUi());

  if (BN(value || "0").isZero()) return null;
  return (
    <StyledTradeSize>
      <Components.Labels.ChunksAmountLabel />
      <Components.TradeSize hideLabel={true} hideLogo={true} />
    </StyledTradeSize>
  );
};

const MaxDuration = () => {
  return (
    <StyledTimeSelectContainer>
      <StyledTimeSelectHeader>
        <Components.Labels.MaxDurationLabel />
      </StyledTimeSelectHeader>
      <StyledTimeSelect>
        <StyledTimeSelectBody editable={true}>
          <Components.MaxDurationSelector />
        </StyledTimeSelectBody>
        <Components.PartialFillWarning />
      </StyledTimeSelect>
    </StyledTimeSelectContainer>
  );
};

const TradeInterval = () => {
  return (
    <StyledTimeSelectContainer>
      <StyledTimeSelectHeader>
        <Components.Labels.TradeIntervalLabel />
      </StyledTimeSelectHeader>
      <StyledTimeSelect>
        <StyledTimeSelectBody editable={true}>
          <Components.TradeIntervalSelector />
        </StyledTimeSelectBody>
        <Components.FillDelayWarning />
      </StyledTimeSelect>
    </StyledTimeSelectContainer>
  );
};

const LimitPrice = ({ limitOnly }: { limitOnly?: boolean }) => {
  const isLimitOrder = store.useTwapStore((store) => store.isLimitOrder);
  const { leftToken, rightToken, onChange, limitPrice, toggleInverted } = hooks.useLimitPrice();

  return (
    <StyledLimitPrice>
      <Card>
        <Card.Header>
          <TwapStyles.StyledRowFlex justifyContent="space-between">
            <StyledLimitPriceLabel>
              <Components.Labels.LimitPriceLabel />
              <Components.ResetLimitButton>
                <StyledReset>
                  <TwapStyles.StyledRowFlex gap={8}>
                    <GrPowerReset />
                    <Typography>Market</Typography>
                  </TwapStyles.StyledRowFlex>
                </StyledReset>
              </Components.ResetLimitButton>
            </StyledLimitPriceLabel>
            {!limitOnly && <Components.LimitPriceToggle />}
          </TwapStyles.StyledRowFlex>
        </Card.Header>
        {isLimitOrder && (
          <Styles.StyledColumnFlex>
            <StyledLimitPriceBody editable={true}>
              <Components.Base.NumericInput decimalScale={6} placeholder={""} onChange={onChange} value={limitPrice} />
            </StyledLimitPriceBody>
            <StyledLimitPriceBottom onClick={toggleInverted}>
              <p>
                {rightToken?.symbol} Per {leftToken?.symbol}
              </p>
              <FaExchangeAlt style={{ width: 16, height: 16 }} />
            </StyledLimitPriceBottom>
          </Styles.StyledColumnFlex>
        )}
      </Card>
    </StyledLimitPrice>
  );
};

export { TWAP, Orders };
