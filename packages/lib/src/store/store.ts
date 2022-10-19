import _ from "lodash";
import { account as candiesAccount, BigNumber, bn, convertDecimals, eqIgnoreCase, erc20, erc20s, parsebn, setWeb3Instance, Token, zero, zeroAddress } from "@defi.org/web3-candies";
import axios from "axios";
import { useMutation, useQuery } from "react-query";
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import Web3 from "web3";
import { DstTokenState, MaxDurationState, PriceState, SrcTokenState, TokenInfo, TradeIntervalState, TradeSizeState, Web3State } from "../types";
import create from "zustand";
import { TimeFormat } from "./TimeFormat";
import { nativeAddresses, twapConfig } from "../consts";
import { changeNetwork } from "./connect";
import { TwapContext } from "../context";

const srcTokenInitialState = {
  token: undefined,
  amount: undefined,
};

const dstTokenInitialState = {
  token: undefined,
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
  price: undefined,
  showLimit: false,
};

const tradeSizeInitialState = {
  tradeSize: undefined,
};

export const useSrcTokenStore = create<SrcTokenState>((set) => ({
  ...srcTokenInitialState,
  setToken: (token) => set({ token }),
  setAmount: (amount) => set({ amount }),
  reset: () => set(srcTokenInitialState),
}));

export const useDstTokenStore = create<DstTokenState>((set) => ({
  ...dstTokenInitialState,
  setToken: (token) => set({ token }),
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

export const usePriceStore = create<PriceState>((set, get) => ({
  ...priceInitialState,
  setPrice: (price) => set({ price }),
  toggleLimit: () => set({ showLimit: !get().showLimit }),
  reset: () => set(priceInitialState),
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
  const { srcToken, srcTokenAmount } = useSrcToken();
  const spender = config ? config.twapAddress : undefined;

  const allowance = useQuery(["allowance", account, srcToken?.address], async () => BigNumber(await srcToken!.methods.allowance(account!, spender!).call()), {
    enabled: !!account && !!chain && !!spender && !!srcToken && !!srcTokenAmount,
    refetchInterval: 10_000,
  }).data;

  const { mutate: approve, isLoading: approveLoading } = useMutation(async () => srcToken?.methods.approve(spender!, srcTokenAmount!.toString()).send({ from: account }));

  return {
    isApproved: !srcTokenAmount ? false : allowance?.gte(srcTokenAmount || 0),
    approve,
    approveLoading,
  };
};

const useWrapToken = () => {
  const { srcTokenAmount, onSrcTokenSelect, srcTokenInfo } = useSrcToken();
  const { account, config } = useWeb3();
  const { token: wToken }: any = useTokenOrWrappedToken(srcTokenInfo);

  const { mutateAsync: wrap, isLoading } = useMutation(async () => {
    await wToken?.methods.deposit().send({ from: account, value: srcTokenAmount!.toString() });
    onSrcTokenSelect(config!.wrappedTokenInfo);
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
  const { setToken: setSrcToken, setAmount, token: srcTokenInfo, amount: srcTokenAmount } = useSrcTokenStore();
  const tradeSize = useTradeSizeStore().tradeSize;
  const { token } = useToken(srcTokenInfo);

  const { getBnAmount } = useUiAmountToBigNumber(token);
  const { getUiAmount } = useBigNumberToUiAmount(token);

  const setTradeSize = useTradeSizeStore().setTradeSize;

  const onChange = async (amountUi: string) => {
    const amount = await getBnAmount(amountUi);
    if (amount && tradeSize && tradeSize.gt(amount)) {
      setTradeSize(amount);
    }
    setAmount(amount);
  };

  const onChangePercent = async (percent: number) => {
    const value = balance?.multipliedBy(percent) || zero;
    const uiValue = await getUiAmount(value);
    onChange(uiValue);
  };

  const onSrcTokenSelect = useCallback(
    (token: TokenInfo) => {
      setSrcToken(token);
      setAmount(undefined);
    },
    [setSrcToken]
  );

  const { isLoading: usdValueLoading, data: usdValue } = useUsdValue(token);
  const { data: balance, isLoading: balanceLoading } = useAccountBalances(token);

  return {
    onSrcTokenSelect,
    setSrcTokenAmount: setAmount,
    setSrcToken,
    onChange,
    srcTokenInfo,
    srcToken: token,
    srcTokenAmount,
    srcTokenUiAmount: useBigNumberToUiAmount(token, srcTokenAmount).data,
    usdValueLoading: usdValueLoading && srcTokenAmount?.gt(zero) ? true : false,
    usdValue,
    uiUsdValue: useBigNumberToUiAmount(token, srcTokenAmount?.times(usdValue || 0)).data,
    balance,
    uiBalance: useBigNumberToUiAmount(token, balance).data || "0",
    balanceLoading,
    onChangePercent,
  };
};

// all actions (functions) related to src input
const useDstToken = () => {
  const { setToken: setDstToken, token: dstTokenInfo } = useDstTokenStore();
  const { srcTokenAmount, srcToken, usdValue: srcTokenUsdValue, srcTokenInfo, usdValueLoading: srcTokenUsdLoading } = useSrcToken();
  const { token: dstToken } = useToken(dstTokenInfo);
  const { isLoading: usdValueLoading, data: dstTokenUsdValue } = useUsdValue(dstToken);
  const amount = getDstAmount(srcToken, dstToken, srcTokenInfo?.decimals, dstTokenInfo?.decimals, srcTokenAmount, srcTokenUsdValue, dstTokenUsdValue);

  const { data: balance, isLoading: balanceLoading } = useAccountBalances(dstToken);

  const onDstTokenSelect = (token: TokenInfo) => {
    setDstToken(token);
  };

  const showAmount = !usdValueLoading && !srcTokenUsdLoading;

  return {
    onDstTokenSelect,
    setDstToken,
    dstTokenUiAmount: useBigNumberToUiAmount(dstToken, showAmount ? amount : undefined).data,
    dstTokenInfo,
    dstToken,
    amount,
    usdValueLoading: usdValueLoading && amount ? true : false,
    usdValue: dstTokenUsdValue,
    uiUsdValue: useBigNumberToUiAmount(dstToken, amount?.times(dstTokenUsdValue || 0)).data,
    balance,
    uiBalance: useBigNumberToUiAmount(dstToken, balance).data || "0",
    balanceLoading,
  };
};

const getDstAmount = (
  srcToken?: Token,
  dstToken?: Token,
  srcDecimals?: number,
  dstDecimals?: number,
  srcAmount?: BigNumber,
  srcTokenUsdValue?: BigNumber,
  dstTokenUsdValue?: BigNumber
) => {
  if (!srcAmount || srcAmount.isZero() || !srcToken || !dstToken || !srcDecimals || !dstDecimals) {
    return undefined;
  }
  const res = srcAmount?.times(srcTokenUsdValue || 0).div(dstTokenUsdValue || 1);
  return convertDecimals(res, srcDecimals, dstDecimals);
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
  const srcTokenAmount = useSrcToken().srcTokenAmount;
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

  return {
    setMaxDurationMillis: setMillis,
    setMaxDurationTimeFormat: setTimeFormat,
    onChange,
    maxDurationTimeFormat: timeFormat,
    maxDurationMillis: millis,
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

  return { tradeIntervalMillis, tradeIntervalTimeFormat, customInterval, onChange, onCustomIntervalClick: () => setCustomInterval(true) };
};

// all data related to trade size input
const useTradeSize = () => {
  const { srcToken, srcTokenAmount } = useSrcToken();
  const { tradeSize, setTradeSize } = useTradeSizeStore();
  const totalTrades = useTotalTrades();

  const { getBnAmount } = useUiAmountToBigNumber(srcToken);

  const onChange = async (amountUi?: string) => {
    const tradeSize = await getBnAmount(amountUi);
    if (!tradeSize) {
      setTradeSize(undefined);
    } else if (srcTokenAmount?.gt(zero) && tradeSize.gte(srcTokenAmount)) {
      setTradeSize(srcTokenAmount);
    } else {
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
      return erc20(tokenInfo!.symbol, tokenInfo!.address, tokenInfo!.decimals);
    },
    { enabled: !!tokenInfo }
  );
  return { token, isLoading: !token };
};

const useToken = (tokenInfo?: TokenInfo) => {
  const { data: token } = useQuery<Token>(
    ["useToken", tokenInfo?.address],
    () => {
      return erc20(tokenInfo!.symbol, tokenInfo!.address, tokenInfo!.decimals);
    },
    { enabled: !!tokenInfo }
  );
  return { token, isLoading: !token };
};

const useChangeTokenPositions = () => {
  const { srcTokenInfo, setSrcTokenAmount, setSrcToken } = useSrcToken();
  const { setDstToken, dstTokenInfo } = useDstToken();
  const { amount: dstTokenAmount } = useDstToken();
  const setTradeSize = useTradeSizeStore().setTradeSize;

  return () => {
    setSrcTokenAmount(dstTokenAmount);
    setSrcToken(dstTokenInfo);
    setDstToken(srcTokenInfo);
    setTradeSize(undefined);
  };
};

export const useLimitPrice = () => {
  const { showLimit, price, toggleLimit, setPrice } = usePriceStore();

  const onChange = (amountUi?: string) => {
    setPrice(amountUi ? BigNumber(amountUi) : undefined);
  };

  const onToggleLimit = () => {
    setPrice(marketPrice);
    toggleLimit();
  };

  const { marketPrice, leftToken, rightToken, toggleInverted, inverted, leftTokenInfo, rightTokenInfo } = useMarketPrice();

  return {
    showLimit,
    onToggleLimit,
    toggleInverted,
    onChange,
    leftToken,
    rightToken,
    leftTokenInfo,
    rightTokenInfo,
    uiPrice: price && inverted ? BigNumber(1).div(price).toFormat() : price?.toFormat(),
  };
};

const useMarketPrice = () => {
  const [inverted, setInverted] = useState(false);
  const { srcToken, srcTokenInfo } = useSrcToken();
  const { dstToken, dstTokenInfo } = useDstToken();

  const leftToken = inverted ? dstToken : srcToken;
  const rightToken = !inverted ? dstToken : srcToken;

  const leftTokenInfo = inverted ? dstTokenInfo : srcTokenInfo;
  const rightTokenInfo = !inverted ? dstTokenInfo : srcTokenInfo;

  const { data: leftUsdValue = BigNumber(0) } = useUsdValue(leftToken);
  const { data: rightUsdValue = BigNumber(1) } = useUsdValue(rightToken);
  const marketPrice = leftUsdValue.div(rightUsdValue);

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
  const { srcTokenAmount, balance: srcTokenBalance, srcToken } = useSrcToken();
  const tradeSize = useTradeSize().tradeSize;
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
      return "Trade size must be less than source amount";
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
  usePriceStore.getState().reset();
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
};

// all validation hooks
export const validation = {
  useSubmitButtonValidation,
  usePartialFillValidation,
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
