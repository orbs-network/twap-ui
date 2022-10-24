import _ from "lodash";
import { account as candiesAccount, BigNumber, bn, convertDecimals, eqIgnoreCase, erc20, parsebn, setWeb3Instance, Token, zero, zeroAddress } from "@defi.org/web3-candies";
import { useMutation, useQuery } from "react-query";
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import Web3 from "web3";
import { DstTokenState, MaxDurationState, PriceState, SrcTokenState, TokenInfo, TradeIntervalState, TradeSizeState, Web3State } from "../types";
import create from "zustand";
import { TimeFormat } from "./TimeFormat";
import { nativeAddresses, twapConfig } from "../consts";
import { changeNetwork } from "./connect";
import { TwapContext } from "../context";
import moment from "moment";

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

export const useSrcTokenStore = create<SrcTokenState>((set) => ({
  ...srcTokenInitialState,
  setSrcToken: (srcTokenInfo, keepAmount) => {
    set({ srcTokenInfo, srcToken: getToken(srcTokenInfo) });
    if (!keepAmount) {
      set({ srcTokenAmount: undefined });
    }
  },
  setSrcTokenAmount: (srcTokenAmount) => set({ srcTokenAmount }),
  reset: () => set(srcTokenInitialState),
}));

export const useDstTokenStore = create<DstTokenState>((set) => ({
  ...dstTokenInitialState,
  setDstToken: (dstTokenInfo) => set({ dstTokenInfo, dstToken: getToken(dstTokenInfo) }),
  reset: () => set(dstTokenInitialState),
}));

export const useMaxDurationStore = create<MaxDurationState>((set) => ({
  ...maxDurationInitialState,
  setMillis: (millis) => set({ millis }),
  setTimeFormat: (timeFormat) => set({ timeFormat }),
  reset: () => set(maxDurationInitialState),
}));

export const useTradeIntervalStore = create<TradeIntervalState>((set) => ({
  ...tradeIntervalInitialState,
  setMillis: (millis) => set({ millis }),
  setTimeFormat: (timeFormat) => set({ timeFormat }),
  setCustomInterval: (customInterval) => set({ customInterval }),
  reset: () => set(tradeIntervalInitialState),
}));

export const useLimitPriceStore = create<PriceState>((set, get) => ({
  ...priceInitialState,
  setLimitPrice: (limitPrice) => set({ limitPrice }),
  toggleLimit: (limitPrice) => set({ isLimitOrder: !get().isLimitOrder, limitPrice }),
  reset: () => set(priceInitialState),
  hideLimit: () => set({ isLimitOrder: false }),
}));

export const useTradeSizeStore = create<TradeSizeState>((set) => ({
  ...tradeSizeInitialState,
  setTradeSize: (tradeSize) => set({ tradeSize }),
  reset: () => set(tradeSizeInitialState),
}));

export const useWeb3Store = create<Web3State>((set) => ({
  web3: undefined,
  setWeb3: (web3) => set({ web3 }),
  account: undefined,
  setAccount: (account) => set({ account }),
  chain: undefined,
  setChain: (chain) => set({ chain }),
  integrationChain: undefined,
  setIntegrationChain: (integrationChain) => set({ integrationChain }),
}));

const useTokenApproval = () => {
  const { account, chain, config } = useWeb3();
  const { srcToken, srcTokenAmount } = useSrcTokenStore();
  const spender = config ? config.twapAddress : undefined;

  const { data: allowance, refetch } = useQuery(["allowance", account, srcToken?.address], async () => BigNumber(await srcToken!.methods.allowance(account!, spender!).call()), {
    enabled: !!account && !!chain && !!spender && !!srcToken && !!srcTokenAmount,
    refetchInterval: 10_000,
  });

  const { mutate: approve, isLoading: approveLoading } = useMutation(async () => {
    await srcToken?.methods.approve(spender!, srcTokenAmount!.toString()).send({ from: account });
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
  const { token: wToken }: any = useTokenOrWrappedToken(srcTokenInfo);

  const { mutateAsync: wrap, isLoading } = useMutation(async () => {
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
  const { setWeb3, web3, setAccount, account, setChain, chain, setIntegrationChain, integrationChain } = useWeb3Store();

  const init = async (integrationKey: string, provider?: any, integrationChainId?: number) => {
    const newWeb3 = provider ? new Web3(provider) : undefined;
    setWeb3(newWeb3);
    setWeb3Instance(newWeb3);
    setAccount(newWeb3 ? await candiesAccount() : undefined);
    setChain(newWeb3 ? await newWeb3.eth.getChainId() : undefined);
    setIntegrationChain(integrationChainId);
  };

  return {
    init,
    web3,
    account,
    chain,
    integrationChain,
    isInvalidChain: chain && chain !== integrationChain,
    changeNetwork: () => changeNetwork(web3, integrationChain),
    config: integrationChain ? twapConfig[integrationChain] : undefined,
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
    { enabled: !!token && !!account && !isInvalidChain, refetchInterval: 10_000 }
  );
};

// all actions (functions) related to src input
const useSrcToken = () => {
  const { setSrcToken, setSrcTokenAmount, srcTokenInfo, srcTokenAmount, srcToken } = useSrcTokenStore();
  const { tradeSize, setTradeSize } = useTradeSizeStore();
  const { reset } = useLimitPriceStore();

  const { getBnAmount } = useUiAmountToBigNumber(srcToken);
  const { getUiAmount } = useBigNumberToUiAmount(srcToken);

  const onChange = async (amountUi: string) => {
    const amount = await getBnAmount(amountUi);
    if (amount && tradeSize && tradeSize.gt(amount)) {
      setTradeSize(amount);
    }
    setSrcTokenAmount(amount);
  };

  const onChangePercent = async (percent: number) => {
    const value = balance?.multipliedBy(percent) || zero;
    const uiValue = await getUiAmount(value);
    onChange(uiValue);
  };

  const onSrcTokenSelect = (token: TokenInfo) => {
    setSrcToken(token);
    reset();
  };

  const { isLoading: usdValueLoading, data: usdValue } = useUsdValue(srcToken);
  const { data: balance, isLoading: balanceLoading } = useAccountBalances(srcToken);

  return {
    onSrcTokenSelect,
    setSrcTokenAmount,
    setSrcToken,
    onChange,
    srcTokenInfo,
    srcToken,
    srcTokenAmount,
    srcTokenUiAmount: useBigNumberToUiAmount(srcToken, srcTokenAmount).data,
    usdValueLoading: usdValueLoading && srcTokenAmount?.gt(zero) ? true : false,
    usdValue,
    uiUsdValue: useBigNumberToUiAmount(srcToken, srcTokenAmount?.times(usdValue || 0)).data,
    balance,
    uiBalance: useBigNumberToUiAmount(srcToken, balance).data,
    balanceLoading,
    onChangePercent,
  };
};

// all actions (functions) related to src input
const useDstToken = () => {
  const { setDstToken, dstTokenInfo, dstToken } = useDstTokenStore();
  const { isLoading: usdValueLoading, data: dstTokenUsdValue } = useUsdValue(dstToken);
  const { reset } = useLimitPriceStore();

  const { data: balance, isLoading: balanceLoading } = useAccountBalances(dstToken);

  const onDstTokenSelect = (token: TokenInfo) => {
    setDstToken(token);
    reset();
  };

  const showAmount = !usdValueLoading;
  const dstAmount = useDstAmount();
  return {
    onDstTokenSelect,
    setDstToken,
    dstTokenUiAmount: useBigNumberToUiAmount(dstToken, showAmount ? dstAmount : undefined).data,
    dstTokenInfo,
    dstToken,
    amount: dstAmount,
    usdValueLoading: usdValueLoading && dstAmount ? true : false,
    usdValue: dstTokenUsdValue,
    uiUsdValue: useBigNumberToUiAmount(dstToken, dstAmount?.times(dstTokenUsdValue || 0)).data,
    balance,
    uiBalance: useBigNumberToUiAmount(dstToken, balance).data,
    balanceLoading,
  };
};

const useDstAmount = () => {
  const { srcToken, srcTokenInfo, srcTokenAmount } = useSrcTokenStore();
  const { dstToken, dstTokenInfo } = useDstTokenStore();
  const { data: srcTokenUsdValue } = useUsdValue(srcToken);
  const { data: dstTokenUsdValue } = useUsdValue(dstToken);
  const { limitPrice } = useLimitPriceStore();

  const srcTokenDecimals = srcTokenInfo?.decimals;
  const dstTokenDecimals = dstTokenInfo?.decimals;

  if (!srcTokenAmount || srcTokenAmount.isZero() || !srcToken || !dstToken || !srcTokenDecimals || !dstTokenDecimals) {
    return undefined;
  }
  let res;
  if (limitPrice) {
    res = srcTokenAmount.times(limitPrice);
  } else {
    res = srcTokenAmount.times(srcTokenUsdValue || 0).div(dstTokenUsdValue || 1);
  }
  return convertDecimals(res, srcTokenDecimals, dstTokenDecimals);
};

const useUsdValue = (token?: Token) => {
  const { isInvalidChain, config } = useWeb3();
  const { getUsdPrice } = useContext(TwapContext);
  return useQuery(
    ["useUsdValue", token?.address],
    async () => {
      const decimals = await token!.decimals();
      const address = isNativeToken(token!.address) ? config?.wrappedTokenInfo.address : token!.address;
      return getUsdPrice(address!, decimals);
    },
    {
      enabled: !!token && !isInvalidChain,
      // refetchInterval: 10000
    }
  );
};

const useTotalTrades = () => {
  const tradeSize = useTradeSizeStore().tradeSize;
  const srcTokenAmount = useSrcTokenStore().srcTokenAmount;
  return useMemo(() => {
    if (!tradeSize || tradeSize.isZero()) {
      return 0;
    }
    BigNumber.config({ ROUNDING_MODE: BigNumber.ROUND_CEIL });
    return srcTokenAmount?.idiv(tradeSize).toNumber() || 0;
  }, [srcTokenAmount, tradeSize]);
};

// all actions (functions) related to max duration input
const useMaxDuration = () => {
  const { setMillis, setTimeFormat, timeFormat, millis } = useMaxDurationStore();

  const onChange = useCallback((timeFormat: TimeFormat, millis: number) => {
    setMillis(millis);
    setTimeFormat(timeFormat);
  }, []);

  const maxDurationWithExtraMinute = useMemo(() => {
    const now = moment().valueOf();
    return now + moment(millis).add(60_000, "milliseconds").valueOf();
  }, [millis]);

  return {
    setMaxDurationMillis: setMillis,
    setMaxDurationTimeFormat: setTimeFormat,
    onChange,
    maxDurationTimeFormat: timeFormat,
    maxDurationMillis: millis,
    maxDurationWithExtraMinute,
    maxDurationWithExtraMinuteUi: moment(maxDurationWithExtraMinute).format("DD/MM/YYYY HH:mm"),
  };
};

const useTradeInterval = () => {
  const { customInterval, millis, timeFormat, setMillis, setTimeFormat, setCustomInterval } = useTradeIntervalStore();
  const maxDurationMillis = useMaxDurationStore().millis;
  const totalTrades = useTotalTrades();

  const onChange = useCallback((timeFormat: TimeFormat, millis: number) => {
    setMillis(millis);
    setTimeFormat(timeFormat);
  }, []);

  const { derivedMillis, derivedTimeFormat } = useMemo(() => {
    return getDerivedTradeInterval(maxDurationMillis, totalTrades);
  }, [totalTrades, maxDurationMillis]);

  const tradeIntervalMillis = customInterval ? millis : derivedMillis;
  const tradeIntervalTimeFormat = customInterval ? timeFormat : derivedTimeFormat;

  return {
    tradeIntervalMillis,
    tradeIntervalTimeFormat,
    customInterval,
    onChange,
    onCustomIntervalClick: () => setCustomInterval(true),
    tradeIntervalUi: getIntervalForUi(tradeIntervalMillis),
  };
};

// all data related to trade size input
const useTradeSize = () => {
  const { srcToken } = useSrcTokenStore();
  const { tradeSize, setTradeSize } = useTradeSizeStore();
  const totalTrades = useTotalTrades();

  const { getBnAmount } = useUiAmountToBigNumber(srcToken);

  const onChange = async (amountUi?: string) => {
    const tradeSize = await getBnAmount(amountUi);
    if (!tradeSize) {
      setTradeSize(undefined);
    }
    // else if (srcTokenAmount?.gt(zero) && tradeSize.gte(srcTokenAmount)) {
    //   setTradeSize(srcTokenAmount);
    // }
    else {
      setTradeSize(tradeSize);
    }
  };

  const { isLoading: usdValueLoading, data: usdValue } = useUsdValue(srcToken);

  return {
    totalTrades,
    tradeSize,
    uiTradeSize: useBigNumberToUiAmount(srcToken, tradeSize).data,
    onChange,
    usdValue,
    usdValueLoading: usdValueLoading && tradeSize?.gt(zero) ? true : false,
    uiUsdValue: useBigNumberToUiAmount(srcToken, !usdValue ? undefined : tradeSize?.times(usdValue)).data,
    setTradeSize,
  };
};

const useTokenOrWrappedToken = (tokenInfo?: TokenInfo) => {
  const { config } = useWeb3();
  const { data: token } = useQuery<Token>(
    ["useTokenOrWrappedToken", tokenInfo?.address],
    () => {
      if (isNativeToken(tokenInfo?.address)) {
        tokenInfo = config?.wrappedTokenInfo;
      }
      return getToken(tokenInfo);
    },
    { enabled: !!tokenInfo }
  );
  return { token, isLoading: !token };
};

const useChangeTokenPositions = () => {
  const { srcTokenInfo, setSrcTokenAmount, setSrcToken } = useSrcTokenStore();
  const { setDstToken, dstTokenInfo } = useDstTokenStore();
  const dstTokenAmount = useDstAmount();
  const { setTradeSize } = useTradeSizeStore();

  return () => {
    setSrcTokenAmount(dstTokenAmount);
    setSrcToken(dstTokenInfo, true);
    setDstToken(srcTokenInfo);
    setTradeSize(undefined);
  };
};

export const useLimitPrice = () => {
  const { isLimitOrder, limitPrice, toggleLimit, setLimitPrice } = useLimitPriceStore();
  const { srcToken, srcTokenInfo } = useSrcTokenStore();
  const { dstToken, dstTokenInfo } = useDstTokenStore();
  const onChange = (amountUi?: string) => {
    setLimitPrice(amountUi ? BigNumber(amountUi) : undefined);
  };

  const { data: srcTokenUSD = BigNumber(0) } = useUsdValue(srcToken);
  const { data: dstTokenUSD = BigNumber(1) } = useUsdValue(dstToken);

  const { price, toggleInverted, inverted, leftTokenInfo, rightTokenInfo } = usePrice(srcTokenInfo, dstTokenInfo, srcTokenUSD, dstTokenUSD);

  const onToggleLimit = () => {
    toggleLimit(price);
  };

  return {
    isLimitOrder,
    onToggleLimit,
    toggleInverted,
    onChange,
    leftTokenInfo,
    rightTokenInfo,
    uiPrice: limitPrice && inverted ? BigNumber(1).div(limitPrice).toFormat() : limitPrice?.toFormat(),
  };
};

export const usePrice = (srcTokenInfo?: TokenInfo, dstTokenInfo?: TokenInfo, srcTokenPrice?: BigNumber, dstTokenPrice?: BigNumber) => {
  const [inverted, setInverted] = useState(false);

  const leftTokenInfo = inverted ? dstTokenInfo : srcTokenInfo;
  const rightTokenInfo = !inverted ? dstTokenInfo : srcTokenInfo;

  const price = srcTokenPrice && dstTokenPrice ? srcTokenPrice.div(dstTokenPrice) : undefined;
  const invertedPrice = dstTokenPrice && srcTokenPrice ? dstTokenPrice.div(srcTokenPrice) : undefined;

  return {
    price,
    toggleInverted: () => setInverted((prevState) => !prevState),
    inverted,
    leftTokenInfo,
    rightTokenInfo,
    uiPrice: inverted ? invertedPrice : price,
  };
};

// const useOrderHistoryPrice = (srcToken: TokenInfo, dstToken: TokenInfo, srcAmount:   ) => {

// }

const useMarketPrice = () => {
  const { srcTokenInfo, srcToken } = useSrcTokenStore();
  const { dstTokenInfo, dstToken } = useDstTokenStore();

  const { data: srcTokenUsdPrice = BigNumber(0) } = useUsdValue(srcToken);
  const { data: dstTokenUsdPrice = BigNumber(1) } = useUsdValue(dstToken);
  return usePrice(srcTokenInfo, dstTokenInfo, srcTokenUsdPrice, dstTokenUsdPrice);
};

// const useMarketPrice = () => {
//   const [inverted, setInverted] = useState(false);
//   const { srcToken, srcTokenInfo } = useSrcTokenStore();
//   const { dstToken, dstTokenInfo } = useDstTokenStore();

//   const leftToken = inverted ? dstToken : srcToken;
//   const rightToken = !inverted ? dstToken : srcToken;

//   const leftTokenInfo = inverted ? dstTokenInfo : srcTokenInfo;
//   const rightTokenInfo = !inverted ? dstTokenInfo : srcTokenInfo;

//   const { data: leftUsdValue = BigNumber(0) } = useUsdValue(leftToken);
//   const { data: rightUsdValue = BigNumber(1) } = useUsdValue(rightToken);
//   const marketPrice = leftUsdValue.div(rightUsdValue);

//   return {
//     marketPrice: leftToken && rightToken ? marketPrice : undefined,
//     toggleInverted: () => setInverted((prevState) => !prevState),
//     leftToken,
//     rightToken,
//     inverted,
//     leftTokenInfo,
//     rightTokenInfo,
//   };
// };

export const useSubmitButtonValidation = () => {
  const { srcTokenAmount, balance: srcTokenBalance, srcToken, srcTokenUiAmount } = useSrcToken();
  const tradeSize = useTradeSizeStore().tradeSize;
  const maxDurationMillis = useMaxDurationStore().millis;
  const tradeIntervalMillis = useTradeInterval().tradeIntervalMillis;

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
      return `Maximum trade size is ${srcTokenUiAmount}`;
    }
  }, [tradeSize, srcTokenAmount, tradeIntervalMillis, maxDurationMillis, srcToken]);
};

export const useSubmit = () => {
  return useMutation(async () => {
    return null;
  });
};

const usePartialFillValidation = () => {
  const { tradeIntervalMillis } = useTradeInterval();
  const totalTrades = useTotalTrades();
  const maxDurationMillis = useMaxDurationStore().millis;

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
};

function useSubmitOrder() {
  const warning = useSubmitButtonValidation();
  const { isApproved, approve, approveLoading } = useTokenApproval();
  const { isInvalidChain, changeNetwork, account } = useWeb3();
  const { wrap, shouldWrap, isLoading: wrapLoading } = useWrapToken();
  const { connect } = useContext(TwapContext);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const values = useMemo(() => {
    if (!account) {
      return { text: "Connect wallet", onClick: connect };
    }
    if (isInvalidChain) {
      return { text: "  Switch network", onClick: changeNetwork };
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

    return { text: "Place order", onClick: () => setShowConfirmation(true) };
  }, [isApproved, shouldWrap, warning, isInvalidChain, account, approveLoading, setShowConfirmation]);

  return { ...values, showConfirmation, closeConfirmation: () => setShowConfirmation(false) };
}

export const useTokenPanel = (isSrcToken?: boolean) => {
  const srcToken = useSrcToken();
  const dstToken = useDstToken();
  const { isLimitOrder } = useLimitPriceStore();
  const [tokenListOpen, setTokenListOpen] = useState(false);

  const onSelect = useCallback(
    (token: TokenInfo) => {
      if (isSrcToken) {
        srcToken.onSrcTokenSelect(token);
      } else {
        dstToken.onDstTokenSelect(token);
      }
      setTokenListOpen(false);
    },
    [isSrcToken, setTokenListOpen]
  );

  return {
    selectedToken: isSrcToken ? srcToken.srcTokenInfo : dstToken.dstTokenInfo,
    value: isSrcToken ? srcToken.srcTokenUiAmount : dstToken.dstTokenUiAmount,
    onChange: isSrcToken ? srcToken.onChange : null,
    balance: isSrcToken ? srcToken.uiBalance : dstToken.uiBalance,
    balanceLoading: isSrcToken ? srcToken.balanceLoading : dstToken.balanceLoading,
    disabled: isSrcToken ? false : true,
    usdValue: isSrcToken ? srcToken.uiUsdValue : dstToken.uiUsdValue,
    usdValueLoading: isSrcToken ? srcToken.usdValueLoading : dstToken.usdValueLoading,
    onSelect,
    tokenListOpen,
    toggleTokenList: (value: boolean) => setTokenListOpen(value),
    amountPrefix: isSrcToken ? "" : isLimitOrder ? "≥" : "~",
  };
};

const useConfirmation = () => {
  const { maxDurationWithExtraMinuteUi } = useMaxDuration();
  const { tradeIntervalUi } = useTradeInterval();
  const { totalTrades, uiTradeSize, tradeSize } = useTradeSize();
  const { uiUsdValue: srcTokenUsdValue, srcTokenUiAmount, srcTokenInfo } = useSrcToken();
  const { uiUsdValue: dstTokenUsdValue, dstTokenUiAmount, dstTokenInfo, dstToken } = useDstToken();
  const { limitPrice, isLimitOrder } = useLimitPriceStore();

  const onSubmit = () => {
    //
  };
  const minAmountOut = useMemo(() => {
    if (!isLimitOrder) {
      return BigNumber(1);
    }
    return convertDecimals(tradeSize?.times(limitPrice || 0) || 0, srcTokenInfo?.decimals || 0, dstTokenInfo?.decimals || 0);
  }, [isLimitOrder, limitPrice, tradeSize, srcTokenInfo, dstTokenInfo]);

  const result = {
    maxDurationWithExtraMinuteUi,
    tradeIntervalUi,
    totalTrades,
    uiTradeSize,
    srcTokenUsdValue,
    srcTokenUiAmount,
    srcTokenInfo,
    dstTokenUsdValue,
    dstTokenUiAmount,
    dstTokenInfo,
    minAmountOut,
    minAmountOutUi: useBigNumberToUiAmount(dstToken, minAmountOut).data,
    isLimitOrder,
  };

  const isValid = _.every(_.values(result));

  return isValid ? result : ({} as typeof result);
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
  useSrcToken,
  useDstToken,
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

const useBigNumberToUiAmount = (token?: Token, amount?: BigNumber) => {
  const [data, setData] = useState<string | undefined>(undefined);

  const getUiAmount = useCallback(
    async (amount?: BigNumber) => {
      if (!amount || !token) {
        return "";
      }

      return (await token.mantissa(amount || zero)).toFormat();
    },
    [token]
  );

  useEffect(() => {
    (async () => {
      if (!token) {
        return;
      }
      const result = await getUiAmount(amount);
      setData(result);
    })();
  }, [token, amount, getUiAmount]);

  return { data, getUiAmount };
};

const useUiAmountToBigNumber = (token?: Token, amountUi?: string) => {
  const [data, setData] = useState<BigNumber | undefined>(undefined);

  const getBnAmount = useCallback(
    async (amountUi?: string) => {
      if (amountUi === "" || !token) {
        return undefined;
      }
      return token?.amount(parsebn(amountUi || "0"));
    },
    [token]
  );

  useEffect(() => {
    (async () => {
      if (!token) {
        return;
      }
      const result = await getBnAmount(amountUi);
      setData(result);
    })();
  }, [token, amountUi, getBnAmount]);

  return { data, getBnAmount };
};

const isNativeToken = (address?: string) => {
  if (!address) {
    return false;
  }

  return !!nativeAddresses.find((it) => eqIgnoreCase(address, it));
};

const getIntervalForUi = (value?: number) => {
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

const getToken = (tokenInfo?: TokenInfo) => {
  return erc20(tokenInfo!.symbol, tokenInfo!.address, tokenInfo!.decimals);
};

enum OrderStatus {
  InProgress,
  Filled,
  Canceled,
}

const useOrdersHistory = (status: OrderStatus) => {
  const { account } = useWeb3();
};
