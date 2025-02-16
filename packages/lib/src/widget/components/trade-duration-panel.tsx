import React, { createContext, ReactNode } from "react";
import { Label } from "../../components/base";
import { TimeUnit } from "@orbs-network/twap-sdk";
import { StyledRowFlex } from "../../styles";
import { useWidgetContext } from "../..";
import { useShouldWrapOrUnwrapOnly } from "../../hooks/useShouldWrapOrUnwrap";
import styled from "styled-components";
import { useTradeDurationPanel } from "../hooks";
import { Panel } from "../../components/Panel";

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
  const { onChange, selected } = useTradeDurationPanel();

  return (
    <div className={`twap-duration-panel-buttons ${className}`}>
      {options?.map((it) => {
        return (
          <button
            key={it.value}
            onClick={() => onChange(it.value)}
            className={`twap-duration-panel-button twap-select-button ${selected === it.value ? "twap-duration-panel-button-selected twap-select-button-selected" : ""}`}
          >
            {it.text}
          </button>
        );
      })}
    </div>
  );
};

export const DurationPanel = ({ children, className = "", options = Options }: { children: ReactNode; className?: string; options?: Option[] }) => {
  const hide = useShouldWrapOrUnwrapOnly();

  if (hide) return null;

  return (
    <Panel className={`twap-duration-panel ${className}`}>
      <PanelContext.Provider value={{ options }}>{children}</PanelContext.Provider>
    </Panel>
  );
};

const DurationLabel = () => {
  const translations = useWidgetContext().translations;
  return (
    <Label>
      <Label.Text text={translations.expiry} />
      <Label.Info text={translations.maxDurationTooltip} />
    </Label>
  );
};

const Main = ({ className = "" }: { className?: string }) => {
  return (
    <StyledMain className={`twap-duration-panel-main ${className}`}>
      <DurationLabel />
      <Buttons />
    </StyledMain>
  );
};

const StyledMain = styled(StyledRowFlex)({
  flexWrap: "wrap",
  ".twap-duration-panel-buttons": {
    display: "flex",
    justifyContent: "flex-end",
    flex: 1,
  },
});

DurationPanel.Buttons = Buttons;
DurationPanel.Label = DurationLabel;
DurationPanel.Main = Main;
