import _ from "lodash";
import { BigNumber, erc20s, hasWeb3Instance, setWeb3Instance, web3, zero } from "@defi.org/web3-candies";
import { useQuery } from "react-query";
import { useCallback, useEffect, useMemo } from "react";
import Web3 from "web3";
import shallow from "zustand/shallow";
import { MaxDurationState, PriceState, TimeFormat, TokenState, TradeIntervalState, TradeSizeState } from "../types";
import { delay, getBigNumberToUiAmount, getDerivedTradeInterval, getTimeFormat, getTradeInterval, getUiAmountToBigNumber } from "../utils";
import create from "zustand";
// TODO remove when we will fetch tokens
setWeb3Instance(new Web3(""));

const srcTokenInitialState = {
  address: erc20s.eth.WETH().address,
  amount: undefined,
};

const dstTokenInitialState = {
  address: erc20s.eth.WBTC().address,
  amount: undefined,
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
  inverted: false,
  showPrice: false,
  price: undefined,
  showDerived: true,
};

const tradeSizeInitialState = {
  tradeSize: undefined,
};

export const useSrcTokenStore = create<TokenState>((set) => ({
  ...srcTokenInitialState,
  setAddress: (address) => set({ address }),
  setAmount: (amount) => set({ amount }),
  reset: () => set(srcTokenInitialState),
}));

export const useDstTokenStore = create<TokenState>((set, get) => ({
  ...dstTokenInitialState,
  setAddress: (address) => set({ address }),
  setAmount: (amount) => set({ amount }),
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

export const usePriceStore = create<PriceState>((set) => ({
  ...priceInitialState,
  togglePrice: (showPrice) => set({ showPrice }),
  invertPrice: () => set((state) => ({ inverted: !state.inverted })),
  setPrice: (price) => set({ price }),
  setShowDerived: (showDerived) => set({ showDerived }),
  reset: () => set(priceInitialState),
}));

export const useTradeSizeStore = create<TradeSizeState>((set) => ({
  ...tradeSizeInitialState,
  setTradeSize: (tradeSize) => set({ tradeSize }),
  reset: () => set(tradeSizeInitialState),
}));

const getTokens = async () => {
  await delay(1000);
  return [erc20s.eth.WETH(), erc20s.eth.USDC(), erc20s.eth.DAI(), erc20s.eth.WBTC()];
};

export const useInitWeb3 = (provider?: any) => {
  useEffect(() => {
    setWeb3Instance(new Web3(provider));
  }, [provider]);
};

const getWeb3 = () => {
  if (hasWeb3Instance()) {
    return web3();
  }
  return undefined;
};

// all actions (functions) related to src input
const useSrcToken = () => {
  const { setAddress, setAmount, address: srcTokenAddress, amount: srcTokenAmount } = useSrcTokenStore();
  const tradeSize = useTradeSizeStore().tradeSize;
  const dstTokenAddress = useDstTokenStore().address;
  const setDstTokenAmount = useDstTokenStore().setAmount;
  const { token } = useToken(srcTokenAddress);
  const { token: dstToken } = useToken(dstTokenAddress);

  const setTradeSize = useTradeSizeStore().setTradeSize;

  const onChange = useCallback(
    async (amountUi: string) => {
      const base = "0.000040181";
      const amount = await getUiAmountToBigNumber(token, amountUi);

      const dstamount = await getUiAmountToBigNumber(dstToken, base);

      if (amount && tradeSize && tradeSize.gt(amount)) {
        setTradeSize(undefined);
      }
      setAmount(amount);
      setDstTokenAmount(dstamount);
    },
    [token, tradeSize]
  );

  return {
    setSrcTokenAmount: setAmount,
    setSrcTokenAddress: setAddress,
    onChange,
    srcTokenAddress,
    srcTokenAmount,
    srcTokenUiAmount: useBigNumberToUiAmount(srcTokenAddress, srcTokenAmount),
  };
};

const useTotalTrades = () => {
  const tradeSize = useTradeSizeStore().tradeSize;
  const srcTokenAmount = useSrcTokenStore().amount;
  return useMemo(() => {
    if (!tradeSize || tradeSize.isZero()) {
      return 0;
    }
    BigNumber.config({ ROUNDING_MODE: BigNumber.ROUND_CEIL });
    return srcTokenAmount?.idiv(tradeSize).toNumber() || 0;
  }, [srcTokenAmount, tradeSize]);
};

// all actions (functions) related to src input
const useDstToken = () => {
  const { setAddress, setAmount, address, amount } = useDstTokenStore();
  return { setDstTokenAddress: setAddress, setDstTokenAmount: setAmount, dstTokenUiAmount: useBigNumberToUiAmount(address, amount), dstTokenAddress: address };
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

  const onCustomIntervalClick = useCallback(() => {
    setCustomInterval(true);
  }, []);
  const { derivedMillis, derivedTimeFormat } = useMemo(() => {
    return getDerivedTradeInterval(maxDurationMillis, totalTrades);
  }, [totalTrades, maxDurationMillis]);

  const tradeIntervalMillis = customInterval ? millis : derivedMillis;
  const tradeIntervalTimeFormat = customInterval ? timeFormat : derivedTimeFormat;

  return { tradeIntervalMillis, tradeIntervalTimeFormat, customInterval, onChange, onCustomIntervalClick };
};

// all data related to trade size input
const useTradeSize = () => {
  const { address: srcTokenAddress, amount: srcTokenAmount } = useSrcTokenStore();
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

  return { totalTrades, tradeSize, uiTradeSize: useBigNumberToUiAmount(srcTokenAddress, tradeSize), onChange };
};

const getAllTokens = () => {
  return useQuery("allTokens", async () => {
    return getTokens();
  });
};

export const useToken = (address?: string) => {
  const { data: allTokens } = getAllTokens();
  const { data: token } = useQuery(["useToken", address], () => _.find(allTokens, (t) => t.address === address), { enabled: !!allTokens });
  return { token, isLoading: !token };
};

const useBigNumberToUiAmount = (address?: string, amount?: BigNumber) => {
  const { token } = useToken(address);

  return useQuery(["useBigNumberToUiAmount", address, amount], () => getBigNumberToUiAmount(token, amount)).data;
};

const useChangeTokenPositions = () => {
  const { setAddress: setSrcTokenAddress, setAmount: setSrcTokenAmount, address: srcTokenAddress, amount: srcTokenAmount } = useSrcTokenStore();
  const { setAddress: setDstTokenAddress, setAmount: setDstTokenAmount, address: dstTokenAddress, amount: dstTokenAmount } = useDstTokenStore();
  const setTradeSize = useTradeSizeStore().setTradeSize;

  return () => {
    setSrcTokenAmount(dstTokenAmount);
    setSrcTokenAddress(dstTokenAddress);
    setDstTokenAmount(srcTokenAmount);
    setDstTokenAddress(srcTokenAddress);
    setTradeSize(undefined);
  };
};

export const usePrice = () => {
  const { showPrice, inverted, price, showDerived, togglePrice, invertPrice, setPrice, setShowDerived } = usePriceStore();

  const { amount: srcTokenAmount, address: srcTokenAddress } = useSrcTokenStore();
  const { token } = useToken(srcTokenAddress);

  const onChange = async (amountUi?: string) => {
    const amount = await getUiAmountToBigNumber(token, amountUi);
    setPrice(amount);
  };

  const onFocus = () => {
    setShowDerived(false);
  };

  const onBlur = () => {
    if (price == null) {
      setShowDerived(true);
    }
  };

  const derivedPrice = useBigNumberToUiAmount(srcTokenAddress, srcTokenAmount);
  const priceAsUiFormat = useBigNumberToUiAmount(srcTokenAddress, price);

  const uiPrice = showDerived ? derivedPrice : priceAsUiFormat;
  return { showPrice, uiPrice, inverted, togglePrice, invertPrice, onChange, onFocus, onBlur };
};

export const useSubmitButtonValidation = () => {
  const srcTokenAmount = useSrcTokenStore().amount;
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
  usePrice,
  useTradeSize: () => {
    return {
      ...useTradeSize(),
      tradeSize: useTradeSize().uiTradeSize,
      totalTrades: useTradeSize().totalTrades,
    };
  },
  useChangeTokenPositions,
  reset: resetState,
};

// all validation hooks
export const validation = {
  useSubmitButtonValidation,
  usePartialFillValidation,
};
