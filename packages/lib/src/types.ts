import ConfigJson from "@orbs-network/twap/configs.json";
import { CSSProperties, FC, ReactElement, ReactNode } from "react";
import { IconType } from "@react-icons/all-files";
import Web3 from "web3";
import { Config } from "@orbs-network/twap-sdk";
import { SwapStatus, SwapStep } from "@orbs-network/swap-ui";

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
  limitPriceTooltipLimitPanel: string;
  twapLimit: string;
  twapMarketOrder: string;
}

export type MessageVariant = "error" | "warning" | "info";

export interface BaseComponentProps {
  className?: string;
}

export interface TWAPProps {
  connectedChainId?: number;
  account?: any;
  provider?: any;
  getProvider?: () => any;
  dappTokens?: any;
  maxFeePerGas?: string;
  priorityFeePerGas?: string;
  isDarkTheme?: boolean;
  Tooltip?: FC<TooltipProps>;
  USD?: FC<{ value?: string | number }>;
  onSrcTokenSelected?: (token: any) => void;
  onDstTokenSelected?: (token: any) => void;
  TokenSelectModal?: any;
  limit?: boolean;
  onTxSubmitted?: (values: OnTxSubmitValues) => void;
  usePriceUSD?: UsePriceUSD;
  useTrade?: UseTrade;
  isMobile?: boolean;
  enableQueryParams?: boolean;
  parsedTokens?: Token[];
  onSwitchTokens?: () => void;
  connect?: () => void;
  isExactAppoval?: boolean;
  fee?: string;
  srcToken?: any;
  dstToken?: any;
  parseToken?: (token: any) => Token | undefined;
}

export type SelectMeuItem = { text: string; value: string | number };

type UsePriceUSD = (address?: string, token?: Token) => number | string | undefined;

export interface TwapContextUIPreferences {
  usdSuffix?: string;
  usdPrefix?: string;
  usdEmptyUI?: ReactNode;
  balanceEmptyUI?: ReactNode;
  getOrdersTabsLabel?: (label: string, amount: number) => string;
  inputPlaceholder?: string;
  qrSize?: number;
  orderTabsToExclude?: string[];
  infoIcon?: any;
  inputLoader?: ReactElement;
  disableThousandSeparator?: boolean;
  input?: {
    showOnLoading?: boolean;
  };
  addressPadding?: AddressPadding;
  tooltipIcon?: ReactNode;
  modal?: {
    styles?: CSSProperties;
  };
}

export type AddressPadding = {
  start: number;
  end: number;
};

export type OnTxSubmitValues = {
  srcToken: Token;
  dstToken: Token;
  srcAmount: string;
  dstUSD: string;
  dstAmount: string;
  txHash: string;
};

type UseTrade = (fromToken?: string, toToken?: string, amount?: string) => { isLoading?: boolean; outAmount?: string };
export interface TwapLibProps {
  srcUsd?: string | number;
  dstUsd?: string | number;
  children: ReactNode;
  chainId?: number;
  account?: any;
  config: Config;
  provider: any;
  translations: Translations;
  priorityFeePerGas?: string;
  maxFeePerGas?: string;
  Components?: TwapComponents;
  dappWToken?: any;
  connect?: () => void;
  askDataParams?: any[];
  srcToken?: Token;
  dstToken?: Token;
  dappTokens?: any;
  uiPreferences?: TwapContextUIPreferences;
  onSrcTokenSelected?: (token: any) => void;
  onDstTokenSelected?: (token: any) => void;
  onTxSubmitted?: (values: OnTxSubmitValues) => void;
  marketPrice?: string;
  isMobile?: boolean;
  enableQueryParams?: boolean;
  minNativeTokenBalance?: string;
  isLimitPanel?: boolean;
  parsedTokens?: Token[];
  onSwitchTokens?: () => void;
  isWrongChain?: boolean;
  isExactAppoval?: boolean;
  fee?: string;
  nativeUsd?: string;
  useParsedToken?: (address?: string) => Token | undefined;
  useDappToken?: (address?: string) => any;
  parseToken?: (token: any) => Token | undefined;
}

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

export interface TWAPTokenSelectProps {
  onSelect?: (token: any) => void;
  isOpen: boolean;
  onClose: () => void;
  srcTokenSelected?: any;
  dstTokenSelected?: any;
  isSrc?: boolean;
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
  token?: Token;
  onTokenClick: () => void;
  isSrcToken: boolean;
};

export type LimitPriceTokenSelectProps = {
  token?: Token;
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
  options: [{ label: "Market"; value: boolean }, { label: "Limit"; value: boolean }];
  selected: boolean;
  onClick: (value: boolean) => void;
};

interface TwapComponents {
  Tooltip?: FC<TooltipProps>;
  Button?: FC<ButtonProps>;
  USD?: FC<{ value?: string | number }>;
}


export enum SwapSteps {
  WRAP,
  APPROVE,
  CREATE
}

export interface State {
  swapStep?: SwapSteps;
  swapSteps?: SwapSteps[];
  swapStatus?: SwapStatus;
  approveSuccess?: boolean;
  wrapSuccess?: boolean;
  wrapTxHash?: string;
  unwrapTxHash?: string;
  approveTxHash?: string;
  createOrderSuccess?: boolean;
  createOrderTxHash?: string;
  showConfirmation?: boolean;
  disclaimerAccepted?: boolean;
}

export interface TWAPContextProps {
  translations: Translations;
  isWrongChain: boolean;
  uiPreferences: TwapContextUIPreferences;
  Components?: TwapComponents;
  srcUsd: string | number;
  dstUsd: string | number;
  marketPrice?: string;
  web3?: Web3;
  config: Config;
  account?: string;
  onSrcTokenSelected?: (token: any) => void;
  onDstTokenSelected?: (token: any) => void;
  onSwitchTokens: () => void;
  isLimitPanel: boolean;
  tokens: Token[];
  maxFeePerGas?: string;
  priorityFeePerGas?: string;
  askDataParams?: any[];
  onTxSubmitted?: (values: OnTxSubmitValues) => void;
  minNativeTokenBalance?: string;
  enableQueryParams?: boolean;
  dappWToken?: Token;
  isExactAppoval?: boolean;
  fee?: string;
  nativeUsd?: string;
  useDappToken?: (address?: string) => any;
  useParsedToken: any;
  state: State;
  updateState: (state: Partial<State>) => void;
}
