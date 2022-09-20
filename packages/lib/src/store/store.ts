import { useQuery, useQueryClient } from "react-query";
import { setWeb3Instance } from "@defi.org/web3-candies";
import Web3 from "web3";
import { useEffect } from "react";

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
    setAmountUi: (amountUi?: string) => client.setQueryData(key, (prev: any) => ({ ...prev, amount: amountUi })), //TODO
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
      milliseconds: 0,
      timeFormat: TimeFormat.Minutes
    };
  }).data;

  return {
    ...data,
    setMilliseconds: (milliseconds?: number) => client.setQueryData(key, (prevData: any) => ({...prevData, milliseconds})),
    setTimeFormat: (timeFormat?: TimeFormat) => client.setQueryData(key, (prevData: any) => ({...prevData, timeFormat})),
  };
};


export const useTradeInterval = () => {
  const client = useQueryClient();
  const key = ["useTradeInterval"];
  const data = useQuery(key, () => {
    return {
      milliseconds: 0,
      timeFormat: TimeFormat.Minutes
    };
  }).data;

  return {
    ...data,
    setMilliseconds: (milliseconds?: number) => client.setQueryData(key, (prevData: any) => ({...prevData, milliseconds})),
    setTimeFormat: (timeFormat?: TimeFormat) => client.setQueryData(key, (prevData: any) => ({...prevData, timeFormat})),
  };
};
