import { CSSProperties, FC, ReactElement, ReactNode } from "react";
import { IconType } from "@react-icons/all-files";
import { Config, Order, TimeDuration, TimeUnit, TwapSDK } from "@orbs-network/twap-sdk";
import { SwapStatus } from "@orbs-network/swap-ui";
import { createPublicClient, createWalletClient, TransactionReceipt as _TransactionReceipt } from "viem";

export type TransactionReceipt = _TransactionReceipt;

export interface Translations {
  minReceived: string;
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
}

export type MessageVariant = "error" | "warning" | "info";

export type OrderConfirmationModalProps = {
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

export type TokenSelectModalProps = {
  isSrcToken?: boolean;
  isOpen: boolean;
  onClose: () => void;
  selectedToken?: Token;
  onSelect: (token: any) => void;
  children?: ReactNode;
};

export interface LimitPanelTokenSelectProps {
  onSelect?: (token: any) => void;
  isOpen: boolean;
  onClose: () => void;
  srcTokenSelected?: any;
  dstTokenSelected?: any;
  isSrc?: boolean;
}

export type InputProps = {
  onChange: (value: string) => void;
  value: string;
  disabled?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  isLoading?: boolean;
};

export interface Modals {
  OrderConfirmationModal: FC<OrderConfirmationModalProps>;
  TokenSelectModal: FC<TokenSelectModalProps>;
  OrderHistoryModal: FC<OrderHistoryModalProps>;
}

export type BalanceProps = {
  balance: string;
  onMax?: () => void;
  balanceWei: string;
  isLoading: boolean;
  isSrcToken?: boolean;
};

export type USDProps = {
  value: string;
  isLoading: boolean;
};

export type CurrencySelectButtonProps = {
  token?: Token;
  onClick: () => void;
};

export type TokenAmountPercentSelectProps = {
  onSelect: (percent: number) => void;
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
  title: ReactNode;
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
};

export type LimitPanelInvertButtonProps = {
  onClick: () => void;
};

export type OrderHistorySelectedOrderProps = {
  order: Order;
  onBackClick: () => void;
};

export type DurationSelectButtonsProps = {
  onSelect: (unit: TimeUnit) => void;
  selected: number;
};

export type LabelProps = {
  text: ReactNode;
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
};

interface Components {
  // shared
  Tooltip?: FC<TooltipProps>;
  Input?: FC<InputProps>;
  Button?: FC<ButtonProps>;
  Toggle?: FC<ToggleProps>;
  // token panel
  Balance?: FC<BalanceProps>;
  USD?: FC<USDProps>;
  CurrencySelectButton?: FC<CurrencySelectButtonProps>;
  TokenAmountPercentSelect?: FC<TokenAmountPercentSelectProps>;
  Message?: FC<MessageProps>;
  SelectMenu?: FC<SelectMenuProps>;
  // limit panel
  LimitPanelPercentSelect?: FC<LimitPanelPercentSelectProps>;
  LimitPanelInvertButton?: FC<LimitPanelInvertButtonProps>;
  // orders
  OrderHistoryListOrder?: FC<OrderHistoryListOrderProps>;
  OrderHistorySelectedOrder?: FC<OrderHistorySelectedOrderProps>;
  DurationSelectButtons?: FC<DurationSelectButtonsProps>;

  Label?: FC<LabelProps>;
  SwitchTokens?: FC<SwitchTokensProps>;
  TokenLogo?: FC<TokenLogoProps>;
  OrdersButton?: FC<OrdersButtonProps>;
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
  orderId: number;
  receipt: TransactionReceipt;
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
  unwrap?: {
    onRequest?: (amount: string) => void;
    onSuccess?: (receipt: TransactionReceipt, amount: string) => Promise<void>;
    onFailed?: (error: string) => void;
  };
  onSrcTokenSelect?: (token: any) => void;
  onDstTokenSelect?: (token: any) => void;
  onSwitchTokens?: () => void;
  onConnect?: () => void;
};

interface Provider {
  request(...args: any): Promise<any>;
  [key: string]: any; // Allow extra properties
}

export interface TwapProps {
  provider?: Provider;
  isDarkTheme?: boolean;
  isLimitPanel?: boolean;
  enableQueryParams?: boolean;
  fee?: string;
  config: Config;
  translations?: Partial<Translations>;
  srcToken?: Token;
  dstToken?: Token;
  srcUsd1Token?: number;
  dstUsd1Token?: number;
  srcBalance?: string;
  dstBalance?: string;
  isExactAppoval?: boolean;
  children?: React.ReactNode;
  components: Components;
  modals: Modals;
  askDataParams?: any[];
  marketReferencePrice: { value?: string; isLoading?: boolean };
  customMinChunkSizeUsd?: number;
  useToken?: (value?: string) => Token | undefined;
  includeStyles?: boolean;
  callbacks: Callbacks;
  chainId?: number;
}

export interface TwapContextType extends TwapProps {
  isWrongChain: boolean;
  state: State;
  updateState: (state: Partial<State>) => void;
  reset: () => void;
  translations: Translations;
  walletClient?: ReturnType<typeof createWalletClient>;
  publicClient?: ReturnType<typeof createPublicClient>;
  twapSDK: TwapSDK;
  marketPrice?: string;
  marketPriceLoading?: boolean;
  account?: `0x${string}`;
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
  tooltipText?: string | ReactElement | number;
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

export type Step = {
  title: string;
  description?: string;
  link?: {
    url: string;
    text: string;
  };
  Icon?: IconType;
  image?: string;
  status: "pending" | "loading" | "completed" | "disabled";
};

export enum SwapSteps {
  WRAP,
  APPROVE,
  CREATE,
}

export interface State {
  swapStep?: SwapSteps;
  swapSteps?: SwapSteps[];
  swapStatus?: SwapStatus;
  swapError?: string;
  createOrderTxHash?: string;
  showConfirmation?: boolean;
  disclaimerAccepted?: boolean;
  typedSrcAmount?: string;
  swapData?: {
    srcToken?: Token;
    dstToken?: Token;
    srcAmount?: string;
    dstAmount?: string;
    srcAmountusd?: string;
    dstAmountusd?: string;
  };

  typedChunks?: number;
  typedFillDelay: TimeDuration;
  typedDuration?: TimeDuration;

  typedPrice?: string;
  isInvertedPrice?: boolean;
  selectedPricePercent?: string;
  isMarketOrder?: boolean;

  currentTime: number;
}
