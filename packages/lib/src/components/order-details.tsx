import { styled } from "styled-components";
import React, { ReactNode, useMemo } from "react";
import { StyledRowFlex, StyledText } from "../styles";
import moment from "moment";
import { fillDelayText, makeElipsisAddress } from "../utils";
import { Token } from "../types";
import { useFormatNumber } from "../hooks/useFormatNumber";
import { Label } from "./base/Label";
import { useTwapContext } from "../context";
import { useNetwork } from "../hooks/logic-hooks";

const Expiry = ({ deadline }: { deadline?: number }) => {
  const t = useTwapContext()?.translations;
  const res = useMemo(() => moment(deadline).format("DD/MM/YYYY HH:mm"), [deadline]);
  return (
    <DetailRow title={t.expiration} tooltip={t.confirmationDeadlineTooltip}>
      {res}
    </DetailRow>
  );
};

const ChunkSize = ({ srcChunkAmount, srcToken, chunks }: { srcChunkAmount?: string; srcToken?: Token; chunks: number }) => {
  const translations = useTwapContext().translations;

  const _srcChunkAmount = useFormatNumber({ value: srcChunkAmount, decimalScale: 3 });

  if (chunks === 1) return null;

  return (
    <DetailRow title={translations.individualTradeSize} tooltip={translations.confirmationTradeSizeTooltip}>
      {`${srcChunkAmount ? _srcChunkAmount : "-"} ${srcToken?.symbol || ""}`}
    </DetailRow>
  );
};

const MinDestAmount = ({
  dstToken,
  isMarketOrder,
  dstMinAmountOut,
  totalChunks,
}: {
  dstToken?: Token;
  isMarketOrder?: boolean;
  dstMinAmountOut?: string;
  totalChunks?: number;
}) => {
  const { translations: t } = useTwapContext();
  const formattedValue = useFormatNumber({ value: dstMinAmountOut });

  if (isMarketOrder || !dstToken) return null;

  return (
    <DetailRow title={totalChunks === 1 ? t.minReceived : t.minReceivedPerTrade} tooltip={t.confirmationMinDstAmountTooltipLimit}>
      {`${dstMinAmountOut ? formattedValue : "-"} ${dstToken?.symbol}`}
    </DetailRow>
  );
};

const ChunksAmount = ({ chunks }: { chunks?: number }) => {
  const t = useTwapContext().translations;

  if (chunks === 1) return null;

  return (
    <DetailRow title={t.numberOfTrades} tooltip={t.confirmationTotalTradesTooltip}>
      {chunks}
    </DetailRow>
  );
};

const Recipient = () => {
  const { translations: t, account } = useTwapContext();
  const explorerUrl = useNetwork()?.explorer;
  const makerAddress = makeElipsisAddress(account);

  return (
    <DetailRow title={t.recipient}>
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

const TradeInterval = ({ fillDelayMillis, chunks }: { fillDelayMillis?: number; chunks: number }) => {
  const t = useTwapContext()?.translations;
  const text = useMemo(() => fillDelayText(fillDelayMillis), [fillDelayMillis]);

  if (chunks === 1) return null;

  return (
    <DetailRow title={t.tradeInterval} tooltip={t.tradeIntervalTootlip}>
      {text}
    </DetailRow>
  );
};

const DetailRow = ({ title, tooltip, children, className = "" }: { title: React.ReactNode; tooltip?: string; children?: React.ReactNode; className?: string }) => {
  return (
    <StyledDetailRow className={`${className} twap-order-details__detail-row`}>
      <Label text={title} tooltip={tooltip} className="twap-order-details__detail-row-label" />
      <StyledDetailRowChildren className="twap-order-details__detail-row-value">{children}</StyledDetailRowChildren>
    </StyledDetailRow>
  );
};

const TxHash = ({ txHash }: { txHash?: string }) => {
  const { translations: t } = useTwapContext();
  const txHashAddress = makeElipsisAddress(txHash);
  const explorerUrl = useNetwork()?.explorer;

  if (!txHash) return null;

  return (
    <DetailRow title={t.txHash}>
      {!explorerUrl ? (
        txHashAddress
      ) : (
        <a href={`${explorerUrl}/tx/${txHash}`} target="_blank">
          {txHashAddress}
        </a>
      )}
    </DetailRow>
  );
};

export function OrderDetails({ children, className = "" }: { children?: ReactNode; className?: string }) {
  return <div className={`${className} twap-order-details`}>{children}</div>;
}

const FillDelaySummary = ({ chunks, fillDelayMillis }: { chunks: number; fillDelayMillis?: number }) => {
  const t = useTwapContext().translations;

  if (chunks === 1) return null;

  return (
    <StyledText className="twap-order-details__fill-delay-text">
      {t.every} {fillDelayText(fillDelayMillis).toLowerCase()} <span>{t.over}</span> {chunks} <span>{t.orders}</span>
    </StyledText>
  );
};

OrderDetails.Expiry = Expiry;
OrderDetails.ChunkSize = ChunkSize;
OrderDetails.MinDestAmount = MinDestAmount;
OrderDetails.ChunksAmount = ChunksAmount;
OrderDetails.Recipient = Recipient;
OrderDetails.TradeInterval = TradeInterval;
OrderDetails.DetailRow = DetailRow;
OrderDetails.TxHash = TxHash;
OrderDetails.FillDelaySummary = FillDelaySummary;

const StyledDetailRow = styled(StyledRowFlex)({
  flexWrap: "wrap",
  justifyContent: "space-between",
});
const StyledDetailRowChildren = styled(StyledRowFlex)({
  width: "auto",
  justifyContent: "flex-end",
  marginLeft: "auto",
  "*": {
    fontSize: "inherit",
  },
  a: {
    color: "inherit",
    textDecoration: "unset",
    "&:hover": {
      textDecoration: "underline",
    },
  },
});
