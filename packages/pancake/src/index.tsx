import {
  Components,
  hooks,
  Translations,
  TwapAdapter,
  TwapContextUIPreferences,
  Styles,
  TooltipProps,
  TWAPTokenSelectProps,
  ButtonProps,
  LimitSwitchArgs,
  compact,
  isEmpty,
  Configs,
  Token,
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
  StyledLimitSwitch,
  StyledShowConfirmation,
  StyledShowOrdersButton,
  StyledOrders,
  StyledOrdersContent,
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
import { eqIgnoreCase, isNativeAddress, network, zeroAddress } from "@defi.org/web3-candies";
import Web3 from "web3";
import BN from "bignumber.js";
import { AiOutlineArrowDown } from "@react-icons/all-files/ai/AiOutlineArrowDown";
import { IoMdClose } from "@react-icons/all-files/io/IoMdClose";
import { useTwapContext, LimitPriceZeroButtonProps, LimitPricePercentProps } from "@orbs-network/twap-ui";
import { useAdapterContext, AdapterContextProvider, PancakeProps } from "./context";
import { LimitPriceTitleProps } from "@orbs-network/twap-ui";
import { LimitPriceTokenSelectProps } from "@orbs-network/twap-ui";
import { MdArrowDropDown } from "@react-icons/all-files/md/MdArrowDropDown";
import { styled } from "styled-components";
const PERCENT = [
  { text: "25%", value: 0.25 },
  { text: "50%", value: 0.5 },
  { text: "75%", value: 0.75 },
  { text: "MAX", value: 1 },
];

const uiPreferences: TwapContextUIPreferences = {
  usdSuffix: " USD",
  usdPrefix: "~",
  usdEmptyUI: <></>,
  balanceEmptyUI: <></>,
  inputPlaceholder: "0.0",
};

const Tooltip = ({ tooltipText, children }: TooltipProps) => {
  const useTooltip = useAdapterContext().useTooltip;
  const tooltip = useTooltip?.(tooltipText, { placement: "top", hideTimeout: 0 });

  if (!tooltip) return null;
  return (
    <span ref={tooltip.targetRef}>
      {children} {tooltip.tooltipVisible && tooltip.tooltip}
    </span>
  );
};

const config = Configs.PancakeSwap;

export const parseToken = (rawToken: any): Token | undefined => {
  if (!rawToken) return;

  const { address, decimals, symbol, logoURI } = rawToken;

  if (!symbol) {
    console.error("Invalid token", rawToken);
    return;
  }
  if (!address || isNativeAddress(address) || address === "BNB") {
    return network(config.chainId).native;
  }
  return {
    address: Web3.utils.toChecksumAddress(address),
    decimals,
    symbol,
    logoUrl: logoURI,
  };
};

const Balance = ({ isSrc }: { isSrc?: boolean }) => {
  const onPercentClick = hooks.useOnSrcAmountPercent();

  return (
    <StyledBalanceContainer onClick={isSrc ? () => onPercentClick(1) : () => {}}>
      <StyledBalance isSrc={isSrc} decimalScale={6} />
    </StyledBalanceContainer>
  );
};

const TokenPanel = ({ isSrcToken = false }: { isSrcToken?: boolean }) => {
  const dstToken = useTwapContext().dstToken;
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
        <Styles.StyledColumnFlex gap={1} style={{ alignItems: "flex-end" }}>
          <StyledTokenPanelInput dstDecimalScale={dstToken?.decimals || 3} isSrc={isSrcToken} />
          <StyledUSD decimalScale={2} isSrc={isSrcToken} emptyUi={<StyledEmptyUSD />} />
        </Styles.StyledColumnFlex>
        {isSrcToken && <SrcTokenPercentSelector />}
      </Card.Body>
    </StyledTokenPanel>
  );
};

const SrcTokenPercentSelector = () => {
  const onPercentClick = hooks.useOnSrcAmountPercent();
  const srcAmount = hooks.useSrcAmount().amount;

  const srcBalance = hooks.useSrcBalance().data;

  const maxSrcInputAmount = hooks.useMaxSrcInputAmount();

  const percent = useMemo(() => {
    return BN(srcAmount)
      .dividedBy(srcBalance || "0")
      .toNumber();
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

const useSelectedParsedTokens = () => {
  const context = useAdapterContext();

  return useMemo(() => {
    return {
      srcToken: parseToken(context.srcToken),
      dstToken: parseToken(context.dstToken),
    };
  }, [context.srcToken, context.dstToken]);
};

const useMarketPrice = () => {
  const { useTrade } = useAdapterContext();

  const { srcAddress, dstAddress } = useAddresses();
  const { srcToken } = useSelectedParsedTokens();
  const amount = hooks.useAmountBN(srcToken?.decimals, "1");

  const trade = useTrade!(srcAddress, dstAddress, BN(amount || 0).isZero() ? undefined : amount);

  return trade?.outAmount;
};

const useAddresses = () => {
  const context = useAdapterContext();
  const wTokenAddress = hooks.useNetwork()?.wToken.address;
  const wrappedAddress = useMemo(() => {
    return context.dappTokens?.find((it: any) => eqIgnoreCase(it.address || "", wTokenAddress || ""))?.address;
  }, [context.srcToken, context.dappTokens, wTokenAddress]);

  return useMemo(() => {
    const srcAddress = context.srcToken?.address;
    const dstAddress = context.dstToken?.address;
    return {
      srcAddress: isNativeAddress(srcAddress || "") || srcAddress === "BNB" ? wrappedAddress : srcAddress,
      dstAddress: isNativeAddress(dstAddress || "") || dstAddress === "BNB" ? wrappedAddress : dstAddress,
    };
  }, [context.srcToken, wrappedAddress, context.dstToken]);
};

const useUsd = () => {
  const context = useAdapterContext();
  const { srcAddress, dstAddress } = useAddresses();

  return {
    srcUsd: context.usePriceUSD?.(srcAddress),
    dstUsd: context.usePriceUSD?.(dstAddress),
  };
};

const Button = (props: ButtonProps) => {
  const ButtonComponent = useAdapterContext().Button;
  return (
    <ButtonComponent isLoading={!!props.loading} disabled={!!props.disabled} onClick={props.onClick ? () => props.onClick() : () => {}}>
      {props.children}
    </ButtonComponent>
  );
};

const TWAPContent = memo((props: PancakeProps) => {
  const provider = useProvider(props);

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

  const parsedTokens = useMemo((): Token[] => {
    if (!dappTokens || isEmpty(dappTokens)) return [];
    const res = Object.values(dappTokens)?.map((token: any) => {
      return parseToken(token);
    });

    return compact(res);
  }, [dappTokens]);

  const marketPrice = useMarketPrice();
  const usd = useUsd();
  const { srcToken, dstToken } = useSelectedParsedTokens();

  return (
    <div className="twap-adapter-wrapper">
      <TwapAdapter
        connect={props.connect}
        config={config}
        maxFeePerGas={props.maxFeePerGas}
        priorityFeePerGas={props.priorityFeePerGas}
        translations={translations as Translations}
        provider={provider}
        account={props.account}
        parsedTokens={parsedTokens}
        dappTokens={dappTokens}
        uiPreferences={uiPreferences}
        onDstTokenSelected={props.onDstTokenSelected}
        onSrcTokenSelected={props.onSrcTokenSelected}
        isMobile={props.isMobile}
        chainId={props.connectedChainId}
        enableQueryParams={true}
        minNativeTokenBalance="0.0035"
        isLimitPanel={props.limit}
        marketPrice={marketPrice}
        srcUsd={usd.srcUsd}
        dstUsd={usd.dstUsd}
        srcToken={srcToken}
        dstToken={dstToken}
        onSwitchTokens={props.onSwitchTokens}
        Components={{ Tooltip, Button }}
      >
        {/* <ThemeProvider theme={theme}>
          <GlobalStyles styles={configureStyles(theme) as any} />

          {props.children}
          {props.limit ? <LimitPanel /> : <TWAPPanel />}
          <Orders />
          <SubmitOrderModal />
        </ThemeProvider> */}
      </TwapAdapter>
    </div>
  );
});

const Orders = () => {
  const [isOpen, setIsOpen] = useState(false);
  const Modal = useAdapterContext().Modal;

  const onClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <StyledOrders isOpen={isOpen}>
      <Components.OrderHistory.Button onClick={() => setIsOpen(true)} />
      <Modal isOpen={isOpen} onClose={onClose}>
        <StyledOrdersContent />
      </Modal>
    </StyledOrders>
  );
};

const TWAP = (props: PancakeProps) => {
  return (
    <AdapterContextProvider value={props}>
      <TWAPContent {...props} />
    </AdapterContextProvider>
  );
};

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
  const provider = useAdapterContext().provider;

  if (!provider) {
    return (
      <StyledButtonContainer>
        <ConnectButton />
      </StyledButtonContainer>
    );
  }

  return (
    <StyledButtonContainer>
      <StyledShowConfirmation />
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
        <OpenConfirmationModalButton />
      </StyledColumnFlex>

      <StyledPoweredBy />
    </div>
  );
};

const useTokenSelectClick = (isSrcToken?: boolean) => {
  const selectToken = hooks.useTokenSelect();
  const { srcToken, dstToken } = useAdapterContext();
  const onSelect = useCallback(
    (token: any, isSrcToken?: boolean) => {
      selectToken({ isSrc: !!isSrcToken, token });
    },
    [selectToken, isSrcToken],
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

const LimitPrice = () => {
  const [isSrc, setIsSrc] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const onSrcTokenSelected = useCallback(() => {
    setIsSrc(true);
    setIsOpen(true);
  }, [setIsSrc, setIsOpen]);

  const onDstTokenSelected = useCallback(() => {
    setIsSrc(false);
    setIsOpen(true);
  }, [setIsSrc, setIsOpen]);

  return (
    <Components.LimitPanel>
      <TokenSelect isSrcToken={isSrc} onClose={() => setIsOpen(false)} open={isOpen} />
      <Card>
        <Card.Header>
          <Components.Labels.LimitPriceLabel />
          <StyledLimitSwitch Component={CustomPriceToggle} />
        </Card.Header>
        <Card.Body>
          <Components.LimitPanel.Main
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
    </Components.LimitPanel>
  );
};

const CustomPriceToggle = ({ onClick, options, selected }: LimitSwitchArgs) => {
  return (
    <StyledCustomPriceToggle>
      {options.map((it) => {
        return <PercentButton key={it.label} text={it.label} selected={it.value === selected} onClick={() => onClick(it.value)} />;
      })}
    </StyledCustomPriceToggle>
  );
};

const StyledCustomPriceToggle = styled(Styles.StyledRowFlex)({
  width: "auto",
  gap: 5,
  justifyContent: "flex-end",
});

const TWAPPanel = () => {
  return (
    <div className="twap-container">
      <StyledColumnFlex>
        <TopPanel />
        <LimitPrice />
        <TotalTrades />
        <TradeIntervalSelect />
        <DurationSelect />
        <OpenConfirmationModalButton />
      </StyledColumnFlex>
      <StyledPoweredBy />
    </div>
  );
};

const SubmitOrderModal = () => {
  const { Modal } = useAdapterContext();
  const { isOpen, onClose, swapState } = hooks.useSwapModal();

  const title = useMemo(() => {
    if (!swapState) {
      return "Review order";
    }
  }, [swapState]);

  const onCloseWithDelay = useCallback(() => {
    onClose(500);
  }, [onClose]);

  return (
    <Modal isOpen={!!isOpen} onClose={onCloseWithDelay}>
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

const DurationSelect = () => {
  const hide = hooks.useShouldWrapOrUnwrapOnly();

  if (hide) return null;
  return (
    <Card>
      <Card.Header>
        <Components.Labels.MaxDurationLabel />
      </Card.Header>
      <Components.TradeInterval>
        <Styles.StyledRowFlex style={{ alignItems: "stretch" }}>
          <StyledTradeIntervalInput>
            <Components.TradeDuration.Input />
          </StyledTradeIntervalInput>
          <StyledTradeIntervalResolution>
            <Components.TradeDuration.Resolution />
          </StyledTradeIntervalResolution>
        </Styles.StyledRowFlex>
      </Components.TradeInterval>
    </Card>
  );
};

export { TWAP };



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
