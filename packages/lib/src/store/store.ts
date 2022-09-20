import { useQuery, useQueryClient } from "react-query";
import { erc20s, setWeb3Instance } from "@defi.org/web3-candies";
import Web3 from "web3";
import { useEffect } from "react";
import _ from "lodash";

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
    amount: "",
    address: "",
  })).data;

  return {
    ...data,
    setAmount: (amount?: string) => client.setQueryData(key, (prev: any) => ({ ...prev, amount })),
    setAmountUi: (amountUi?: string) => client.setQueryData(key, (prev: any) => ({ ...prev, amount: "" })), //TODO
    setAddress: (address?: string) => client.setQueryData(key, (prev: any) => ({ ...prev, address })),
  };
};

export const useDstToken = () => {
  const client = useQueryClient();
  const key = ["useDstToken"];
  const data = useQuery(key, () => {
    return {
      amount: "",
      address: "",
    };
  }).data;

  return {
    ...data,
    amountUi: "fromWei",
    setAmount: (amount?: string) => client.setQueryData(key, (prev: any) => ({ ...prev, amount })),
    setAmountUi: (amountUi?: string) => client.setQueryData(key, (prev: any) => ({ ...prev, amount: amountUi })), // TODO
    setAddress: (address?: string) => client.setQueryData(key, (prev: any) => ({ ...prev, address })),
  };
};

export const changeTokenPositions = () => {
  const { amount: srcAmount, address: srcAddress, setAmount: setSrcAmount, setAddress: setSrcAddress } = useSrcToken();
  const { amount: dstAmount, address: dstAddress, setAmount: setDstAmount, setAddress: setDstAddress } = useDstToken();

  return () => {
    setSrcAmount(dstAmount);
    setSrcAddress(dstAddress);
    setDstAmount(srcAmount);
    setDstAddress(srcAddress);
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
    setMillis: (millis?: number) => client.setQueryData(key, (prev: any) => ({ ...prev, millis })),
    setTimeFormat: (timeFormat?: TimeFormat) => client.setQueryData(key, (prev: any) => ({ ...prev, timeFormat })),
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
  return { token, isLoading: allTokensLoading || tokenLoading };
};

const useTokenAmount = (address?: string, amountUi?: string) => {
  const { token, isLoading: isTokenLoading } = useToken(address);
  const { data, isLoading } = useQuery(["useTokenAmount", address, amountUi], () => token?.amount(parseFloat(amountUi || "0")), { enabled: !!token });
  return { data, isLoading: isLoading || isTokenLoading };
};
3;
