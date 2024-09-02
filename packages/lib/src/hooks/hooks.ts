import { useTwapContext } from "../context/context";
import { useCallback, useEffect, useMemo, useState } from "react";
import BN from "bignumber.js";
import { Status, Token } from "../types";
import { eqIgnoreCase, switchMetaMaskNetwork, isNativeAddress, maxUint256, networks, Abi, erc20 } from "@defi.org/web3-candies";
import TwapAbi from "@orbs-network/twap/twap.abi.json";
import { useNumericFormat } from "react-number-format";
import { amountBN, amountBNV2, amountUi, amountUiV2, formatDecimals, getExplorerUrl, makeElipsisAddress, resetQueryParams } from "../utils";
import { query } from "./query";
import { stateActions } from "../context/actions";

export const useRefetchBalances = () => {
  const { refetch: refetchSrcBalance } = useSrcBalance();
  const { refetch: refetchDstBalance } = useDstBalance();

  return useCallback(async () => {
    await Promise.all([refetchSrcBalance(), refetchDstBalance()]);
  }, [refetchSrcBalance, refetchDstBalance]);
};

export const useResetAfterSwap = () => {
  const resetAfterSwap = stateActions.useSwapReset();
  const refetchBalances = useRefetchBalances();

  return useCallback(async () => {
    resetAfterSwap();
    resetQueryParams();
    await refetchBalances();
  }, [resetAfterSwap, refetchBalances]);
};

export const useSrcBalance = () => {
  const srcToken = useTwapContext().srcToken;
  return query.useBalance(srcToken);
};

export const useDstBalance = () => {
  const dstToken = useTwapContext().dstToken;
  return query.useBalance(dstToken);
};

export const useFormatNumber = ({
  value,
  decimalScale = 3,
  prefix,
  suffix,
  disableDynamicDecimals = true,
}: {
  value?: string | number;
  decimalScale?: number;
  prefix?: string;
  suffix?: string;
  disableDynamicDecimals?: boolean;
}) => {
  const { disableThousandSeparator } = useTwapContext().uiPreferences;
  const result = useNumericFormat({
    allowLeadingZeros: true,
    thousandSeparator: disableThousandSeparator ? "" : ",",
    displayType: "text",
    value: value || "",
    decimalScale: decimalScale || 18,
    prefix,
    suffix,
  });

  return result.value?.toString();
};

export const useFormatNumberV2 = ({ value, decimalScale = 3, prefix, suffix }: { value?: string | number; decimalScale?: number; prefix?: string; suffix?: string }) => {
  const _value = useFormatDecimals(value, decimalScale);
  const { disableThousandSeparator } = useTwapContext().uiPreferences;
  const result = useNumericFormat({
    allowLeadingZeros: true,
    thousandSeparator: disableThousandSeparator ? "" : ",",
    displayType: "text",
    value: _value || "",
    decimalScale: 18,
    prefix,
    suffix,
  });

  return result.value?.toString();
};

export const useFormatDecimals = (value?: string | BN | number, decimalPlaces?: number) => {
  return useMemo(() => formatDecimals(value, decimalPlaces), [value, decimalPlaces]);
};

export const useAmountUi = (decimals?: number, value?: string) => {
  return useMemo(() => {
    if (!decimals || !value) return;
    return amountUiV2(decimals, value);
  }, [decimals, value]);
};

export const useAmountBN = (decimals?: number, value?: string) => {
  return useMemo(() => {
    if (!decimals || !value) return;
    return amountBNV2(decimals, value);
  }, [decimals, value]);
};

export function useDebounce<T>(value: T, delay?: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
export const useInvertedPrice = (price?: string, inverted?: boolean) => {
  return useMemo(() => {
    if (!price) return "";
    return inverted ? BN(1).div(price).toString() : price;
  }, [price, inverted]);
};

export const useInvertPrice = (price?: string) => {
  const [inverted, setInvert] = useState(false);
  const { srcToken, dstToken } = useTwapContext();

  const invertedPrice = useInvertedPrice(price, inverted);
  const value = useFormatNumber({ value: invertedPrice || "", decimalScale: 5 });

  const onInvert = useCallback(() => {
    setInvert((prev) => !prev);
  }, [setInvert]);

  const leftToken = inverted ? dstToken : srcToken;
  const rightToken = inverted ? srcToken : dstToken;

  return {
    price: value,
    leftToken,
    rightToken,
    inverted,
    onInvert,
  };
};

export const useNetwork = () => {
  const { config } = useTwapContext();

  return useMemo(() => {
    return Object.values(networks).find((network) => network.id === config.chainId);
  }, [config]);
};

export const useExplorerUrl = () => {
  const config = useTwapContext().config;

  return useMemo(() => getExplorerUrl(config.chainId), [config.chainId]);
};

export const useTokenBalance = (isSrc?: boolean) => {
  const { srcToken, dstToken } = useTwapContext();

  const srcBalance = useAmountUi(srcToken?.decimals, useSrcBalance().data?.toString());
  const dstBalance = useAmountUi(dstToken?.decimals, useDstBalance().data?.toString());
  return isSrc ? srcBalance : dstBalance;
};

export const useOpenOrders = () => {
  const { data } = query.useOrdersHistory();

  return useMemo(() => {
    return !data ? undefined : data[Status.Open as keyof typeof data];
  }, [data]);
};

export const useTokenFromParsedTokensList = (address?: string) => {
  const getTokenFromList = useGetTokenFromParsedTokensList();
  return useMemo(() => getTokenFromList(address), [address]);
};

export const useGetTokenFromParsedTokensList = () => {
  const { tokens } = useTwapContext();
  return useCallback(
    (address?: string) => {
      return tokens.find((token) => eqIgnoreCase(address || "", token.address || ""));
    },
    [tokens],
  );
};

export const usemElipsisAddress = (address?: string) => {
  const { addressPadding } = useTwapContext().uiPreferences;

  return useMemo(() => {
    return makeElipsisAddress(address, addressPadding);
  }, [addressPadding, address]);
};

export const useContract = (abi?: Abi, address?: string) => {
  const { config, web3 } = useTwapContext();
  return useMemo(() => {
    if (!web3 || !address || !config || !abi || isNativeAddress(address)) return;
    return new web3.eth.Contract(abi || [], address);
  }, [abi, address, config, web3]);
};

export const useTwapContract = () => {
  const { config } = useTwapContext();
  return useContract(TwapAbi as Abi, config.twapAddress);
};

export const useChangeNetwork = () => {
  const { config } = useTwapContext();
  const [loading, setLoading] = useState(false);

  const changeNetwork = async (onSuccess: () => void, onError: () => void) => {
    try {
      await switchMetaMaskNetwork(config.chainId);
      onSuccess();
    } catch (error) {
      onError();
    }
  };

  const onChangeNetwork = async () => {
    const onSuccess = () => {
      setLoading(false);
    };
    const onError = () => {
      setLoading(false);
    };
    setLoading(true);
    changeNetwork(onSuccess, onError);
  };
  return {
    changeNetwork: onChangeNetwork,
    loading,
  };
};

export const useGetHasAllowance = () => {
  const wToken = useNetwork()?.wToken;
  const { account, config } = useTwapContext();
  return useCallback(
    async (token: Token, amount: string) => {
      if (!wToken) return;
      token = token && isNativeAddress(token?.address) ? wToken : token;
      const contract = erc20(token!.symbol, token!.address, token!.decimals);
      const allowance = BN(await contract.methods.allowance(account, config.twapAddress).call());
      return allowance.gte(amount);
    },
    [account, config, wToken],
  );
};

export const useEstimatedDelayBetweenChunksMillis = () => {
  const { config } = useTwapContext();
  return useMemo(() => {
    return config.bidDelaySeconds * 1000 * 2;
  }, [config]);
};
