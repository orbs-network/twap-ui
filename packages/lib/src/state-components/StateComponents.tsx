import { Box } from "@mui/material";
import { ReactNode } from "react";
import { useTwapContext } from "..";
import { Balance, Button, Icon, IconButton, NumberDisplay, NumericInput, Slider, Switch, TimeSelector, TokenName, TokenPriceCompare, Tooltip, USD } from "../components";
import { useTwapStore } from "../store";
import { StyledOneLineText, StyledRowFlex, StyledText } from "../styles";
import { HiOutlineSwitchVertical } from "react-icons/hi";
import { useCustomActions, useLimitPrice, useLoadingState, useMarketPrice, useSubmitButton } from "../hooks";
import Logo from "../components/TokenLogo";
import TokenDisplay from "../components/TokenDisplay";
import { IoIosArrowDown } from "react-icons/io";
import TokenSelectButton from "../components/TokenSelectButton";
import { TokenData } from "@orbs-network/twap";
import { TbArrowsRightLeft } from "react-icons/tb";
import { styled } from "@mui/system";

export function ChunksInput() {
  const translations = useTwapContext().translations;
  const chunks = useTwapStore((store) => store.getChunks());
  const maxPossibleChunks = useTwapStore((store) => store.getMaxPossibleChunks());
  const setChunks = useTwapStore((store) => store.setChunks);
  const getChunksBiggerThanOne = useTwapStore((store) => store.getChunksBiggerThanOne());
  if (!getChunksBiggerThanOne) {
    return <StyledText>{chunks || "-"}</StyledText>;
  }
  return (
    <Tooltip text={translations.sliderMinSizeTooltip}>
      <StyledChunksInput placeholder="0" value={chunks} decimalScale={0} maxValue={maxPossibleChunks.toString()} onChange={(value) => setChunks(Number(value))} />
    </Tooltip>
  );
}

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

export function ChunksSliderSelect() {
  const getChunksBiggerThanOne = useTwapStore((store) => store.getChunksBiggerThanOne());

  const maxPossibleChunks = useTwapStore((store) => store.getMaxPossibleChunks());
  const chunks = useTwapStore((store) => store.getChunks());
  const setChunks = useTwapStore((store) => store.setChunks);

  if (!getChunksBiggerThanOne) return null;
  return <StyledChunksSliderSelect maxTrades={maxPossibleChunks} value={chunks} onChange={setChunks} />;
}

const StyledChunksSliderSelect = styled(Slider)({
  flex: 1,
  width: "auto",
  marginLeft: 30,
});

export const ChangeTokensOrder = ({ children }: { children?: ReactNode }) => {
  const switchTokens = useTwapStore((state) => state.switchTokens);
  return (
    <Box className="twap-change-tokens-order">
      <IconButton onClick={switchTokens}>{children || <Icon icon={<HiOutlineSwitchVertical />} />}</IconButton>
    </Box>
  );
};

export function MaxDurationSelector() {
  const duration = useTwapStore((store) => store.duration);
  const onChange = useTwapStore((store) => store.setDuration);

  return <TimeSelector value={duration} onChange={onChange} />;
}

export const TokenInput = ({ isSrc, placeholder }: { isSrc?: boolean; placeholder?: string }) => {
  // src
  const srcDecimals = useTwapStore((store) => store.srcToken?.decimals);
  const srcUsdLoading = useLoadingState().srcUsdLoading;
  const srcAmount = useTwapStore((store) => store.srcAmountUi);
  const setSrcAmountUi = useTwapStore((store) => store.setSrcAmountUi);
  const srcInputLoading = (!!srcAmount || srcAmount !== "0") && srcUsdLoading;
  // dst
  const dstDecimals = useTwapStore((store) => store.dstToken?.decimals);
  const dstUsdLoading = useLoadingState().dstUsdLoading;
  const dstAmount = useTwapStore((store) => store.getDstAmountUi());
  const isLimitOrder = useTwapStore((store) => store.isLimitOrder);
  const dstInputLoading = (!!dstAmount || dstAmount !== "0") && dstUsdLoading;

  return (
    <NumericInput
      className="twap-token-input"
      decimalScale={isSrc ? srcDecimals : dstDecimals}
      prefix={isSrc ? "" : isLimitOrder ? "≥" : "~"}
      loading={isSrc ? srcInputLoading : dstInputLoading}
      disabled={!isSrc}
      placeholder={placeholder || "0.0"}
      onChange={isSrc ? setSrcAmountUi : () => {}}
      value={isSrc ? srcAmount : dstAmount}
    />
  );
};

export const TokenLogo = ({ isSrc }: { isSrc?: boolean }) => {
  const srcTokenLogo = useTwapStore((store) => store.srcToken);
  const dstTokenLogo = useTwapStore((store) => store.dstToken);

  if (isSrc) {
    return <Logo logo={srcTokenLogo?.logoUrl} />;
  }
  return <Logo logo={dstTokenLogo?.logoUrl} />;
};

export function TokenLogoAndSymbol({ isSrc, reverse }: { isSrc?: boolean; reverse?: boolean }) {
  const srcToken = useTwapStore((state) => state.srcToken);
  const dstToken = useTwapStore((state) => state.dstToken);
  const token = isSrc ? srcToken : dstToken;
  return <TokenDisplay reverse={reverse} logo={token?.logoUrl} symbol={token?.symbol} />;
}

export const TokenSelect = ({ onClick, isSrc, hideArrow }: { onClick: () => void; isSrc?: boolean; hideArrow?: boolean }) => {
  const srcToken = useTwapStore((state) => state.srcToken);
  const dstToken = useTwapStore((state) => state.dstToken);

  const token = isSrc ? srcToken : dstToken;

  if (token) {
    return (
      <StyledRowFlex style={{ cursor: "pointer" }} width="fit-content" onClick={onClick} className="twap-token-select twap-token-selected">
        <TokenLogoAndSymbol isSrc={isSrc} />
        {!hideArrow && <Icon icon={<IoIosArrowDown size={20} />} />}
      </StyledRowFlex>
    );
  }
  return <TokenSelectButton className="twap-token-not-select" onClick={onClick} />;
};

export const TokenSymbol = ({ isSrc }: { isSrc?: boolean }) => {
  const srcToken = useTwapStore((store) => store.srcToken);
  const dstToken = useTwapStore((store) => store.dstToken);
  const token = isSrc ? srcToken : dstToken;

  return <TokenName name={token?.symbol} />;
};

export function TradeIntervalSelector() {
  const setFillDelay = useTwapStore((store) => store.setFillDelay);
  const fillDelay = useTwapStore((store) => store.getFillDelay());

  const { onFillDelayBlur, onFillDelayFocus } = useCustomActions();
  return <TimeSelector onFocus={onFillDelayFocus} onBlur={onFillDelayBlur} onChange={setFillDelay} value={fillDelay} />;
}

interface TokenSelectModalProps {
  Modal?: any;
  onSrcSelect?: (token: any) => void;
  onDstSelect?: (token: any) => void;
  isOpen: boolean;
  onClose: () => void;
  isSrc?: boolean;
  parseToken: (value: any) => TokenData;
}

export const TokenSelectModal = ({ Modal, isOpen, onClose, parseToken, onSrcSelect, onDstSelect, isSrc }: TokenSelectModalProps) => {
  const setSrcToken = useTwapStore((store) => store.setSrcToken);
  const setDstToken = useTwapStore((store) => store.setDstToken);

  const onTokenSelected = (token: any) => {
    onClose();

    if (isSrc) {
      setSrcToken(parseToken ? parseToken(token) : token);
      onSrcSelect?.(token);
    } else {
      setDstToken(parseToken ? parseToken(token) : token);
      onDstSelect?.(token);
    }
  };

  if (!isOpen) return null;
  return <Modal isOpen={true} onClose={onClose} onCurrencySelect={onTokenSelected} selectedCurrency={undefined} otherSelectedCurrency={undefined} />;
};

export function LimitPriceToggle() {
  const loadingState = useLoadingState();
  const isLoading = loadingState.srcUsdLoading && loadingState.dstUsdLoading;
  const translations = useTwapContext().translations;
  const { leftToken, rightToken } = useTwapStore((state) => state.getLimitPrice(false));
  const isLimitOrder = useTwapStore((store) => store.isLimitOrder);
  const toggleLimit = useTwapStore((store) => store.toggleLimitOrder);
  const selectTokensWarning = !leftToken || !rightToken;

  return (
    <Tooltip text={isLoading ? `${translations.loading}...` : selectTokensWarning ? translations.selectTokens : ""}>
      <Switch disabled={!!selectTokensWarning || isLoading} value={isLimitOrder} onChange={toggleLimit} />
    </Tooltip>
  );
}

export function ChunksAmount() {
  const value = useTwapStore((store) => store.getSrcChunkAmountUi());
  return (
    <StyledOneLineText className="twap-chunks-amount">
      <NumberDisplay value={value} />
    </StyledOneLineText>
  );
}

export function TotalChunks() {
  const value = useTwapStore((store) => store.getChunks());

  return (
    <StyledOneLineText>
      <NumberDisplay value={value} />
    </StyledOneLineText>
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

  if (!isLimitOrder) {
    return <StyledOneLineText>{translations.none}</StyledOneLineText>;
  }

  return (
    <StyledOneLineText>
      <NumberDisplay value={dstMinAmountOutUi} />
    </StyledOneLineText>
  );
};

export const SrcTokenAmount = () => {
  const amount = useTwapStore((store) => store.srcAmountUi);

  return (
    <StyledOneLineText className="twap-token-amount">
      <NumberDisplay value={amount} />
    </StyledOneLineText>
  );
};

export const DstTokenAmount = () => {
  const amount = useTwapStore((store) => store.getDstAmountUi());

  return (
    <StyledOneLineText className="twap-token-amount">
      <NumberDisplay value={amount} />
    </StyledOneLineText>
  );
};

export function ChunksUSD() {
  const usd = useTwapStore((state) => state.getSrcChunkAmountUsdUi());
  const loading = useLoadingState().srcUsdLoading;

  return <USD value={usd} isLoading={loading} />;
}

function SrcBalance() {
  const balance = useTwapStore((state) => state.getSrcBalanceUi());
  const isLoading = useLoadingState().srcBalanceLoading;
  return <Balance value={balance} isLoading={isLoading} />;
}

function DstBalance() {
  const balance = useTwapStore((state) => state.getDstBalanceUi());
  const isLoading = useLoadingState().dstBalanceLoading;
  return <Balance value={balance} isLoading={isLoading} />;
}

export const TokenBalance = ({ isSrc }: { isSrc?: boolean }) => {
  if (isSrc) {
    return <SrcBalance />;
  }
  return <DstBalance />;
};

export function SrcTokenUSD() {
  const usd = useTwapStore((state) => state.getSrcAmountUsdUi());
  const srcLoading = useLoadingState().srcUsdLoading;

  return <USD value={usd} isLoading={srcLoading} />;
}

export function DstTokenUSD() {
  const usd = useTwapStore((state) => state.getDstAmountUsdUi());
  const loading = useLoadingState().dstUsdLoading;

  return <USD value={usd} isLoading={loading} />;
}

export const TokenUSD = ({ isSrc }: { isSrc?: boolean }) => {
  if (isSrc) {
    return <SrcTokenUSD />;
  }
  return <DstTokenUSD />;
};

export const SubmitButton = ({ className = "" }: { className?: string }) => {
  const { loading, text, onClick, disabled } = useSubmitButton();
  return (
    <Button className={className} loading={loading} onClick={onClick || (() => {})} disabled={disabled}>
      {text}
    </Button>
  );
};

export function LimitPriceInput({ placeholder = "0.00" }: { placeholder?: string }) {
  const isLimitOrder = useTwapStore((store) => store.isLimitOrder);
  const { leftToken, rightToken, onChange, limitPrice, toggleInverted } = useLimitPrice();

  if (!isLimitOrder) return null;
  return (
    <StyledLimitPriceInput className="twap-limit-price-input">
      <StyledRowFlex gap={10} style={{ paddingLeft: 5 }} width="fit-content">
        <StyledText>1</StyledText>
        <TokenDisplay symbol={leftToken?.symbol} logo={leftToken?.logoUrl} />
        <StyledText>=</StyledText>
      </StyledRowFlex>
      <NumericInput placeholder={placeholder} onChange={onChange} value={limitPrice} />
      <StyledRowFlex gap={10} width="fit-content">
        <TokenDisplay symbol={rightToken?.symbol} logo={rightToken?.logoUrl} />
        <IconButton onClick={toggleInverted} icon={<TbArrowsRightLeft style={{ width: 20, height: 20 }} />}></IconButton>
      </StyledRowFlex>
    </StyledLimitPriceInput>
  );
}

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
  "& .twap-token-name": {
    fontSize: 15,
  },
});

export const MarketPrice = () => {
  const { toggleInverted, leftToken, rightToken, marketPrice, loading } = useMarketPrice();
  const translations = useTwapContext().translations;
  return (
    <StyledRowFlex justifyContent="space-between" className="twap-market-price">
      <StyledText className="title">{translations.currentMarketPrice}</StyledText>
      <TokenPriceCompare loading={loading} leftToken={leftToken} rightToken={rightToken} price={marketPrice} toggleInverted={toggleInverted} />
    </StyledRowFlex>
  );
};
