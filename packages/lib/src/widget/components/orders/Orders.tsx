import React, { ReactNode } from "react";
import { HistoryOrderPreview } from "./HistoryOrderPreview";
import { OrderHistoryContextProvider, useOrderHistoryContext, useSelectedOrder } from "./context";
import { OrderHistoryList } from "./OrderHistoryList";
import { FaArrowRight } from "@react-icons/all-files/fa/FaArrowRight";
import { useMemo } from "react";
import { Spinner } from "../../../components/base";
import { useTwapContext } from "../../../context";
import { useGroupedByStatusOrders } from "../../../hooks/order-hooks";
import { Step, SwapFlow } from "@orbs-network/swap-ui";
import { useTransactionExplorerLink } from "../../../hooks/logic-hooks";

export const Orders = ({ className = "" }: { className?: string }) => {
  return (
    <OrderHistoryContextProvider>
      <OrderHistory />
      <OrdersButton className={className} />
    </OrderHistoryContextProvider>
  );
};

export const OrdersButton = ({ className = "" }: { className?: string }) => {
  const openOrders = useGroupedByStatusOrders().open;
  const { components } = useTwapContext();

  const { onOpen, isLoading } = useOrderHistoryContext();
  const text = useMemo(() => {
    if (isLoading) {
      return "Loading orders";
    }

    return `${openOrders?.length || 0} Open orders`;
  }, [openOrders, isLoading]);

  if (components.OrdersButton) {
    return <components.OrdersButton isLoading={isLoading} onClick={onOpen} openOrdersCount={openOrders?.length || 0} />;
  }

  return (
    <div className={`twap-orders__button ${className}`} onClick={onOpen}>
      {isLoading && <Spinner size={20} />}
      <span className="twap-orders__button-text">{text}</span>
      <FaArrowRight className="twap-orders__button-icon" />
    </div>
  );
};

const CancelOrderFlow = () => {
  const { cancelOrderTxHash, cancelOrderStatus } = useOrderHistoryContext();
  const { translations: t, useToken, components } = useTwapContext();
  const order = useSelectedOrder();
  const srcToken = useToken?.(order?.srcTokenAddress);
  const dstToken = useToken?.(order?.dstTokenAddress);

  const explorerUrl = useTransactionExplorerLink(cancelOrderTxHash);
  const currentStep = useMemo((): Step => {
    return {
      title: t.cancelOrderModalTitle.replace("{id}", order?.id?.toString() || ""),
      explorerUrl,
    };
  }, [cancelOrderTxHash, order?.id, t]);

  return (
    <SwapFlow
      className="twap-cancel-order-flow"
      swapStatus={cancelOrderStatus}
      totalSteps={1}
      currentStep={currentStep}
      currentStepIndex={0}
      inToken={srcToken}
      outToken={dstToken}
      components={{
        Failed: <SwapFlow.Failed link="https://www.orbs.com/dtwap-and-dlimit-faq" />,
        Success: <SwapFlow.Success title={t.orderCancelled} explorerUrl={explorerUrl} />,
        Main: <SwapFlow.Main />,
        SrcTokenLogo: components.TokenLogo && <components.TokenLogo token={srcToken} />,
        DstTokenLogo: components.TokenLogo && <components.TokenLogo token={dstToken} />,
      }}
    />
  );
};

const CustomModal = ({ children }: { children: ReactNode }) => {
  const OrderHistoryModal = useTwapContext().modals.OrderHistoryModal;
  const { isOpen, onClose, cancelOrderStatus } = useOrderHistoryContext();
  const { translations: t } = useTwapContext();

  return (
    <OrderHistoryModal isOpen={Boolean(isOpen)} onClose={onClose} title={!cancelOrderStatus ? t.orderHistory : ""}>
      {children}
    </OrderHistoryModal>
  );
};

const OrderHistory = ({ className = "" }: { className?: string }) => {
  const { selectedOrderId, cancelOrderStatus } = useOrderHistoryContext();

  return (
    <CustomModal>
      {cancelOrderStatus ? (
        <CancelOrderFlow />
      ) : (
        <div className={`twap-orders ${selectedOrderId !== undefined ? "twap-orders__show-selected" : ""} ${className}`}>
          <HistoryOrderPreview />
          <OrderHistoryList />
        </div>
      )}
    </CustomModal>
  );
};
