import React, { FC, ReactNode, useCallback, useState } from "react";
import { Balance, Icon, NumericInput, TimeSelector, TokenName, USD, TokenLogo as Logo, Button, Portal } from "./base";
import { Message } from "./base/Message";
import { useWidgetContext } from "../context/context";
import { RiArrowUpDownLine } from "@react-icons/all-files/ri/RiArrowUpDownLine";
import styled from "styled-components";
import { useFormatNumber, useSrcBalance, useDstBalance, useFormatDecimals, useAmountUi } from "../hooks/hooks";
import { useConfirmationButton } from "../hooks/useConfirmationButton";
import { StyledText, StyledRowFlex, StyledColumnFlex, textOverflow } from "../styles";
import TokenDisplay from "./base/TokenDisplay";
import { ChunksAmountLabel } from "./Labels";
import { TooltipProps } from "../types";
import Copy from "./base/Copy";
import { SQUIGLE } from "../config";
import { ORBS_LOGO, ORBS_LOGO_FALLBACK, Styles } from "..";
import { IoIosArrowDown } from "@react-icons/all-files/io/IoIosArrowDown";

import { useFeeOnTransferWarning, useLowPriceWarning, useShouldWrapOrUnwrapOnly, useSrcChunkAmountUsd, useToken, useUsdAmount } from "../hooks/lib";

export const ChangeTokensOrder = ({ children, className = "", icon = <RiArrowUpDownLine /> }: { children?: ReactNode; className?: string; icon?: any }) => {
  const { onSwitchTokens } = useWidgetContext();
  return (
    <StyledChangeTokens className={`${className} twap-change-tokens-order`}>
      <button onClick={onSwitchTokens}>{children || <Icon icon={icon} />}</button>
    </StyledChangeTokens>
  );
};

const StyledChangeTokens = styled(StyledRowFlex)({
  button: {
    padding: 0,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
});

const Input = (props: {
  className?: string;
  decimalScale?: number;
  loading?: boolean;
  prefix?: string;
  disabled?: boolean;
  placeholder?: string;
  onChange?: (value: string) => void;
  value: string;
  onFocus?: () => void;
  onBlur?: () => void;
}) => {
  return (
    <NumericInput
      onBlur={props.onBlur}
      onFocus={props.onFocus}
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
  onFocus,
  onBlur,
}: {
  isSrc?: boolean;
  placeholder?: string;
  className?: string;
  dstDecimalScale?: number;
  onFocus?: () => void;
  onBlur?: () => void;
}) => {
  if (isSrc) {
    return <SrcTokenInput onBlur={onBlur} onFocus={onFocus} className={className} placeholder={placeholder} />;
  }
  return <DstTokenInput decimalScale={dstDecimalScale} className={className} placeholder={placeholder} />;
};

const SrcTokenInput = (props: { className?: string; placeholder?: string; onFocus?: () => void; onBlur?: () => void }) => {
  const {
    srcToken,
    updateState,
    state: { srcAmount },
  } = useWidgetContext();

  const setSrcAmount = useCallback(
    (srcAmount: string) => {
      updateState({ srcAmount });
    },
    [updateState]
  );

  return (
    <Input
      onFocus={props.onFocus}
      onBlur={props.onBlur}
      prefix=""
      onChange={setSrcAmount}
      value={srcAmount || ""}
      decimalScale={srcToken?.decimals}
      className={props.className}
      placeholder={props.placeholder}
    />
  );
};

const DstTokenInput = (props: { className?: string; placeholder?: string; decimalScale?: number }) => {
  const {
    dstToken,
    twap: {
      values: { isMarketOrder, destTokenAmountUI, destTokenAmountLoading },
    },
  } = useWidgetContext();
  return (
    <Input
      disabled={true}
      loading={destTokenAmountLoading}
      prefix={isMarketOrder ? SQUIGLE : ""}
      value={useFormatDecimals(destTokenAmountUI)}
      decimalScale={props.decimalScale || dstToken?.decimals}
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
  CustomArrow,
  customButtonElement,
}: {
  onClick: () => void;
  isSrc?: boolean;
  hideArrow?: boolean;
  className?: string;
  CustomArrow?: any;
  customButtonElement?: FC;
}) => {
  const token = useToken(isSrc);

  if (!token) {
    return (
      <div className={`${className} twap-token-not-selected`} onClick={onClick} style={{ cursor: "pointer" }}>
        <StyledText>Select</StyledText>
      </div>
    );
  }

  return (
    <div className={`${className} twap-token-select`} onClick={onClick} style={{ cursor: "pointer" }}>
      <StyledRowFlex gap={5} style={{ cursor: "pointer" }} width="fit-content" className={`twap-token-selected`}>
        <TokenLogoAndSymbol isSrc={isSrc} />
        {!hideArrow && <Icon icon={CustomArrow ? <CustomArrow size={20} /> : <IoIosArrowDown size={20} />} />}
      </StyledRowFlex>
    </div>
  );
};

export const TokenSymbol = ({ isSrc, hideNull, onClick }: { isSrc?: boolean; hideNull?: boolean; onClick?: () => void }) => {
  const token = useToken(isSrc);
  return <TokenName onClick={onClick} hideNull={hideNull} name={token?.symbol} />;
};

export function TradeIntervalSelector({ placeholder }: { placeholder?: string }) {
  const {
    twap: {
      actionHandlers,
      values: { fillDelay },
    },
  } = useWidgetContext();

  return <TimeSelector placeholder={placeholder} onChange={actionHandlers.setFillDelay} value={fillDelay} />;
}

export function ChunksUSD({ onlyValue, emptyUi, suffix, prefix }: { onlyValue?: boolean; emptyUi?: React.ReactNode; suffix?: string; prefix?: string }) {
  const usd = useSrcChunkAmountUsd();

  return <USD prefix={prefix} suffix={suffix} value={usd} onlyValue={onlyValue} emptyUi={emptyUi} isLoading={!usd} />;
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
  const { srcToken, dstToken } = useWidgetContext();
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
      isLoading={!balance}
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
  const { srcUsd, dstUsd } = useUsdAmount();

  const usd = isSrc ? srcUsd : dstUsd;

  if (Number(usd) <= 0 && hideIfZero) return null;

  return <USD decimalScale={decimalScale} suffix={suffix} prefix={prefix} onlyValue={onlyValue} className={className} emptyUi={emptyUi} value={usd || "0"} isLoading={!usd} />;
}

export function PoweredBy({ className = "" }: { className?: string }) {
  const [url, setUrl] = useState(ORBS_LOGO);
  const translations = useWidgetContext().translations;

  const onError = () => {
    setUrl(ORBS_LOGO_FALLBACK);
  };

  return (
    <StyledPoweredBy className={`${className} twap-powered-by`}>
      <a href="https://www.orbs.com/" target="_blank">
        <StyledText>{translations.poweredBy}</StyledText>
        <img src={url} onError={onError} />
      </a>
    </StyledPoweredBy>
  );
}

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
  const { srcToken, twap } = useWidgetContext();
  const srcChunksAmountUI = twap.values.srcChunksAmountUI;
  const formattedValue = useFormatNumber({ value: srcChunksAmountUI });

  const formattedValueTooltip = useFormatNumber({ value: srcChunksAmountUI, decimalScale: 18 });

  if (!formattedValue || formattedValue === "0") {
    return <p className="twap-trade-size-value">-</p>;
  }

  const content = <p className="twap-trade-size-value">{`${symbol ? `${formattedValue} ${srcToken?.symbol}` : formattedValue}`}</p>;

  return <Tooltip tooltipText={`${symbol ? `${formattedValueTooltip} ${srcToken?.symbol}` : formattedValueTooltip}`}>{content}</Tooltip>;
};

export const TradeSize = ({ hideLabel, hideSymbol, hideLogo }: { hideLabel?: boolean; hideSymbol?: boolean; hideLogo?: boolean }) => {
  const { srcToken, dstToken } = useWidgetContext();

  if (!srcToken && !dstToken) {
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
  const { srcToken, dstToken } = useWidgetContext();

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

export const MarketPriceWarning = ({ className = "" }: { className?: string }) => {
  const isMarketOrder = useWidgetContext().twap.values.isMarketOrder;
  const { translations: t } = useWidgetContext();
  const isWrapOrUnwrapOnly = useShouldWrapOrUnwrapOnly();

  if (!isMarketOrder || isWrapOrUnwrapOnly) return null;

  return (
    <Message
      className={`twap-market-price-warning ${className}`}
      title={
        <>
          {t?.marketOrderWarning}
          <a href="https://www.orbs.com/dtwap-and-dlimit-faq/" target="_blank">{` ${t.learnMore}`}</a>
        </>
      }
      variant="warning"
    />
  );
};

export const ShowConfirmationButton = ({ className = "" }: { className?: string }) => {
  const { onClick, text, disabled, loading } = useConfirmationButton();

  return (
    <Button className={`twap-submit-button ${className}`} onClick={onClick ? onClick : () => {}} loading={loading} disabled={disabled}>
      {text}
    </Button>
  );
};

export const TradeWarning = ({ className = "" }: { className?: string }) => {
  const errors = useWidgetContext().twap.errors;
  const warning = errors.tradeSize || errors.fillDelay || errors.chunks;

  if (!warning) return null;

  return <Message className={className} title={warning.text} variant="warning" />;
};

export const ChunkSizeMessage = ({ className = "" }: { className?: string }) => {
  const {
    isWrongChain,
    srcUsd,
    srcToken,
    twap: {
      values: { srcChunksAmountUI },
    },
  } = useWidgetContext();
  const chunkSizeFormatted = useFormatNumber({ value: srcChunksAmountUI });

  const _usd = useFormatNumber({ value: useSrcChunkAmountUsd(), decimalScale: 2 });
  const usd = _usd ? `($${_usd})` : "";

  if (!srcUsd || isWrongChain) return null;

  return (
    <StyledText className={className}>
      {chunkSizeFormatted} {srcToken?.symbol} per trade <span>{usd}</span>
    </StyledText>
  );
};

const StyledShowConfirmation = styled(StyledColumnFlex)({
  gap: 10,
});

export const LimitPriceMessageContent = ({ className }: { className?: string }) => {
  return (
    <Portal containerId="twap-limit-price-message-container">
      <LimitPriceMessage className={className} />
    </Portal>
  );
};

export const LimitPriceMessage = ({ className }: { className?: string }) => {
  const { translations: t, twap } = useWidgetContext();
  const isMarketOrder = twap.values.isMarketOrder;
  const isWrapOrUnwrapOnly = useShouldWrapOrUnwrapOnly();
  if (isMarketOrder || isWrapOrUnwrapOnly) return null;

  return (
    <StyledLimitPriceMessage
      className={`${className} twap-limit-price-message`}
      variant="warning"
      title={
        <>
          {t.limitPriceMessage}{" "}
          <a href="https://www.orbs.com/dtwap-and-dlimit-faq/" target="_blank">
            {t.learnMore}
          </a>
        </>
      }
    />
  );
};

export const LimitPriceMessagePortal = () => {
  return <div id="twap-limit-price-message-container" />;
};

const StyledLimitPriceMessage = styled(Message)({
  color: "white",
});

export const Separator = ({ className = "" }: { className?: string }) => {
  return <StyledSeparator className={`${className} twap-separator`} />;
};

const StyledSeparator = styled("div")({
  width: "100%",
  height: "1px",
});

export const Tooltip = (props: TooltipProps) => {
  const Tooltip = useWidgetContext().components.Tooltip;

  return <Tooltip tooltipText={props.tooltipText}>{props.children}</Tooltip>;
};
