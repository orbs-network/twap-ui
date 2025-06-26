import React, { ReactNode } from "react";
import { Panel } from "../../components/Panel";
import { Label, NumericInput } from "../../components/base";
import { useTwapContext } from "../../context";
import { useChunks, useChunksError, useShouldWrapOrUnwrapOnly, useSrcChunkAmountUSD, useSrcTokenChunkAmount, useTradeSizeError } from "../../hooks/logic-hooks";
import { useFormatNumber } from "../../hooks/useFormatNumber";
import { useTwapStore } from "../../useTwapStore";

const useTradeSize = () => {
  const chunkSize = useSrcChunkAmountUSD();
  const { amountUI } = useSrcTokenChunkAmount();
  const { srcToken, isLimitPanel } = useTwapContext();
  const chunksError = useChunksError();
  const chunkSizeError = useTradeSizeError();
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
    <p className={`twap-trade-amount-message ${error ? "twap-trade-amount-message-error" : ""}`}>
      <span className="twap-trade-amount-message-amount"> {`${value} ${token?.symbol}`}</span>
      <span className="twap-trade-amount-message-chunk-size"> {`($${usd}) `}</span>
      <span className="twap-trade-amount-message-per-trade"> {`${t.perTrade}`}</span>
    </p>
  );
};

export const useTradesAmountPanel = () => {
  const { translations: t } = useTwapContext();
  const { setChunks, chunks } = useChunks();
  const tradeSize = useTradeSize();
  const error = useChunksError();
  return {
    trades: chunks,
    onChange: setChunks,
    label: t.tradesAmountTitle,
    tooltip: t.totalTradesTooltip,
    tradeSize,
    error,
  };
};

export const TradesAmount = ({ className = "", children }: { className?: string; children?: ReactNode }) => {
  const { error } = useTradesAmountPanel();

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

export const TradesAmountLabel = ({ className = "" }: { className?: string }) => {
  const { label, tooltip } = useTradesAmountPanel();

  return <Label className={`twap-trades-amount-panel-label ${className}`} text={label} tooltip={tooltip} />;
};

const Main = () => {
  const { translations: t } = useTwapContext();
  return (
    <>
      <Panel.Header>
        <TradesAmountLabel />
      </Panel.Header>
      <div className="twap-trades-amount-panel-content twap-panel-content">
        <Input />
        <p className="twap-trades-amount-panel-text">{t.tradesAmountSmallText}</p>
      </div>
    </>
  );
};

TradesAmount.Input = Input;
TradesAmount.Label = TradesAmountLabel;
TradesAmount.usePanel = useTradesAmountPanel;
TradesAmount.Amount = Amount;
