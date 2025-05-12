import React, { ReactNode } from "react";
import { Panel } from "../../components/Panel";
import { Label, NumericInput } from "../../components/base";
import { StyledRowFlex, StyledText } from "../../styles";
import { useTwapContext } from "../../context";
import { useChunks, useShouldWrapOrUnwrapOnly, useSrcChunkAmountUSD, useSrcTokenChunkAmount } from "../../hooks/logic-hooks";
import { useFormatNumber } from "../../hooks/useFormatNumber";
import { useTwapStore } from "../../useTwapStore";

const useTradeSize = () => {
  const chunkSize = useSrcChunkAmountUSD();
  const { amountUI } = useSrcTokenChunkAmount();
  const { srcToken, isLimitPanel } = useTwapContext();
  const chunksError = useChunks().error;
  const chunkSizeError = useSrcTokenChunkAmount().error;
  const typedSrcAmount = useTwapStore((s) => s.state.typedSrcAmount);
  const error = !typedSrcAmount ? false : chunksError || chunkSizeError;
  const amountUIF = useFormatNumber({ value: amountUI, decimalScale: 3 });
  const chunkSizeF = useFormatNumber({ value: chunkSize, decimalScale: 2 });

  if (!chunkSizeF || isLimitPanel || !srcToken)
    return {
      value: null,
      usd: null,
      error: false,
      token: null,
    };

  return {
    value: amountUIF,
    token: srcToken,
    usd: chunkSizeF,
    error,
  };
};

export const Amount = () => {
  const { value, usd, error, token } = useTradeSize();
  const { translations: t } = useTwapContext();
  if (!value || !usd) return null;
  return (
    <StyledText className={`twap-trade-amount-message ${error ? "twap-trade-amount-message-error" : ""}`}>
      <span className="twap-trade-amount-message-amount"> {`${value} ${token?.symbol}`}</span>
      <span className="twap-trade-amount-message-chunk-size"> {`($${usd}) `}</span>
      <span className="twap-trade-amount-message-per-trade"> {`${t.perTrade}`}</span>
    </StyledText>
  );
};

export const usePanel = () => {
  const { translations: t } = useTwapContext();
  const { setChunks, chunks, error } = useChunks();
  const tradeSize = useTradeSize();
  return {
    error,
    trades: chunks,
    onChange: setChunks,
    label: t.tradesAmountTitle,
    tooltip: t.totalTradesTooltip,
    tradeSize,
  };
};

export const TradesAmount = ({ className = "", children }: { className?: string; children?: ReactNode }) => {
  const { error } = usePanel();

  const hide = useShouldWrapOrUnwrapOnly();

  if (hide) return null;

  return (
    <Panel error={!!error} className={`${className} twap-trades-amount-panel`}>
      {children || <Main />}
    </Panel>
  );
};

const Input = ({ className = "" }: { className?: string }) => {
  const { onBlur, onFocus } = Panel.usePanelContext();
  const { onChange, trades } = usePanel();

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

export const TradesAmountLabel = ({ className = "" }: { className?: string }) => {
  const { label, tooltip } = usePanel();

  return <Label className={`twap-trades-amount-panel-label ${className}`} text={label} tooltip={tooltip} />;
};

const Main = ({ className = "" }: { className?: string }) => {
  const { translations: t } = useTwapContext();
  return (
    <div className={`twap-trades-amount-panel-main ${className}`}>
      <Panel.Header>
        <TradesAmountLabel />
      </Panel.Header>
      <StyledRowFlex className="twap-trades-amount-panel-content">
        <Input />
        <StyledText className="twap-trades-amount-panel-text">{t.tradesAmountSmallText}</StyledText>
      </StyledRowFlex>
    </div>
  );
};

TradesAmount.Input = Input;
TradesAmount.Label = TradesAmountLabel;
TradesAmount.usePanel = usePanel;
TradesAmount.Amount = Amount;
