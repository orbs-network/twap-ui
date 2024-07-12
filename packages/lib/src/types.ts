import BN from "bignumber.js";
import { Config, Order, Status, TokenData, TWAPLib } from "@orbs-network/twap";
import { Moment } from "moment";
import { CSSProperties, FC, ReactElement, ReactNode } from "react";
import { IconType } from "@react-icons/all-files";
import { useParseOrderUi } from "./hooks/orders";

export interface Translations {
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
}

export type MessageVariant = "error" | "warning" | "info";

export interface BaseComponentProps {
  className?: string;
}

interface BaseProps {
  connectedChainId?: number;
  account?: any;
  provider?: any;
  getProvider?: () => any;
  dappTokens?: any;
  maxFeePerGas?: string;
  priorityFeePerGas?: string;
  isDarkTheme?: boolean;
}
export interface TWAPProps extends BaseProps {
  connect?: () => void;
  srcToken?: string;
  dstToken?: string;
  onSrcTokenSelected?: (token: any) => void;
  onDstTokenSelected?: (token: any) => void;
  TokenSelectModal?: any;
  limit?: boolean;
  onTxSubmitted?: (values: OnTxSubmitValues) => void;
  priceUsd?: PriceUsd;
  usePriceUSD?: UsePriceUSD;
  useTrade?: UseTrade;
  isMobile?: boolean;
  enableQueryParams?: boolean;
  parsedTokens?: TokenData[];
  onSwitchTokens?: () => void;
}

type UsePriceUSD = (address?: string, token?: TokenData) => number | string | undefined;

type PriceUsd = (address: string, token?: TokenData) => any;

interface LibProps {
  children: ReactNode;
  connectedChainId?: number;
  account?: any;
  config: Config;
  provider: any;
  translations: Translations;
  priorityFeePerGas?: string;
  maxFeePerGas?: string;
  isDarkTheme?: boolean;
}

export type StoreOverride = Partial<State>;

export interface TwapContextUIPreferences {
  usdSuffix?: string;
  usdPrefix?: string;
  usdEmptyUI?: ReactNode;
  balanceEmptyUI?: ReactNode;
  switchVariant?: SwitchVariant;
  getOrdersTabsLabel?: (label: string, amount: number) => string;
  inputPlaceholder?: string;
  qrSize?: number;
  orderTabsToExclude?: string[];
  infoIcon?: FC;
  inputLoader?: ReactElement;
  disableThousandSeparator?: boolean;
  Components?: {
    USD?: FC<{ usd?: string }>;
  };
  input?: {
    showOnLoading?: boolean;
  };
  Tooltip?: FC<TooltipProps>;
  Button?: FC<ButtonProps>;
  orders?: {
    paginationChunks?: number;
    hideUsd?: boolean;
  };
  modal?: {
    styles?: CSSProperties;
  };
}

export type OnTxSubmitValues = {
  srcToken: TokenData;
  dstToken: TokenData;
  srcAmount: string;
  dstUSD: string;
  dstAmount: string;
  txHash: string;
};

export interface HistoryOrder {
  id: number;
  deadline: number;
  createdAt: number;
  srcAmount: string;
  dstMinAmount: string;
  status?: Status;
  srcBidAmount: string;
  fillDelay?: number;
  txHash?: string;
  dstAmount?: string;
  srcFilledAmount?: string;
  dollarValueIn?: string;
  dollarValueOut?: string;
  progress?: number;
  srcTokenAddress?: string;
  dstTokenAddress?: string;
  totalChunks?: number;
  srcToken?: TokenData;
  dstToken?: TokenData;
  dex?: string;
  exchange?: string;
}

type UseTrade = (fromToken?: string, toToken?: string, amount?: string) => { isLoading?: boolean; outAmount?: string };
export type UseMarketPriceProps = { srcToken?: Token; dstToken?: Token; amount?: string };
export interface TwapLibProps extends LibProps {
  connect?: () => void;
  askDataParams?: any[];
  storeOverride?: StoreOverride;
  srcToken?: string;
  dstToken?: string;
  dappTokens: any;
  uiPreferences?: TwapContextUIPreferences;
  onSrcTokenSelected?: (token: any) => void;
  onDstTokenSelected?: (token: any) => void;
  onTxSubmitted?: (values: OnTxSubmitValues) => void;
  srcUsd?: BN;
  dstUsd?: BN;
  usePriceUSD?: UsePriceUSD;
  priceUsd?: PriceUsd;
  isMobile?: boolean;
  enableQueryParams?: boolean;
  minNativeTokenBalance?: string;
  isLimitPanel?: boolean;
  parsedTokens: TokenData[];
  useMarketPrice?: (props: UseMarketPriceProps) => string | undefined;
  onSwitchTokens?: () => void;
}

export type Token = TokenData;

export type OrderUI = ReturnType<typeof useParseOrderUi>;

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

export interface TWAPTokenSelectProps {
  onSelect?: (token: any) => void;
  isOpen: boolean;
  onClose: () => void;
  srcTokenSelected?: any;
  dstTokenSelected?: any;
  isSrc?: boolean;
}

export interface OrdersData {
  [Status.Open]?: HistoryOrder[];
  [Status.Canceled]?: HistoryOrder[];
  [Status.Expired]?: HistoryOrder[];
  [Status.Completed]?: HistoryOrder[];
}

export type SwapState = "loading" | "success" | "failed" | "rejected";
export type SwapStep = "createOrder" | "wrap" | "approve";

export interface State {
  swapStep?: SwapStep;
  swapSteps?: SwapStep[];
  swapState?: SwapState;

  srcToken: TokenData | undefined;
  dstToken: TokenData | undefined;
  srcAmountUi: string;

  confirmationClickTimestamp: Moment;
  showConfirmation: boolean;
  disclaimerAccepted: boolean;

  customChunks?: number;
  customFillDelay: Duration;
  customDuration?: Duration;

  createOrdertxHash?: string;
  wrapTxHash?: string;
  approveTxHash?: string;
  unwrapTxHash?: string;

  isCustomLimitPrice?: boolean;
  customLimitPrice?: string;
  isInvertedLimitPrice?: boolean;
  limitPricePercent?: string;
  isMarketOrder?: boolean;

  createOrderSuccess?: boolean;
  wrapSuccess?: boolean;
  approveSuccess?: boolean;

  selectedOrdersTab: number;
  newOrderId?: number;

  swapData?: {
    srcAmount: string;
    outAmount: string;
    dstToken: TokenData;
    srcToken: TokenData;
    srcAmountUsd?: string;
    dstAmountUsd?: string;
  };
}

export type SwitchVariant = "ios" | "default";

export interface TooltipProps extends React.HTMLAttributes<HTMLElement> {
  childrenStyles?: CSSProperties;
  children: ReactNode;
  text?: string | ReactElement | number;
  placement?: "bottom-end" | "bottom-start" | "bottom" | "left-end" | "left-start" | "left" | "right-end" | "right-start" | "right" | "top-end" | "top-start" | "top";
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

export interface OrderCreated {
  Contract_id: string;
  ask_bidDelay: string;
  ask_data: string;
  ask_deadline: string;
  ask_dstMinAmount: string;
  ask_dstToken: string;
  ask_exchange: string;
  ask_fillDelay: string;
  ask_srcAmount: string;
  ask_srcBidAmount: string;
  ask_srcToken: string;
  blockNumber: string;
  blockTimestamp: string;
  dex: string;
  dollarValueIn: string;
  dstTokenSymbol: string;
  exchange: string;
  id: string;
  maker: string;
  srcTokenSymbol: string;
  timestamp: string;
  transactionHash: string;
}

export type LimitPricePercentProps = {
  text: string;
  selected: boolean;
  onClick: () => void;
};

export type LimitPriceZeroButtonProps = {
  text: string;
  onClick: () => void;
};

export type LimitPriceTitleProps = {
  textLeft: string;
  textRight?: string;
  token?: TokenData;
  onTokenClick: () => void;
  isSrcToken: boolean;
};

export type LimitPriceTokenSelectProps = {
  token?: TokenData;
  onClick: () => void;
  isSrcToken: boolean;
};

export type LimitPriceInputProps = { isLoading: boolean; onChange: (value: string) => void; value: string };

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

export type LimitSwitchArgs = {
  options: [{ label: "Market"; value: "market" }, { label: "Limit"; value: "limit" }];
  selected: "limit" | "market";
  onClick: (value: "limit" | "market") => void;
};

export enum TimeResolution {
  Minutes = 60 * 1000,
  Hours = Minutes * 60,
  Weeks = 7 * 24 * Hours,
  Days = Hours * 24,
}
export type Duration = { resolution: TimeResolution; amount?: number };

export interface TWAPContextProps {
  dappProps: TwapLibProps;
  lib?: TWAPLib;
  marketPrice?: string;
  translations: Translations;
  isWrongChain: boolean;
  state: State;
  updateState: (state: Partial<State>) => void;
  uiPreferences: TwapContextUIPreferences;
}
