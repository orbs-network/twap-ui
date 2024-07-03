import { styled } from "@mui/material";
import { ReactNode, useMemo } from "react";
import { fillDelayText, makeElipsisAddress, useTwapContext } from "../..";
import { useExplorerUrl, useFormatNumberV2 } from "../../hooks";
import { StyledColumnFlex, StyledRowFlex } from "../../styles";
import { Label, Tooltip } from "../base";
import { useOrderSummaryContext } from "./context";
import moment from "moment";

export const Expiry = () => {
  const deadline = useOrderSummaryContext().deadline;
  const t = useTwapContext()?.translations;
  const res = useMemo(() => moment(deadline).format("ll HH:mm"), [deadline]);

  return (
    <DetailRow title={t.expiration} tooltip={t.confirmationDeadlineTooltip}>
      {res}
    </DetailRow>
  );
};

export const ChunkSize = () => {
  const { srcChunkAmount, srcToken } = useOrderSummaryContext();
  const translations = useTwapContext().translations;

  const _srcChunkAmount = useFormatNumberV2({ value: srcChunkAmount, decimalScale: 2 });
  return (
    <DetailRow title={translations.tradeSize} tooltip={translations.confirmationTradeSizeTooltip}>
      {`${_srcChunkAmount} ${srcToken?.symbol}`}
    </DetailRow>
  );
};

export const MinDestAmount = () => {
  const { dstToken, isMarketOrder, dstMinAmountOut } = useOrderSummaryContext();
  const { translations } = useTwapContext();
  const formattedValue = useFormatNumberV2({ value: dstMinAmountOut });
  if (isMarketOrder) return null;

  return (
    <DetailRow title={translations.minReceivedPerTrade} tooltip={translations.confirmationMinDstAmountTootipLimit}>
      {`${formattedValue} ${dstToken?.symbol}`}
    </DetailRow>
  );
};

export const ChunksAmount = () => {
  const { chunks } = useOrderSummaryContext();
  const t = useTwapContext().translations;

  return (
    <DetailRow title={t.totalTrades} tooltip={t.confirmationTotalTradesTooltip}>
      {chunks}
    </DetailRow>
  );
};

export const Recipient = () => {
  const { translations: t, lib } = useTwapContext();
  const explorerUrl = useExplorerUrl();
  const address = (
    <Tooltip text={lib?.maker} placement="bottom">
      {makeElipsisAddress(lib?.maker, 8)}
    </Tooltip>
  );

  return (
    <DetailRow title={t.recipient}>
      {!explorerUrl ? (
        address
      ) : (
        <a href={`${explorerUrl}/address/${lib?.maker}`} target="_blank">
          {address}
        </a>
      )}
    </DetailRow>
  );
};

export const TradeInterval = () => {
  const t = useTwapContext()?.translations;
  const fillDelayMillis = useOrderSummaryContext().fillDelayMillis;
  const text = useMemo(() => fillDelayText(fillDelayMillis, t), [fillDelayMillis, t]);

  return (
    <DetailRow title={t.tradeInterval} tooltip={t.confirmationtradeIntervalTooltip}>
      {text}
    </DetailRow>
  );
};

export const Details = ({ className = "", children }: { className?: string; children?: ReactNode }) => {
  return <StyledDetails className={`twap-order-summary-details ${className}`}>{children}</StyledDetails>;
};

const StyledDetails = styled(StyledColumnFlex)({});

const DetailRow = ({
  title,
  tooltip,
  children,
  className = "",
  startLogo,
}: {
  title: ReactNode;
  tooltip?: string;
  children?: React.ReactNode;
  className?: string;
  startLogo?: ReactNode;
}) => {
  return (
    <StyledDetailRow className={`${className} twap-order-summary-detail-row`}>
      <StyledLabel tooltipText={tooltip}>
        {startLogo} {title}
      </StyledLabel>
      <StyledDetailRowChildren className="twap-order-summary-detail-row-right">{children}</StyledDetailRowChildren>
    </StyledDetailRow>
  );
};

const StyledLabel = styled(Label)({
  ".twap-label-text": {
    fontSize: 14,
  },
});

const StyledDetailRow = styled(StyledRowFlex)({
  flexWrap: "wrap",
  justifyContent: "space-between",
});
const StyledDetailRowChildren = styled(StyledRowFlex)({
  width: "auto",
  justifyContent: "flex-end",
  marginLeft: "auto",
  fontSize: 14,
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

Details.Expiry = Expiry;
Details.ChunkSize = ChunkSize;
Details.MinDestAmount = MinDestAmount;
Details.ChunksAmount = ChunksAmount;
Details.Recipient = Recipient;
Details.TradeInterval = TradeInterval;
Details.DetailRow = DetailRow;
