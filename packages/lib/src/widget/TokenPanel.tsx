import { createContext, ReactNode, useCallback, useContext, useState } from "react";
import { useTwapContext as useTwapContextUI } from "@orbs-network/twap-ui-sdk";
import { useAmountUi, useDstBalance, useFormatNumberV2, useSrcBalance, useUsdAmount } from "../hooks";
import { TokenLogo } from "../components/base";
import { usePanelContext } from "./context";
import { TokenPanelInput } from "../components";

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
  const { parsedSrcToken, parsedDstToken } = useTwapContextUI();
  const srcBalance = useAmountUi(parsedSrcToken?.decimals, useSrcBalance().data?.toString());
  const dstBalance = useAmountUi(parsedDstToken?.decimals, useDstBalance().data?.toString());
  const srcBalanceF = useFormatNumberV2({ value: isSrcToken ? srcBalance : dstBalance, decimalScale });

  return <>{srcBalanceF}</>;
};

const TokenPanelUsd = ({ decimalScale = 2 }: { decimalScale?: number }) => {
  const { isSrcToken } = useContext(Context);
  const { srcUsd, dstUsd } = useUsdAmount();

  const usd = useFormatNumberV2({ value: isSrcToken ? srcUsd : dstUsd, decimalScale });

  return <>{usd}</>;
};

const TokenSelect = ({ className = "" }: { className?: string }) => {
  const { isSrcToken } = useContext(Context);
  const [isOpen, setIsOpen] = useState(false);
  const TokensListModal = usePanelContext().components.TokensListModal;
  const { parsedSrcToken, parsedDstToken } = useTwapContextUI();
  console.log({parsedSrcToken});
  
  const onClose = useCallback(() => setIsOpen(false), []);
  const onOpen = useCallback(() => setIsOpen(true), []);

  const token = isSrcToken ? parsedSrcToken : parsedDstToken;

  return (
    <>
      <TokensListModal onClose={onClose} isSrcToken={isSrcToken} isOpen={isOpen} />
      <div className={className} onClick={onOpen}>
        <p>{token?.symbol}</p>
        <TokenLogo logo={parsedSrcToken?.logoUrl} />
      </div>
    </>
  );
};

TokenPanel.Balance = TokenPanelBalance;
TokenPanel.Usd = TokenPanelUsd;
TokenPanel.Select = TokenSelect;
TokenPanel.Input = TokenInput;
