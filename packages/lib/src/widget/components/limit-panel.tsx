import { styled } from "styled-components";
import { RiArrowUpDownLine } from "@react-icons/all-files/ri/RiArrowUpDownLine";
import { IoClose } from "@react-icons/all-files/io5/IoClose";
import React, { ReactNode } from "react";
import { Panel } from "../../components/Panel";
import { StyledColumnFlex, StyledRowFlex, StyledText } from "../../styles";
import { Label, NumericInput } from "../../components/base";
import { useWidgetContext } from "../..";
import { TokenSelect } from "./token-select";
import { useShouldWrapOrUnwrapOnly } from "../../hooks/useShouldWrapOrUnwrap";
import { useLimitPricePanel } from "../hooks";

export const LimitPanel = ({ children, className = "" }: { className?: string; children: ReactNode }) => {
  const { error, isMarketOrder } = useLimitPricePanel();

  const hide = useShouldWrapOrUnwrapOnly();

  if (isMarketOrder || hide) return null;

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
        <PanelTokenSelect />
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
  const { limitPrice, setLimitPrice, isLoading, isCustom } = useLimitPricePanel();
  const { marketPriceLoading, marketPrice } = useWidgetContext();
  const { onBlur, onFocus } = Panel.usePanelContext();

  return (
    <NumericInput
      loading={isLoading || (marketPriceLoading && !isCustom)}
      className={`twap-limit-price-panel ${className}`}
      onBlur={onBlur}
      onFocus={onFocus}
      disabled={!marketPrice}
      onChange={setLimitPrice}
      value={limitPrice}
    />
  );
};

const PercentSelector = () => {
  const percentButtons = useLimitPricePanel().percentButtons;

  return (
    <StyledPercentSelector className="twap-limit-price-panel-percent">
      {percentButtons.map((it) => {
        const className = `twap-limit-price-panel-percent-button twap-select-button  ${it.selected ? "twap-limit-price-panel-percent-button-selected twap-select-button-selected" : ""}`;
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

const PanelTokenSelect = ({ className = "" }: { className?: string }) => {
  const inverted = useLimitPricePanel().isInvertedLimitPrice;
  const isSrcToken = inverted ? true : false;

  return <TokenSelect isSrcToken={isSrcToken} className={`twap-limit-price-panel-token-select ${className}`} />;
};

const InvertPriceButton = ({ className = "" }: { className?: string }) => {
  const onInvert = useLimitPricePanel().onInvertLimitPrice;

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
    twap: { derivedState },
  } = useWidgetContext();

  const inverted = derivedState.isInvertedLimitPrice;

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
  const { label, tooltip } = useLimitPricePanel();

  return (
    <Label>
      <Label.Text text={label} />
      <Label.Info text={tooltip} />
    </Label>
  );
};

LimitPanel.Input = Input;
LimitPanel.TokenSelect = PanelTokenSelect;
LimitPanel.PercentSelector = PercentSelector;
LimitPanel.Title = Title;
LimitPanel.InvertPriceButton = InvertPriceButton;
LimitPanel.Label = LimitPriceLabel;
LimitPanel.Main = Main;
