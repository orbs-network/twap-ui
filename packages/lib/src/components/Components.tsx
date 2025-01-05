import React, { CSSProperties, FC, ReactElement, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Balance,
  Button,
  Icon,
  IconButton,
  NumericInput,
  Slider,
  Switch,
  TimeSelector,
  TokenName,
  TokenPriceCompare,
  Tooltip,
  USD,
  TokenLogo as Logo,
  Label,
  SwipeContainer,
  Modal,
  Radio,
} from "./base";
import { styled, Button as MuiButton } from "@mui/material";
import { useTwapContext } from "../context";
import { AiOutlineWarning } from "@react-icons/all-files/ai/AiOutlineWarning";
import { RiArrowUpDownLine } from "@react-icons/all-files/ri/RiArrowUpDownLine";
import { HiSwitchHorizontal } from "@react-icons/all-files/hi/HiSwitchHorizontal";
import { IconType } from "@react-icons/all-files";
import {
  useLoadingState,
  useFormatNumber,
  useToken,
  useSwitchTokens,
  useSelectTokenCallback,
  useSubmitButton,
  useDstMinAmountOut,
  useSrcAmountUsdUi,
  useDstAmount,
  useChunks,
  useMaxPossibleChunks,
  useSetChunks,
  useSrcChunkAmountUsdUi,
  useSrcBalance,
  useAmountUi,
  useDstBalance,
  useIsPartialFillWarning,
  useChunksBiggerThanOne,
  useSrcChunkAmountUi,
  useDurationUi,
  useDeadlineUi,
  useSetSrcAmountUi,
  usePriceInvert,
  useTradePrice,
} from "../hooks";
import { useTwapStore } from "../store";
import { StyledText, StyledRowFlex, StyledColumnFlex, StyledOneLineText, textOverflow, StyledSummaryDetails, StyledSummaryRow, StyledSummaryRowRight } from "../styles";
import TokenDisplay from "./base/TokenDisplay";
import TokenSelectButton from "./base/TokenSelectButton";
import {
  OrderSummaryDeadlineLabel,
  OrderSummaryOrderTypeLabel,
  OrderSummaryChunkSizeLabel,
  OrderSummaryTotalChunksLabel,
  OrderSummaryTradeIntervalLabel,
  OrderSummaryMinDstAmountOutLabel,
  ChunksAmountLabel,
} from "./Labels";
import { SwitchVariant, Translations, TWAPTokenSelectProps } from "../types";
import { Box, FormControl, RadioGroup, Typography } from "@mui/material";
import Copy from "./base/Copy";
import { Styles } from "..";
import PendingTxModal from "./base/PendingTxModal";
import SuccessTxModal from "./base/SuccessTxModal";
import { IoIosArrowDown } from "@react-icons/all-files/io/IoIosArrowDown";
import { GrPowerReset } from "@react-icons/all-files/gr/GrPowerReset";
import { amountUi, fillDelayText, handleFillDelayText, makeElipsisAddress } from "../utils";
import BN from "bignumber.js";
import { TokenData } from "@orbs-network/twap";
import { ArrowsIcon } from "../orders/Order/icons";
import moment from "moment";
export function ChunksInput({ className = "", showDefault }: { className?: string; showDefault?: boolean }) {
  const translations = useTwapContext().translations;
  const chunks = useChunks();
  const maxPossibleChunks = useMaxPossibleChunks();
  const setChunks = useSetChunks();
  const getChunksBiggerThanOne = useChunksBiggerThanOne();
  const lib = useTwapStore().lib;
  const minChunkSizeUsd = lib?.config.minChunkSizeUsd.toString() || "0";

  if (!getChunksBiggerThanOne && !showDefault) {
    return <StyledText className={`${className} twap-chunks-amount-placeholder`}>{chunks || "-"}</StyledText>;
  }

  return (
    <Tooltip text={translations.sliderMinSizeTooltip.replace("{usd}", minChunkSizeUsd)}>
      <StyledChunksInput
        className={className}
        placeholder="0"
        value={chunks}
        decimalScale={0}
        maxValue={maxPossibleChunks.toString()}
        onChange={(value) => setChunks(Number(value))}
      />
    </Tooltip>
  );
}

export function ChunksSliderSelect({ className = "", showDefault }: { className?: string; showDefault?: boolean }) {
  const getChunksBiggerThanOne = useChunksBiggerThanOne();

  const maxPossibleChunks = useMaxPossibleChunks();
  const chunks = useChunks();
  const setChunks = useSetChunks();

  if (!getChunksBiggerThanOne && !showDefault) return null;
  return <StyledChunksSliderSelect className={className} maxTrades={maxPossibleChunks} value={chunks} onChange={setChunks} />;
}

export const ChangeTokensOrder = ({ children, className = "", icon = <RiArrowUpDownLine /> }: { children?: ReactNode; className?: string; icon?: any }) => {
  const switchTokens = useSwitchTokens();
  return (
    <StyledRowFlex className={`${className} twap-change-tokens-order`}>
      <IconButton onClick={switchTokens}>{children || <Icon icon={icon} />}</IconButton>
    </StyledRowFlex>
  );
};

export function MaxDurationSelector({ placeholder }: { placeholder?: string }) {
  const duration = useDurationUi();

  const onChange = useTwapStore((store) => store.setDuration);

  return <TimeSelector placeholder={placeholder} value={duration} onChange={onChange} />;
}

const Input = (props: {
  className?: string;
  decimalScale?: number;
  loading?: boolean;
  prefix?: string;
  disabled?: boolean;
  placeholder?: string;
  onChange?: (value: string) => void;
  value: string;
  id?: string;
}) => {
  return (
    <NumericInput
      className={`${props.className} twap-token-input ${props.loading ? "twap-token-input-loading" : ""}`}
      decimalScale={props.decimalScale}
      prefix={props.prefix}
      loading={props.loading}
      disabled={props.disabled}
      placeholder={props.placeholder}
      onChange={(value) => props.onChange?.(value)}
      value={props.value}
      id={props.id}
    />
  );
};

export const TokenInput = ({ isSrc, placeholder, className = "" }: { isSrc?: boolean; placeholder?: string; className?: string }) => {
  // src
  const { srcDecimals, srcAmount, dstDecimals, isLimitOrder } = useTwapStore((s) => ({
    srcDecimals: s.srcToken?.decimals,
    srcAmount: s.srcAmountUi,
    dstDecimals: s.dstToken?.decimals,
    isLimitOrder: s.isLimitOrder,
  }));
  const setSrcAmountUi = useSetSrcAmountUi();
  const srcUsdLoading = useLoadingState().srcUsdLoading;
  const srcInputLoading = (!!srcAmount || srcAmount !== "0") && srcUsdLoading;

  const { amountUI, isLoading: dstAmountLoading } = useDstAmount();

  return (
    <NumericInput
      className={`${className} twap-token-input`}
      decimalScale={isSrc ? srcDecimals : dstDecimals}
      loading={isSrc ? srcInputLoading : dstAmountLoading}
      disabled={!isSrc}
      placeholder={placeholder}
      onChange={isSrc ? setSrcAmountUi : () => {}}
      value={isSrc ? srcAmount : amountUI}
    />
  );
};

export const TokenPanelInput = ({
  isSrc,
  placeholder,
  className = "",
  dstDecimalScale,
}: {
  isSrc?: boolean;
  placeholder?: string;
  className?: string;
  dstDecimalScale?: number;
}) => {
  if (isSrc) {
    return <SrcTokenInput className={className} placeholder={placeholder} />;
  }
  return <DstTokenInput decimalScale={dstDecimalScale} className={className} placeholder={placeholder} />;
};

const SrcTokenInput = (props: { className?: string; placeholder?: string }) => {
  const { decimals, amount } = useTwapStore((store) => ({
    decimals: store.srcToken?.decimals,
    amount: store.srcAmountUi,
  }));
  const onChange = useSetSrcAmountUi();
  return <Input id="twap-src-token-input" prefix="" onChange={onChange} value={amount || ""} decimalScale={decimals} className={props.className} placeholder={props.placeholder} />;
};

const DstTokenInput = (props: { className?: string; placeholder?: string; decimalScale?: number }) => {
  const { token, isLimitOrder } = useTwapStore((store) => ({
    token: store.dstToken,
    srcAmount: store.srcAmountUi,
    isLimitOrder: store.isLimitOrder,
  }));
  const { amountUI, isLoading } = useDstAmount();
  return (
    <Input disabled={true} loading={isLoading} value={amountUI} decimalScale={props.decimalScale || token?.decimals} className={props.className} placeholder={props.placeholder} />
  );
};

export const TokenLogo = ({ isSrc, className = "" }: { isSrc?: boolean; className?: string }) => {
  const token = useToken(isSrc);

  return <Logo className={className} logo={token?.logoUrl} />;
};

export function TokenLogoAndSymbol({ isSrc, reverse }: { isSrc?: boolean; reverse?: boolean }) {
  const token = useToken(isSrc);

  return <TokenDisplay reverse={reverse} logo={token?.logoUrl} symbol={token?.symbol} />;
}

export const TokenSelect = ({
  onClick,
  isSrc,
  hideArrow = true,
  className = "",
  tokenSelectedUi,
  tokenNotSelectedUi,
  CustomArrow,
  customButtonElement,
}: {
  onClick: () => void;
  isSrc?: boolean;
  hideArrow?: boolean;
  className?: string;
  tokenSelectedUi?: ReactNode;
  tokenNotSelectedUi?: ReactNode;
  CustomArrow?: any;
  customButtonElement?: FC;
}) => {
  const srcToken = useTwapStore((state) => state.srcToken);
  const dstToken = useTwapStore((state) => state.dstToken);

  const token = isSrc ? srcToken : dstToken;

  return (
    <Box className={`${className} twap-token-select`}>
      {token ? (
        <StyledRowFlex gap={5} style={{ cursor: "pointer" }} width="fit-content" onClick={onClick} className={`twap-token-selected`}>
          {tokenSelectedUi ? (
            <>{tokenSelectedUi}</>
          ) : (
            <>
              <TokenLogoAndSymbol isSrc={isSrc} />
              {!hideArrow && <Icon icon={CustomArrow ? <CustomArrow size={20} /> : <IoIosArrowDown size={20} />} />}
            </>
          )}
        </StyledRowFlex>
      ) : (
        <TokenSelectButton
          customButtonElement={customButtonElement}
          customUi={tokenNotSelectedUi}
          hideArrow={hideArrow}
          className={`${className} twap-token-not-selected`}
          onClick={onClick}
          CustomArrow={CustomArrow}
        />
      )}
    </Box>
  );
};

export const TokenSelectNew = ({
  onClick,
  isSrc,
  hideArrow = true,
  className = "",
  CustomArrow,
}: {
  onClick: () => void;
  isSrc?: boolean;
  hideArrow?: boolean;
  className?: string;
  CustomArrow?: IconType;
}) => {
  const srcToken = useTwapStore((state) => state.srcToken);
  const dstToken = useTwapStore((state) => state.dstToken);
  const translations = useTwapContext().translations;

  const token = isSrc ? srcToken : dstToken;

  return (
    <Box className={`${className} twap-token-select`}>
      <MuiButton onClick={onClick} className={`twap-token-selected`}>
        {token ? <TokenLogoAndSymbol isSrc={isSrc} /> : <StyledOneLineText>{translations.selectToken}</StyledOneLineText>}
        {!hideArrow && <Icon icon={CustomArrow ? <CustomArrow size={20} /> : <IoIosArrowDown size={20} />} />}
      </MuiButton>
    </Box>
  );
};

export const TokenSymbol = ({ isSrc, hideNull, onClick }: { isSrc?: boolean; hideNull?: boolean; onClick?: () => void }) => {
  const token = useToken(isSrc);
  return <TokenName onClick={onClick} hideNull={hideNull} name={token?.symbol} />;
};

export function TradeIntervalSelector({ placeholder, className = "" }: { placeholder?: string; className?: string }) {
  const setFillDelay = useTwapStore((store) => store.setFillDelay);
  const fillDelay = useTwapStore((store) => store.customFillDelay);

  return <TimeSelector className={className} placeholder={placeholder} onChange={setFillDelay} value={fillDelay} />;
}

interface TokenSelectProps extends TWAPTokenSelectProps {
  Component?: FC<TWAPTokenSelectProps>;
  isOpen: boolean;
  onClose: () => void;
  isSrc?: boolean;
}

export const TokenSelectModal = ({ Component, isOpen, onClose, isSrc = false }: TokenSelectProps) => {
  const onTokenSelectedCallback = useSelectTokenCallback();

  const onSelect = useCallback(
    (token: any) => {
      onTokenSelectedCallback({ isSrc, token });
      onClose();
    },
    [onTokenSelectedCallback, isSrc]
  );

  if (!Component) return null;
  return <Component isOpen={isOpen} onClose={onClose} onSelect={onSelect} srcTokenSelected={undefined} dstTokenSelected={undefined} />;
};

export function LimitPriceToggle({ variant, style }: { variant?: SwitchVariant; style?: CSSProperties }) {
  const { priceUI, onReset } = useTradePrice();

  const { isLimitOrder, setLimitOrder, srcToken, dstToken } = useTwapStore((store) => ({
    isLimitOrder: store.isLimitOrder,
    setLimitOrder: store.setLimitOrder,
    srcToken: store.srcToken,
    dstToken: store.dstToken,
  }));

  const { leftToken, rightToken } = usePriceInvert(priceUI, srcToken, dstToken);

  const loadingState = useLoadingState();
  const isLoading = loadingState.srcUsdLoading || loadingState.dstUsdLoading;
  const { translations, marketPriceLoading } = useTwapContext();

  const selectTokensWarning = !leftToken || !rightToken;

  const onSetLimitOrder = useCallback(
    (value?: boolean) => {
      setLimitOrder(value);
      if (!value) onReset();
    },
    [setLimitOrder, onReset]
  );

  return (
    <Tooltip text={marketPriceLoading ? `${translations.loading}...` : selectTokensWarning ? translations.selectTokens : ""}>
      <Switch style={style} variant={variant} disabled={!!selectTokensWarning || isLoading} value={isLimitOrder} onChange={onSetLimitOrder} />
    </Tooltip>
  );
}

export function LimitPriceRadioGroup({ className }: { className?: string }) {
  const loadingState = useLoadingState();
  const isLoading = loadingState.srcUsdLoading || loadingState.dstUsdLoading;
  const { onReset, priceUI } = useTradePrice();
  const { isLimitOrder, setLimitOrder, srcToken, dstToken } = useTwapStore((store) => ({
    isLimitOrder: store.isLimitOrder,
    setLimitOrder: store.setLimitOrder,
    srcToken: store.srcToken,
    dstToken: store.dstToken,
  }));

  const { leftToken, rightToken } = usePriceInvert(priceUI, srcToken, dstToken);
  const selectTokensWarning = !leftToken || !rightToken;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = String(event.target.value) === "true";
    setLimitOrder(value);
    if (!value) onReset();
  };

  return (
    <FormControl className={`twap-radio ${className}`} disabled={!!selectTokensWarning || isLoading}>
      <RadioGroup row name="isLimitOrder" value={String(isLimitOrder)} onChange={handleChange}>
        <Radio label="Market Price" value="false" />
        <Radio label="Limit Price" value="true" />
      </RadioGroup>
    </FormControl>
  );
}

export function ChunksUSD({ onlyValue, emptyUi, suffix, prefix }: { onlyValue?: boolean; emptyUi?: React.ReactNode; suffix?: string; prefix?: string }) {
  const usd = useSrcChunkAmountUsdUi();
  const loading = useLoadingState().srcUsdLoading;

  return <USD prefix={prefix} suffix={suffix} value={usd} onlyValue={onlyValue} emptyUi={emptyUi} isLoading={loading} />;
}

export const TokenBalance = ({
  isSrc,
  label,
  showSymbol,
  className = "",
  hideLabel,
  emptyUi,
  decimalScale,
}: {
  isSrc?: boolean;
  label?: string;
  showSymbol?: boolean;
  className?: string;
  hideLabel?: boolean;
  emptyUi?: ReactNode;
  decimalScale?: number;
}) => {
  const srcLoading = useLoadingState().srcBalanceLoading;
  const dstLoading = useLoadingState().dstBalanceLoading;
  const srcToken = useTwapStore((state) => state.srcToken);
  const dstToken = useTwapStore((state) => state.dstToken);
  const isLoading = isSrc ? srcLoading : dstLoading;
  const symbol = isSrc ? srcToken?.symbol : dstToken?.symbol;
  const suffix = !showSymbol ? undefined : isSrc ? srcToken?.symbol : dstToken?.symbol;

  const srcBalance = useAmountUi(srcToken?.decimals, useSrcBalance().data?.toString());
  const dstBalance = useAmountUi(dstToken?.decimals, useDstBalance().data?.toString());
  const balance = isSrc ? srcBalance : dstBalance;

  return (
    <Balance
      symbol={symbol || ""}
      decimalScale={decimalScale}
      emptyUi={emptyUi}
      hideLabel={hideLabel}
      className={className}
      suffix={suffix}
      label={label}
      value={balance || "0"}
      isLoading={isLoading}
    />
  );
};

export function TokenUSD({
  isSrc,
  emptyUi,
  className = "",
  onlyValue,
  prefix,
  suffix,
  hideIfZero,
  decimalScale,
}: {
  isSrc?: boolean;
  emptyUi?: ReactNode;
  className?: string;
  onlyValue?: boolean;
  prefix?: string;
  suffix?: string;
  hideIfZero?: boolean;
  decimalScale?: number;
}) {
  const srcUSD = useSrcAmountUsdUi();
  const srcLoading = useLoadingState().srcUsdLoading;
  const dstUSD = useDstAmount().usd;
  const dstLoading = useLoadingState().dstUsdLoading;
  const usd = isSrc ? srcUSD : dstUSD;
  const isLoading = isSrc ? srcLoading : dstLoading;

  if (!usd || Number(usd) <= 0) return null;

  return <USD decimalScale={decimalScale} suffix={suffix} prefix={prefix} onlyValue={onlyValue} className={className} emptyUi={emptyUi} value={usd || "0"} isLoading={isLoading} />;
}

export const SubmitButton = ({ className = "", isMain }: { className?: string; isMain?: boolean }) => {
  const { loading, onClick, disabled, text } = useSubmitButton(isMain);

  return (
    <Button text={text} className={`twap-submit ${className}`} loading={loading} onClick={onClick || (() => {})} disabled={disabled}>
      <p className="twap-submit-text" style={{ margin: 0 }}>
        {text}
      </p>
    </Button>
  );
};

export const useLimitPriceComponents = ({
  placeholder = "0.00",
  showDefault,
  toggleIcon = <HiSwitchHorizontal style={{ width: 20, height: 20 }} />,
  hideSymbol,
  reverse,
}: {
  placeholder?: string;
  showDefault?: boolean;
  toggleIcon?: ReactElement;
  hideSymbol?: boolean;
  reverse?: boolean;
}) => {
  const { isLimitOrder, srcToken, dstToken } = useTwapStore((store) => ({
    srcToken: store.srcToken,
    isLimitOrder: store.isLimitOrder,
    dstToken: store.dstToken,
  }));
  const { onChange, priceUI: limitPrice } = useTradePrice();

  const { leftToken, rightToken, price, onInvert } = usePriceInvert(limitPrice, srcToken, dstToken);

  const _isLimitOrder = isLimitOrder || showDefault;

  if (!_isLimitOrder || !leftToken || !rightToken) return null;

  return {
    leftToken: <TokenDisplay reverse={reverse} hideSymbol={hideSymbol} singleToken symbol={leftToken?.symbol} logo={leftToken?.logoUrl} />,
    rightToken: <TokenDisplay reverse={reverse} hideSymbol={hideSymbol} symbol={rightToken?.symbol} logo={rightToken?.logoUrl} />,
    input: <NumericInput placeholder={placeholder} onChange={onChange} value={price} />,
    toggle: <IconButton onClick={onInvert} icon={toggleIcon} />,
  };
};

export function LimitPriceInput({
  placeholder = "0.00",
  className = "",
  showDefault,
  hideSymbol,
  reverse,
}: {
  placeholder?: string;
  className?: string;
  showDefault?: boolean;
  hideSymbol?: boolean;
  reverse?: boolean;
}) {
  const components = useLimitPriceComponents({ placeholder, showDefault, hideSymbol, reverse });

  if (!components) return null;
  return (
    <StyledLimitPriceInput className={`twap-limit-price-input ${className}`}>
      <StyledRowFlex gap={10} style={{ paddingLeft: 5 }} width="fit-content">
        {components.leftToken}
        <StyledText>=</StyledText>
      </StyledRowFlex>
      {components.input}

      <StyledRowFlex gap={10} width="fit-content">
        {components.rightToken}
        {components.toggle}
      </StyledRowFlex>
    </StyledLimitPriceInput>
  );
}

export const MarketPrice = ({ className = "", hideLabel }: { className?: string; hideLabel?: boolean }) => {
  const [inverted, setInverted] = useState(false);

  return null;
};

const StyledMarketPrice = styled(StyledRowFlex)({
  ".twap-token-logo": {
    minWidth: 22,
    minHeight: 22,
  },
});

export function PoweredBy({ className = "" }: { className?: string }) {
  const translations = useTwapContext().translations;
  return (
    <StyledPoweredBy className={`${className} twap-powered-by`}>
      <a href="https://www.orbs.com/" target="_blank">
        <StyledText>{translations.poweredBy}</StyledText>
        <img src="https://raw.githubusercontent.com/orbs-network/twap-ui/master/logo/orbslogo.svg" />
      </a>
    </StyledPoweredBy>
  );
}

// --- warnings --- //

const Warning = ({ tootlip, warning }: { tootlip: string; warning: string }) => {
  return (
    <Tooltip text={tootlip}>
      <StyledWarning justifyContent="flex-start" gap={5} className="twap-warning">
        <StyledText>{warning}</StyledText>
        <AiOutlineWarning />
      </StyledWarning>
    </Tooltip>
  );
};

export const PartialFillWarning = () => {
  const translations = useTwapContext().translations;
  const isWarning = useIsPartialFillWarning();
  const lib = useTwapStore((state) => state.lib);
  if (!isWarning || !lib) return null;

  return <Warning tootlip={translations.prtialFillWarningTooltip} warning={translations.prtialFillWarning} />;
};

export const FillDelayWarning = () => {
  const translations = useTwapContext().translations;
  const fillDelayWarning = useTwapStore((store) => store.getFillDelayWarning());
  const minimumDelayMinutes = useTwapStore((store) => store.getMinimumDelayMinutes());
  const lib = useTwapStore((state) => state.lib);

  if (!fillDelayWarning || !lib) return null;

  return <Warning tootlip={handleFillDelayText(translations.fillDelayWarningTooltip, minimumDelayMinutes)} warning={translations.invalid} />;
};

/// --- order summary ---- ///

export function TotalChunks() {
  const chunks = useChunks();
  const formattedValue = useFormatNumber({ value: chunks });

  return (
    <Tooltip text={formattedValue}>
      <StyledOneLineText>{formattedValue}</StyledOneLineText>
    </Tooltip>
  );
}

export function ChunksAmount() {
  const value = useSrcChunkAmountUi();
  const formattedValue = useFormatNumber({ value, decimalScale: 3 });
  if (!value) return null;
  return (
    <Tooltip text={formattedValue}>
      <StyledOneLineText className="twap-chunks-amount">{formattedValue}</StyledOneLineText>
    </Tooltip>
  );
}

export const Deadline = () => {
  const deadline = useDeadlineUi();
  return <StyledOneLineText>{deadline}</StyledOneLineText>;
};

export const OrderType = () => {
  const isLimitOrder = useTwapStore((store) => store.isLimitOrder);
  const translations = useTwapContext().translations;
  return <StyledOneLineText>{isLimitOrder ? translations.limitOrder : translations.marketOrder}</StyledOneLineText>;
};

export const InvertPrice = ({ srcToken, dstToken, price: _price }: { srcToken?: TokenData; dstToken?: TokenData; price?: string }) => {
  const { leftToken, rightToken, onInvert, price } = usePriceInvert(_price, srcToken, dstToken);
  const priceF = useFormatNumber({ value: price, decimalScale: 6 });

  return (
    <>
      1 {leftToken?.symbol} <ArrowsIcon onClick={onInvert} /> {priceF} {rightToken?.symbol}
    </>
  );
};

export const TradeIntervalAsText = ({ translations: _translations }: { translations?: Translations }) => {
  const getFillDelayText = useTwapStore((store) => store.getFillDelayText);
  const translations = useTwapContext()?.translations || _translations;

  return <StyledOneLineText>{getFillDelayText(translations)}</StyledOneLineText>;
};

export const MinDstAmountOut = ({ translations: _translations }: { translations?: Translations }) => {
  const { isLimitOrder, dstToken } = useTwapStore((store) => ({
    isLimitOrder: store.isLimitOrder,
    dstToken: store.dstToken,
  }));
  const translations = useTwapContext()?.translations || _translations;
  const dstMinAmountOutUi = useDstMinAmountOut().amountUI;

  const formattedValue = useFormatNumber({ value: dstMinAmountOutUi });

  if (!isLimitOrder) {
    return <StyledOneLineText>{translations.none}</StyledOneLineText>;
  }

  return (
    <Tooltip text={formattedValue}>
      <StyledOneLineText>{formattedValue}</StyledOneLineText>
    </Tooltip>
  );
};

export const OrderSummaryDetailsMinDstAmount = ({ subtitle, translations }: { subtitle?: boolean; translations?: Translations }) => {
  const isLimitOrder = useTwapStore((store) => store.isLimitOrder);

  if (!isLimitOrder) return null;

  return (
    <StyledSummaryRow className="twap-order-summary-details-item">
      <OrderSummaryMinDstAmountOutLabel subtitle={subtitle} translations={translations} />
      <StyledSummaryRowRight className="twap-order-summary-details-item-right">
        <>
          <TokenLogoAndSymbol isSrc={false} reverse={true} />
          <MinDstAmountOut translations={translations} />
        </>
      </StyledSummaryRowRight>
    </StyledSummaryRow>
  );
};

export const OrderSummaryDetailsFee = ({ fee }: { fee: number }) => {
  const { amount: outAmount } = useDstAmount();
  const { dstToken } = useTwapStore((store) => ({
    dstToken: store.dstToken,
  }));

  const amount = useMemo(() => {
    if (!outAmount || !dstToken) {
      return;
    }
    const result =
      BN(outAmount || "0")
        .multipliedBy(fee)
        .div(100)
        .toString() || "0";
    return amountUi(dstToken, BN(result));
  }, [outAmount, fee, dstToken]);

  const amountF = useFormatNumber({ value: amount, disableDynamicDecimals: false });

  return (
    <StyledSummaryRow className="twap-order-summary-details-item">
      <Label tooltipText="Fee is estimated and exact amount may change at execution.">Fee {`(${fee}%)`}</Label>
      <StyledSummaryRowRight className="twap-order-summary-details-item-right">{amount ? `${amountF} ${dstToken?.symbol}` : ""}</StyledSummaryRowRight>
    </StyledSummaryRow>
  );
};

export const OrderSummaryDetailsTradeInterval = ({ subtitle, translations }: { subtitle?: boolean; translations?: Translations }) => {
  return (
    <StyledSummaryRow className="twap-order-summary-details-item">
      <OrderSummaryTradeIntervalLabel subtitle={subtitle} translations={translations} />
      <StyledSummaryRowRight className="twap-order-summary-details-item-right">
        <TradeIntervalAsText translations={translations} />
      </StyledSummaryRowRight>
    </StyledSummaryRow>
  );
};

export const OrderSummaryDetailsTotalChunks = ({ subtitle, translations }: { subtitle?: boolean; translations?: Translations }) => {
  return (
    <StyledSummaryRow className="twap-order-summary-details-item">
      <OrderSummaryTotalChunksLabel subtitle={subtitle} translations={translations} />
      <StyledSummaryRowRight className="twap-order-summary-details-item-right">
        <TotalChunks />
      </StyledSummaryRowRight>
    </StyledSummaryRow>
  );
};

export const OrderSummaryDetailsChunkSize = ({ subtitle, translations }: { subtitle?: boolean; translations?: Translations }) => {
  return (
    <StyledSummaryRow className="twap-order-summary-details-item">
      <OrderSummaryChunkSizeLabel subtitle={subtitle} translations={translations} />
      <StyledSummaryRowRight className="twap-order-summary-details-item-right">
        <>
          <TokenLogoAndSymbol isSrc={true} reverse={true} />
          <ChunksAmount />
        </>
      </StyledSummaryRowRight>
    </StyledSummaryRow>
  );
};

export const OrderSummaryDetailsOrderType = () => {
  const t = useTwapContext().translations;
  return (
    <OrderDetailsRow label={t.orderType} tooltip={t.confirmationOrderType}>
      <OrderType />
    </OrderDetailsRow>
  );
};

export const OrderDetails = ({ children }: { children: ReactNode }) => {
  return <>{children}</>;
};

export const OrderDetailsRow = ({ label, tooltip = "", children, className = "" }: { label: string; tooltip?: string; children: ReactNode; className?: string }) => {
  return (
    <StyledDetailRow className={`twap-order-details-row ${className}`}>
      <Label tooltipText={tooltip}>{label}</Label>
      <StyledDetailRowChildren className="twap-order-details-row-right">{children}</StyledDetailRowChildren>
    </StyledDetailRow>
  );
};

const Expiry = ({ expiryMillis, format = "ll HH:mm" }: { expiryMillis?: number; format?: string }) => {
  const t = useTwapContext().translations;
  const expiry = useMemo(() => moment(expiryMillis).format(format), [expiryMillis, format]);

  return (
    <OrderDetailsRow label="Expiration" tooltip={t.confirmationDeadlineTooltip}>
      {expiry}
    </OrderDetailsRow>
  );
};

const Price = ({ srcToken, dstToken, price: _price }: { srcToken?: TokenData; dstToken?: TokenData; price?: string }) => {
  return <OrderDetailsRow label="Price">{_price ? <InvertPrice price={_price} srcToken={srcToken} dstToken={dstToken} /> : "-"}</OrderDetailsRow>;
};

const TotalTrades = ({ totalTrades = 0 }: { totalTrades?: number }) => {
  const t = useTwapContext().translations;
  return (
    <OrderDetailsRow label={t.totalTrades} tooltip={t.totalTradesTooltip}>
      {totalTrades}
    </OrderDetailsRow>
  );
};

const MinReceived = ({ minReceived, isMarketOrder = false, symbol = "" }: { minReceived?: string; isMarketOrder?: boolean; symbol?: string }) => {
  const t = useTwapContext().translations;

  const minReceivedF = useFormatNumber({ value: minReceived, decimalScale: 6 });
  return (
    <OrderDetailsRow label={t.minReceivedPerTrade} tooltip={!isMarketOrder ? t.confirmationMinDstAmountTootipLimit : t.confirmationMinDstAmountTootipMarket}>
      {isMarketOrder ? "-" : `${minReceivedF} ${symbol}`}
    </OrderDetailsRow>
  );
};

const SizePerTrade = ({ sizePerTrade, symbol = "" }: { sizePerTrade?: string; symbol?: string }) => {
  const t = useTwapContext().translations;
  const sizePerTradeF = useFormatNumber({ value: sizePerTrade, decimalScale: 6 });
  return (
    <OrderDetailsRow label={t.tradeSize} tooltip={t.confirmationTradeSizeTooltip}>
      {`${sizePerTradeF} ${symbol}`}
    </OrderDetailsRow>
  );
};

const TradeInterval = ({ tradeIntervalMillis }: { tradeIntervalMillis: number }) => {
  const t = useTwapContext().translations;
  const value = useMemo(() => fillDelayText(tradeIntervalMillis, t), [t]);

  return (
    <OrderDetailsRow label={t.tradeInterval} tooltip={t.confirmationtradeIntervalTooltip}>
      {value}
    </OrderDetailsRow>
  );
};

const Fee = ({ fee, dstToken, outAmount }: { fee?: number; dstToken?: TokenData; outAmount?: string }) => {
  const amount = useMemo(() => {
    if (!outAmount || !dstToken || !fee) {
      return;
    }
    return (
      BN(outAmount || "0")
        .multipliedBy(fee)
        .div(100)
        .toString() || "0"
    );
  }, [outAmount, fee]);

  const t = useTwapContext().translations;
  const amountF = useFormatNumber({ value: amount, decimalScale: 6 });
  return (
    <OrderDetailsRow label={`Fee (${fee}%)`} tooltip="Fee is estimated and exact amount may change at execution.">
      {`${amountF} ${dstToken?.symbol}`}
    </OrderDetailsRow>
  );
};

OrderDetails.Expiry = Expiry;
OrderDetails.Price = Price;
OrderDetails.TotalTrades = TotalTrades;
OrderDetails.MinReceived = MinReceived;
OrderDetails.SizePerTrade = SizePerTrade;
OrderDetails.TradeInterval = TradeInterval;
OrderDetails.Fee = Fee;
OrderDetails.Row = OrderDetailsRow;

export const StyledDetailRowChildren = styled(StyledRowFlex)({
  width: "fit-content",
  gap: 5,
  textAlign: "right",
  "& .twap-token-logo": {
    width: 21,
    height: 21,
  },
});

export const StyledDetailRow = styled(StyledRowFlex)({
  justifyContent: "space-between",
  "& .twap-label": {
    fontWeight: 400,
    fontSize: 14,
    "& p": {
      whiteSpace: "unset",
    },
  },
  "& .text": {
    fontWeight: 300,
  },
  "@media(max-width: 500px)": {},
});

export const OrderSummaryDetailsDeadline = ({ subtitle, translations }: { subtitle?: boolean; translations?: Translations }) => {
  return (
    <StyledSummaryRow className="twap-order-summary-details-item">
      <OrderSummaryDeadlineLabel subtitle={subtitle} translations={translations} />
      <StyledSummaryRowRight className="twap-order-summary-details-item-right">
        <Deadline />
      </StyledSummaryRowRight>
    </StyledSummaryRow>
  );
};

export const OrderSummaryDetails = ({ className = "", subtitle, translations }: { className?: string; subtitle?: boolean; translations?: Translations }) => {
  return (
    <StyledSummaryDetails className={`twap-order-summary-details ${className}`}>
      <OrderSummaryDetailsDeadline subtitle={subtitle} translations={translations} />
      <OrderSummaryDetailsOrderType />
      <OrderSummaryDetailsChunkSize subtitle={subtitle} translations={translations} />
      <OrderSummaryDetailsTotalChunks subtitle={subtitle} translations={translations} />
      <OrderSummaryDetailsTradeInterval subtitle={subtitle} translations={translations} />
      <OrderSummaryDetailsMinDstAmount subtitle={subtitle} translations={translations} />
    </StyledSummaryDetails>
  );
};

export function OrderSummarySwipeContainer({ children }: { children: ReactNode }) {
  const showConfirmation = useTwapStore((store) => store.showConfirmation);
  const setShowConfirmation = useTwapStore((store) => store.setShowConfirmation);
  return (
    <SwipeContainer show={showConfirmation} close={() => setShowConfirmation(false)}>
      {children}
    </SwipeContainer>
  );
}

export function OrderSummaryModalContainer({ children, className, title }: { children: ReactNode; className?: string; title?: string }) {
  const showConfirmation = useTwapStore((store) => store.showConfirmation);
  const setShowConfirmation = useTwapStore((store) => store.setShowConfirmation);
  return (
    <Modal title={title} open={showConfirmation} className={className} onClose={() => setShowConfirmation(false)}>
      {children}
    </Modal>
  );
}

export const OrderSummaryTokenDisplay = ({
  isSrc,
  usdSuffix,
  usdPrefix,
  translations: _translations,
}: {
  isSrc?: boolean;
  usdSuffix?: string;
  usdPrefix?: string;
  translations?: Translations;
}) => {
  const translations = useTwapContext()?.translations || _translations;
  const isLimitOrder = useTwapStore((store) => store.isLimitOrder);
  const srcAmount = useTwapStore((store) => store.srcAmountUi);
  const dstAmount = useDstAmount().amountUI;

  const amount = isSrc ? srcAmount : dstAmount;
  const prefix = isSrc ? "" : isLimitOrder ? "~ " : "~ ";
  const _amount = useFormatNumber({ value: amount, decimalScale: 5 });

  return (
    <StyledOrderSummaryTokenDisplay className="twap-orders-summary-token-display">
      <StyledRowFlex className="twap-orders-summary-token-display-flex">
        <StyledText>{isSrc ? translations.from : translations.to}</StyledText>
        <TokenUSD prefix={usdPrefix} suffix={usdSuffix} isSrc={isSrc} />
      </StyledRowFlex>
      <StyledRowFlex className="twap-orders-summary-token-display-flex">
        <TokenLogoAndSymbol isSrc={isSrc} />
        <StyledRowFlex className="twap-orders-summary-token-display-amount">
          {prefix && <StyledText> {prefix}</StyledText>}
          <StyledOneLineText>{_amount}</StyledOneLineText>
        </StyledRowFlex>
      </StyledRowFlex>
    </StyledOrderSummaryTokenDisplay>
  );
};

export const AcceptDisclaimer = ({ variant, className, translations: _translations }: { variant?: SwitchVariant; className?: string; translations?: Translations }) => {
  const translations = useTwapContext()?.translations || _translations;

  const setDisclaimerAccepted = useTwapStore((store) => store.setDisclaimerAccepted);
  const disclaimerAccepted = useTwapStore((store) => store.disclaimerAccepted);

  return (
    <StyledRowFlex gap={5} justifyContent="space-between" className={`twap-disclaimer-switch ${className}`}>
      <Label>{translations.acceptDisclaimer}</Label>
      <Switch variant={variant} value={disclaimerAccepted} onChange={() => setDisclaimerAccepted(!disclaimerAccepted)} />
    </StyledRowFlex>
  );
};

export const OutputAddress = ({ className, translations: _translations, ellipsis }: { className?: string; translations?: Translations; ellipsis?: number }) => {
  const maker = useTwapStore((store) => store.lib?.maker);
  const translations = useTwapContext()?.translations || _translations;

  return (
    <StyledOutputAddress className={`twap-order-summary-output-address ${className}`}>
      <StyledText style={{ textAlign: "center", width: "100%" }} className="text">
        {translations.outputWillBeSentTo}
      </StyledText>
      <StyledOneLineText style={{ textAlign: "center", width: "100%" }} className="address">
        {ellipsis ? makeElipsisAddress(maker, ellipsis) : maker}
      </StyledOneLineText>
    </StyledOutputAddress>
  );
};

const StyledOutputAddress = styled(StyledColumnFlex)({});

export const OrderSummaryLimitPriceToggle = ({ translations: _translations }: { translations?: Translations }) => {
  const isLimitOrder = useTwapStore((store) => store.isLimitOrder);
  const translations = useTwapContext()?.translations || _translations;

  return null;
};

export const OrderSummaryPriceCompare = () => {
  const limitPrice = useTradePrice().priceUI;
  const { srcToken, dstToken } = useTwapStore((store) => ({
    srcToken: store.srcToken,
    dstToken: store.dstToken,
  }));
  const { leftToken, rightToken, price, onInvert } = usePriceInvert(limitPrice, srcToken, dstToken);
  return <TokenPriceCompare leftToken={leftToken} rightToken={rightToken} price={price} toggleInverted={onInvert} />;
};

export const OrderSummaryLimitPrice = ({ translations: _translations }: { translations?: Translations }) => {
  const translations = useTwapContext()?.translations || _translations;

  return (
    <StyledRowFlex className="twap-order-summary-limit-price" justifyContent="space-between">
      <Label tooltipText={translations.confirmationLimitPriceTooltip}>{translations.limitPrice}</Label>
      <OrderSummaryLimitPriceToggle translations={translations} />
    </StyledRowFlex>
  );
};

export const DisclaimerText = ({ className = "", translations: _translations }: { className?: string; translations?: Translations }) => {
  const translations = useTwapContext()?.translations || _translations;
  const lib = useTwapStore((state) => state.lib);
  return (
    <StyledTradeInfoExplanation className={`twap-disclaimer-text ${className}`}>
      <StyledText>{translations.disclaimer1}</StyledText>
      <StyledText>{translations.disclaimer2}</StyledText>
      <StyledText>{translations.disclaimer3}</StyledText>
      <StyledText>{translations.disclaimer4}</StyledText>
      <StyledText>{translations.disclaimer5.replace("{{dex}}", lib?.config.name || "DEX")}</StyledText>

      <StyledText>
        {translations.disclaimer6}{" "}
        <a href="https://github.com/orbs-network/twap" target="_blank">
          here
        </a>
        . {translations.disclaimer7}{" "}
        <a href="https://github.com/orbs-network/twap/blob/master/TOS.md" target="_blank">
          here
        </a>
        .
      </StyledText>
    </StyledTradeInfoExplanation>
  );
};

//---- styles -----//

const StyledWarning = styled(StyledRowFlex)({
  p: {
    fontSize: 14,
    color: "#E23D5B",
  },
  "& *": {
    fill: "#E23D5B",
  },
});

const StyledLimitPriceInput = styled(StyledRowFlex)({
  paddingLeft: 10,
  "& .twap-input": {
    flex: 1,
    "& input": {
      fontSize: 16,
      textAlign: "center",
    },
  },
  ".twap-token-logo": {
    width: 24,
    height: 24,
  },
  "& .twap-token-name, p": {
    fontSize: 14,
    position: "relative",
  },
});

const StyledChunksInput = styled(NumericInput)({
  width: 70,
  height: 35,
  input: {
    fontSize: 16,
    textAlign: "center",
    width: "100%",
    transition: "0.2s all",
  },
});

const StyledChunksSliderSelect = styled(Slider)({
  flex: 1,
  width: "auto",
  marginLeft: 30,
});

const StyledTradeInfoExplanation = styled(StyledColumnFlex)({
  overflow: "auto",
  gap: 10,
  "*": {
    fontSize: 14,
  },
  "@media (max-width: 700px)": {
    "*": {
      fontSize: 12,
    },
  },
});

const StyledOrderSummaryTokenDisplay = styled(StyledColumnFlex)({
  ".twap-token-logo": {},
  ".twap-token-name": {
    fontSize: 16,
  },
  ".twap-orders-summary-token-display-amount": {
    fontSize: 19,
    justifyContent: "flex-end",
    width: "auto",
  },
  ".twap-orders-summary-token-display-flex": {
    justifyContent: "space-between",
  },
});

const StyledPoweredBy = styled(StyledRowFlex)({
  marginTop: 10,
  marginBottom: 10,
  "& p": {
    color: "inherit",
  },
  "& a": {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "unset",
    gap: 8,
  },
  "& img": {
    width: 20,
    height: 20,
    objectFit: "contain",
  },
});

export const TradeSizeValue = ({ symbol }: { symbol?: boolean }) => {
  const value = useSrcChunkAmountUi();
  const formattedValue = useFormatNumber({ value });
  const srcToken = useTwapStore((store) => store.srcToken);

  const formattedValueTooltip = useFormatNumber({ value, decimalScale: 18 });

  if (!formattedValue || formattedValue === "0") {
    return <Typography className="twap-trade-size-value">-</Typography>;
  }
  return (
    <Tooltip text={`${symbol ? `${formattedValueTooltip} ${srcToken?.symbol}` : formattedValueTooltip}`}>
      <Typography className="twap-trade-size-value">{`${symbol ? `${formattedValue} ${srcToken?.symbol}` : formattedValue}`}</Typography>
    </Tooltip>
  );
};

export const TradeSize = ({ hideLabel, hideSymbol, hideLogo }: { hideLabel?: boolean; hideSymbol?: boolean; hideLogo?: boolean }) => {
  const srcToken = useTwapStore((store) => store.srcToken);
  const dsToken = useTwapStore((store) => store.dstToken);

  if (!srcToken && !dsToken) {
    return <span>0</span>;
  }

  if (!srcToken && !hideLabel) {
    return <ChunksAmountLabel />;
  }
  return (
    <StyledTradeSize>
      {!hideLabel && <ChunksAmountLabel />}
      <StyledRowFlex gap={7} className="content">
        {!hideLogo && <TokenLogo isSrc={true} />}
        <TradeSizeValue symbol={!hideSymbol} />
      </StyledRowFlex>
    </StyledTradeSize>
  );
};

const StyledTradeSize = styled(StyledRowFlex)({
  width: "auto",
  gap: 10,
  ...textOverflow,
  minWidth: 0,
  ".content": {
    ".twap-token-logo": {
      width: 21,
      height: 21,
    },
    ".value": {
      ...textOverflow,
    },
    p: {
      paddingTop: 2,
    },
    "*": {
      fontFamily: "inherit",
      fontSize: 14,
    },
  },

  ".twap-label": {
    whiteSpace: "nowrap",
  },
});

const StyledMsg = styled(StyledRowFlex)({
  flexWrap: "wrap",
  justifyContent: "flex-start",
  padding: "10px 12px",
});

export const CopyTokenAddress = ({ isSrc }: { isSrc: boolean }) => {
  const srcToken = useTwapStore((store) => store.srcToken);
  const dstToken = useTwapStore((store) => store.dstToken);

  const address = isSrc ? srcToken?.address : dstToken?.address;

  return <Copy value={address} />;
};

export const ResetLimitButton = ({ children }: { children?: ReactNode }) => {
  const onReset = useTradePrice().onReset;
  const isLimitOrder = useTwapStore((s) => s.isLimitOrder);

  if (!isLimitOrder) return null;

  return (
    <Tooltip text="Reset to default price">
      {children ? (
        <span onClick={onReset} className="twap-limit-reset">
          {children}
        </span>
      ) : (
        <IconButton onClick={onReset} className="twap-limit-reset">
          <Icon icon={<GrPowerReset style={{ width: 18, height: 18 }} />} />
        </IconButton>
      )}
    </Tooltip>
  );
};

export const SrcToken = () => {
  return (
    <Styles.StyledRowFlex style={{ width: "auto" }}>
      <TokenLogo isSrc={true} />
      <TokenSymbol isSrc={true} />
    </Styles.StyledRowFlex>
  );
};

export const DstToken = () => {
  return (
    <Styles.StyledRowFlex style={{ width: "auto" }}>
      <TokenLogo />
      <TokenSymbol />
    </Styles.StyledRowFlex>
  );
};

export const TxLoading = () => {
  const { showLoadingModal, setShowLodingModal } = useTwapStore();

  return <PendingTxModal open={showLoadingModal} onClose={() => setShowLodingModal(false)} />;
};

export const TxSuccess = () => {
  const { showSuccessModal, setShowSuccessModal } = useTwapStore();

  return <SuccessTxModal open={showSuccessModal} onClose={() => setShowSuccessModal(false)} />;
};

export const LimitInputV2 = () => {
  const { onChange, priceUI: limitPrice, isLoading } = useTradePrice();

  return <NumericInput loading={isLoading} placeholder={""} onChange={onChange} value={limitPrice} />;
};
