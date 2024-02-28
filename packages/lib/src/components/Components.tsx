import { CSSProperties, FC, ReactElement, ReactNode, useCallback } from "react";
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
import { useLoadingState, useLimitPrice, useMarketPrice, useFormatNumber, useToken, useSwitchTokens, useSelectTokenCallback, useSubmitButton, useAmountOut } from "../hooks";
import { useTwapStore, handleFillDelayText } from "../store";
import { StyledText, StyledRowFlex, StyledColumnFlex, StyledOneLineText, StyledOverflowContainer, textOverflow } from "../styles";
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
import { SwitchVariant, TWAPTokenSelectProps } from "../types";
import { Box, Fade, FormControl, RadioGroup, Typography } from "@mui/material";
import Copy from "./base/Copy";
import { SQUIGLE } from "../config";
import { Styles } from "..";
import PendingTxModal from "./base/PendingTxModal";
import SuccessTxModal from "./base/SuccessTxModal";
import { IoIosArrowDown } from "@react-icons/all-files/io/IoIosArrowDown";
import { GrPowerReset } from "@react-icons/all-files/gr/GrPowerReset";

export function ChunksInput({ className = "", showDefault }: { className?: string; showDefault?: boolean }) {
  const translations = useTwapContext().translations;
  const chunks = useTwapStore((store) => store.getChunks());
  const maxPossibleChunks = useTwapStore((store) => store.getMaxPossibleChunks());
  const setChunks = useTwapStore((store) => store.setChunks);
  const getChunksBiggerThanOne = useTwapStore((store) => store.getChunksBiggerThanOne());
  if (!getChunksBiggerThanOne && !showDefault) {
    return <StyledText className={`${className} twap-chunks-amount-placeholder`}>{chunks || "-"}</StyledText>;
  }
  return (
    <Tooltip text={translations.sliderMinSizeTooltip}>
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
  const getChunksBiggerThanOne = useTwapStore((store) => store.getChunksBiggerThanOne());

  const maxPossibleChunks = useTwapStore((store) => store.getMaxPossibleChunks());
  const chunks = useTwapStore((store) => store.getChunks());
  const setChunks = useTwapStore((store) => store.setChunks);

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
  const duration = useTwapStore((store) => store.getDurationUi());

  const onChange = useTwapStore((store) => store.setDuration);

  return <TimeSelector placeholder={placeholder} value={duration} onChange={onChange} />;
}

export const TokenInput = ({ isSrc, placeholder, className = "" }: { isSrc?: boolean; placeholder?: string; className?: string }) => {
  // src
  const srcDecimals = useTwapStore((store) => store.srcToken?.decimals);
  const srcUsdLoading = useLoadingState().srcUsdLoading;
  const srcAmount = useTwapStore((store) => store.srcAmountUi);
  const setSrcAmountUi = useTwapStore((store) => store.setSrcAmountUi);
  const srcInputLoading = (!!srcAmount || srcAmount !== "0") && srcUsdLoading;
  // dst
  const dstDecimals = useTwapStore((store) => store.dstToken?.decimals);
  const dstUsdLoading = useLoadingState().dstUsdLoading;
  const dstAmount = useAmountOut();
  console.log({ dstAmount });
  
  const isLimitOrder = useTwapStore((store) => store.isLimitOrder);
  const dstInputLoading = (!!dstAmount || dstAmount !== "0") && dstUsdLoading;

  return (
    <NumericInput
      className={`${className} twap-token-input`}
      decimalScale={isSrc ? srcDecimals : dstDecimals}
      prefix={isSrc ? "" : isLimitOrder ? "≥" : SQUIGLE}
      loading={isSrc ? srcInputLoading : dstInputLoading}
      disabled={!isSrc}
      placeholder={placeholder}
      onChange={isSrc ? setSrcAmountUi : () => {}}
      value={isSrc ? srcAmount : dstAmount}
    />
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

export function TradeIntervalSelector({ placeholder }: { placeholder?: string }) {
  const setFillDelay = useTwapStore((store) => store.setFillDelay);
  const fillDelay = useTwapStore((store) => store.customFillDelay);

  return <TimeSelector placeholder={placeholder} onChange={setFillDelay} value={fillDelay} />;
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
  const loadingState = useLoadingState();
  const isLoading = loadingState.srcUsdLoading || loadingState.dstUsdLoading;
  const translations = useTwapContext().translations;
  const { leftToken, rightToken } = useTwapStore((state) => state.getLimitPrice(false));
  const isLimitOrder = useTwapStore((store) => store.isLimitOrder);
  const setLimitOrder = useTwapStore((store) => store.setLimitOrder);
  const selectTokensWarning = !leftToken || !rightToken;

  return (
    <Tooltip text={isLoading ? `${translations.loading}...` : selectTokensWarning ? translations.selectTokens : ""}>
      <Switch style={style} variant={variant} disabled={!!selectTokensWarning || isLoading} value={isLimitOrder} onChange={(value: boolean) => setLimitOrder(value)} />
    </Tooltip>
  );
}

export function LimitPriceRadioGroup({ className }: { className?: string }) {
  const loadingState = useLoadingState();
  const isLoading = loadingState.srcUsdLoading || loadingState.dstUsdLoading;
  const { leftToken, rightToken } = useTwapStore((state) => state.getLimitPrice(false));
  const isLimitOrder = useTwapStore((store) => store.isLimitOrder);
  const setLimitOrder = useTwapStore((store) => store.setLimitOrder);
  const selectTokensWarning = !leftToken || !rightToken;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLimitOrder(String(event.target.value) === "true");
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
  const usd = useTwapStore((state) => state.getSrcChunkAmountUsdUi());
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
  const srcBalance = useTwapStore((state) => state.getSrcBalanceUi());
  const srcLoading = useLoadingState().srcBalanceLoading;
  const dstBalance = useTwapStore((state) => state.getDstBalanceUi());
  const dstLoading = useLoadingState().dstBalanceLoading;
  const srcToken = useTwapStore((state) => state.srcToken);
  const dstToken = useTwapStore((state) => state.dstToken);
  const balance = isSrc ? srcBalance : dstBalance;
  const isLoading = isSrc ? srcLoading : dstLoading;
  const symbol = isSrc ? srcToken?.symbol : dstToken?.symbol;
  const suffix = !showSymbol ? undefined : isSrc ? srcToken?.symbol : dstToken?.symbol;
  return (
    <Balance
      symbol={symbol || ""}
      decimalScale={decimalScale}
      emptyUi={emptyUi}
      hideLabel={hideLabel}
      className={className}
      suffix={suffix}
      label={label}
      value={balance}
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
}: {
  isSrc?: boolean;
  emptyUi?: ReactNode;
  className?: string;
  onlyValue?: boolean;
  prefix?: string;
  suffix?: string;
  hideIfZero?: boolean;
}) {
  const srcUSD = useTwapStore((state) => state.getSrcAmountUsdUi());
  const srcLoading = useLoadingState().srcUsdLoading;
  const dstUSD = useTwapStore((state) => state.getDstAmountUsdUi());
  const dstLoading = useLoadingState().dstUsdLoading;
  const usd = isSrc ? srcUSD : dstUSD;
  const isLoading = isSrc ? srcLoading : dstLoading;

  if (Number(usd) <= 0 && hideIfZero) return null;

  return <USD suffix={suffix} prefix={prefix} onlyValue={onlyValue} className={className} emptyUi={emptyUi} value={usd || "0"} isLoading={isLoading} />;
}

export const SubmitButton = ({ className = "", isMain }: { className?: string; isMain?: boolean }) => {
  const { loading, onClick, disabled, text } = useSubmitButton(isMain);

  return (
    <Button className={`twap-submit ${className}`} loading={loading} onClick={onClick || (() => {})} disabled={disabled}>
      {text}
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
  const isLimitOrder = useTwapStore((store) => store.isLimitOrder);
  const { leftToken, rightToken, onChange, limitPrice, toggleInverted } = useLimitPrice();

  const _isLimitOrder = isLimitOrder || showDefault;

  if (!_isLimitOrder || !leftToken || !rightToken) return null;

  return {
    leftToken: <TokenDisplay reverse={reverse} hideSymbol={hideSymbol} singleToken symbol={leftToken?.symbol} logo={leftToken?.logoUrl} />,
    rightToken: <TokenDisplay reverse={reverse} hideSymbol={hideSymbol} symbol={rightToken?.symbol} logo={rightToken?.logoUrl} />,
    input: <NumericInput placeholder={placeholder} onChange={onChange} value={limitPrice} />,
    toggle: <IconButton onClick={toggleInverted} icon={toggleIcon} />,
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
  const { toggleInverted, leftToken, rightToken, marketPrice, loading } = useMarketPrice();
  const translations = useTwapContext().translations;
  return (
    <StyledMarketPrice justifyContent="space-between" className={`twap-market-price ${className}`}>
      {!hideLabel && <StyledText className="title">{translations.currentMarketPrice}</StyledText>}
      <TokenPriceCompare loading={loading} leftToken={leftToken} rightToken={rightToken} price={marketPrice} toggleInverted={toggleInverted} />
    </StyledMarketPrice>
  );
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
  const isWarning = useTwapStore((state) => state.getIsPartialFillWarning());
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
  const value = useTwapStore((store) => store.getChunks());
  const formattedValue = useFormatNumber({ value });

  return (
    <Tooltip text={formattedValue}>
      <StyledOneLineText>{formattedValue}</StyledOneLineText>
    </Tooltip>
  );
}

export function ChunksAmount() {
  const value = useTwapStore((store) => store.getSrcChunkAmountUi());
  const formattedValue = useFormatNumber({ value });
  if (!value) return null;
  return (
    <Tooltip text={formattedValue}>
      <StyledOneLineText className="twap-chunks-amount">{formattedValue}</StyledOneLineText>
    </Tooltip>
  );
}

export const Deadline = () => {
  const deadline = useTwapStore((store) => store.getDeadlineUi());
  return <StyledOneLineText>{deadline}</StyledOneLineText>;
};

export const OrderType = () => {
  const isLimitOrder = useTwapStore((store) => store.isLimitOrder);
  const translations = useTwapContext().translations;
  return <StyledOneLineText>{isLimitOrder ? translations.limitOrder : translations.marketOrder}</StyledOneLineText>;
};

export const TradeIntervalAsText = () => {
  const getFillDelayText = useTwapStore((store) => store.getFillDelayText);
  const translations = useTwapContext().translations;

  return <StyledOneLineText>{getFillDelayText(translations)}</StyledOneLineText>;
};

export const MinDstAmountOut = () => {
  const isLimitOrder = useTwapStore((store) => store.isLimitOrder);
  const translations = useTwapContext().translations;
  const dstMinAmountOutUi = useTwapStore((store) => store.getDstMinAmountOutUi());

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

export const OrderSummaryDetailsMinDstAmount = ({ subtitle }: { subtitle?: boolean }) => {
  return (
    <StyledSummaryRow className="twap-order-summary-details-item">
      <OrderSummaryMinDstAmountOutLabel subtitle={subtitle} />
      <StyledSummaryRowRight className="twap-order-summary-details-item-right">
        <>
          <TokenLogoAndSymbol isSrc={false} reverse={true} />
          <MinDstAmountOut />
        </>
      </StyledSummaryRowRight>
    </StyledSummaryRow>
  );
};

export const OrderSummaryDetailsTradeInterval = ({ subtitle }: { subtitle?: boolean }) => {
  return (
    <StyledSummaryRow className="twap-order-summary-details-item">
      <OrderSummaryTradeIntervalLabel subtitle={subtitle} />
      <StyledSummaryRowRight className="twap-order-summary-details-item-right">
        <TradeIntervalAsText />
      </StyledSummaryRowRight>
    </StyledSummaryRow>
  );
};

export const OrderSummaryDetailsTotalChunks = ({ subtitle }: { subtitle?: boolean }) => {
  return (
    <StyledSummaryRow className="twap-order-summary-details-item">
      <OrderSummaryTotalChunksLabel subtitle={subtitle} />
      <StyledSummaryRowRight className="twap-order-summary-details-item-right">
        <TotalChunks />
      </StyledSummaryRowRight>
    </StyledSummaryRow>
  );
};

export const OrderSummaryDetailsChunkSize = ({ subtitle }: { subtitle?: boolean }) => {
  return (
    <StyledSummaryRow className="twap-order-summary-details-item">
      <OrderSummaryChunkSizeLabel subtitle={subtitle} />
      <StyledSummaryRowRight className="twap-order-summary-details-item-right">
        <>
          <TokenLogoAndSymbol isSrc={true} reverse={true} />
          <ChunksAmount />
        </>
      </StyledSummaryRowRight>
    </StyledSummaryRow>
  );
};

export const OrderSummaryDetailsOrderType = ({ subtitle }: { subtitle?: boolean }) => {
  return (
    <StyledSummaryRow className="twap-order-summary-details-item">
      <OrderSummaryOrderTypeLabel subtitle={subtitle} />
      <StyledSummaryRowRight className="twap-order-summary-details-item-right">
        <OrderType />
      </StyledSummaryRowRight>
    </StyledSummaryRow>
  );
};

export const OrderSummaryDetailsDeadline = ({ subtitle }: { subtitle?: boolean }) => {
  return (
    <StyledSummaryRow className="twap-order-summary-details-item">
      <OrderSummaryDeadlineLabel subtitle={subtitle} />
      <StyledSummaryRowRight className="twap-order-summary-details-item-right">
        <Deadline />
      </StyledSummaryRowRight>
    </StyledSummaryRow>
  );
};

export const OrderSummaryDetails = ({ className = "", subtitle }: { className?: string; subtitle?: boolean }) => {
  return (
    <StyledSummaryDetails className={`twap-order-summary-details ${className}`}>
      <OrderSummaryDetailsDeadline subtitle={subtitle} />
      <OrderSummaryDetailsOrderType subtitle={subtitle} />
      <OrderSummaryDetailsChunkSize subtitle={subtitle} />
      <OrderSummaryDetailsTotalChunks subtitle={subtitle} />
      <OrderSummaryDetailsTradeInterval subtitle={subtitle} />
      <OrderSummaryDetailsMinDstAmount subtitle={subtitle} />
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

export function OrderSummaryModalContainer({ children, className }: { children: ReactNode; className?: string }) {
  const showConfirmation = useTwapStore((store) => store.showConfirmation);
  const setShowConfirmation = useTwapStore((store) => store.setShowConfirmation);
  return (
    <Modal open={showConfirmation} className={className} onClose={() => setShowConfirmation(false)}>
      {children}
    </Modal>
  );
}

export const OrderSummaryTokenDisplay = ({ isSrc, usdSuffix, usdPrefix }: { isSrc?: boolean; usdSuffix?: string; usdPrefix?: string }) => {
  const translations = useTwapContext().translations;
  const isLimitOrder = useTwapStore((store) => store.isLimitOrder);
  const srcAmount = useTwapStore((store) => store.srcAmountUi);
  const dstAmount = useTwapStore((store) => store.getDstAmountUi());

  const amount = isSrc ? srcAmount : dstAmount;
  const prefix = isSrc ? "" : isLimitOrder ? "≥ " : "~ ";

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
          <StyledOneLineText>{amount}</StyledOneLineText>
        </StyledRowFlex>
      </StyledRowFlex>
    </StyledOrderSummaryTokenDisplay>
  );
};

export const AcceptDisclaimer = ({ variant, className }: { variant?: SwitchVariant; className?: string }) => {
  const translations = useTwapContext().translations;

  const setDisclaimerAccepted = useTwapStore((store) => store.setDisclaimerAccepted);
  const disclaimerAccepted = useTwapStore((store) => store.disclaimerAccepted);

  return (
    <StyledRowFlex gap={5} justifyContent="space-between" className={`twap-disclaimer-switch ${className}`}>
      <Label>{translations.acceptDisclaimer}</Label>
      <Switch variant={variant} value={disclaimerAccepted} onChange={() => setDisclaimerAccepted(!disclaimerAccepted)} />
    </StyledRowFlex>
  );
};

export const OutputAddress = ({ className }: { className?: string }) => {
  const maker = useTwapStore((store) => store.lib?.maker);
  const translations = useTwapContext().translations;

  return (
    <StyledOutputAddress className={`twap-order-summary-output-address ${className}`}>
      <StyledText style={{ textAlign: "center", width: "100%" }} className="text">
        {translations.outputWillBeSentTo}
      </StyledText>
      <Tooltip childrenStyles={{ width: "100%" }} text={maker}>
        <StyledOneLineText style={{ textAlign: "center", width: "100%" }} className="address">
          {maker}
        </StyledOneLineText>
      </Tooltip>
    </StyledOutputAddress>
  );
};

const StyledOutputAddress = styled(StyledColumnFlex)({});

export const OrderSummaryLimitPriceToggle = () => {
  const { isLimitOrder, toggleInverted, limitPrice, leftToken, rightToken } = useLimitPrice();
  const translations = useTwapContext().translations;

  return isLimitOrder ? (
    <TokenPriceCompare leftToken={leftToken} rightToken={rightToken} price={limitPrice} toggleInverted={toggleInverted} />
  ) : (
    <StyledText>{translations.none}</StyledText>
  );
};

export const OrderSummaryPriceCompare = () => {
  const { isLimitOrder, toggleInverted, limitPrice, leftToken, rightToken } = useLimitPrice();

  const market = useMarketPrice();

  if (isLimitOrder) {
    return <TokenPriceCompare leftToken={leftToken} rightToken={rightToken} price={limitPrice} toggleInverted={toggleInverted} />;
  }

  return <TokenPriceCompare leftToken={market.leftToken} rightToken={market.rightToken} price={market.marketPrice} toggleInverted={market.toggleInverted} />;
};

export const OrderSummaryLimitPrice = () => {
  const translations = useTwapContext().translations;

  return (
    <StyledRowFlex className="twap-order-summary-limit-price" justifyContent="space-between">
      <Label tooltipText={translations.confirmationLimitPriceTooltip}>{translations.limitPrice}</Label>
      <OrderSummaryLimitPriceToggle />
    </StyledRowFlex>
  );
};

export const DisclaimerText = ({ className = "" }: { className?: string }) => {
  const translations = useTwapContext().translations;
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
          {translations.link}
        </a>
        . {translations.disclaimer7}{" "}
        <a href="https://github.com/orbs-network/twap/blob/master/TOS.md" target="_blank">
          {translations.link}
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
  maxHeight: 140,
  overflow: "auto",
  gap: 10,
  "*": {
    fontSize: 16,
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

const StyledSummaryRowRight = styled(StyledOverflowContainer)({
  flex: 1,
  width: "unset",
  justifyContent: "flex-end",
  ".twap-token-logo": {
    width: 22,
    height: 22,
    minWidth: 22,
    minHeight: 22,
  },
});
const StyledSummaryDetails = styled(StyledColumnFlex)({
  gap: 15,
});

const StyledSummaryRow = styled(StyledRowFlex)({
  justifyContent: "space-between",
  width: "100%",
  ".twap-label": {
    minWidth: 0,
    maxWidth: "60%",
  },
  "@media(max-width: 700px)": {
    flexDirection: "column",
    alignItems: "flex-start",
    ".twap-label": {
      maxWidth: "unset",
    },
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
  const value = useTwapStore((store) => store.getSrcChunkAmountUi());
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

export const TradeSize = ({ hideLabel, hideSymbol }: { hideLabel?: boolean; hideSymbol?: boolean }) => {
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
        <TokenLogo isSrc={true} />
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

export const WarningMessage = ({ className }: { className?: string }) => {
  const translations = useTwapContext().translations;

  const warning = useTwapStore((state) => state.getFillWarning(translations));

  if (!warning) return null;
  if (warning === translations.selectTokens || warning === translations.enterAmount) {
    return null;
  }

  return (
    <Fade in={true}>
      <StyledMsg className={`twap-warning-msg ${className}`}>
        <AiOutlineWarning />
        <Typography>{warning}</Typography>
      </StyledMsg>
    </Fade>
  );
};

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
  const setLimitOrderPriceUi = useTwapStore((store) => store.setLimitOrderPriceUi);
  const { custom } = useLimitPrice();
  const onClick = () => {
    setLimitOrderPriceUi();
  };

  if (!custom) return null;

  return (
    <Tooltip text="Reset to market price">
      {children ? (
        <span onClick={onClick} className="twap-limit-reset">
          {children}
        </span>
      ) : (
        <IconButton onClick={onClick} className="twap-limit-reset">
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
