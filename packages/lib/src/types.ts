import { CSSProperties, FC, ReactNode } from "react";
import { Config, Order, TimeDuration, TimeUnit, TwapSDK } from "@orbs-network/twap-sdk";
import { SwapStatus } from "@orbs-network/swap-ui";
import { createPublicClient, createWalletClient, TransactionReceipt as _TransactionReceipt } from "viem";
export type { Order } from "@orbs-network/twap-sdk";
export { OrderStatus, type TwapFill, OrderType } from "@orbs-network/twap-sdk";

export type TransactionReceipt = _TransactionReceipt;
export interface Translations {
  minReceived: string;
  orderHistory: string;
  orderCancelled: string;
  cancelOrderModalTitle: string;
  perTrade: string;
  confirmationDeadlineTooltip: string;
  confirmationTradeSizeTooltip: string;
  confirmationTotalTradesTooltip: string;
  confirmationMinDstAmountTooltipLimit: string;
  marketPriceTooltip: string;
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
  enterLimitPrice: string;
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

export type SubmitOrderPanelProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: ReactNode;
};

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
  selectOrder: (orderId: number) => void;
  children: ReactNode;
  cancelOrder: (orderId: number) => Promise<string>;
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

export type OrdersHistoryProps = {
  children?: ReactNode;
  isOpen: boolean;
  onClose: () => void;
};

export type CancelOrderProps = {
  status?: SwapStatus;
  explorerUrl?: string;
  srcToken?: Token;
  dstToken?: Token;
  orderId?: number;
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
};

export interface Components {
  // shared
  Tooltip?: FC<TooltipProps>;

  Label?: FC<LabelProps>;
  TokenLogo?: FC<TokenLogoProps>;
  CancelOrderPanel?: FC<CancelOrderProps>;
  Button?: FC<ButtonProps>;

  TransactionModal?: {
    Spinner?: ReactNode;
    SuccessIcon?: ReactNode;
    ErrorIcon?: ReactNode;
    Link?: FC<LinkProps>;
    USD?: FC<USDProps>;
  };
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
  orderId?: number;
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
}

export type Callbacks = {
  onSubmitOrderRequest?: (args: CreateOrderCallbackArgs) => void;
  createOrder?: {
    onRequest?: (args: CreateOrderCallbackArgs) => void;
    onSuccess?: (args: CreateOrderSuccessCallbackArgs) => void;
    onFailed?: (error: string) => void;
  };
  cancelOrder?: {
    onRequest?: (orderId: number) => void;
    onSuccess?: (receipt: TransactionReceipt, orderId: number) => void;
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
export interface BaseTwapProps {
  isLimitPanel?: boolean;
  config: Config;
  srcToken?: Token;
  dstToken?: Token;
  srcUsd1Token?: number;
  dstUsd1Token?: number;
  srcBalance?: string;
  dstBalance?: string;
  children?: React.ReactNode;
  askDataParams?: any[];
  marketReferencePrice: { value?: string; isLoading?: boolean; noLiquidity?: boolean };
  customMinChunkSizeUsd?: number;
  chainId?: number;
  account?: string;
  provider?: Provider;
}

export interface TwapProps {
  provider?: Provider;
  isDarkTheme?: boolean;
  isLimitPanel?: boolean;
  enableQueryParams?: boolean;
  fee?: number;
  config: Config;
  translations?: Partial<Translations>;
  srcToken?: Token;
  dstToken?: Token;
  srcUsd1Token?: string;
  dstUsd1Token?: string;
  srcBalance?: string;
  dstBalance?: string;
  isExactAppoval?: boolean;
  children?: React.ReactNode;
  components?: Components;
  SubmitOrderPanel: FC<SubmitOrderPanelProps>;
  OrderHistory: {
    SelectMenu?: FC<SelectMenuProps>;
    ListOrder?: FC<OrderHistoryListOrderProps>;
    SelectedOrder?: FC<OrderHistorySelectedOrderProps>;
    Panel: FC<OrdersHistoryProps>;
    ShowOrdersButton?: FC<OrdersButtonProps>;
    ListLoader?: ReactNode;
    CancelOrderButton: FC<CancelOrderButtonProps>;
  };
  askDataParams?: any[];
  marketReferencePrice: { value?: string; isLoading?: boolean; noLiquidity?: boolean };
  customMinChunkSizeUsd?: number;
  useToken?: (value?: string) => Token | undefined;
  callbacks?: Callbacks;
  chainId?: number;
  dateFormat?: (date: number) => string;
  account?: string;
  orderDisclaimerAcceptedByDefault?: boolean;
  isTwapMarketByDefault?: boolean;
  onSrcAmountChange?: (amount: string) => void;
}

export interface TwapContextType extends TwapProps {
  isWrongChain: boolean;
  translations: Translations;
  walletClient?: ReturnType<typeof createWalletClient>;
  publicClient?: PublicClient;
  twapSDK: TwapSDK;
  marketPrice?: string;
  marketPriceLoading?: boolean;
  account?: `0x${string}`;
  noLiquidity?: boolean;
  components: Components;
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
}

export interface State {
  totalSteps?: number;
  swapStatus?: SwapStatus;
  activeStep?: Steps;
  currentStepIndex?: number;
  swapError?: string;
  createOrderTxHash?: string;
  approveTxHash?: string;
  wrapTxHash?: string;
  unwrapTxHash?: string;
  showConfirmation?: boolean;
  disclaimerAccepted?: boolean;
  typedSrcAmount?: string;
  acceptedDstAmount?: string;
  typedChunks?: number;
  typedFillDelay: TimeDuration;
  typedDuration?: TimeDuration;

  typedPrice?: string;
  isInvertedPrice?: boolean;
  selectedPricePercent?: string;
  isMarketOrder?: boolean;

  currentTime: number;
}

export { SwapStatus };
