import { RiArrowUpDownLine } from "@react-icons/all-files/ri/RiArrowUpDownLine";
import { IoClose } from "@react-icons/all-files/io5/IoClose";
import React, { ReactNode } from "react";
import { Panel } from "../../components/Panel";
import { NumericInput } from "../../components/base";
import { TokenSelect } from "./token-select";
import { useTwapContext } from "../../context";
import { useLimitPriceError, useLimitPriceInput, useLimitPriceOnInvert, useLimitPricePanel, useLimitPricePercentSelect } from "../../hooks/ui-hooks";
import { useShouldWrapOrUnwrapOnly } from "../../hooks/logic-hooks";
import { useFormatNumber } from "../../hooks/useFormatNumber";
import { useTwapStore } from "../../useTwapStore";

export const LimitPanel = ({ children, className = "" }: { className?: string; children?: ReactNode }) => {
  const error = useLimitPriceError();

  const isMarketOrder = useTwapStore((s) => s.state.isMarketOrder);
  const shouldWrapOrUnwrapOnly = useShouldWrapOrUnwrapOnly();

  if (isMarketOrder || shouldWrapOrUnwrapOnly) return null;

  return (
    <Panel error={!!error} className={`twap-limit-price-panel ${className}`}>
      {children || <Main />}
    </Panel>
  );
};

function Main() {
  return (
    <>
      <div className="twap-limit-price-panel-header">
        <Title />
        <InvertPriceButton />
      </div>
      <div className="twap-limit-price-panel-body">
        <Input />
        <DstTokenSelect />
      </div>
      <div>
        <USD />
        <PercentSelector />
      </div>
    </>
  );
}

const USD = () => {
  const { usd } = useLimitPricePanel();
  const { components } = useTwapContext();
  const usdF = useFormatNumber({ value: usd, decimalScale: 2 });

  if (components.USD) {
    return <components.USD isLoading={!usd} value={usd} />;
  }

  return <p className="twap-limit-price-panel-usd">{`$${usdF}`}</p>;
};

const Input = ({ className = "" }: { className?: string }) => {
  const { value, onChange, isLoading } = useLimitPriceInput();
  const { onBlur, onFocus } = Panel.usePanelContext();

  return (
    <NumericInput
      loading={isLoading}
      className={`twap-limit-price-panel-input ${className}`}
      onBlur={onBlur}
      onFocus={onFocus}
      disabled={isLoading}
      onChange={onChange}
      value={value}
    />
  );
};

const PercentSelector = () => {
  const { buttons, isReset } = useLimitPricePercentSelect();
  const { components } = useTwapContext();

  if (components.LimitPanelPercentSelect) {
    return <components.LimitPanelPercentSelect buttons={buttons} />;
  }

  return (
    <div className={`twap-limit-price-panel-percent ${isReset ? "twap-limit-price-panel-percent-is-reset" : ""}`}>
      {buttons.map((it) => {
        const className = `twap-limit-price-panel-percent-button twap-select-button  ${
          it.selected ? "twap-limit-price-panel-percent-button-selected twap-select-button-selected" : ""
        }`;
        if (it.isReset) {
          return (
            <div key={it.text} className={`twap-limit-price-panel-percent-reset`} onClick={it.onClick}>
              <button className={`${className} twap-limit-price-panel-percent-reset-button`}>
                <p>{it.text}</p>
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
  const isInvertedPrice = useTwapStore((s) => s.state.isInvertedPrice);

  return <TokenSelect isSrcToken={isInvertedPrice} className={`twap-limit-price-panel-token-select ${className}`} />;
};

const InvertPriceButton = ({ className = "" }: { className?: string }) => {
  const onInvert = useLimitPriceOnInvert();
  const { components } = useTwapContext();

  if (components.LimitPanelInvertButton) {
    return <components.LimitPanelInvertButton onClick={onInvert} />;
  }

  return (
    <div onClick={onInvert} className={`twap-limit-price-panel-invert-button ${className}`}>
      <RiArrowUpDownLine size="16px" className="twap-limit-price-panel-icon" />
    </div>
  );
};

const Title = () => {
  const { translations: t } = useTwapContext();
  const isInvertedPrice = useTwapStore((s) => s.state.isInvertedPrice);
  return (
    <>
      <div className="twap-limit-price-panel-title">
        <p className="twap-limit-price-panel-title-text">{t.swapOne}</p>
        <TokenSelect isSrcToken={!isInvertedPrice} />
        <p className="twap-limit-price-panel-title-text">{t.isWorth}</p>
      </div>
    </>
  );
};

LimitPanel.Input = Input;
LimitPanel.DstTokenSelect = DstTokenSelect;
LimitPanel.PercentSelector = PercentSelector;
LimitPanel.Title = Title;
LimitPanel.InvertPriceButton = InvertPriceButton;
LimitPanel.usePanel = useLimitPricePanel;
