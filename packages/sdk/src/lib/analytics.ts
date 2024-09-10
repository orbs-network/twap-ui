import { v4 as uuidv4 } from "uuid";
import { Config } from "./types";
import BN from "bignumber.js";
const Version = 0.3;

const BI_ENDPOINT = `https://bi.orbs.network/putes/twap-ui-${Version}`;

type Action = "cancel order" | "create order" | "module-import";

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
  uiCrashedErrorMessage?: string;
  uiCrashedErrorStack?: string;
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

class Analytics {
  timeout: any = undefined;
  data: Data = {
    _id: uuidv4(),
  };

  constructor() {
    this.updateAndSend = this.updateAndSend.bind(this);
    this.reset = this.reset.bind(this);
    this.onCancelOrder = this.onCancelOrder.bind(this);
    this.onCancelOrderSuccess = this.onCancelOrderSuccess.bind(this);
    this.onCanelOrderError = this.onCanelOrderError.bind(this);
    this.onWrapSuccess = this.onWrapSuccess.bind(this);
    this.onApproveSuccess = this.onApproveSuccess.bind(this);
    this.onCreateOrderError = this.onCreateOrderError.bind(this);
    this.onTxError = this.onTxError.bind(this);
    this.onCreateOrderSuccess = this.onCreateOrderSuccess.bind(this);
    this.onSubmitOrder = this.onSubmitOrder.bind(this);
    this.onLoad = this.onLoad.bind(this);
    this.onCrash = this.onCrash.bind(this);
  }

  updateAndSend(values = {} as Partial<Data>) {
    this.data = {
      ...this.data,
      ...values,
    };

    if (process.env.NODE_ENV === "development") {
      return;
    }
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      sendBI(this.data);
    }, 1_000);
  }

  reset() {
    setTimeout(() => {
      this.data = {
        _id: uuidv4(),
        action: "module-import",
      };
    }, 1_000);
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

  onApproveSuccess(approvalTxHash?: string) {
    this.updateAndSend({
      approvalTxHash,
    });
  }

  onCreateOrderError(error: any) {
    this.onTxError(error);
    analytics.reset();
  }

  onTxError(error: any) {
    const actionError = error?.message?.toLowerCase() || error?.toLowerCase();
    this.updateAndSend({ actionError });
  }

  onCreateOrderSuccess(newOrderId: number, createOrderTxHash: string) {
    this.updateAndSend({
      newOrderId,
      createOrderTxHash,
    });
    this.reset();
  }

  onSubmitOrder(config: Config, askParams: any, account?: string) {
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
      walletAddress: account,
    });
  }

  onCrash(error: Error) {
    this.updateAndSend({
      uiCrashedErrorMessage: error.message,
      uiCrashedErrorStack: error.stack,
    });
  }

  onLoad() {
    this.updateAndSend({
      action: "module-import",
    });
  }
}

const analytics = new Analytics();

export const {
  onCancelOrderSuccess,
  onCancelOrder,
  onTxError,
  onApproveSuccess,
  onLoad,
  onWrapSuccess,
  onCanelOrderError,
  onCreateOrderError,
  onCreateOrderSuccess,
  onSubmitOrder,
  onCrash,
} = analytics;
