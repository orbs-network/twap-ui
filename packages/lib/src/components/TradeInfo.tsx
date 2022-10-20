import { Box, styled } from "@mui/system";
import { ReactNode } from "react";
import Label from "../base-components/Label";
import Modal from "../base-components/Modal";
import Text from "../base-components/Text";
import { store } from "../store/store";

export function TradeInfoModal({ onClose, open, children, className = "" }: { onClose: () => void; open: boolean; children: ReactNode; className?: string }) {
  return (
    <Modal className={`twap-trade-info-modal ${className}`} open={open} handleClose={onClose} title="Confirm Transaction">
      <StyledModalContent className="twap-order-confirmation">{children}</StyledModalContent>
    </Modal>
  );
}

const StyledModalContent = styled(Box)({});

export function Expiration() {
  const { maxDurationWithExtraMinuteUi } = store.useMaxDuration();
  return (
    <StyledRow className="twap-trade-info-row">
      <Label tooltipText="text">Expiration</Label>
      <Text>{maxDurationWithExtraMinuteUi}</Text>
    </StyledRow>
  );
}

export function TradeSize() {
  const { uiTradeSize } = store.useTradeSize();
  return (
    <StyledRow className="twap-trade-info-row">
      <Label tooltipText="text">Trade size</Label>
      <Text>{uiTradeSize}</Text>
    </StyledRow>
  );
}

export function TotalTrades() {
  const { totalTrades } = store.useTradeSize();
  return (
    <StyledRow className="twap-trade-info-row">
      <Label tooltipText="text">Total trades</Label>
      <Text>{totalTrades}</Text>
    </StyledRow>
  );
}

export function TradeInterval() {
  const { tradeIntervalUi } = store.useTradeInterval();
  return (
    <StyledRow className="twap-trade-info-row">
      <Label tooltipText="text">Trade interval</Label>
      <Text>{tradeIntervalUi}</Text>
    </StyledRow>
  );
}

export function MinimumReceived() {
  const { dstTokenUiAmount } = store.useDstToken();
  return (
    <StyledRow className="twap-trade-info-row">
      <Label tooltipText="text">Minimum Received Per Trade:</Label>
      <Text>{dstTokenUiAmount}</Text>
    </StyledRow>
  );
}

const StyledRow = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
});

export const TradeInfoDetails = () => {
  return (
    <>
      <Expiration />
      <TradeSize />
      <TotalTrades />
      <TradeInterval />
      <MinimumReceived />
    </>
  );
};

export const TradeInfoExplanation = () => {
  return (
    <>
      <Text>TWAP orders are executed in smaller trades over a specified period of time and are subject to market conditions and other risks.</Text>
      <Text>
        Your trade may be executed at a price that is significantly different from the current market price (although not below your limit price), which could result in significant
        losses. If the available market price is lower than the limit price you have set, some of the trades of your TWAP order may not be executed, resulting in a partially filled
        order.
      </Text>
      <Text>
        The TWAP trades are based on a decentralized TWAP protocol that utilizes off-chain takers which compete to fill orders. These takers are entitled to request a fee, which
        the protocol removes for the winning taker from the output tokens. Accordingly, the amount of output tokens you will receive may vary in accordance with taker behavior.
      </Text>
      <Text>Takers may take into account gas fees for your transactions when setting their fees, which may result in fluctuations in the fee amounts.</Text>
      <Text>
        Note that the protocol has been designed such that the presence of one honest taker (i.e, a taker who charges only reimbursement for gas fees) should result in an output
        amount that is as close as possible to spot market prices. QuickSwap and Orbs have implemented automated, decentralized “honest takers”, however, these features are in beta
        and their use are subject to risks.
      </Text>
      <Text>
        This TWAP order will be executed using that is in beta and its use is at your own risk. You can read more about the TWAP protocol here{" "}
        <a href="https://www.orbs.com/" target="_blank">
          {" "}
          link
        </a>
        . Use of this feature is subject to the terms and conditions set forth here
        <a href="https://www.orbs.com/" target="_blank">
          {" "}
          link
        </a>
        .
      </Text>
    </>
  );
};
