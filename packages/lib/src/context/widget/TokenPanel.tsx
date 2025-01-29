import React, { createContext, FC, Fragment, ReactElement, ReactNode, useCallback, useContext, useState } from "react";
import { useAmountUi, useDstBalance, useFormatNumber, useSrcBalance } from "../../hooks/hooks";
import { TokenLogo } from "../../components/base";
import { TokenPanelInput } from "../../components";
import { useBalanceWaning, useOnSrcAmountPercent, useUsdAmount } from "../../hooks/lib";
import { useWidgetContext } from "../context";
import { StyledColumnFlex, StyledRowFlex, StyledText } from "../../styles";
import { styled } from "@mui/material";
import { Warnings } from "./Errors";

const Context = createContext({} as { isSrcToken: boolean; onFocus: () => void; onBlur: () => void });

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
    [isSrcToken, onSrcTokenSelected, onDstTokenSelected]
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
  const [isFocus, setIsHover] = useState(false);

  const onFocus = useCallback(() => setIsHover(true), []);
  const onBlur = useCallback(() => setIsHover(false), []);

  return (
    <Context.Provider value={{ isSrcToken, onFocus, onBlur }}>
      <div className={`twap-token-panel ${isSrcToken && balanceError ? "twap-token-panel-error" : ""} ${isFocus ? "twap-token-panel-focus" : ""}  ${className}`}>{children}</div>
    </Context.Provider>
  );
};

const TokenInput = ({ placeholder = "", className = "" }: { placeholder?: string; className?: string }) => {
  const { isSrcToken, onFocus, onBlur } = useContext(Context);
  return <TokenPanelInput onFocus={onFocus} onBlur={onBlur} isSrc={isSrcToken} className={className} placeholder={placeholder} />;
};

const TokenPanelBalance = ({ decimalScale = 4, className = "" }: { decimalScale?: number; className?: string }) => {
  const { isSrcToken } = useContext(Context);
  const { srcToken, dstToken } = useWidgetContext();

  const srcBalance = useAmountUi(srcToken?.decimals, useSrcBalance().data?.toString());
  const dstBalance = useAmountUi(dstToken?.decimals, useDstBalance().data?.toString());
  const srcBalanceF = useFormatNumber({ value: isSrcToken ? srcBalance : dstBalance, decimalScale });
  return <>{srcBalanceF}</>;
};

const TokenPanelUsd = ({ decimalScale = 2, className = "" }: { decimalScale?: number; className?: string }) => {
  const { isSrcToken } = useContext(Context);
  const { srcUsd, dstUsd } = useUsdAmount();

  const usd = useFormatNumber({ value: isSrcToken ? srcUsd : dstUsd, decimalScale });

  return <>{usd}</>;
};

const TokenSelect = ({ className = "", onClick, endIcon }: { className?: string; onClick?: () => void; endIcon?: ReactElement }) => {
  const { isSrcToken } = useContext(Context);
  const { srcToken, dstToken } = useWidgetContext();
  const [isOpen, setIsOpen] = useState(false);

  const { components, onSrcTokenSelected, onDstTokenSelected } = useWidgetContext();

  const onClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const token = isSrcToken ? srcToken : dstToken;

  const onSelect = useCallback(
    (token: any) => {
      isSrcToken ? onSrcTokenSelected?.(token) : onDstTokenSelected?.(token);
      onClose();
    },
    [isSrcToken, onSrcTokenSelected, onDstTokenSelected, onClose]
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
      <StyledTokenSelect className={`twap-panel-token-select ${className}`} onClick={_onClick}>
        <TokenLogo logo={token?.logoUrl} />
        <StyledText>{token?.symbol}</StyledText>
        {endIcon}
      </StyledTokenSelect>
    </>
  );
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
  const onClick = useOnSrcAmountPercent();
  const { isSrcToken } = useContext(Context);
  if (!isSrcToken) return null;

  return (
    <div className={`twap-panel-balance-buttons ${className}`}>
      {options.map((option) => {
        return (
          <button className="twap-panel-balance-buttons-btn" onClick={() => onClick(option.value)} key={option.value}>
            {option.text}
          </button>
        );
      })}
    </div>
  );
};

const Main = ({ isSrcToken, className = "", Container }: { isSrcToken: boolean; className?: string; Container?: FC<{ children: ReactNode }> }) => {
  const onSrcAmountPercent = useOnSrcAmountPercent();

  const onBalance = useCallback(() => {
    if (!isSrcToken) return;
    onSrcAmountPercent(1);
  }, [isSrcToken, onSrcAmountPercent]);

  const content = (
    <StyledMain className={className}>
      <StyledMainTop>
        <TokenInput />
        <TokenSelect />
      </StyledMainTop>
      <StyledMainBottom>
        <TokenPanelUsd />
        <div onClick={onBalance}>
          <TokenPanelBalance />
        </div>
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
