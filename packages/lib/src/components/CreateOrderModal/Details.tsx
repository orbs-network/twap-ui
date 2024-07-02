import { styled } from "@mui/material";
import { IoIosWarning } from "@react-icons/all-files/io/IoIosWarning";
import { ReactNode, useCallback, useMemo, useState } from "react";
import { makeElipsisAddress, useTwapContext } from "../..";
import {
  useAmountUi,
  useChunks,
  useDeadlineUi,
  useDstMinAmountOut,
  useDstUsd,
  useExplorerUrl,
  useFillDelayText,
  useFormatNumberV2,
  useInvertedPrice,
  useIsMarketOrder,
  useOutAmount,
  useSrcChunkAmountUi,
  useSrcUsd,
} from "../../hooks";
import { useTwapStore } from "../../store";
import { StyledColumnFlex, StyledRowFlex, StyledText } from "../../styles";
import { Label, Switch, Tooltip } from "../base";
import BN from "bignumber.js";
import { MarketPriceWarning } from "../Components";
export const Price = () => {
  const [inverted, setInverted] = useState(false);
  const srcUsd = useSrcUsd().value;
  const dstUsd = useDstUsd().value;
  const srcAmount = useTwapStore((s) => s.srcAmountUi);
  const outAmount = useOutAmount().outAmountUi;
  const { srcToken, dstToken } = useTwapStore((s) => ({
    srcToken: s.srcToken,
    dstToken: s.dstToken,
  }));

  const isMarketOrder = useIsMarketOrder();

  const toggle = useCallback(() => {
    setInverted((prev) => !prev);
  }, []);

  const amount = useMemo(() => {
    return BN(outAmount).dividedBy(srcAmount).toString();
  }, [srcAmount, outAmount]);

  const invertedAmount = useInvertedPrice(amount, inverted);
  const price = useFormatNumberV2({ value: invertedAmount, decimalScale: 2 });

  const leftToken = inverted ? dstToken : srcToken;
  const rightToken = inverted ? srcToken : dstToken;

  const usdAmount = useMemo(() => {
    return BN(!inverted ? dstUsd : srcUsd)
      .multipliedBy(invertedAmount)
      .toString();
  }, [invertedAmount, srcUsd, dstUsd]);

  const usd = useFormatNumberV2({ value: usdAmount, decimalScale: 2 });
  const title = isMarketOrder ? "Market Price" : "Limit Price";
  return (
    <DetailRow title={title}>
      <StyledPrice onClick={toggle}>
        1 {leftToken?.symbol} = {price} {rightToken?.symbol} <span>{`($${usd})`}</span>
      </StyledPrice>
    </DetailRow>
  );
};

const StyledPrice = styled(StyledText)({
  cursor: "pointer",
  fontSize: 13,
  span: {
    opacity: 0.6,
    fontSize: 12,
  },
});

export const Expiry = () => {
  const deadline = useDeadlineUi();
  const t = useTwapContext()?.translations;

  return (
    <DetailRow title={t.expiration} tooltip={t.confirmationDeadlineTooltip}>
      {deadline}
    </DetailRow>
  );
};

export const ChunkSize = () => {
  const value = useSrcChunkAmountUi();
  const translations = useTwapContext().translations;
  const srcToken = useTwapStore((s) => s.srcToken);
  return (
    <DetailRow title={translations.tradeSize} tooltip={translations.confirmationTradeSizeTooltip}>
      {`${value} ${srcToken?.symbol}`}
    </DetailRow>
  );
};

export const MinDestAmount = () => {
  const dstToken = useTwapStore((s) => s.dstToken);
  const isMarketOrder = useIsMarketOrder();
  const { translations } = useTwapContext();
  const dstMinAmountOut = useDstMinAmountOut();
  const dstMinAmountOutUi = useAmountUi(dstToken?.decimals, dstMinAmountOut);
  const formattedValue = useFormatNumberV2({ value: dstMinAmountOutUi });

  if (isMarketOrder) return null;

  return (
    <DetailRow title={translations.minReceivedPerTrade} tooltip={translations.confirmationMinDstAmountTootipLimit}>
      {`${formattedValue} ${dstToken?.symbol}`}
    </DetailRow>
  );
};

export const ChunksAmount = () => {
  const chunks = useFormatNumberV2({ value: useChunks(), decimalScale: 0 });
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

  const fillDelayText = useFillDelayText();

  return (
    <DetailRow title={t.tradeInterval} tooltip={t.confirmationtradeIntervalTooltip}>
      {fillDelayText}
    </DetailRow>
  );
};

const MarketWarning = () => {
  const isMarketOrder = useTwapStore((s) => s.isMarketOrder);

  if (!isMarketOrder) return null;

  return <StyledWarning className="twap-order-modal-market-warning" />;
};

export const TwapDetails = () => {
  return (
    <>
      <Price />
      <MarketWarning />
      <Expiry />
      <ChunksAmount />
      <ChunkSize />
      <MinDestAmount />
      <TradeInterval />
      <Recipient />
    </>
  );
};

export const LimitDetails = () => {
  return (
    <>
      <Price />
      <Expiry />
      <Recipient />
    </>
  );
};

export const Details = ({ className = "" }: { className?: string }) => {
  const { isLimitPanel } = useTwapContext();

  return <StyledDetails className={`twap-order-modal-details ${className}`}>{isLimitPanel ? <LimitDetails /> : <TwapDetails />}</StyledDetails>;
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
    <StyledDetailRow className={`${className} twap-order-modal-detail-row`}>
      <StyledLabel tooltipText={tooltip}>
        {startLogo} {title}
      </StyledLabel>
      <StyledDetailRowChildren className="twap-order-modal-detail-row-right">{children}</StyledDetailRowChildren>
    </StyledDetailRow>
  );
};

const StyledLabel = styled(Label)({
  ".twap-label-text": {
    fontSize: 14,
  },
});
const StyledWarning = styled(MarketPriceWarning)({
  justifyContent: "flex-start",
  background: "rgb(27, 27, 27)",
  padding: 8,
  borderRadius: 12,

  ".twap-warning-message": {
    gap: 5,
    fontSize: 14,
  },
  ".twap-warning-message-icon": {
    width: 15,
    height: 15,
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

export const AcceptDisclaimer = ({ className }: { className?: string }) => {
  const { translations: t, uiPreferences } = useTwapContext();

  const { setDisclaimerAccepted, disclaimerAccepted } = useTwapStore((store) => ({
    setDisclaimerAccepted: store.setDisclaimerAccepted,
    disclaimerAccepted: store.disclaimerAccepted,
  }));

  return (
    <DetailRow
      className={`twap-order-modal-disclaimer ${className}`}
      title={
        <>
          {`${t.accept} `}
          <a href="/" target="_blank">
            {t.disclaimer}
          </a>
        </>
      }
    >
      <Switch variant={uiPreferences.switchVariant} value={disclaimerAccepted} onChange={() => setDisclaimerAccepted(!disclaimerAccepted)} />
    </DetailRow>
  );
};
