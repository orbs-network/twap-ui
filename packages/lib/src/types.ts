import BN from "bignumber.js";
import { Config, TokenData, TWAPLib } from "@orbs-network/twap";
import { CSSProperties, FC, ReactElement, ReactNode } from "react";
import { Duration } from "./store";

export interface Translations {
  expirationTooltip: string;
  tradeIntervalTooltip: string;
  chunkSizeTooltip: string;
  totalTradesTooltip: string;
  minDstAmountTooltipMarket: string;
  minDstAmountTooltipLimit: string;
  limitPriceTooltip: string;
  sizePerTradeTooltip: string;
  maxDurationTooltip: string;
  tradeIntervalTootlip: string;
  sliderMinSizeTooltip: string;
  connect: string;
  selectTokens: string;
  disclaimer: string;
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
  hrs: string;
  mins: string;
  switchNetwork: string;
  wrap: string;
  unwrap: string;
  approve: string;
  placeOrder: string;
  confirmOrder: string;
  enterAmount: string;
  insufficientFunds: string;
  enterTradeSize: string;
  enterMaxDuration: string;
  enterTradeInterval: string;
  tradeSizeMustBeEqual: string;
  sizePerTrade: string;
  tradeInterval: string;
  maxDuration: string;
  totalTrades: string;
  expiry: string;
  filled: string;
  cancelOrder: string;
  marketOrder: string;
  limitOrder: string;
  limitPrice: string;
  marketPrice: string;
  currentMarketPrice: string;
  from: string;
  to: string;
  orders: string;
  confirmTx: string;
  expiration: string;
  orderType: string;
  minReceivedPerTrade: string;
  ordersTooltip: string;
  poweredBy: string;
  balance: string;
  selectToken: string;
  partialFillWarning: string;
  partialFillWarningTooltip: string;
  tradeIntervalWarning: string;
  limitPriceMessage: string;
  hideCancelledOrders: string;
  openOrders: string;
  orderHistory: string;
  hide: string;
  canceled: string;
  completed: string;
  expired: string;
  open: string;
  setMarketRate: string;
  noOpenOrders: string;
  noOrderHistory: string;
  sellAtRate: string;
  status: string;
  viewOnExplorer: string;
  orderId: string;
  price: string;
  fee: string;
  feeTooltip: string;
  gain: string;
  insufficientLiquidity: string;
  searchingForBestPrice: string;
  placeLimitOrder: string;
  placeTWAPOrder: string;
  limitPriceWarning: string;
  orderCancelled: string;
  orderCancelledMessage: string;
  pleaseApproveItInYourWallet: string;
  confirmPlacing: string;
  limitOrderPlaced: string;
  twapOrderPlaced: string;
  orderSubmitted: string;
  transactionRejected: string;
  transactionFailed: string;
  insufficientBalance: string;
  insufficientBalanceMessage: string;
  errorMessage: string;
  wrappingError: string;
  approvingError: string;
  orderPlacingError: string;
  transactionSubmissionWentWrong: string;
  canceledApproval: string;
  canceledWrapping: string;
  canceledOrderPlacing: string;
  canceledApprovalMessage: string;
  canceledWrappingMessage: string;
  canceledOrderPlacingMessage: string;
  canceledTransaction: string;
  canceledTransactionMessage: string;
  twap: string;
  limit: string;
  loading: string;
  confirm: string;
  srcTokenForDstToken: string;
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
  srcToken?: any;
  dstToken?: any;
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
  marketPrice?: string;
  marketPriceLoading?: boolean;
  fee?: number;
  isLimitPanel?: boolean;
  parsedTokens?: TokenData[];
  onCancelOrderSuccess?: (orderId: number) => void;
  onCancelOrderFailure?: (orderId: number) => void;
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

type UseTrade = (fromToken?: string, toToken?: string, amount?: string) => { isLoading?: boolean; outAmount?: string };

export interface TwapLibProps extends LibProps {
  connect?: () => void;
  askDataParams?: any[];
  storeOverride?: StoreOverride;
  srcToken?: TokenData;
  dstToken?: TokenData;
  parseToken: (token: any) => TokenData | undefined;
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
  marketPriceLoading?: boolean;
  fee?: number;
  isLimitPanel?: boolean;
  parsedTokens?: TokenData[];
  onCancelOrderSuccess?: (orderId: number) => void;
  onCancelOrderFailure?: (orderId: number) => void;
  Input?: FC<InputProps>;
  CurrencyLogo?: FC<{ address?: string; size?: string }>;
  Balance?: FC<BalanceProps>;
  ReactMarkdown?: FC<{ children: string; components?: any }>;
}
export type BalanceProps = {
  balance?: string;
  insufficientBalance: boolean;
  onValueChange: (value: string) => void;
  isInputFocus: boolean;
  isSrcToken?: boolean;
  ReactMarkdown?: FC<{ children: string; components?: any }>;
};

export type InputProps = {
  loading?: boolean;
  disabled?: boolean;
  value: string;
  onChange: (value: string) => void;
};

export type Token = TokenData;

export interface InitLibProps {
  config: Config;
  provider?: any;
  account?: string;
  connectedChainId?: number;
  storeOverride?: StoreOverride;
}

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

export interface State {
  lib: TWAPLib | undefined;
  wrongNetwork: undefined | boolean;
  srcAmountUi: string;

  loading: boolean;
  isLimitOrder: boolean;
  currentTime: number;
  showConfirmation: boolean;
  disclaimerAccepted: boolean;

  chunks?: number;
  customFillDelay: Duration;
  customDuration: Duration;

  orderCreatedTimestamp?: number;

  showLoadingModal: boolean;
  showSuccessModal: boolean;

  txHash?: string;
  enableQueryParams?: boolean;
  srcUsd?: BN;
  dstUsd?: BN;
  srcUsdLoading?: boolean;
  dstUsdLoading?: boolean;
  newOrderLoading?: boolean;
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
  onClick: (e: any) => void;
  loading?: boolean;
  text?: string;
}
