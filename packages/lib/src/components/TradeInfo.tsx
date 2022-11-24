import { Box, styled } from "@mui/system";
import { ReactNode } from "react";
import Label from "./Label";
import Modal from "./Modal";
import NumberDisplay from "./NumberDisplay";
import Text from "./Text";
import TokenLogo from "./TokenLogo";
import TokenName from "./TokenName";
import Tooltip from "./Tooltip";
import { useOrderOverview, useTwapTranslations } from "../hooks";

export function TradeInfoModal({ onClose, open, children, className = "" }: { onClose: () => void; open: boolean; children: ReactNode; className?: string }) {
  const translations = useTwapTranslations();
  return (
    <Modal className={`twap-trade-info-modal ${className}`} open={open} handleClose={onClose} title={translations.confirmTx} disableBackdropClick={true}>
      <StyledModalContent className="twap-order-confirmation">{children}</StyledModalContent>
    </Modal>
  );
}

const StyledModalContent = styled(Box)({});

export function ConfirmationExpiration() {
  const translations = useTwapTranslations();

  const deadline = useOrderOverview().deadline;
  return (
    <StyledRow className="twap-trade-info-row">
      <Label tooltipText={translations.confirmationDeadlineTooltip}>{translations.expiration}</Label>
      <Text>{deadline}</Text>
    </StyledRow>
  );
}

export function ConfirmationOrderType() {
  const isLimitOrder = useOrderOverview().isLimitOrder;
  const translations = useTwapTranslations();

  return (
    <StyledRow className="twap-trade-info-row">
      <Label tooltipText={translations.confirmationOrderType}>{translations.orderType}</Label>
      <Text>{isLimitOrder ? translations.limitOrder : translations.marketOrder}</Text>
    </StyledRow>
  );
}

export function ConfirmationTradeSize() {
  const translations = useTwapTranslations();
  const { srcChunkAmount, srcToken } = useOrderOverview();
  return (
    <StyledRow className="twap-trade-info-row">
      <Label tooltipText={translations.confirmationTradeSizeTooltip}>{translations.tradeSize}</Label>
      <StyledTradeSizeRight>
        <TokenName name={srcToken?.symbol} />
        <TokenLogo logo={srcToken?.logoUrl} />
        <Text>
          <Tooltip text={srcChunkAmount}>
            <NumberDisplay value={srcChunkAmount} />
          </Tooltip>
        </Text>
      </StyledTradeSizeRight>
    </StyledRow>
  );
}

export function ConfirmationTotalTrades() {
  const totalChunks = useOrderOverview().totalChunks;
  const translations = useTwapTranslations();

  return (
    <StyledRow className="twap-trade-info-row">
      <Label tooltipText={translations.confirmationTotalTradesTooltip}>{translations.totalTrades}</Label>
      <Text>{totalChunks}</Text>
    </StyledRow>
  );
}

export function ConfirmationTradeInterval() {
  const fillDelay = useOrderOverview().fillDelay;
  const translations = useTwapTranslations();

  return (
    <StyledRow className="twap-trade-info-row">
      <Label tooltipText={translations.confirmationtradeIntervalTooltip}>{translations.tradeInterval}</Label>
      <Text>{fillDelay}</Text>
    </StyledRow>
  );
}

export function ConfirmationMinimumReceived() {
  const { minAmountOut, isLimitOrder, dstToken } = useOrderOverview();
  const translations = useTwapTranslations();
  return (
    <StyledRow className="twap-trade-info-row">
      <Label tooltipText={isLimitOrder ? translations.confirmationMinDstAmountTootipLimit : translations.confirmationMinDstAmountTootipMarket}>
        {translations.minReceivedPerTrade}:
      </Label>

      <StyledMinumimReceived>
        <TokenName name={dstToken?.symbol} />
        <TokenLogo logo={dstToken?.logoUrl} />
        <Text>
          {isLimitOrder ? (
            <Tooltip text={minAmountOut}>
              <NumberDisplay value={minAmountOut} />
            </Tooltip>
          ) : (
            translations.none
          )}
        </Text>
      </StyledMinumimReceived>
    </StyledRow>
  );
}

const StyledMinumimReceived = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 8,
});

const StyledTradeSizeRight = styled(Box)({ display: "flex", alignItems: "center", gap: 10 });

const StyledRow = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  gap: 20,
  "& .twap-token-logo": {
    width: 22,
    height: 22,
  },
  "& .twap-token-name": {
    fontSize: 14,
  },
});

export const TradeInfoExplanation = () => {
  const translations = useTwapTranslations();
  return (
    <StyledTradeInfoExplanation>
      <Text>{translations.disclaimer1}</Text>
      <Text>{translations.disclaimer2}</Text>
      <Text>{translations.disclaimer3}</Text>
      <Text>{translations.disclaimer4}</Text>
      <Text>{translations.disclaimer5}</Text>

      <Text>
        {translations.disclaimer6}{" "}
        <a href="https://github.com/orbs-network/twap" target="_blank">
          {translations.link}
        </a>
        . {translations.disclaimer7}{" "}
        <a href="https://github.com/orbs-network/twap/blob/master/TOS.md" target="_blank">
          {translations.link}
        </a>
        .
      </Text>
    </StyledTradeInfoExplanation>
  );
};

const StyledTradeInfoExplanation = styled(Box)({
  maxHeight: 140,
  overflow: "auto",
  paddingRight: 30,
  display: "flex",
  flexDirection: "column",
  gap: 10,
});
