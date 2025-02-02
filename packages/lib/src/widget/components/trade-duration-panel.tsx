import React, { createContext, ReactNode, useCallback } from "react";
import { Label, Message } from "../../components/base";
import { TimeUnit } from "@orbs-network/twap-sdk";
import { StyledRowFlex } from "../../styles";
import { styled } from "@mui/material";
import { useWidgetContext } from "../..";

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
  const {
    twap: {
      values: { durationMilliseconds },
      actionHandlers: { setDuration },
    },
  } = useWidgetContext();
  const { options } = usePanelContext();

  const onChange = useCallback(
    (unit: TimeUnit) => {
      setDuration({ unit, value: 1 });
    },
    [setDuration],
  );

  return (
    <div className={`twap-duration-panel-buttons ${className}`}>
      {options?.map((it) => {
        return (
          <button
            key={it.value}
            onClick={() => onChange(it.value)}
            className={`twap-duration-panel-button ${durationMilliseconds === it.value ? "twap-duration-panel-button-selected" : ""}`}
          >
            {it.text}
          </button>
        );
      })}
    </div>
  );
};

export const DurationPanel = ({ children, className = "", options = Options }: { children: ReactNode; className?: string; options?: Option[] }) => {
  return (
    <PanelContext.Provider value={{ options: Options }}>
      <div className={`twap-duration-panel ${className}`}>{children}</div>
    </PanelContext.Provider>
  );
};

const WarningComponent = () => {
  const { twap } = useWidgetContext();
  const errors = twap.errors;

  if (!errors.duration) return null;

  return <Message title={errors.duration.text} variant="warning" />;
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
    gap: 10,
  },
});

DurationPanel.Buttons = Buttons;
DurationPanel.Label = DurationLabel;
DurationPanel.Warning = WarningComponent;
DurationPanel.Main = Main;
