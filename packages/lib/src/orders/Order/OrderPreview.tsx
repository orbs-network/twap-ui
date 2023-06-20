import { LinearProgress } from "@mui/material";
import { Box, styled } from "@mui/system";
import { Components, OrderUI, Styles as TwapStyles, useOrdersContext } from "../..";
import { StyledText } from "../../styles";
import { OrderTokenDisplay } from "./Components";
import { HiOutlineArrowLongRight } from "react-icons/hi2";
import { FiChevronDown } from "react-icons/fi";
import { useOrderPastEvents } from "../../hooks";

function OrderPreview({ order, expanded }: { order: OrderUI; expanded: boolean }) {
  const { data, isLoading: _isLoading } = useOrderPastEvents(order, expanded);

  const isLoading = _isLoading && expanded;

  const translations = useOrdersContext().translations;
  return (
    <TwapStyles.StyledColumnFlex gap={0} className="twap-order-preview">
      <StyledHeader className="twap-order-preview-header">
        <TwapStyles.StyledRowFlex className="twap-order-preview-info" gap={6} justifyContent="flex-start" style={{ width: "auto" }}>
          <StyledHeaderText>#{order.order.id}</StyledHeaderText>
          <StyledHeaderText>{order.ui.isMarketOrder ? translations.marketOrder : translations.limitOrder}</StyledHeaderText>
        </TwapStyles.StyledRowFlex>
        <StyledHeaderText className="twap-order-preview-date">{order.ui.createdAtUi}</StyledHeaderText>
      </StyledHeader>
      <Components.Base.Tooltip
        childrenStyles={{ width: "100%" }}
        placement="top"
        text={
          <Box>
            <Components.Base.NumberDisplay value={order.ui.srcFilledAmountUi} />
            {" " + order.ui.srcToken?.symbol + " "}
            (<Components.Base.NumberDisplay hideTooltip value={order.ui.progress || 0} decimalScale={1} suffix="%" />)
          </Box>
        }
      >
        <StyledPreviewLinearProgress variant="determinate" value={order.ui.progress || 1} className="twap-order-progress twap-order-preview-progress" />
      </Components.Base.Tooltip>
      <TwapStyles.StyledRowFlex style={{ paddingTop: 18, paddingRight: 10, alignItems: "flex-start" }} className="twap-order-preview-tokens" justifyContent="space-between">
        <OrderTokenDisplay usdPrefix="=" token={order.ui.srcToken} amount={order.ui.srcAmountUi} usdValue={order.ui.srcAmountUsdUi} />
        <Components.Base.Icon className="twap-order-preview-icon" icon={<HiOutlineArrowLongRight style={{ width: 30, height: 30 }} />} />
        <OrderTokenDisplay
          isLoading={isLoading}
          token={order.ui.dstToken}
          prefix={order.ui.prefix}
          amount={'2345345345345'}
          usdValue={data?.dstAmountOutUsdPrice || ""}
          icon={<FiChevronDown />}
        />
      </TwapStyles.StyledRowFlex>
    </TwapStyles.StyledColumnFlex>
  );
}

export default OrderPreview;

export const StyledPreviewLinearProgress = styled(LinearProgress)({
  height: 5,
  marginLeft: "auto",
  marginRight: "auto",
  width: "100%",
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
    transition: "0.2s all",
  },
});

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
