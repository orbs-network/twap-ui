import { Box, styled } from "@mui/system";
import { ReactNode } from "react";
import { useTwapTranslations } from "..";
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
    <Modal className={`twap-trade-info-modal ${className}`} open={open} handleClose={onClose} title={translations.confirmTx}>
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
      <Label tooltipText={isLimitOrder ? translations.confirmationLimitOrderTooltip : translations.confirmationMarketOrderTooltip}>{translations.orderType}</Label>
      <Text>{isLimitOrder ? translations.limitOrder : translations.marketOrder}</Text>
    </StyledRow>
  );
}

export function ConfirmationTradeSize() {
  const translations = useTwapTranslations();
  const uiTradeSize = store.useConfirmation().uiTradeSize;
  return (
    <StyledRow className="twap-trade-info-row">
      <Label tooltipText={translations.confirmationTradeSizeTooltip}>{translations.tradeSize}</Label>
      <Text>{uiTradeSize}</Text>
    </StyledRow>
  );
}

export function ConfirmationTotalTrades() {
  const { totalTrades } = store.useConfirmation();
  const translations = useTwapTranslations();

  return (
    <StyledRow className="twap-trade-info-row">
      <Label tooltipText={translations.totalTradesTooltip}>{translations.totalTrades}</Label>
      <Text>{totalTrades}</Text>
    </StyledRow>
  );
}

export function ConfirmationTradeInterval() {
  const { tradeIntervalUi } = store.useConfirmation();
  const translations = useTwapTranslations();

  return (
    <StyledRow className="twap-trade-info-row">
      <Label tooltipText={translations.tradeIntervalTootlip}>{translations.tradeInterval}</Label>
      <Text>{tradeIntervalUi}</Text>
    </StyledRow>
  );
}

export function ConfirmationMinimumReceived() {
  const { minAmountOutUi, isLimitOrder, srcTokenInfo } = store.useConfirmation();
  const translations = useTwapTranslations();
  return (
    <StyledRow className="twap-trade-info-row">
      <Label tooltipText={translations.confirmationMinReceivedPerTradeTooltip}>{translations.minReceivedPerTrade}:</Label>
      {isLimitOrder ? (
        <StyledMinumimReceived>
          <Text>
            <Tooltip text={minAmountOutUi}>
              <NumberDisplay value={minAmountOutUi} />
            </Tooltip>
          </Text>
          <TokenLogo logo={srcTokenInfo?.logoUrl} />
          <TokenName name={srcTokenInfo?.symbol} />
        </StyledMinumimReceived>
      ) : (
        <Text>{translations.none}</Text>
      )}
    </StyledRow>
  );
}

const StyledMinumimReceived = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 8,
  "& .twap-token-logo": {
    width: 25,
    height: 25,
  },
});

const StyledRow = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
});

export const TradeInfoExplanation = () => {
  const translations = useTwapTranslations();
  return (
    <>
      <Text>{translations.disclaimer1}</Text>
      <Text>{translations.disclaimer2}</Text>
      <Text>{translations.disclaimer3}</Text>
      <Text>{translations.disclaimer4}</Text>
      <Text>{translations.disclaimer5}</Text>
      <Text>
        {translations.disclaimer6}
        <a href="https://www.orbs.com/" target="_blank">
          {" "}
          {translations.link}
        </a>
        . {translations.disclaimer7}
        <a href="https://www.orbs.com/" target="_blank">
          {" "}
          {translations.link}
        </a>
        .
      </Text>
    </>
  );
};
