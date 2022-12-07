import { Order, Paraswap, TokenData, TokensValidation, TWAPLib } from "@orbs-network/twap";
import { useOrdersContext, useTwapContext } from "./context";
import Web3 from "web3";
import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import BN from "bignumber.js";
import { InitLibProps, OrderUI } from "./types";
import _ from "lodash";
import { analytics } from "./analytics";
import { zeroAddress } from "@defi.org/web3-candies";
import { parseOrderUi, prepareOrdersTokensWithUsd, useTwapStore } from "./store";

/**
 * Actions
 */

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
  const srcTokenAmount = useTwapStore((state) => state.getSrcAmount());
  const lib = useTwapStore((state) => state.lib);
  const { priorityFeePerGas, maxFeePerGas } = useGasPriceQuery();
  const resetTwapStore = useTwapStore((state) => state.reset);

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

const useMutation = <T>(
  method: (args?: any) => Promise<T>,
  callbacks?: { onSuccess?: (data: T, args?: any) => void; onError?: (error: Error) => void; onFinally?: () => void }
) => {
  const [data, setData] = useState<any>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const mutate = async (args?: any) => {
    try {
      setIsLoading(true);
      const result = await method(args);
      setData(result);
      callbacks?.onSuccess?.(result, args);
    } catch (error) {
      callbacks?.onError?.(error as Error);
    } finally {
      setIsLoading(false);
      callbacks?.onFinally?.();
    }
  };

  return { isLoading, mutate, data };
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
    },
    {
      onSuccess: () => {
        refetch();
        analytics.onApproveSuccess();
      },
      onError: (error: Error) => {
        analytics.onApproveError(error.message);
      },
    }
  );
};
//TODO store.
export const useCreateOrder = () => {
  const { maxFeePerGas, priorityFeePerGas } = useGasPriceQuery();
  const { srcToken, dstToken, lib, srcAmount, srcChunkAmount, dstMinChunkAmountOut, deadline, srcUsd, setCreateOrderLoading, fillDelayMillis, resetTwapStore } = useTwapStore(
    (state) => ({
      lib: state.lib,
      srcToken: state.srcToken!,
      dstToken: state.dstToken!,
      srcAmount: state.getSrcAmount(),
      srcChunkAmount: state.getSrcChunkAmount(),
      dstMinChunkAmountOut: state.getDstMinAmountOut(),
      deadline: state.getDeadline(),
      fillDelayMillis: state.getFillDelayMillis(),
      srcUsd: state.srcUsd,
      setCreateOrderLoading: state.setLoading,
      resetTwapStore: state.reset,
    })
  );

  return useMutation(
    async () => {
      console.log({
        srcToken,
        dstToken,
        srcAmount: srcAmount.toString(),
        srcChunkAmount: srcChunkAmount.toString(),
        dstMinChunkAmountOut: dstMinChunkAmountOut.toString(),
        deadline,
        fillDelay: fillDelayMillis,
        srcUsd: srcUsd.toString(),
        priorityFeePerGas: priorityFeePerGas?.toString(),
        maxFeePerGas: maxFeePerGas?.toString(),
      });
      analytics.onConfirmationCreateOrderClick();
      setCreateOrderLoading(true);
      return lib!.submitOrder(
        srcToken,
        { ...dstToken, address: lib?.validateTokens(srcToken, dstToken) === TokensValidation.dstTokenZero ? zeroAddress : dstToken.address },
        srcAmount,
        srcChunkAmount,
        dstMinChunkAmountOut,
        deadline,
        fillDelayMillis / 1000,
        srcUsd,
        priorityFeePerGas,
        maxFeePerGas
      );
    },
    {
      onSuccess: () => {
        analytics.onCreateOrderSuccess();
        resetTwapStore();
      },
      onError: (error: Error) => {
        analytics.onCreateOrderError(error.message);
        console.log(error);
      },

      onFinally: () => {
        setCreateOrderLoading(false);
      },
    }
  );
};

export const useInitLib = () => {
  const setTwapLib = useTwapStore((state) => state.setLib);
  const setWrongNetwork = useTwapStore((state) => state.setWrongNetwork);

  return async (props: InitLibProps) => {
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
      initLib({ config, provider, account });
    };
    setLoading(true);
    await changeNetwork(onSuccess);
    setLoading(false);
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
  const createOrderLoading = useTwapStore((state) => state.loading);

  if (createOrderLoading) {
    return { text: "", onClick: () => setShowConfirmation(true), loading: true, disabled: false };
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
  const { lib, shouldWrap, shouldUnwrap, wrongNetwork, showConfirmation } = useTwapStore((state) => ({
    lib: state.lib,
    shouldWrap: state.shouldWrap(),
    shouldUnwrap: state.shouldUnwrap(),
    wrongNetwork: state.wrongNetwork,
    showConfirmation: state.showConfirmation,
    srcusd: state.getSrcAmountUsdUi(),
  }));

  const { srcUsdLoading, dstUsdLoading } = useLoadingState();
  const translations = useTwapContext().translations;
  const warning = useTwapStore((state) => state.getFillWarning(translations));
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

  if (wrongNetwork) return changeNetwork;
  if (!lib?.maker) return connectButton;
  if (warning) return warningButton;
  if (shouldUnwrap) return unwrapButton;
  if (shouldWrap) return wrapButton;
  if (allowance.isLoading || srcUsdLoading || dstUsdLoading) return loadingButton;
  if (allowance.data === false) return approvebutton;
  if (showConfirmation) return createOrderButton;
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
  }));

  const dstTokenValues = useTwapStore((state) => ({
    token: state.dstToken,
    selectToken: state.setDstToken,
    amount: state.getDstAmountUi(),
    usdValue: state.getDstAmountUsdUi(),
    balance: state.getDstBalanceUi(),
    onChange: null,
  }));

  const { isLimitOrder, maker, wrongNetwork } = useTwapStore((state) => ({
    isLimitOrder: state.isLimitOrder,
    maker: state.lib?.maker,
    wrongNetwork: state.wrongNetwork,
  }));
  const { translations } = useTwapContext();
  const [tokenListOpen, setTokenListOpen] = useState(false);
  const { selectToken, token, onChange, amount, balance, usdValue } = isSrc ? srcTokenValues : dstTokenValues;
  const loadingState = useLoadingState();

  const onTokenSelect = useCallback((token: TokenData) => {
    selectToken(token);
    setTokenListOpen(false);
  }, []);

  const selectTokenWarning = useMemo(() => {
    if (wrongNetwork) {
      return translations.switchNetwork;
    }
    if (!maker) {
      return translations.connect;
    }
  }, [maker, translations, wrongNetwork]);

  const toggleTokenList = useCallback((value: boolean) => {
    setTokenListOpen(value);
  }, []);

  return {
    address: token?.address,
    symbol: token?.symbol,
    logo: token?.logoUrl,
    value: amount,
    onChange,
    balance,
    disabled: !isSrc || !maker || !token,
    usdValue,
    onTokenSelect,
    tokenListOpen,
    toggleTokenList,
    amountPrefix: isSrc ? "" : isLimitOrder ? "≥" : "~",
    inputWarning: !isSrc ? undefined : !token ? translations.selectTokens : undefined,
    selectTokenWarning,
    usdLoading: isSrc ? loadingState.srcUsdLoading : loadingState.dstUsdLoading,
    balanceLoading: isSrc ? loadingState.srcBalanceLoading : loadingState.dstBalanceLoading,
  };
};

export const useMarketPrice = () => {
  const [inverted, setInverted] = useState(false);
  const { leftToken, rightToken, marketPriceUi: marketPrice } = useTwapStore((state) => state.getMarketPrice(inverted));

  return { leftToken, rightToken, marketPrice, toggleInverted: () => setInverted(!inverted), ready: !!leftToken && !!rightToken };
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

  return {
    onToggleLimit,
    toggleInverted,
    onChange,
    limitPrice,
    leftToken,
    rightToken,
    warning: !leftToken || !rightToken ? translations.selectTokens : undefined,
    isLimitOrder,
  };
};

export const useCustomActions = () => {
  const onPercentClick = useTwapStore((state) => state.setSrcAmountPercent);
  return { onPercentClick };
};

export const useCancelOrder = () => {
  const lib = useTwapStore((state) => state.lib);
  const { refetch } = useOrdersHistoryQuery();
  const { priorityFeePerGas, maxFeePerGas } = useGasPriceQuery();
  // TODO useMutation react query
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

  return async (onSuccess: () => void) => {
    const chain = config.chainId;

    const web3 = new Web3(_provider) as any;

    const provider = web3.provider || web3.currentProvider;
    if (!provider) return;
    try {
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: Web3.utils.toHex(chain) }],
      });
      onSuccess();
    } catch (error: any) {
      // if unknown chain, add chain
      if (error.code === 4902) {
        const response = await fetch("https://chainid.network/chains.json");
        const list = await response.json();
        const chainArgs = list.find((it: any) => it.chainId === chain);
        if (!chainArgs) {
          return;
        }

        await provider.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainName: chainArgs.name,
              nativeCurrency: chainArgs.nativeCurrency,
              rpcUrls: chainArgs.rpc,
              chainId: Web3.utils.toHex(chain),
              blockExplorerUrls: [_.get(chainArgs, ["explorers", 0, "url"])],
              iconUrls: [`https://defillama.com/chain-icons/rsz_${chainArgs.chain}.jpg`],
            },
          ],
        });
        onSuccess();
      }
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
  const query = useQuery(["useHasAllowanceQuery", srcToken?.address, amount.toString()], () => lib!.hasAllowance(srcToken!, amount), {
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
    refetchInterval: 10_000,
    staleTime: 60_000,
  });

  return { ...query, isLoading: query.isLoading && query.fetchStatus !== "idle" };
};
const useBalanceQuery = (token?: TokenData, onSuccess?: (value: BN) => void) => {
  const lib = useTwapStore((state) => state.lib);
  const query = useQuery(["useBalanceQuery", lib?.maker, token?.address], () => lib!.makerBalance(token!), {
    enabled: !!lib && !!token,
    onSuccess,
    refetchInterval: 10_000,
  });
  return { ...query, isLoading: query.isLoading && query.fetchStatus !== "idle" };
};

const useGasPriceQuery = () => {
  const { maxFeePerGas, priorityFeePerGas } = useTwapContext();
  if (BN(maxFeePerGas || 0).gt(0) && BN(priorityFeePerGas || 0).gt(0)) return { isLoading: false, maxFeePerGas: BN(maxFeePerGas!), priorityFeePerGas: BN(priorityFeePerGas!) };

  const lib = useTwapStore((state) => state.lib);

  const { isLoading, data } = useQuery(["useGasPrice", priorityFeePerGas, maxFeePerGas], () => Paraswap.gasPrices(lib!.config.chainId), {
    enabled: !!lib,
    refetchInterval: 60_000,
  });

  return { isLoading, maxFeePerGas: BN.max(data?.instant || 0, maxFeePerGas || 0, priorityFeePerGas || 0), priorityFeePerGas: BN.max(data?.low || 0, priorityFeePerGas || 0) };
};

const defaultFetcher = (token: TokenData) => {
  return Paraswap.priceUsd(useTwapStore.getState().lib!.config.chainId, token);
};

export const useOrdersHistoryQuery = (fetcher: (token: TokenData) => Promise<BN> = defaultFetcher) => {
  const { tokenList } = useOrdersContext();
  const lib = useTwapStore((state) => state.lib);

  const query = useQuery(
    ["useOrdersHistory", lib?.maker, lib?.config.chainId],
    async () => {
      const rawOrders = await lib!.getAllOrders();
      const tokenWithUsdByAddress = await prepareOrdersTokensWithUsd(tokenList, rawOrders, fetcher);
      const parsedOrders = rawOrders.map((o: Order) => parseOrderUi(lib!, tokenWithUsdByAddress, o));
      const ordersUi = _.chain(parsedOrders)
        .orderBy((o: OrderUI) => o.order.ask.deadline, "desc")
        .groupBy((o: OrderUI) => o.ui.status)
        .value();
      return ordersUi;
    },
    {
      enabled: !!lib && !!tokenList && tokenList.length > 0,
    }
  );

  return { ...query, orders: query.data || {}, isLoading: query.isLoading && query.fetchStatus !== "idle" };
};
