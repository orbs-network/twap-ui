import { CircularProgress, styled } from "@mui/material";
import { Status } from "@orbs-network/twap";
import { useMemo } from "react";
import { useGetToken, usePriceInvert } from "../../hooks";
import { Order } from "../../order";
import { StyledRowFlex, StyledText } from "../../styles";
import { CanceledIcon, CheckIcon } from "./icons";

export const useOrderExcecutionPrice = (order: Order) => {
  const srcToken = useGetToken(order.srcTokenAddress);
  const dstToken = useGetToken(order.dstTokenAddress);

  const price = useMemo(() => {
    if (!srcToken || !dstToken) return;
    return order.getExcecutionPrice(srcToken.decimals, dstToken.decimals);
  }, [order, srcToken, dstToken]);

  return {
    price,
    srcToken,
    dstToken,
  };
};

export const OrderStatus = ({ order }: { order: Order }) => {
  const icon = useMemo(() => {
    switch (order.status) {
      case Status.Canceled:
        return <CanceledIcon />;
      case Status.Completed:
        return <CheckIcon />;

      default:
        break;
    }
  }, [order.status]);

  return (
    <StyledStatus className={`twap-orders-status twap-orders-status-${order.status.toLowerCase()}`}>
      <StyledText>{order?.status}</StyledText>
      {icon}
    </StyledStatus>
  );
};

const StyledStatus = styled(StyledRowFlex)({
  gap: 4,
  width: "auto",
  svg: {
    width: 21,
    height: 21,
  },
});

export const OrderProgress = ({ order }: { order: Order }) => {
  const isOpenOrder = order.status === Status.Open;

  return (
    <StyledRowFlex className="twap-order-progress" style={{ width: "auto" }}>
      <StyledText className="twap-order-progress-text">{order?.progress.toFixed(0)}%</StyledText>
      {isOpenOrder && <CircularProgress thickness={8} variant="determinate" value={Number(order?.progress.toFixed(0) || "0")} className="twap-order-progress-spinner" />}
    </StyledRowFlex>
  );
};
