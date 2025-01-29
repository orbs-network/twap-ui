import { styled } from "styled-components";
import { StyledColumnFlex, StyledRowFlex, StyledText } from "../styles";
import { Icon, Label, NumericInput, TokenDisplay } from "./base";
import { RiArrowUpDownLine } from "@react-icons/all-files/ri/RiArrowUpDownLine";
import React, { FC, ReactNode, useCallback, useState } from "react";
import { useWidgetContext } from "../context/context";

export const LimitPanel = ({ children, className = "", Container }: { className?: string; children: ReactNode; Container?: FC<{ children: ReactNode }> }) => {
  const {
    twap: {
      values: { isMarketOrder },
    },
  } = useWidgetContext();

  if (isMarketOrder) return null;

  const content = <StyledContainer className={className}>{children}</StyledContainer>;

  if (Container) {
    return <Container>{content}</Container>;
  }

  return content;
};

function Main({ className = "" }: { className?: string }) {
  return (
    <Container className={`twap-limit-panel ${className}`}>
      <StyledRowFlex style={{ justifyContent: "space-between" }}>
        <Title />
        <InvertPrice />
      </StyledRowFlex>
      <StyledRowFlex style={{ justifyContent: "space-between" }}>
        <Input />
        <TokenSelect />
      </StyledRowFlex>
      <PercentSelector />
    </Container>
  );
}

const Input = () => {
  const { twap } = useWidgetContext();
  const { limitPrice, setLimitPrice, isLoading } = twap.limitPricePanel;

  return (
    <StyledInputContainer>
      <NumericInput disabled={isLoading} onChange={setLimitPrice} value={limitPrice} />
    </StyledInputContainer>
  );
};

const PercentSelector = () => {
  const percentButtons = useWidgetContext().twap.limitPricePanel.percentButtons;

  return (
    <StyledPercentContainer className="twap-limit-panel-percent-select" style={{ gap: 5 }}>
      {percentButtons.map((it) => {
        return (
          <button key={it.text} className={`twap-limit-panel-percent-button  ${it.selected ? "twap-limit-panel-percent-button-selected" : ""}`} onClick={it.onClick}>
            {it.text}
          </button>
        );
      })}
    </StyledPercentContainer>
  );
};

const TokenSelect = () => {
  const { components, onSrcTokenSelected, onDstTokenSelected, srcToken, dstToken, twap } = useWidgetContext();

  const [isOpen, setIsOpen] = useState(false);
  const inverted = twap.limitPricePanel.isInvertedLimitPrice;
  const token = inverted ? srcToken : dstToken;
  const isSrcToken = inverted ? true : false;

  const onOpen = useCallback(() => setIsOpen(true), []);
  const onClose = useCallback(() => setIsOpen(false), []);

  const onSelect = useCallback(
    (token?: any) => {
      isSrcToken ? onSrcTokenSelected?.(token) : onDstTokenSelected?.(token);
      onClose();
    },
    [isSrcToken, onDstTokenSelected, onSrcTokenSelected],
  );

  return (
    <>
      <components.TokensListModal onSelect={onSelect} onClose={onClose} isSrcToken={isSrcToken} isOpen={isOpen} />
      <StyledTokenSelect className="twap-limit-panel-token-select" logo={token?.logoUrl} symbol={token?.symbol} onClick={onOpen} />
    </>
  );
};

const InvertPrice = () => {
  const onInvert = useWidgetContext().twap.limitPricePanel.onInvertLimitPrice;

  return (
    <StyledInvertprice onClick={onInvert} className="twap-limit-panel-invert-button">
      <Icon icon={<RiArrowUpDownLine size="16px" />} />
    </StyledInvertprice>
  );
};

const Title = () => {
  const { translations: t, components, onSrcTokenSelected, onDstTokenSelected, srcToken, dstToken, twap } = useWidgetContext();
  const [isOpen, setIsOpen] = useState(false);

  const inverted = twap.limitPricePanel.isInvertedLimitPrice;
  const token = inverted ? dstToken : srcToken;
  const isSrcToken = inverted ? false : true;

  const onOpen = useCallback(() => setIsOpen(true), []);
  const onClose = useCallback(() => setIsOpen(false), []);

  const onSelect = useCallback(
    (token?: any) => {
      isSrcToken ? onSrcTokenSelected?.(token) : onDstTokenSelected?.(token);
      onClose();
    },
    [isSrcToken, onDstTokenSelected, onSrcTokenSelected],
  );

  return (
    <>
      <components.TokensListModal onSelect={onSelect} onClose={onClose} isSrcToken={isSrcToken} isOpen={isOpen} />
      <StyledDefaultTitle className="twap-limit-panel-title">
        <StyledText>{t.swapOne}</StyledText>
        <TokenDisplay symbol={token?.symbol} logo={token?.logoUrl} onClick={onOpen} />
        <StyledText>{t.isWorth}</StyledText>
      </StyledDefaultTitle>
    </>
  );
};

const LimitPriceLabel = () => {
  const { translations: t, isLimitPanel, twap } = useWidgetContext();
  const isMarketOrder = twap.values.isMarketOrder;

  return (
    <Label>
      <Label.Text text={!isLimitPanel ? t.price : t.limitPrice} />
      <Label.Info text={isMarketOrder ? t.marketPriceTooltip : isLimitPanel ? t.limitPriceTooltipLimitPanel : t.limitPriceTooltip} />
    </Label>
  );
};

const usePanel = () => {
  return useWidgetContext().twap.limitPricePanel;
};

LimitPanel.usePanel = usePanel;
LimitPanel.Input = Input;
LimitPanel.TokenSelect = TokenSelect;
LimitPanel.PercentSelector = PercentSelector;
LimitPanel.Title = Title;
LimitPanel.InvertPrice = InvertPrice;
LimitPanel.Label = LimitPriceLabel;
LimitPanel.Main = Main;

/// --- styles --- /////

const StyledInvertprice = styled("div")({
  cursor: "pointer",
  "&:hover": {
    opacity: 0.8,
  },
});

const StyledPercentContainer = styled(StyledRowFlex)({
  justifyContent: "flex-end",
  alignItems: "center",
  flexWrap: "wrap",
});

const Container = styled(StyledColumnFlex)({
  ".MuiSkeleton-root": {
    left: 0,
    right: "unset",
  },
});

const StyledTokenSelect = styled(TokenDisplay)({
  fontSize: 14,
  cursor: "pointer",
  ".twap-token-logo": {
    width: "20px",
    height: "20px",
  },
});

const StyledDefaultTitle = styled(StyledRowFlex)({
  width: "auto",
  flex: 1,
  gap: 5,
  justifyContent: "flex-start",
  fontSize: 14,
  ".twap-token-display": {
    cursor: "pointer",
  },
  ".twap-token-logo": {
    width: "20px",
    height: "20px",
  },
});

const StyledContainer = styled("div")({
  width: "100%",
});

const StyledInputContainer = styled("div")({
  position: "relative",
  flex: 1,
});
