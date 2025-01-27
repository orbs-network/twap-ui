import React, { createContext, FC, Fragment, ReactNode, useCallback, useContext, useState } from "react";
import { useTwapContext } from "@orbs-network/twap-ui-sdk";
import { useAmountUi, useDstBalance, useFormatNumberV2, useSrcBalance } from "../../hooks/hooks";
import { TokenLogo } from "../../components/base";
import { TokenPanelInput } from "../../components";
import { useOnSrcAmountPercent, useUsdAmount } from "../../hooks/lib";
import { useWidgetContext } from "../context";
import { StyledColumnFlex, StyledRowFlex, StyledText } from "../../styles";
import { styled } from "@mui/material";
import { Warnings } from "./Warnings";

const Context = createContext({} as { isSrcToken: boolean });

const useTokenPanel = (isSrcToken?: boolean) => {
  const srcBalance = useSrcBalance().data?.toString();
  const dstBalance = useDstBalance().data?.toString();
  const { onSrcTokenSelected, onDstTokenSelected } = useWidgetContext();
  const { srcUsd, dstUsd } = useUsdAmount();
  const {
    state: { srcToken, destToken, typedSrcAmount },
    derivedValues: { destTokenAmountUI },
  } = useTwapContext();

  const onTokenSelect = useCallback(
    (token: any) => {
      isSrcToken ? onSrcTokenSelected?.(token) : onDstTokenSelected?.(token);
    },
    [isSrcToken, onSrcTokenSelected, onDstTokenSelected],
  );

  return {
    balance: isSrcToken ? srcBalance : dstBalance,
    usd: isSrcToken ? srcUsd : dstUsd,
    token: isSrcToken ? srcToken : destToken,
    onTokenSelect,
    inputValue: isSrcToken ? typedSrcAmount : destTokenAmountUI,
  };
};

export const TokenPanel = ({ isSrcToken, children }: { isSrcToken: boolean; children: ReactNode }) => {
  return <Context.Provider value={{ isSrcToken }}>{children}</Context.Provider>;
};

const TokenInput = ({ placeholder = "", className = "" }: { placeholder?: string; className?: string }) => {
  const { isSrcToken } = useContext(Context);
  return <TokenPanelInput isSrc={isSrcToken} className={className} placeholder={placeholder} />;
};

const TokenPanelBalance = ({ decimalScale = 4, className = "" }: { decimalScale?: number; className?: string }) => {
  const { isSrcToken } = useContext(Context);
  const {
    state: { srcToken, destToken },
  } = useTwapContext();

  const srcBalance = useAmountUi(srcToken?.decimals, useSrcBalance().data?.toString());
  const dstBalance = useAmountUi(destToken?.decimals, useDstBalance().data?.toString());
  const srcBalanceF = useFormatNumberV2({ value: isSrcToken ? srcBalance : dstBalance, decimalScale });
  return <StyledText className={`twap-panel-balance ${className}`}>{srcBalanceF}</StyledText>;
};

const TokenPanelUsd = ({ decimalScale = 2, className = "" }: { decimalScale?: number; className?: string }) => {
  const { isSrcToken } = useContext(Context);
  const { srcUsd, dstUsd } = useUsdAmount();

  const usd = useFormatNumberV2({ value: isSrcToken ? srcUsd : dstUsd, decimalScale });

  return <StyledText className={`twap-panel-usd ${className}`}>${usd}</StyledText>;
};

const TokenSelect = ({ className = "", onClick }: { className?: string; onClick?: () => void }) => {
  const { isSrcToken } = useContext(Context);
  const {
    state: { srcToken, destToken },
  } = useTwapContext();
  const [isOpen, setIsOpen] = useState(false);

  const { components, onSrcTokenSelected, onDstTokenSelected } = useWidgetContext();

  const onClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const token = isSrcToken ? srcToken : destToken;

  const onSelect = useCallback(
    (token: any) => {
      isSrcToken ? onSrcTokenSelected?.(token) : onDstTokenSelected?.(token);
      onClose();
    },
    [isSrcToken, onSrcTokenSelected, onDstTokenSelected, onClose],
  );

  const _onClick = useCallback(() => {
    if (onClick) {
      onClick();
    } else {
      setIsOpen(true);
    }
  }, [onClick]);

  return (
    <>
      <components.TokensListModal onClose={onClose} isOpen={isOpen} isSrcToken={isSrcToken} onSelect={onSelect} />
      <StyledTokenSelect className={className} onClick={_onClick}>
        <TokenLogo logo={token?.logoUrl} />
        <StyledText>{token?.symbol}</StyledText>
      </StyledTokenSelect>
    </>
  );
};

const BalanceAmountSelect = ({ options = [0.25, 0.5, 0.75, 1] }: { options?: number[] }) => {
  const onClick = useOnSrcAmountPercent();
  const { isSrcToken } = useContext(Context);
  if (!isSrcToken) return null;

  return (
    <>
      {options.map((option) => {
        return (
          <button onClick={() => onClick(option)} key={option}>
            {option === 1 ? "100%" : `${option * 100}%`}
          </button>
        );
      })}
    </>
  );
};

const Main = ({ isSrcToken, className = "", Container }: { isSrcToken: boolean; className?: string; Container?: FC<{ children: ReactNode }> }) => {
  const content = (
    <StyledMain className={className}>
      <StyledMainTop>
        <TokenInput />
        <TokenSelect />
      </StyledMainTop>
      <StyledMainBottom>
        <TokenPanelUsd />
        <TokenPanelBalance />
      </StyledMainBottom>
    </StyledMain>
  );

  return (
    <TokenPanel isSrcToken={isSrcToken}>
      {Container ? <Container>{content}</Container> : content}
      <Warning />
    </TokenPanel>
  );
};

const Warning = () => {
  const { isSrcToken } = useContext(Context);
  if (!isSrcToken) return null;
  return (
    <Fragment>
      <Warnings.TradeSize />
      <Warnings.Balance />
    </Fragment>
  );
};

TokenPanel.Balance = TokenPanelBalance;
TokenPanel.Usd = TokenPanelUsd;
TokenPanel.Select = TokenSelect;
TokenPanel.Input = TokenInput;
TokenPanel.BalanceSelect = BalanceAmountSelect;
TokenPanel.Main = Main;
TokenPanel.Warning = Warning;
TokenPanel.useTokenPanel = useTokenPanel;

const StyledTokenSelect = styled("div")({
  display: "flex",
  gap: 10,
  cursor: "pointer",
  alignItems: "center",
  ".twap-token-logo": {
    width: 40,
    height: 40,
  },
  p: {
    fontSize: 16,
    fontWeight: 500,
  },
});

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
