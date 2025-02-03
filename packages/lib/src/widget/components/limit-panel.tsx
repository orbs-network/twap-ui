import { styled } from "styled-components";
import { RiArrowUpDownLine } from "@react-icons/all-files/ri/RiArrowUpDownLine";
import { IoClose } from "@react-icons/all-files/io5/IoClose";

import React, { FC, ReactNode, useCallback, useState } from "react";
import { Panel } from "../../components/Panel";
import { StyledColumnFlex, StyledRowFlex, StyledText } from "../../styles";
import { Label, NumericInput, TokenDisplay } from "../../components/base";
import { useWidgetContext } from "../..";
import { TokenSelect } from "./token-select";

export const LimitPanel = ({ children, className = "" }: { className?: string; children: ReactNode }) => {
  const {
    twap: {
      errors,
      values: { isMarketOrder },
    },
  } = useWidgetContext();
  const error = errors.limitPrice?.text;

  if (isMarketOrder) return null;

  return (
    <Panel error={Boolean(error)} className={`twap-limit-price-panel ${className}`}>
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
        <PanelTokenSelect />
      </StyledRowFlex>
      <PercentSelector />
    </StyledMain>
  );
}

const StyledMain = styled(StyledColumnFlex)({
  ".twap-token-display": {
    ".twap-token-logo": {
      width: 30,
      height: 30,
    },
  },
});

const Input = ({ className = "" }: { className?: string }) => {
  const { twap } = useWidgetContext();
  const { limitPrice, setLimitPrice, isLoading } = twap.limitPricePanel;
  const { onBlur, onFocus } = Panel.usePanelContext();
  return <NumericInput className={`twap-limit-price-panel ${className}`} onBlur={onBlur} onFocus={onFocus} disabled={isLoading} onChange={setLimitPrice} value={limitPrice} />;
};

const PercentSelector = () => {
  const percentButtons = useWidgetContext().twap.limitPricePanel.percentButtons;

  return (
    <StyledPercentSelector className="twap-limit-price-panel-percent" style={{ gap: 5 }}>
      {percentButtons.map((it) => {
        const className = `twap-limit-price-panel-percent-button  ${it.selected ? "twap-limit-price-panel-percent-button-selected" : ""}`;
        if (it.isReset) {
          return (
            <StyledRowFlex key={it.text} className={`twap-limit-price-panel-percent-reset`} onClick={it.onClick}>
              <button className={`${className} twap-limit-price-panel-percent-reset-button`}>
                <StyledText>{it.text}</StyledText>
              </button>
              <button className={`${className} twap-limit-price-panel-percent-reset-icon`}>
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

const StyledPercentSelector = styled(StyledRowFlex)({
  width: "auto",
  ".twap-limit-price-panel-percent-reset": {
    width:'auto',
    alignItems: "stretch",
  }
})

const PanelTokenSelect = ({ className = "" }: { className?: string }) => {
  const { twap } = useWidgetContext();

  const inverted = twap.limitPricePanel.isInvertedLimitPrice;
  const isSrcToken = inverted ? true : false;

  return <TokenSelect isSrcToken={isSrcToken} className={`twap-limit-price-panel-token-select ${className}`} />;
};

const InvertPriceButton = ({ className = "" }: { className?: string }) => {
  const onInvert = useWidgetContext().twap.limitPricePanel.onInvertLimitPrice;

  return (
    <div onClick={onInvert} className={`twap-limit-price-panel-invert-button ${className}`}>
      <RiArrowUpDownLine size="16px" className="twap-limit-price-panel-icon" />
    </div>
  );
};

const Title = () => {
  const { translations: t, twap } = useWidgetContext();

  const inverted = twap.limitPricePanel.isInvertedLimitPrice;

  return (
    <>
      <StyledTitle className="twap-limit-price-panel-title">
        <StyledText className="twap-limit-price-panel-title-text">{t.swapOne}</StyledText>
        <TokenSelect isSrcToken={!inverted} />
        <StyledText className="twap-limit-price-panel-title-text">{t.isWorth}</StyledText>
      </StyledTitle>
    </>
  );
};

const StyledTitle = styled(StyledRowFlex)({
  width: "auto",
  gap: 7,
});

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
LimitPanel.TokenSelect = PanelTokenSelect;
LimitPanel.PercentSelector = PercentSelector;
LimitPanel.Title = Title;
LimitPanel.InvertPriceButton = InvertPriceButton;
LimitPanel.Label = LimitPriceLabel;
LimitPanel.Main = Main;

const Container = styled("div")({
  width: "100%",
});
