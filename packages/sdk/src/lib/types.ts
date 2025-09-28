import { EIP712_TYPES, REPERMIT_PRIMARY_TYPE } from "./consts";

export type Config = {
  chainName: string;
  chainId: number;
  twapVersion: number;
  twapAddress: string;
  lensAddress: string;
  bidDelaySeconds: number;
  minChunkSizeUsd: number;
  name: string;
  partner: string;
  exchangeAddress: string;
  exchangeType: string;
  pathfinderKey: string;
};
export enum Module {
  TWAP = "TWAP",
  LIMIT = "LIMIT",
  STOP_LOSS = "STOP_LOSS",
  TAKE_PROFIT = "TAKE_PROFIT",
}

export enum OrderStatus {
  Open = "OPEN",
  Canceled = "CANCELED",
  Completed = "COMPLETED",
  Expired = "EXPIRED",
}

export enum TimeUnit {
  Minutes = 60 * 1000,
  Hours = Minutes * 60,
  Weeks = 7 * 24 * Hours,
  Days = Hours * 24,
  Months = 30 * Days,
  Years = 365 * Days,
}

export type TimeDuration = { unit: TimeUnit; value: number };

export enum OrderType {
  LIMIT = "limit",
  TWAP_LIMIT = "twap-limit",
  TWAP_MARKET = "twap-market",
  TRIGGER_PRICE_MARKET = "trigger-price-market",
  TRIGGER_PRICE_LIMIT = "trigger-price-limit",
}

export interface getAskParamsProps {
  destTokenMinAmount: string;
  srcChunkAmount: string;
  deadline: number;
  fillDelay: TimeDuration;
  srcAmount: string;
  srcTokenAddress: string;
  destTokenAddress: string;
}

export type PrepareOrderArgsResult = [string, string, string, string, string, string, string, string, string, string[]];

export type TwapFill = {
  TWAP_id: number;
  dollarValueIn: string;
  dollarValueOut: string;
  dstAmountOut: string;
  dstFee: string;
  id: string;
  srcAmountIn: string;
  srcFilledAmount: string;
  timestamp: number;
  twapAddress: string;
  exchange: string;
  transactionHash: string;
};

export type BuildRePermitOrderDataProps = {
  chainId: number;
  srcToken: string;
  dstToken: string;
  srcAmount: string;
  deadlineMilliseconds: number;
  fillDelayMillis: number;
  slippage: number;
  account: string;
  srcAmountPerChunk: string;
  dstMinAmountPerChunk?: string;
  triggerAmountPerChunk?: string;
  limitAmountPerChunk?: string;
};
export type Address = `0x${string}`;
export type Hex = `0x${string}`;

// Structs (match your EIP-712 types)
export interface TokenPermissions {
  token: Address;
  amount: string;
}

export interface OrderData {
  permitted: {
    token: Address;
    amount: string;
  };
  spender: Address;
  nonce: string;
  deadline: string;
  witness: {
    reactor: Address;
    executor: Address;
    exchange: {
      adapter: Address;
      ref: Address;
      share: number;
      data: Hex;
    };
    swapper: Address;
    nonce: string;
    deadline: string;
    chainid: number;
    exclusivity: number;
    epoch: number;
    slippage: number;
    freshness: number;
    input: {
      token: Address;
      amount: string;
      maxAmount: string;
    };
    output: {
      token: Address;
      amount: string;
      recipient: Address;
      maxAmount: string;
    };
  };
}

// Full typed-data container
export interface RePermitTypedData {
  domain: {
    name: "RePermit";
    version: "1";
    chainId: number;
    verifyingContract: Address;
  };
  primaryType: typeof REPERMIT_PRIMARY_TYPE;
  types: typeof EIP712_TYPES;
  message: OrderData;
}

export type Signature = {
  v: `0x${string}`;
  r: `0x${string}`;
  s: `0x${string}`;
};

export type RawOrder = {
  Contract_id: string | number;
  srcTokenSymbol: string;
  dollarValueIn: string;
  blockNumber: number;
  maker: string;
  dstTokenSymbol: string;
  ask_fillDelay: number;
  exchange: string;
  twapAddress: string;
  dex: string;
  ask_deadline: number;
  timestamp: string;
  ask_srcAmount: string;
  ask_dstMinAmount: string;
  ask_srcBidAmount: string;
  transactionHash: string;
  ask_srcToken: string;
  ask_dstToken: string;
};

export type ParsedFills = {
  filledDstAmount: string;
  filledSrcAmount: string;
  filledDollarValueIn: string;
  filledDollarValueOut: string;
  dexFee: string;
};

export type SinkOrder = {
  hash: string;
  metadata: {
    chunks: [
      {
        blockId: number;
        description: string;
        index: number;
        status: string;
        timestamp: string;
      },
    ];
    expectedChunks: number;
    lastPriceCheck: string;
    nextEligibleTime: string;
    status: string;
  };
  order: OrderData;
  signature: string;
  timestamp: string;
};
export type SpotConfig = {
  wm: Address;
  repermit: Address;
  cosigner: Address;
  reactor: Address;
  executor: Address;
  refinery: Address;
  dex: {
    thena: {
      type: string;
      router: Address;
      adapter: Address;
      fee: Address;
    };
  };
};
