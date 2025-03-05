import React, { createContext, ReactNode, useCallback, useContext } from "react";
import { Label, NumericInput } from "../../components/base";
import { StyledColumnFlex, StyledRowFlex, StyledText } from "../../styles";
import { Panel } from "../../components/Panel";
import { TokenSelect } from "./token-select";
import { useFormatNumber } from "../../hooks/useFormatNumber";
import styled from "styled-components";
import { useTwapContext } from "../../context";
import { useBalanceError, useOnSrcInputPercentClick } from "../../hooks/logic-hooks";
import { useToken, useTokenBalance, useTokenInput, useTokenUSD } from "../../hooks/ui-hooks";

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
  const { onFocus, onBlur } = Panel.usePanelContext();

  return (
    <NumericInput
      onBlur={onBlur}
      onFocus={onFocus}
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

const TokenInput = ({ prefix = "", className = "", placeholder = "" }: { prefix?: string; className?: string; placeholder?: string }) => {
  const { isSrcToken } = useTokenPanelContext();
  const { value, onChange } = useTokenInput({ isSrcToken });
  const token = useToken({ isSrcToken });

  return <Input prefix={prefix} onChange={onChange} value={value} decimalScale={token?.decimals} className={className} placeholder={placeholder} />;
};

const Context = createContext({} as { isSrcToken: boolean });
const useTokenPanelContext = () => useContext(Context);

export const TokenPanel = ({ isSrcToken, children, className = "" }: { isSrcToken: boolean; children: ReactNode; className?: string }) => {
  const balanceError = useBalanceError();
  const error = isSrcToken ? Boolean(balanceError) : false;
  return (
    <Panel className={`${className} twap-token-panel`} error={error}>
      <Context.Provider value={{ isSrcToken }}>{children}</Context.Provider>
    </Panel>
  );
};

const TokenPanelBalance = ({ className = "" }: { className?: string }) => {
  const { isSrcToken } = useTokenPanelContext();
  const balance = useTokenBalance({ isSrcToken });
  const srcBalanceF = useFormatNumber({ value: balance, decimalScale: 3 });
  const onSrcAmountPercent = useOnSrcInputPercentClick();
  const { translations: t, components, srcBalance, dstBalance } = useTwapContext();
  const balanceWei = isSrcToken ? srcBalance : dstBalance;
  const _className = `${className} twap-token-panel-balance`;

  const onMax = useCallback(() => {
    if (!isSrcToken) return;
    onSrcAmountPercent(1);
  }, [isSrcToken, onSrcAmountPercent]);

  if (components.Balance) {
    return <components.Balance isLoading={!balanceWei} balanceWei={balanceWei || ""} balance={balance || ""} onMax={onMax} />;
  }

  return (
    <StyledText onClick={onMax} className={_className}>
      <span className="twap-token-panel-balance-prefix">{t.balance}:</span>
      <span className="twap-token-panel-balance-value">{srcBalanceF || "0"}</span>
    </StyledText>
  );
};

const TokenPanelUsd = ({ className = "" }: { className?: string }) => {
  const { isSrcToken } = useTokenPanelContext();
  const { data, isLoading } = useTokenUSD({ isSrcToken });
  const components = useTwapContext().components;
  const usdF = useFormatNumber({ value: isLoading ? "0" : data, decimalScale: 2 });

  const _className = `${className} twap-token-panel-usd`;

  if (components.USD) {
    return <components.USD isLoading={Boolean(isLoading)} value={data} />;
  }

  return (
    <StyledText className={_className}>
      <span className="twap-token-panel-usd-value"> ${usdF}</span>
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
  const onSelect = useOnSrcInputPercentClick();
  const { isSrcToken } = useTokenPanelContext();
  const { components } = useTwapContext();
  if (!isSrcToken) return null;

  if (components.TokenAmountPercentSelect) {
    return <components.TokenAmountPercentSelect onSelect={onSelect} />;
  }

  return (
    <div className={`twap-token-panel-balance-buttons ${className}`}>
      {options.map((option) => {
        return (
          <button className="twap-token-panel-balance-buttons-btn twap-select-button" onClick={() => onSelect(option.value)} key={option.value}>
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
  const { translations } = useTwapContext();
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
