import _ from "lodash";
import {
  Abi,
  account as candiesAccount,
  BigNumber,
  bn,
  contract,
  convertDecimals,
  eqIgnoreCase,
  erc20,
  parsebn,
  setWeb3Instance,
  Token,
  zero,
  iwethabi,
} from "@defi.org/web3-candies";
import { useMutation, useQuery } from "react-query";
import { useCallback, useContext, useMemo, useState } from "react";
import Web3 from "web3";
import { DstTokenState, GlobalState, MaxDurationState, PriceState, SrcTokenState, TokenInfo, TradeIntervalState, TradeSizeState, Web3State } from "../types";
import create from "zustand";
import { TimeFormat } from "./TimeFormat";
import { nativeAddresses, TwapConfig } from "../consts";
import { changeNetwork } from "./connect";
import { TwapContext } from "../context";
import moment from "moment";
import twapAbi from "./twap-abi.json";

const srcTokenInitialState = {
  srcTokenInfo: undefined,
  srcToken: undefined,
  srcTokenAmount: undefined,
};

const dstTokenInitialState = {
  dstTokenInfo: undefined,
  dstToken: undefined,
};

const maxDurationInitialState = {
  millis: 0,
  timeFormat: TimeFormat.Minutes,
};

const tradeIntervalInitialState = {
  millis: 0,
  insertedTimeFormat: TimeFormat.Minutes,
  timeFormat: TimeFormat.Minutes,
  customInterval: false,
};

const priceInitialState = {
  limitPrice: undefined,
  isLimitOrder: false,
};

const tradeSizeInitialState = {
  tradeSize: undefined,
};

const globalInitialState = {
  showConfirmation: false,
  disclaimerAccepted: false,
};

export const useGlobalState = create<GlobalState>((set) => ({
  ...globalInitialState,
  setShowConfirmation: (showConfirmation) => {
    set({ showConfirmation });
    if (!showConfirmation) {
      set({ disclaimerAccepted: false });
    }
  },
  setDisclaimerAccepted: (disclaimerAccepted) => set({ disclaimerAccepted }),
  reset: () => set(globalInitialState),
}));

export const useSrcTokenStore = create<SrcTokenState>((set, get) => ({
  ...srcTokenInitialState,
  setSrcToken: (srcTokenInfo, keepAmount) => {
    set({ srcTokenInfo, srcToken: getToken(srcTokenInfo) });
    useTradeSizeStore.getState().setTradeSize(undefined);
    if (!keepAmount) {
      set({ srcTokenAmount: undefined });
    }
    useLimitPriceStore.getState().reset();
  },
  setSrcTokenAmount: (srcTokenAmount) => {
    const tradeSizeState = useTradeSizeStore.getState();
    if (srcTokenAmount && tradeSizeState.tradeSize && tradeSizeState.tradeSize.gt(srcTokenAmount)) {
      tradeSizeState.setTradeSize(srcTokenAmount);
    }
    set({ srcTokenAmount });
  },
  reset: () => set(srcTokenInitialState),
  onChange: async (amountUi: string) => {
    const srcTokenAmount = await getUiAmountToBigNumber(get().srcToken, amountUi);
    const srcTokenAmountUi = await getBigNumberToUiAmount(get().srcToken, srcTokenAmount);
    get().setSrcTokenAmount(srcTokenAmount);
    set({ srcTokenAmountUi });
  },
}));

export const useDstTokenStore = create<DstTokenState>((set) => ({
  ...dstTokenInitialState,
  setDstToken: (dstTokenInfo) => {
    useLimitPriceStore.getState().reset();
    set({ dstTokenInfo, dstToken: getToken(dstTokenInfo) });
  },

  reset: () => set(dstTokenInitialState),
}));

export const useMaxDurationStore = create<MaxDurationState>((set, get) => ({
  ...maxDurationInitialState,
  reset: () => set(maxDurationInitialState),
  computed: {
    get deadline() {
      const now = moment().valueOf();
      return now + moment(get().millis).add(60_000, "milliseconds").valueOf();
    },
    get deadlineUi() {
      return moment(get().computed.deadline).format("DD/MM/YYYY HH:mm");
    },
  },
  onChange: (timeFormat: TimeFormat, millis: number) => {
    useTradeIntervalStore.getState().onDrivedChange(millis, useTradeSizeStore.getState().totalTrades);
    set({ millis, timeFormat });
  },
}));

export const useTradeIntervalStore = create<TradeIntervalState>((set, get) => ({
  ...tradeIntervalInitialState,
  setCustomInterval: (customInterval) => set({ customInterval }),
  reset: () => set(tradeIntervalInitialState),
  onChange: (timeFormat: TimeFormat, millis: number) => {
    set({ millis, timeFormat });
  },
  onDrivedChange: (maxDurationMillis: number, totalTrades: number) => {
    if (get().customInterval) {
      return;
    }
    const { derivedMillis, derivedTimeFormat } = getDerivedTradeInterval(maxDurationMillis, totalTrades || 0);
    set({ millis: derivedMillis, timeFormat: derivedTimeFormat });
  },
  computed: {
    get intervalUi() {
      return getIntervalForUi(get().millis);
    },
  },
}));

export const useLimitPriceStore = create<PriceState>((set, get) => ({
  ...priceInitialState,
  setLimitPrice: (limitPrice) => set({ limitPrice }),
  toggleLimit: (limitPrice) => set({ isLimitOrder: !get().isLimitOrder, limitPrice }),
  reset: () => set(priceInitialState),
  hideLimit: () => set({ isLimitOrder: false }),
}));

export const useTradeSizeStore = create<TradeSizeState>((set, get) => ({
  ...tradeSizeInitialState,
  setTradeSize: async (tradeSize) => {
    const srcToken = useSrcTokenStore.getState().srcToken;
    const tradeSizeUi = await getBigNumberToUiAmount(srcToken, tradeSize);
    const srcTokenAmount = useSrcTokenStore.getState().srcTokenAmount;
    if (!tradeSize || tradeSize.isZero()) {
      return 0;
    }
    const totalTrades = srcTokenAmount?.div(tradeSize).integerValue(BigNumber.ROUND_CEIL).toNumber() || 0;
    set({ totalTrades });
    set({ tradeSize, tradeSizeUi: tradeSizeUi || "" });
    useTradeIntervalStore.getState().onDrivedChange(useMaxDurationStore.getState().millis, totalTrades);
  },
  reset: () => set(tradeSizeInitialState),
  totalTrades: 0,
  onChange: async (amountUi?: string) => {
    const srcToken = useSrcTokenStore.getState().srcToken;
    const tradeSize = await getUiAmountToBigNumber(srcToken, amountUi);
    get().setTradeSize(tradeSize);
  },
}));

export const useWeb3Store = create<Web3State>((set) => ({
  web3: undefined,
  setWeb3: (web3) => set({ web3 }),
  account: undefined,
  setAccount: (account) => set({ account }),
  chain: undefined,
  setChain: (chain) => set({ chain }),
  integrationChain: undefined,
  integrationKey: undefined,
  setIntegrationChain: (integrationChain) => set({ integrationChain }),
  setIntegrationKey: (integrationKey) => set({ integrationKey }),
}));

const useTokenApproval = () => {
  const { account, chain, config } = useWeb3();
  const { srcToken, srcTokenAmount } = useSrcTokenStore();

  const spender = config ? config.twapAddress : undefined;

  const { data: allowance, refetch } = useQuery(["allowance", account, srcToken?.address], async () => BigNumber(await srcToken!.methods.allowance(account!, spender!).call()), {
    enabled: !!account && !!chain && !!spender && !!srcToken && !!srcTokenAmount,
    refetchInterval: 5_000,
  });

  const { mutate: approve, isLoading: approveLoading } = useMutation(async () => {
    await srcToken?.methods.approve(spender!, srcTokenAmount!.toString()).send({ from: account });
    await new Promise((r) => setTimeout(r, 3000));
    await refetch();
  });

  return {
    isApproved: !srcTokenAmount ? false : allowance?.gte(srcTokenAmount || 0),
    approve,
    approveLoading,
  };
};

const useWrapToken = () => {
  const { srcTokenAmount, setSrcToken, srcTokenInfo } = useSrcTokenStore();
  const { account, config } = useWeb3();

  const { mutateAsync: wrap, isLoading } = useMutation(async () => {
    const wToken: any = getToken(config!.wrappedTokenInfo, true);

    await wToken?.methods.deposit().send({ from: account, value: srcTokenAmount!.toString() });
    setSrcToken(config!.wrappedTokenInfo);
  });

  return {
    wrap,
    shouldWrap: isNativeToken(srcTokenInfo?.address),
    isLoading,
  };
};

export const useWeb3 = () => {
  const { setWeb3, web3, setAccount, account, setChain, chain, setIntegrationChain, integrationChain, integrationKey, setIntegrationKey } = useWeb3Store();

  const init = async (_integrationKey: string, provider?: any, integrationChainId?: number) => {
    const newWeb3 = provider ? new Web3(provider) : undefined;
    setWeb3(newWeb3);
    setWeb3Instance(newWeb3);
    setAccount(newWeb3 ? await candiesAccount() : undefined);
    setChain(newWeb3 ? await newWeb3.eth.getChainId() : undefined);
    setIntegrationChain(integrationChainId);
    setIntegrationKey(_integrationKey);
  };

  const rawConfig = _.get(TwapConfig, [integrationChain || ""]);

  return {
    init,
    web3,
    account,
    chain,
    integrationChain,
    isInvalidChain: chain && chain !== integrationChain,
    changeNetwork: () => changeNetwork(web3, integrationChain),
    config: _.merge(rawConfig, _.get(rawConfig, [integrationKey || ""])),
    ellipsisAccount: makeEllipsisAddress(account),
  };
};

const useAccountBalances = (token?: Token) => {
  const { account, isInvalidChain, web3 } = useWeb3();

  return useQuery(
    ["useAccountBalances", token?.address, account],
    async () => {
      if (isNativeToken(token!.address)) {
        return BigNumber((await web3?.eth.getBalance(account!)) || 0);
      }
      return BigNumber(await token!.methods.balanceOf(account!).call());
    },
    { enabled: !!token && !!account && !isInvalidChain, refetchInterval: 30_000 }
  );
};

const useActionHandlers = () => {
  const { srcToken, onChange } = useSrcTokenStore();
  const { data: balance } = useAccountBalances(srcToken);

  const onChangePercent = async (percent: number) => {
    const value = balance?.multipliedBy(percent) || zero;
    const uiValue = await getBigNumberToUiAmount(srcToken, value);
    onChange(uiValue);
  };

  return { onChangePercent };
};

const useDstTokenAmount = () => {
  const { srcTokenInfo, srcTokenAmount, srcToken } = useSrcTokenStore();
  const { dstTokenInfo, dstToken } = useDstTokenStore();
  const { limitPrice } = useLimitPriceStore();
  const { data: dstTokenUsdValue18 } = useUsdValue(dstToken);
  const { data: srcTokenUsdValue18 } = useUsdValue(srcToken);

  const srcTokenDecimals = srcTokenInfo?.decimals;
  const dstTokenDecimals = dstTokenInfo?.decimals;

  return useMemo(() => {
    if (!srcTokenAmount || srcTokenAmount.isZero() || !srcToken || !dstToken || !srcTokenDecimals || !dstTokenDecimals) {
      return undefined;
    }
    let res;
    if (limitPrice) {
      res = srcTokenAmount.times(limitPrice);
    } else {
      res = srcTokenAmount.times(srcTokenUsdValue18 || 0).div(dstTokenUsdValue18 || 1);
    }
    return convertDecimals(res, srcTokenDecimals, dstTokenDecimals);
  }, [srcTokenDecimals, dstTokenDecimals, srcTokenAmount, srcToken, dstToken, limitPrice, dstTokenUsdValue18, srcTokenUsdValue18]);
};

/**
 * @returns USD value for 1 whole token (mantissa)
 */
export const useUsdValue = (token?: Token) => {
  const { isInvalidChain, config, web3 } = useWeb3();
  const { getUsdPrice } = useContext(TwapContext);
  return useQuery(
    ["useUsdValue", token?.address],
    async () => {
      const decimals = await token!.decimals();
      const address = isNativeToken(token!.address) ? config?.wrappedTokenInfo.address : token!.address;
      return getUsdPrice(address!, decimals);
    },
    {
      enabled: !!token && !isInvalidChain && !!web3,
      // refetchInterval: 10000
      staleTime: 60_000,
    }
  );
};

// all actions (functions) related to max duration input
const useMaxDuration = () => {
  const {
    timeFormat,
    millis,
    onChange,
    computed: { deadline, deadlineUi },
  } = useMaxDurationStore();

  return {
    onChange,
    maxDurationTimeFormat: timeFormat,
    maxDurationMillis: millis,
    deadline,
    deadlineUi,
  };
};

const useTradeInterval = () => {
  const { customInterval, computed, setCustomInterval, onChange, millis, timeFormat } = useTradeIntervalStore();

  return {
    tradeIntervalMillis: millis,
    tradeIntervalTimeFormat: timeFormat,
    customInterval,
    onChange,
    onCustomIntervalClick: () => setCustomInterval(true),
    tradeIntervalUi: computed.intervalUi,
  };
};

// all data related to trade size input
const useTradeSize = () => {
  const { srcToken, srcTokenAmountUi, srcTokenInfo } = useSrcTokenStore();
  const { data: srcTokenUsdValue18, isLoading: usdPriceLoading } = useUsdValue(srcToken);
  const { tradeSize, onChange, tradeSizeUi: uiTradeSize, totalTrades } = useTradeSizeStore();

  return {
    totalTrades,
    uiTradeSize,
    onChange,
    uiUsdValue: useGetBigNumberToUiAmount(srcToken, !srcTokenUsdValue18 ? undefined : tradeSize?.times(srcTokenUsdValue18).div(1e18)),
    usdPriceLoading,
    maxValue: srcTokenAmountUi,
    logoUrl: srcTokenInfo?.logoUrl,
    symbol: srcTokenInfo?.symbol,
  };
};

const useChangeTokenPositions = () => {
  const { srcTokenInfo, setSrcTokenAmount, setSrcToken } = useSrcTokenStore();
  const { setDstToken, dstTokenInfo } = useDstTokenStore();
  const dstTokenAmount = useDstTokenAmount();

  return () => {
    setSrcTokenAmount(dstTokenAmount);
    setSrcToken(dstTokenInfo, true);
    setDstToken(srcTokenInfo);
  };
};

export const useLimitPrice = () => {
  const { isLimitOrder, limitPrice, toggleLimit, setLimitPrice } = useLimitPriceStore();
  const { srcTokenInfo } = useSrcTokenStore();
  const { dstTokenInfo } = useDstTokenStore();
  const [inverted, setInverted] = useState(false);
  const { marketPrice } = useMarketPrice();
  const [limitPriceUI, setlimitPriceUI] = useState<BigNumber | undefined>(limitPrice);
  const [invertedUI, setInvertedUI] = useState(false);

  const leftTokenInfo = inverted ? dstTokenInfo : srcTokenInfo;
  const rightTokenInfo = !inverted ? dstTokenInfo : srcTokenInfo;

  const onChange = (amountUi?: string) => {
    setLimitPrice(amountUi ? BigNumber(amountUi) : undefined);
    setlimitPriceUI(amountUi ? BigNumber(amountUi) : undefined);
    setInvertedUI(false);
  };

  const onToggleLimit = () => {
    toggleLimit(marketPrice);
    setlimitPriceUI(marketPrice);
    setInvertedUI(false);
    setInverted(false);
  };

  const toggleInverted = () => {
    setInverted(!inverted);
    if (!invertedUI) {
      setlimitPriceUI(BigNumber(1).div(limitPrice || 1));
    } else {
      setlimitPriceUI(limitPrice);
    }
    setInvertedUI(!invertedUI);
  };

  return {
    isLimitOrder,
    onToggleLimit,
    toggleInverted,
    onChange,
    leftTokenInfo,
    rightTokenInfo,
    limitPriceUI: limitPriceUI?.toFormat(),
    limitPrice,
  };
};

const useMarketPrice = () => {
  const [inverted, setInverted] = useState(false);
  const { srcToken, srcTokenInfo } = useSrcTokenStore();
  const { dstToken, dstTokenInfo } = useDstTokenStore();

  const { data: srcTokenUsdValue18 } = useUsdValue(srcToken);
  const { data: dstTokenUsdValue18 } = useUsdValue(dstToken);

  const leftToken = inverted ? dstToken : srcToken;
  const rightToken = !inverted ? dstToken : srcToken;

  const leftTokenInfo = inverted ? dstTokenInfo : srcTokenInfo;
  const rightTokenInfo = !inverted ? dstTokenInfo : srcTokenInfo;

  const leftUsdValue = inverted ? dstTokenUsdValue18 : srcTokenUsdValue18;
  const rightUsdValue = !inverted ? dstTokenUsdValue18 : srcTokenUsdValue18;

  const marketPrice = leftUsdValue && rightUsdValue && leftUsdValue.div(rightUsdValue);

  return {
    marketPrice: leftToken && rightToken ? marketPrice : undefined,
    toggleInverted: () => setInverted((prevState) => !prevState),
    leftToken,
    rightToken,
    inverted,
    leftTokenInfo,
    rightTokenInfo,
  };
};

export const useSubmitButtonValidation = () => {
  const { srcTokenAmount, srcToken, srcTokenAmountUi, srcTokenInfo } = useSrcTokenStore();
  const { maxDurationMillis } = useMaxDuration();
  const tradeIntervalMillis = useTradeIntervalStore((state) => state.millis);
  const { tradeSize } = useTradeSizeStore();
  const { data: srcTokenUsdValue18 } = useUsdValue(srcToken);
  const { data: srcTokenBalance } = useAccountBalances(srcToken);

  return useMemo(() => {
    if (!srcToken) {
      return "Select token";
    }
    if (!srcTokenAmount || srcTokenAmount?.isZero()) {
      return "Enter amount";
    }
    if (srcTokenBalance && srcTokenAmount.gt(srcTokenBalance)) {
      return "Insufficient funds";
    }

    if (!tradeSize || tradeSize?.isZero()) {
      return "Enter trade size";
    }

    if (maxDurationMillis === 0) {
      return "Enter duration";
    }

    if (tradeIntervalMillis === 0) {
      return "Enter trade interval";
    }

    if (tradeSize?.gt(srcTokenAmount || zero)) {
      return `Maximum trade size is ${srcTokenAmountUi}`;
    }

    if (tradeIntervalMillis === 0) {
      return "Enter trade interval";
    }

    if (srcTokenAmount && tradeSize && srcTokenUsdValue18 && srcTokenInfo && isTradeSizeTooSmall(srcTokenAmount, tradeSize, srcTokenUsdValue18, srcTokenInfo)) {
      return `Trazde size must be equal to at least 1 USD`;
    }
  }, [srcTokenAmount, srcTokenUsdValue18, tradeSize, srcTokenAmount, tradeIntervalMillis, maxDurationMillis, srcToken, srcTokenInfo, srcTokenAmountUi]);
};

const isTradeSizeTooSmall = (srcTokenAmount: BigNumber, tradeSize: BigNumber, srcTokenUsdValue18: BigNumber, srcTokenInfo: TokenInfo) => {
  const smallestTradeSize = srcTokenAmount.modulo(tradeSize).eq(0) ? tradeSize : srcTokenAmount.modulo(tradeSize);
  return smallestTradeSize?.times(srcTokenUsdValue18).div(1e18).lt(1e18);
};

const usePartialFillValidation = () => {
  const tradeIntervalMillis = useTradeIntervalStore((state) => state.millis);
  const { totalTrades } = useTradeSize();
  const { maxDurationMillis } = useMaxDuration();

  return useMemo(() => {
    if (!totalTrades || totalTrades === 0 || !tradeIntervalMillis || !maxDurationMillis) {
      return;
    }

    const showWarning = BigNumber(tradeIntervalMillis).times(totalTrades).gt(BigNumber(maxDurationMillis));

    if (showWarning) {
      return "Partial fill warning";
    }
  }, []);
};

const resetState = () => {
  useTradeSizeStore.getState().reset();
  useSrcTokenStore.getState().reset();
  useDstTokenStore.getState().reset();
  useMaxDurationStore.getState().reset();
  useTradeIntervalStore.getState().reset();
  useLimitPriceStore.getState().reset();
  useGlobalState.getState().reset();
};

function useSubmitOrder() {
  const warning = useSubmitButtonValidation();
  const { isApproved, approve, approveLoading } = useTokenApproval();
  const { isInvalidChain, changeNetwork, config, account } = useWeb3();
  const { wrap, shouldWrap, isLoading: wrapLoading } = useWrapToken();
  const { connect } = useContext(TwapContext);
  const { showConfirmation, setShowConfirmation, disclaimerAccepted } = useGlobalState();

  const { srcTokenInfo, dstTokenInfo, srcTokenAmount, tradeSize, minAmountOut, deadline, tradeIntervalMillis } = useConfirmation();

  const { mutate: createOrder, isLoading: createdOrderLoading } = useMutation(
    async () => {
      const twap = contract(twapAbi as Abi, config.twapAddress);

      return twap.methods
        .ask(
          config.exchangeAddress,
          srcTokenInfo?.address,
          dstTokenInfo?.address,
          srcTokenAmount?.toString(),
          tradeSize?.toString(),
          minAmountOut.toString(),
          Math.round(deadline / 1000),
          Math.round(tradeIntervalMillis / 1000)
        )
        .send({ from: account });
    },
    {
      onSuccess: () => {
        resetState();
      },
    }
  );

  const values = useMemo(() => {
    if (!account) {
      return { text: "Connect wallet", onClick: connect };
    }
    if (isInvalidChain) {
      return { text: "Switch network", onClick: changeNetwork };
    }
    if (warning) {
      return { text: warning, onClick: () => {}, disabled: true };
    }
    if (shouldWrap) {
      return { text: "Wrap", onClick: wrap, loading: wrapLoading };
    }
    if (!isApproved) {
      return { text: "Approve", onClick: approve, loading: approveLoading };
    }
    if (!showConfirmation) {
      return { text: "Place order", onClick: () => setShowConfirmation(true) };
    }

    return { text: "Confirm order", onClick: createOrder, loading: createdOrderLoading, disabled: !disclaimerAccepted };
  }, [
    wrapLoading,
    disclaimerAccepted,
    isApproved,
    shouldWrap,
    warning,
    isInvalidChain,
    account,
    approveLoading,
    setShowConfirmation,
    showConfirmation,
    createdOrderLoading,
    createOrder,
  ]);

  return { ...values, showConfirmation };
}

export const useTokenPanel = (isSrcToken?: boolean) => {
  const { srcToken, setSrcToken, srcTokenInfo, srcTokenAmountUi, onChange, srcTokenAmount } = useSrcTokenStore();
  const { dstToken, setDstToken, dstTokenInfo } = useDstTokenStore();
  const { isLimitOrder } = useLimitPriceStore();
  const [tokenListOpen, setTokenListOpen] = useState(false);
  const destTokenAmount = useDstTokenAmount();
  const { data: srcTokenBalance, isLoading: srcTokenBalanceLoading } = useAccountBalances(srcToken);
  const { data: dstTokenBalance, isLoading: dstTokenBalanceLoading } = useAccountBalances(dstToken);
  const { data: srcTokenUsdValue, isLoading: srcTokenUsdValueLoading } = useUsdValue(srcToken);
  const { data: dstTokenUsdValue, isLoading: dstTokenUsdValueLoading } = useUsdValue(dstToken);
  const { TokenSelectModal }: { TokenSelectModal: any } = useContext(TwapContext);

  const onSelect = useCallback(
    (token: TokenInfo) => {
      if (isSrcToken) {
        setSrcToken(token);
      } else {
        setDstToken(token);
      }
      setTokenListOpen(false);
    },
    [isSrcToken, setTokenListOpen]
  );

  const dstTokenValueUi = useGetBigNumberToUiAmount(dstToken, destTokenAmount) || "0";
  const srcTokenValue = srcTokenUsdValueLoading ? " " : srcTokenAmountUi;
  const dstTokenValue = dstTokenUsdValueLoading ? " " : dstTokenValueUi;

  const srcTokenBalanceUi = useGetBigNumberToUiAmount(srcToken, srcTokenBalance);
  const dstTokenBalanceUi = useGetBigNumberToUiAmount(dstToken, dstTokenBalance);
  const srcTokenUsdValueUi = useGetBigNumberToUiAmount(srcToken, srcTokenAmount?.times(srcTokenUsdValue || 0).div(1e18));
  const dstTokenUsdValueUi = useGetBigNumberToUiAmount(dstToken, destTokenAmount?.times(dstTokenUsdValue || 0).div(1e18));

  return {
    selectedToken: isSrcToken ? srcTokenInfo : dstTokenInfo,
    value: isSrcToken ? srcTokenValue : dstTokenValue,
    onChange: isSrcToken ? onChange : null,
    balance: isSrcToken ? srcTokenBalanceUi : dstTokenBalanceUi,
    balanceLoading: isSrcToken ? srcTokenBalanceLoading : dstTokenBalanceLoading,
    disabled: !isSrcToken,
    usdValue: isSrcToken ? srcTokenUsdValueUi : dstTokenUsdValueUi,
    usdValueLoading: isSrcToken ? srcTokenUsdValueLoading && !!srcTokenAmount : dstTokenUsdValueLoading && !!destTokenAmount,
    onSelect,
    tokenListOpen,
    toggleTokenList: (value: boolean) => setTokenListOpen(value),
    amountPrefix: isSrcToken ? "" : isLimitOrder ? "≥" : "~",
    TokenSelectModal,
  };
};

const useConfirmation = () => {
  const {
    computed: { deadlineUi, deadline },
  } = useMaxDurationStore();
  const {
    computed: { intervalUi },
    millis: tradeIntervalMillis,
  } = useTradeIntervalStore();
  const { totalTrades, tradeSizeUi, tradeSize } = useTradeSizeStore();
  const { srcToken, srcTokenAmountUi, srcTokenInfo, srcTokenAmount } = useSrcTokenStore();
  const { dstTokenInfo, dstToken } = useDstTokenStore();
  const { limitPrice, isLimitOrder } = useLimitPriceStore();
  const { showConfirmation, setShowConfirmation, disclaimerAccepted, setDisclaimerAccepted } = useGlobalState();
  const { data: srcTokenUsdValue18 } = useUsdValue(srcToken);
  const { data: dstTokenUsdValue18 } = useUsdValue(dstToken);
  const dstTokenAmount = useDstTokenAmount();

  const minAmountOut = useMemo(() => {
    if (!isLimitOrder) {
      return BigNumber(1);
    }
    return convertDecimals(tradeSize?.times(limitPrice || 0) || 0, srcTokenInfo?.decimals || 0, dstTokenInfo?.decimals || 0);
  }, [isLimitOrder, limitPrice, tradeSize, srcTokenInfo, dstTokenInfo]);

  const result = {
    deadlineUi,
    tradeIntervalUi: intervalUi,
    totalTrades,
    uiTradeSize: tradeSizeUi,
    srcTokenUsdValue: useGetBigNumberToUiAmount(srcToken, !srcTokenUsdValue18 ? undefined : srcTokenAmount?.times(srcTokenUsdValue18).div(1e18)),
    srcTokenUiAmount: srcTokenAmountUi,
    srcTokenInfo,
    dstTokenUsdValue: useGetBigNumberToUiAmount(dstToken, !dstTokenUsdValue18 ? undefined : dstTokenAmount?.times(dstTokenUsdValue18).div(1e18)),
    dstTokenUiAmount: useGetBigNumberToUiAmount(dstToken, dstTokenAmount),
    dstTokenInfo,
    minAmountOut,
    minAmountOutUi: useGetBigNumberToUiAmount(dstToken, minAmountOut),
    isLimitOrder,
    srcTokenAmount,
    tradeSize,
    deadline,
    tradeIntervalMillis,
    showConfirmation,
    closeConfirmation: () => setShowConfirmation(false),
    disclaimerAccepted,
    setDisclaimerAccepted,
  };

  const isValid = _.every(_.values(result));

  return result;
};

const useLimitPriceToggleValidation = () => {
  const { srcTokenInfo } = useSrcTokenStore();
  const { dstTokenInfo } = useDstTokenStore();

  return useMemo(() => {
    if (!srcTokenInfo) {
      return "Select source token";
    }
    if (!dstTokenInfo) {
      return "Select destination token";
    }
  }, [srcTokenInfo, dstTokenInfo]);
};

// all hooks with state, export state only from here
export const store = {
  useActionHandlers,
  useMaxDuration,
  useTradeInterval,
  useLimitPrice,
  useTradeSize,
  useChangeTokenPositions,
  useMarketPrice,
  reset: resetState,
  useTokenApproval,
  useAccountBalances,
  useWeb3,
  useWrapToken,
  useSubmitOrder,
  useTokenPanel,
  useConfirmation,
};

// all validation hooks
export const validation = {
  useSubmitButtonValidation,
  usePartialFillValidation,
  useLimitPriceToggleValidation,
};

const getDerivedTradeInterval = (maxDurationMillis: number, totalTrades: number) => {
  if (maxDurationMillis > 0 && totalTrades > 0) {
    const derivedMillis = Math.max(maxDurationMillis / totalTrades, 60_000);

    return {
      derivedMillis,
      derivedTimeFormat: TimeFormat.valueOf(derivedMillis),
    };
  } else {
    return {
      derivedMillis: 0,
      derivedTimeFormat: TimeFormat.Minutes,
    };
  }
};

export const getBigNumberToUiAmount = async (token?: Token, amount?: BigNumber) => {
  if (!amount || !token) {
    return " ";
  }

  return (await token.mantissa(amount || zero)).toFormat();
};

export const useGetBigNumberToUiAmount = (token?: Token, amount?: BigNumber) => {
  return useQuery(
    [`useGetBigNumberToUiAmount`, token?.address, amount?.toString()],
    () => {
      return getBigNumberToUiAmount(token, amount) || " ";
    },
    { enabled: !!token }
  ).data;
};

export const getUiAmountToBigNumber = async (token?: Token, amountUi?: string) => {
  if (amountUi === "" || !token) {
    return undefined;
  }
  return token?.amount(parsebn(amountUi || "0"));
};

const isNativeToken = (address?: string) => {
  if (!address) {
    return false;
  }

  return !!nativeAddresses.find((it) => eqIgnoreCase(address, it));
};

export const getIntervalForUi = (value?: number) => {
  if (!value) {
    return "0";
  }
  const time = moment.duration(value);
  const days = time.days();
  const hours = time.hours();
  const minutes = time.minutes();
  const seconds = time.seconds();

  let arr: string[] = [];

  if (days) {
    arr.push(`${days} Days `);
  }
  if (hours) {
    arr.push(`${hours} Hours `);
  }
  if (minutes) {
    arr.push(`${minutes} Minutes`);
  }
  if (seconds) {
    arr.push(`${seconds} Seconds`);
  }
  return arr.join(" ");
};

export const makeEllipsisAddress = (address?: string, padding: number = 6): string => {
  if (!address) return "";
  const firstPart = address.substring(0, padding);
  const secondPart = address.substring(address.length - padding);
  return `${firstPart}...${secondPart}`;
};

export const getToken = (tokenInfo?: TokenInfo, isWrapped?: boolean) => {
  return erc20(tokenInfo!.symbol, tokenInfo!.address, tokenInfo!.decimals, isWrapped ? iwethabi : undefined);
};
