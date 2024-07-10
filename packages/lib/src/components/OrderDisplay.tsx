import { styled } from "@mui/material";
import { ReactNode, useMemo } from "react";
import { useExplorerUrl, useFormatNumberV2 } from "../hooks/hooks";
import { StyledColumnFlex, StyledRowFlex, StyledText } from "../styles";
import { Label, TokenLogo, Tooltip } from "./base";
import moment from "moment";
import { useTwapContext } from "../context/context";
import { fillDelayText, makeElipsisAddress } from "../utils";
import { Token } from "../types";

const Expiry = ({ deadline }: { deadline?: number }) => {
  const t = useTwapContext()?.translations;
  const res = useMemo(() => moment(deadline).format("ll HH:mm"), [deadline]);

  return (
    <DetailRow title={t.expiration} tooltip={t.confirmationDeadlineTooltip}>
      {res}
    </DetailRow>
  );
};

const ChunkSize = ({ srcChunkAmount, srcToken }: { srcChunkAmount?: string; srcToken?: Token }) => {
  const translations = useTwapContext().translations;

  const _srcChunkAmount = useFormatNumberV2({ value: srcChunkAmount, decimalScale: 2 });
  return (
    <DetailRow title={translations.individualTradeSize} tooltip={translations.confirmationTradeSizeTooltip}>
      {`${_srcChunkAmount} ${srcToken?.symbol}`}
    </DetailRow>
  );
};

const MinDestAmount = ({ dstToken, isMarketOrder, dstMinAmountOut }: { dstToken?: Token; isMarketOrder?: boolean; dstMinAmountOut?: string }) => {
  const { translations } = useTwapContext();
  const formattedValue = useFormatNumberV2({ value: dstMinAmountOut });
  if (isMarketOrder) return null;

  return (
    <DetailRow title={translations.minReceivedPerTrade} tooltip={translations.confirmationMinDstAmountTootipLimit}>
      {`${formattedValue} ${dstToken?.symbol}`}
    </DetailRow>
  );
};

const ChunksAmount = ({ chunks }: { chunks?: number }) => {
  const t = useTwapContext().translations;

  return (
    <DetailRow title={t.numberOfTrades} tooltip={t.confirmationTotalTradesTooltip}>
      {chunks}
    </DetailRow>
  );
};

const Recipient = () => {
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

const TradeInterval = ({ fillDelayMillis }: { fillDelayMillis?: number }) => {
  const t = useTwapContext()?.translations;
  const text = useMemo(() => fillDelayText(fillDelayMillis, t), [fillDelayMillis, t]);

  return (
    <DetailRow title={t.tradeInterval} tooltip={t.confirmationtradeIntervalTooltip}>
      {text}
    </DetailRow>
  );
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
    <StyledDetailRow className={`${className} twap-order-display-details-row`}>
      <StyledLabel tooltipText={tooltip}>
        {startLogo} {title}
      </StyledLabel>
      <StyledDetailRowChildren className="twap-order-display-details-row-right">{children}</StyledDetailRowChildren>
    </StyledDetailRow>
  );
};

const TxHash = ({ txHash }: { txHash?: string }) => {
  const { translations: t } = useTwapContext();

  const explorerUrl = useExplorerUrl();

  if (!txHash) return null;

  const address = (
    <Tooltip text={txHash} placement="bottom">
      {makeElipsisAddress(txHash, 8)}
    </Tooltip>
  );

  return (
    <DetailRow title={t.txHash}>
      {!explorerUrl ? (
        address
      ) : (
        <a href={`${explorerUrl}/tx/${txHash}`} target="_blank">
          {address}
        </a>
      )}
    </DetailRow>
  );
};

const Details = ({ className = "", children }: { className?: string; children?: ReactNode }) => {
  return <StyledDetails className={`twap-order-display-details ${className}`}>{children}</StyledDetails>;
};

export function OrderDisplay({ children, className = "" }: { children?: ReactNode; className?: string }) {
  return <Container className={`${className} twap-order-display`}>{children}</Container>;
}

const TokenDisplay = ({ amount, token, usd, title }: { amount?: string; token?: Token; usd?: string; title?: string }) => {
  const _usd = useFormatNumberV2({ value: usd, decimalScale: 2 });
  const _amount = useFormatNumberV2({ value: amount });

  return (
    <StyledTokenDisplay className="twap-order-display-token-usd">
      <StyledTokenRight className="twap-order-display-token-right">
        <StyledText className="twap-order-display-token-title">{title}</StyledText>
        <StyledText className="twap-order-display-token-amount">
          {amount ? _amount : ""} {token?.symbol}
        </StyledText>
        {usd && <USD usd={_usd} />}
      </StyledTokenRight>
      <TokenLogo className="twap-order-display-token-usd-logo" logo={token?.logoUrl} />
    </StyledTokenDisplay>
  );
};

const USD = ({ usd, className = "" }: { usd?: string; className?: string }) => {
  const { Components } = useTwapContext().uiPreferences;

  if (Components?.USD) {
    return <Components.USD usd={usd} />;
  }
  return <StyledText className={`twap-order-display-token-usd ${className}`}>${usd}</StyledText>;
};


const SrcToken = ({ amount, token, usd }: { amount?: string; token?: Token; usd?: string }) => {
  return <TokenDisplay amount={amount} token={token} usd={usd} title="From" />;
};

const DstToken = ({ amount, token, usd }: { amount?: string; token?: Token; usd?: string }) => {
  return <TokenDisplay amount={amount} token={token} usd={usd} title="To" />;
};



const TokensContainer = ({ className = "", children }: { className?: string; children?: ReactNode }) => {
  return <StyledTokens className={`twap-order-display-tokens ${className}`}>{children}</StyledTokens>;
};


OrderDisplay.DetailsContainer = Details;
OrderDisplay.Tokens = TokensContainer;
OrderDisplay.SrcToken = SrcToken;
OrderDisplay.DstToken = DstToken;
OrderDisplay.Expiry = Expiry;
OrderDisplay.ChunkSize = ChunkSize;
OrderDisplay.MinDestAmount = MinDestAmount;
OrderDisplay.ChunksAmount = ChunksAmount;
OrderDisplay.Recipient = Recipient;
OrderDisplay.TradeInterval = TradeInterval;
OrderDisplay.DetailRow = DetailRow;
OrderDisplay.TxHash = TxHash;



const StyledLabel = styled(Label)({
  ".twap-label-text": {
    fontSize: 14,
  },
});

const StyledTokens = styled(StyledColumnFlex)({
  gap: 24,
});

const Container = styled(StyledColumnFlex)({
  gap: 0,
  ".twap-separator": {
    margin: "20px 0px",
  },
  ".twap-order-display-details": {
    gap: 8,
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


const StyledTokenRight = styled(StyledColumnFlex)({
  width: "auto",
  flex: 1,
  justifyContent: "space-between",
  gap: 4,
});
const StyledTokenDisplay = styled(StyledRowFlex)({
  alignItems: "center",
  gap: 4,
  ".twap-order-modal-token-title": {
    opacity: 0.7,
    fontSize: 14,
  },
  ".twap-order-modal-token-amount": {
    fontSize: 29,
    lineHeight: "30px",
    flex: 1,
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  ".twap-token-logo": {
    width: 36,
    height: 36,
  },
  ".twap-order-modal-token-usd": {
    opacity: 0.7,
    fontSize: 14,
  },
});
