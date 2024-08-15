import { styled } from "styled-components";
import { ReactNode, useMemo } from "react";
import { useExplorerUrl, useFormatNumberV2, usemElipsisAddress } from "../hooks/hooks";
import { StyledColumnFlex, StyledRowFlex, StyledText } from "../styles";
import { Label, TokenLogo } from "./base";
import moment from "moment";
import { useTwapContext } from "../context/context";
import { fillDelayText } from "../utils";
import { Token } from "../types";
import { Tooltip } from "./Components";

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

  const _srcChunkAmount = useFormatNumberV2({ value: srcChunkAmount, decimalScale: 3 });
  return (
    <DetailRow title={translations.individualTradeSize} tooltip={translations.confirmationTradeSizeTooltip}>
      {`${_srcChunkAmount} ${srcToken?.symbol}`}
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
  const { translations } = useTwapContext();
  const formattedValue = useFormatNumberV2({ value: dstMinAmountOut });
  if (isMarketOrder) return null;

  return (
    <DetailRow title={totalChunks === 1 ? "Min. received" : translations.minReceivedPerTrade} tooltip={translations.confirmationMinDstAmountTootipLimit}>
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
  const { translations: t, account } = useTwapContext();
  const explorerUrl = useExplorerUrl();
  const makerAddress = usemElipsisAddress(account);

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
      <StyledLabel>
        <Label.Text
          text={
            <>
              {startLogo} {title}
            </>
          }
        />
        {tooltip && <Label.Info text={tooltip} />}
      </StyledLabel>
      <StyledDetailRowChildren className="twap-order-display-details-row-right">{children}</StyledDetailRowChildren>
    </StyledDetailRow>
  );
};

const TxHash = ({ txHash }: { txHash?: string }) => {
  const { translations: t } = useTwapContext();
  const txHashAddress = usemElipsisAddress(txHash);
  const explorerUrl = useExplorerUrl();

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

const Details = ({ className = "", children, onClick }: { className?: string; children?: ReactNode; onClick?: () => void }) => {
  return (
    <StyledDetails onClick={onClick} className={`twap-order-display-details ${className}`}>
      {children}
    </StyledDetails>
  );
};

export function OrderDisplay({ children, className = "" }: { children?: ReactNode; className?: string }) {
  return <Container className={`${className} twap-order-display`}>{children}</Container>;
}

const TokenDisplay = ({ amount, token, usd, title, content }: { amount?: string; token?: Token; usd?: string; title?: string; content?: ReactNode }) => {
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
        {content}
      </StyledTokenRight>
      <TokenLogo className="twap-order-display-token-usd-logo" logo={token?.logoUrl} />
    </StyledTokenDisplay>
  );
};

const USD = ({ usd, className = "" }: { usd?: string; className?: string }) => {
  const Components = useTwapContext().Components;

  if (Components?.USD) {
    return <Components.USD value={usd} />;
  }
  return <StyledSmallText className={`twap-order-display-token-usd ${className}`}>${usd}</StyledSmallText>;
};

const SrcToken = ({ amount, token, usd }: { amount?: string; token?: Token; usd?: string }) => {
  const isLimitPanel = useTwapContext().isLimitPanel;
  return <TokenDisplay amount={amount} token={token} usd={usd} title={isLimitPanel ? "From" : "Allocate"} />;
};

const DstToken = ({
  amount,
  token,
  usd,
  isMarketOrder,
  fillDelayMillis,
  chunks,
}: {
  amount?: string;
  token?: Token;
  usd?: string;
  isMarketOrder?: boolean;
  fillDelayMillis?: number;
  chunks?: number;
}) => {
  const t = useTwapContext().translations;

  const content = useMemo(() => {
    if (!isMarketOrder) return null;
    return (
      <StyledSmallText className="twap-small-text">
        Every {fillDelayText(fillDelayMillis, t).toLowerCase()} Over {chunks} Orders
      </StyledSmallText>
    );
  }, [chunks, isMarketOrder, fillDelayMillis, t]);

  return <TokenDisplay content={content} amount={!isMarketOrder ? amount : ""} token={token} usd={!isMarketOrder ? usd : ""} title={!isMarketOrder ? "To" : "Buy"} />;
};

const StyledSmallText = styled(StyledText)({
  fontSize: 14,
});

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
