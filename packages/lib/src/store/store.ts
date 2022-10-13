import _ from "lodash";
import { BigNumber, convertDecimals, erc20s, hasWeb3Instance, parsebn, setWeb3Instance, Token, web3, zero } from "@defi.org/web3-candies";
import axios from "axios";
import { useQuery } from "react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import Web3 from "web3";
import { DstTokenState, MaxDurationState, PriceState, SrcTokenState, TradeIntervalState, TradeSizeState } from "../types";
import { delay } from "../utils";
import create from "zustand";
import { TimeFormat } from "./TimeFormat";
// TODO remove when we will fetch tokens
setWeb3Instance(new Web3(""));

const srcTokenInitialState = {
  address: erc20s.ftm.WETH().address,
  amount: undefined,
};

const dstTokenInitialState = {
  address: erc20s.ftm.WBTC().address,
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
  return _.map(erc20s.ftm, (it) => it());
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

const useAccountBalances = (address?: string) => {
  return useQuery(
    ["useAccountBalances", address],
    async () => {
      await delay(1000);
      return BigNumber(1 * 1e18);
    },
    { staleTime: 0, enabled: !!address }
  );
};

// all actions (functions) related to src input
const useSrcToken = () => {
  const { setAddress, setAmount, address: srcTokenAddress, amount: srcTokenAmount } = useSrcTokenStore();
  const tradeSize = useTradeSizeStore().tradeSize;
  const { token } = useToken(srcTokenAddress);

  const setTradeSize = useTradeSizeStore().setTradeSize;

  const onChange = useCallback(
    async (amountUi: string) => {
      const amount = await getUiAmountToBigNumber(token, amountUi);
      if (amount && tradeSize && tradeSize.gt(amount)) {
        setTradeSize(undefined);
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
  const { setAddress, address } = useDstTokenStore();
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

const useUsdValue = (address?: string) => {
  return useQuery(
    ["useUsdValue", address],
    async () => {
      if (!address) {
        return undefined;
      }
      const result = await axios.get(`https://api.coingecko.com/api/v3/simple/token_price/fantom?contract_addresses=${address}&vs_currencies=usd `);

      return (_.first(_.values(result.data)).usd as number) || 0;
    },
    {
      enabled: !!address,
    }
  );
};

const useDstAmount = (srcAddress?: string, dstAddress?: string, srcAmount?: BigNumber, srcTokenUsdValue?: number, dstTokenUsdValue?: number) => {
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
  const srcTokenAmount = useSrcTokenStore().amount;
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

  const { isLoading: usdValueLoading, data: usdValue } = useUsdValue(srcTokenAddress);

  return {
    totalTrades,
    tradeSize,
    uiTradeSize: useBigNumberToUiAmount(srcTokenAddress, tradeSize),
    onChange,
    usdValue,
    usdValueLoading,
    uiUsdValue: useBigNumberToUiAmount(srcTokenAddress, tradeSize?.times(usdValue || 0)),
  };
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

  return useQuery(["useBigNumberToUiAmount", address, amount], () => getBigNumberToUiAmount(token, amount), {
    enabled: !!address,
  }).data;
};

const useDstTokenAmount = () => {
  return useDstToken().amount;
};

const useChangeTokenPositions = () => {
  const { setAddress: setSrcTokenAddress, setAmount: setSrcTokenAmount, address: srcTokenAddress, amount: srcTokenAmount } = useSrcTokenStore();
  const { setAddress: setDstTokenAddress, address: dstTokenAddress } = useDstTokenStore();
  const dstTokenAmount = useDstTokenAmount();
  const setTradeSize = useTradeSizeStore().setTradeSize;

  return () => {
    setSrcTokenAmount(dstTokenAmount);
    setSrcTokenAddress(dstTokenAddress);
    setDstTokenAddress(srcTokenAddress);
    setTradeSize(undefined);
  };
};

export const usePrice = () => {
  const { showPrice, price, showDerived, togglePrice, setPrice, setShowDerived } = usePriceStore();

  const onChange = (amountUi?: string) => {
    setPrice(amountUi ? parseFloat(amountUi) : undefined);
  };

  const onFocus = () => {
    setShowDerived(false);
  };

  const onBlur = () => {
    if (price == null) {
      setShowDerived(true);
    }
  };

  const { marketPrice, leftTokenAddress, rightTokenAddress, toggleInverted } = useMarketPrice();
  const uiPrice = showDerived ? marketPrice : price;
  return {
    showPrice,
    togglePrice,
    toggleInverted,
    onChange,
    onFocus,
    onBlur,
    leftTokenAddress,
    rightTokenAddress,
    uiPrice,
  };
};

const useMarketPrice = () => {
  const [inverted, setInverted] = useState(false);
  const { address: srcTokenAddress } = useSrcTokenStore();
  const { address: dstTokenAddress } = useDstTokenStore();

  const leftTokenAddress = inverted ? dstTokenAddress : srcTokenAddress;
  const rightTokenAddress = !inverted ? dstTokenAddress : srcTokenAddress;

  const { data: leftUsdValue = 0 } = useUsdValue(leftTokenAddress);
  const { data: rightUsdValue = 1 } = useUsdValue(rightTokenAddress);
  const marketPrice = leftUsdValue / rightUsdValue;

  return {
    marketPrice,
    toggleInverted: () => setInverted((prevState) => !prevState),
    leftTokenAddress,
    rightTokenAddress,
  };
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
  const result = !amount ? "" : !token ? "" : (await token.mantissa(amount || zero)).toFormat({ groupSeparator: "", decimalSeparator: "." });

  return result;
};

export const getUiAmountToBigNumber = (token?: Token, amountUi?: string) => (!token ? undefined : token?.amount(parsebn(amountUi || "0")));
