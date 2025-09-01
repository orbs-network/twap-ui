import { CSSProperties, FC, ReactNode } from "react";
import { Config, Module, Order, OrderStatus, OrderType, TimeDuration, TimeUnit } from "@orbs-network/twap-sdk";
import { SwapStatus } from "@orbs-network/swap-ui";
import { createPublicClient, createWalletClient, TransactionReceipt as _TransactionReceipt, Abi } from "viem";
export type { Order } from "@orbs-network/twap-sdk";
export { OrderStatus, type TwapFill, OrderType, Module } from "@orbs-network/twap-sdk";

export type TransactionReceipt = _TransactionReceipt;
export interface Translations {
  minReceived: string;
  orderHistory: string;
  orderCancelled: string;
  cancelOrderModalTitle: string;
  tradePrice: string;
  takeProfit: string;
  stopLossLimitPriceTooltip: string;
  StopLossTriggerPriceError: string;
  TakeProfitTriggerPriceError: string;
  stopLossDurationTooltip: string;
  emptyTriggerPrice: string;
  triggerLimitPriceError: string;
  perTrade: string;
  triggerMarketPriceDisclaimer: string;
  stopLossTooltip: string;
  stopLossLabel: string;
  confirmationDeadlineTooltip: string;
  confirmationTradeSizeTooltip: string;
  triggerPrice: string;
  confirmationTotalTradesTooltip: string;
  confirmationMinDstAmountTooltipLimit: string;
  marketPriceTooltip: string;
  stopLoss: string;
  limitPriceTooltip: string;
  tradeSizeTooltip: string;
  maxDurationTooltip: string;
  tradeIntervalTootlip: string;
  totalTradesTooltip: string;
  connect: string;
  link: string;
  days: string;
  hours: string;
  minutes: string;
  noLiquidity: string;
  seconds: string;
  switchNetwork: string;
  placeOrder: string;
  excecutionSummary: string;
  orderInfo: string;
  confirmOrder: string;
  enterAmount: string;
  insufficientFunds: string;
  deadline: string;
  noOrders: string;
  order: string;
  filled: string;
  remaining: string;
  tradeInterval: string;
  cancelOrder: string;
  marketOrder: string;
  limitOrder: string;
  limitPrice: string;
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
  minReceivedPerTrade: string;
  poweredBy: string;
  minFillDelayError: string;
  maxFillDelayError: string;
  outAmountLoading: string;
  emptyLimitPrice: string;
  maxChunksError: string;
  minChunksError: string;
  minTradeSizeError: string;
  weeks: string;
  trades: string;
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
  twapLimit: string;
  twapMarketOrder: string;
  every: string;
  over: string;
  selectToken: string;
  wrap: string;
  unwrap: string;
  balance: string;
  wrapAction: string;
  unwrapAction: string;
  approveAction: string;
  createOrderAction: string;
  orderModalConfirmOrder: string;
  CreateOrderModalNativeBalanceError: string;
  CreateOrderModalOrderCreated: string;
  amountReceived: string;
  createdAt: string;
  amountOut: string;
  amountSent: string;
  status: string;
  progress: string;
  finalExcecutionPrice: string;
  tradeIntervalTitle: string;
  tradesAmountTitle: string;
  tradesAmountSmallText: string;
}

export type MessageVariant = "error" | "warning" | "info";

export type OrderHistoryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: ReactNode;
};

export type LimitPanelPercentSelectProps = {
  buttons: {
    text: string;
    selected: boolean;
    onClick: () => void;
    isReset: boolean;
  }[];
};

export type MessageProps = {
  variant: MessageVariant;
  text: ReactNode;
};

export type SelectMenuProps = {
  items: SelectMeuItem[];
  onSelect: (item: SelectMeuItem) => void;
  selected?: SelectMeuItem;
};

export type OrderHistoryListOrderProps = {
  order: Order;
  selectOrder: () => void;
  cancelOrder: () => Promise<TransactionReceipt | undefined>;
  selected: boolean;
};

export type LimitPanelInvertButtonProps = {
  onClick: () => void;
};

export type OrderHistorySelectedOrderProps = {
  order: Order;
  onBackClick: () => void;
  children: ReactNode;
};

export type DurationSelectButtonsProps = {
  onSelect: (unit: TimeUnit) => void;
  selected: number;
};

export type LabelProps = {
  text: string;
  tooltip?: string;
};

export type SwitchTokensProps = {
  onClick: () => void;
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

export type CancelOrderButtonProps = {
  order: Order;
  isLoading: boolean;
  onClick: () => void;
  className?: string;
  error?: string;
  txHash?: string;
  status?: SwapStatus;
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

export interface Components {
  // shared
  Label?: FC<LabelProps>;
  TokenLogo?: FC<TokenLogoProps>;
  Button: FC<ButtonProps>;
}

interface CreateOrderCallbackArgs {
  srcToken: Token;
  dstToken: Token;
  srcAmount: string;
  dstAmount: string;
}

interface CreateOrderSuccessCallbackArgs extends CreateOrderCallbackArgs {
  srcToken: Token;
  dstToken: Token;
  srcAmount: string;
  dstAmount: string;
  receipt: TransactionReceipt;
}

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
}

type Callbacks = {
  onInputAmountChange?: (weiValue: string, uiValue: string) => void;
  onTradePriceChange?: (weiValue: string, uiValue: string) => void;
  onDurationChange?: (value?: number) => void;
  onChunksChange?: (value?: number) => void;
  onFillDelayChange?: (value: number) => void;
  onTriggerPriceChange?: (weiValue: string, uiValue: string) => void;
};

export type SwapCallbacks = {
  createOrder?: {
    onRequest?: (args: CreateOrderCallbackArgs) => void;
    onSuccess?: (args: CreateOrderSuccessCallbackArgs) => void;
    onFailed?: (error: string) => void;
  };
  approve?: {
    onRequest?: (token: Token, amount: string) => void;
    onSuccess?: (receipt: TransactionReceipt, token: Token, amount: string) => void;
    onFailed?: (error: string) => void;
  };
  wrap?: {
    onRequest?: (amount: string) => void;
    onSuccess?: (receipt: TransactionReceipt, amount: string) => Promise<void>;
    onFailed?: (error: string) => void;
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
  disclaimerAccepted?: boolean;
  inputAmount?: string;
  chunks?: number;
  fillDelay?: number;
  duration?: number;
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
  Label: FC<LabelProps>;
  Button: FC<ButtonProps>;
  callbacks?: SwapCallbacks;
};

export type OrderHistoryCallbacks = {
  onCancelRequest?: (orderId: string[]) => void;
  onCancelSuccess?: (orderId: string[], receipt: TransactionReceipt) => void;
  onCancelFailed?: (error: string) => void;
};

export type OrderHistoryProps = {
  SelectMenu: FC<SelectMenuProps>;
  ListOrder?: FC<OrderHistoryListOrderProps>;
  SelectedOrder?: FC<OrderHistorySelectedOrderProps>;
  listLoader?: ReactNode;
  TokenLogo?: FC<TokenLogoProps>;
  Label: FC<LabelProps>;
  Button: FC<ButtonProps>;
  Checkbox: FC<{ checked: boolean; setChecked: () => void }>;
  useToken: UseToken;
  dateFormat?: (date: number) => string;
  callbacks?: OrderHistoryCallbacks;
};

export type Overrides = {
  wrap?: (amount: bigint) => Promise<`0x${string}`>;
  unwrap?: (amount: bigint) => Promise<`0x${string}`>;
  approveOrder?: (props: ApproveProps) => Promise<`0x${string}`>;
  createOrder?: (props: CreateOrderProps) => Promise<`0x${string}`>;
  cancelOrder?: (props: CancelOrderProps) => Promise<`0x${string}`>;
  getAllowance?: (props: GetAllowanceProps) => Promise<string>;
  state?: Partial<InitialState>;
  minChunkSizeUsd?: number;
  translations?: Partial<Translations>;
  numberFormat?: (value: number | string) => string;
  feesDisabled?: boolean;
};

export interface TwapProps {
  children?: React.ReactNode;
  provider?: Provider;
  chainId?: number;
  account?: string;
  enableQueryParams?: boolean;
  config: Config;
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
}

export interface TwapContextType extends TwapProps {
  isWrongChain: boolean;
  translations: Translations;
  walletClient?: ReturnType<typeof createWalletClient>;
  publicClient?: PublicClient;
  marketPrice?: string;
  marketPriceLoading?: boolean;
  account?: `0x${string}`;
  noLiquidity?: boolean;
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
  children: ReactNode;
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
  UNWRAP = "unwrap",
}

export interface State {
  swapStatus?: SwapStatus;
  fetchingAllowance?: boolean;
  activeStep?: Steps;
  currentStepIndex?: number;
  swapError?: string;
  createOrderTxHash?: string;
  approveTxHash?: string;
  wrapTxHash?: string;
  unwrapTxHash?: string;
  totalSteps?: number;
  swapIndex: number;
  showConfirmation?: boolean;
  disclaimerAccepted?: boolean;
  typedSrcAmount?: string;
  acceptedDstAmount?: string;
  typedChunks?: number;
  typedFillDelay: TimeDuration;
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
  showOrderHistory?: boolean;
  orderHIstoryStatusFilter?: OrderStatus;
}

export { SwapStatus };
