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
  useSrcChunkAmountUi,
  useSrcUsd,
} from "../../hooks";
import { useTwapStore } from "../../store";
import { StyledColumnFlex, StyledRowFlex, StyledText } from "../../styles";
import { Label, Switch, Tooltip } from "../base";
export const Price = () => {
  const [inverted, setInverted] = useState(false);
  const srcUsd = useSrcUsd().value;
  const dstUsd = useDstUsd().value;

  const { srcToken, dstToken } = useTwapStore((s) => ({
    srcToken: s.srcToken,
    dstToken: s.dstToken,
  }));

  const isMarketOrder = useIsMarketOrder();

  const toggle = useCallback(() => {
    setInverted((prev) => !prev);
  }, []);

  const amount = useMemo(() => {
    const res = srcUsd.dividedBy(dstUsd);

    return res.toString();
  }, [srcUsd.toString(), dstUsd.toString()]);

  const price = useFormatNumberV2({ value: useInvertedPrice(amount, inverted), decimalScale: 2 });

  const leftToken = inverted ? dstToken : srcToken;
  const rightToken = inverted ? srcToken : dstToken;

  const usd = useFormatNumberV2({ value: inverted ? dstUsd.toString() : srcUsd.toString(), decimalScale: 2 });
  const title = isMarketOrder ? "Market Price" : "Limit Price";
  return (
    <DetailRow title={title} tooltip="">
      <StyledPrice onClick={toggle}>
        1 {leftToken?.symbol} = {price} {rightToken?.symbol} <span>{`($${usd})`}</span>
      </StyledPrice>
    </DetailRow>
  );
};

const StyledPrice = styled(StyledText)({
  cursor: "pointer",
  span: {
    opacity: 0.6,
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

const MarketPriceWarning = () => {
  const isMarketOrder = useTwapStore((s) => s.isMarketOrder);

  if (!isMarketOrder) return null;

  return (
    <StyledWarning className="twap-order-modal-market-warning">
      <Label tooltipText="some text">
        <IoIosWarning className="twap-order-modal-market-warning-logo" />
        Price may change
      </Label>
    </StyledWarning>
  );
};

export const TwapDetails = () => {
  return (
    <>
      <Price />
      <MarketPriceWarning />
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
    <StyledDetailRow className={className}>
      <StyledLabel tooltipText={tooltip}>
        {startLogo} {title}
      </StyledLabel>
      <StyledDetailRowChildren>{children}</StyledDetailRowChildren>
    </StyledDetailRow>
  );
};

const StyledLabel = styled(Label)({
  ".twap-label-text": {
    fontSize: 14,
  },
});
const StyledWarning = styled(StyledRowFlex)({
  justifyContent: "flex-start",
  background: "rgb(27, 27, 27)",
  padding: 8,
  borderRadius: 12,
  ".twap-label-text": {
    fontSize: 14,
  },
  ".twap-order-modal-market-warning-logo": {
    top: 3,
    position: "relative",
    marginRight: 5,
    color: "rgb(255, 95, 82)!important",
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
