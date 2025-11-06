import React, { CSSProperties, ReactNode, useMemo } from "react";

import { fillDelayText, makeElipsisAddress } from "../utils";
import { Token } from "../types";
import { useTwapContext } from "../context/twap-context";
import { AiOutlineCopy } from "@react-icons/all-files/ai/AiOutlineCopy";
import { useCopyToClipboard, useDateFormat, useFormatNumber, useNetwork } from "../hooks/helper-hooks";
import BN from "bignumber.js";
import { useTranslations } from "../hooks/use-translations";


const USD = ({ value }: { value?: string }) => {
  const formattedValue = useFormatNumber({ value: value, decimalScale: 2 });
  if (!formattedValue) return null;
  return <small className="twap-order-details__detail-row-value-usd">{` ($${formattedValue})`}</small>;
};
const Deadline = ({ deadline, label, tooltip }: { deadline?: number; label: string; tooltip: string }) => {
  const res = useDateFormat(deadline);
  return (
    <DetailRow title={label} tooltip={tooltip}>
      {res}
    </DetailRow>
  );
};

const TriggerPrice = ({ price, dstToken, label, tooltip, usd }: { price?: string; dstToken?: Token; label: string; tooltip: string; usd?: string }) => {
  const priceF = useFormatNumber({ value: price });
  if (BN(price || 0).isZero()) return null;

  return (
    <DetailRow title={label} tooltip={tooltip}>
      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        {`${priceF ? priceF : "-"} ${dstToken?.symbol}`}
        <USD value={usd} />
      </div>
    </DetailRow>
  );
};

const LimitPrice = ({ price, dstToken, percentage, isMarketOrder }: { price?: string; dstToken?: Token; percentage?: number; isMarketOrder?: boolean }) => {
  const priceF = useFormatNumber({ value: price });
  const t = useTranslations();
  if (isMarketOrder) return null;

  return (
    <DetailRow title={t("limitPrice") || ""} tooltip={t("limitPriceTooltip") || ""}>
      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        {`${priceF ? priceF : "-"} ${dstToken?.symbol}`}
        {percentage && <small>{`(${percentage}%)`}</small>}
      </div>
    </DetailRow>
  );
};

const TradeSize = ({ tradeSize, srcToken, trades, label, tooltip }: { tradeSize?: string; srcToken?: Token; trades: number; label: string; tooltip: string }) => {
  if (trades === 1) return null;

  return (
    <DetailRow title={label} tooltip={tooltip}>
      {`${tradeSize ? tradeSize : "-"} ${srcToken?.symbol || ""}`}
    </DetailRow>
  );
};

const MinDestAmount = ({ dstToken, dstMinAmountOut, label, tooltip, usd }: { dstToken?: Token; dstMinAmountOut?: string; label: string; tooltip: string; usd?: string }) => {
  const formattedValue = useFormatNumber({ value: dstMinAmountOut });

  if (BN(dstMinAmountOut || 0).isZero()) return null;

  return (
    <DetailRow title={label} tooltip={tooltip}>
      {`${dstMinAmountOut ? formattedValue : "-"} ${dstToken?.symbol}`}
      <USD value={usd} />
    </DetailRow>
  );
};

const TradesAmount = ({ trades, label, tooltip }: { trades?: number; label: string; tooltip: string }) => {
  if (trades === 1) return null;

  return (
    <DetailRow title={label} tooltip={tooltip}>
      {trades}
    </DetailRow>
  );
};

const Recipient = () => {
  const t = useTranslations();
  const { account } = useTwapContext();
  const explorerUrl = useNetwork()?.explorer;
  const makerAddress = makeElipsisAddress(account);

  return (
    <DetailRow title={t("recipient") || ""}>
      {!explorerUrl ? (
        makerAddress
      ) : (
        <a href={`${explorerUrl}/address/${account}`} target="_blank">
          {makerAddress}
        </a>
      )}
    </DetailRow>
  );
};

const TradeInterval = ({ fillDelayMillis, chunks = 0, label, tooltip }: { fillDelayMillis?: number; chunks?: number; label: string; tooltip: string }) => {
  const text = useMemo(() => fillDelayText(fillDelayMillis), [fillDelayMillis]);

  if (chunks === 1) return null;

  return (
    <DetailRow title={label} tooltip={tooltip}>
      {text}
    </DetailRow>
  );
};

const DetailRow = ({
  title,
  tooltip,
  children,
  className = "",
  onClick,
  style,
}: {
  title: string;
  tooltip?: string;
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  style?: CSSProperties;
}) => {
  const { components } = useTwapContext();
  const Tooltip = components.Tooltip;
  return (
    <div className={`${className} twap-order-details__detail-row`} onClick={onClick} style={style}>
      <div className="twap-order-details__detail-row-label">
        <p className="twap-order-details__detail-row-label-value">{title}</p>
        {tooltip && Tooltip && <Tooltip tooltipText={tooltip} />}
      </div>
      <div className="twap-order-details__detail-row-value">{children}</div>
    </div>
  );
};

const OrderID = ({ id }: { id: string }) => {
  const { components } = useTwapContext();
  const Tooltip = components?.Tooltip;
  const copy = useCopyToClipboard();
  if (typeof id === "number") {
    return <DetailRow title="ID">{id}</DetailRow>;
  } else {
    return (
      <DetailRow title="ID" onClick={() => copy(id)} style={{ cursor: "pointer" }}>
        {Tooltip && (
          <Tooltip tooltipText={id}>
            <div className="twap-order-details__detail-row-value-id">
              <p>{makeElipsisAddress(id)}</p>
              <AiOutlineCopy />
            </div>
          </Tooltip>
        )}
      </DetailRow>
    );
  }
};

const OrderVersion = ({ version }: { version: number }) => {
  return <DetailRow title="Version">{version}</DetailRow>;
};

export function OrderDetails({ children, className = "" }: { children?: ReactNode; className?: string }) {
  return <div className={`${className} twap-order-details`}>{children}</div>;
}

const OrderDetailsContainer = ({ children }: { children: ReactNode }) => {
  return children;
};

const Fees = ({ fees, label, usd, dstTokenSymbol }: { fees?: string; label: string; usd?: string; dstTokenSymbol?: string }) => {
  const formattedValue = useFormatNumber({ value: fees });

  return (
    <DetailRow title={label}>
      {`${fees ? formattedValue : "-"} ${dstTokenSymbol}`}
      <USD value={usd} />
    </DetailRow>
  );
};

OrderDetails.Deadline = Deadline;
OrderDetails.Fees = Fees;
OrderDetails.TradeSize = TradeSize;
OrderDetails.MinDestAmount = MinDestAmount;
OrderDetails.TradesAmount = TradesAmount;
OrderDetails.Recipient = Recipient;
OrderDetails.TradeInterval = TradeInterval;
OrderDetails.DetailRow = DetailRow;
OrderDetails.TriggerPrice = TriggerPrice;
OrderDetails.LimitPrice = LimitPrice;
OrderDetails.OrderID = OrderID;
OrderDetails.Container = OrderDetailsContainer;
OrderDetails.OrderVersion = OrderVersion;
