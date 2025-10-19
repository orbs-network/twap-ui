import { CSSProperties, FC, ReactNode } from "react";
import { Partners, Module, Order, OrderStatus, OrderType, SpotConfig, TimeDuration } from "@orbs-network/twap-sdk";
import { SwapStatus } from "@orbs-network/swap-ui";
import { createPublicClient, createWalletClient, TransactionReceipt as _TransactionReceipt, Abi } from "viem";
export type { Order } from "@orbs-network/twap-sdk";
export { OrderStatus, type TwapFill, OrderType, Module } from "@orbs-network/twap-sdk";

export type TransactionReceipt = _TransactionReceipt;
export interface Translations {
  deadlineTooltip: string;
  tradeSizeTooltip: string;
  totalTradesTooltip: string;
  minDstAmountTooltip: string;
  marketPriceTooltip: string;
  limitPriceTooltip: string;
  version: string;
  outAmountLoading: string;
  maxOrderSizeError: string;
  minReceivedPerChunk: string;
  maxDurationTooltip: string;
  tradeIntervalTootlip: string;
  triggerPriceTooltip: string;
  triggerPriceMarket: string;
  triggerPriceLimit: string;
  link: string;
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
  placeOrder: string;
  confirmOrder: string;
  enterAmount: string;
  emptyLimitPrice: string;
  insufficientFunds: string;
  every: string;
  over: string;
  tradeInterval: string;
  deadline: string;
  filled: string;
  remaining: string;
  cancelOrder: string;
  marketOrder: string;
  limitOrder: string;
  limitPrice: string;
  finalExcecutionPrice: string;
  marketPrice: string;
  from: string;
  to: string;
  none: string;
  orders: string;
  Open: string;
  Completed: string;
  Expired: string;
  Canceled: string;
  confirmTx: string;
  expiration: string;
  perTrade: string;
  minReceivedPerTrade: string;
  triggerPricePerChunk: string;
  poweredBy: string;
  trades: string;
  maxChunksError: string;
  minChunksError: string;
  minTradeSizeError: string;
  allOrders: string;
  weeks: string;
  minFillDelayError: string;
  maxFillDelayError: string;
  recipient: string;
  accept: string;
  disclaimer: string;
  marketOrderWarning: string;
  limitPriceMessage: string;
  learnMore: string;
  swapOne: string;
  isWorth: string;
  market: string;
  limit: string;
  txHash: string;
  maxDurationError: string;
  minDurationError: string;
  expiry: string;
  individualTradeSize: string;
  numberOfTrades: string;
  AverageExecutionPrice: string;
  twapMarket: string;
  twapMarketOrder: string;
  twapLimit: string;
  stopLoss: string;
  takeProfit: string;
  All: string;
  minReceived: string;
  wrap: string;
  unwrap: string;
  balance: string;
  noOrders: string;
  order: string;
  noLiquidity: string;
  excecutionSummary: string;
  orderInfo: string;
  wrapAction: string;
  approveAction: string;
  createOrderAction: string;
  orderModalConfirmOrder: string;
  orderHistory: string;
  amountReceived: string;
  createdAt: string;
  amountOut: string;
  amountSent: string;
  status: string;
  progress: string;
  tradeIntervalTitle: string;
  tradesAmountTitle: string;
  stopLossTooltip: string;
  stopLossLabel: string;
  StopLossTriggerPriceError: string;
  TakeProfitTriggerPriceError: string;
  triggerLimitPriceError: string;
  takeProfitLimitPriceLessThanTriggerPrice: string;
  triggerPrice: string;
  tradePrice: string;
  triggerMarketPriceDisclaimer: string;
  stopLossLimitPriceTooltip: string;
  stopLossDurationTooltip: string;
  emptyTriggerPrice: string;
  id: string;
  fees: string;
}

export type SelectMenuProps = {
  items: SelectMeuItem[];
  onSelect: (item: SelectMeuItem) => void;
  selected?: SelectMeuItem;
};

export type TokenLogoProps = {
  token?: Token;
  size?: number;
  className?: string;
};

export type OrdersButtonProps = {
  onClick: () => void;
  openOrdersCount: number;
  isLoading: boolean;
};

export type LinkProps = {
  href: string;
  children: ReactNode;
};

export type USDProps = {
  value: string;
  isLoading: boolean;
};

export type TransactionModalCreateOrderSuccessProps = {
  orderType: OrderType;
  explorerUrl: string;
  srcToken: Token;
  dstToken: Token;
  srcAmount: string;
  dstAmount: string;
  txHash?: string;
  onClose: () => void;
};

export type TransactionModalCreateOrderErrorProps = {
  error: string;
  srcToken: Token;
  dstToken: Token;
  srcAmount: string;
  dstAmount: string;
  orderType: OrderType;
  shouldUnwrap: boolean;
};

export type TransactionModalCreateOrderLoadingViewProps = {
  srcToken: Token;
  dstToken: Token;
  orderType: OrderType;
  srcAmount: string;
  dstAmount: string;
  step: Steps;
  fetchingAllowance?: boolean;
};

export type CreateOrderReviewOrderContentProps = {
  srcToken: Token;
  dstToken: Token;
  orderType: OrderType;
  srcAmount: string;
  dstAmount: string;
  srcUsdAmount: string;
  dstUsdAmount: string;
  transactionHash?: string;
  fee: string;
  chunks: number;
  fillDelay: number;
  destMinAmountOut: string;
  orderDeadline: number;
  tradePrice: string;
  recipient: string;
  srcChunkAmount: string;
};

export type TransactionModalCancelOrderSuccessProps = {
  explorerUrl: string;
  srcToken: Token;
  dstToken: Token;
  orderId: string;
};

export type TransactionModalCancelOrderErrorProps = {
  error: string;
  srcToken: Token;
  dstToken: Token;
  orderId: string;
};

export type TransactionModalCancelOrderLoadingViewProps = {
  srcToken: Token;
  dstToken: Token;
  orderId: string;
};

export type InputError = {
  type: InputErrors;
  value: string | number;
  message: string;
};

export enum InputErrors {
  EMPTY_LIMIT_PRICE,
  MAX_CHUNKS,
  MIN_CHUNKS,
  MIN_TRADE_SIZE,
  MAX_FILL_DELAY,
  MIN_FILL_DELAY,
  MAX_ORDER_DURATION,
  MIN_ORDER_DURATION,
  MISSING_LIMIT_PRICE,
  STOP_LOSS_TRIGGER_PRICE_GREATER_THAN_MARKET_PRICE,
  TRIGGER_LIMIT_PRICE_GREATER_THAN_TRIGGER_PRICE,
  TAKE_PROFIT_TRIGGER_PRICE_LESS_THAN_MARKET_PRICE,
  EMPTY_TRIGGER_PRICE,
  INSUFFICIENT_BALANCE,
  MAX_ORDER_SIZE,
}

type Callbacks = {
  onInputAmountChange?: (weiValue: string, uiValue: string) => void;
};

export type onCreateOrderRequest = {
  srcToken: Token;
  dstToken: Token;
  srcAmount: string;
  dstAmount: string;
};

interface CreateOrderSuccessCallbackArgs extends onCreateOrderRequest {
  receipt?: TransactionReceipt;
}

export type SwapCallbacks = {
  createOrder?: {
    onRequest?: (args: onCreateOrderRequest) => void;
    onSuccess?: (args: CreateOrderSuccessCallbackArgs) => void;
  };
  approve?: {
    onRequest?: (token: Token, amount: string) => void;
    onSuccess?: (receipt: TransactionReceipt, token: Token, amount: string) => void;
  };
  wrap?: {
    onRequest?: (amount: string) => void;
    onSuccess?: (receipt: TransactionReceipt, amount: string) => Promise<void>;
  };
};

export interface Provider {
  request(...args: any): Promise<any>;
  [key: string]: any; // Allow extra properties
}

export type PublicClient = ReturnType<typeof createPublicClient>;
export type WalletClient = ReturnType<typeof createWalletClient>;

export type ApproveProps = {
  tokenAddress: string;
  amount: bigint;
  spenderAddress: string;
};

export type CreateOrderProps = {
  contractAddress: string;
  abi: Abi;
  functionName: string;
  args: [string[]];
};

export type CancelOrderProps = {
  contractAddress: string;
  abi: Abi;
  functionName: string;
  args: number[];
  orderId: number;
};

export type GetAllowanceProps = {
  tokenAddress: string;
  spenderAddress: string;
};

export type InitialState = {
  isMarketOrder?: boolean;
  inputAmount?: string;
  chunks?: number;
  fillDelay?: TimeDuration;
  duration?: TimeDuration;
  limitPrice?: string;
  triggerPrice?: string;
};

export type UseToken = (value?: string) => Token | undefined;

export type SubmitOrderPanelProps = {
  SuccessView?: ReactNode;
  ErrorView?: ReactNode;
  MainView?: ReactNode;
  LoadingView?: ReactNode;
  Spinner?: ReactNode;
  SuccessIcon?: ReactNode;
  ErrorIcon?: ReactNode;
  Link?: FC<LinkProps>;
  USD?: FC<USDProps>;
  reviewDetails?: ReactNode;
  Tooltip: FC<TooltipProps>;
  TokenLogo?: FC<TokenLogoProps>;
};

export type OrderHistoryCallbacks = {
  onCancelRequest?: (orders: Order[]) => void;
  onCancelSuccess?: (orders: Order[], receipt: TransactionReceipt) => void;
  onCancelFailed?: (error: string) => void;
};

export type OrderHistoryProps = {
  listLoader?: ReactNode;
  TokenLogo?: FC<TokenLogoProps>;
  Tooltip: FC<TooltipProps>;
  Button: FC<ButtonProps>;
  useToken: UseToken;
  callbacks?: OrderHistoryCallbacks;
};

export type OrderDetails = {
  limitPrice: {
    label: string;
    value: string;
  };

  deadline: {
    tooltip: string;
    label: string;
    value: number;
  };
  amountIn: {
    label: string;
    value: string;
  };
  chunkSize: {
    tooltip: string;
    label: string;
    value: string;
  };
  chunksAmount: {
    tooltip: string;
    label: string;
    value: number;
  };
  minDestAmountPerChunk: {
    tooltip: string;
    label: string;
    value: string;
  };
  tradeInterval: {
    tooltip: string;
    label: string;
    value: number;
  };
  triggerPricePerChunk: {
    tooltip: string;
    label: string;
    value: string;
  };
  recipient: {
    label: string;
    value: string;
  };
};

export type Overrides = {
  wrap?: (amount: bigint) => Promise<`0x${string}`>;
  approveOrder?: (props: ApproveProps) => Promise<`0x${string}`>;
  createOrder?: (props: CreateOrderProps) => Promise<`0x${string}`>;
  getAllowance?: (props: GetAllowanceProps) => Promise<string>;
  state?: Partial<InitialState>;
  minChunkSizeUsd?: number;
  translations?: Partial<Translations>;
  numberFormat?: (value: number | string) => string;
  dateFormat?: (date: number) => string;
};

export interface TwapProps {
  children?: React.ReactNode;
  provider?: Provider;
  chainId?: number;
  account?: string;
  enableQueryParams?: boolean;
  partner: Partners;
  srcToken?: Token;
  dstToken?: Token;
  srcUsd1Token?: string;
  dstUsd1Token?: string;
  srcBalance?: string;
  dstBalance?: string;
  slippage: number;
  module: Module;
  marketReferencePrice: { value?: string; isLoading?: boolean; noLiquidity?: boolean };
  overrides?: Overrides;
  callbacks?: Callbacks;
  fees?: number;
}

export interface TwapContextType extends TwapProps {
  translations: Translations;
  walletClient?: ReturnType<typeof createWalletClient>;
  publicClient?: PublicClient;
  marketPrice?: string;
  marketPriceLoading?: boolean;
  account?: `0x${string}`;
  noLiquidity?: boolean;
  config?: SpotConfig;
}

export type SelectMeuItem = { text: string; value: string | number };

export type AddressPadding = {
  start: number;
  end: number;
};

export type Token = {
  address: string;
  symbol: string;
  decimals: number;
  logoUrl: string;
};

export interface TooltipProps {
  children?: ReactNode;
  tooltipText?: string;
}

export interface ButtonProps extends React.HTMLAttributes<HTMLElement> {
  children: ReactNode;
  style?: CSSProperties;
  disabled?: boolean;
  onClick: () => void;
  loading?: boolean;
  text?: string;
  allowClickWhileLoading?: boolean;
}

export type ToggleProps = {
  checked: boolean;
  onChange: () => void;
};

export enum Steps {
  WRAP = "wrap",
  APPROVE = "approve",
  CREATE = "create",
}
export type SwapExecution = {
  status?: SwapStatus;
  error?: string;
  step?: Steps;
  stepIndex?: number;
  approveTxHash?: string;
  wrapTxHash?: string;
  totalSteps?: number;
};

export interface State {
  fetchingAllowance?: boolean;
  unwrapTxHash?: string;
  typedSrcAmount?: string;
  typedChunks?: number;
  typedFillDelay?: TimeDuration;
  typedDuration?: TimeDuration;
  typedLimitPrice?: string;
  typedTriggerPrice?: string;
  triggerPricePercent?: number | null;
  isInvertedTrade?: boolean;
  limitPricePercent?: number | null;
  isMarketOrder?: boolean;

  currentTime: number;
  cancelOrderStatus?: SwapStatus;
  cancelOrderTxHash?: string;
  cancelOrderError?: string;
  cancelOrderId?: number;

  selectedOrderID?: string;
  orderHistoryStatusFilter?: OrderStatus;

  cancelOrdersMode?: boolean;
  orderIdsToCancel?: string[];

  swapExecution: SwapExecution;
  acceptedMarketPrice?: string;
  acceptedSrcAmount?: string;
}

export { SwapStatus, Partners };
