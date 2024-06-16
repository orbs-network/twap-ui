import { GlobalStyles, Box, ThemeProvider, Typography, styled } from "@mui/material";
import {
  Components,
  hooks,
  Translations,
  TwapAdapter,
  Styles as TwapStyles,
  store,
  TWAPProps,
  Orders,
  TwapContextUIPreferences,
  Styles,
  TooltipProps,
  parseError,
  isNativeAddress,
  zeroAddress,
  SwapState,
} from "@orbs-network/twap-ui";
import translations from "./i18n/en.json";
import {
  Card,
  configureStyles,
  darkTheme,
  lightTheme,
  StyledBalanceContainer,
  StyledButton,
  StyledChunksInput,
  StyledChunksSlider,
  StyledColumnFlex,
  StyledLimitPrice,
  StyledLimitPriceBody,
  StyledLimitPriceLabel,
  StyledMarketPriceContainer,
  StyledPoweredBy,
  StyledReset,
  StyledTimeSelect,
  StyledTimeSelectBody,
  StyledTimeSelectContainer,
  StyledTimeSelectHeader,
  StyledTotalChunks,
  StyledTradeSize,
  StyledModalHeaderClose,
  StyledModalHeader,
  StyledSwapModalContent,
  StyledModalHeaderTitle,
} from "./styles";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { Configs, TokenData } from "@orbs-network/twap";
import { createContext, useContext } from "react";
import Web3 from "web3";
import _ from "lodash";
import BN from "bignumber.js";
import { MdArrowDropDown } from "@react-icons/all-files/md/MdArrowDropDown";
import { AiOutlineArrowDown } from "@react-icons/all-files/ai/AiOutlineArrowDown";
import { GrPowerReset } from "@react-icons/all-files/gr/GrPowerReset";
import PancakeOrders from "./PancakeOrders";
import { getTokenFromTokensList } from "@orbs-network/twap-ui";
import { IoMdClose } from "@react-icons/all-files/io/IoMdClose";
import { OrderSummary } from "./OrderSummary";
import { useTwapContext } from "@orbs-network/twap-ui";
import { useAdapterContext, AdapterContextProvider, AdapterProps } from "./context";
import { Price } from "./components";
import { create } from "zustand";

const PERCENT = [
  { text: "25%", value: 0.25 },
  { text: "50%", value: 0.5 },
  { text: "75%", value: 0.75 },
  { text: "MAX", value: 1 },
];

const Button = (props: any) => {
  const DappButton = useAdapterContext().Button;

  return (
    <DappButton onClick={props.onClick} disabled={props.disabled || props.loading}>
      {props.children}
    </DappButton>
  );
};

const Tooltip = ({ text, children, childrenStyles = {} }: TooltipProps) => {
  const useTooltip = useAdapterContext().useTooltip;
  const { targetRef, tooltip, tooltipVisible } = useTooltip(text, { placement: "top", hideTimeout: 0 });
  return (
    <span ref={targetRef} style={{ ...childrenStyles }}>
      {children} {tooltipVisible && tooltip}
    </span>
  );
};

const uiPreferences: TwapContextUIPreferences = {
  usdSuffix: " USD",
  usdPrefix: "~",
  usdEmptyUI: <></>,
  balanceEmptyUI: <></>,
  switchVariant: "ios",
  inputPlaceholder: "0.0",
  Tooltip,
  Button,
  orders: {
    paginationChunks: 4,
    hideUsd: true,
  },
  modal: {
    styles: {
      zIndex: 1,
    },
  },
};

const config = Configs.PancakeSwap;

export const parseToken = (rawToken: any): TokenData | undefined => {
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
  const onPercentClick = hooks.useCustomActions();

  return (
    <StyledBalanceContainer onClick={isSrc ? () => onPercentClick(1) : () => {}}>
      <StyledBalance isSrc={isSrc} decimalScale={6} />
    </StyledBalanceContainer>
  );
};

const TokenPanel = ({ isSrcToken = false }: { isSrcToken?: boolean }) => {
  const selectToken = hooks.useSelectTokenCallback();
  const { dstToken, srcToken } = hooks.useDappRawSelectedTokens();

  const onSelect = useCallback(
    (token: any) => {
      selectToken({ isSrc: !!isSrcToken, token });
    },
    [selectToken, isSrcToken]
  );
  const onTokenSelectClick = useAdapterContext().useTokenModal(onSelect, srcToken, dstToken, isSrcToken);
  return (
    <StyledTokenPanel>
      <Card.Header>
        <StyledSelectAndBalance>
          <StyledTokenSelect CustomArrow={MdArrowDropDown} hideArrow={false} isSrc={isSrcToken} onClick={onTokenSelectClick} />
          <Balance isSrc={isSrcToken} />
        </StyledSelectAndBalance>
      </Card.Header>
      <Card.Body editable={true}>
        <Styles.StyledColumnFlex width="auto" gap={1} style={{ alignItems: "flex-end" }}>
          <StyledTokenPanelInput dstDecimalScale={dstToken?.decimals || 3} isSrc={isSrcToken} />
          <StyledUSD decimalScale={2} isSrc={isSrcToken} emptyUi={<StyledEmptyUSD />} />
        </Styles.StyledColumnFlex>
        {isSrcToken && <SrcTokenPercentSelector />}
      </Card.Body>{" "}
    </StyledTokenPanel>
  );
};

const SrcTokenPercentSelector = () => {
  const onPercentClick = hooks.useCustomActions();
  const srcAmount = hooks.useSrcAmount()
  const srcBalance = hooks.useSrcBalance().data;

  const maxSrcInputAmount = hooks.useMaxSrcInputAmount();

  const percent = useMemo(() => {
    return srcAmount.dividedBy(srcBalance || "0").toNumber();
  }, [srcAmount, srcBalance]);

  const onClick = (value: number) => {
    onPercentClick(value);
  };

  return (
    <StyledPercentSelect>
      {PERCENT.map((p) => {
        const selected = BN(srcAmount || "0").isZero() ? false : Math.round(percent * 100) === p.value * 100 || (p.value === 1 && BN(maxSrcInputAmount || 0).isEqualTo(srcAmount));
        return (
          <StyledButton selected={selected ? 1 : 0} key={p.text} onClick={() => (selected ? () => {} : onClick(p.value))}>
            {p.text}
          </StyledButton>
        );
      })}
    </StyledPercentSelect>
  );
};

const ChangeTokensOrder = () => {
  return (
    <StyledTokenChangeContainer>
      <StyledTokenChange icon={<AiOutlineArrowDown />} />
    </StyledTokenChangeContainer>
  );
};

const handleAddress = (address?: string) => {
  return isNativeAddress(address || "") ? "BNB" : address;
};

export const useProvider = (props: AdapterProps) => {
  const [provider, setProvider] = useState<any>(undefined);

  const setProviderFromConnector = useCallback(async () => {
    const res = await props.connector?.getProvider();
    setProvider(res);
  }, [setProvider, props.connector]);

  useEffect(() => {
    setProviderFromConnector();
  }, [props.account, props.connectedChainId, setProviderFromConnector]);

  return provider;
};

const useTrade = (props: AdapterProps) => {
  const { srcToken, toToken } = store.useTwapStore((s) => ({
    srcToken: s.srcToken?.address,
    toToken: s.dstToken?.address,
  }));

  const srcAmount = hooks.useSrcAmount().toString()

  const res = props.useTrade!(handleAddress(srcToken), handleAddress(toToken), srcAmount === "0" ? undefined : srcAmount);

  return {
    outAmount: res?.outAmount,
    isLoading: BN(srcAmount || "0").gt(0) && res?.isLoading,
  };
};

const TWAP = memo((props: AdapterProps) => {
  const provider = useProvider(props);
  const trade = useTrade(props);

  const theme = useMemo(() => {
    return props.isDarkTheme ? darkTheme : lightTheme;
  }, [props.isDarkTheme]);

  const dappTokens = useMemo(() => {
    if (!props.dappTokens || !props.nativeToken) return undefined;
    return {
      ...props.dappTokens,
      [zeroAddress]: props.nativeToken,
    };
  }, [props.dappTokens, props.nativeToken]);

  return (
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
        dappTokens={dappTokens}
        uiPreferences={uiPreferences}
        onDstTokenSelected={props.onDstTokenSelected}
        usePriceUSD={props.usePriceUSD}
        onSrcTokenSelected={props.onSrcTokenSelected}
        isDarkTheme={props.isDarkTheme}
        isMobile={props.isMobile}
        connectedChainId={props.connectedChainId}
        enableQueryParams={true}
        dstAmountOut={trade?.outAmount}
        dstAmountLoading={trade?.isLoading}
      >
        <ThemeProvider theme={theme}>
          <GlobalStyles styles={configureStyles(theme) as any} />
          <AdapterContextProvider value={{ ...props, provider, dappTokens }}>
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
  const { ConnectButton, provider, Button } = useAdapterContext();
  const { onClick, text, disabled } = hooks.useShowConfirmationModalButton();

  if (!provider) {
    return (
      <StyledButtonContainer>
        <ConnectButton />
      </StyledButtonContainer>
    );
  }

  return (
    <StyledButtonContainer>
      <Button onClick={onClick} disabled={disabled}>
        {text}
      </Button>
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
        <TwapStyles.StyledColumnFlex>
          <LimitPrice limitOnly={true} />
          <Price />
        </TwapStyles.StyledColumnFlex>
        <OpenConfirmationModalButton />
      </StyledColumnFlex>
      <SwapModal limitPanel={true} />
      <StyledPoweredBy />
    </div>
  );
};

const TWAPPanel = () => {
  return (
    <div className="twap-container">
      <StyledColumnFlex>
        <TopPanel />
        <LimitPrice />
        <Price />
        <TotalTrades />
        <TradeSize />
        <TradeInterval />
        <MaxDuration />
        <SwapModal limitPanel={false} />
        <OpenConfirmationModalButton />
      </StyledColumnFlex>
      <StyledPoweredBy />
    </div>
  );
};

const TotalTrades = () => {
  const srcAmount = hooks.useSrcAmount()

  const getChunksBiggerThanOne = hooks.useChunksBiggerThanOne();

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
  const value = hooks.useSrcChunkAmountUi();

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
  const { onInvert, isLoading } = hooks.useLimitPriceV2();
  const { TradePriceToggle } = useAdapterContext();

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
                    <Typography>Reset</Typography>
                  </TwapStyles.StyledRowFlex>
                </StyledReset>
              </Components.ResetLimitButton>
            </StyledLimitPriceLabel>
            <TwapStyles.StyledRowFlex style={{ width: "auto", gap: 0 }}>
              {!limitOnly && <Components.LimitPriceToggle />}
              <TradePriceToggle onClick={onInvert} loading={!!isLoading} />
            </TwapStyles.StyledRowFlex>
          </TwapStyles.StyledRowFlex>
        </Card.Header>
        {isLimitOrder && (
          <Styles.StyledColumnFlex>
            <StyledLimitPriceBody editable={true}>
              <Components.LimitInputV2 />
            </StyledLimitPriceBody>
          </Styles.StyledColumnFlex>
        )}
      </Card>
    </StyledLimitPrice>
  );
};

export { TWAP, Orders };



const SwapModal = ({ limitPanel }: { limitPanel: boolean }) => {
  const { dappTokens, ApproveModalContent, SwapPendingModalContent, SwapTransactionErrorContent, AddToWallet, SwapTransactionReceiptModalContent } = useAdapterContext();
  const { fromToken, setShowConfirmation, showConfirmation, txHash, isLimitOrder, disclaimerAccepted, swapState, createOrderError, createOrderLoading } = store.useTwapStore((s) => ({
    fromToken: s.srcToken,
    setShowConfirmation: s.setShowConfirmation,
    showConfirmation: s.showConfirmation,
    txHash: s.txHash,
    isLimitOrder: s.isLimitOrder,
    disclaimerAccepted: s.disclaimerAccepted,
    swapState: s.swapState,
    createOrderError: s.createOrderError,
    createOrderLoading: s.createOrderLoading
  }));
  const reset = hooks.useResetStore();

  const {mutate: submitOrder} =  hooks.useSubmitOrder()
  const {isWrongChain} = useTwapContext()

  const inputCurrency = useMemo(() => getTokenFromTokensList(dappTokens, fromToken?.address), [dappTokens, fromToken]);

  let content = null;
  let title: string | undefined = undefined;


  const onClose = () => {
    setShowConfirmation(false);
    if (txHash) {
      reset({ waitingForOrdersUpdate: true });
    }
    if (swapState === SwapState.COMPLETED) {
      reset();
    }
  };


  const addToWallet = !AddToWallet ? null : <AddToWallet logo={fromToken?.logoUrl} symbol={fromToken?.symbol} address={fromToken?.address} decimals={fromToken?.decimals} />;

  if (!swapState) {
    title = "Confirm Order";
    content = <OrderSummary isLimitPanel={limitPanel} disabled={createOrderLoading || !disclaimerAccepted} onSubmit={submitOrder} />;
  }

  if (swapState === SwapState.APPROVE) {
    content = !ApproveModalContent ? null : <ApproveModalContent title={`Enable spending ${inputCurrency?.symbol}`} isBonus={false} isMM={false} />;
  }

  if (swapState === SwapState.ERROR) {
    content = !SwapTransactionErrorContent ? null : <SwapTransactionErrorContent openSettingModal={() => {}} onDismiss={onClose} message={createOrderError} />;
  }

  if (swapState === SwapState.CREATE) {
    content = !SwapPendingModalContent ? null : (
      <SwapPendingModalContent title={`Create ${limitPanel ? "" : "TWAP"} ${isLimitOrder ? "Limit" : "Market"} Order`}>{addToWallet}</SwapPendingModalContent>
    );
  }

  if (swapState === SwapState.PENDING_CONFIRMATION) {
    content = (
      <SwapPendingModalContent showIcon={true} title="Transaction Submitted">
        {addToWallet}
      </SwapPendingModalContent>
    );
  }

  if (swapState === SwapState.COMPLETED) {
    content = (
      <SwapTransactionReceiptModalContent txHash={txHash} address={fromToken?.address} symbol={fromToken?.symbol} decimals={fromToken?.decimals} logo={fromToken?.logoUrl}>
        {addToWallet}
      </SwapTransactionReceiptModalContent>
    );
  }

  if (isWrongChain) {
    content = null;
  }

  return (
    <Components.Base.Modal header={<ModalHeader title={title} onClose={onClose} />} title={title} onClose={onClose} open={showConfirmation}>
      <StyledSwapModalContent
        style={{
          paddingBottom: !swapState ? "24px" : "55px",
          paddingTop: title ? "30px" : "24px",
        }}
      >
        <StyledSwapModalContentChildren>{content}</StyledSwapModalContentChildren>
      </StyledSwapModalContent>
    </Components.Base.Modal>
  );
};

const StyledSwapModalContentChildren = styled("div")`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const ModalHeader = ({ title, onClose }: { title?: string; onClose: () => void }) => {
  return (
    <StyledModalHeader withTitle={title ? 1 : 0}>
      {title && <StyledModalHeaderTitle>{title}</StyledModalHeaderTitle>}
      <StyledModalHeaderClose className="twap-ui-close" onClick={onClose}>
        <IoMdClose />
      </StyledModalHeaderClose>
    </StyledModalHeader>
  );
};

