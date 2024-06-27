import BN from "bignumber.js";
import { Config, Order, Status, TokenData, TWAPLib } from "@orbs-network/twap";
import { Moment } from "moment";
import { CSSProperties, FC, ReactElement, ReactNode } from "react";
import { Duration } from "./store";
import { useParseOrderUi } from "./hooks";
import { CSSObject } from "@mui/system";
import { IconType } from "@react-icons/all-files";

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
  enterMaxDuration: string;
  enterTradeInterval: string;
  tradeSizeMustBeEqual: string;
  tradeSize: string;
  tradeInterval: string;
  maxDuration: string;
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
}

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
  usePriceUSD?: (address?: string, token?: TokenData) => number | undefined;
  useTrade?: UseTrade;
  isMobile?: boolean;
  enableQueryParams?: boolean;
  parsedTokens?: TokenData[];
}

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

export interface ParsedOrder {
  order: Order;
  ui: {
    status: Status;
    srcToken?: TokenData;
    dstToken?: TokenData;
    totalChunks?: number;
    dstAmount?: string;
    progress?: number;
    srcFilledAmount?: string;
    dollarValueIn?: string;
    dollarValueOut?: string;
  };
}

type UseTrade = (fromToken?: string, toToken?: string, amount?: string) => { isLoading?: boolean; outAmount?: string };

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
  usePriceUSD?: (token?: string) => number | undefined;
  priceUsd?: PriceUsd;
  useTrade?: UseTrade;
  isMobile?: boolean;
  enableQueryParams?: boolean;
  marketPrice?: string;
  minNativeTokenBalance?: string;
  isLimitPanel?: boolean;
  parsedTokens: TokenData[];
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
}

export interface OrdersData {
  [Status.Open]?: OrderUI[];
  [Status.Canceled]?: OrderUI[];
  [Status.Expired]?: OrderUI[];
  [Status.Completed]?: OrderUI[];
}

export type SwapState = "loading" | "success" | "failed";
export type SwapStep = "createOrder" | "wrap" | "approve";

export type ConfirmationDetails = { outAmount?: string; srcAmount?: string; srcUsd?: string; dstUsd?: string; srcToken?: TokenData; dstToken?: TokenData };
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

  orderCreatedTimestamp?: number;

  createOrdertxHash?: string;
  wrapTxHash?: string;
  approveTxHash?: string;
  unwrapTxHash?: string;
  enableQueryParams?: boolean;
  waitingForOrdersUpdate: boolean;
  isCustomLimitPrice?: boolean;
  customLimitPrice?: string;
  isInvertedLimitPrice?: boolean;
  limitPricePercent?: string;

  isMarketOrder?: boolean;

  createOrderSuccess?: boolean;
  wrapSuccess?: boolean;
  approveSuccess?: boolean;

  confirmationDetails?: ConfirmationDetails;
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
};

export type LimitPriceTokenSelectProps = {
  token?: TokenData;
  onClick: () => void;
};

export type Step = {
  title: string;
  description?: string;
  link?: {
    url: string;
    text: string;
  };
  Icon: IconType;
  image?: string;
  status: "pending" | "loading" | "completed" | "disabled";
};
