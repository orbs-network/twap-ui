import { GlobalStyles, Box, ThemeProvider, styled } from "@mui/material";
import {
  Components,
  hooks,
  Translations,
  TwapAdapter,
  store,
  Orders,
  TwapContextUIPreferences,
  Styles,
  TooltipProps,
  addMissingTokens,
  TWAPTokenSelectProps,
  ButtonProps,
} from "@orbs-network/twap-ui";
import translations from "./i18n/en.json";
import {
  Card,
  configureStyles,
  darkTheme,
  lightTheme,
  StyledBalanceContainer,
  StyledMenuButton,
  StyledColumnFlex,
  StyledPoweredBy,
  StyledModalHeaderClose,
  StyledModalHeader,
  StyledSwapModalContent,
  StyledModalHeaderTitle,
  StyledResetLimitButtonContainer,
  StyledResetLimitButtonLeft,
  StyledResetLimitButtonRight,
  StyledLimitPriceTitle,
  StyledLimitPriceTokenSelect,
  StyledChunksSelect,
  StyledChunkSelectMaxButton,
  StyledTradeIntervalResolution,
  StyledTradeIntervalInput,
  StyledChunksSelectSlider,
  StyledChunksSelectInput,
  StyledPanelWarning,
} from "./styles";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  StyledBalance,
  StyledEmptyUSD,
  StyledPercentSelect,
  StyledSelectAndBalance,
  StyledTokenChange,
  StyledTokenChangeContainer,
  StyledTokenPanel,
  StyledTokenPanelInput,
  StyledTokenSelect,
  StyledUSD,
} from "./styles";
import { isNativeAddress, zeroAddress } from "@defi.org/web3-candies";
import { Configs, TokenData } from "@orbs-network/twap";
import Web3 from "web3";
import _ from "lodash";
import BN from "bignumber.js";
import { MdArrowDropDown } from "@react-icons/all-files/md/MdArrowDropDown";
import { AiOutlineArrowDown } from "@react-icons/all-files/ai/AiOutlineArrowDown";
import PancakeOrders from "./PancakeOrders";
import { getTokenFromTokensList } from "@orbs-network/twap-ui";
import { IoMdClose } from "@react-icons/all-files/io/IoMdClose";
import { useTwapContext, LimitPriceZeroButtonProps, LimitPricePercentProps } from "@orbs-network/twap-ui";
import { useAdapterContext, AdapterContextProvider, PancakeProps } from "./context";
import { LimitPriceTitleProps } from "@orbs-network/twap-ui";
import { LimitPriceTokenSelectProps } from "@orbs-network/twap-ui";

const PERCENT = [
  { text: "25%", value: 0.25 },
  { text: "50%", value: 0.5 },
  { text: "75%", value: 0.75 },
  { text: "MAX", value: 1 },
];

const Tooltip = ({ text, children, childrenStyles = {} }: TooltipProps) => {
  const useTooltip = useAdapterContext().useTooltip;
  const tooltip = useTooltip?.(text, { placement: "top", hideTimeout: 0 });

  if (!tooltip) return null;
  return (
    <span ref={tooltip.targetRef} style={{ ...childrenStyles }}>
      {children} {tooltip.tooltipVisible && tooltip.tooltip}
    </span>
  );
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

const Balance = ({ isSrc }: { isSrc?: boolean }) => {
  const onPercentClick = hooks.useCustomActions();

  return (
    <StyledBalanceContainer onClick={isSrc ? () => onPercentClick(1) : () => {}}>
      <StyledBalance isSrc={isSrc} decimalScale={6} />
    </StyledBalanceContainer>
  );
};

const TokenPanel = ({ isSrcToken = false }: { isSrcToken?: boolean }) => {
  const dstToken = store.useTwapStore((s) => s.dstToken);
  const onTokenSelectClick = useTokenSelectClick();
  const [isOpen, setIsOpen] = useState(false);

  const onSrcTokenSelected = useCallback(() => {
    setIsOpen(true);
    onTokenSelectClick?.();
  }, [onTokenSelectClick]);

  return (
    <StyledTokenPanel>
      <TokenSelect isSrcToken={isSrcToken} onClose={() => setIsOpen(false)} open={isOpen} />
      <Card.Header>
        <StyledSelectAndBalance>
          <StyledTokenSelect CustomArrow={MdArrowDropDown} hideArrow={false} isSrc={isSrcToken} onClick={onSrcTokenSelected} />
          <Balance isSrc={isSrcToken} />
        </StyledSelectAndBalance>
      </Card.Header>
      <Card.Body>
        <Styles.StyledColumnFlex width="auto" gap={1} style={{ alignItems: "flex-end" }}>
          <StyledTokenPanelInput dstDecimalScale={dstToken?.decimals || 3} isSrc={isSrcToken} />
          <StyledUSD decimalScale={2} isSrc={isSrcToken} emptyUi={<StyledEmptyUSD />} />
        </Styles.StyledColumnFlex>
        {isSrcToken && <SrcTokenPercentSelector />}
      </Card.Body>
    </StyledTokenPanel>
  );
};

const SrcTokenPercentSelector = () => {
  const onPercentClick = hooks.useCustomActions();
  const { srcAmount } = store.useTwapStore((state) => ({
    srcAmount: state.getSrcAmount(),
  }));

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
          <StyledMenuButton selected={selected ? 1 : 0} key={p.text} onClick={() => (selected ? () => {} : onClick(p.value))}>
            {p.text}
          </StyledMenuButton>
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

export const useProvider = (props: PancakeProps) => {
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

const useTrade = (props: PancakeProps, amount?: string) => {
  const { srcToken, toToken } = store.useTwapStore((s) => ({
    srcToken: s.srcToken,
    toToken: s.dstToken,
  }));

  const res = props.useTrade!(handleAddress(srcToken?.address), handleAddress(toToken?.address), BN(amount || 0).isZero() ? undefined : amount);

  return {
    result: res?.outAmount,
    isLoading: BN(amount || 0).gt(0) && res?.isLoading,
  };
};

const useMarketPrice = (props: PancakeProps) => {
  const { srcToken } = store.useTwapStore((s) => ({
    srcToken: s.srcToken,
  }));

  const amount = hooks.useAmountBN(srcToken?.decimals, "1");
  return useTrade(props, amount);
};

const Button = (props: ButtonProps) => {
  const ButtonComponent = useAdapterContext().Button;
  return (
    <ButtonComponent isLoading={!!props.loading} disabled={!!props.disabled} onClick={props.onClick ? () => props.onClick() : () => {}}>
      {props.children}
    </ButtonComponent>
  );
};

const TWAP = memo((props: PancakeProps) => {
  const provider = useProvider(props);
  const marketPrice = useMarketPrice(props);

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

  const uiPreferences = useMemo((): TwapContextUIPreferences => {
    return {
      usdSuffix: " USD",
      usdPrefix: "~",
      usdEmptyUI: <></>,
      balanceEmptyUI: <></>,
      switchVariant: "ios",
      inputPlaceholder: "0.0",
      Tooltip: props.useTooltip ? Tooltip : undefined,
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
  }, [props.useTooltip]);

  const parsedTokens = useMemo((): TokenData[] => {
    if (_.isEmpty(dappTokens)) return [];
    const res = _.map(dappTokens, (token) => {
      return parseToken(token);
    });

    return addMissingTokens(config, _.compact(res));
  }, [dappTokens]);

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
        parsedTokens={parsedTokens}
        dappTokens={dappTokens}
        uiPreferences={uiPreferences}
        onDstTokenSelected={props.onDstTokenSelected}
        usePriceUSD={props.usePriceUSD}
        onSrcTokenSelected={props.onSrcTokenSelected}
        isDarkTheme={props.isDarkTheme}
        isMobile={props.isMobile}
        connectedChainId={props.connectedChainId}
        enableQueryParams={true}
        marketPrice={marketPrice.result}
        minNativeTokenBalance="0.0035"
        isLimitPanel={props.limit}
      >
        <ThemeProvider theme={theme}>
          <GlobalStyles styles={configureStyles(theme) as any} />
          <AdapterContextProvider value={props}>
            {props.children}
            {props.limit ? <LimitPanel /> : <TWAPPanel />}
            <SubmitOrderModal />

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
  const { ConnectButton } = useAdapterContext();
  const provider = useTwapContext().provider;

  if (!provider) {
    return (
      <StyledButtonContainer>
        <ConnectButton />
      </StyledButtonContainer>
    );
  }

  return (
    <StyledButtonContainer>
      <Components.ShowConfirmationButton />
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
        <LimitPrice />
        <StyledPanelWarning />
        <OpenConfirmationModalButton />
      </StyledColumnFlex>

      <StyledPoweredBy />
    </div>
  );
};

const useTokenSelectClick = (isSrcToken?: boolean) => {
  const selectToken = hooks.useTokenSelect();
  const { dstToken, srcToken } = hooks.useDappRawSelectedTokens();

  const onSelect = useCallback(
    (token: any, isSrcToken?: boolean) => {
      selectToken({ isSrc: !!isSrcToken, token });
    },
    [selectToken, isSrcToken]
  );

  return useAdapterContext().useTokenModal?.(onSelect, srcToken, dstToken, isSrcToken);
};

const PercentButton = ({ selected, text, onClick }: LimitPricePercentProps) => {
  return (
    <StyledMenuButton onClick={onClick} selected={selected ? 1 : 0}>
      {text}
    </StyledMenuButton>
  );
};

const ZeroButton = ({ text, onClick }: LimitPriceZeroButtonProps) => {
  return (
    <StyledResetLimitButtonContainer>
      <StyledResetLimitButtonLeft selected={1} onClick={onClick}>
        {text}
      </StyledResetLimitButtonLeft>
      <StyledResetLimitButtonRight selected={1} onClick={onClick}>
        X
      </StyledResetLimitButtonRight>
    </StyledResetLimitButtonContainer>
  );
};

const ModifiedTokenSelectModal = (props: TWAPTokenSelectProps) => {
  const TokenSelectModal = useAdapterContext().TokenSelectModal;

  return <TokenSelectModal tokenSelected={undefined} onSelect={props.onSelect} isOpen={props.isOpen} onClose={props.onClose} />;
};
const TokenSelect = ({ open, onClose, isSrcToken }: { open: boolean; onClose: () => void; isSrcToken?: boolean }) => {
  const TokenSelectModal = useAdapterContext().TokenSelectModal;
  if (!TokenSelectModal) return null;
  return <Components.TokenSelectModal Component={ModifiedTokenSelectModal} isOpen={open} onClose={onClose} isSrc={isSrcToken} />;
};

const LimitPriceTitle = ({ textLeft, textRight, token, onTokenClick }: LimitPriceTitleProps) => {
  return (
    <StyledLimitPriceTitle>
      <span>{textLeft}</span>
      <StyledLimitPriceTokenSelect onClick={onTokenClick} symbol={token?.symbol} logo={token?.logoUrl} />
      <span>{textRight}</span>
    </StyledLimitPriceTitle>
  );
};

const LimitTokenSelect = ({ token, onClick }: LimitPriceTokenSelectProps) => {
  return <StyledLimitPriceTokenSelect onClick={onClick} symbol={token?.symbol} logo={token?.logoUrl} />;
};

const LimitPriceInput = ({ value, onChange, isLoading }: any) => {
  return <Components.Base.NumericInput value={value} onChange={onChange} loading={isLoading} />;
};

const LimitPrice = ({ isTwap }: { isTwap?: boolean }) => {
  const onSrcSelect = useTokenSelectClick(true);
  const onDstSelect = useTokenSelectClick(false);
  const [isSrc, setIsSrc] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const hide = hooks.useShouldWrapOrUnwrapOnly();

  const onSrcTokenSelected = useCallback(() => {
    setIsSrc(true);
    setIsOpen(true);
    onSrcSelect?.();
  }, [setIsSrc, setIsOpen, onSrcSelect]);

  const onDstTokenSelected = useCallback(() => {
    setIsSrc(false);
    setIsOpen(true);
    onDstSelect?.();
  }, [setIsSrc, setIsOpen, onDstSelect]);

  if (hide) return null;

  return (
    <>
      <TokenSelect isSrcToken={isSrc} onClose={() => setIsOpen(false)} open={isOpen} />
      <Card>
        <Card.Header>
          <Components.Labels.LimitPriceLabel isTwap={isTwap} />
          <Components.LimitSwitch />
        </Card.Header>
        <Card.Body>
          <Components.LimitPanel
            onSrcSelect={onSrcTokenSelected}
            onDstSelect={onDstTokenSelected}
            styles={{
              percentButtonsGap: "5px",
            }}
            Components={{
              PercentButton,
              ZeroButton,
              Title: LimitPriceTitle,
              TokenSelect: LimitTokenSelect,
              Input: LimitPriceInput,
            }}
          />
        </Card.Body>
      </Card>
    </>
  );
};

const TWAPPanel = () => {
  return (
    <div className="twap-container">
      <StyledColumnFlex>
        <TopPanel />
        <LimitPrice isTwap={true} />
        <TotalTrades />
        <TradeIntervalSelect />
        <OpenConfirmationModalButton />
        <StyledPanelWarning />
      </StyledColumnFlex>
      <StyledPoweredBy />
    </div>
  );
};

const SubmitOrderModal = () => {
  const { Modal } = useAdapterContext();
  const { isOpen, onClose, title } = hooks.useConfirmationModal();

  const onCloseWithDelay = useCallback(() => {
    onClose(500);
  }, [onClose]);

  return (
    <Modal open={isOpen} onClose={onCloseWithDelay} header={<ModalHeader title={title} onClose={onCloseWithDelay} />}>
      <StyledSwapModalContent
        style={{
          paddingBottom: "24px",
          paddingTop: title ? "30px" : "0px",
        }}
      >
        <StyledSwapModalContentChildren>
          <Components.CreateOrderModal />
        </StyledSwapModalContentChildren>
      </StyledSwapModalContent>
    </Modal>
  );
};

const MenuButton = ({ text, selected, onClick }: { text: string; selected?: boolean; onClick: () => void }) => {
  return (
    <StyledMenuButton selected={selected ? 1 : 0} onClick={onClick}>
      {text}
    </StyledMenuButton>
  );
};

const TotalTradesWarningButton = ({ onClick, text }: { onClick: () => void; text: string }) => {
  return (
    <StyledChunkSelectMaxButton selected={1} onClick={onClick}>
      {text}
    </StyledChunkSelectMaxButton>
  );
};

const TotalTrades = () => {
  const hide = hooks.useShouldWrapOrUnwrapOnly();

  if (hide) return null;
  return (
    <Card>
      <Card.Header>
        <Components.Labels.TotalTradesLabel />
      </Card.Header>
      <StyledChunksSelect>
        <Styles.StyledRowFlex style={{ alignItems: "stretch" }}>
          <StyledChunksSelectSlider>
            <Components.ChunkSelector.Slider />
          </StyledChunksSelectSlider>
          <StyledChunksSelectInput>
            <Components.ChunkSelector.Input />
          </StyledChunksSelectInput>
        </Styles.StyledRowFlex>
      </StyledChunksSelect>
    </Card>
  );
};

const TradeIntervalSelect = () => {
  const hide = hooks.useShouldWrapOrUnwrapOnly();

  if (hide) return null;
  return (
    <Card>
      <Card.Header>
        <Components.Labels.TradeIntervalLabel />
      </Card.Header>
      <Components.TradeInterval>
        <Styles.StyledRowFlex style={{ alignItems: "stretch" }}>
          <StyledTradeIntervalInput>
            <Components.TradeInterval.Input />
          </StyledTradeIntervalInput>
          <StyledTradeIntervalResolution>
            <Components.TradeInterval.Resolution />
          </StyledTradeIntervalResolution>
        </Styles.StyledRowFlex>
      </Components.TradeInterval>
    </Card>
  );
};

export { TWAP, Orders };

const SwapModal = () => {
  const limitPanel = useAdapterContext().limit;
  const { dappTokens, ApproveModalContent, SwapPendingModalContent, SwapTransactionErrorContent, AddToWallet, SwapTransactionReceiptModalContent } = useAdapterContext();
  const { fromToken, showConfirmation, isMarketOrder, swapStep, createOrdertxHash } = store.useTwapStore((s) => ({
    fromToken: s.srcToken,
    showConfirmation: s.showConfirmation,
    isMarketOrder: s.isMarketOrder,
    disclaimerAccepted: s.disclaimerAccepted,
    createOrdertxHash: s.createOrdertxHash,
    swapStep: s.swapStep,
  }));

  const inputCurrency = useMemo(() => getTokenFromTokensList(dappTokens, fromToken?.address), [dappTokens, fromToken]);
  const { mutate: createOrder, error, swapState } = hooks.useSubmitOrderFlow();

  const { onClose } = hooks.useConfirmationModal();

  const onCloseWithDelay = useCallback(() => {
    onClose(500);
  }, [onClose]);

  const wrongNetwork = useTwapContext().isWrongChain;
  let content = null;
  let title: string | undefined = undefined;

  const addToWallet = !AddToWallet ? null : <AddToWallet logo={fromToken?.logoUrl} symbol={fromToken?.symbol} address={fromToken?.address} decimals={fromToken?.decimals} />;

  if (swapState === "success") {
    content = (
      <SwapTransactionReceiptModalContent
        txHash={createOrdertxHash}
        address={fromToken?.address}
        symbol={fromToken?.symbol}
        decimals={fromToken?.decimals}
        logo={fromToken?.logoUrl}
      >
        {addToWallet}
      </SwapTransactionReceiptModalContent>
    );
  }

  if (swapState === "failed") {
    content = !SwapTransactionErrorContent ? null : <SwapTransactionErrorContent openSettingModal={() => {}} onDismiss={onCloseWithDelay} message={error} />;
  }

  if (!swapState) {
    title = "Confirm Order";
    content = <Components.CreateOrderModal.Review onSubmit={createOrder} />;
  }

  if (swapStep) {
    content = !ApproveModalContent ? null : <ApproveModalContent title={`Enable spending ${inputCurrency?.symbol}`} isBonus={false} isMM={false} />;
  }

  if (swapStep === "createOrder" && !createOrdertxHash) {
    content = !SwapPendingModalContent ? null : (
      <SwapPendingModalContent title={`Create ${limitPanel ? "" : "TWAP"} ${!isMarketOrder ? "Limit" : "Market"} Order`}>{addToWallet}</SwapPendingModalContent>
    );
  }

  if (swapStep === "createOrder" && createOrdertxHash) {
    content = (
      <SwapPendingModalContent showIcon={true} title="Transaction Submitted">
        {addToWallet}
      </SwapPendingModalContent>
    );
  }

  if (wrongNetwork) {
    content = null;
  }

  return (
    <Components.Base.Modal header={<ModalHeader title={title} onClose={onCloseWithDelay} />} title={title} onClose={onCloseWithDelay} open={showConfirmation}>
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
