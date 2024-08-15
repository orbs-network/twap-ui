import { v4 as uuidv4 } from "uuid";
import { Config } from "./types";

const Version = 0.2;

const BI_ENDPOINT = `https://bi.orbs.network/putes/twap-ui-${Version}`;

type Action = "cancel" | "create" | "wrap-only" | "wrap" | "unwrap" | "approve";

interface LibConfig {
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

interface SubmitOrderArgs {
  fromTokenAddress?: string;
  toTokenAddress?: string;
  fromTokenSymbol?: string;
  toTokenSymbol?: string;
  fromTokenAmount?: string;
  fromTokenAmountUi?: string;
  toTokenAmount?: string;
  toTokenAmountUi?: string;
  chunksAmount?: number;
  minDstAmountOut?: string;
  minDstAmountOutUi?: string;
  deadline?: number;
  deadlineUi?: string;
  fillDelay?: number;
  fillDelayUi?: string;
  srcChunkAmount?: string;
  srcChunkAmountUi?: string;
}

interface Data extends SubmitOrderArgs, LibConfig {
  _id: string;
  uiCrashedErrorMessage?: string;
  uiCrashedErrorStack?: string;
  actionError?: string;
  newOrderId?: number;
  pageLoaded?: boolean;
  moduleImported?: boolean;
  cancelOrderSuccess?: boolean;
  cancelOrderId?: number;
  action?: Action;
  createOrderTxHash?: string;
  failedAction?: Action;
  wrapTxHash?: string;
  unwrapTxHash?: string;
  approvalTxHash?: string;
  walletAddress?: string;
  walletConnectName?: string;
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
        pageLoaded: true,
        moduleImported: true,
      };
    }, 1_000);
  }

  onLibInit(config?: Config, account?: string) {
    if (!config || !account) return;

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
      walletAddress: account,
      pageLoaded: true,
    });
  }

  onCancelOrder(cancelOrderId: number) {
    this.updateAndSend({ cancelOrderId });
  }

  onCancelOrderSuccess() {
    this.updateAndSend({ cancelOrderSuccess: true });
  }

  onSubmitOrder(swapData: any) {
    this.updateAndSend({
      fromTokenAddress: swapData.srcToken?.address,
      toTokenAddress: swapData.dstToken?.address,
      fromTokenSymbol: swapData.srcToken?.symbol,
      toTokenSymbol: swapData.dstToken?.symbol,
      fromTokenAmount: swapData.srcAmount.amount,
      fromTokenAmountUi: swapData.srcAmount.amountUi,
      toTokenAmount: swapData.outAmount.amount,
      toTokenAmountUi: swapData.outAmount.amountUi,
      chunksAmount: swapData.chunks,
      minDstAmountOut: swapData.dstMinAmount.amount,
      minDstAmountOutUi: swapData.dstMinAmount.amountUi,
      fillDelay: swapData.fillDelay.millis,
      fillDelayUi: swapData.fillDelay.text,
      deadline: swapData.deadline.millis,
      deadlineUi: swapData.deadline.text,
      srcChunkAmount: swapData.srcChunkAmount.amount,
      srcChunkAmountUi: swapData.srcChunkAmount.amountUi,
      action: "create",
    });
  }

  updateAction(action: Action) {
    this.updateAndSend({
      action,
    });
  }

  onTxError(error: any, failedAction: Action) {
    const actionError = error?.message?.toLowerCase() || error?.toLowerCase();
    this.updateAndSend({ actionError, failedAction });
    analytics.reset();
  }
  onWrapSuccess(wrapTxHash: string) {
    this.updateAndSend({
      wrapTxHash,
    });
  }

  onUnwrapSuccess(unwrapTxHash: string) {
    this.updateAndSend({
      unwrapTxHash,
    });
  }

  onApproveSuccess(approvalTxHash: string) {
    this.updateAndSend({
      approvalTxHash,
    });
  }

  onCreateOrderSuccess(newOrderId: number, createOrderTxHash: string) {
    this.updateAndSend({
      newOrderId,
      createOrderTxHash,
    });
    this.reset();
  }

  onModuleImported() {
    this.updateAndSend({
      moduleImported: true,
    });
  }

  onUiCreashed(error: Error) {
    this.updateAndSend({
      uiCrashedErrorMessage: error.message,
      uiCrashedErrorStack: error.stack,
    });
  }
}

export const analytics = new Analytics();
