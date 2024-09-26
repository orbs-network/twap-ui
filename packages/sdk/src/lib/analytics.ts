import { v4 as uuidv4 } from "uuid";
import { Config } from "./types";
import BN from "bignumber.js";
const Version = 0.4;

const BI_ENDPOINT = `https://bi.orbs.network/putes/twap-ui-${Version}`;

type Action = "cancel order" | "wrap" | "approve" | "create order" | "module-import";

interface Data {
  _id: string;
  actionError?: string;
  newOrderId?: number;
  cancelOrderSuccess?: boolean;
  cancelOrderId?: number;
  action?: Action;
  createOrderTxHash?: string;
  wrapTxHash?: string;
  approvalTxHash?: string;
  walletAddress?: string;
  fromTokenAddress?: string;
  toTokenAddress?: string;
  fromTokenAmount?: string;
  chunksAmount?: number;
  minDstAmountOut?: string;
  deadline?: number;
  fillDelay?: number;
  srcChunkAmount?: string;
  bidDelaySeconds?: number;
  chainId?: number;
  chainName?: string;
  exchangeAddress?: string;
  exchangeType?: string;
  lensAddress?: string;
  name?: string;
  partner?: string;
  twapAddress?: string;
  twapVersion?: number;
}

const sendBI = async (data: Partial<Data>) => {
  try {
    await fetch(BI_ENDPOINT, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }).then();
  } catch (error) {
    console.error("Failed to send BI", error);
  }
};

export class Analytics {
  timeout: any = undefined;
  data: Data = {
    _id: uuidv4(),
  };

  updateAndSend(values = {} as Partial<Data>, noTimeout = false) {
    this.data = {
      ...this.data,
      ...values,
    };
    if (noTimeout) {
      sendBI(this.data);
    } else {
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        sendBI(this.data);
      }, 1_000);
    }
  }

  onCancelOrder(orderId: number) {
    this.updateAndSend({
      cancelOrderId: orderId,
      action: "cancel order",
    });
  }

  onCancelOrderSuccess() {
    this.updateAndSend({
      cancelOrderSuccess: true,
    });
  }

  onCanelOrderError(error: any) {
    this.onTxError(error);
  }

  onWrapSuccess(wrapTxHash?: string) {
    this.updateAndSend({
      wrapTxHash,
    });
  }

  onWrapRequest() {
    this.updateAndSend({
      action: "wrap",
    });
  }

  onWrapError(error: any) {
    this.onTxError(error);
  }

  onApproveRequest() {
    this.updateAndSend({
      action: "approve",
    });
  }

  onApproveSuccess(approvalTxHash?: string) {
    this.updateAndSend({
      approvalTxHash,
    });
  }

  onApproveError(error: any) {
    this.onTxError(error);
  }

  onCreateOrderError(error: any) {
    this.onTxError(error);
  }

  onTxError(error: any) {
    const actionError = error?.message?.toLowerCase() || error?.toLowerCase();
    this.updateAndSend({ actionError });
  }

  onCreateOrderRequest(askParams: any, account?: string) {
    const values = askParams;
    const fromTokenAmount = values[3];
    const srcChunkAmount = values[4];
    const chunksAmount = BN(fromTokenAmount).div(srcChunkAmount).integerValue(BN.ROUND_FLOOR).toNumber();

    this.updateAndSend({
      fromTokenAddress: values[1],
      toTokenAddress: values[2],
      fromTokenAmount: values[3],
      chunksAmount,
      minDstAmountOut: values[5],
      deadline: values[6],
      fillDelay: values[8],
      srcChunkAmount,
      action: "create order",
      walletAddress: account,
    });
  }

  onConfigChange(config: Config) {
    this.updateAndSend({
      bidDelaySeconds: config?.bidDelaySeconds,
      chainId: config?.chainId,
      chainName: config?.chainName,
      exchangeAddress: config?.exchangeAddress,
      exchangeType: config?.exchangeType,
      lensAddress: config?.lensAddress,
      name: config?.name,
      partner: config?.partner,
      twapAddress: config?.twapAddress,
      twapVersion: config?.twapVersion,
    });
  }

  onCreateOrderSuccess(createOrderTxHash?: string, newOrderId?: number) {
    this.updateAndSend(
      {
        newOrderId,
        createOrderTxHash,
      },
      true
    );

    this.data = {
      _id: uuidv4(),
      action: "module-import",
    };
  }

  onLoad() {
    this.updateAndSend(
      {
        action: "module-import",
      },
      true
    );
  }
}
