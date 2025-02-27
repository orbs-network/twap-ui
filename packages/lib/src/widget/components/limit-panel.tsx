import { styled } from "styled-components";
import { RiArrowUpDownLine } from "@react-icons/all-files/ri/RiArrowUpDownLine";
import { IoClose } from "@react-icons/all-files/io5/IoClose";
import React, { ReactNode } from "react";
import { Panel } from "../../components/Panel";
import { StyledColumnFlex, StyledRowFlex, StyledText } from "../../styles";
import { NumericInput } from "../../components/base";
import { TokenSelect } from "./token-select";
import { useTwapContext } from "../../context";
import {
  useLimitPriceDstTokenSelect,
  useLimitPriceError,
  useLimitPriceInput,
  useLimitPriceOnInvert,
  useLimitPricePercentSelect,
  useLimitPriceSrcTokenSelect,
  useShouldHideLimitPricePanel,
} from "../../hooks/ui-hooks";

export const LimitPanel = ({ children, className = "" }: { className?: string; children: ReactNode }) => {
  const error = useLimitPriceError();
  const shouldHide = useShouldHideLimitPricePanel();

  if (shouldHide) return null;

  return (
    <Panel error={!!error} className={`twap-limit-price-panel ${className}`}>
      {children}
    </Panel>
  );
};

function Main({ className = "" }: { className?: string }) {
  return (
    <StyledMain className={`twap-limit-price-panel-main ${className}`}>
      <StyledRowFlex style={{ justifyContent: "space-between" }}>
        <Title />
        <InvertPriceButton />
      </StyledRowFlex>
      <StyledRowFlex style={{ justifyContent: "space-between" }}>
        <Input />
        <DstTokenSelect />
      </StyledRowFlex>
      <PercentSelector />
    </StyledMain>
  );
}

const StyledMain = styled(StyledColumnFlex)({
  ".twap-token-display": {
    ".twap-token-logo": {},
  },
});

const Input = ({ className = "" }: { className?: string }) => {
  const { value, onChange, isLoading } = useLimitPriceInput();
  const { onBlur, onFocus } = Panel.usePanelContext();

  return (
    <NumericInput loading={isLoading} className={`twap-limit-price-panel ${className}`} onBlur={onBlur} onFocus={onFocus} disabled={isLoading} onChange={onChange} value={value} />
  );
};

const PercentSelector = () => {
  const buttons = useLimitPricePercentSelect().buttons;

  return (
    <StyledPercentSelector className="twap-limit-price-panel-percent">
      {buttons.map((it) => {
        const className = `twap-limit-price-panel-percent-button twap-select-button  ${
          it.selected ? "twap-limit-price-panel-percent-button-selected twap-select-button-selected" : ""
        }`;
        if (it.isReset) {
          return (
            <StyledRowFlex key={it.text} className={`twap-limit-price-panel-percent-reset`} onClick={it.onClick}>
              <button className={`${className} twap-limit-price-panel-percent-reset-button`}>
                <StyledText>{it.text}</StyledText>
              </button>
              <button className={`${className} twap-limit-price-panel-percent-reset-icon `}>
                <IoClose />
              </button>
            </StyledRowFlex>
          );
        }
        return (
          <button key={it.text} className={className} onClick={it.onClick}>
            {it.text}
          </button>
        );
      })}
    </StyledPercentSelector>
  );
};

const StyledPercentSelector = styled("div")({
  width: "auto",
  display: "flex",
  alignItems: "center",
  ".twap-limit-price-panel-percent-reset": {
    width: "auto",
    alignItems: "stretch",
  },
});

const DstTokenSelect = ({ className = "" }: { className?: string }) => {
  const onSelect = useLimitPriceDstTokenSelect();

  return <TokenSelect onCustomSelect={onSelect} className={`twap-limit-price-panel-token-select ${className}`} />;
};

const InvertPriceButton = ({ className = "" }: { className?: string }) => {
  const onInvert = useLimitPriceOnInvert();

  return (
    <StyledPriceInvert onClick={onInvert} className={`twap-limit-price-panel-invert-button ${className}`}>
      <RiArrowUpDownLine size="16px" className="twap-limit-price-panel-icon" />
    </StyledPriceInvert>
  );
};

const StyledPriceInvert = styled("div")({
  cursor: "pointer",
});

const Title = () => {
  const {
    translations: t,
    state: { isInvertedPrice },
  } = useTwapContext();
  const onTokenSelect = useLimitPriceSrcTokenSelect();
  return (
    <>
      <StyledTitle className="twap-limit-price-panel-title">
        <StyledText className="twap-limit-price-panel-title-text">{t.swapOne}</StyledText>
        <TokenSelect onCustomSelect={onTokenSelect} isSrcToken={!isInvertedPrice} />
        <StyledText className="twap-limit-price-panel-title-text">{t.isWorth}</StyledText>
      </StyledTitle>
    </>
  );
};

const StyledTitle = styled(StyledRowFlex)({
  width: "auto",
  gap: 7,
});

LimitPanel.Input = Input;
LimitPanel.DstTokenSelect = DstTokenSelect;
LimitPanel.PercentSelector = PercentSelector;
LimitPanel.Title = Title;
LimitPanel.InvertPriceButton = InvertPriceButton;
LimitPanel.Main = Main;
