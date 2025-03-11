import { styled } from "styled-components";
import { RiArrowUpDownLine } from "@react-icons/all-files/ri/RiArrowUpDownLine";
import { IoClose } from "@react-icons/all-files/io5/IoClose";
import React, { ReactNode } from "react";
import { Panel } from "../../components/Panel";
import { StyledRowFlex, StyledText } from "../../styles";
import { NumericInput } from "../../components/base";
import { TokenSelect } from "./token-select";
import { useTwapContext } from "../../context";
import { useLimitPriceError, useLimitPriceInput, useLimitPriceOnInvert, useLimitPricePercentSelect } from "../../hooks/ui-hooks";
import { useShouldWrapOrUnwrapOnly } from "../../hooks/logic-hooks";

export const LimitPanel = ({ children, className = "" }: { className?: string; children?: ReactNode }) => {
  const error = useLimitPriceError();

  const isMarketOrder = useTwapContext().state.isMarketOrder;
  const shouldWrapOrUnwrapOnly = useShouldWrapOrUnwrapOnly();

  if (isMarketOrder || shouldWrapOrUnwrapOnly) return null;

  return (
    <Panel error={!!error} className={`twap-limit-price-panel ${className}`}>
      {children || <Main />}
    </Panel>
  );
};

function Main({ className = "" }: { className?: string }) {
  return (
    <div className={`twap-limit-price-panel-main ${className}`}>
      <StyledRowFlex style={{ justifyContent: "space-between" }} className="twap-limit-price-panel-main-header">
        <Title />
        <InvertPriceButton />
      </StyledRowFlex>
      <StyledRowFlex style={{ justifyContent: "space-between" }} className="twap-limit-price-panel-main-body">
        <Input />
        <DstTokenSelect />
      </StyledRowFlex>
      <PercentSelector />
    </div>
  );
}

const Input = ({ className = "" }: { className?: string }) => {
  const { value, onChange, isLoading } = useLimitPriceInput();
  const { onBlur, onFocus } = Panel.usePanelContext();

  return (
    <NumericInput loading={isLoading} className={`twap-limit-price-panel ${className}`} onBlur={onBlur} onFocus={onFocus} disabled={isLoading} onChange={onChange} value={value} />
  );
};

const PercentSelector = () => {
  const buttons = useLimitPricePercentSelect().buttons;
  const { components } = useTwapContext();

  if (components.LimitPanelPercentSelect) {
    return <components.LimitPanelPercentSelect buttons={buttons} />;
  }

  return (
    <div className="twap-limit-price-panel-percent">
      {buttons.map((it) => {
        const className = `twap-limit-price-panel-percent-button twap-select-button  ${
          it.selected ? "twap-limit-price-panel-percent-button-selected twap-select-button-selected" : ""
        }`;
        if (it.isReset) {
          return (
            <div key={it.text} className={`twap-limit-price-panel-percent-reset`} onClick={it.onClick}>
              <button className={`${className} twap-limit-price-panel-percent-reset-button`}>
                <StyledText>{it.text}</StyledText>
              </button>
              <button className={`${className} twap-limit-price-panel-percent-reset-icon `}>
                <IoClose />
              </button>
            </div>
          );
        }
        return (
          <button key={it.text} className={className} onClick={it.onClick}>
            {it.text}
          </button>
        );
      })}
    </div>
  );
};

const DstTokenSelect = ({ className = "" }: { className?: string }) => {
  const { isInvertedPrice } = useTwapContext().state;

  return <TokenSelect isSrcToken={isInvertedPrice} className={`twap-limit-price-panel-token-select ${className}`} />;
};

const InvertPriceButton = ({ className = "" }: { className?: string }) => {
  const onInvert = useLimitPriceOnInvert();
  const { components } = useTwapContext();

  if (components.LimitPanelInvertButton) {
    return <components.LimitPanelInvertButton onClick={onInvert} />;
  }

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

  return (
    <>
      <StyledTitle className="twap-limit-price-panel-title">
        <StyledText className="twap-limit-price-panel-title-text">{t.swapOne}</StyledText>
        <TokenSelect isSrcToken={!isInvertedPrice} />
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
