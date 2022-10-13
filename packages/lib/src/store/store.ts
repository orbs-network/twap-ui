import _ from "lodash";
import { account, BigNumber, bn, convertDecimals, erc20s, hasWeb3Instance, parsebn, setWeb3Instance, Token, web3, zero } from "@defi.org/web3-candies";
import axios from "axios";
import { useQuery } from "react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Web3 from "web3";
import { DstTokenState, MaxDurationState, PriceState, SrcTokenState, TradeIntervalState, TradeSizeState, Web3State } from "../types";
import create from "zustand";
import { TimeFormat } from "./TimeFormat";

const srcTokenInitialState = {
  address: undefined,
  amount: undefined,
};

const dstTokenInitialState = {
  address: undefined,
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
  setAddress: (address) => set({ address }),
  setAmount: (amount) => set({ amount }),
  reset: () => set(srcTokenInitialState),
}));

export const useDstTokenStore = create<DstTokenState>((set, get) => ({
  ...dstTokenInitialState,
  setAddress: (address) => set({ address }),
  reset: () => set(dstTokenInitialState),
}));

export const useMaxDurationStore = create<MaxDurationState>((set, get) => ({
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
}));

export const useWeb3 = () => {
  const { setWeb3, web3, setAccount, account } = useWeb3Store();

  const init = async (provider?: any) => {
    const newWeb3 = provider ? new Web3(provider) : undefined;
    setWeb3(newWeb3);
    setWeb3Instance(newWeb3);
    const _account = newWeb3 ? (await newWeb3.eth.getAccounts())[0] : undefined;
    setAccount(_account);
  };

  return {
    init,
    web3,
    account,
  };
};

const useAccountBalances = (address?: string) => {
  const { token } = useToken(address);
  const { account } = useWeb3();

  return useQuery(
    ["useAccountBalances", address, account],
    async () => {
      console.log('test');
      
      return BigNumber(await token!.methods.balanceOf(account!).call());
    },
    { enabled: !!token && !!account }
  );
};

// all actions (functions) related to src input
const useSrcToken = () => {
  const allTokens = useAllTokens();
  const { setAddress, setAmount, address: srcTokenAddress = _.first(allTokens)?.address, amount: srcTokenAmount } = useSrcTokenStore();
  const tradeSize = useTradeSizeStore().tradeSize;
  const { token } = useToken(srcTokenAddress);

  const setTradeSize = useTradeSizeStore().setTradeSize;

  const onChange = useCallback(
    async (amountUi: string) => {
      const amount = await getUiAmountToBigNumber(token, amountUi);
      if (amount && tradeSize && tradeSize.gt(amount)) {
        setTradeSize(amount);
      }
      setAmount(amount);
    },
    [token, tradeSize]
  );

  const { isLoading: usdValueLoading, data: usdValue } = useUsdValue(srcTokenAddress);
  const { data: balance, isLoading: balanceLoading } = useAccountBalances(srcTokenAddress);

  return {
    setSrcTokenAmount: setAmount,
    setSrcTokenAddress: setAddress,
    onChange,
    srcTokenAddress,
    srcTokenAmount,
    srcTokenUiAmount: useBigNumberToUiAmount(srcTokenAddress, srcTokenAmount),
    usdValueLoading,
    usdValue,
    uiUsdValue: useBigNumberToUiAmount(srcTokenAddress, srcTokenAmount?.times(usdValue || 0)),
    balance,
    uiBalance: useBigNumberToUiAmount(srcTokenAddress, balance) || "0",
    balanceLoading,
  };
};

// all actions (functions) related to src input
const useDstToken = () => {
  const allTokens = useAllTokens();

  const { setAddress, address = _.get(allTokens, [1])?.address } = useDstTokenStore();
  const { srcTokenAmount, srcTokenAddress, usdValue: srcTokenUsdValue } = useSrcToken();
  const { isLoading: usdValueLoading, data: dstTokenUsdValue } = useUsdValue(address);
  const { data: amount, isLoading } = useDstAmount(srcTokenAddress, address, srcTokenAmount, srcTokenUsdValue, dstTokenUsdValue);
  const { data: balance, isLoading: balanceLoading } = useAccountBalances(address);

  return {
    setDstTokenAddress: setAddress,
    dstTokenUiAmount: useBigNumberToUiAmount(address, amount),
    dstTokenAddress: address,
    amount,
    isLoading,
    usdValueLoading: usdValueLoading || isLoading,
    usdValue: dstTokenUsdValue,
    uiUsdValue: useBigNumberToUiAmount(address, amount?.times(dstTokenUsdValue || 0)),
    balance,
    uiBalance: useBigNumberToUiAmount(address, balance) || "0",
    balanceLoading,
  };
};

const useUsdValue = (address?: string, isEnabled?: boolean) => {
  return useQuery(
    ["useUsdValue", address],
    async () => {
      const result = await axios.get(`https://api.coingecko.com/api/v3/simple/token_price/fantom?contract_addresses=${address}&vs_currencies=usd `);
      const n = BigNumber(_.first(_.values(result.data)).usd);
      return n.gte(0) ? n : undefined;
    },
    {
      enabled: !!address,
      // refetchInterval: 10000
    }
  );
};

const useDstAmount = (srcAddress?: string, dstAddress?: string, srcAmount?: BigNumber, srcTokenUsdValue?: BigNumber, dstTokenUsdValue?: BigNumber) => {
  const { token: srcToken } = useToken(srcAddress);
  const { token: dstToken } = useToken(dstAddress);

  return useQuery(["useDstAmount", srcAddress, dstAddress, srcAmount], async () => {
    if (!srcAmount || srcAmount.isZero()) {
      return undefined;
    }
    const res = srcAmount?.times(srcTokenUsdValue || 0).div(dstTokenUsdValue || 1);
    return convertDecimals(res, await srcToken?.decimals()!, await dstToken?.decimals()!);
  });
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
  const { srcTokenAddress, srcTokenAmount } = useSrcToken();
  const { tradeSize, setTradeSize } = useTradeSizeStore();
  const totalTrades = useTotalTrades();
  const { token } = useToken(srcTokenAddress);

  const onChange = useCallback(
    async (amountUi?: string) => {
      const tradeSize = await getUiAmountToBigNumber(token, amountUi);
      if (!tradeSize) {
        setTradeSize(undefined);
      } else if (srcTokenAmount?.gt(zero) && tradeSize.gte(srcTokenAmount)) {
        setTradeSize(srcTokenAmount);
      } else {
        setTradeSize(tradeSize);
      }
    },
    [token, srcTokenAmount]
  );

  const { isLoading: usdValueLoading, data: usdValue } = useUsdValue(srcTokenAddress);

  return {
    totalTrades,
    tradeSize,
    uiTradeSize: useBigNumberToUiAmount(srcTokenAddress, tradeSize),
    onChange,
    usdValue,
    usdValueLoading,
    uiUsdValue: useBigNumberToUiAmount(srcTokenAddress, !usdValue ? undefined : tradeSize?.times(usdValue)),
  };
};


const useAllTokens = () => {
  const { web3 } = useWeb3();
  return useQuery(
    "useAllTokens",
    async () => {

      return _.map(erc20s.ftm, (it) => it());
    },
    { enabled: !!web3 }
  ).data;
};

export const useToken = (address?: string) => {
  const allTokens = useAllTokens();
  const { data: token } = useQuery(["useToken", address], () => _.find(allTokens, (t) => t.address === address), { enabled: !!allTokens });
  return { token, isLoading: !token };
};

const useBigNumberToUiAmount = (address?: string, amount?: BigNumber) => {
  const { token } = useToken(address);

  return useQuery(["useBigNumberToUiAmount", address, amount], () => getBigNumberToUiAmount(token, amount), {
    enabled: !!address,
    cacheTime: 0,
    staleTime: 0,
  }).data;
};

const useDstTokenAmount = () => {
  return useDstToken().amount;
};

const useChangeTokenPositions = () => {
  const { setSrcTokenAddress, setSrcTokenAmount, srcTokenAddress } = useSrcToken();
  const { setDstTokenAddress, dstTokenAddress } = useDstToken();
  const dstTokenAmount = useDstTokenAmount();
  const setTradeSize = useTradeSizeStore().setTradeSize;

  return () => {
    setSrcTokenAmount(dstTokenAmount);
    setSrcTokenAddress(dstTokenAddress);
    setDstTokenAddress(srcTokenAddress);
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

  const { marketPrice, leftTokenAddress, rightTokenAddress, toggleInverted, inverted } = useMarketPrice();

  return {
    showLimit,
    onToggleLimit,
    toggleInverted,
    onChange,
    leftTokenAddress,
    rightTokenAddress,
    uiPrice: price && inverted ? BigNumber(1).div(price).toFormat() : price?.toFormat(),
  };
};

const useMarketPrice = () => {
  const [inverted, setInverted] = useState(false);
  const { srcTokenAddress } = useSrcToken();
  const { dstTokenAddress } = useDstToken();

  const leftTokenAddress = inverted ? dstTokenAddress : srcTokenAddress;
  const rightTokenAddress = !inverted ? dstTokenAddress : srcTokenAddress;

  const { data: leftUsdValue = BigNumber(0) } = useUsdValue(leftTokenAddress);
  const { data: rightUsdValue = BigNumber(1) } = useUsdValue(rightTokenAddress);
  const marketPrice = leftUsdValue.div(rightUsdValue);

  return {
    marketPrice,
    toggleInverted: () => setInverted((prevState) => !prevState),
    leftTokenAddress,
    rightTokenAddress,
    inverted,
  };
};

export const useSubmitButtonValidation = () => {
  const srcTokenAmount = useSrcToken().srcTokenAmount;
  const tradeSize = useTradeSizeStore().tradeSize;
  const maxDurationMillis = useMaxDurationStore().millis;
  const tradeIntervalMillis = useTradeInterval().tradeIntervalMillis;

  return useMemo(() => {
    if (!srcTokenAmount || srcTokenAmount?.isZero()) {
      return "Enter amount";
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
  }, [tradeSize, srcTokenAmount, tradeIntervalMillis, maxDurationMillis]);
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

export const getBigNumberToUiAmount = async (token?: Token, amount?: BigNumber) => {
  const result = !amount ? "" : !token ? "" : (await token.mantissa(amount || zero)).toFormat();

  return result;
};

export const getUiAmountToBigNumber = (token?: Token, amountUi?: string) => (amountUi === "" ? undefined : !token ? undefined : token?.amount(parsebn(amountUi || "0")));
