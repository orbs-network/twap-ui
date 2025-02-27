import { CSSProperties, FC, ReactElement, ReactNode } from "react";
import { IconType } from "@react-icons/all-files";
import { Config, TimeDuration, TwapSDK } from "@orbs-network/twap-sdk";
import { SwapStatus } from "@orbs-network/swap-ui";
import { TransportConfig } from "viem";

export interface Translations {
  minReceived: string;
  confirmationDeadlineTooltip: string;
  confirmationtradeIntervalTooltip: string;
  confirmationTradeSizeTooltip: string;
  confirmationTotalTradesTooltip: string;
  confirmationMinDstAmountTootipMarket: string;
  confirmationMinDstAmountTootipLimit: string;
  confirmationOrderType: string;
  confirmationMarketOrderTooltip: string;
  marketPriceTooltip: string;
  limitPriceTooltip: string;
  tradeSizeTooltip: string;
  maxDurationTooltip: string;
  tradeIntervalTootlip: string;
  customIntervalTooltip: string;
  totalTradesTooltip: string;
  connect: string;
  selectTokens: string;
  acceptDisclaimer: string;
  outputWillBeSentTo: string;
  disclaimer1: string;
  disclaimer2: string;
  disclaimer3: string;
  disclaimer4: string;
  disclaimer5: string;
  disclaimer6: string;
  disclaimer7: string;
  link: string;
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
  switchNetwork: string;
  wrap: string;
  approve: string;
  placeOrder: string;
  confirmOrder: string;
  partialFillWarning: string;
  enterAmount: string;
  insufficientFunds: string;
  enterTradeSize: string;
  enterTradeInterval: string;
  tradeSizeMustBeEqual: string;
  tradeSize: string;
  tradeInterval: string;
  totalTrades: string;
  deadline: string;
  filled: string;
  remaining: string;
  cancelOrder: string;
  marketOrder: string;
  limitOrder: string;
  limitPrice: string;
  marketPrice: string;
  max: string;
  currentMarketPrice: string;
  from: string;
  to: string;
  none: string;
  orders: string;
  Open: string;
  Completed: string;
  submitOrder: string;
  Expired: string;
  Canceled: string;
  noOrdersFound: string;
  confirmTx: string;
  expiration: string;
  orderType: string;
  minReceivedPerTrade: string;
  confirmationLimitPriceTooltip: string;
  ordersTooltip: string;
  noOrdersFound1: string;
  poweredBy: string;
  insertLimitPriceWarning: string;
  unwrap: string;
  balance: string;
  selectToken: string;
  sliderMinSizeTooltip: string;
  loading: string;
  progress: string;
  estimated: string;
  notify: string;
  prtialFillWarning: string;
  prtialFillWarningTooltip: string;
  fillDelayWarning: string;
  fillDelayWarningTooltip: string;
  invalid: string;
  viewOrders: string;
  view: string;
  estimate: string;
  noLiquidity: string;
  outAmountLoading: string;
  feeOnTranferWarning: string;
  maxChunksWarning: string;
  minChunksWarning: string;
  weeks: string;
  price: string;
  minTradeIntervalWarning: string;
  recipient: string;
  accept: string;
  disclaimer: string;
  marketOrderWarning: string;
  limitPriceWarningTitle: string;
  limitPriceWarningTitleInverted: string;
  limitPriceWarningSubtitle: string;
  limitPriceWarningSubtileInverted: string;
  limitPriceMessage: string;
  maxTradeIntervalWarning: string;
  learnMore: string;
  swapOne: string;
  isWorth: string;
  placingOrder: string;
  market: string;
  limit: string;
  txHash: string;
  maxDurationWarning: string;
  minDurationWarning: string;
  expiry: string;
  individualTradeSize: string;
  numberOfTrades: string;
  AverageExecutionPrice: string;
  twapMarket: string;
  limitPriceTooltipLimitPanel: string;
  twapLimit: string;
  twapMarketOrder: string;
}

export type MessageVariant = "error" | "warning" | "info";

export type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: ReactNode;
};

export type TokensListModalProps = {
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

export interface BaseComponentProps {
  className?: string;
}

export type InputProps = {
  onChange: (value: string) => void;
  value: string;
  disabled?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
};

interface Components {
  Modal?: FC<ModalProps>;
  TokensListModal?: FC<TokensListModalProps>;
  Tooltip?: FC<TooltipProps>;
  Ipnut?: FC<InputProps>;
  Button?: FC<ButtonProps>;
  Toggle?: FC<ToggleProps>;
}

export type OnWrapSuccessArgs = {
  amount: string;
  txHash: string;
};

export type OnCancelOrderSuccessArgs = {
  txHash: string;
  orderId: number;
};

interface OnCreateOrderArgs {
  srcToken: Token;
  dstToken: Token;
  srcAmount: string;
  dstAmount: string;
}

interface OnOrderCreatedArgs extends OnCreateOrderArgs {
  srcToken: Token;
  dstToken: Token;
  srcAmount: string;
  dstAmount: string;
  orderId: number;
  txHash: string;
}

interface ApproveRequestArgs {
  token: Token;
  amount: string;
}

export interface OnApproveSuccessArgs extends ApproveRequestArgs {
  txHash: string;
}

export type Callbacks = {
  onSubmitOrderRequest?: (args: OnCreateOrderArgs) => void;
  createOrder?: {
    onRequest?: (args: OnCreateOrderArgs) => void;
    onSuccess?: (args: OnOrderCreatedArgs) => void;
    onFailed?: (error: string) => void;
  };
  cancelOrder: {
    onRequest?: (orderId: number) => void;
    onSuccess?: (args: OnCancelOrderSuccessArgs) => void;
    onFailed?: (error: string) => void;
  };
  approve: {
    onRequest?: (args: ApproveRequestArgs) => void;
    onSuccess?: (args: OnApproveSuccessArgs) => void;
    onFailed?: (error: string) => void;
  };
  wrap: {
    onRequest?: (amount: string) => void;
    onSuccess?: (args: OnWrapSuccessArgs) => void;
    onFailed?: (error: string) => void;
  };
};

type Actions = {
  onSrcTokenSelect?: (token: any) => void;
  onDstTokenSelect?: (token: any) => void;
  onSwitchFromNativeToWrapped?: () => void;
  onSwitchTokens?: () => void;
  onConnect?: () => void;
  refetchBalances?: () => Promise<void>;
};

export interface TwapProps {
  chainId?: number;
  account?: string;
  web3Provider?: any;
  walletClientTransport?: TransportConfig;
  isDarkTheme?: boolean;
  isLimitPanel?: boolean;
  enableQueryParams?: boolean;
  fee?: string;
  config: Config;
  translations?: Translations;
  srcToken?: Token;
  dstToken?: Token;
  srcUsd1Token?: number;
  dstUsd1Token?: number;
  srcBalance?: string;
  dstBalance?: string;
  uiPreferences?: UIPreferences;
  isExactAppoval?: boolean;
  children: React.ReactNode;
  components: Components;
  askDataParams?: any[];
  marketPrice?: string;
  marketPriceLoading?: boolean;
  minChunkSizeUsd?: number;
  useToken?: (value?: string) => Token | undefined;
  includeStyles?: boolean;
  callbacks?: Callbacks;
  actions: Actions;
}

export interface TwapContextType extends TwapProps {
  isWrongChain: boolean;
  state: State;
  updateState: (state: Partial<State>) => void;
  reset: () => void;
  translations: Translations;
  uiPreferences: UIPreferences;
  walletClient?: any;
  publicClient?: any;
  twapSDK: TwapSDK;
}

export type SelectMeuItem = { text: string; value: string | number };

export interface UIPreferences {
  message?: {
    warningIcon?: ReactElement;
    errorIcon?: ReactElement;
  };
  menu?: {
    icon?: ReactElement;
  };
  tokenSelect?: {
    icon?: ReactElement;
  };
  usd?: {
    suffix?: string;
    prefix?: string;
    emptyUI?: ReactNode;
  };
  balance?: {
    emptyUI?: ReactNode;
  };
  input?: {
    showOnLoading?: boolean;
    placeholder?: string;
    disableThousandSeparator?: boolean;
  };
}

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

export interface StylesConfig {
  primaryColor?: string;
  textColor: string;
  iconsColor: string;
  tooltipBackground: string;
  tooltipTextColor: string;
  skeletonLoaderBackground?: string;
  spinnerColor: string;
  containerBackground: string;
  cardBackground: string;
  wrapperBackground?: string;
  iconBackground?: string;
  borderColor?: string;
  progressBarColor: string;
  progressBarTrackColor: string;
  orderHistorySelectedTabBackground: string;
  orderHistorySelectedTabColor: string;
  orderHistoryTabColor: string;
  buttonBackground: string;
  buttonColor: string;
  disabledButtonBackground: string;
  disabledButtonColor: string;
  selectTokenBackground: string;
  selectTokenTextColor: string;
  selectedTokenBackground: string;
  selectedTokenTextColor: string;
  selectedTokenBorderColor?: string;
}

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
  wrapTxHash?: string;
  unwrapTxHash?: string;
  approveTxHash?: string;
  createOrderSuccess?: boolean;
  createOrderTxHash?: string;
  showConfirmation?: boolean;
  disclaimerAccepted?: boolean;
  typedSrcAmount?: string;
  isWrapped?: boolean;
  swapData?: {
    srcAmount?: string;
    outAmount?: string;
    srcAmountusd?: string;
    outAmountusd?: string;
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
