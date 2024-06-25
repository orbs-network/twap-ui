import { OrderInputValidation, Status, TokenData, TokensValidation } from "@orbs-network/twap";
import { useTwapContext } from "./context";
import Web3 from "web3";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import BN from "bignumber.js";
import { OrderUI, ParsedOrder, State, Step, SwapState, SwapStep } from "./types";
import { RiSwapFill } from "@react-icons/all-files/ri/RiSwapFill";

import _ from "lodash";
import { analytics } from "./analytics";
import {
  eqIgnoreCase,
  setWeb3Instance,
  switchMetaMaskNetwork,
  zeroAddress,
  zero,
  isNativeAddress,
  web3,
  parseEvents,
  sendAndWaitForConfirmations,
  maxUint256,
  parsebn,
  erc20,
  iwethabi,
} from "@defi.org/web3-candies";
import { TimeResolution, useOrdersStore, useTwapStore} from "./store";
import { MIN_NATIVE_BALANCE, MIN_TRADE_INTERVAL, MIN_TRADE_INTERVAL_FORMATTED, QUERY_PARAMS } from "./consts";
import { useNumericFormat } from "react-number-format";
import moment from "moment";
import { amountBN, amountBNV2, amountUi, amountUiV2, fillDelayText, formatDecimals, getExplorerUrl, getTokenFromTokensList, isTxRejected, setQueryParam, supportsTheGraphHistory } from "./utils";
import { query } from "./query";
/**
 * Actions
 */

const resetQueryParams = () => {
  setQueryParam(QUERY_PARAMS.INPUT_AMOUNT, undefined);
  setQueryParam(QUERY_PARAMS.LIMIT_PRICE, undefined);
  setQueryParam(QUERY_PARAMS.MAX_DURATION, undefined);
  setQueryParam(QUERY_PARAMS.TRADE_INTERVAL, undefined);
  setQueryParam(QUERY_PARAMS.TRADES_AMOUNT, undefined);
};
export const useResetStore = () => {
  const resetTwapStore = useTwapStore((state) => state.reset);
  const storeOverride = useTwapContext().storeOverride || {};

  return (args: Partial<State> = {}) => {
    resetTwapStore({ ...storeOverride, ...args });
    resetQueryParams();
  };
};

export const useReset = () => {
  const resetTwapStore = useTwapStore((state) => state.reset);
  const client = useQueryClient();
  const storeOverride = useTwapContext().storeOverride;

  return () => {
    client && client.invalidateQueries();
    resetTwapStore(storeOverride || {});
    resetQueryParams();
  };
};

export const useWrapToken = () => {
  const { srcAmount, srcToken, dstToken, updateState } = useTwapStore((state) => ({
    srcAmount: state.getSrcAmount(),
    srcToken: state.srcToken,
    dstToken: state.dstToken,
    updateState: state.updateState,
  }));
  const { onSrcTokenSelected, dappTokens, lib } = useTwapContext();
  const { priorityFeePerGas, maxFeePerGas } = query.useGasPrice();

  const setSrcToken = useTwapStore((state) => state.setSrcToken);
  const reset = useReset();

  return useMutation(
    async () => {
      updateState({ swapStep: "wrap" });
      analytics.onWrapClick(srcAmount);
      return lib!.wrapNativeToken(srcAmount, priorityFeePerGas, maxFeePerGas);
    },
    {
      onSuccess: () => {
        analytics.onWrapSuccess();
        updateState({ wrapSuccess: true });
        if (lib?.validateTokens(srcToken!, dstToken!) === TokensValidation.wrapOnly) {
          reset();
          return;
        }
        setSrcToken(lib!.config.wToken);
        const token = getTokenFromTokensList(dappTokens, lib!.config.wToken.address);
        if (token) {
          onSrcTokenSelected?.(token);
        }
      },
      onError: (error: Error) => {
        console.log(error.message);
        analytics.onWrapError(error.message);
        throw error;
      },
    }
  );
};

export const useUnwrapToken = () => {
  const lib = useTwapContext().lib;
  const { priorityFeePerGas, maxFeePerGas } = query.useGasPrice();
  const reset = useReset();
  const { srcTokenAmount, updateState } = useTwapStore((state) => ({
    srcTokenAmount: state.getSrcAmount(),
    updateState: state.updateState,
  }));

  return useMutation(
    async () => {
      if (!lib) {
        throw new Error("Lib not initialized");
      }
      await sendAndWaitForConfirmations(
        erc20<any>(lib.config.wToken.symbol, lib.config.wToken.address, lib.config.wToken.decimals, iwethabi).methods.deposit(),
        { from: lib.maker, maxPriorityFeePerGas: priorityFeePerGas, maxFeePerGas, value: srcTokenAmount },
        undefined,
        undefined,
        {
          onTxHash: (wrapTxHash) => {
            updateState({ wrapTxHash });
          },
        }
      );
    },
    {
      onSuccess: () => {
        reset();
      },
      onError: (error: Error) => {},
    }
  );
};

export const useApproveToken = () => {
  const { srcAmount, updateState } = useTwapStore((state) => ({
    srcAmount: state.getSrcAmount(),
    updateState: state.updateState,
  }));

  const lib = useTwapContext().lib;

  const { priorityFeePerGas, maxFeePerGas } = query.useGasPrice();
  const { refetch } = query.useAllowance();
  return useMutation(
    async (token?: TokenData) => {
      updateState({ swapStep: "approve" });
      if (!token) {
        throw new Error("Token is not defined");
      }
      if (!lib) {
        throw new Error("Lib is not defined");
      }
      analytics.onApproveClick(srcAmount);
      const _token = erc20(token.symbol, token.address, token.decimals);
      await sendAndWaitForConfirmations(
        _token.methods.approve(lib.config.twapAddress, BN(maxUint256).toFixed(0)),
        {
          from: lib.maker,
          maxPriorityFeePerGas: priorityFeePerGas,
          maxFeePerGas,
        },
        undefined,
        undefined,
        {
          onTxHash: (approveTxHash) => {
            updateState({ approveTxHash });
          },
        }
      );
      await refetch();
    },
    {
      onSuccess: async () => {
        analytics.onApproveSuccess();
        updateState({ approveSuccess: true });
      },
      onError: (error: Error) => {
        console.log(error.message);
        analytics.onApproveError(error.message);
        throw error;
      },
    }
  );
};

export const useCreateOrder = () => {
  const { maxFeePerGas, priorityFeePerGas } = query.useGasPrice();
  const store = useTwapStore();
  const { refetch } = query.useOrdersHistory();
  const submitOrder = useSubmitOrderCallback();
  const { setTab } = useOrdersStore();

  const { askDataParams, onTxSubmitted, lib } = useTwapContext();
  const dstMinAmountOut = useDstMinAmountOut();
  const dstAmountUsdUi = useDstAmountUsdUi();
  const { outAmountRaw, outAmountUi } = useOutAmount();
  const srcUsd = useSrcUsd().value.toString();
  const totalTrades = useChunks();
  const tradeSize = useSrcChunkAmount();
  const srcChunkAmount = useSrcChunkAmount();
  const deadline = useDeadline();
  const fillDelayMillisUi = useFillDelayMillis();
  return useMutation(
    async () => {
      const dstToken = {
        ...store.dstToken!,
        address: lib!.validateTokens(store.srcToken!, store.dstToken!) === TokensValidation.dstTokenZero ? zeroAddress : store.dstToken!.address,
      };

      console.log({
        srcToken: store.srcToken!,
        dstToken: dstToken,
        srcAmount: store.getSrcAmount().toString(),
        dstAmount: outAmountUi,
        dstUSD: dstAmountUsdUi!,
        getSrcChunkAmount: tradeSize.toString(),
        getDeadline: deadline,
        fillDelayMillis: fillDelayMillisUi,
      });

      const fillDelayMillis = (fillDelayMillisUi - lib!.estimatedDelayBetweenChunksMillis()) / 1000;

      store.updateState({ swapStep: "createOrder" });

      const onTxHash = (createOrdertxHash: string) => {
        setTab(0);
        store.updateState({
          waitingForOrdersUpdate: true,
          createOrdertxHash,
        });
      };

      const order = await submitOrder(
        onTxHash,
        store.srcToken!,
        dstToken,
        store.getSrcAmount(),
        srcChunkAmount,
        dstMinAmountOut,
        deadline,
        fillDelayMillis,
        srcUsd,
        askDataParams,
        priorityFeePerGas || zero,
        maxFeePerGas
      );

      onTxSubmitted?.({
        srcToken: store.srcToken!,
        dstToken: dstToken!,
        srcAmount: store.getSrcAmount().toString(),
        dstUSD: dstAmountUsdUi!,
        dstAmount: outAmountRaw || "",
        txHash: order.txHash,
      });

      await refetch();
      return order;
    },
    {
      onSuccess: async (result) => {
        analytics.onCreateOrderSuccess(result.orderId);
        store.updateState({ createOrderSuccess: true });
      },
      onError: (error: Error) => {
        analytics.onCreateOrderError(error.message);
        if ((error as any).code === 4001) {
          analytics.onCreateOrderRejected();
        }
        throw error;
      },
    }
  );
};

export const useUpdateStoreOveride = () => {
  const setStoreOverrideValues = useTwapStore((state) => state.setStoreOverrideValues);
  const enableQueryParams = useTwapContext().enableQueryParams;
  return useCallback(
    (values?: Partial<State>) => {
      setStoreOverrideValues(values || {}, enableQueryParams);
    },
    [setStoreOverrideValues, enableQueryParams]
  );
};

export const useChangeNetwork = () => {
  const { config, provider: _provider } = useTwapContext();
  const [loading, setLoading] = useState(false);

  const changeNetwork = async (onSuccess: () => void, onError: () => void) => {
    setWeb3Instance(new Web3(_provider));
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

export const useCustomActions = () => {
  return useSetSrcAmountPercent();
};

export const useCancelOrder = () => {
  const { refetch } = query.useOrdersHistory();
  const { priorityFeePerGas, maxFeePerGas } = query.useGasPrice();
  const lib = useTwapContext().lib;
  return useMutation(
    async (orderId: number) => {
      analytics.onCancelOrderClick(orderId);
      return lib?.cancelOrder(orderId, priorityFeePerGas, maxFeePerGas);
    },
    {
      onSuccess: (_result, orderId) => {
        analytics.onCancelOrderSuccess(orderId.toString());
        refetch();
      },
      onError: (error: Error) => {
        analytics.onCancelOrderError(error.message);
      },
    }
  );
};

export const useHistoryPrice = (order: OrderUI) => {
  const [inverted, setInverted] = useState(false);

  const price = inverted ? BN(1).div(order?.ui.dstPriceFor1Src || "0") : order?.ui.dstPriceFor1Src;
  return {
    inverted,
    toggleInverted: () => setInverted(!inverted),
    price,
    priceUi: price?.toFormat(),
    leftToken: inverted ? order?.ui.dstToken : order?.ui.srcToken,
    rightToken: !inverted ? order?.ui.dstToken : order?.ui.srcToken,
  };
};

export const useLoadingState = () => {
  const srcUSD = useSrcUsd();
  const dstUSD = useDstUsd();
  const srcBalance = useSrcBalance();
  const dstBalance = useDstBalance();

  return {
    srcUsdLoading: srcUSD.isLoading,
    dstUsdLoading: dstUSD.isLoading,
    srcBalanceLoading: srcBalance.isLoading,
    dstBalanceLoading: dstBalance.isLoading,
  };
};

export const useSrcUsd = () => {
  const { srcToken } = useTwapStore((store) => ({
    srcToken: store.srcToken,
  }));

  return query.usePriceUSD(srcToken?.address);
};

export const useDstUsd = () => {
  const { dstToken } = useTwapStore((store) => ({
    dstToken: store.dstToken,
  }));

  return query.usePriceUSD(dstToken?.address);
};

export const useSrcBalance = () => {
  const srcToken = useTwapStore((store) => store.srcToken);
  return query.useBalance(srcToken);
};

export const useDstBalance = () => {
  const dstToken = useTwapStore((store) => store.dstToken);
  return query.useBalance(dstToken);
};

export const useSetTokensFromDapp = () => {
  const { srcToken, dstToken, isWrongChain, parsedTokens } = useTwapContext();

  const { setSrcToken, setDstToken } = useTwapStore((state) => ({
    setSrcToken: state.setSrcToken,
    setDstToken: state.setDstToken,
  }));

  return useCallback(() => {
    if (isWrongChain || isWrongChain == null) return;

    if (srcToken) {
      setSrcToken(getTokenFromTokensList(parsedTokens, srcToken));
    }
    if (dstToken) {
      setDstToken(getTokenFromTokensList(parsedTokens, dstToken));
    }
  }, [srcToken, dstToken, isWrongChain, parsedTokens, setSrcToken, setDstToken]);
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
  const isBiggerThan1 = useMemo(() => {
    return BN(value || "0").gt(1);
  }, [value]);

  const result = useNumericFormat({
    allowLeadingZeros: true,
    thousandSeparator: ",",
    displayType: "text",
    value: value || "",
    decimalScale: 18,
    prefix,
    suffix,
  });

  return result.value?.toString();
};

export const useFormatNumberV2 = ({ value, decimalScale = 3, prefix, suffix }: { value?: string | number; decimalScale?: number; prefix?: string; suffix?: string }) => {
  const _value = useFormatDecimals(value, decimalScale);

  const result = useNumericFormat({
    allowLeadingZeros: true,
    thousandSeparator: ",",
    displayType: "text",
    value: _value || "",
    decimalScale: 18,
    prefix,
    suffix,
  });

  return result.value?.toString();
};
export const useSrcAmountNotZero = () => {
  const value = useTwapStore((store) => store.getSrcAmount());

  return value.gt(0);
};

export const useTokenSelect = (parsedTokens?: TokenData[]) => {
  const { onSrcTokenSelected, onDstTokenSelected, parsedTokens: _parsedTokens } = useTwapContext();
  const context = useTwapContext();

  const switchTokens = useSwitchTokens();
  const { setSrcToken, setDstToken, dstToken, srcToken } = useTwapStore((store) => ({
    setSrcToken: store.setSrcToken,
    setDstToken: store.setDstToken,
    srcToken: store.srcToken,
    dstToken: store.dstToken,
  }));

  const tokens = parsedTokens || _parsedTokens;

  return useCallback(
    ({ isSrc, token }: { isSrc: boolean; token: any }) => {
      const parsedToken = _.find(tokens, (t) => eqIgnoreCase(t.address, token.address) || t.symbol.toLowerCase() === token.symbol.toLowerCase());

      if (!parsedToken) return;

      const onSrc = () => {
        analytics.onSrcTokenClick(parsedToken?.symbol);
        setSrcToken(parsedToken);
        onSrcTokenSelected?.(token);
      };

      const onDst = () => {
        analytics.onDstTokenClick(parsedToken?.symbol);
        setDstToken(parsedToken);
        onDstTokenSelected?.(token);
      };
      if ((srcToken && isSrc && eqIgnoreCase(srcToken?.address, token.address)) || (dstToken && !isSrc && eqIgnoreCase(dstToken?.address, token.address))) {
        return;
      }
      if ((srcToken && !isSrc && eqIgnoreCase(srcToken?.address, token.address)) || (dstToken && isSrc && eqIgnoreCase(dstToken?.address, token.address))) {
        switchTokens();
        return;
      }

      if (isSrc) {
        onSrc();
      } else {
        onDst();
      }
    },
    [onSrcTokenSelected, onDstTokenSelected, tokens, setSrcToken, setDstToken, srcToken, dstToken, switchTokens]
  );
};

export const useToken = (isSrc?: boolean) => {
  const srcTokenLogo = useTwapStore((store) => store.srcToken);
  const dstTokenLogo = useTwapStore((store) => store.dstToken);

  return isSrc ? srcTokenLogo : dstTokenLogo;
};

export const useSwitchTokens = () => {
  const { dappTokens, onSrcTokenSelected, onDstTokenSelected } = useTwapContext();

  const { srcToken, dstToken, updateState, resetLimit } = useTwapStore((s) => ({
    srcToken: s.srcToken,
    dstToken: s.dstToken,
    srcAmountUi: s.srcAmountUi,
    updateState: s.updateState,
    resetLimit: s.resetLimit,
  }));
  resetQueryParams();
  const dstAmount = useOutAmount().outAmountUi;
  return useCallback(() => {
    updateState({
      srcToken: dstToken,
      dstToken: srcToken,
      srcAmountUi: "",
    });
    resetLimit();
    const _srcToken = getTokenFromTokensList(dappTokens, srcToken?.address) || getTokenFromTokensList(dappTokens, srcToken?.symbol);
    const _dstToken = getTokenFromTokensList(dappTokens, dstToken?.address) || getTokenFromTokensList(dappTokens, dstToken?.symbol);
    srcToken && onSrcTokenSelected?.(_dstToken);
    dstToken && onDstTokenSelected?.(_srcToken);
  }, [dstAmount, _.size(dappTokens), srcToken?.address, srcToken?.symbol, dstToken?.address, dstToken?.symbol, onSrcTokenSelected, onDstTokenSelected, resetLimit]);
};

export const useOrdersTabs = () => {
  const { data: orders } = query.useOrdersHistory();

  const _orders = orders || {};

  const {
    uiPreferences: { orderTabsToExclude = ["All"] },
  } = useTwapContext();

  return useMemo(() => {
    const keys = ["All", ..._.keys(Status)];

    const res = _.filter(keys, (it) => !orderTabsToExclude?.includes(it));
    const mapped = _.map(res, (it) => {
      if (it === "All") {
        return { All: _.size(_.flatMap(_orders)) || 0 };
      }
      return { [it]: _.size(_orders[it as Status]) || 0 };
    });

    return _.reduce(mapped, (acc, it) => ({ ...acc, ...it }), {});
  }, [orders]);
};

export const useDappRawSelectedTokens = () => {
  const { dappTokens } = useTwapContext();
  const tokensLength = _.size(dappTokens);

  const srcToken = useTwapStore((s) => s.srcToken);
  const dstToken = useTwapStore((s) => s.dstToken);

  const _srcToken = useMemo(() => {
    return getTokenFromTokensList(dappTokens, srcToken?.address || srcToken?.symbol);
  }, [srcToken?.address, srcToken?.symbol, tokensLength]);

  const _dstToken = useMemo(() => {
    return getTokenFromTokensList(dappTokens, dstToken?.address || dstToken?.symbol);
  }, [dstToken?.address, dstToken?.symbol, tokensLength]);

  return {
    srcToken: _srcToken,
    dstToken: _dstToken,
  };
};

export const useOneWaySubmit = () => {
  const { srcToken, swapState, updateState, swapStep } = useTwapStore((s) => ({
    srcToken: s.srcToken,
    swapState: s.swapState,
    updateState: s.updateState,
    swapStep: s.swapStep,
  }));
  const { refetch: refetchAllowance } = query.useAllowance();
  const { mutateAsync: approve } = useApproveToken();
  const { lib, minNativeTokenBalance } = useTwapContext();
  const reset = useReset()
  const { refetch: refetchNativeBalance } = query.useMinNativeTokenBalance(minNativeTokenBalance);

  const shouldWrap = useShouldWrap();
  const { mutateAsync: wrapToken } = useWrapToken();
  const { mutateAsync: createOrder } = useCreateOrder();
  const wToken = lib?.config.wToken;
  const nativeSymbol = lib?.config.nativeToken.symbol;
  const mutate = useMutation(
    async () => {
      updateState({ swapState: "loading" });

      if (minNativeTokenBalance) {
        const hasMinNativeTokenBalance = await refetchNativeBalance();
        if (!hasMinNativeTokenBalance) {
          throw new Error(`Insufficient ${nativeSymbol} balance, you need at least ${minNativeTokenBalance}${nativeSymbol} to cover the transaction fees.`);
        }
      }

      let token = srcToken;

      if (shouldWrap) {
        await wrapToken();
        token = wToken;
      }
      const hasAllowance = await refetchAllowance();
      
      if (!hasAllowance.data) {
        await approve(token);
        const res = await refetchAllowance();
        if (!res.data) {
          throw new Error("Insufficient allowance to perform the swap. Please approve the token first.");
        }
      }
      return createOrder();
    },
    {
      onError(error, variables, context) {
        if(isTxRejected(error)) {
          updateState({ swapState: undefined });
        }else{
          updateState({ swapState: "failed" });
        }
       
      },
      onSuccess(data, variables, context) {
        updateState({ swapState: "success" });
        reset();
      },
    }
  );

  const error = !mutate.error ? undefined : (mutate.error as any).message || "Failed to create order";

  return {
    ...mutate,
    swapState,
    error,
    swapStep,
  };
};

export const useSwapConfirmationModal = (props?: { closeDalay?: number }) => {
  const closeDalay = props?.closeDalay || 0;
  const { swapState, updateState, showConfirmation } = useTwapStore((s) => ({
    swapState: s.swapState,
    updateState: s.updateState,
    showConfirmation: s.showConfirmation,
  }));
  const reset = useReset();

  const onClose = useCallback(() => {
    updateState({ showConfirmation: false });
    if (swapState === "success") {
      setTimeout(() => {
        reset();
      }, closeDalay);
    }
    if (swapState === "failed") {
      setTimeout(() => {
        updateState({ swapState: undefined });
      }, closeDalay);
    }
  }, [reset, swapState]);

  const onOpen = useCallback(() => {
    updateState({ showConfirmation: true });
  }, [updateState]);

  const title = useMemo(() => {
    if (!swapState) {
      return "Review swap";
    }
  }, [swapState]);

  return {
    onClose,
    onOpen,
    isOpen: showConfirmation,
    title,
    swapState,
  };
};

export const useConfirmationButton = () => {
  const { translations, lib, isWrongChain, connect } = useTwapContext();
  const { createOrderLoading, srcAmount, srcToken, dstToken } = useTwapStore((s) => ({
    createOrderLoading: s.swapState === "loading",
    srcAmount: s.getSrcAmount().toString(),
    srcToken: s.srcToken,
    dstToken: s.dstToken,
  }));
  const { onOpen } = useSwapConfirmationModal();
  const outAmountLoading = useOutAmount().isLoading;
  const { mutate: unwrap, isLoading: unwrapLoading } = useUnwrapToken();
  const { changeNetwork, loading: changeNetworkLoading } = useChangeNetwork();
  const noLiquidity = useNoLiquidity();
  const shouldUnwrap = useShouldUnwrap();
  const srcUsd = useSrcUsd().value;
  const dstUsd = useDstUsd().value;
  const nativeSymbol = lib?.config.nativeToken.symbol;
  const usdLoading = useMemo(() => BN(srcUsd || "0").isZero() || BN(dstUsd || "0").isZero(), [srcUsd.toString(), dstUsd.toString()]);
  const { isLoading: srcBalanceLoading } = useSrcBalance();
  const warning = useSwapWarning();
  const { isLoading: srcTokenFeeLoading } = query.useFeeOnTransfer(srcToken?.address);
  const { isLoading: dstTokenFeeLoading } = query.useFeeOnTransfer(dstToken?.address);

  const maker = lib?.maker;

  return useMemo(() => {
    if (isWrongChain)
      return {
        text: translations.switchNetwork,
        onClick: changeNetwork,
        loading: changeNetworkLoading,
        disabled: changeNetworkLoading,
      };
    if (!maker)
      return {
        text: translations.connect,
        onClick: connect ? connect : undefined,
        loading: false,
        disabled: false,
      };

    if (warning.invalidTokens)
      return {
        text: warning.invalidTokens,
        onClick: undefined,
        disabled: true,
        loading: false,
      };

    if (warning.zeroSrcAmount)
      return {
        text: warning.zeroSrcAmount,
        onClick: undefined,
        disabled: true,
        loading: false,
      };

    if (outAmountLoading || usdLoading || srcBalanceLoading || srcTokenFeeLoading || dstTokenFeeLoading) {
      return { text: undefined, onClick: undefined, loading: true };
    }

    if (noLiquidity) {
      return {
        text: translations.noLiquidity,
        disabled: true,
        loading: false,
      };
    }

    if (warning.warning)
      return {
        text: warning.balance || translations.placeOrder,
        onClick: undefined,
        disabled: true,
        loading: false,
      };
    if (shouldUnwrap)
      return {
        text: translations.unwrap,
        onClick: unwrap,
        loading: unwrapLoading,
        disabled: unwrapLoading,
      };

    return {
      text: createOrderLoading ? translations.placeOrder : translations.placeOrder,
      onClick: onOpen,
      loading: createOrderLoading,
      disabled: false,
    };
  }, [
    createOrderLoading,
    srcAmount,
    outAmountLoading,
    usdLoading,
    noLiquidity,
    shouldUnwrap,
    unwrap,
    unwrapLoading,
    onOpen,
    translations,
    nativeSymbol,
    changeNetwork,
    changeNetworkLoading,
    connect,
    maker,
    warning,
    isWrongChain,
    srcBalanceLoading,
    srcTokenFeeLoading,
    dstTokenFeeLoading,
  ]);
};

export const useParseOrderUi = (o?: ParsedOrder, expanded?: boolean) => {
  const lib = useTwapContext()?.lib;
  const { value: srcUsd = zero } = query.usePriceUSD(o?.order.ask.srcToken);
  const { value: dstUsd = zero } = query.usePriceUSD(o?.order.ask.dstToken);

  const { data: dstAmountOutFromEvents } = query.useOrderPastEvents(o, expanded);

  return useMemo(() => {
    if (!lib || !o) return;
    const srcToken = o.ui.srcToken;
    const dstToken = o.ui.dstToken;
    if (!srcToken || !dstToken) return;
    const isTheGrapth = supportsTheGraphHistory(lib.config.chainId);

    const isMarketOrder = lib.isMarketOrder(o.order);
    const dstPriceFor1Src = lib.dstPriceFor1Src(srcToken, dstToken, srcUsd, dstUsd, o.order.ask.srcBidAmount, o.order.ask.dstMinAmount);
    const dstAmount = isTheGrapth ? o.ui.dstAmount : dstAmountOutFromEvents?.toString();
    const srcFilledAmount = isTheGrapth ? o.ui.srcFilledAmount : o.order.srcFilledAmount;

    return {
      order: o.order,
      ui: {
        ...o.ui,
        isMarketOrder,
        dstPriceFor1Src,
        srcUsd,
        dstUsd,
        srcUsdUi: srcUsd.toString(),
        dstUsdUi: dstUsd.toString(),
        srcAmountUi: amountUi(srcToken, o.order.ask.srcAmount),
        srcAmountUsdUi: o.ui.dollarValueIn || amountUi(srcToken, o.order.ask.srcAmount.times(srcUsd)),
        srcChunkAmountUi: amountUi(srcToken, o.order.ask.srcBidAmount),
        srcChunkAmountUsdUi: amountUi(srcToken, o.order.ask.srcBidAmount.times(srcUsd)),
        srcFilledAmountUi: amountUi(srcToken, BN(srcFilledAmount || "0")),
        dstMinAmountOutUi: amountUi(dstToken, o.order.ask.dstMinAmount),
        dstMinAmountOutUsdUi: amountUi(dstToken, o.order.ask.dstMinAmount.times(dstUsd)),
        fillDelay: o.order.ask.fillDelay * 1000 + lib.estimatedDelayBetweenChunksMillis(),
        createdAtUi: moment(o.order.time * 1000).format("ll HH:mm"),
        deadlineUi: moment(o.order.ask.deadline * 1000).format("ll HH:mm"),
        prefix: isMarketOrder ? "~" : "~",
        dstAmount: !dstAmount ? undefined : amountUi(dstToken, BN(dstAmount || "0")),
        dstAmountUsd: o.ui.dollarValueOut ? o.ui.dollarValueOut : !dstAmount ? undefined : amountUi(dstToken, BN(dstAmount || "0").times(dstUsd)),
        dstUsdLoading: !dstUsd || dstUsd.isZero(),
        progress: o?.ui.progress,
      },
    };
  }, [lib, o, srcUsd, dstUsd, dstAmountOutFromEvents]);
};

function useSubmitOrderCallback() {
  const lib = useTwapContext()?.lib;
  return async (
    onTxHash: (txHash: string) => void,
    srcToken: TokenData,
    dstToken: TokenData,
    srcAmount: BN.Value,
    srcChunkAmount: BN.Value,
    dstMinChunkAmountOut: BN.Value,
    deadline: number,
    fillDelaySeconds: number,
    srcUsd: BN.Value,
    askDataParams: any[] = [],
    maxPriorityFeePerGas?: BN.Value,
    maxFeePerGas?: BN.Value
  ): Promise<{ txHash: string; orderId: number }> => {
    if (!lib) {
      throw new Error("lib is not defined");
    }

    const validation = lib?.validateOrderInputs(srcToken, dstToken, srcAmount, srcChunkAmount, dstMinChunkAmountOut, deadline, fillDelaySeconds, srcUsd);
    if (validation !== OrderInputValidation.valid) throw new Error(`invalid inputs: ${validation}`);

    const askData = lib?.config.exchangeType === "PangolinDaasExchange" ? web3().eth.abi.encodeParameters(["address"], askDataParams) : [];

    const askParams = [
      lib.config.exchangeAddress,
      srcToken.address,
      dstToken.address,
      BN(srcAmount).toFixed(0),
      BN(srcChunkAmount).toFixed(0),
      BN(dstMinChunkAmountOut).toFixed(0),
      BN(deadline).div(1000).toFixed(0),
      BN(lib.config.bidDelaySeconds).toFixed(0),
      BN(fillDelaySeconds).toFixed(0),
    ];

    let ask: any;
    if (lib.config.twapVersion > 3) {
      askParams.push(askData as any);
      ask = lib.twap.methods.ask(askParams as any);
    } else {
      ask = (lib.twap.methods as any).ask(...askParams);
    }

    const tx = await sendAndWaitForConfirmations(
      ask,
      {
        from: lib.maker,
        maxPriorityFeePerGas,
        maxFeePerGas,
      },
      undefined,
      undefined,
      {
        onTxHash,
      }
    );

    const events = parseEvents(tx, lib.twap.options.jsonInterface);
    return { txHash: tx.transactionHash, orderId: Number(events[0].returnValues.id) };
  };
}

export const usePagination = <T>(list: T[] = [], chunkSize = 5) => {
  const [page, setPage] = useState(0);

  const chunks = useMemo(() => {
    return _.chunk(list, chunkSize);
  }, [list, chunkSize]);

  const pageList = useMemo(() => {
    return chunks[page] || [];
  }, [chunks, page]);

  return {
    list: pageList,
    page: page + 1,
    prevPage: () => setPage((p) => Math.max(p - 1, 0)),
    nextPage: () => setPage((p) => Math.min(p + 1, chunks.length - 1)),
    hasPrevPage: page > 0,
    hasNextPage: page < chunks.length - 1,
    text: `Page ${page + 1} of ${chunks.length}`,
  };
};

export const useOutAmount = () => {
  const { limitPriceUi: limitPriceV2, isLoading } = useLimitPrice();
  const { srcAmountUi, dstToken } = useTwapStore((s) => ({
    srcAmountUi: s.srcAmountUi,
    dstToken: s.dstToken,
  }));

  const wrongNetwork = useTwapContext().isWrongChain;

  const outAmountUi = useMemo(() => {
    if (!srcAmountUi || !limitPriceV2) return;
    return BN(limitPriceV2).multipliedBy(srcAmountUi).toString();
  }, [limitPriceV2, srcAmountUi]);

  return {
    isLoading: wrongNetwork ? false : isLoading,
    outAmountUi: outAmountUi || "",
    outAmountRaw: useAmountBN(dstToken?.decimals, outAmountUi) || "",
  };
};

export const useMarketPrice = () => {
  const marketPriceRaw = useTwapContext().marketPrice;
  const dstToken = useTwapStore((s) => s.dstToken);

  return {
    marketPriceRaw: marketPriceRaw,
    marketPriceUi: useAmountUi(dstToken?.decimals, marketPriceRaw),
    isLoading: BN(marketPriceRaw || 0).isZero(),
  };
};

export const useFormatDecimals = (value?: string | BN | number, decimalPlaces?: number) => {
  return useMemo(() => formatDecimals(value, decimalPlaces), [value, decimalPlaces]);
};

export const useLimitPrice = () => {
  const { marketPriceUi, isLoading } = useMarketPrice();
  const { dstToken, isCustom, customLimitPrice, inverted } = useTwapStore((s) => ({
    dstToken: s.dstToken,
    isCustom: s.isCustomLimitPrice,
    customLimitPrice: s.customLimitPrice,
    inverted: s.isInvertedLimitPrice,
  }));
  const marketPrice = useInvertedPrice(marketPriceUi, inverted);
  const limitPriceUi = useInvertedPrice(isCustom ? customLimitPrice : marketPrice, inverted);

  return {
    isLoading,
    limitPriceUi,
    limitPriceRaw: useAmountBN(dstToken?.decimals, limitPriceUi),
  };
};

export const useDstMinAmountOut = () => {
  const { limitPriceUi } = useLimitPrice();
  const srcChunkAmount = useSrcChunkAmount();
  const { srcToken, dstToken } = useTwapStore((s) => ({
    srcToken: s.srcToken,
    dstToken: s.dstToken,
  }));
  const lib = useTwapContext().lib;
  return useMemo(() => {
    if (lib && srcToken && dstToken && limitPriceUi && BN(limitPriceUi || "0").gt(0)) {
      const res = lib.dstMinAmountOut(srcToken!, dstToken!, srcChunkAmount, parsebn(limitPriceUi || "0"), false).toString();

      return res;
    }
    return BN(1).toString();
  }, [srcToken, dstToken, lib, srcChunkAmount, limitPriceUi]);
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

export const useSrcAmountUsdUi = () => {
  const { srcToken, srcAmount } = useTwapStore((s) => ({
    srcToken: s.srcToken,
    srcAmount: s.getSrcAmount(),
  }));

  const srcUsd = useSrcUsd().value.toString();

  return useAmountUi(srcToken?.decimals, srcAmount.times(srcUsd).toString());
};

export const useDstAmountUsdUi = () => {
  const dstAmount = useOutAmount().outAmountRaw;
  const dstToken = useTwapStore((s) => s.dstToken);

  const dstUsd = useDstUsd().value.toString();

  const value = useMemo(() => {
    return BN(dstAmount || "0")
      .times(dstUsd)
      .toString();
  }, [dstAmount, dstUsd]);

  return useAmountUi(dstToken?.decimals, value);
};

export const useMaxPossibleChunks = () => {
  const { srcAmount, srcToken } = useTwapStore((s) => ({
    srcAmount: s.getSrcAmount().toString(),
    srcToken: s.srcToken,
  }));

  const lib = useTwapContext().lib;

  const srcUsd = useSrcUsd().value.toString();

  return useMemo(() => {
    if (!lib || !srcToken || !srcAmount || !srcUsd) return 1;
    const res = lib.maxPossibleChunks(srcToken, srcAmount, srcUsd);
    return res > 1 ? res : 1;
  }, [srcAmount, srcToken, srcUsd]);
};

export const useChunks = () => {
  const srcUsd = useSrcUsd().value.toString();
  const { srcToken, customChunks } = useTwapStore((s) => ({
    srcToken: s.srcToken,
    customChunks: s.customChunks,
  }));
  const { isLimitOrder } = useTwapContext();
  const maxPossibleChunks = useMaxPossibleChunks();

  return useMemo(() => {
    if (isLimitOrder) return 1;
    if (!srcUsd || !srcToken) return 1;
    if (typeof customChunks === "number") return customChunks;
    return maxPossibleChunks;
  }, [srcUsd, srcToken, customChunks, maxPossibleChunks, isLimitOrder]);
};

export const useSwapWarning = () => {
  const { translations, lib } = useTwapContext();
  const chunks = useChunks();
  const singleChunksUsd = useSrcChunkAmountUsdUi();
  const { srcAmount, srcToken, dstToken } = useTwapStore((s) => ({
    srcAmount: s.getSrcAmount(),
    srcToken: s.srcToken,
    dstToken: s.dstToken,
  }));
  const { data: srcBalance } = useSrcBalance();
  const maxSrcInputAmount = useMaxSrcInputAmount();
  const fillDelayMillis = useFillDelayMillis();

  const { data: srcTokenFeeOnTransfer } = query.useFeeOnTransfer(srcToken?.address);
  const { data: dstTokenFeeOnTransfer } = query.useFeeOnTransfer(dstToken?.address);

  const feeOnTransferWarning = useMemo(() => {
    if (srcTokenFeeOnTransfer?.hasFeeOnTranfer || dstTokenFeeOnTransfer?.hasFeeOnTranfer) {
      return translations.feeOnTranferWarning;
    }
  }, [srcTokenFeeOnTransfer, dstTokenFeeOnTransfer, translations]);

  const tradeSize = useMemo(() => {
    if (BN(singleChunksUsd || 0).isZero()) return;

    const minTradeSizeUsd = BN(lib?.config.minChunkSizeUsd || 0);
    if (BN(chunks).isZero()) return translations.enterTradeSize;
    if (BN(singleChunksUsd || 0).isLessThan(minTradeSizeUsd)) {
      return translations.tradeSizeMustBeEqual.replace("{minChunkSizeUsd}", minTradeSizeUsd.toString());
    }
  }, [chunks, translations, singleChunksUsd, lib]);

  const fillDelay = useMemo(() => {
    if (fillDelayMillis < MIN_TRADE_INTERVAL) {
      return translations.minTradeIntervalWarning.replace("{minTradeInterval}", MIN_TRADE_INTERVAL_FORMATTED.toString());
    }
  }, [fillDelayMillis, translations]);

  const invalidTokens = useMemo(() => {
    if (!srcToken || !dstToken || lib?.validateTokens(srcToken, dstToken) === TokensValidation.invalid) {
      return translations.selectTokens;
    }
  }, [srcToken, dstToken, translations]);

  const zeroSrcAmount = useMemo(() => {
    if (srcAmount.isZero()) {
      return translations.enterAmount;
    }
  }, [srcAmount.toString(), translations]);

  const balance = useMemo(() => {
    const isNativeTokenAndValueBiggerThanMax = maxSrcInputAmount && srcAmount?.gt(maxSrcInputAmount);

    if ((srcBalance && srcAmount.gt(srcBalance)) || isNativeTokenAndValueBiggerThanMax) {
      return translations.insufficientFunds;
    }
  }, [srcBalance?.toString(), srcAmount.toString(), maxSrcInputAmount?.toString(), translations]);

  const warning = tradeSize || invalidTokens || zeroSrcAmount || balance || fillDelay || feeOnTransferWarning;

  return { tradeSize, invalidTokens, zeroSrcAmount, balance, fillDelay, warning, feeOnTransferWarning };
};

export const useSetChunks = () => {
  const updateState = useTwapStore((s) => s.updateState);
  const maxPossibleChunks = useMaxPossibleChunks();
  return useCallback(
    (chunks: number) => {
      if (chunks > 0 && chunks <= maxPossibleChunks) {
        setQueryParam(QUERY_PARAMS.TRADES_AMOUNT, chunks.toString());
      }
      updateState({ customChunks: chunks });
    },
    [updateState]
  );
};

export const useMaxSrcInputAmount = () => {
  const { srcToken } = useTwapStore((s) => ({
    srcToken: s.srcToken,
  }));
  const srcBalance = useSrcBalance().data?.toString();

  return useMemo(() => {
    if (srcBalance && isNativeAddress(srcToken?.address || "")) {
      const srcTokenMinimum = amountBN(srcToken, MIN_NATIVE_BALANCE.toString());
      return BN.max(0, BN.min(BN(srcBalance).minus(srcTokenMinimum)));
    }
  }, [srcToken, srcBalance]);
};

export const useSetSrcAmountPercent = () => {
  const { srcToken } = useTwapStore((s) => ({
    srcToken: s.srcToken,
  }));

  const setSrcAmountUi = useSetSrcAmountUi();
  const maxAmount = useMaxSrcInputAmount();
  const srcBalance = useSrcBalance().data?.toString();

  return useCallback(
    (percent: number) => {
      if (!srcToken || !srcBalance) {
        return;
      }

      //max amount will be greater than zero only if the src token is native token
      const _maxAmount = maxAmount && percent === 1 && maxAmount.gt(0) ? maxAmount : undefined;
      const value = amountUi(srcToken, _maxAmount || BN(srcBalance).times(percent));
      setQueryParam(QUERY_PARAMS.INPUT_AMOUNT, value);
      setSrcAmountUi(value);
    },
    [srcToken, maxAmount, srcBalance, setSrcAmountUi]
  );
};

export const useSrcChunkAmountUsdUi = () => {
  const { srcToken } = useTwapStore((s) => ({
    srcToken: s.srcToken,
  }));
  const srcChunksAmount = useSrcChunkAmount();
  const srcUsd = useSrcUsd().value.toString();

  const result = useMemo(() => {
    return srcChunksAmount.times(srcUsd).toString();
  }, [srcChunksAmount, srcUsd]);

  return useAmountUi(srcToken?.decimals, result);
};

export const useIsPartialFillWarning = () => {
  const chunks = useChunks();

  const fillDelayUiMillis = useFillDelayMillis();
  const durationMillis = useDurationMillis();

  return useMemo(() => {
    return chunks * fillDelayUiMillis > durationMillis;
  }, [chunks, fillDelayUiMillis, durationMillis]);
};

export const useSrcChunkAmount = () => {
  const { srcAmount } = useTwapStore((s) => ({
    srcAmount: s.getSrcAmount(),
  }));
  const chunks = useChunks();
  const lib = useTwapContext().lib;
  return useMemo(() => {
    return chunks === 0 ? BN(0) : lib?.srcChunkAmount(srcAmount, chunks) || BN(0);
  }, [lib, srcAmount, chunks]);
};

export const useDurationUi = () => {
  const fillDelayUiMillis = useFillDelayMillis();
  const chunks = useChunks();

  const { lib, isLimitOrder } = useTwapContext();

  return useMemo(() => {
    if (!lib) {
      return { resolution: TimeResolution.Minutes, amount: 0 };
    }
    if (isLimitOrder) {
      return { resolution: TimeResolution.Days, amount: 7 };
    }

    const _millis = fillDelayUiMillis * 2 * chunks;
    const resolution = _.find([TimeResolution.Days, TimeResolution.Hours, TimeResolution.Minutes], (r) => r <= _millis) || TimeResolution.Minutes;
    return { resolution, amount: Number(BN(_millis / resolution).toFixed(2)) };
  }, [lib, chunks, fillDelayUiMillis, isLimitOrder]);
};

export const useDurationMillis = () => {
  const durationUi = useDurationUi();

  return useMemo(() => {
    return (durationUi.amount || 0) * durationUi.resolution;
  }, [durationUi]);
};

export const useSrcChunkAmountUi = () => {
  const srcToken = useTwapStore((s) => s.srcToken);
  const srcChunksAmount = useSrcChunkAmount();

  return useFormatDecimals(useAmountUi(srcToken?.decimals, srcChunksAmount.toString()), 2);
};

export const useChunksBiggerThanOne = () => {
  const { srcToken, srcAmountUi } = useTwapStore((s) => ({
    srcToken: s.srcToken,
    srcAmountUi: s.srcAmountUi,
  }));

  const maxPossibleChunks = useMaxPossibleChunks();

  return useMemo(() => {
    if (!srcToken || !srcAmountUi) return false;
    return maxPossibleChunks > 1;
  }, [maxPossibleChunks, srcToken, srcAmountUi]);
};

export const useDeadline = () => {
  const { confirmationClickTimestamp } = useTwapStore((s) => ({
    confirmationClickTimestamp: s.confirmationClickTimestamp,
  }));

  const durationUi = useDurationUi();

  return useMemo(() => {
    return moment(confirmationClickTimestamp)
      .add((durationUi.amount || 0) * durationUi.resolution)
      .add(1, "minute")
      .valueOf();
  }, [durationUi, confirmationClickTimestamp]);
};

export const useDeadlineUi = () => {
  const deadline = useDeadline();

  return useMemo(() => moment(deadline).format("ll HH:mm"), [deadline]);
};

export const useSetSrcAmountUi = () => {
  const { updateState, srcToken } = useTwapStore((s) => ({
    updateState: s.updateState,
    srcToken: s.srcToken,
  }));
  const lib = useTwapContext().lib;
  const srcUsd = useSrcUsd().value.toString();

  return useCallback(
    (srcAmountUi: string) => {
      setQueryParam(QUERY_PARAMS.INPUT_AMOUNT, !srcAmountUi ? undefined : srcAmountUi);
      if (!srcAmountUi) {
        setQueryParam(QUERY_PARAMS.LIMIT_PRICE, undefined);
        setQueryParam(QUERY_PARAMS.TRADES_AMOUNT, undefined);
        setQueryParam(QUERY_PARAMS.TRADE_INTERVAL, undefined);
      }

      updateState({
        srcAmountUi,
        customFillDelay: { resolution: TimeResolution.Minutes, amount: MIN_TRADE_INTERVAL_FORMATTED },
        customChunks: undefined,
      });
    },
    [updateState, srcToken, srcUsd, lib]
  );
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

export const useNoLiquidity = () => {
  const srcAmount = useTwapStore((s) => s.getSrcAmount().toString());
  const { isLoading: dstAmountLoading, outAmountRaw } = useOutAmount();
  const limitPrice = useLimitPrice().limitPriceRaw;

  return useMemo(() => {
    if (BN(limitPrice || 0).isZero() || BN(srcAmount || 0).isZero() || dstAmountLoading) return false;
    return BN(outAmountRaw || 0).isZero();
  }, [outAmountRaw, dstAmountLoading, srcAmount, limitPrice]);
};

export const useInvertedPrice = (price?: string, inverted?: boolean) => {
  return useMemo(() => {
    if (!price) return "";
    return inverted ? BN(1).div(price).toString() : price;
  }, [price, inverted]);
};

export const useInvertPrice = (price?: string) => {
  const [inverted, setInvert] = useState(false);

  const { srcToken, dstToken } = useTwapStore((store) => ({
    srcToken: store.srcToken,
    dstToken: store.dstToken,
  }));
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

export const useLimitPricePanel = () => {
  const { marketPriceUi, isLoading } = useMarketPrice();
  const { isCustom, onChange, inverted, onResetCustom, invert, customPrice, setLimitPricePercent, limitPercent, updateState } = useTwapStore((s) => ({
    isCustom: s.isCustomLimitPrice,
    onChange: s.onLimitChange,
    inverted: s.isInvertedLimitPrice,
    onResetCustom: s.onResetCustomLimit,
    invert: s.invertLimit,
    customPrice: s.customLimitPrice,
    setLimitPricePercent: s.setLimitPricePercent,
    limitPercent: s.limitPricePercent,
    updateState: s.updateState,
  }));
  const isMarketOrder = useIsMarketOrder();
  const isWrongChain = useTwapContext().isWrongChain;
  const marketPrice = useFormatDecimals(useInvertedPrice(marketPriceUi, inverted));

  const onChangeCallback = useCallback(
    (customPrice: string) => {
      onChange(customPrice);
      setLimitPricePercent(undefined);
    },
    [onChange, setLimitPricePercent]
  );

  const onMarket = useCallback(() => {
    onResetCustom();
    updateState({ isMarketOrder: true, limitPricePercent: "0" });
  }, [onResetCustom, updateState]);

  const onPercentChange = useCallback(
    (percent: string) => {
      setLimitPricePercent(percent);
      const p = BN(percent || 0)
        .div(100)
        .plus(1)
        .toString();

      const value = BN(marketPrice || "0")
        .times(p)
        .toString();
      onChange(formatDecimals(value));
    },
    [marketPrice, onChange, setLimitPricePercent]
  );
  const limitPriceUi = isCustom ? customPrice : marketPrice;

  const priceDeltaPercentage = useMemo(() => {
    if (limitPercent) {
      return limitPercent;
    }
    if (!limitPriceUi || !marketPrice || BN(limitPriceUi).isZero() || BN(marketPrice).isZero()) return "0";
    const diff = BN(limitPriceUi || 0)
      .div(marketPrice || "0")
      .minus(1)
      .times(100)
      .decimalPlaces(0)
      .toString();

    return diff;
  }, [limitPriceUi, marketPrice, limitPercent]);

  const onInvert = useCallback(() => {
    invert();
    setLimitPricePercent("0");
  }, [invert, setLimitPricePercent]);

  return {
    priceDeltaPercentage,
    onPercentChange,
    onMarket,
    onChange: onChangeCallback,
    inverted,
    isLoading: isWrongChain ? false : isLoading,
    limitPriceUi,
    onInvert,
    isMarketOrder: !!isMarketOrder,
  };
};

export const useShouldWrap = () => {
  const { lib } = useTwapContext();
  const { srcToken, dstToken } = useTwapStore((s) => ({
    srcToken: s.srcToken,
    dstToken: s.dstToken,
  }));

  return useMemo(() => {
    if (!lib || !srcToken || !dstToken) return;

    return [TokensValidation.wrapAndOrder, TokensValidation.wrapOnly].includes(lib.validateTokens(srcToken, dstToken!));
  }, [lib, srcToken, dstToken]);
};

export const useShouldUnwrap = () => {
  const { lib } = useTwapContext();
  const { srcToken, dstToken } = useTwapStore((s) => ({
    srcToken: s.srcToken,
    dstToken: s.dstToken,
  }));

  return useMemo(() => {
    if (!lib || !srcToken || !dstToken) return;

    return lib.validateTokens(srcToken, dstToken) === TokensValidation.unwrapOnly;
  }, [lib, srcToken, dstToken]);
};

export const useIsInvalidTokens = () => {
  const { lib } = useTwapContext();
  const { srcToken, dstToken } = useTwapStore((s) => ({
    srcToken: s.srcToken,
    dstToken: s.dstToken,
  }));
  return useMemo(() => {
    if (!lib || !srcToken || !dstToken) return;

    return lib.validateTokens(srcToken, dstToken) === TokensValidation.invalid;
  }, [lib, srcToken, dstToken]);
};

export const useMinimumDelayMinutes = () => {
  const { lib } = useTwapContext();

  return useMemo(() => (lib?.estimatedDelayBetweenChunksMillis() || 0) / 1000 / 60, [lib]);
};

const useFillDelayMillis = () => {
  const customFillDelay = useTwapStore((s) => s.customFillDelay);
  const { isLimitOrder } = useTwapContext();

  return useMemo(() => {
    if (isLimitOrder) {
      return TimeResolution.Minutes * MIN_TRADE_INTERVAL_FORMATTED;
    }
    return customFillDelay.amount! * customFillDelay.resolution;
  }, [customFillDelay, isLimitOrder]);
};

export const useFillDelayText = () => {
  const fillDelayMillis = useFillDelayMillis();
  const { translations } = useTwapContext();
  return useMemo(() => fillDelayText(fillDelayMillis, translations), [fillDelayMillis, translations]);
};

export const useIsMarketOrder = () => {
  const isLimitOrder = useTwapContext().isLimitOrder;
  const isMarketOrder = useTwapStore((s) => s.isMarketOrder);

  return isLimitOrder ? false : isMarketOrder;
};

export const useExplorerUrl = () => {
  const lib = useTwapContext().lib;

  return useMemo(() => getExplorerUrl(lib?.config.chainId), [lib?.config.chainId]);
};

export const useSwapSteps = () => {
  const { data: hasAllowance, isLoading: allowanceLoading } = query.useAllowance();
  
  const { lib } = useTwapContext();
  const shouldWrap = useShouldWrap();
  const { srcToken, createOrdertxHash, approveTxHash, wrapTxHash, swapStep, createOrderSuccess, wrapSuccess, approveSuccess } = useTwapStore((s) => ({
    srcToken: s.srcToken,
    createOrdertxHash: s.createOrdertxHash,
    approveTxHash: s.approveTxHash,
    wrapTxHash: s.wrapTxHash,
    swapStep: s.swapStep,
    createOrderSuccess: s.createOrderSuccess,
    approveSuccess: s.approveSuccess,
    wrapSuccess: s.wrapSuccess,
  }));
  console.log({swapStep});
  
  const steps = useMemo(() => {
    let swapSteps: Step[] = [];

    if (shouldWrap) {
      const isPending = swapStep === "wrap" && !wrapTxHash && !wrapSuccess;
      const isLoading = swapStep === "wrap" && wrapTxHash && !wrapSuccess;
      swapSteps.push({
        title: isLoading ? "Wrapping..." : `Wrap ${lib?.config.nativeToken.symbol} in wallet`,
        Icon: RiSwapFill,
        image: lib?.config.nativeToken.logoUrl,
        status: wrapSuccess ? "completed" : isLoading ? "loading" : isPending ? "pending" : "disabled",
      });
    }

    if (!hasAllowance) {
      const isPending = swapStep === "approve" && !approveTxHash && !approveSuccess;
      const isLoading = swapStep === "approve" && approveTxHash && !approveSuccess;
      swapSteps.push({
        title: isLoading ? "Approving..." : `Approve ${srcToken?.symbol} in wallet`,
        Icon: RiSwapFill,
        link: {
          url: "/",
          text: "Some text",
        },
        status: approveSuccess ? "completed" : isLoading ? "loading" : isPending ? "pending" : "disabled",
      });
    }
    const isPending = swapStep === "createOrder" && !createOrdertxHash && !createOrderSuccess;
    const isLoading = swapStep === "createOrder" && createOrdertxHash && !createOrderSuccess;
    swapSteps.push({
      title: isLoading ? "Creating order..." : "Create Order in wallet",
      Icon: RiSwapFill,
      status: createOrderSuccess ? "completed" : isLoading ? "loading" : isPending ? "pending" : "disabled",
    });
    return swapSteps;
  }, [hasAllowance, shouldWrap, lib, srcToken, swapStep, createOrdertxHash, approveTxHash, wrapTxHash, createOrderSuccess, approveSuccess, wrapSuccess]);

  return {
    steps,
    isLoading: allowanceLoading,
  };
};
