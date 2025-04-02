import React, { createContext, ReactNode, useCallback } from "react";
import { Label, NumericInput, ResolutionSelect } from "../../components/base";
import { TimeUnit } from "@orbs-network/twap-sdk";
import { StyledRowFlex } from "../../styles";
import styled from "styled-components";
import { Panel } from "../../components/Panel";
import { useTwapContext } from "../../context";
import { useShouldWrapOrUnwrapOnly } from "../../hooks/logic-hooks";
import { useOrderDurationPanel } from "../../hooks/ui-hooks";

type Option = { text: string; value: TimeUnit };

type ContextType = {
  options?: Option[];
};

const PanelContext = createContext({} as ContextType);
const usePanelContext = () => React.useContext(PanelContext);
const Options: Option[] = [
  {
    text: "1 Day",
    value: TimeUnit.Days,
  },
  {
    text: "1 Week",
    value: TimeUnit.Weeks,
  },
  {
    text: "1 Month",
    value: TimeUnit.Months,
  },
];

const Buttons = ({ className = "" }: { className?: string }) => {
  const { options } = usePanelContext();
  const { onUnitSelect, milliseconds } = useOrderDurationPanel();
  const { components } = useTwapContext();
  const onChange = useCallback((unit: TimeUnit) => onUnitSelect(unit), [onUnitSelect]);

  if (components.DurationSelectButtons) {
    return <components.DurationSelectButtons onSelect={onChange} selected={milliseconds} />;
  }

  return (
    <div className={`twap-duration-panel-buttons ${className}`}>
      {options?.map((it) => {
        return (
          <button
            key={it.value}
            onClick={() => onChange(it.value)}
            className={`twap-duration-panel-button twap-select-button ${milliseconds === it.value ? "twap-duration-panel-button-selected twap-select-button-selected" : ""}`}
          >
            {it.text}
          </button>
        );
      })}
    </div>
  );
};

export const DurationPanel = ({
  children,
  className = "",
  options = Options,
  variant,
}: {
  children?: ReactNode;
  className?: string;
  options?: Option[];
  variant?: "buttons" | "menu";
}) => {
  const hide = useShouldWrapOrUnwrapOnly();

  if (hide) return null;

  return (
    <Panel className={`twap-duration-panel ${className}`}>
      <PanelContext.Provider value={{ options }}>{children || <Main variant={variant} />}</PanelContext.Provider>
    </Panel>
  );
};

const DurationLabel = () => {
  const translations = useTwapContext().translations;
  return <Label text={translations.expiry} tooltip={translations.maxDurationTooltip} />;
};

const Input = ({ placeholder = "0", className = "" }: { placeholder?: string; className?: string }) => {
  const { setOrderDuration, orderDuration } = useOrderDurationPanel();
  const { onBlur, onFocus } = Panel.usePanelContext();

  return (
    <NumericInput
      onBlur={onBlur}
      onFocus={onFocus}
      className={`twap-trade-interval-panel-input ${className}`}
      value={orderDuration.value}
      onChange={(value) => setOrderDuration({ unit: orderDuration.unit, value: Number(value) })}
      placeholder={placeholder}
    />
  );
};

const Resolution = () => {
  const { onUnitSelect, orderDuration } = useOrderDurationPanel();
  const { onBlur, onFocus } = Panel.usePanelContext();

  return <ResolutionSelect onClose={onBlur} onOpen={onFocus} unit={orderDuration.unit} onChange={onUnitSelect} />;
};

const Menu = () => {
  return (
    <StyledRowFlex>
      <Input />
      <Resolution />
    </StyledRowFlex>
  );
};
const Main = ({ className = "", variant = "buttons" }: { className?: string; variant?: "buttons" | "menu" }) => {
  return (
    <StyledMain className={`twap-duration-panel-main ${className}`}>
      <Panel.Header>
        <DurationLabel />
      </Panel.Header>
      {variant === "buttons" && <Buttons />}
      {variant === "menu" && <Menu />}
    </StyledMain>
  );
};

const StyledMain = styled("div")({
  flexWrap: "wrap",
  ".twap-duration-panel-buttons": {
    display: "flex",
    justifyContent: "flex-end",
    flex: 1,
  },
});

DurationPanel.Buttons = Buttons;
DurationPanel.Label = DurationLabel;
DurationPanel.Menu = Menu;
