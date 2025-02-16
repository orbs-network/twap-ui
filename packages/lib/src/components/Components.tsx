import React, { ReactNode, useCallback } from "react";
import { Balance, Icon, NumericInput, TokenName, USD, TokenLogo as Logo, Portal } from "./base";
import { Message } from "./base/Message";
import styled from "styled-components";
import { StyledText, StyledRowFlex } from "../styles";
import TokenDisplay from "./base/TokenDisplay";
import { TooltipProps } from "../types";
import Copy from "./base/Copy";
import { Styles, useWidgetContext } from "..";
import { IoIosArrowDown } from "@react-icons/all-files/io/IoIosArrowDown";
import { useFormatDecimals } from "../hooks/useFormatNumber";
import { useSrcChunkAmountUSD } from "../hooks/useSrcChunkAmountUSD";
import { useAmountUi } from "../hooks/useParseAmounts";
import { useDstBalance, useSrcBalance } from "../hooks/useBalances";
import { useUsdAmount } from "../hooks/useUsdAmounts";
import { useShouldWrapOrUnwrapOnly } from "../hooks/useShouldWrapOrUnwrap";

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
    [updateState],
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
      values: { destTokenAmountUI },
    },
    state: { srcAmount },
    marketPriceLoading,
  } = useWidgetContext();

  const isWrapOrUnwrapOnly = useShouldWrapOrUnwrapOnly();

  return (
    <Input
      disabled={true}
      loading={isWrapOrUnwrapOnly ? false : marketPriceLoading}
      value={useFormatDecimals(isWrapOrUnwrapOnly ? srcAmount : destTokenAmountUI)}
      decimalScale={props.decimalScale || dstToken?.decimals}
      className={props.className}
      placeholder={props.placeholder}
    />
  );
};

const useToken = (isSrc?: boolean) => {
  const { srcToken, dstToken } = useWidgetContext();
  return isSrc ? srcToken : dstToken;
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
}: {
  onClick: () => void;
  isSrc?: boolean;
  hideArrow?: boolean;
  className?: string;
  CustomArrow?: any;
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

export function ChunksUSD({ onlyValue, emptyUi, suffix, prefix }: { onlyValue?: boolean; emptyUi?: React.ReactNode; suffix?: string; prefix?: string }) {
  const usd = useSrcChunkAmountUSD();

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
          {`${t?.marketOrderWarning} `}
          <a href="https://www.orbs.com/dtwap-and-dlimit-faq/" target="_blank">{`${t.learnMore}`}</a>
        </>
      }
      variant="warning"
    />
  );
};

export const LimitPriceWarningContent = ({ className = "" }: { className?: string }) => {
  const { translations: t, twap } = useWidgetContext();
  const isMarketOrder = twap.values.isMarketOrder;
  const hide = useShouldWrapOrUnwrapOnly();

  if (isMarketOrder || hide) return null;

  return (
    <Message
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

export const LimitPriceWarning = () => {
  return <div id="twap-limit-price-message"></div>;
};

export const LimitPriceWarningPortal = () => {
  return (
    <Portal containerId="twap-limit-price-message">
      <LimitPriceWarningContent />
    </Portal>
  );
};

export const Separator = ({ className = "" }: { className?: string }) => {
  return <StyledSeparator className={`${className} twap-separator`} />;
};

const StyledSeparator = styled("div")({
  width: "100%",
  height: "1px",
});

export const Tooltip = (props: TooltipProps) => {
  const Tooltip = useWidgetContext().components.Tooltip;

  if (!Tooltip) {
    return <>{props.children}</>;
  }

  return <Tooltip tooltipText={props.tooltipText}>{props.children}</Tooltip>;
};
