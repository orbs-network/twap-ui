import { GlobalStyles, Box, ThemeProvider, Typography, styled } from "@mui/material";
import {
  Components,
  hooks,
  Translations,
  TwapAdapter,
  Styles as TwapStyles,
  store,
  TwapErrorWrapper,
  TWAPProps,
  OrdersPanel,
  Orders,
  TwapContextUIPreferences,
} from "@orbs-network/twap-ui";
import translations from "./i18n/en.json";
import {
  configureStyles,
  darkTheme,
  lightTheme,
  StyledAcceptDisclaimer,
  StyledButton,
  StyledChunksInput,
  StyledChunksSlider,
  StyledColumnFlex,
  StyledLimitPrice,
  StyledLimitPriceInput,
  StyledMarketPriceContainer,
  StyledOutputAddress,
  StyledPoweredBy,
  StyledReset,
  StyledSummaryModal,
} from "./styles";

import React, { JSXElementConstructor, memo, ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import {
  StyledBalance,
  StyledContainer,
  StyledContainerContent,
  StyledEmptyUSD,
  StyledMarketPrice,
  StyledPercentSelect,
  StyledSelectAndBalance,
  StyledTokenChange,
  StyledTokenChangeContainer,
  StyledTokenPanel,
  StyledTokenPanelInput,
  StyledTokenPanelInputContainer,
  StyledTokenSelect,
  StyledUSD,
} from "./styles";
import { MdArrowDropDown } from "react-icons/md";
import { AiOutlineArrowDown } from "react-icons/ai";
import { eqIgnoreCase, isNativeAddress, zeroAddress } from "@defi.org/web3-candies";
import { Configs, TokenData } from "@orbs-network/twap";
import { createContext, useContext } from "react";
import { GrPowerReset } from "react-icons/gr";
import Web3 from "web3";
import _ from "lodash";

const uiPreferences: TwapContextUIPreferences = {
  usdSuffix: " USD",
  usdPrefix: " ",
  usdEmptyUI: <></>,
  balanceEmptyUI: <></>,
  switchVariant: "ios",
  getOrdersTabsLabel: (label: string, amount: number) => `${label} (${amount})`,
  inputPlaceholder: "0.0",
};

interface AdapterProps extends TWAPProps {
  dappTokens: { [key: string]: any };
  isDarkTheme?: boolean;
  connector?: any;
  ConnectButton: JSXElementConstructor<any>;
  useModal?: any;
  onSrcTokenSelected: (token: any) => void;
  onDstTokenSelected: (token: any) => void;
  nativeToken: any;
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

const useOnTokenSelection = (isSrcToken: boolean) => {
  const onTokenSelectedCallback = useSelectTokenCallback();
  const { dappTokens } = useAdapterContext();
  const tokensLength = _.size(dappTokens);

  const srcToken = store.useTwapStore((s) => s.srcToken);
  const dstToken = store.useTwapStore((s) => s.dstToken);

  const selectedCurrency = useMemo(() => {
    return store.getTokenFromTokensList(dappTokens, srcToken?.address || srcToken?.symbol);
  }, [srcToken?.address, srcToken?.symbol, tokensLength]);

  const otherSelectedCurrency = useMemo(() => {
    return store.getTokenFromTokensList(dappTokens, dstToken?.address || dstToken?.symbol);
  }, [dstToken?.address, dstToken?.symbol, tokensLength]);

  const selectToken = useCallback(
    (token: any) => {
      const parsedToken = parseToken(token);
      onTokenSelectedCallback(isSrcToken, token, parsedToken);
    },
    [onTokenSelectedCallback, isSrcToken]
  );

  return {
    selectToken,
    selectedCurrency,
    otherSelectedCurrency,
  };
};

const useSelectTokenCallback = () => {
  const srcTokenAddress = store.useTwapStore((s) => s.srcToken)?.address;
  const dstTokenAddress = store.useTwapStore((s) => s.dstToken)?.address;
  const { onSrcTokenSelected, onDstTokenSelected } = useAdapterContext();
  const select = hooks.useOnTokenSelectCallback();

  const switchTokens = hooks.useSwitchTokens();
  return useCallback(
    (isSrc: boolean, token: any, parsedToken?: TokenData) => {
      if (eqIgnoreCase(parsedToken?.address || "", srcTokenAddress || "") || eqIgnoreCase(parsedToken?.address || "", dstTokenAddress || "")) {
        switchTokens(onSrcTokenSelected, onDstTokenSelected);
        return;
      }
      select(isSrc, token, parsedToken, onSrcTokenSelected, onDstTokenSelected);
    },
    [select, srcTokenAddress, dstTokenAddress, onSrcTokenSelected, onDstTokenSelected]
  );
};

const TokenPanel = ({ isSrcToken = false }: { isSrcToken?: boolean }) => {
  const { selectToken, selectedCurrency, otherSelectedCurrency } = useOnTokenSelection(!!isSrcToken);

  const { useModal, TokenSelectModal } = useAdapterContext();

  const [onPresentCurrencyModal] = useModal(<TokenSelectModal otherSelectedCurrency={otherSelectedCurrency} selectedCurrency={selectedCurrency} onCurrencySelect={selectToken} />);

  return (
    <>
      <StyledTokenPanel>
        <TwapStyles.StyledColumnFlex gap={8}>
          <Container
            viewOnly={!isSrcToken}
            enabled={isSrcToken ? 1 : 0}
            label={
              <StyledSelectAndBalance>
                <StyledTokenSelect CustomArrow={MdArrowDropDown} hideArrow={false} isSrc={isSrcToken} onClick={onPresentCurrencyModal} />
                <StyledBalance decimalScale={8} isSrc={isSrcToken} />
              </StyledSelectAndBalance>
            }
          >
            {" "}
            <StyledTokenPanelInputContainer>
              <StyledTokenPanelInput isSrc={isSrcToken} />
              <StyledUSD isSrc={isSrcToken} emptyUi={<StyledEmptyUSD />} />
              {isSrcToken && <SrcTokenPercentSelector />}
            </StyledTokenPanelInputContainer>
          </Container>
        </TwapStyles.StyledColumnFlex>
      </StyledTokenPanel>
    </>
  );
};

const Container = ({
  label,
  children,
  enabled,
  hideChildren,
  className = "",
  viewOnly,
}: {
  label: ReactNode;
  children: ReactNode;
  enabled?: number;
  hideChildren?: boolean;
  className?: string;
  viewOnly?: boolean;
}) => {
  return (
    <StyledContainer className={className}>
      {label}
      {!hideChildren && (
        <StyledContainerContent view={viewOnly ? 1 : 0} enabled={enabled}>
          {children}
        </StyledContainerContent>
      )}
    </StyledContainer>
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

const SrcTokenPercentSelector = () => {
  const onPercentClick = hooks.useCustomActions().onPercentClick;

  const onClick = (value: number) => {
    onPercentClick(value);
  };

  return (
    <StyledPercentSelect>
      <StyledButton onClick={() => onClick(0.25)}>25%</StyledButton>
      <StyledButton onClick={() => onClick(0.5)}>50%</StyledButton>
      <StyledButton onClick={() => onClick(0.75)}>75%</StyledButton>
      <StyledButton onClick={() => onClick(1)}>MAX</StyledButton>
    </StyledPercentSelect>
  );
};

const OrderSummary = ({ children }: { children: ReactNode }) => {
  return (
    <StyledSummaryModal>
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
  const { onSrcTokenSelected, onDstTokenSelected } = useAdapterContext();
  return (
    <StyledTokenChangeContainer>
      <StyledTokenChange onSrcTokenSelected={onSrcTokenSelected} onDstTokenSelected={onDstTokenSelected} icon={<AiOutlineArrowDown />} />
    </StyledTokenChangeContainer>
  );
};

const useProvider = (props: AdapterProps) => {
  const [provider, setProvider] = useState<any>();

  const chainId = props.connectedChainId;
  const account = props.account;

  const _getProvider = useCallback(async () => {
    if (!props.connector) return;
    const provider = await props.connector.getProvider();
    setProvider(provider);
  }, [account, chainId, setProvider, props.connector]);

  useEffect(() => {
    setProvider(undefined);
    _getProvider();
  }, [account, chainId, _getProvider, setProvider]);

  return provider;
};

const TWAP = memo((props: AdapterProps) => {
  const { dappTokens, nativeToken } = props;

  const provider = useProvider(props);
  const theme = useMemo(() => {
    return props.isDarkTheme ? darkTheme : lightTheme;
  }, [props.isDarkTheme]);

  const _dappTokens = useMemo(() => {
    if (!dappTokens) return {};

    return { [zeroAddress]: nativeToken, ...dappTokens };
  }, [_.size(props.dappTokens)]);

  return (
    <TwapErrorWrapper>
      <Box className="twap-adapter-wrapper">
        <TwapAdapter
          connect={props.connect}
          config={config}
          maxFeePerGas={props.maxFeePerGas}
          priorityFeePerGas={props.priorityFeePerGas}
          translations={translations as Translations}
          provider={provider}
          account={props.account}
          srcToken={props.srcToken}
          dstToken={props.dstToken}
          storeOverride={props.limit ? storeOverride : undefined}
          parseToken={parseToken}
          dappTokens={_dappTokens}
          uiPreferences={uiPreferences}
        >
          <ThemeProvider theme={theme}>
            <GlobalStyles styles={configureStyles(theme) as any} />
            <AdapterContextProvider value={{ ...props, provider, dappTokens: _dappTokens }}>
              {props.limit ? <LimitPanel /> : <TWAPPanel />}
              <OrdersPanel />
            </AdapterContextProvider>
          </ThemeProvider>
        </TwapAdapter>
      </Box>
    </TwapErrorWrapper>
  );
});

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
  marginTop: 20,
});

const LimitPanel = () => {
  return (
    <div className="twap-container">
      <StyledColumnFlex>
        <TokenPanel isSrcToken={true} />
        <ChangeTokensOrder />
        <TokenPanel />
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
        <TokenPanel isSrcToken={true} />
        <ChangeTokensOrder />
        <TokenPanel />
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
  const getChunksBiggerThanOne = store.useTwapStore((store) => store.getChunksBiggerThanOne());

  if (!getChunksBiggerThanOne) {
    return (
      <TwapStyles.StyledRowFlex justifyContent="space-between">
        <Components.Labels.TotalTradesLabel />
        <Typography style={{ fontSize: 14 }}>-</Typography>
      </TwapStyles.StyledRowFlex>
    );
  }
  return (
    <StyledTotalChunks enabled={1} label={<Components.Labels.TotalTradesLabel />}>
      <TwapStyles.StyledRowFlex gap={15} justifyContent="space-between">
        <StyledChunksSlider />
        <StyledChunksInput />
      </TwapStyles.StyledRowFlex>
    </StyledTotalChunks>
  );
};

const StyledTotalChunks = styled(Container)({
  ".twap-input": {
    height: 25,
  },
});

const TradeSize = () => {
  return (
    <Container label={<Components.Labels.ChunksAmountLabel />} viewOnly={true}>
      <TwapStyles.StyledRowFlex className="twap-trade-size" justifyContent="flex-end" gap={5}>
        <Components.TradeSize hideLabel={true} />
        <TwapStyles.StyledRowFlex gap={2} style={{ width: "auto" }} className="twap-usd">
          <Typography fontSize={13}>{`(`}</Typography>
          <Components.ChunksUSD />
          <Typography fontSize={13}>{`)`}</Typography>
        </TwapStyles.StyledRowFlex>
      </TwapStyles.StyledRowFlex>
    </Container>
  );
};

const MaxDuration = () => {
  return (
    <Container enabled={1} label={<Components.Labels.MaxDurationLabel />}>
      <TwapStyles.StyledRowFlex justifyContent="space-between">
        <Components.PartialFillWarning />
        <Components.MaxDurationSelector />
      </TwapStyles.StyledRowFlex>
    </Container>
  );
};

const TradeInterval = () => {
  return (
    <Container enabled={1} label={<Components.Labels.TradeIntervalLabel />}>
      <TwapStyles.StyledRowFlex style={{ flex: 1 }}>
        <Components.FillDelayWarning />
        <Components.TradeIntervalSelector />
      </TwapStyles.StyledRowFlex>
    </Container>
  );
};

const LimitPrice = ({ limitOnly }: { limitOnly?: boolean }) => {
  const isLimitOrder = store.useTwapStore((store) => store.isLimitOrder);

  return (
    <StyledLimitPrice>
      <Container
        enabled={1}
        hideChildren={!isLimitOrder}
        label={
          <TwapStyles.StyledRowFlex justifyContent="space-between">
            <TwapStyles.StyledRowFlex style={{ width: "auto" }}>
              <Components.Labels.LimitPriceLabel />
              <Components.ResetLimitButton>
                <StyledReset>
                  <TwapStyles.StyledRowFlex gap={8}>
                    <GrPowerReset />
                    <Typography>Market</Typography>
                  </TwapStyles.StyledRowFlex>
                </StyledReset>
              </Components.ResetLimitButton>
            </TwapStyles.StyledRowFlex>
            {!limitOnly && <Components.LimitPriceToggle />}
          </TwapStyles.StyledRowFlex>
        }
      >
        <StyledLimitPriceInput placeholder="0" sx={{ pointerEvents: limitOnly ? "all" : isLimitOrder ? "all" : "none" }} />
      </Container>
    </StyledLimitPrice>
  );
};

export { TWAP, Orders };
