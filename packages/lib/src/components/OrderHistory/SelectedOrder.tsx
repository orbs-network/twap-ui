import { Fade, styled } from "@mui/material";
import { useTwapContext } from "../../context/context";
import { useCancelOrder } from "../../hooks/useTransactions";
import { StyledColumnFlex, StyledRowFlex, StyledText } from "../../styles";
import { Button } from "../base";
import { Separator } from "../Components";
import { Status } from "@orbs-network/twap";
import { useOrderHistoryContext } from "./context";
import { useFormatNumberV2, useInvertedPrice } from "../../hooks/hooks";
import { useOrderById } from "../../hooks/orders";
import { OrderUI, Token } from "../../types";
import { OrderDisplay } from "../OrderDisplay";
import MuiAccordion from "@mui/material/Accordion";
import MuiAccordionSummary from "@mui/material/AccordionSummary";
import MuiAccordionDetails from "@mui/material/AccordionDetails";
import { ReactNode, useEffect, useState } from "react";
import { IoIosArrowDown } from "@react-icons/all-files/io/IoIosArrowDown";
import BN from "bignumber.js";
export const SelectedOrder = ({ selectedOrderId }: { selectedOrderId?: number }) => {
  const order = useOrderById(selectedOrderId);
  const [expanded, setExpanded] = useState<string | false>("panel1");

  useEffect(() => {
    setExpanded("panel1");
  }, [selectedOrderId]);

  const handleChange = (panel: string) => {
    setExpanded(expanded === panel ? false : panel);
  };

  if (!order) return null;

  return (
    <Fade in={true}>
      <Container className="twap-orders-selected-order">
        <OrderDisplay>
          <OrderDisplay.Tokens>
            <OrderDisplay.SrcToken token={order.srcToken} />
            <OrderDisplay.DstToken token={order.dstToken} />
          </OrderDisplay.Tokens>
          <Separator />
          <StyledColumnFlex>
            <AccordionContainer title="Excecution summary" handleChange={() => handleChange("panel1")} expanded={expanded === "panel1"}>
              <ExcecutionSummary order={order} />
            </AccordionContainer>
            <AccordionContainer title="Order info" expanded={expanded === "panel2"} handleChange={() => handleChange("panel2")}>
              <OrderInfo order={order} />
            </AccordionContainer>
          </StyledColumnFlex>

          <CancelOrderButton order={order} />
        </OrderDisplay>
      </Container>
    </Fade>
  );
};

const AccordionContainer = ({ expanded, handleChange, children, title }: { expanded: boolean; handleChange: () => void; children: ReactNode; title: string }) => {
  return (
    <OrderDisplay.DetailsContainer>
      <StyledAccordion expanded={expanded} onChange={handleChange}>
        <MuiAccordionSummary>
          <StyledText>{title}</StyledText>
          <IoIosArrowDown style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }} />
        </MuiAccordionSummary>
        <MuiAccordionDetails>{children}</MuiAccordionDetails>
      </StyledAccordion>
    </OrderDisplay.DetailsContainer>
  );
};

const OrderInfo = ({ order }: { order: OrderUI }) => {
  return (
    <>
      <LimitPrice order={order} />
      <CreatedAt order={order} />
      <OrderDisplay.Expiry deadline={order?.deadline} />
      <AmountIn order={order} />
      <OrderDisplay.ChunkSize srcChunkAmount={order?.srcChunkAmountUi} srcToken={order?.srcToken} />
      <OrderDisplay.ChunksAmount chunks={order?.totalChunks} />
      <OrderDisplay.MinDestAmount dstToken={order?.dstToken} isMarketOrder={order?.isMarketOrder} dstMinAmountOut={order?.dstMinAmountOutUi} />
      <OrderDisplay.TradeInterval fillDelayMillis={order?.fillDelay} />
      <OrderDisplay.Recipient />
      <OrderDisplay.TxHash txHash={order?.txHash} />
    </>
  );
};

const ExcecutionSummary = ({ order }: { order: OrderUI }) => {
  return (
    <>
      <OrderStatus order={order} />
      <AmountInFilled order={order} />
      <AmountOutFilled order={order} />
      <Progress order={order} />
      <AvgExcecutionPrice order={order} />
    </>
  );
};

const Container = styled(StyledColumnFlex)({});

export const CancelOrderButton = ({ order }: { order: OrderUI }) => {
  const { isLoading, mutate: cancel } = useCancelOrder();
  const translations = useTwapContext().translations;

  if (!order || order.status !== Status.Open) return null;

  return (
    <StyledCancelOrderButton
      loading={isLoading}
      onClick={() => {
        cancel(order.id);
      }}
      className="twap-cancel-order"
    >
      {translations.cancelOrder}
    </StyledCancelOrderButton>
  );
};

const StyledCancelOrderButton = styled(Button)({
  marginTop: 20,
});

const CreatedAt = ({ order }: { order: OrderUI }) => {
  return (
    <OrderDisplay.DetailRow title="Created At">
      <StyledText>{order?.createdAtUi}</StyledText>
    </OrderDisplay.DetailRow>
  );
};

const AmountOutFilled = ({ order }: { order: OrderUI }) => {
  const amount = useFormatNumberV2({ value: order?.dstAmount, decimalScale: 3 });

  return (
    <OrderDisplay.DetailRow title="Amount received">
      <StyledText>
        {amount || 0} {order?.dstToken.symbol}
      </StyledText>
    </OrderDisplay.DetailRow>
  );
};

const AmountIn = ({ order }: { order: OrderUI }) => {
  const amount = useFormatNumberV2({ value: order?.srcAmountUi, decimalScale: 3 });

  return (
    <OrderDisplay.DetailRow title="Amount out">
      <StyledText>
        {amount || 0} {order?.srcToken.symbol}
      </StyledText>
    </OrderDisplay.DetailRow>
  );
};

const AmountInFilled = ({ order }: { order: OrderUI }) => {
  const amount = useFormatNumberV2({ value: order?.srcFilledAmountUi, decimalScale: 3 });

  return (
    <OrderDisplay.DetailRow title="Amount sent">
      <StyledText>
        {amount || 0} {order?.srcToken.symbol}
      </StyledText>
    </OrderDisplay.DetailRow>
  );
};
const OrderStatus = ({ order }: { order: OrderUI }) => {
  const t = useTwapContext().translations;

  const text = !order ? "" : t[order.status as keyof typeof t];

  return (
    <OrderDisplay.DetailRow title="Status">
      <StyledText>{text}</StyledText>
    </OrderDisplay.DetailRow>
  );
};

const Progress = ({ order }: { order: OrderUI }) => {
  const progress = useFormatNumberV2({ value: order?.progress, decimalScale: 2 });

  return (
    <OrderDisplay.DetailRow title="Progress">
      <StyledText>{progress || 0}%</StyledText>
    </OrderDisplay.DetailRow>
  );
};

const LimitPrice = ({ order }: { order: OrderUI }) => {
  if (order?.isMarketOrder) return null;
  return <Price title="LimitPrice" price={order?.limitPrice} srcToken={order?.srcToken} dstToken={order?.dstToken} />;
};

const AvgExcecutionPrice = ({ order }: { order: OrderUI }) => {
  const t = useTwapContext().translations;
  return <Price title={t.AverageExecutionPrice} price={order?.excecutionPrice} srcToken={order?.srcToken} dstToken={order?.dstToken} />;
};

const Price = ({ price, srcToken, dstToken, title }: { price?: string; srcToken?: Token; dstToken?: Token; title: string }) => {
  const _price = useFormatNumberV2({ value: price, decimalScale: 3 });
  return (
    <OrderDisplay.DetailRow title={title}>
      {BN(price || 0).isZero() ? (
        <StyledText>-</StyledText>
      ) : (
        <StyledText>
          1 {srcToken?.symbol} = {_price} {dstToken?.symbol}
        </StyledText>
      )}
    </OrderDisplay.DetailRow>
  );
};

const StyledAccordion = styled(MuiAccordion)({
  backgroundColor: "transparent",
  backgroundImage: "unset",
  boxShadow: "unset",
  width: "100%",
  ".MuiAccordionSummary-root": {
    minHeight: "unset!important",
    padding: 0,
  },
  ".MuiAccordionSummary-content": {
    margin: "0px!important",
    fontSize: "14px",
    fontWeight: "500",
    opacity: 0.7,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    svg: {
      width: 16,
      height: 16,
      transition: "0.2s all",
    },
  },

  ".MuiAccordionDetails-root": {
    padding: 0,
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    paddingTop: 10,
  },
});
