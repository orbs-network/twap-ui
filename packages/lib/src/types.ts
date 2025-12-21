import { CSSProperties, FC, ReactNode } from "react";
import { Partners, Module, Order, OrderStatus, SpotConfig, TimeDuration } from "@orbs-network/twap-sdk";
import { SwapStatus } from "@orbs-network/swap-ui";
import { createPublicClient, createWalletClient, TransactionReceipt as _TransactionReceipt, Abi } from "viem";
export type { Order } from "@orbs-network/twap-sdk";
export { OrderStatus, type TwapFill, OrderType, Module } from "@orbs-network/twap-sdk";

export type TransactionReceipt = _TransactionReceipt;
export interface Translations {
  deadlineTooltip: string;
  tradeSizeTooltip: string;
  totalTradesTooltip: string;
  stopLossDurationTooltip: string;
  stopLossTooltip: string;
  stopLossLimitPriceTooltip: string;
  takeProfitTooltip: string;
  minDstAmountTooltip: string;
  marketPriceTooltip: string;
  limitPriceTooltip: string;
  wrapMsg: string;
  tradeIntervalTootlip: string;
  triggerPriceTooltip: string;
  createOrderActionSuccess: string;
  version: string;
  viewOnExplorer: string;
  proceedInWallet: string;
  outAmountLoading: string;
  maxOrderSizeError: string;
  minReceivedPerChunk: string;
  maxDurationTooltip: string;
  triggerPriceMarket: string;
  triggerPriceLimit: string;
  placeOrder: string;
  enterAmount: string;
  emptyLimitPrice: string;
  insufficientFunds: string;
  every: string;
  over: string;
  tradeInterval: string;
  deadline: string;
  limitPrice: string;
  finalExcecutionPrice: string;
  marketPrice: string;
  from: string;
  to: string;
  Open: string;
  Completed: string;
  Expired: string;
  Canceled: string;
  minReceivedPerTrade: string;
  triggerPricePerChunk: string;
  maxChunksError: string;
  minChunksError: string;
  minTradeSizeError: string;
  allOrders: string;
  minFillDelayError: string;
  maxFillDelayError: string;
  recipient: string;
  marketOrderWarning: string;
  limitPriceMessage: string;
  limit: string;
  maxDurationError: string;
  minDurationError: string;
  expiry: string;
  individualTradeSize: string;
  numberOfTrades: string;
  AverageExecutionPrice: string;
  twapMarket: string;
  twapLimit: string;
  stopLoss: string;
  takeProfit: string;
  minReceived: string;
  noOrders: string;
  noLiquidity: string;
  excecutionSummary: string;
  orderInfo: string;
  wrapAction: string;
  approveAction: string;
  createOrderAction: string;
  amountReceived: string;
  createdAt: string;
  amountOut: string;
  status: string;
  progress: string;
  tradeIntervalTitle: string;
  tradesAmountTitle: string;
  stopLossLabel: string;
  StopLossTriggerPriceError: string;
  TakeProfitTriggerPriceError: string;
  triggerLimitPriceError: string;
  triggerPrice: string;
  tradePrice: string;
  triggerMarketPriceDisclaimer: string;
  emptyTriggerPrice: string;
  id: string;
  fees: string;
  minutes: string;
  days: string;
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
  reviewDetails?: ReactNode;
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
  numberFormat?: (value: number | string) => string;
  dateFormat?: (date: number) => string;
};

export type OnApproveSuccessCallback = {
  txHash: string;
  explorerUrl: string;
  token: Token;
  amount: string;
};

export type OnWrapSuccessCallback = {
  txHash: string;
  explorerUrl: string;
  amount: string;
};

export type OnCancelOrderSuccess = {
  orders: Order[];
  txHash: string;
  explorerUrl: string;
};

export type ParsedError = {
  message: string;
  code: number;
};

export type Callbacks = {
  onCancelOrderRequest?: (orders: Order[]) => void;
  onCancelOrderSuccess?: (props: OnCancelOrderSuccess) => void;
  onCancelOrderFailed?: (error: string) => void;
  onOrdersProgressUpdate?: (orders: Order[]) => void;
  onSignOrderRequest?: () => void;
  onOrderCreated?: (order: Order) => void;
  onSignOrderSuccess?: (signature: string) => void;
  onSignOrderError?: (error: string) => void;
  onApproveRequest?: () => void;
  onApproveSuccess?: (props: OnApproveSuccessCallback) => void;
  onWrapRequest?: () => void;
  onWrapSuccess?: (props: OnWrapSuccessCallback) => void;
  onOrderFilled?: (order: Order) => void;
  onCopy?: () => void;
  onSubmitOrderFailed?: (error: ParsedError) => void;
  onSubmitOrderRejected?: () => void;
};

export type SubmitOrderSuccessViewProps = {
  children: ReactNode;
  newOrderId?: string;
};

export type SubmitOrderErrorViewProps = {
  wrapTxHash?: string;
  children: ReactNode;
  error?: ParsedError;
};

export type MarketReferencePrice = {
  value?: string;
  isLoading?: boolean;
  noLiquidity?: boolean;
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
  priceProtection: number;
  module: Module;
  marketReferencePrice: MarketReferencePrice;
  overrides?: Overrides;
  fees?: number;
  callbacks?: Callbacks;
  refetchBalances?: () => void;
  getTranslation?: (key: string, args?: Record<string, string>) => string | undefined;
  translations?: Partial<Translations> | undefined;
  useToken?: UseToken;
  minChunkSizeUsd: number;
  components: {
    Button?: FC<ButtonProps>;
    Tooltip?: FC<TooltipProps>;
    TokenLogo?: FC<TokenLogoProps>;
    Spinner?: ReactNode;
    SuccessIcon?: ReactNode;
    ErrorIcon?: ReactNode;
    Link?: FC<LinkProps>;
    USD?: FC<USDProps>;
    SubmitOrderSuccessView?: FC<SubmitOrderSuccessViewProps>;
    SubmitOrderErrorView?: FC<SubmitOrderErrorViewProps>;
    SubmitOrderMainView?: FC<{ children: ReactNode }>;
  };
}

export interface TwapContextType extends TwapProps {
  walletClient?: ReturnType<typeof createWalletClient>;
  publicClient?: PublicClient;
  marketPrice?: string;
  marketPriceLoading?: boolean;
  account?: `0x${string}`;
  noLiquidity?: boolean;
  config?: SpotConfig;
  slippage: number;
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
  error?: { message: string; code: number };
  step?: Steps;
  stepIndex?: number;
  approveTxHash?: string;
  wrapTxHash?: string;
  totalSteps?: number;
  srcToken?: Token;
  dstToken?: Token;
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
  triggerPricePercent?: string | null;
  isInvertedTrade?: boolean;
  limitPricePercent?: string | null;
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

  newOrderId?: string;
}

export { SwapStatus, Partners };
