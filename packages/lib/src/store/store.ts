import { useQuery, useQueryClient } from "react-query";
import { setWeb3Instance } from "@defi.org/web3-candies";
import Web3 from "web3";
import { useEffect } from "react";

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
    setAmount: (amount?: string) => client.setQueryData(key, { ...data, amount }),
    setAmountUi: (amountUi?: string) => client.setQueryData(key, (prev: any) => ({ ...prev, amount: amountUi })), //TODO
    setAddress: (address?: string) => client.setQueryData(key, { ...data, address }),
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
    setAmount: (amount?: string) => client.setQueryData(key, { ...data, amount }),
    setAmountUi: (amountUi?: string) => client.setQueryData(key, (prev: any) => ({ ...prev, amount: amountUi })), // TODO
    setAddress: (address?: string) => client.setQueryData(key, { ...data, address }),
  };
};

export const useChangeTokenPositions = () => {
  const { amount: srcAmount, address: srcAddress, setAmount: setSrcAmount, setAddress: setSrcAddress } = useSrcToken();
  const { amount: dstAmount, address: dstAddress, setAmount: setDstAmount, setAddress: setDstAddress } = useDstToken();

  return () => {
    setSrcAmount(dstAmount);
    setSrcAddress(dstAddress);
    setDstAmount(srcAmount);
    setDstAddress(srcAddress);
  };
};
