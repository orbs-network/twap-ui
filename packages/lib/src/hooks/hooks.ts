import { useCallback, useEffect, useMemo, useState } from "react";
import BN from "bignumber.js";
import { switchMetaMaskNetwork, isNativeAddress, Abi, erc20, network, TokenData } from "@defi.org/web3-candies";
import { useNumericFormat } from "react-number-format";
import { amountBNV2, amountUiV2, formatDecimals, getExplorerUrl, makeElipsisAddress } from "../utils";
import { query, useOrdersHistory } from "./query";
import { TwapAbi, groupOrdersByStatus, OrderStatus } from "@orbs-network/twap-sdk";
import { networks } from "../config";
import { useWidgetContext } from "../widget/widget-context";

export const useRefetchBalances = () => {
  const { refetch: refetchSrcBalance } = useSrcBalance();
  const { refetch: refetchDstBalance } = useDstBalance();

  return useCallback(async () => {
    await Promise.all([refetchSrcBalance(), refetchDstBalance()]);
  }, [refetchSrcBalance, refetchDstBalance]);
};

export const useSrcBalance = () => {
  const srcToken = useWidgetContext().srcToken;
  return query.useBalance(srcToken);
};

export const useDstBalance = () => {
  const dstToken = useWidgetContext().dstToken;
  return query.useBalance(dstToken);
};

export const useFormatNumber = ({ value, decimalScale = 3, prefix, suffix }: { value?: string | number; decimalScale?: number; prefix?: string; suffix?: string }) => {
  const { input } = useWidgetContext().uiPreferences;
  const _value = useFormatDecimals(value, decimalScale);
  const result = useNumericFormat({
    allowLeadingZeros: true,
    thousandSeparator: input?.disableThousandSeparator ? "" : ",",
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

export const useInvertedPrice = (price?: string, inverted?: boolean) => {
  return useMemo(() => {
    if (!price) return "";
    return inverted ? BN(1).div(price).toString() : price;
  }, [price, inverted]);
};

export const useInvertPrice = (price?: string) => {
  const [inverted, setInvert] = useState(false);
  const { srcToken, dstToken } = useWidgetContext();

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
  const { config } = useWidgetContext();

  return useMemo(() => {
    return Object.values(networks).find((network) => network.id === config.chainId);
  }, [config]);
};

export const useExplorerUrl = () => {
  const config = useWidgetContext().config;

  return useMemo(() => getExplorerUrl(config.chainId), [config.chainId]);
};

export const useAmountBN = (decimals?: number, value?: string) => {
  return useMemo(() => amountBNV2(decimals, value), [decimals, value]);
};

export const useAmountUi = (decimals?: number, value?: string) => {
  return useMemo(() => amountUiV2(decimals, value), [decimals, value]);
};

export const useTokenBalance = (isSrc?: boolean) => {
  const { srcToken, dstToken } = useWidgetContext();

  const srcBalance = useAmountUi(srcToken?.decimals, useSrcBalance().data?.toString());
  const dstBalance = useAmountUi(dstToken?.decimals, useDstBalance().data?.toString());
  return isSrc ? srcBalance : dstBalance;
};

export const useOpenOrders = () => {
  const { data } = useOrdersHistory();

  return useMemo(() => {
    if (!data) return [];
    return groupOrdersByStatus(data)?.[OrderStatus.Open] || [];
  }, [data]);
};

export const useContract = (abi?: Abi, address?: string) => {
  const { config } = useWidgetContext();
  const web3 = useWidgetContext().web3;

  const wTokenAddress = network(config.chainId)?.wToken.address;
  return useMemo(() => {
    if (!web3 || !address || !config || !abi) return;
    if (isNativeAddress(address)) {
      return new web3.eth.Contract(abi || [], wTokenAddress);
    }
    return new web3.eth.Contract(abi || [], address);
  }, [abi, address, config, web3, wTokenAddress]);
};

export const useTwapContract = () => {
  const { config } = useWidgetContext();
  return useContract(TwapAbi as Abi, config.twapAddress);
};

export const useChangeNetwork = () => {
  const { config } = useWidgetContext();
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
  const { config } = useWidgetContext();
  const { account } = useWidgetContext();
  return useCallback(
    async (token: TokenData, amount: string) => {
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
  const { config } = useWidgetContext();
  return useMemo(() => {
    return config.bidDelaySeconds * 1000 * 2;
  }, [config]);
};
