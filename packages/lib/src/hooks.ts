import { Order, Paraswap, TokenData, TokensValidation, TWAPLib } from "@orbs-network/twap";
import { useOrdersContext, useTwapContext } from "./context";
import Web3 from "web3";
import { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import BN from "bignumber.js";
import { InitLibProps, OrderUI } from "./types";
import _ from "lodash";
import { analytics } from "./analytics";
import { setWeb3Instance, switchMetaMaskNetwork, zeroAddress } from "@defi.org/web3-candies";
import { parseOrderUi, prepareOrdersTokensWithUsd, useTwapStore } from "./store";

/**
 * Actions
 */

const useResetStoreAndQueries = () => {
  const resetTwapStore = useTwapStore((state) => state.reset);
  const client = useQueryClient();

  return () => {
    client.invalidateQueries();
    resetTwapStore();
  };
};

const useResetStoreWithLibAndQueries = () => {
  const resetTwapStore = useTwapStore((state) => state.resetWithLib);
  const client = useQueryClient();

  return () => {
    client.invalidateQueries();
    resetTwapStore();
  };
};

const useWrapToken = () => {
  const lib = useTwapStore((state) => state.lib);
  const srcAmount = useTwapStore((state) => state.getSrcAmount());
  const srcToken = useTwapStore((state) => state.srcToken);
  const dstToken = useTwapStore((state) => state.dstToken);

  const { priorityFeePerGas, maxFeePerGas } = useGasPriceQuery();

  const setSrcToken = useTwapStore((state) => state.setSrcToken);
  const resetTwapStore = useTwapStore((state) => state.reset);

  return useMutation(
    async () => {
      analytics.onWrapClick(srcAmount);
      return lib!.wrapNativeToken(srcAmount, priorityFeePerGas, maxFeePerGas);
    },
    {
      onSuccess: () => {
        analytics.onWrapSuccess();
        if (lib?.validateTokens(srcToken!, dstToken!) === TokensValidation.wrapOnly) {
          resetTwapStore();
          return;
        }
        setSrcToken(lib!.config.wToken);
      },
      onError: (error: Error) => {
        console.log(error.message);
        analytics.onWrapError(error.message);
      },
    }
  );
};

const useUnwrapToken = () => {
  const lib = useTwapStore((state) => state.lib);
  const { priorityFeePerGas, maxFeePerGas } = useGasPriceQuery();
  const resetTwapStore = useTwapStore((state) => state.reset);
  const srcTokenAmount = useTwapStore((state) => state.getSrcAmount());

  return useMutation(
    async () => {
      return lib?.unwrapNativeToken(srcTokenAmount, priorityFeePerGas, maxFeePerGas);
    },
    {
      onSuccess: () => {
        resetTwapStore();
      },
    }
  );
};

const useApproveToken = () => {
  const lib = useTwapStore((state) => state.lib);
  const srcAmount = useTwapStore((state) => state.getSrcAmount());
  const { priorityFeePerGas, maxFeePerGas } = useGasPriceQuery();
  const srcToken = useTwapStore((state) => state.srcToken);
  const { refetch } = useHasAllowanceQuery();

  return useMutation(
    async () => {
      analytics.onApproveClick(srcAmount);
      await lib?.approve(srcToken!, srcAmount, priorityFeePerGas, maxFeePerGas);
      await refetch();
    },
    {
      onSuccess: async () => {
        analytics.onApproveSuccess();
      },
      onError: (error: Error) => {
        analytics.onApproveError(error.message);
      },
    }
  );
};

export const useCreateOrder = () => {
  const { maxFeePerGas, priorityFeePerGas } = useGasPriceQuery();
  const store = useTwapStore();
  const reset = useResetStoreWithLibAndQueries();

  return useMutation(
    async () => {
      console.log({
        srcToken: store.srcToken,
        dstToken: store.dstToken,
        srcAmount: store.getSrcAmount().toString(),
        srcChunkAmount: store.getSrcChunkAmount().toString(),
        dstMinChunkAmountOut: store.getDstMinAmountOut().toString(),
        deadline: store.getDeadline(),
        fillDelay: store.getFillDelayMillis(),
        srcUsd: store.srcUsd.toString(),
        priorityFeePerGas: priorityFeePerGas?.toString(),
        maxFeePerGas: maxFeePerGas?.toString(),
      });
      analytics.onConfirmationCreateOrderClick();
      store.setLoading(true);
      return store.lib!.submitOrder(
        store.srcToken!,
        { ...store.dstToken!, address: store.lib!.validateTokens(store.srcToken!, store.dstToken!) === TokensValidation.dstTokenZero ? zeroAddress : store.dstToken!.address },
        store.getSrcAmount(),
        store.getSrcChunkAmount(),
        store.getDstMinAmountOut(),
        store.getDeadline(),
        store.getFillDelayMillis() / 1000,
        store.srcUsd,
        priorityFeePerGas,
        maxFeePerGas
      );
    },
    {
      onSuccess: async () => {
        analytics.onCreateOrderSuccess();
        reset();
        store.setWaitingForNewOrder(true);
      },
      onError: (error: Error) => {
        analytics.onCreateOrderError(error.message);
        if ((error as any).code === 4001) {
          analytics.onCreateOrderRejected();
        }
      },

      onSettled: () => {
        store.setLoading(false);
      },
    }
  );
};

export const useInitLib = () => {
  const setTwapLib = useTwapStore((state) => state.setLib);
  const setWrongNetwork = useTwapStore((state) => state.setWrongNetwork);
  const reset = useResetStoreAndQueries();

  return async (props: InitLibProps) => {
    reset();
    if (!props.provider || !props.account) {
      setTwapLib(undefined);
      setWrongNetwork(false);
      return;
    }
    const chain = props.connectedChainId || (await new Web3(props.provider).eth.getChainId());
    const wrongChain = props.config.chainId !== chain;
    setWrongNetwork(wrongChain);
    setTwapLib(wrongChain ? undefined : new TWAPLib(props.config, props.account!, props.provider));
  };
};

export const useSwitchTokens = () => {
  return useTwapStore((state) => state.switchTokens);
};

const useChangeNetworkButton = () => {
  const setInvalidChain = useTwapStore((state) => state.setWrongNetwork);
  const changeNetwork = useChangeNetworkCallback();
  const initLib = useInitLib();
  const { config, provider, account, translations } = useTwapContext();
  const [loading, setLoading] = useState(false);
  const onChangeNetwork = async () => {
    const onSuccess = () => {
      setInvalidChain(false);
      setLoading(false);
      initLib({ config, provider, account });
    };
    const onError = () => {
      setLoading(false);
    };
    setLoading(true);
    changeNetwork(onSuccess, onError);
  };

  return { text: translations.switchNetwork, onClick: onChangeNetwork, loading, disabled: loading };
};

const useConnectButton = () => {
  const { connect, translations } = useTwapContext();

  return { text: translations.connect, onClick: connect ? connect : undefined, loading: false, disabled: false };
};

const useWarningButton = () => {
  const translations = useTwapContext().translations;
  const warning = useTwapStore((state) => state.getFillWarning(translations));
  return { text: warning, onClick: () => {}, disabled: true, loading: false };
};

const useUnWrapButton = () => {
  const translations = useTwapContext().translations;
  const { mutate: unwrap, isLoading: unwrapLoading } = useUnwrapToken();
  return { text: translations.unwrap, onClick: unwrap, loading: unwrapLoading, disabled: unwrapLoading };
};

const useWrapButton = () => {
  const translations = useTwapContext().translations;
  const { mutate: wrap, isLoading: wrapLoading } = useWrapToken();
  return { text: translations.wrap, onClick: wrap, loading: wrapLoading, disabled: wrapLoading };
};

const useApproveButton = () => {
  const translations = useTwapContext().translations;
  const { mutate: approve, isLoading: approveLoading } = useApproveToken();

  return { text: translations.approve, onClick: approve, loading: approveLoading, disabled: approveLoading };
};

const useLoadingButton = () => {
  const setShowConfirmation = useTwapStore((state) => state.setShowConfirmation);
  const showConfirmation = useTwapStore((state) => state.showConfirmation);

  const createOrderLoading = useTwapStore((state) => state.loading);

  if (createOrderLoading) {
    return { text: "", onClick: () => setShowConfirmation(true), loading: true, disabled: showConfirmation };
  }
  return { text: "", onClick: () => {}, loading: true, disabled: true };
};

const useShowConfirmationModalButton = () => {
  const translations = useTwapContext().translations;
  const setShowConfirmation = useTwapStore((state) => state.setShowConfirmation);

  return { text: translations.placeOrder, onClick: () => setShowConfirmation(true), loading: false, disabled: false };
};
const useCreateOrderButton = () => {
  const translations = useTwapContext().translations;
  const { mutate: createOrder } = useCreateOrder();
  const disclaimerAccepted = useTwapStore((state) => state.disclaimerAccepted);
  const createOrderLoading = useTwapStore((state) => state.loading);

  return { text: translations.confirmOrder, onClick: createOrder, loading: createOrderLoading, disabled: !disclaimerAccepted || createOrderLoading };
};

export const useSubmitButton = () => {
  const store = useTwapStore();
  const { srcUsdLoading, dstUsdLoading } = useLoadingState();
  const translations = useTwapContext().translations;
  const allowance = useHasAllowanceQuery();
  const changeNetwork = useChangeNetworkButton();
  const connectButton = useConnectButton();
  const warningButton = useWarningButton();
  const unwrapButton = useUnWrapButton();
  const wrapButton = useWrapButton();
  const loadingButton = useLoadingButton();
  const approvebutton = useApproveButton();
  const createOrderButton = useCreateOrderButton();
  const showConfirmationButton = useShowConfirmationModalButton();
  const warning = store.getFillWarning(translations);

  if (store.wrongNetwork) return changeNetwork;
  if (!store.lib?.maker) return connectButton;
  if (warning) return warningButton;
  if (store.shouldUnwrap()) return unwrapButton;
  if (store.shouldWrap()) return wrapButton;
  if (allowance.isLoading || srcUsdLoading || dstUsdLoading || store.loading) return loadingButton;
  if (allowance.data === false) return approvebutton;
  if (store.showConfirmation) return createOrderButton;
  return showConfirmationButton;
};

export const useTokenPanel = (isSrc?: boolean) => {
  const srcTokenValues = useTwapStore((state) => ({
    token: state.srcToken,
    onChange: state.setSrcAmountUi,
    selectToken: state.setSrcToken,
    amount: state.srcAmountUi,
    balance: state.getSrcBalanceUi(),
    usdValue: state.getSrcAmountUsdUi(),
    setUsd: state.setSrcUsd,
    setBalance: state.setSrcBalance,
  }));

  const dstTokenValues = useTwapStore((state) => ({
    token: state.dstToken,
    selectToken: state.setDstToken,
    amount: state.getDstAmountUi(),
    usdValue: state.getDstAmountUsdUi(),
    balance: state.getDstBalanceUi(),
    onChange: null,
    setUsd: state.setDstUsd,
    setBalance: state.setDstBalance,
  }));

  const { isLimitOrder, maker, wrongNetwork } = useTwapStore((state) => ({
    isLimitOrder: state.isLimitOrder,
    maker: state.lib?.maker,
    wrongNetwork: state.wrongNetwork,
  }));
  const { translations } = useTwapContext();
  const { selectToken, token, onChange, amount, balance, usdValue, setUsd, setBalance } = isSrc ? srcTokenValues : dstTokenValues;
  const loadingState = useLoadingState();

  const onTokenSelect = useCallback((token: TokenData) => {
    selectToken(token);
    setUsd(BN(0));
    setBalance(BN(0));
  }, []);

  const selectTokenWarning = useMemo(() => {
    if (wrongNetwork) {
      return translations.switchNetwork;
    }
    if (!maker) {
      return translations.connect;
    }
  }, [maker, translations, wrongNetwork]);

  const loaders = useMemo(() => {
    const usdLoading = isSrc ? loadingState.srcUsdLoading : loadingState.dstUsdLoading;
    const balanceLoading = isSrc ? loadingState.srcBalanceLoading : loadingState.dstBalanceLoading;
    let inputLoading;
    if (isSrc) {
      inputLoading = !!amount && amount !== "0" && loadingState.srcUsdLoading;
    } else {
      inputLoading = !!amount && amount !== "0" && loadingState.dstUsdLoading;
    }
    return { usdLoading, balanceLoading, inputLoading };
  }, [loadingState, amount, isSrc]);

  return {
    token,
    value: amount,
    onChange,
    balance,
    disabled: !isSrc || !maker || !token,
    usdValue,
    onTokenSelect,
    amountPrefix: isSrc ? "" : isLimitOrder ? "≥" : "~",
    inputWarning: !isSrc ? undefined : !token ? translations.selectTokens : undefined,
    selectTokenWarning,
    usdLoading: loaders.usdLoading,
    inputLoading: loaders.inputLoading,
    balanceLoading: loaders.balanceLoading,
    decimalScale: token?.decimals || 0,
  };
};

export const useMarketPrice = () => {
  const [inverted, setInverted] = useState(false);
  const { leftToken, rightToken, marketPriceUi: marketPrice, loading } = useTwapStore((state) => state.getMarketPrice(inverted));

  return {
    leftToken,
    rightToken,
    marketPrice,
    toggleInverted: () => setInverted(!inverted),
    loading,
  };
};

export const useLimitPrice = () => {
  const [inverted, setInverted] = useState(false);
  const translations = useTwapContext().translations;

  const { isLimitOrder, toggleLimitOrder, setLimitPrice, marketPriceUi } = useTwapStore((state) => ({
    isLimitOrder: state.isLimitOrder,
    toggleLimitOrder: state.toggleLimitOrder,
    setLimitPrice: state.setLimitPriceUi,
    marketPriceUi: state.getMarketPrice(false).marketPriceUi,
  }));
  const { limitPriceUi: limitPrice, leftToken, rightToken } = useTwapStore((state) => state.getLimitPrice(inverted));

  const onChange = useCallback(
    (amountUi = "") => {
      setLimitPrice({ priceUi: amountUi, inverted });
    },
    [inverted]
  );

  const onToggleLimit = useCallback(() => {
    setInverted(false);
    toggleLimitOrder();
    analytics.onLimitToggleClick(!isLimitOrder);
  }, [marketPriceUi, isLimitOrder]);

  const toggleInverted = useCallback(() => {
    setInverted(!inverted);
  }, [inverted]);

  const loading = useLoadingState();

  return {
    onToggleLimit,
    toggleInverted,
    onChange,
    limitPrice,
    leftToken,
    rightToken,
    warning: !leftToken || !rightToken ? translations.selectTokens : undefined,
    isLimitOrder,
    isLoading: loading.srcUsdLoading && loading.dstUsdLoading,
  };
};

export const useCustomActions = () => {
  const store = useTwapStore();
  const onFillDelayBlur = () => {
    if (!store.getFillDelay().amount) {
      store.setCustomFillDelayEnabled(false);
    }
  };

  const onFillDelayFocus = () => {
    store.setFillDelay(store.getFillDelay());
    store.setCustomFillDelayEnabled(true);
  };

  return { onPercentClick: store.setSrcAmountPercent, onFillDelayBlur, onFillDelayFocus };
};

export const useCancelOrder = () => {
  const lib = useTwapStore((state) => state.lib);
  const { refetch } = useOrdersHistoryQuery();
  const { priorityFeePerGas, maxFeePerGas } = useGasPriceQuery();
  return useMutation(
    async (orderId: number) => {
      analytics.onCancelOrderClick(orderId);
      return lib?.cancelOrder(orderId, priorityFeePerGas, maxFeePerGas);
    },
    {
      onSuccess: (_result, orderId) => {
        analytics.onCancelOrderClick(orderId);
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

  const price = inverted ? BN(1).div(order.ui.dstPriceFor1Src) : order.ui.dstPriceFor1Src;
  return {
    inverted,
    toggleInverted: () => setInverted(!inverted),
    price,
    priceUi: price.toFormat(),
    leftToken: inverted ? order.ui.dstToken : order.ui.srcToken,
    rightToken: !inverted ? order.ui.dstToken : order.ui.srcToken,
  };
};

export const useLoadingState = () => {
  const srcUsdLoading = useSrcUsd().isLoading;
  const dstUsdLoading = useDstUsd().isLoading;
  const srcBalanceLoading = useSrcBalance().isLoading;
  const dstBalanceLoading = useDstBalance().isLoading;

  return {
    srcUsdLoading,
    dstUsdLoading,
    srcBalanceLoading,
    dstBalanceLoading,
  };
};

export const useSrcUsd = () => {
  const state = useTwapStore();
  return useUsdValueQuery(state.srcToken, state.setSrcUsd);
};

export const useDstUsd = () => {
  const state = useTwapStore();
  return useUsdValueQuery(state.dstToken, state.setDstUsd);
};

export const useSrcBalance = () => {
  const state = useTwapStore();
  return useBalanceQuery(state.srcToken, state.setSrcBalance);
};

export const useDstBalance = () => {
  const state = useTwapStore();
  return useBalanceQuery(state.dstToken, state.setDstBalance);
};

export const useChangeNetworkCallback = () => {
  const { provider: _provider, config } = useTwapContext();

  return async (onSuccess: () => void, onError: () => void) => {
    setWeb3Instance(new Web3(_provider));
    try {
      await switchMetaMaskNetwork(config.chainId);
      onSuccess();
    } catch (error) {
      onError();
    }
  };
};

/**
 * Queries
 */

const useHasAllowanceQuery = () => {
  const { lib, amount, srcToken } = useTwapStore((state) => ({
    lib: state.lib,
    amount: state.getSrcAmount(),
    srcToken: state.srcToken,
  }));
  const query = useQuery(["useTwapHasAllowanceQuery", srcToken?.address, amount.toString()], () => lib!.hasAllowance(srcToken!, amount), {
    enabled: !!lib && !!srcToken && amount.gt(0),
    staleTime: 10_000,
    refetchOnWindowFocus: true,
  });
  return { ...query, isLoading: query.isLoading && query.fetchStatus !== "idle" };
};

const useUsdValueQuery = (token?: TokenData, onSuccess?: (value: BN) => void) => {
  const lib = useTwapStore((state) => state.lib);
  const query = useQuery(["useUsdValueQuery", token?.address], () => Paraswap.priceUsd(lib!.config.chainId, token!), {
    enabled: !!lib && !!token,
    onSuccess,
    refetchInterval: 20_000,
    staleTime: 60_000,
  });

  return { ...query, isLoading: query.isLoading && query.fetchStatus !== "idle" };
};
const useBalanceQuery = (token?: TokenData, onSuccess?: (value: BN) => void) => {
  const lib = useTwapStore((state) => state.lib);
  const query = useQuery(["useBalanceQuery", lib?.maker, token?.address], () => lib!.makerBalance(token!), {
    enabled: !!lib && !!token,
    onSuccess,
    refetchInterval: 20_000,
  });
  return { ...query, isLoading: query.isLoading && query.fetchStatus !== "idle" };
};

const useGasPriceQuery = () => {
  const { maxFeePerGas, priorityFeePerGas } = useTwapContext();
  const lib = useTwapStore((state) => state.lib);

  const { isLoading, data } = useQuery(["useGasPrice", priorityFeePerGas, maxFeePerGas], () => Paraswap.gasPrices(lib!.config.chainId), {
    enabled: !!lib && !BN(maxFeePerGas || 0).gt(0) && !BN(priorityFeePerGas || 0).gt(0),
    refetchInterval: 60_000,
  });

  return { isLoading, maxFeePerGas: BN.max(data?.instant || 0, maxFeePerGas || 0, priorityFeePerGas || 0), priorityFeePerGas: BN.max(data?.low || 0, priorityFeePerGas || 0) };
};

const defaultFetcher = (chainId: number, token: TokenData) => {
  return Paraswap.priceUsd(chainId, token);
};

export const useOrdersHistoryQuery = (fetcher: (chainId: number, token: TokenData) => Promise<BN> = defaultFetcher) => {
  const tokenList = useOrdersContext().tokenList;
  const waitingForNewOrder = useTwapStore((state) => state.waitingForNewOrder);
  const setWaitingForNewOrder = useTwapStore((state) => state.setWaitingForNewOrder);

  const lib = useTwapStore((state) => state.lib);
  const query = useQuery(
    ["useOrdersHistory", lib?.maker, lib?.config.chainId],
    async () => {
      const rawOrders = await lib!.getAllOrders();
      const fetchUsdValues = (token: TokenData) => {
        return fetcher(lib!.config.chainId, token);
      };
      const tokenWithUsdByAddress = await prepareOrdersTokensWithUsd(tokenList || [], rawOrders, fetchUsdValues);
      if (!tokenWithUsdByAddress) return null;

      const parsedOrders = rawOrders.map((o: Order) => parseOrderUi(lib!, tokenWithUsdByAddress, o));
      return _.chain(parsedOrders)
        .orderBy((o: OrderUI) => o.order.ask.deadline, "desc")
        .groupBy((o: OrderUI) => o.ui.status)
        .value();
    },
    {
      enabled: !!lib && !!tokenList && tokenList.length > 0,
      refetchInterval: 60_000,
      onSettled: () => {
        setWaitingForNewOrder(false);
      },
    }
  );

  return { ...query, orders: query.data || {}, isLoading: (query.isLoading && query.fetchStatus !== "idle") || waitingForNewOrder };
};
