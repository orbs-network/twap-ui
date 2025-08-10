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

export type LensOrder = {
  id: bigint;
  ask: {
    bidDelay: number;
    data: `0x${string}`;
    deadline: number;
    dstMinAmount: bigint;
    dstToken: `0x${string}`;
    exchange: `0x${string}`;
    fillDelay: number;
    srcAmount: bigint;
    srcBidAmount: bigint;
    srcToken: `0x${string}`;
  };
  bid: {
    data: `0x${string}`;
    dstAmount: bigint;
    dstFee: bigint;
    exchange: `0x${string}`;
    taker: `0x${string}`;
    time: number;
  };
  maker: `0x${string}`;
  status: number;
  time: number;
  filledTime: number;
  srcFilledAmount: bigint;
};

export type GetPermitDataProps = {
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
};
export type Address = `0x${string}`;
export type Hex = `0x${string}`;

// Structs (match your EIP-712 types)
export interface TokenPermissions {
  token: Address;
  amount: string;
}

export interface Input {
  token: Address;
  amount: string;
  maxAmount: string;
}

export interface Output {
  token: Address;
  amount: string;
  maxAmount: string;
  recipient: Address;
}

export interface PermitDataOrderInfo {
  reactor: Address;
  swapper: Address;
  nonce: string;
  deadline: string;
  additionalValidationContract: Address;
  additionalValidationData: Hex; // bytes
}

export interface PermitDataOrder {
  info: PermitDataOrderInfo;
  exclusiveFiller: Address;
  exclusivityOverrideBps: string;
  epoch: string;
  slippage: string;
  input: Input;
  output: Output;
}

export interface RePermitWitnessTransferFrom {
  permitted: TokenPermissions;
  spender: Address;
  nonce: string;
  deadline: string;
  witness: PermitDataOrder;
}

// EIP-712 "types" descriptor (for signTypedData)
export type EIP712TypeName = "TokenPermissions" | "Input" | "Output" | "OrderInfo" | "Order" | "RePermitWitnessTransferFrom";

export interface EIP712Field {
  name: string;
  type: string;
}

export type EIP712Types = Record<EIP712TypeName, EIP712Field[]>;

// Full typed-data container
export interface RePermitTypedData {
  domain: {
    name: "RePermit";
    version: "1";
    chainId: number;
    verifyingContract: Address;
  };
  primaryType: "RePermitWitnessTransferFrom";
  types: EIP712Types;
  message: RePermitWitnessTransferFrom;
}

export type Signature = {
  v: `0x${string}`;
  r: `0x${string}`;
  s: `0x${string}`;
};
