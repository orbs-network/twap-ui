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
import { HiOutlineSwitchVertical } from "react-icons/hi";
import { TokenData } from "@orbs-network/twap";
import { TbArrowsRightLeft } from "react-icons/tb";
import { styled } from "@mui/system";
import { AiOutlineWarning } from "react-icons/ai";
import { useTwapContext } from "../context";
import {
  useLoadingState,
  useLimitPrice,
  useMarketPrice,
  useCreateOrder,
  useApproveToken,
  useChangeNetwork,
  useHasAllowanceQuery,
  useUnwrapToken,
  useWrapToken,
  useFormatNumber,
} from "../hooks";
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
import { analytics } from "../analytics";
import { Fade, FormControl, RadioGroup, Typography } from "@mui/material";
import { IoIosArrowDown } from "react-icons/io";
import { IconType } from "react-icons";
import Copy from "./base/Copy";
import { SQUIGLE } from "../config";
import { GrPowerReset } from "react-icons/gr";
import { Styles } from "..";
const ODNP = require("@open-defi-notification-protocol/widget"); // eslint-disable-line

const odnp = new ODNP();
odnp.init();
odnp.hide();
odnp.mainDiv.classList = "odnp";

export function OdnpButton({ className = "" }: { className?: string }) {
  const account = useTwapStore((state) => state.lib)?.maker;
  const translations = useTwapContext().translations;
  if (!account) return null;

  const onClick = () => {
    analytics.onODNPClick();
    odnp.show(account, "twap");
  };
  return (
    <StyledOdnpButton className={`twap-odnp ${className}`} onClick={onClick}>
      <img src="https://open-defi-notifications.web.app/widget/assets/icon.png" />
      <StyledOneLineText>{translations.notify}</StyledOneLineText>
    </StyledOdnpButton>
  );
}

export function ChunksInput({ className = "", showDefault }: { className?: string; showDefault?: boolean }) {
  const translations = useTwapContext().translations;
  const chunks = useTwapStore((store) => store.getChunks());
  const maxPossibleChunks = useTwapStore((store) => store.getMaxPossibleChunks());
  const setChunks = useTwapStore((store) => store.setChunks);
  const getChunksBiggerThanOne = useTwapStore((store) => store.getChunksBiggerThanOne());
  if (!getChunksBiggerThanOne && !showDefault) {
    return <StyledText className={className}>{chunks || "-"}</StyledText>;
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

export const ChangeTokensOrder = ({ children, className = "", icon = <HiOutlineSwitchVertical /> }: { children?: ReactNode; className?: string; icon?: ReactNode }) => {
  const switchTokens = useTwapStore((state) => state.switchTokens);
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
  const dstAmount = useTwapStore((store) => store.getDstAmountUi());
  const isLimitOrder = useTwapStore((store) => store.isLimitOrder);
  const dstInputLoading = (!!dstAmount || dstAmount !== "0") && dstUsdLoading;

  return (
    <NumericInput
      className={`${className} twap-token-input`}
      decimalScale={isSrc ? srcDecimals : dstDecimals}
      prefix={isSrc ? "" : isLimitOrder ? "≥" : SQUIGLE}
      loading={isSrc ? srcInputLoading : dstInputLoading}
      disabled={!isSrc}
      placeholder={placeholder || "0.0"}
      onChange={isSrc ? setSrcAmountUi : () => {}}
      value={isSrc ? srcAmount : dstAmount}
    />
  );
};

export const TokenLogo = ({ isSrc, className = "" }: { isSrc?: boolean; className?: string }) => {
  const srcTokenLogo = useTwapStore((store) => store.srcToken);
  const dstTokenLogo = useTwapStore((store) => store.dstToken);

  if (isSrc) {
    return <Logo className={className} logo={srcTokenLogo?.logoUrl} />;
  }
  return <Logo className={className} logo={dstTokenLogo?.logoUrl} />;
};

export function TokenLogoAndSymbol({ isSrc, reverse }: { isSrc?: boolean; reverse?: boolean }) {
  const srcToken = useTwapStore((state) => state.srcToken);
  const dstToken = useTwapStore((state) => state.dstToken);
  const token = isSrc ? srcToken : dstToken;
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
}: {
  onClick: () => void;
  isSrc?: boolean;
  hideArrow?: boolean;
  className?: string;
  tokenSelectedUi?: ReactNode;
  tokenNotSelectedUi?: ReactNode;
  CustomArrow?: IconType;
}) => {
  const srcToken = useTwapStore((state) => state.srcToken);
  const dstToken = useTwapStore((state) => state.dstToken);

  const token = isSrc ? srcToken : dstToken;

  if (token) {
    return (
      <StyledRowFlex
        gap={5}
        style={{ cursor: "pointer" }}
        width="fit-content"
        onClick={onClick}
        className={`${className} twap-token-select twap-token-selected ${!!srcToken && !!dstToken ? "twap-token-filled" : ""}`}
      >
        {tokenSelectedUi ? (
          <>{tokenSelectedUi}</>
        ) : (
          <>
            <TokenLogoAndSymbol isSrc={isSrc} />
            {!hideArrow && <Icon icon={CustomArrow ? <CustomArrow size={20} /> : <IoIosArrowDown size={20} />} />}
          </>
        )}
      </StyledRowFlex>
    );
  }
  return <TokenSelectButton customUi={tokenNotSelectedUi} hideArrow={hideArrow} className={`${className} twap-token-not-selected`} onClick={onClick} />;
};

export const TokenSymbol = ({ isSrc, hideNull, onClick }: { isSrc?: boolean; hideNull?: boolean; onClick?: () => void }) => {
  const srcToken = useTwapStore((store) => store.srcToken);
  const dstToken = useTwapStore((store) => store.dstToken);
  const token = isSrc ? srcToken : dstToken;
  return <TokenName onClick={onClick} hideNull={hideNull} name={token?.symbol} />;
};

export function TradeIntervalSelector({ placeholder }: { placeholder?: string }) {
  const setFillDelay = useTwapStore((store) => store.setFillDelay);
  const fillDelay = useTwapStore((store) => store.customFillDelay);

  return <TimeSelector placeholder={placeholder} onChange={setFillDelay} value={fillDelay} />;
}

interface TokenSelectProps extends TWAPTokenSelectProps {
  Component?: FC<TWAPTokenSelectProps>;
  onSrcSelect?: (token: any) => void;
  onDstSelect?: (token: any) => void;
  isOpen: boolean;
  onClose: () => void;
  isSrc?: boolean;
  parseToken?: (value: any) => TokenData | undefined;
}

export const TokenSelectModal = ({ Component, isOpen, onClose, parseToken, onSrcSelect, onDstSelect, isSrc }: TokenSelectProps) => {
  const setSrcToken = useTwapStore((store) => store.setSrcToken);
  const setDstToken = useTwapStore((store) => store.setDstToken);

  const onTokenSelected = useCallback(
    (token: any) => {
      onClose();
      const parsedToken = parseToken ? parseToken(token) : token;
      if (isSrc) {
        analytics.onSrcTokenClick(parsedToken?.symbol);
        setSrcToken(parsedToken);
        onSrcSelect?.(token);
      } else {
        analytics.onDstTokenClick(parsedToken?.symbol);
        setDstToken(parsedToken);
        onDstSelect?.(token);
      }
    },
    [onDstSelect, onSrcSelect, isSrc]
  );

  if (!isOpen || !Component) return null;
  return <Component isOpen={true} onClose={onClose} onSelect={onTokenSelected} srcTokenSelected={undefined} dstTokenSelected={undefined} />;
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

export function LimitPriceRadioGroup() {
  const loadingState = useLoadingState();
  const translations = useTwapContext().translations;
  const isLoading = loadingState.srcUsdLoading || loadingState.dstUsdLoading;
  const { leftToken, rightToken } = useTwapStore((state) => state.getLimitPrice(false));
  const isLimitOrder = useTwapStore((store) => store.isLimitOrder);
  const setLimitOrder = useTwapStore((store) => store.setLimitOrder);
  const selectTokensWarning = !leftToken || !rightToken;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLimitOrder(String(event.target.value) === "true");
  };

  return (
    <Tooltip text={isLoading ? `${translations.loading}...` : selectTokensWarning ? translations.selectTokens : ""}>
      <FormControl disabled={!!selectTokensWarning || isLoading}>
        <RadioGroup row name="isLimitOrder" value={String(isLimitOrder)} onChange={handleChange}>
          <Radio label="Market Price" value="false" />
          <Radio label="Limit Price" value="true" />
        </RadioGroup>
      </FormControl>
    </Tooltip>
  );
}

export function ChunksUSD({
  onlyValue,
  emptyUi,
  suffix,
  prefix,
  tooltipPrefix,
}: {
  onlyValue?: boolean;
  emptyUi?: React.ReactNode;
  suffix?: string;
  prefix?: string;
  tooltipPrefix?: string;
}) {
  const usd = useTwapStore((state) => state.getSrcChunkAmountUsdUi());
  const loading = useLoadingState().srcUsdLoading;

  return <USD tooltipPrefix={tooltipPrefix} prefix={prefix} suffix={suffix} value={usd} onlyValue={onlyValue} emptyUi={emptyUi} isLoading={loading} />;
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
}: {
  isSrc?: boolean;
  emptyUi?: ReactNode;
  className?: string;
  onlyValue?: boolean;
  prefix?: string;
  suffix?: string;
}) {
  const srcUSD = useTwapStore((state) => state.getSrcAmountUsdUi());
  const srcLoading = useLoadingState().srcUsdLoading;
  const dstUSD = useTwapStore((state) => state.getDstAmountUsdUi());
  const dstLoading = useLoadingState().dstUsdLoading;
  const usd = isSrc ? srcUSD : dstUSD;
  const isLoading = isSrc ? srcLoading : dstLoading;

  return <USD suffix={suffix} prefix={prefix} onlyValue={onlyValue} className={className} emptyUi={emptyUi} value={usd || "0"} isLoading={isLoading} />;
}

export const SubmitButton = ({ className = "", isMain }: { className?: string; isMain?: boolean }) => {
  const translations = useTwapContext().translations;
  const shouldUnwrap = useTwapStore((store) => store.shouldUnwrap());
  const shouldWrap = useTwapStore((store) => store.shouldWrap());
  const wrongNetwork = useTwapStore((store) => store.wrongNetwork);
  const maker = useTwapStore((store) => store.lib?.maker);
  const disclaimerAccepted = useTwapStore((state) => state.disclaimerAccepted);
  const setShowConfirmation = useTwapStore((state) => state.setShowConfirmation);
  const showConfirmation = useTwapStore((state) => state.showConfirmation);
  const warning = useTwapStore((state) => state.getFillWarning(translations));
  const createOrderLoading = useTwapStore((state) => state.loading);
  const { srcUsdLoading, dstUsdLoading } = useLoadingState();

  const { mutate: approve, isLoading: approveLoading } = useApproveToken();
  const { mutate: createOrder } = useCreateOrder();
  const allowance = useHasAllowanceQuery();
  const { mutate: unwrap, isLoading: unwrapLoading } = useUnwrapToken();
  const { mutate: wrap, isLoading: wrapLoading } = useWrapToken();
  const connect = useTwapContext().connect;

  const { loading: changeNetworkLoading, changeNetwork } = useChangeNetwork();

  const getArgs = () => {
    if (wrongNetwork)
      return {
        text: translations.switchNetwork,
        onClick: changeNetwork,
        loading: changeNetworkLoading,
        disabled: changeNetworkLoading,
      };
    if (!maker)
      return {
        text: translations.connect,
        onClick: connect ? connect : undefined,
        loading: false,
        disabled: false,
      };
    if (warning)
      return {
        text: warning,
        onClick: undefined,
        disabled: true,
        loading: false,
      };
    if (shouldUnwrap)
      return {
        text: translations.unwrap,
        onClick: unwrap,
        loading: unwrapLoading,
        disabled: unwrapLoading,
      };
    if (shouldWrap)
      return {
        text: translations.wrap,
        onClick: wrap,
        loading: wrapLoading,
        disabled: wrapLoading,
      };
    if (createOrderLoading) {
      return {
        text: "",
        onClick: () => {
          setShowConfirmation(true);
          analytics.onOpenConfirmationModal();
        },
        loading: true,
        disabled: showConfirmation,
      };
    }
    if (allowance.isLoading || srcUsdLoading || dstUsdLoading) {
      return { text: "", onClick: undefined, loading: true, disabled: true };
    }
    if (allowance.data === false)
      return {
        text: translations.approve,
        onClick: approve,
        loading: approveLoading,
        disabled: approveLoading,
      };
    if (showConfirmation)
      return {
        text: translations.confirmOrder,
        onClick: createOrder,
        loading: createOrderLoading,
        disabled: isMain ? true : !disclaimerAccepted || createOrderLoading,
      };
    return {
      text: translations.placeOrder,
      onClick: () => {
        setShowConfirmation(true);
        analytics.onOpenConfirmationModal();
      },
      loading: false,
      disabled: false,
    };
  };

  const args = getArgs();

  return (
    <Button className={`twap-submit ${className}`} loading={args.loading} onClick={args.onClick || (() => {})} disabled={args.disabled}>
      {args.text}
    </Button>
  );
};

export const useLimitPriceComponents = ({
  placeholder = "0.00",
  showDefault,
  toggleIcon = <TbArrowsRightLeft style={{ width: 20, height: 20 }} />,
}: {
  placeholder?: string;
  showDefault?: boolean;
  toggleIcon?: ReactElement;
}) => {
  const isLimitOrder = useTwapStore((store) => store.isLimitOrder);
  const { leftToken, rightToken, onChange, limitPrice, toggleInverted } = useLimitPrice();

  const _isLimitOrder = isLimitOrder || showDefault;

  if (!_isLimitOrder || !leftToken || !rightToken) return null;

  return {
    leftToken: <TokenDisplay singleToken symbol={leftToken?.symbol} logo={leftToken?.logoUrl} />,
    rightToken: <TokenDisplay symbol={rightToken?.symbol} logo={rightToken?.logoUrl} />,
    input: <NumericInput placeholder={placeholder} onChange={onChange} value={limitPrice} />,
    toggle: <IconButton onClick={toggleInverted} icon={toggleIcon} />,
  };
};

export function LimitPriceInput({ placeholder = "0.00", className = "", showDefault }: { placeholder?: string; className?: string; showDefault?: boolean }) {
  const components = useLimitPriceComponents({ placeholder, showDefault });

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
  if (!isWarning) return null;

  return <Warning tootlip={translations.prtialFillWarningTooltip} warning={translations.prtialFillWarning} />;
};

export const FillDelayWarning = () => {
  const translations = useTwapContext().translations;
  const fillDelayWarning = useTwapStore((store) => store.getFillDelayWarning());
  const minimumDelayMinutes = useTwapStore((store) => store.getMinimumDelayMinutes());
  if (!fillDelayWarning) return null;

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

export const OrderSummaryTokenDisplay = ({ isSrc }: { isSrc?: boolean }) => {
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
        <TokenUSD isSrc={isSrc} />
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
    <StyledRowFlex gap={5} justifyContent="flex-start" className={`twap-disclaimer-switch ${className}`}>
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
    top: 2,
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
    width: "fit-content",
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

const StyledOdnpButton = styled("button")({
  height: 30,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  padding: "0px 15px",
  cursor: "pointer",
  "& img": {
    width: 20,
  },
  "& p": {
    fontSize: 12,
    color: "inherit",
    fontWeight: "inherit",
  },
});

export const TradeSizeValue = ({ symbol }: { symbol?: boolean }) => {
  const value = useTwapStore((store) => store.getSrcChunkAmountUi());
  const formattedValue = useFormatNumber({ value });
  const srcToken = useTwapStore((store) => store.srcToken);

  const formattedValueTooltip = useFormatNumber({ value, decimalScale: 18 });
  return (
    <Tooltip text={`${symbol ? `${formattedValueTooltip} ${srcToken?.symbol}` : formattedValueTooltip}`}>
      <Typography className="twap-trade-size-value">{`${symbol ? `${formattedValue} ${srcToken?.symbol}` : formattedValue}`}</Typography>
    </Tooltip>
  );
};

export const TradeSize = ({ hideLabel }: { hideLabel?: boolean }) => {
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
        <TradeSizeValue symbol={true} />
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
