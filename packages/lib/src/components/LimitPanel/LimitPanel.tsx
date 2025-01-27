import { styled } from "styled-components";
import { StyledColumnFlex, StyledRowFlex, StyledText } from "../../styles";
import { Icon, Label, NumericInput, TokenDisplay } from "../base";
import { RiArrowUpDownLine } from "@react-icons/all-files/ri/RiArrowUpDownLine";
import React, { ReactNode, useCallback, useMemo, useState } from "react";
import { useTwapContext, useLimitPricePanel } from "@orbs-network/twap-ui-sdk";
import { useWidgetContext } from "../../context/context";
import { LimitSwitch } from "./LimitSwitch";
const defaultPercent = [1, 5, 10];

const useIsMarketOrder = () => {
  return useTwapContext().derivedValues.isMarketOrder;
};
export const LimitPanel = ({ children, className = "" }: { className?: string; children: ReactNode }) => {
  return <StyledContainer className={className}>{children}</StyledContainer>;
};

const StyledContainer = styled("div")({
  width: "100%",
});

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
  const { inputValue, onInputChange, isLoading } = useLimitPricePanel();

  return (
    <StyledInputContainer>
      <NumericInput disabled={isLoading} onChange={onInputChange} value={inputValue} />
    </StyledInputContainer>
  );
};

const StyledInputContainer = styled("div")({
  position: "relative",
  flex: 1,
});

const usePercent = () => {
  const inverted = useTwapContext().state.isInvertedLimitPrice;
  return useMemo(() => {
    if (inverted) {
      return defaultPercent.map((it) => -it).map((it) => it.toString());
    }
    return defaultPercent.map((it) => it.toString());
  }, [inverted]);
};

const PercentSelector = () => {
  const percent = usePercent();

  return (
    <StyledPercentContainer className="twap-limit-panel-percent-select" style={{ gap: 5 }}>
      <ResetButton />
      {percent.map((it) => {
        return <PercentButton percent={it} key={it} />;
      })}
    </StyledPercentContainer>
  );
};

const PercentButton = ({ percent }: { percent: string }) => {
  const { state, actionHandlers } = useTwapContext();
  const { isInvertedLimitPrice: inverted } = state;
  const { selectedPercent } = useLimitPricePanel();

  const selected = selectedPercent === percent;

  const prefix = percent === "0" ? "" : inverted ? "-" : !inverted && "+";

  return (
    <button
      className={`twap-limit-panel-percent-button  ${selected ? "twap-limit-panel-percent-button-selected" : ""}`}
      onClick={() => actionHandlers.onPricePercentClick(percent)}
    >
      {`${prefix}${Math.abs(Number(percent))}%`}
    </button>
  );
};

const ResetButton = () => {
  const {
    derivedValues: { priceDiffFromMarket },
  } = useTwapContext();

  const { showReset, onReset } = useLimitPricePanel();

  if (showReset) {
    return (
      <StyledDefaultZeroButton className="twap-limit-panel-zero-btn">
        <button onClick={onReset} className="twap-limit-panel-percent-button twap-limit-panel-zero-btn-left">
          {`${priceDiffFromMarket}%`}
        </button>
        <button onClick={onReset} className="twap-limit-panel-percent-button twap-limit-panel-zero-btn-right">
          X
        </button>
      </StyledDefaultZeroButton>
    );
  }
  return <PercentButton percent="0" />;
};

const TokenSelect = () => {
  const {
    state: { srcToken, destToken, isInvertedLimitPrice },
  } = useTwapContext();
  const [isOpen, setIsOpen] = useState(false);
  const { components, onSrcTokenSelected, onDstTokenSelected } = useWidgetContext();
  const inverted = isInvertedLimitPrice;
  const token = inverted ? srcToken : destToken;
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
  const onInvert = useTwapContext().actionHandlers.onInvertPrice();

  return (
    <StyledInvertprice onClick={onInvert} className="twap-limit-panel-invert-button">
      <Icon icon={<RiArrowUpDownLine size="16px" />} />
    </StyledInvertprice>
  );
};

const Title = () => {
  const { translations: t, components, onSrcTokenSelected, onDstTokenSelected } = useWidgetContext();
  const { state } = useTwapContext();
  const [isOpen, setIsOpen] = useState(false);

  const { isInvertedLimitPrice: inverted, srcToken, destToken } = state;
  const token = inverted ? destToken : srcToken;
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

const LimitPriceLabel = () => {
  const { translations: t, isLimitPanel } = useWidgetContext();
  const isMarketOrder = useIsMarketOrder();

  return (
    <Label>
      <Label.Text text={!isLimitPanel ? t.price : t.limitPrice} />
      <Label.Info text={isMarketOrder ? t.marketPriceTooltip : isLimitPanel ? t.limitPriceTooltipLimitPanel : t.limitPriceTooltip} />
    </Label>
  );
};

LimitPanel.usePanel = useLimitPricePanel;
LimitPanel.Input = Input;
LimitPanel.TokenSelect = TokenSelect;
LimitPanel.PercentSelector = PercentSelector;
LimitPanel.Title = Title;
LimitPanel.Switch = LimitSwitch;
LimitPanel.InvertPrice = InvertPrice;
LimitPanel.Label = LimitPriceLabel;
LimitPanel.Main = Main;

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

const StyledDefaultZeroButton = styled(StyledRowFlex)({
  width: "auto",
  gap: 2,
});
