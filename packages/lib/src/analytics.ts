import { useCallback } from "react";
import { useTwapContext } from "./context";
import { useChunks, useDeadline, useDstAmount, useDstAmountUsdUi, useFillDelayUiMillis, useSrcAmountUsdUi, useSrcChunkAmount } from "./hooks";
import { useTwapStore } from "./store";

require("isomorphic-fetch");
const BI_ENDPOINT = "https://bi.orbs.network/putes/twap-ui";

const sendBI = async (data: Partial<StateData>) => {
  try {
    await fetch(BI_ENDPOINT, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then()
      .catch();
  } catch (error) {}
};

type Status = "pending" | "error" | "success";

interface StateData {
  _id: string;
  maker?: string;
  chainId?: number;
  partner?: string;
  srcTokenAddress?: string;
  dstTokenAddress?: string;
  srcTokenSymbol?: string;
  dstTokenSymbol?: string;
  srcUsd?: string;
  dstUsd?: string;
  srcAmount?: string;
  minAmountOut?: string;
  exchangeAddress?: string;
  chunkSize?: number;
  deadline?: number;
  tradeInterval?: number;
  totalChunks?: number;
  name?: string;
  isLimit?: boolean;
  uiCrashedError?: string;
  uiCrashedStack?: string;
  approvalStatus?: Status;
  wrapStatus?: Status;
  createOrderStatus?: Status;
  error?: string;
  twapLoaded?: boolean;
  orderId?: number;
  txHash?: string;
}

class Analytics {
  initialTimestamp = Date.now();
  data: StateData = {
    _id: crypto.randomUUID(),
  };
  timeout: any = undefined;

  public async updateAndSend(values = {} as Partial<StateData>) {
    this.data = {
      ...this.data,
      ...values,
    };
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      sendBI(this.data);
    }, 1_000);
  }

  public reset() {
    this.data = {
      _id: crypto.randomUUID(),
    };
  }

  public resetOrderId() {
    this.data = {
      ...this.data,
      _id: crypto.randomUUID(),
    };
  }
}

const analytics = new Analytics();

const useSubmitOrder = () => {
  const { lib } = useTwapContext();
  const tradeInterval = useFillDelayUiMillis();
  const deadline = useDeadline();
  const totalChunks = useChunks();
  const srcUsd = useSrcAmountUsdUi();
  const dstUsd = useDstAmountUsdUi();
  const minAmountOut = useDstAmount().outAmount.ui;
  const chunkSize = useSrcChunkAmount().toNumber();

  const { isLimit, srcAmount, srcToken, dstToken } = useTwapStore((s) => ({
    isLimit: s.isLimitOrder,
    srcAmount: s.srcAmountUi,
    srcToken: s.srcToken,
    dstToken: s.dstToken,
  }));

  return useCallback(() => {
    analytics.updateAndSend({
      partner: lib?.config.partner,
      maker: lib?.maker,
      chainId: lib?.config.chainId,
      exchangeAddress: lib?.config.exchangeAddress,
      name: lib?.config.name,
      tradeInterval,
      isLimit,
      deadline,
      totalChunks,
      srcUsd,
      dstUsd,
      srcAmount,
      minAmountOut,
      srcTokenAddress: srcToken?.address,
      srcTokenSymbol: srcToken?.symbol,
      dstTokenAddress: dstToken?.address,
      dstTokenSymbol: dstToken?.symbol,
      chunkSize,
      approvalStatus: "pending",
    });
  }, [lib, tradeInterval, isLimit, deadline, totalChunks, srcUsd, dstUsd, srcAmount, minAmountOut, srcToken, dstToken, chunkSize]);
};

const onApprovalError = (error: any) => {
  analytics.updateAndSend({
    error: handleError(error),
    approvalStatus: "error",
  });
};
const onApprovalSucess = () => {
  analytics.updateAndSend({
    approvalStatus: "success",
  });
};

const handleError = (error: any) => {
  if (error instanceof Error) {
    return error.message;
  }
  return "";
};

const onWrapError = (error: any) => {
  analytics.updateAndSend({
    error: handleError(error),
    wrapStatus: "error",
  });
};
const onWrapSucess = () => {
  analytics.updateAndSend({
    wrapStatus: "success",
  });
};

const onCreateOrderFailed = (error: any) => {
  analytics.updateAndSend({
    error: handleError(error),
    createOrderStatus: "error",
  });
  analytics.resetOrderId();
};

const onCreateOrderSuccess = (orderId: number, txHash: string) => {
  analytics.updateAndSend({
    createOrderStatus: "success",
    orderId,
    txHash,
  });

  analytics.reset();
};

const onUiCrashed = (error: Error) => {
  analytics.updateAndSend({
    uiCrashedError: error.message,
    uiCrashedStack: error.stack,
  });
};

const onModuleLoaded = () => {
  analytics.updateAndSend({});
};

const onTwapLoaded = () => {
  analytics.updateAndSend({ twapLoaded: true });
};

const _analytics = {
  onUiCrashed,
  onCreateOrderFailed,
  onCreateOrderSuccess,
  onApprovalError,
  onApprovalSucess,
  onModuleLoaded,
  onTwapLoaded,
  onWrapError,
  onWrapSucess,
  useSubmitOrder,
};

export { _analytics as Analytics };
