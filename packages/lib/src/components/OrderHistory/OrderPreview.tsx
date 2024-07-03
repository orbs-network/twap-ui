import { styled } from "@mui/material";
import { useParseOrderUi } from "../../hooks";
import { StyledColumnFlex } from "../../styles";
import { ParsedOrder } from "../../types";
import { OrderSummary } from "../OrderSummary/OrderSummary";

export function OrderPreview({ order: parsedOrder }: { order?: ParsedOrder }) {
  const o = useParseOrderUi(parsedOrder);

  if (!o) return null;

  return (
    <StyledOrderPreview>
      <OrderSummary
        fillDelayMillis={o.ui.fillDelay}
        chunks={o.ui.totalChunks}
        dstMinAmountOut={o.ui.dstMinAmountOutUi}
        isMarketOrder={o.ui.isMarketOrder}
        srcChunkAmount={o.ui.srcChunkAmountUi}
        deadline={o.ui.deadline}
        dstUsd={o.ui.dstUsdUi}
        srcUsd={o.ui.srcUsdUi}
        outAmount={o?.ui.dstAmount}
        srcAmount={o?.ui.srcAmountUi}
        srcToken={o?.ui.srcToken}
        dstToken={o?.ui.dstToken}
      >
        <OrderSummary.Tokens />
        <OrderSummary.Details />
      </OrderSummary>
    </StyledOrderPreview>
  );
}

const StyledOrderPreview = styled(StyledColumnFlex)({
  width: "100%",
});
