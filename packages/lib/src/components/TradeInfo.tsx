import { Box, styled } from "@mui/system";
import { ReactNode } from "react";
import { useTwapTranslations } from "../context";
import Label from "../base-components/Label";
import Modal from "../base-components/Modal";
import NumberDisplay from "../base-components/NumberDisplay";
import Text from "../base-components/Text";
import TokenLogo from "../base-components/TokenLogo";
import TokenName from "../base-components/TokenName";
import Tooltip from "../base-components/Tooltip";
import { store } from "../store/store";

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

  const deadlineUi = store.useConfirmation().deadlineUi;
  return (
    <StyledRow className="twap-trade-info-row">
      <Label tooltipText={translations.confirmationDeadlineTooltip}>{translations.expiration}</Label>
      <Text>{deadlineUi}</Text>
    </StyledRow>
  );
}

export function ConfirmationOrderType() {
  const isLimitOrder = store.useConfirmation().isLimitOrder;
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
  const { uiTradeSize, srcTokenInfo } = store.useConfirmation();
  return (
    <StyledRow className="twap-trade-info-row">
      <Label tooltipText={translations.confirmationTradeSizeTooltip}>{translations.tradeSize}</Label>
      <StyledTradeSizeRight>
        <TokenName name={srcTokenInfo?.symbol} />
        <TokenLogo logo={srcTokenInfo?.logoUrl} />
        <Text>
          <Tooltip text={uiTradeSize}>
            <NumberDisplay value={uiTradeSize} decimalScale={3} />
          </Tooltip>
        </Text>
      </StyledTradeSizeRight>
    </StyledRow>
  );
}

export function ConfirmationTotalTrades() {
  const { totalTrades } = store.useConfirmation();
  const translations = useTwapTranslations();

  return (
    <StyledRow className="twap-trade-info-row">
      <Label tooltipText={translations.confirmationTotalTradesTooltip}>{translations.totalTrades}</Label>
      <Text>{totalTrades}</Text>
    </StyledRow>
  );
}

export function ConfirmationTradeInterval() {
  const { tradeIntervalUi } = store.useConfirmation();
  const translations = useTwapTranslations();

  return (
    <StyledRow className="twap-trade-info-row">
      <Label tooltipText={translations.confirmationtradeIntervalTooltip}>{translations.tradeInterval}</Label>
      <Text>{tradeIntervalUi}</Text>
    </StyledRow>
  );
}

export function ConfirmationMinimumReceived() {
  const { minAmountOutUi, isLimitOrder, dstTokenInfo } = store.useConfirmation();
  const translations = useTwapTranslations();
  return (
    <StyledRow className="twap-trade-info-row">
      <Label tooltipText={isLimitOrder ? translations.confirmationMinDstAmountTootipLimit : translations.confirmationMinDstAmountTootipMarket}>
        {translations.minReceivedPerTrade}:
      </Label>

      <StyledMinumimReceived>
        <TokenName name={dstTokenInfo?.symbol} />
        <TokenLogo logo={dstTokenInfo?.logoUrl} />
        <Text>
          {isLimitOrder ? (
            <Tooltip text={minAmountOutUi}>
              <NumberDisplay value={minAmountOutUi} decimalScale={3} />
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
