import { FC, ReactNode, useCallback } from "react";
import { Balance, Icon, NumericInput, TimeSelector, TokenName, USD, TokenLogo as Logo, Button, Portal } from "./base";
import { Message } from "./base/Message";
import { useTwapContext } from "../context/context";
import { RiArrowUpDownLine } from "@react-icons/all-files/ri/RiArrowUpDownLine";
import styled from "styled-components";
import { useFormatNumber, useSrcBalance, useDstBalance, useFormatDecimals } from "../hooks/hooks";
import { useConfirmationButton } from "../hooks/useConfirmationButton";
import { StyledText, StyledRowFlex, StyledColumnFlex, textOverflow } from "../styles";
import TokenDisplay from "./base/TokenDisplay";
import { ChunksAmountLabel } from "./Labels";
import { LimitSwitchArgs, TooltipProps, TWAPTokenSelectProps } from "../types";
import Copy from "./base/Copy";
import { SQUIGLE } from "../config";
import { Styles } from "..";
import { IoIosArrowDown } from "@react-icons/all-files/io/IoIosArrowDown";
import { stateActions } from "../context/actions";
import {
  useFeeOnTransferWarning,
  useFillDelay,
  useLowPriceWarning,
  useOutAmount,
  useShouldWrapOrUnwrapOnly,
  useSrcAmount,
  useSrcChunkAmount,
  useSrcChunkAmountUsd,
  useSwitchTokens,
  useToken,
  useTokenSelect,
  useUsdAmount,
} from "../hooks/lib";
import { useAmountUi, useIsMarketOrder, useMainStore, useOnFillDelay } from "@orbs-network/twap-ui-sdk";

export const ChangeTokensOrder = ({ children, className = "", icon = <RiArrowUpDownLine /> }: { children?: ReactNode; className?: string; icon?: any }) => {
  const switchTokens = useSwitchTokens();
  return (
    <StyledChangeTokens className={`${className} twap-change-tokens-order`}>
      <button onClick={switchTokens}>{children || <Icon icon={icon} />}</button>
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
  const { srcToken } = useTwapContext();
  const srcAmountUi = useSrcAmount().amountUi;

  const onChange = stateActions.useSetSrcAmount();
  return <Input prefix="" onChange={onChange} value={srcAmountUi || ""} decimalScale={srcToken?.decimals} className={props.className} placeholder={props.placeholder} />;
};

const DstTokenInput = (props: { className?: string; placeholder?: string; decimalScale?: number }) => {
  const { dstToken: token } = useTwapContext();
  const { amountUi, isLoading } = useOutAmount();
  const isMarketOrder = useIsMarketOrder();
  return (
    <Input
      disabled={true}
      loading={isLoading}
      prefix={isMarketOrder ? SQUIGLE : ""}
      value={useFormatDecimals(amountUi)}
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
  const setFillDelay = useOnFillDelay();
  const fillDelay = useMainStore((state) => state.customFillDelay);

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
    [onTokenSelectedCallback, isSrc],
  );

  if (!Component) return null;
  return <Component isSrc={isSrc} isOpen={isOpen} onClose={onClose} onSelect={onSelect} srcTokenSelected={undefined} dstTokenSelected={undefined} />;
};

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
  const { srcToken, dstToken } = useTwapContext();
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
  const value = useSrcChunkAmount().amountUi;
  const formattedValue = useFormatNumber({ value });
  const { srcToken, Components } = useTwapContext();

  const formattedValueTooltip = useFormatNumber({ value, decimalScale: 18 });

  if (!formattedValue || formattedValue === "0") {
    return <p className="twap-trade-size-value">-</p>;
  }

  const content = <p className="twap-trade-size-value">{`${symbol ? `${formattedValue} ${srcToken?.symbol}` : formattedValue}`}</p>;

  if (!Components?.Tooltip) return content;

  return <Components.Tooltip tooltipText={`${symbol ? `${formattedValueTooltip} ${srcToken?.symbol}` : formattedValueTooltip}`}>{content}</Components.Tooltip>;
};

export const TradeSize = ({ hideLabel, hideSymbol, hideLogo }: { hideLabel?: boolean; hideSymbol?: boolean; hideLogo?: boolean }) => {
  const { srcToken, dstToken } = useTwapContext();

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
  const { srcToken, dstToken } = useTwapContext();

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
  const isMarketOrder = useIsMarketOrder();
  const { translations: t } = useTwapContext();
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

export const PanelWarning = ({ className = "" }: { className?: string }) => {
  const feeOnTranferWarning = useFeeOnTransferWarning();
  const lowPriceWarning = useLowPriceWarning();
  const isWrapOrUnwrapOnly = useShouldWrapOrUnwrapOnly();
  const isWrongChain = useTwapContext().isWrongChain;

  const show = feeOnTranferWarning || lowPriceWarning;
  const title = feeOnTranferWarning || lowPriceWarning?.title;
  const text = lowPriceWarning?.subTitle;

  if (!show || isWrapOrUnwrapOnly || isWrongChain) return null;

  return <Message className={className} title={title} text={text} variant="error" />;
};

export const ShowConfirmation = ({ className = "", connect }: { className?: string; connect?: () => void }) => {
  const { onClick, text, disabled, loading } = useConfirmationButton(connect);

  return (
    <>
      <StyledShowConfirmation className={className}>
        <PanelWarning />
        <Button className="twap-submit-button" allowClickWhileLoading={true} onClick={onClick ? onClick : () => {}} loading={loading} disabled={disabled}>
          {text}
        </Button>
      </StyledShowConfirmation>
    </>
  );
};

const StyledShowConfirmation = styled(StyledColumnFlex)({
  gap: 20,
});

export const LimitPriceMessageContent = ({ className }: { className?: string }) => {
  return (
    <Portal containerId="twap-limit-price-message-container">
      <LimitPriceMessage className={className} />
    </Portal>
  );
};

export const LimitPriceMessage = ({ className }: { className?: string }) => {
  const { translations: t } = useTwapContext();
  const isMarketOrder = useIsMarketOrder();
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
  const Components = useTwapContext().Components;

  if (!Components?.Tooltip) {
    return <>{props.children}</>;
  }

  return <Components.Tooltip {...props} />;
};
