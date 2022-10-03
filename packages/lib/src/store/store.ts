import _ from "lodash";
import { BigNumber, erc20s, hasWeb3Instance, setWeb3Instance, web3, zero } from "@defi.org/web3-candies";
import { useQuery } from "react-query";
import { useCallback, useEffect, useMemo } from "react";
import Web3 from "web3";
import shallow from "zustand/shallow";
import { TimeFormat } from "../types";
import { delay, getBigNumberToUiAmount, getDerivedTradeInterval, getUiAmountToBigNumber } from "../utils";
import { useSrcTokenState, useDstTokenState, useMaxDurationState, useTradeIntervalState, usePriceState, useTradeSizeState } from "./state";

const getTokens = async () => {
  await delay(1000);
  return [erc20s.eth.WETH(), erc20s.eth.USDC(), erc20s.eth.DAI(), erc20s.eth.WBTC()];
};

setWeb3Instance(new Web3(""));

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
const useSrcTokenActions = () => {
  const { setAddress, setAmount } = useSrcTokenState();
  const { tradeSize } = useTradeSizeData();
  const { srcTokenAddress } = useSrcTokenData();
  const { dstTokenAddress } = useDstTokenData();
  const { setDstTokenAmount } = useDstTokenActions();
  const { token } = useToken(srcTokenAddress);
  const { token: dstToken } = useToken(dstTokenAddress);

  const { setTradeSize } = useTradeSizeActions();

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

  return { setSrcTokenAmount: setAmount, setSrcTokenAddress: setAddress, onChange };
};

// all data related to src input
const useSrcTokenData = () => {
  const { address, amount } = useSrcTokenState();

  return {
    srcTokenAddress: address,
    srcTokenAmount: amount,
    uiAmount: useBigNumberToUiAmount(address, amount),
    amount,
  };
};

// all data related to dst input
const useDstTokenData = () => {
  const { address, amount } = useDstTokenState();

  return {
    dstTokenAmount: amount,
    dstTokenAddress: address,
    uiAmount: useBigNumberToUiAmount(address, amount),
    amount,
  };
};

// all actions (functions) related to src input
const useDstTokenActions = () => {
  const { setAddress, setAmount } = useDstTokenState();
  return { setDstTokenAddress: setAddress, setDstTokenAmount: setAmount };
};

// all data related to max duration input
const useMaxDurationData = () => {
  const { timeFormat, millis } = useMaxDurationState();
  return {
    maxDurationTimeFormat: timeFormat,
    maxDurationMillis: millis,
  };
};

// all actions (functions) related to max duration input
const useMaxDurationActions = () => {
  const { setMillis, setTimeFormat } = useMaxDurationState();

  const onChange = useCallback((timeFormat: TimeFormat, millis: number) => {
    setMillis(millis);
    setTimeFormat(timeFormat);
  }, []);

  return {
    setMaxDurationMillis: setMillis,
    setMaxDurationTimeFormat: setTimeFormat,
    onChange,
  };
};

// all actions (functions) related to trade interval input
const useTradeIntervalActions = () => {
  const { setMillis, setTimeFormat, setCustomInterval } = useTradeIntervalState();

  const onChange = useCallback((timeFormat: TimeFormat, millis: number) => {
    setMillis(millis);
    setTimeFormat(timeFormat);
  }, []);

  return { setTradeIntervalMillis: setMillis, setTradeIntervalTimeFormat: setTimeFormat, setCustomInterval, onChange };
};

// all data related to trade interval input
const useTradeIntervalData = () => {
  const { maxDurationMillis } = useMaxDurationData();
  const { totalTrades } = useTradeSizeData();
  const { customInterval, millis, timeFormat } = useTradeIntervalState();

  const { derivedMillis, derivedTimeFormat } = useMemo(() => {
    return getDerivedTradeInterval(maxDurationMillis, totalTrades);
  }, [totalTrades, maxDurationMillis]);

  const tradeIntervalMillis = customInterval ? millis : derivedMillis;
  const tradeIntervalTimeFormat = customInterval ? timeFormat : derivedTimeFormat;

  return { tradeIntervalMillis, tradeIntervalTimeFormat };
};

// all data related to trade size input
const useTradeSizeData = () => {
  const { srcTokenAddress, srcTokenAmount } = useSrcTokenData();
  const { tradeSize } = useTradeSizeState();

  const totalTrades = useMemo(() => {
    if (!tradeSize || tradeSize.isZero()) {
      return 0;
    }

    BigNumber.config({ ROUNDING_MODE: BigNumber.ROUND_CEIL });
    return srcTokenAmount?.idiv(tradeSize).toNumber() || 0;
  }, [srcTokenAmount, tradeSize]);

  return { totalTrades, tradeSize, uiTradeSize: useBigNumberToUiAmount(srcTokenAddress, tradeSize) };
};

// all actions (functions) related to trade size input
const useTradeSizeActions = () => {
  const { setTradeSize } = useTradeSizeState();
  const { srcTokenAddress, srcTokenAmount } = useSrcTokenData();

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

  return { setTradeSize, onChange };
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
  const { setSrcTokenAddress, setSrcTokenAmount } = useSrcTokenActions();
  const { setDstTokenAddress, setDstTokenAmount } = useDstTokenActions();
  const { setTradeSize } = useTradeSizeActions();
  const { srcTokenAmount, srcTokenAddress } = useSrcTokenData();
  const { dstTokenAmount, dstTokenAddress } = useDstTokenData();

  return () => {
    setSrcTokenAmount(dstTokenAmount);
    setSrcTokenAddress(dstTokenAddress);
    setDstTokenAmount(srcTokenAmount);
    setDstTokenAddress(srcTokenAddress);
    setTradeSize(undefined);
  };
};

export const usePriceData = () => {
  const { showPrice, inverted, price, showDerived } = usePriceState();

  const { srcTokenAmount, srcTokenAddress } = useSrcTokenData();

  const derivedPrice = useBigNumberToUiAmount(srcTokenAddress, srcTokenAmount);
  const priceAsUiFormat = useBigNumberToUiAmount(srcTokenAddress, price);

  const uiPrice = showDerived ? derivedPrice : priceAsUiFormat;
  return { showPrice, uiPrice, inverted };
};

export const usePriceActions = () => {
  const { togglePrice, invertPrice, setPrice, setShowDerived, price } = usePriceState();
  const { srcTokenAddress } = useSrcTokenData();
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

  return { togglePrice, invertPrice, onChange, onFocus, onBlur };
};

export const useSubmitButtonValidation = () => {
  const { amount: srcTokenAmount } = useSrcTokenData();
  const { tradeSize } = useTradeSizeData();
  const { maxDurationMillis } = useMaxDurationData();
  const { tradeIntervalMillis } = useTradeIntervalData();

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

export const usePartialFillValidation = () => {
  const { tradeIntervalMillis } = useTradeIntervalData();
  const { totalTrades } = useTradeSizeData();
  const { maxDurationMillis } = useMaxDurationData();

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

// all hooks with state, export state only from here
export const state = {
  useSrcTokenAddress: () => useSrcTokenState((state) => state.address, shallow),
  useSrcTokenAmount: () => {
    return useSrcTokenData().uiAmount;
  },
  useDstTokenAddress: () => useDstTokenState((state) => state.address, shallow),
  useDstTokenAmount: () => {
    return useDstTokenData().uiAmount;
  },
  useMaxDuration: useMaxDurationData,
  useTradeInterval: useTradeIntervalData,
  usePrice: usePriceData,
  useTradeSize: () => {
    return {
      tradeSize: useTradeSizeData().uiTradeSize,
      totalTrades: useTradeSizeData().totalTrades,
    };
  },
};

// all hooks with actions (functions), export functions only from here
export const actions = {
  useSrcTokenActions,
  useDstTokenActions,
  useMaxDurationActions,
  useTradeIntervalActions,
  useTradeSizeActions,
  useChangeTokenPositions,
  usePriceActions,
};

// all validation hooks
export const useValidation = () => {
  return {
    useSubmitButtonValidation,
    usePartialFillValidation,
  };
};
