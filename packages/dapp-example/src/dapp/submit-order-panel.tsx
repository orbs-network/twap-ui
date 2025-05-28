import { Widget, useFormatNumber, formatDecimals, fillDelayText, makeElipsisAddress, Token, Steps, SwapStatus } from "@orbs-network/twap-ui";
import { Flex, Typography, Button } from "antd";
import moment from "moment";
import { ArrowRight, CheckCircle } from "react-feather";
import { Popup } from "../Components";

const WrapState = ({ token }: { token?: Token }) => {
  return (
    <Flex vertical gap={10} align="center">
      <Typography>Wrap {token?.symbol}</Typography>
    </Flex>
  );
};

const ApproveState = ({ token }: { token?: Token }) => {
  return (
    <Flex vertical gap={10} align="center">
      <Typography>Approve {token?.symbol}</Typography>
    </Flex>
  );
};

const CreateState = () => {
  return (
    <Flex vertical gap={10} align="center">
      <Typography>Create Order</Typography>
    </Flex>
  );
};

const TradeReview = () => {
  const {
    srcToken,
    fee,
    onConfirm,
    loading,
    dstToken,
    srcAmount,
    dstAmount,
    srcUsd,
    dstUsd,
    price,
    orderDeadline,
    srcChunkAmount,
    chunks,
    destMinAmountOut,
    fillDelay,
    recipient,
  } = Widget.useSubmitOrderPanel();
  const priceF = useFormatNumber({ value: price });

  return (
    <Flex vertical gap={10} align="center">
      <Flex gap={10} align="flex-start">
        <Typography>
          {formatDecimals(srcAmount)} {srcToken?.symbol} {`$${formatDecimals(srcUsd, 2)}`}
        </Typography>
        <ArrowRight />
        <Typography>
          {formatDecimals(dstAmount)} {dstToken?.symbol} {`$${formatDecimals(dstUsd, 2)}`}
        </Typography>
      </Flex>

      <Flex vertical gap={10} align="center" style={{ width: "100%" }}>
        <Flex justify="space-between" style={{ width: "100%" }}>
          <Typography>Price</Typography>
          <Typography>
            1 {srcToken?.symbol} = {priceF} {dstToken?.symbol}{" "}
          </Typography>
        </Flex>

        <Flex justify="space-between" style={{ width: "100%" }}>
          <Typography>Expiry</Typography>
          <Typography>{moment(orderDeadline).format("DD/MM/YYYY HH:mm")}</Typography>
        </Flex>
        <Flex justify="space-between" style={{ width: "100%" }}>
          <Typography>Individual chunk size</Typography>
          <Typography>
            {formatDecimals(srcChunkAmount)} {srcToken?.symbol}
          </Typography>
        </Flex>
        <Flex justify="space-between" style={{ width: "100%" }}>
          <Typography>Total chunks</Typography>
          <Typography>{chunks}</Typography>
        </Flex>
        <Flex justify="space-between" style={{ width: "100%" }}>
          <Typography>Min. received per trade </Typography>
          <Typography>{formatDecimals(destMinAmountOut)}</Typography>
        </Flex>
        <Flex justify="space-between" style={{ width: "100%" }}>
          <Typography>Trade interval</Typography>
          <Typography>{fillDelayText(fillDelay)}</Typography>
        </Flex>
        <Flex justify="space-between" style={{ width: "100%" }}>
          <Typography>Recipient</Typography>
          <Typography>{makeElipsisAddress(recipient)}</Typography>
        </Flex>
        <Flex justify="space-between" style={{ width: "100%" }}>
          <Typography>Fee</Typography>
          <Typography>
            {formatDecimals(fee.amountUI)} {fee.percent ? `(${fee.percent}%)` : ""}
          </Typography>
        </Flex>
      </Flex>
      <Button type="primary" onClick={onConfirm} size="large" style={{ width: "100%" }} loading={loading}>
        Submit
      </Button>
    </Flex>
  );
};

const FailedState = () => {
  return (
    <Flex vertical gap={10} align="center">
      <Typography>Failed</Typography>
    </Flex>
  );
};

const SuccessState = () => {
  return (
    <Flex vertical gap={10} align="center">
      <CheckCircle color="green" size={50} />
      <Typography style={{ fontSize: 25 }}>Success</Typography>
    </Flex>
  );
};

const PopupContent = () => {
  const { srcToken, swapStatus, activeStep } = Widget.useSubmitOrderPanel();

  if (!swapStatus) {
    return <TradeReview />;
  }

  if (swapStatus === SwapStatus.FAILED) {
    return <FailedState />;
  }

  if (swapStatus === SwapStatus.SUCCESS) {
    return <SuccessState />;
  }

  if (activeStep === Steps.WRAP) {
    return <WrapState token={srcToken} />;
  }

  if (activeStep === Steps.APPROVE) {
    return <ApproveState token={srcToken} />;
  }

  if (activeStep === Steps.CREATE) {
    return <CreateState />;
  }
};

export const SubmitOrderPanel = () => {
  const { isOpen, onClose } = Widget.useSubmitOrderPanel();
  return (
    <Popup title="Submit Order" isOpen={!!isOpen} onClose={onClose}>
      <PopupContent />
    </Popup>
  );
};
