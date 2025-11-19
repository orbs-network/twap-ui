import { Address, Module, Partners, RePermitOrder, SpotConfig } from "./types";
import BN from "bignumber.js";
import pkg from "@orbs-network/spot/package.json";
import pkgUI from "@orbs-network/twap-ui/package.json";

const Version = 0.7;
const BI_ENDPOINT = `https://bi.orbs.network/putes/twap-ui-${Version}`;
const SPOT_VERSION = pkg.version;

function generateId() {
  const part1 = Math.random().toString(36).substring(2, 16); // Generate 16 random characters
  const part2 = Math.random().toString(36).substring(2, 16); // Generate another 16 random characters
  const timestamp = Date.now().toString(36); // Generate a timestamp
  return `id_${part1 + part2 + timestamp}`; // Concatenate all parts
}
interface Token {
  address: string;
  symbol: string;
  decimals: number;
}

const getConfigDetails = (config: SpotConfig, chainId?: number) => {
  return {
    spotVersion: SPOT_VERSION,
    partner: config.partner,
    adapter: config.adapter,
    cosigner: config.cosigner,
    executor: config.executor,
    fee: config.fee,
    reactor: config.reactor,
    refinery: config.refinery,
    repermit: config.repermit,
    router: config.router,
    type: config.type,
    wm: config.wm,
    chainName: config.twapConfig?.chainName || "",
    chainId: chainId || 0,
    twapVersion: config.twapConfig?.twapVersion || 0,
    twapAddress: config.twapConfig?.twapAddress || "",
    lensAddress: config.twapConfig?.lensAddress || "",
    bidDelaySeconds: config.twapConfig?.bidDelaySeconds || 0,
    minChunkSizeUsd: config.twapConfig?.minChunkSizeUsd || 0,
    name: config.twapConfig?.name || "",
    exchangeAddress: config.twapConfig?.exchangeAddress || "",
    exchangeType: config.twapConfig?.exchangeType || "",
    pathfinderKey: config.twapConfig?.pathfinderKey || "",
  };
};

type Action = "cancel order" | "wrap" | "approve" | "sign order" | "create order" | "module-import" | "reset";

interface Data {
  _id: string;
  spotVersion?: string;
  uiVersion?: string;
  origin?: string;
  actionError?: string;
  cancelOrderSuccess?: boolean;
  orderSubmitted?: boolean;
  orderHash?: string;
  orderSuccess?: boolean;
  action?: Action;
  wrapTxHash?: string;
  cancelOrderTxHash?: string;
  cancelOrderIdsV1?: string[];
  cancelOrderIdsV2?: string[];
  approvalTxHash?: string;
  walletAddress?: string;
  fromTokenAddress?: string;
  fromTokenSymbol?: string;
  toTokenAddress?: string;
  order?: RePermitOrder;
  signature?: string;
  toTokenSymbol?: string;
  fromTokenAmount?: string;
  chunksAmount?: number;
  minDstAmountOutPerTrade?: string;
  triggerPricePerTrade?: string;
  deadline?: number;
  fillDelay?: number;
  srcChunkAmount?: string;
  module?: Module;
  slippage?: number;
  orderType?: "market" | "limit";

  partner?: Partners;
  adapter?: Address;
  cosigner?: Address;
  executor?: Address;
  fee?: Address;
  reactor?: Address;
  refinery?: Address;
  repermit?: Address;
  router?: Address;
  type?: string;
  wm?: Address;
  chainName?: string;
  chainId?: number;
  twapVersion?: number;
  twapAddress?: string;
  lensAddress?: string;
  bidDelaySeconds?: number;
  minChunkSizeUsd?: number;
  name?: string;
  exchangeAddress?: string;
  exchangeType?: string;
  pathfinderKey?: string;
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
  config: SpotConfig | undefined;
  data: Data = {
    _id: generateId(),
  };

  async updateAndSend(values = {} as Partial<Data>, noTimeout = false, callback?: () => void) {
    try {
      this.data = {
        ...this.data,
        ...values,
      };
      if (noTimeout) {
        await sendBI(this.data);
        callback?.();
      } else {
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
          sendBI(this.data);
          callback?.();
        }, 1_000);
      }
    } catch (error) {
      console.error("Failed to update and send BI", error);
    }
  }

  onCancelOrderRequest(cancelOrderIds: string[], version: 1 | 2) {
    this.updateAndSend({
      cancelOrderIdsV1: version === 1 ? cancelOrderIds : undefined,
      cancelOrderIdsV2: version === 2 ? cancelOrderIds : undefined,
      action: "cancel order",
      cancelOrderSuccess: false,
      cancelOrderTxHash: undefined,
      actionError: undefined,
    });
  }

  onCancelOrderSuccess(hash?: string) {
    this.updateAndSend({
      cancelOrderTxHash: hash,
      cancelOrderSuccess: true,
    });
  }

  onCancelOrderError(error: any) {
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

  onTxError(error: any) {
    const actionError = error?.message?.toLowerCase() || error?.toLowerCase();
    this.updateAndSend({ actionError });
  }

  onRequestOrder({
    account,
    chainId,
    module,
    srcToken,
    dstToken,
    fromTokenAmount,
    srcChunkAmount,
    minDstAmountOutPerTrade = "",
    triggerPricePerTrade = "",
    deadline,
    fillDelay,
    slippage,
    isMarketOrder,
  }: {
    account: string;
    chainId: number;
    module: Module;
    srcToken: Token;
    dstToken: Token;
    fromTokenAmount: string;
    srcChunkAmount: string;
    minDstAmountOutPerTrade: string;
    triggerPricePerTrade: string;
    deadline: number;
    fillDelay: number;
    slippage: number;
    isMarketOrder: boolean;
  }) {
    const chunksAmount = BN(fromTokenAmount).div(srcChunkAmount).integerValue(BN.ROUND_FLOOR).toNumber();
    this.updateAndSend({
      toTokenAddress: dstToken.address,
      toTokenSymbol: dstToken.symbol,
      fromTokenAddress: srcToken.address,
      fromTokenSymbol: srcToken.symbol,
      fromTokenAmount,
      chunksAmount,
      srcChunkAmount,
      minDstAmountOutPerTrade,
      triggerPricePerTrade,
      deadline,
      fillDelay,
      slippage,
      chainId,
      walletAddress: account,
      module,
      orderType: isMarketOrder ? "market" : "limit",
      actionError: undefined,
    });
  }

  onSignOrderRequest(order: RePermitOrder) {
    this.updateAndSend({
      action: "sign order",
      order: order,
    });
  }

  onSignOrderError(error: any) {
    this.onTxError(error);
  }

  onSignOrderSuccess(signature: string) {
    this.updateAndSend({
      action: "sign order",
      signature: signature,
    });
  }

  init(config: SpotConfig, chainId?: number) {
    this.config = config;
    if (chainId !== this.data?.chainId) {
      this.data = {
        _id: generateId(),
        action: "module-import",
        uiVersion: pkgUI.version,
        ...getConfigDetails(config, chainId),
        origin: window.location.origin,
      };
      this.updateAndSend(this.data);
    }
  }

  onCreateOrderError(error: any) {
    this.onTxError(error);
  }

  onCreateOrderRequest() {
    this.updateAndSend({
      action: "create order",
    });
  }

  async onCreateOrderSuccess(orderHash?: string) {
    this.updateAndSend(
      {
        orderHash,
        orderSuccess: true,
      },
      undefined,
      () => {
        this.data = {
          _id: generateId(),
          action: "reset",
          uiVersion: pkgUI.version,
          origin: this.data.origin,
          ...getConfigDetails(this.config!, this.data.chainId),
        };
      },
    );
  }

  onLoad() {
    this.updateAndSend({
      action: "module-import",
      origin: window.location.origin,
    });
  }
}

export const analytics = new Analytics();
