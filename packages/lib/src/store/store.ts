import Web3 from "web3";
import _ from "lodash";
import { BigNumber, bn, erc20s, one, setWeb3Instance, web3, zero } from "@defi.org/web3-candies";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useEffect, useMemo } from "react";

export enum TimeFormat {
  Minutes,
  Hours,
  Days,
}

export const useWeb3Provider = (provider: any) => {
  useEffect(() => {
    setWeb3Instance(new Web3(provider));
  }, [provider]);
};

export const useSrcToken = () => {
  const client = useQueryClient();
  const key = ["useSrcToken"];
  const data = useQuery(key, () => ({
    address: erc20s.eth.WETH().address,
    amount: zero,
  })).data;

  return {
    ...data,
    uiAmount: useBnToUiAmount(data?.address, data?.amount),
    setAddress: (address?: string) => client.setQueryData(key, (prev: any) => ({ ...prev, address })),
    setAmount: (amount?: BigNumber) => client.setQueryData(key, (prev: any) => ({ ...prev, amount })),
  };
};

export const useDstToken = () => {
  const client = useQueryClient();
  const key = ["useDstToken"];
  const data = useQuery(key, () => {
    return {
      address: erc20s.eth.WETH().address,
      amount: zero,
    };
  }).data;

  return {
    ...data,
    uiAmount: useBnToUiAmount(data?.address, data?.amount),
    setAddress: (address?: string) => client.setQueryData(key, (prev: any) => ({ ...prev, address })),
    setAmount: (amount?: BigNumber) => client.setQueryData(key, (prev: any) => ({ ...prev, amount })),
  };
};

export const changeTokenPositions = () => {
  const { amount: srcAmount, address: srcAddress, setAmount: setSrcAmount, setAddress: setSrcAddress } = useSrcToken();
  const { amount: dstAmount, address: dstAddress, setAmount: setDstAmount, setAddress: setDstAddress } = useDstToken();
  const { setTradeSize } = useTradeSize();

  return () => {
    setSrcAmount(dstAmount);
    setSrcAddress(dstAddress);
    setDstAmount(srcAmount);
    setDstAddress(srcAddress);
    setTradeSize(undefined);
  };
};

export const useMaxDuration = () => {
  const client = useQueryClient();
  const key = ["useMaxDuration"];
  const data = useQuery(key, () => {
    return {
      millis: 0,
      timeFormat: TimeFormat.Minutes,
    };
  }).data;

  return {
    ...data,
    setMillis: (millis?: number) => client.setQueryData(key, (prev: any) => ({ ...prev, millis })),
    setTimeFormat: (timeFormat?: TimeFormat) => client.setQueryData(key, (prev: any) => ({ ...prev, timeFormat })),
  };
};

export const useTradeInterval = () => {
  const client = useQueryClient();
  const key = ["useTradeInterval"];
  const data = useQuery(key, () => {
    return {
      millis: 0,
      timeFormat: TimeFormat.Minutes,
    };
  }).data;

  return {
    ...data,
    setMillis: (millis?: number) => {
      client.setQueryData(key, (prev: any) => ({ ...prev, millis }));
    },
    setTimeFormat: (timeFormat?: TimeFormat) => client.setQueryData(key, (prev: any) => ({ ...prev, timeFormat })),
  };
};

export const useTradeSize = () => {
  const client = useQueryClient();
  const key = ["useTradeSize"];
  const data = useQuery(key, () => {
    return {
      tradeSize: zero,
      totalTrades: zero,
    };
  }).data;

  const { address } = useSrcToken();

  return {
    ...data,
    tradeSizeForUi: useBnToUiAmount(address, data?.tradeSize),
    totalTradesForUi: data?.totalTrades?.toString(),
    setTradeSize: (tradeSize?: BigNumber) => client.setQueryData(key, (prev: any) => ({ ...prev, tradeSize })),
    setTotalTrades: (totalTrades?: BigNumber) => client.setQueryData(key, (prev: any) => ({ ...prev, totalTrades })),
  };
};

const getAllTokens = () => {
  return useQuery("allTokens", async () => {
    //
    return [erc20s.eth.WETH(), erc20s.eth.USDC(), erc20s.eth.DAI(), erc20s.eth.WBTC()];
  });
};

export const useToken = (address?: string) => {
  const { data: allTokens, isLoading: allTokensLoading } = getAllTokens();
  const { data: token, isLoading: tokenLoading } = useQuery(["useToken", address], () => _.find(allTokens, (t) => t.address === address), { enabled: !!allTokens });
  return { token, isLoading: !token };
};

const useUiAmountToBigNumber = (address?: string) => {
  const { token } = useToken(address);

  return useMutation(async (amountUi?: string) => (!amountUi ? undefined : token?.amount(parseFloat(amountUi))));
};

const useBnToUiAmount = (address?: string, amount?: BigNumber) => {
  const { token } = useToken(address);

  return !amount || amount.isZero() ? "" : (parseFloat(amount ? amount?.toString() : "0") / 10 ** 18).toString();
};

export const useActionHandlers = () => {
  const { address, setAmount, amount: srcTokenAmount } = useSrcToken();
  const { mutateAsync: onUiAmountChange } = useUiAmountToBigNumber(address);
  const { tradeSize, setTradeSize, setTotalTrades, totalTrades } = useTradeSize();
  const { millis: maxDurationMillis, setMillis: setMaxDurationMillis } = useMaxDuration();
  const { setMillis: setTradeIntervalMillis } = useTradeInterval();

  const onSrcTokenChange = async (amountUi?: string) => {
    const amount = await onUiAmountChange(amountUi);

    if (tradeSize?.gt(amount || zero)) {
      setTradeSize(amount);
      setTotalTrades(amount?.idiv(tradeSize || one));
    }
    setAmount(amount);
  };

  const onTradeSizeChange = async (amountUi?: string) => {
    const tradeSize = await onUiAmountChange(amountUi);

    const totalTrades = srcTokenAmount?.idiv(tradeSize || one) || zero; //ceilDiv(srcTokenAmount, tradeSize);

    if (maxDurationMillis && !totalTrades.isZero()) {
      const res = BigNumber(maxDurationMillis).div(totalTrades).toNumber();
      setTradeIntervalMillis(res);
    } else {
      setTradeIntervalMillis(0);
    }

    setTradeSize(tradeSize);
    setTotalTrades(totalTrades);
  };

  const onMaxDurationChange = (millis?: number) => {
    setMaxDurationMillis(millis);
    if (!millis) {
      setTradeIntervalMillis(0);
      return;
    }

    if (totalTrades && tradeSize && !tradeSize?.isZero()) {
      const result = BigNumber(millis).div(totalTrades).toNumber();
      setTradeIntervalMillis(result);
    }
  };

  return {
    onSrcTokenChange,
    onTradeSizeChange,
    onMaxDurationChange,
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
    if (!totalTrades || totalTrades?.isZero() || !tradeIntervalMillis || !maxDurationMillis) {
      return;
    }

    const showWarning = BigNumber(tradeIntervalMillis).times(totalTrades).gt(BigNumber(maxDurationMillis));

    if (showWarning) {
      return "Partial fill warning";
    }
  }, []);
};
