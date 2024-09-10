import { isTxRejected, logger } from "./utils";
import { v4 as uuidv4 } from "uuid";
import { useSwapData } from "./hooks";
import { Config } from "./types";

const Version = 0.2;

const BI_ENDPOINT = `https://bi.orbs.network/putes/twap-ui-${Version}`;

type Action =
  | "cancel"
  | "create-order"
  | "onConfirmationCreateOrderClick"
  | "onCreateOrderSuccess"
  | "wrap-only"
  | "wrap"
  | "unwrap"
  | "approve"
  | "module-imported"
  | "page-loaded";

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

type OrderType = "limit" | "twap-market" | "twap-limit";

interface SubmitOrderArgs {
  srcToken?: string;
  dstToken?: string;
  srcTokenSymbol?: string;
  dstTokenSymbol?: string;
  srcTokenAmount?: string;
  srcTokenAmountBN?: string;
  dstTokenAmount?: string;
  dstTokenMarketAmount?: string;
  dstTokenMarketAmountBN?: string;
  totalTrades?: number;
  minAmountOut?: string;
  minAmountOutBN?: string;
  deadline?: number;
  deadlineUi?: string;
  tradeInterval?: number;
  fillDelayUi?: string;
  tradeSize?: string;
  tradeSizeBN?: string;
}

interface Data extends SubmitOrderArgs, LibConfig {
  _id: string;
  uiCrashedErrorMessage?: string;
  uiCrashedErrorStack?: string;
  actionError?: string;
  newOrderId?: number;
  cancelOrderSuccess?: boolean;
  cancelOrderId?: number;
  action?: Action;
  createOrderTxHash?: string;
  failedAction?: Action;
  wrapTxHash?: string;
  unwrapTxHash?: string;
  approvalTxHash?: string;
  walletConnectName?: string;
  orderType?: OrderType;
  maker?: string;
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
    logger(`Analytics error: ${error}`);
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

    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      sendBI(this.data);
    }, 1_000);
  }

  reset() {
    setTimeout(() => {
      this.data = {
        _id: uuidv4(),
        action: "page-loaded",
      };
    }, 1_000);
  }

  onLibInit(config?: Config, provider?: any, account?: string) {
    let walletConnectName;

    try {
      if (provider.isRabby) {
        walletConnectName = "Rabby Wallet";
      } else if (provider.isWalletConnect) {
        walletConnectName = "WalletConnect";
      } else if (provider.isCoinbaseWallet) {
        walletConnectName = "Coinbase Wallet";
      } else if (provider.isOkxWallet) {
        walletConnectName = "OKX Wallet";
      } else if (provider.isTrustWallet) {
        walletConnectName = "Trust Wallet";
      } else if (provider.isMetaMask) {
        walletConnectName = "MetaMask";
      } else {
        walletConnectName = (provider as any)?.session?.peer.metadata.name;
      }
    } catch (error) {}

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
      maker: account,
      walletConnectName,
      action: "page-loaded",
    });
  }

  onCancelOrder(cancelOrderId: number) {
    this.updateAndSend({ cancelOrderId, action: "cancel" });
  }

  onCancelOrderSuccess() {
    this.updateAndSend({ cancelOrderSuccess: true });
  }

  onSubmitOrder(swapData: ReturnType<typeof useSwapData>, orderType: OrderType) {
    this.updateAndSend({
      srcToken: swapData.srcToken?.address,
      dstToken: swapData.dstToken?.address,
      srcTokenSymbol: swapData.srcToken?.symbol,
      dstTokenSymbol: swapData.dstToken?.symbol,
      srcTokenAmount: swapData.srcAmount.amountUi,
      srcTokenAmountBN: swapData.srcAmount.amount,
      dstTokenMarketAmount: swapData.outAmount.amountUi,
      dstTokenMarketAmountBN: swapData.outAmount.amount,
      totalTrades: swapData.chunks,
      minAmountOut: swapData.dstMinAmount.amountUi,
      minAmountOutBN: swapData.dstMinAmount.amount,
      tradeInterval: swapData.fillDelay.millis,
      deadline: swapData.deadline.millis,
      deadlineUi: swapData.deadline.text,
      tradeSize: swapData.srcChunkAmount.amountUi,
      tradeSizeBN: swapData.srcChunkAmount.amount,
      action: "onConfirmationCreateOrderClick",
      orderType,
    });
  }

  updateAction(action: Action) {
    this.updateAndSend({
      action,
    });
  }

  onTxError(error: any, failedAction: Action) {
    if (isTxRejected(error)) {
      this.updateAndSend({ actionError: "rejected" });
    } else {
      const actionError = error?.message?.toLowerCase() || error?.toLowerCase();
      this.updateAndSend({ actionError, failedAction });
      analytics.reset();
    }
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
      action: "onCreateOrderSuccess",
    });
    this.reset();
  }

  onModuleImported() {
    this.data = {
      ...this.data,
      action: "module-imported",
    };
    sendBI(this.data);
  }

  onUiCreashed(error: Error) {
    this.updateAndSend({
      uiCrashedErrorMessage: error.message,
      uiCrashedErrorStack: error.stack,
    });
  }
}

export const analytics = new Analytics();
