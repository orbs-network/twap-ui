import React, { createContext, ReactNode, useCallback, useContext } from "react";
import { Label, NumericInput } from "../../components/base";
import { StyledColumnFlex, StyledRowFlex, StyledText } from "../../styles";
import { Panel } from "../../components/Panel";
import { useWidgetContext } from "../widget-context";
import { TokenSelect } from "./token-select";
import { useFormatDecimals, useFormatNumber } from "../../hooks/useFormatNumber";
import { useOnSrcInputPercentClick } from "../../hooks/useOnSrcInputPercentClick";
import styled from "styled-components";
import { useTokenPanel } from "../hooks";
import { useShouldWrapOrUnwrapOnly } from "../../hooks/useShouldWrapOrUnwrap";

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

const TokenPanelInput = ({
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

  const setSrcAmount = useCallback((srcAmount: string) => updateState({ srcAmount }), [updateState]);

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

const Context = createContext({} as { isSrcToken: boolean });
const useTokenPanelContext = () => useContext(Context);

export const TokenPanel = ({ isSrcToken, children, className = "" }: { isSrcToken: boolean; children: ReactNode; className?: string }) => {
  const error = useTokenPanel(isSrcToken).error;

  return (
    <Panel className={`${className} twap-token-panel`} error={!!error}>
      <Context.Provider value={{ isSrcToken }}>{children}</Context.Provider>
    </Panel>
  );
};

const TokenInput = ({ placeholder = "", className = "" }: { placeholder?: string; className?: string }) => {
  const { isSrcToken } = useTokenPanelContext();
  const { onFocus, onBlur } = Panel.usePanelContext();
  return <TokenPanelInput onFocus={onFocus} onBlur={onBlur} isSrc={isSrcToken} className={className} placeholder={placeholder} />;
};

const TokenPanelBalance = ({
  decimalScale = 4,
  className = "",
  prefix = "",
  suffix = "",
}: {
  decimalScale?: number;
  className?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
}) => {
  const { isSrcToken } = useTokenPanelContext();
  const { balance } = useTokenPanel(isSrcToken);
  const srcBalanceF = useFormatNumber({ value: balance, decimalScale });
  const onSrcAmountPercent = useOnSrcInputPercentClick();
  const { translations: t } = useWidgetContext();

  const onBalance = useCallback(() => {
    if (!isSrcToken) return;
    onSrcAmountPercent(1);
  }, [isSrcToken, onSrcAmountPercent]);

  return (
    <StyledText onClick={onBalance} className={`${className} twap-token-panel-balance`}>
      <span className="twap-token-panel-balance-prefix">{prefix || `${t.balance}: `}</span>
      <span className="twap-token-panel-balance-value">{srcBalanceF || "0"}</span>
      <span className="twap-token-panel-balance-prefix-suffix">{suffix}</span>
    </StyledText>
  );
};

const TokenPanelUsd = ({ decimalScale = 2, className = "" }: { decimalScale?: number; className?: string }) => {
  const { isSrcToken } = useTokenPanelContext();
  const { usd } = useTokenPanel(isSrcToken);
  const { uiPreferences, marketPriceLoading } = useWidgetContext();

  const usdF = useFormatNumber({ value: marketPriceLoading ? "0" : usd, decimalScale });

  return (
    <StyledText className={`${className} twap-token-panel-usd`}>
      <span className="twap-token-panel-usd-prefix">{uiPreferences.usd?.prefix}</span>
      <span className="twap-token-panel-usd-value"> {usdF}</span>
      <span className="twap-token-panel-usd-suffix"> {uiPreferences.usd?.suffix}</span>
    </StyledText>
  );
};

const PanelTokenSelect = ({ className = "" }: { className?: string }) => {
  const { isSrcToken } = useTokenPanelContext();

  return <TokenSelect isSrcToken={isSrcToken} className={`twap-token-panel-token-select ${className}`} />;
};

const BalanceAmountSelect = ({
  options = [
    { value: 0.25, text: "25%" },
    { value: 0.5, text: "50%" },
    { value: 0.75, text: "75%" },
    { value: 1, text: "100%" },
  ],
  className = "",
}: {
  options?: { value: number; text: string }[];
  className?: string;
}) => {
  const onClick = useOnSrcInputPercentClick();
  const { isSrcToken } = useTokenPanelContext();
  if (!isSrcToken) return null;

  return (
    <div className={`twap-token-panel-balance-buttons ${className}`}>
      {options.map((option) => {
        return (
          <button className="twap-token-panel-balance-buttons-btn twap-select-button" onClick={() => onClick(option.value)} key={option.value}>
            {option.text}
          </button>
        );
      })}
    </div>
  );
};

const Main = ({ className = "" }: { className?: string }) => {
  return (
    <StyledMain className={className}>
      <BalanceAmountSelect />
      <StyledMainTop>
        <TokenInput />
        <PanelTokenSelect />
      </StyledMainTop>
      <StyledMainBottom>
        <TokenPanelUsd />
        <TokenPanelBalance />
      </StyledMainBottom>
    </StyledMain>
  );
};

const TokenPanelLabel = () => {
  const { translations } = useWidgetContext();
  const { isSrcToken } = useTokenPanelContext();

  return (
    <Label className="twap-token-panel-label">
      <StyledText>{isSrcToken ? translations.from : translations.to}</StyledText>
    </Label>
  );
};

TokenPanel.Balance = TokenPanelBalance;
TokenPanel.Usd = TokenPanelUsd;
TokenPanel.Select = PanelTokenSelect;
TokenPanel.Input = TokenInput;
TokenPanel.BalanceSelect = BalanceAmountSelect;
TokenPanel.Main = Main;
TokenPanel.Label = TokenPanelLabel;

const StyledMainTop = styled(StyledRowFlex)({
  gap: 10,
});
const StyledMainBottom = styled(StyledRowFlex)({
  justifyContent: "space-between",
});

const StyledMain = styled(StyledColumnFlex)({});
