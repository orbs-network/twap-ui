import { LinearProgress } from "@mui/material";
import { styled } from "@mui/system";
import { OrderUI, Styles as TwapStyles, useOrdersContext } from "../..";
import { StyledText } from "../../styles";
import { OrderTokenDisplay, StyledSeperator } from "./Components";
import { HiOutlineArrowLongRight } from "react-icons/hi2";
import { Icon } from "../../components";
function OrderPreview({ order, expanded }: { order: OrderUI; expanded: boolean }) {
  const translations = useOrdersContext().translations;
  return (
    <TwapStyles.StyledColumnFlex gap={0} className="twap-order-preview">
      <StyledHeader className="twap-order-preview-header">
        <TwapStyles.StyledRowFlex gap={6} justifyContent="flex-start" style={{ width: "auto" }}>
          <StyledHeaderText>#{order.order.id}</StyledHeaderText>
          <StyledHeaderText>{order.ui.isMarketOrder ? translations.marketOrder : translations.limitOrder}</StyledHeaderText>
        </TwapStyles.StyledRowFlex>
        <StyledHeaderText>{order.ui.createdAtUi}</StyledHeaderText>
      </StyledHeader>

      <StyledPreviewLinearProgress opacity={expanded ? 0 : 1} variant="determinate" value={order.ui.progress || 1} className="twap-order-progress twap-order-preview-progress" />
      <TwapStyles.StyledRowFlex style={{ paddingTop: 18, paddingRight: 10, alignItems: "flex-start" }} className="twap-order-preview-tokens" justifyContent="space-between">
        <OrderTokenDisplay usdPrefix="=" token={order.ui.srcToken} amount={order.ui.srcAmountUi} usdValue={order.ui.srcAmountUsdUi} />
        <Icon className="twap-order-preview-icon" icon={<HiOutlineArrowLongRight style={{ width: 30, height: 30 }} />} />
        <OrderTokenDisplay token={order.ui.dstToken} prefix={order.ui.prefix} amount={order.ui.dstAmountUi} usdValue={order.ui.dstAmountUsdUi} />
      </TwapStyles.StyledRowFlex>
    </TwapStyles.StyledColumnFlex>
  );
}

export default OrderPreview;


export const StyledPreviewLinearProgress = styled(LinearProgress)(({ opacity }: { opacity: number }) => ({
  height: 5,
  marginLeft: "auto",
  marginRight: "auto",
  width: "100%",
  borderRadius: 50,
  background: "transparent",

  "&::after": {
    position: "absolute",
    top: "50%",
    left: 0,
    height: 1,
    content: '""',
    width: "100%",
    background: "#373E55",
  },
  "& .MuiLinearProgress-bar": {
    height: 5,
    zIndex: 1,
    borderRadius: 50,
    opacity: opacity,
    transition: "0.2s all",
  },
}));

const StyledHeader = styled(TwapStyles.StyledRowFlex)({
  justifyContent: "space-between",
  fontSize: 13,
  fontWeight: 300,
  marginBottom: 12,
});

const StyledHeaderText = styled(StyledText)({
  fontSize: "inherit",
  fontWeight: "inherit",
  color: "#9CA3AF",
});
