import React, { createContext, FC, Fragment, ReactElement, ReactNode, useCallback, useContext, useState } from "react";
import { Label, TokenLogo } from "../../components/base";
import { TokenPanelInput } from "../../components";
import { StyledColumnFlex, StyledRowFlex, StyledText } from "../../styles";
import { Panel } from "../../components/Panel";
import { useWidgetContext } from "../widget-context";
import { TokenSelect } from "./token-select";
import { useDstBalance, useSrcBalance } from "../../hooks/useBalances";
import { useUsdAmount } from "../../hooks/useUsdAmounts";
import { useBalanceWaning } from "../../hooks/useWarnings";
import { useAmountUi } from "../../hooks/useParseAmounts";
import { useFormatNumber } from "../../hooks/useFormatNumber";
import { useOnSrcInputPercentClick } from "../../hooks/useOnSrcInputPercentClick";
import styled from "styled-components";

const Context = createContext({} as { isSrcToken: boolean });
const useTokenPanelContext = () => useContext(Context);

const useTokenPanel = (isSrcToken?: boolean) => {
  const srcBalance = useSrcBalance().data?.toString();
  const dstBalance = useDstBalance().data?.toString();
  const { onSrcTokenSelected, onDstTokenSelected, twap, srcToken, dstToken } = useWidgetContext();
  const { srcUsd, dstUsd } = useUsdAmount();
  const {
    values: { srcAmountUI, destTokenAmountUI },
  } = twap;
  const onTokenSelect = useCallback(
    (token: any) => {
      isSrcToken ? onSrcTokenSelected?.(token) : onDstTokenSelected?.(token);
    },
    [isSrcToken, onSrcTokenSelected, onDstTokenSelected],
  );

  return {
    balance: isSrcToken ? srcBalance : dstBalance,
    usd: isSrcToken ? srcUsd : dstUsd,
    token: isSrcToken ? srcToken : dstToken,
    onTokenSelect,
    inputValue: isSrcToken ? srcAmountUI : destTokenAmountUI,
  };
};

export const TokenPanel = ({ isSrcToken, children, className = "" }: { isSrcToken: boolean; children: ReactNode; className?: string }) => {
  const balanceError = useBalanceWaning();
  const {
    twap: { errors },
  } = useWidgetContext();

  const error = (!errors.chunks && errors.tradeSize?.text) || balanceError;

  return (
    <Panel className={`${className} twap-token-panel`} error={Boolean(error && isSrcToken)}>
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
  const { srcToken, dstToken } = useWidgetContext();

  const srcBalance = useAmountUi(srcToken?.decimals, useSrcBalance().data?.toString());
  const dstBalance = useAmountUi(dstToken?.decimals, useDstBalance().data?.toString());
  const srcBalanceF = useFormatNumber({ value: isSrcToken ? srcBalance : dstBalance, decimalScale });
  return (
    <StyledText className={`${className} twap-token-panel-balance`}>
      {prefix}
      {srcBalanceF}
      {suffix}
    </StyledText>
  );
};

const TokenPanelUsd = ({ decimalScale = 2, className = "" }: { decimalScale?: number; className?: string }) => {
  const { isSrcToken } = useTokenPanelContext();
  const { srcUsd, dstUsd } = useUsdAmount();
  const { uiPreferences } = useWidgetContext();

  const usd = useFormatNumber({ value: isSrcToken ? srcUsd : dstUsd, decimalScale });

  return (
    <StyledText className={`${className} twap-token-panel-usd`}>
      {uiPreferences.usd?.prefix}
      {usd}
      {uiPreferences.usd?.suffix}
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
          <button className="twap-token-panel-balance-buttons-btn" onClick={() => onClick(option.value)} key={option.value}>
            {option.text}
          </button>
        );
      })}
    </div>
  );
};

const Main = ({ className = "" }: { className?: string }) => {
  const onSrcAmountPercent = useOnSrcInputPercentClick();
  const { isSrcToken } = useTokenPanelContext();

  const onBalance = useCallback(() => {
    if (!isSrcToken) return;
    onSrcAmountPercent(1);
  }, [isSrcToken, onSrcAmountPercent]);

  return (
    <TokenPanel isSrcToken={isSrcToken}>
      <StyledMain className={className}>
        <StyledMainTop>
          <TokenInput />
          <PanelTokenSelect />
        </StyledMainTop>
        <StyledMainBottom>
          <TokenPanelUsd />
          <div onClick={onBalance}>
            <TokenPanelBalance />
          </div>
        </StyledMainBottom>
      </StyledMain>
    </TokenPanel>
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
TokenPanel.useTokenPanel = useTokenPanel;
TokenPanel.ClassName = "twap-token-panel";
TokenPanel.Label = TokenPanelLabel;

const StyledMainTop = styled(StyledRowFlex)({
  gap: 10,
  ".twap-token-input": {
    flex: 1,
    input: {
      fontSize: 20,
    },
  },
});
const StyledMainBottom = styled(StyledRowFlex)({
  justifyContent: "space-between",
});

const StyledMain = styled(StyledColumnFlex)({});
