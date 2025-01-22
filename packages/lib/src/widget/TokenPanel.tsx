import React, { createContext, ReactNode, useCallback, useContext, useState } from "react";
import { useTwapContext as useTwapContextUI } from "@orbs-network/twap-ui-sdk";
import { useAmountUi, useDstBalance, useFormatNumberV2, useSrcBalance } from "../hooks/hooks";
import { TokenLogo } from "../components/base";
import { usePanelContext } from "./context";
import { TokenPanelInput } from "../components";
import { useUsdAmount } from "../hooks";

const Context = createContext({} as { isSrcToken: boolean });

export const TokenPanel = ({ isSrcToken, children }: { isSrcToken: boolean; children: ReactNode }) => {
  return <Context.Provider value={{ isSrcToken }}>{children}</Context.Provider>;
};

const TokenInput = ({ placeholder = "", className = "" }: { placeholder?: string; className?: string }) => {
  const { isSrcToken } = useContext(Context);
  return <TokenPanelInput isSrc={isSrcToken} className={className} placeholder={placeholder} />;
};

const TokenPanelBalance = ({ decimalScale = 4 }: { decimalScale?: number }) => {
  const { isSrcToken } = useContext(Context);
  const {
    state: { srcToken, destToken },
  } = useTwapContextUI();
  const srcBalance = useAmountUi(srcToken?.decimals, useSrcBalance().data?.toString());
  const dstBalance = useAmountUi(destToken?.decimals, useDstBalance().data?.toString());
  const srcBalanceF = useFormatNumberV2({ value: isSrcToken ? srcBalance : dstBalance, decimalScale });

  return <>{srcBalanceF}</>;
};

const TokenPanelUsd = ({ decimalScale = 2 }: { decimalScale?: number }) => {
  const { isSrcToken } = useContext(Context);
  const { srcUsd, dstUsd } = useUsdAmount();

  const usd = useFormatNumberV2({ value: isSrcToken ? srcUsd : dstUsd, decimalScale });

  return <>{usd}</>;
};

const TokenSelect = ({ className = "", onClick }: { className?: string; onClick?: () => void }) => {
  const { isSrcToken } = useContext(Context);
  const {
    state: { srcToken, destToken },
  } = useTwapContextUI();

  const token = isSrcToken ? srcToken : destToken;

  return (
    <>
      <div className={className} onClick={onClick}>
        <p>{token?.symbol}</p>
        <TokenLogo logo={token?.logoUrl} />
      </div>
    </>
  );
};

TokenPanel.Balance = TokenPanelBalance;
TokenPanel.Usd = TokenPanelUsd;
TokenPanel.Select = TokenSelect;
TokenPanel.Input = TokenInput;
