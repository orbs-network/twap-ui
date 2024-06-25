import { FC, ReactNode, useCallback, useMemo } from "react";
import {
  Balance,
  Icon,
  IconButton,
  NumericInput,
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
  Message,
  Button,
} from "./base";
import { styled } from "@mui/material";
import { useTwapContext } from "../context";
import { AiOutlineWarning } from "@react-icons/all-files/ai/AiOutlineWarning";
import { RiArrowUpDownLine } from "@react-icons/all-files/ri/RiArrowUpDownLine";

import {
  useLoadingState,
  useFormatNumber,
  useToken,
  useSwitchTokens,
  useLimitPrice,
  useDstMinAmountOut,
  useSrcAmountUsdUi,
  useDstAmountUsdUi,
  useChunks,
  useSetChunks,
  useSrcChunkAmountUsdUi,
  useSrcBalance,
  useAmountUi,
  useDstBalance,
  useSrcChunkAmountUi,
  useDeadlineUi,
  useSetSrcAmountUi,
  useOutAmount,
  useInvertPrice,
  useFormatDecimals,
  useFillDelayText,
  useSwapWarning,
  useTokenSelect,
  useIsMarketOrder,
  useConfirmationButton,
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
import { Fade, Typography } from "@mui/material";
import Copy from "./base/Copy";
import { SQUIGLE } from "../config";
import { Styles } from "..";
import PendingTxModal from "./base/PendingTxModal";
import SuccessTxModal from "./base/SuccessTxModal";
import { IoIosArrowDown } from "@react-icons/all-files/io/IoIosArrowDown";
import { amountUi, makeElipsisAddress } from "../utils";
import BN from "bignumber.js";

export const ChangeTokensOrder = ({ children, className = "", icon = <RiArrowUpDownLine /> }: { children?: ReactNode; className?: string; icon?: any }) => {
  const switchTokens = useSwitchTokens();
  return (
    <StyledRowFlex className={`${className} twap-change-tokens-order`}>
      <IconButton onClick={switchTokens}>{children || <Icon icon={icon} />}</IconButton>
    </StyledRowFlex>
  );
};

const Input = (props: {
  className?: string;
  decimalScale?: number;
  loading?: boolean;
  prefix?: string;
  disabled?: boolean;
  placeholder?: string;
  onChange?: (value: string) => void;
  value: string;
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
  return <Input prefix="" onChange={onChange} value={amount || ""} decimalScale={decimals} className={props.className} placeholder={props.placeholder} />;
};

const DstTokenInput = (props: { className?: string; placeholder?: string; decimalScale?: number }) => {
  const { token } = useTwapStore((store) => ({
    token: store.dstToken,
    srcAmount: store.srcAmountUi,
  }));
  const { outAmountUi, isLoading } = useOutAmount();
  return (
    <Input
      disabled={true}
      loading={isLoading}
      prefix={SQUIGLE}
      value={useFormatDecimals(outAmountUi)}
      decimalScale={props.decimalScale || token?.decimals}
      className={props.className}
      placeholder={props.placeholder}
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
    <div className={`${className} twap-token-select`} onClick={onClick} style={{ cursor: "pointer" }}>
      {token ? (
        <StyledRowFlex gap={5} style={{ cursor: "pointer" }} width="fit-content" className={`twap-token-selected`}>
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
    </div>
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
  const onTokenSelectedCallback = useTokenSelect();

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
  const { srcUsdLoading, dstUsdLoading } = useLoadingState();
  const dstUSD = useDstAmountUsdUi();

  const usd = isSrc ? srcUSD : dstUSD;
  const isLoading = isSrc ? srcUsdLoading : dstUsdLoading;

  if (Number(usd) <= 0 && hideIfZero) return null;

  return <USD decimalScale={decimalScale} suffix={suffix} prefix={prefix} onlyValue={onlyValue} className={className} emptyUi={emptyUi} value={usd || "0"} isLoading={isLoading} />;
}

export const SubmitButton = ({ className = "", isMain }: { className?: string; isMain?: boolean }) => {
  // const { loading, onClick, disabled, text } = useSubmitButton(isMain);

  // return (
  //   <Button text={text} className={`twap-submit ${className}`} loading={loading} onClick={onClick || (() => {})} disabled={disabled}>
  //     <p className="twap-submit-text" style={{ margin: 0 }}>
  //       {text}
  //     </p>
  //   </Button>
  // );

  return null;
};

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
  const isMarketOrder = useTwapStore((store) => store.isMarketOrder);
  const translations = useTwapContext().translations;
  return <StyledOneLineText>{!isMarketOrder ? translations.limitOrder : translations.marketOrder}</StyledOneLineText>;
};

export const TradeIntervalAsText = ({ translations: _translations }: { translations?: Translations }) => {
  const fillDelayText = useFillDelayText();

  return <StyledOneLineText>{fillDelayText}</StyledOneLineText>;
};

export const MinDstAmountOut = ({ translations: _translations }: { translations?: Translations }) => {
  const { dstToken } = useTwapStore((store) => ({
    dstToken: store.dstToken,
  }));
  const translations = useTwapContext()?.translations || _translations;
  const dstMinAmountOut = useDstMinAmountOut();

  const dstMinAmountOutUi = useMemo(() => {
    if (BN(dstMinAmountOut || "0").eq(1)) return "";

    return amountUi(dstToken, BN(dstMinAmountOut || "0"));
  }, [dstMinAmountOut, dstToken]);

  const formattedValue = useFormatNumber({ value: dstMinAmountOutUi });

  return (
    <Tooltip text={formattedValue}>
      <StyledOneLineText>{formattedValue}</StyledOneLineText>
    </Tooltip>
  );
};

export const OrderSummaryDetailsMinDstAmount = ({ subtitle, translations }: { subtitle?: boolean; translations?: Translations }) => {
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

export const OrderSummaryDetailsOrderType = ({ subtitle, translations }: { subtitle?: boolean; translations?: Translations }) => {
  return (
    <StyledSummaryRow className="twap-order-summary-details-item">
      <OrderSummaryOrderTypeLabel subtitle={subtitle} translations={translations} />
      <StyledSummaryRowRight className="twap-order-summary-details-item-right">
        <OrderType />
      </StyledSummaryRowRight>
    </StyledSummaryRow>
  );
};

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
      <OrderSummaryDetailsOrderType subtitle={subtitle} translations={translations} />
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
  const srcAmount = useTwapStore((store) => store.srcAmountUi);
  const dstAmount = useOutAmount().outAmountUi;

  const amount = isSrc ? srcAmount : dstAmount;
  const prefix = "";
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
  const { translations, lib } = useTwapContext();

  return (
    <StyledOutputAddress className={`twap-order-summary-output-address ${className}`}>
      <StyledText style={{ textAlign: "center", width: "100%" }} className="text">
        {translations.outputWillBeSentTo}
      </StyledText>
      <StyledOneLineText style={{ textAlign: "center", width: "100%" }} className="address">
        {ellipsis ? makeElipsisAddress(lib?.maker, ellipsis) : lib?.maker}
      </StyledOneLineText>
    </StyledOutputAddress>
  );
};

const StyledOutputAddress = styled(StyledColumnFlex)({});

export const OrderSummaryLimitPriceToggle = ({ translations: _translations }: { translations?: Translations }) => {
  const limitPriceUi = useLimitPrice().limitPriceUi;
  const { leftToken, rightToken, price, onInvert } = useInvertPrice(limitPriceUi);
  const translations = useTwapContext()?.translations || _translations;

  return <TokenPriceCompare leftToken={leftToken} rightToken={rightToken} price={price} toggleInverted={onInvert} />;
};

export const OrderSummaryPriceCompare = () => {
  const limitPrice = useLimitPrice().limitPriceUi;
  const { onInvert, price, leftToken, rightToken } = useInvertPrice(limitPrice);

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
  const { translations, lib } = useTwapContext();

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

const StyledChunksInput = styled(NumericInput)({
  width: "100%",

  height: 35,
  padding: "0px 10px",
  input: {
    fontSize: 16,
    textAlign: "right",
    width: "100%",
    transition: "0.2s all",
  },
});

const StyledTradeInfoExplanation = styled(StyledColumnFlex)({
  maxHeight: 140,
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

export const CopyTokenAddress = ({ isSrc }: { isSrc: boolean }) => {
  const srcToken = useTwapStore((store) => store.srcToken);
  const dstToken = useTwapStore((store) => store.dstToken);

  const address = isSrc ? srcToken?.address : dstToken?.address;

  return <Copy value={address} />;
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

export const PanelWarning = ({ className = "" }: { className?: string }) => {
  const { feeOnTransferWarning } = useSwapWarning();
  const { translations } = useTwapContext();
  const isMarketOrder = useIsMarketOrder();

  const marketOrderWarning = useMemo(() => {
    return isMarketOrder ? translations?.marketOrderWarning : undefined;
  }, [translations, isMarketOrder]);

  const warning = feeOnTransferWarning || marketOrderWarning;

  if (!warning) return null;

  return <StyledPanelWarning text={warning} type="warning" />;
};

const StyledPanelWarning = styled(Message)({
  textAlign: "center",
  width: "100%",
});

export const LimitSwitch = () => {
  const isLimitOrder = useTwapContext().isLimitOrder;

  const { isMarketOrder, updateState } = useTwapStore((s) => ({
    isMarketOrder: s.isMarketOrder,
    updateState: s.updateState,
  }));

  const onToggle = useCallback(() => {
    updateState({
      isMarketOrder: !isMarketOrder,
    });
  }, [isMarketOrder, updateState]);

  if (isLimitOrder) return null;

  return <Switch value={!isMarketOrder} onChange={onToggle} />;
};

export const ShowConfirmationButton = () => {
  const { onClick, text, disabled, loading } = useConfirmationButton();

  return (
    <Button allowClickWhileLoading={true} onClick={onClick ? onClick : () => {}} loading={loading} disabled={disabled}>
      {loading ? 'Loading...' : text}
    </Button>
  );
};
