import React, { ReactNode } from "react";
import { Panel } from "../../components/Panel";
import { Label, NumericInput } from "../../components/base";
import { StyledRowFlex, StyledText } from "../../styles";
import styled from "styled-components";
import { useTwapContext } from "../../context";
import { useShouldWrapOrUnwrapOnly } from "../../hooks/logic-hooks";
import { useTradesAmountPanel } from "../../hooks/ui-hooks";

export const TradesAmountPanel = ({ className = "", children }: { className?: string; children: ReactNode }) => {
  const { error } = useTradesAmountPanel();

  const hide = useShouldWrapOrUnwrapOnly();

  if (hide) return null;

  return (
    <Panel error={!!error} className={`${className} twap-trades-amount-panel`}>
      {children}
    </Panel>
  );
};

const Input = ({ className = "" }: { className?: string }) => {
  const { onBlur, onFocus } = Panel.usePanelContext();
  const { onChange, trades } = useTradesAmountPanel();

  return (
    <NumericInput
      onBlur={onBlur}
      onFocus={onFocus}
      className={`twap-trades-amount-panel-input ${className}`}
      placeholder="0"
      value={trades}
      decimalScale={0}
      onChange={(value) => onChange(Number(value))}
    />
  );
};

export const _Label = ({ className = "" }: { className?: string }) => {
  const { label, tooltip } = useTradesAmountPanel();

  return <Label className={`twap-trades-amount-panel-label ${className}`} text={label} tooltip={tooltip} />;
};

const Main = ({ className = "" }: { className?: string }) => {
  const { translations: t } = useTwapContext();
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
