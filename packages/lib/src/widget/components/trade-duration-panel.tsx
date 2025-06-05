import React, { createContext, ReactNode, useCallback } from "react";
import { Label, NumericInput, ResolutionSelect } from "../../components/base";
import { TimeUnit } from "@orbs-network/twap-sdk";
import { Panel } from "../../components/Panel";
import { useTwapContext } from "../../context";
import { useOrderDuration, useShouldWrapOrUnwrapOnly } from "../../hooks/logic-hooks";

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
  const { onUnitSelect, durationMillis } = useDurationPanel();
  const { components } = useTwapContext();

  if (components.DurationSelectButtons) {
    return <components.DurationSelectButtons onSelect={onUnitSelect} selected={durationMillis} />;
  }

  return (
    <div className={`twap-duration-panel-buttons ${className}`}>
      {options?.map((it) => {
        return (
          <button
            key={it.value}
            onClick={() => onUnitSelect(it.value)}
            className={`twap-duration-panel-button twap-select-button ${durationMillis === it.value ? "twap-duration-panel-button-selected twap-select-button-selected" : ""}`}
          >
            {it.text}
          </button>
        );
      })}
    </div>
  );
};

export const Duration = ({
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

export const useDurationPanel = () => {
  const t = useTwapContext().translations;
  const { orderDuration: duration, setOrderDuration: setDuration, milliseconds: durationMillis, error } = useOrderDuration();

  const onInputChange = useCallback(
    (value: string) => {
      setDuration({ unit: duration.unit, value: Number(value) });
    },
    [setDuration, duration],
  );

  const onUnitSelect = useCallback(
    (unit: TimeUnit) => {
      setDuration({ unit, value: duration.value });
    },
    [setDuration, duration],
  );
  return {
    duration,
    setDuration,
    durationMillis,
    onInputChange,
    onUnitSelect,
    title: t.expiry,
    tooltip: t.maxDurationTooltip,
    error,
  };
};

const Input = ({ placeholder = "0", className = "" }: { placeholder?: string; className?: string }) => {
  const { setDuration, duration } = useDurationPanel();
  const { onBlur, onFocus } = Panel.usePanelContext();

  return (
    <NumericInput
      onBlur={onBlur}
      onFocus={onFocus}
      className={`twap-trade-interval-panel-input ${className}`}
      value={duration.value}
      onChange={(value) => setDuration({ unit: duration.unit, value: Number(value) })}
      placeholder={placeholder}
    />
  );
};

const Resolution = () => {
  const { onUnitSelect, duration } = useDurationPanel();
  const { onBlur, onFocus } = Panel.usePanelContext();

  return <ResolutionSelect onClose={onBlur} onOpen={onFocus} unit={duration.unit} onChange={onUnitSelect} />;
};

const Menu = () => {
  return (
    <div className="twap-duration-panel-content twap-panel-content">
      <Input />
      <Resolution />
    </div>
  );
};
const Main = ({ variant = "menu" }: { variant?: "buttons" | "menu" }) => {
  return (
    <>
      <Panel.Header>
        <DurationLabel />
      </Panel.Header>
      {variant === "buttons" && <Buttons />}
      {variant === "menu" && <Menu />}
    </>
  );
};

Duration.Buttons = Buttons;
Duration.Label = DurationLabel;
Duration.Menu = Menu;
Duration.usePanel = useDurationPanel;
Duration.Resolution = Resolution;
