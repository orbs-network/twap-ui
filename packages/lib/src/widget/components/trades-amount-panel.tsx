import React, { ReactNode } from "react";
import { Panel } from "../../components/Panel";
import { Label, NumericInput } from "../../components/base";
import { styled } from "@mui/material";
import { StyledRowFlex, StyledText } from "../../styles";
import { useWidgetContext } from "../..";

export const TradesAmountPanel = ({ className = "", children }: { className?: string; children: ReactNode }) => {
  const { twap } = useWidgetContext();
  const error = twap.errors.chunks?.text;

  return (
    <Panel error={Boolean(error)} className={`${className} twap-trades-amount-panel`}>
      {children}
    </Panel>
  );
};

const Input = ({ className }: { className?: string }) => {
  const {
    values: { chunks },
    actionHandlers: { setChunks },
  } = useWidgetContext().twap;
  const { onBlur, onFocus } = Panel.usePanelContext();

  return (
    <NumericInput
      onBlur={onBlur}
      onFocus={onFocus}
      className={`twap-trades-amount-panel-input ${className}`}
      placeholder="0"
      value={chunks}
      decimalScale={0}
      onChange={(value) => setChunks(Number(value))}
    />
  );
};

export const _Label = ({ className = "" }: { className?: string }) => {
  const translations = useWidgetContext().translations;

  return (
    <Label className={`twap-trades-amount-panel-label ${className}`}>
      <Label.Text text={translations.totalTrades} />
      <Label.Info text={translations.totalTradesTooltip} />
    </Label>
  );
};

const Main = ({ className = "" }: { className?: string }) => {
  const { translations: t } = useWidgetContext();
  return (
    <StyledMain className={`twap-trades-amount-panel-main ${className}`}>
      <Panel.Header>
        <_Label />
      </Panel.Header>
      <StyledRowFlex>
        <Input />
        <StyledText className="twap-trades-amount-panel-text">{t.orders}</StyledText>
      </StyledRowFlex>
    </StyledMain>
  );
};

const StyledMain = styled("div")({});

TradesAmountPanel.Input = Input;
TradesAmountPanel.Label = _Label;
TradesAmountPanel.Main = Main;
