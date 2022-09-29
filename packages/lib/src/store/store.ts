import _ from "lodash";
import { BigNumber, erc20s, hasWeb3Instance, parsebn, setWeb3Instance, Token, web3, zero } from "@defi.org/web3-candies";
import { useQuery, useQueryClient } from "react-query";
import { useCallback, useEffect, useMemo } from "react";
import Web3 from "web3";

setWeb3Instance(new Web3(""));

export enum TimeFormat {
  Minutes,
  Hours,
  Days,
}

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

const useSrcToken = () => {
  const client = useQueryClient();

  const initialData = {
    address: erc20s.eth.WETH().address, //TODO temp
    amount: zero,
  };

  const key = ["useSrcToken"];
  const data = useQuery(key, () => initialData).data || initialData;

  return {
    ...data,
    uiAmount: useBigNumberToUiAmount(data.address, data.amount),
    setAddress: (address?: string) => client.setQueryData(key, (prev: any) => ({ ...prev, address })),
    setAmount: (amount?: BigNumber) => client.setQueryData(key, (prev: any) => ({ ...prev, amount })),
  };
};

const useDstToken = () => {
  const initialData = {
    address: erc20s.eth.WETH().address,
    amount: zero,
  };

  const client = useQueryClient();
  const key = ["useDstToken"];
  const data = useQuery(key, () => initialData).data || initialData;

  return {
    ...data,
    uiAmount: useBigNumberToUiAmount(data.address, data.amount),
    setAddress: (address: string) => client.setQueryData(key, (prev: any) => ({ ...prev, address })),
    setAmount: (amount: BigNumber) => client.setQueryData(key, (prev: any) => ({ ...prev, amount })),
  };
};

const useMaxDuration = () => {
  const initialData = {
    millis: 0,
    timeFormat: TimeFormat.Minutes,
  };
  const client = useQueryClient();
  const key = ["useMaxDuration"];
  const data = useQuery(key, () => initialData).data || initialData;

  return {
    ...data,
    setMillis: (millis: number) => client.setQueryData(key, (prev: any) => ({ ...prev, millis })),
    setTimeFormat: (timeFormat: TimeFormat) => client.setQueryData(key, (prev: any) => ({ ...prev, timeFormat })),
  };
};

const useTradeInterval = () => {
  const initialData = {
    millis: 0,
    timeFormat: TimeFormat.Minutes,
    customInterval: false,
  };
  const client = useQueryClient();
  const key = ["useTradeInterval"];
  const data = useQuery(key, () => initialData).data || initialData;

  const { millis: maxDurationMillis } = useMaxDuration();
  const { totalTrades } = useTradeSize();

  const derivedMillis = useMemo(() => {
    if (maxDurationMillis > 0 && totalTrades > 0) {
      return maxDurationMillis / totalTrades;
    } else {
      return 0;
    }
  }, [totalTrades, maxDurationMillis]);

  return {
    ...data,
    millis: Math.max(Math.floor(data.customInterval ? data.millis : derivedMillis), 60_000),
    setMillis: (millis: number) => {
      client.setQueryData(key, (prev: any) => ({ ...prev, millis }));
    },
    setCustomInterval: (customInterval: boolean) => {
      client.setQueryData(key, (prev: any) => ({ ...prev, customInterval, millis: derivedMillis }));
    },
    setTimeFormat: (timeFormat: TimeFormat) => client.setQueryData(key, (prev: any) => ({ ...prev, timeFormat })),
  };
};

const useTradeSize = () => {
  const initialData = {
    tradeSize: zero,
  };
  const client = useQueryClient();
  const key = ["useTradeSize"];
  const data = useQuery(key, () => initialData).data || initialData;

  const { address, amount } = useSrcToken();

  const totalTrades = useMemo(() => {
    if (data.tradeSize.isZero()) {
      return 0;
    }

    BigNumber.config({ ROUNDING_MODE: BigNumber.ROUND_CEIL });
    return amount.idiv(data.tradeSize).toNumber() || 0;
  }, [amount, data?.tradeSize]);

  return {
    ...data,
    tradeSizeForUi: useBigNumberToUiAmount(address, data.tradeSize),
    totalTrades,
    setTradeSize: (tradeSize?: BigNumber) => client.setQueryData(key, (prev: any) => ({ ...prev, tradeSize })),
  };
};

const getAllTokens = () => {
  return useQuery("allTokens", async () => {
    //
    return [erc20s.eth.WETH(), erc20s.eth.USDC(), erc20s.eth.DAI(), erc20s.eth.WBTC()];
  });
};

export const useToken = (address?: string) => {
  const { data: allTokens } = getAllTokens();
  const { data: token } = useQuery(["useToken", address], () => _.find(allTokens, (t) => t.address === address), { enabled: !!allTokens });
  return { token, isLoading: !token };
};

const getUiAmountToBigNumber = (token?: Token, amountUi?: string) => {
  return !token || !amountUi ? undefined : token?.amount(parsebn(amountUi));
};

const getBigNumberToUiAmount = async (token?: Token, amount?: BigNumber) => {
  return !amount || !token || amount.isZero() ? "" : (await token.mantissa(amount)).toFormat();
};

const useBigNumberToUiAmount = (address?: string, amount?: BigNumber) => {
  const { token } = useToken(address);
  return useQuery(["useBigNumberToUiAmount", address, amount], () => getBigNumberToUiAmount(token, amount)).data;
};

export const useActionHandlers = () => {
  const { tradeSize, setTradeSize } = useTradeSize();
  const { setMillis: setMaxDurationMillis, setTimeFormat: setMaxDurationTimeFormat } = useMaxDuration();
  const { setCustomInterval, setMillis: setTradeIntervalMillis, setTimeFormat: setTradeIntervalTimeFormat } = useTradeInterval();
  const { amount: srcAmount, address: srcAddress, setAmount: setSrcAmount, setAddress: setSrcAddress } = useSrcToken();
  const { amount: dstAmount, address: dstAddress, setAmount: setDstAmount, setAddress: setDstAddress } = useDstToken();
  const { token: srcToken } = useToken(srcAddress);

  const onSrcTokenChange = useCallback(
    async (amountUi: string) => {
      const amount = await getUiAmountToBigNumber(srcToken, amountUi);

      if (tradeSize?.gt(amount || zero)) {
        setTradeSize(amount);
      }
      setSrcAmount(amount);
    },
    [srcToken, tradeSize]
  );

  const onTradeSizeChange = useCallback(
    async (amountUi?: string) => {
      const tradeSize = await getUiAmountToBigNumber(srcToken, amountUi);
      setTradeSize(tradeSize);
    },
    [srcToken]
  );

  const onMaxDurationChange = useCallback((timeFormat: TimeFormat, millis: number) => {
    console.log(timeFormat, millis);
    
    setMaxDurationMillis(millis);
    setMaxDurationTimeFormat(timeFormat);
  }, []);

  const onTradeIntervalChange = useCallback((timeFormat: TimeFormat, millis: number) => {
    setTradeIntervalMillis(millis);
    setTradeIntervalTimeFormat(timeFormat);
  }, []);

  const onEnableTradeInterval = useCallback((value: boolean) => {
    setCustomInterval(value);
  }, []);

  const onChangeTokenPositions = useCallback(() => {
    setSrcAmount(dstAmount);
    setSrcAddress(dstAddress);
    setDstAmount(srcAmount);
    setDstAddress(srcAddress);
    setTradeSize(zero);
  }, []);

  return {
    useInitWeb3,
    onSrcTokenChange,
    onTradeSizeChange,
    onMaxDurationChange,
    onEnableTradeInterval,
    onTradeIntervalChange,
    onChangeTokenPositions,
  };
};

export const useSubmitButtonValidation = () => {
  const { amount: srcTokenAmount } = useSrcToken();
  const { tradeSize } = useTradeSize();
  const { millis: maxDurationMillis } = useMaxDuration();
  const { millis: tradeIntervalMillis } = useTradeInterval();

  return useMemo(() => {
    if (srcTokenAmount?.isZero()) {
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
  const { millis: tradeIntervalMillis } = useTradeInterval();
  const { totalTrades } = useTradeSize();
  const { millis: maxDurationMillis } = useMaxDuration();

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

export const useTWAPState = () => {
  return {
    srcTokenAmount: useSrcToken().uiAmount,
    srcTokenAddress: useSrcToken().address,
    dstTokenAmount: useDstToken().uiAmount,
    dstTokenAddress: useDstToken().address,
    tradeIntervalFormat: useTradeInterval().timeFormat,
    tradeIntervalMillis: useTradeInterval().millis,
    tradeIntervalEnabled: useTradeInterval().customInterval,
    maxDurationMillis: useMaxDuration().millis,
    maxDurationFormat: useMaxDuration().timeFormat,
    tradeSize: useTradeSize().tradeSizeForUi,
    totalTrades: useTradeSize().totalTrades,
  };
};

export const useValidation = () => {
  return {
    useSubmitButtonValidation,
    usePartialFillValidation,
  };
};
