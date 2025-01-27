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
  Modal: FC<ModalProps>;
  TokensListModal: FC<TokensListModalProps>;
  Tooltip: FC<TooltipProps>;
  Ipnut?: FC<InputProps>;
}

export interface WidgetProps {
  chainId?: number;
  account?: any;
  provider?: any;
  maxFeePerGas?: string;
  priorityFeePerGas?: string;
  isDarkTheme?: boolean;
  onSrcTokenSelected?: (token: any) => void;
  onDstTokenSelected?: (token: any) => void;
  isLimitPanel?: boolean;
  onTxSubmitted?: (values: OnTxSubmitValues) => void;
  isMobile?: boolean;
  enableQueryParams?: boolean;
  onSwitchTokens?: () => void;
  connect: () => void;
  fee?: string;
  config: Config;
  translations?: Translations;
  srcToken?: Token;
  dstToken?: Token;
  uiPreferences?: UIPreferences;
  srcUsd?: number;
  dstUsd?: number;
  nativeUsd?: number;
  marketPrice?: string;
  isExactAppoval?: boolean;
  children: React.ReactNode;
  components: Components;
  askDataParams?: any[];
  useToken?: (value?: string) => Token | undefined;
}

export interface WidgetContextType extends WidgetProps {
  isWrongChain: boolean;
  web3?: Web3;
  state: State;
  updateState: (state: Partial<State>) => void;
  translations: Translations;
  uiPreferences: UIPreferences;
}

export type SelectMeuItem = { text: string; value: string | number };

export interface UIPreferences {
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

export type OnTxSubmitValues = {
  srcToken: Token;
  dstToken: Token;
  srcAmount: string;
  dstUSD: string;
  dstAmount: string;
  txHash: string;
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

export enum SwapSteps {
  WRAP,
  APPROVE,
  CREATE,
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
  swapData: {
    srcToken?: Token;
    dstToken?: Token;
    srcAmount?: string;
    outAmount?: string;
    srcAmountusd?: string;
    outAmountusd?: string;
  };
}
