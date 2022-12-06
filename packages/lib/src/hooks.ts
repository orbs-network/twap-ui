import { Config, Order, OrderInputValidation, Paraswap, TokenData, TokensValidation, TWAPLib } from "@orbs-network/twap";
import { useOrdersContext, useTwapContext } from "./context";
import Web3 from "web3";
import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import BN from "bignumber.js";
import moment from "moment";
import { InitLibProps, OrderUI, Translations } from "./types";
import _ from "lodash";
import { useSendAnalyticsEvents } from "./analytics";
import { zeroAddress } from "@defi.org/web3-candies";
import { parseOrderUi, prepareOrdersTokensWithUsd, useTwapStore } from "./store";

const useWrapToken = () => {
  const lib = useTwapStore((state) => state.lib);
  const srcAmount = useTwapStore((state) => state.getSrcAmount());
  const srcToken = useTwapStore((state) => state.srcToken);
  const dstToken = useTwapStore((state) => state.dstToken);

  const { priorityFeePerGas, maxFeePerGas } = useGasPriceQuery();

  const setSrcToken = useTwapStore((state) => state.setSrcToken);
  const analytics = useSendAnalyticsEvents();
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
  const analytics = useSendAnalyticsEvents();

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

export const useCreateOrder = () => {
  const lib = useTwapStore((state) => state.lib);
  const srcToken = useTwapStore((state) => state.srcToken)!;
  const dstToken = useTwapStore((state) => state.dstToken)!;
  const srcAmount = useTwapStore((state) => state.getSrcAmount());
  const srcChunkAmount = useTwapStore((state) => state.getSrcChunkAmount());
  const dstMinChunkAmountOut = useTwapStore((state) => state.getDstMinAmountOut());
  const deadline = useTwapStore((state) => state.getDeadline());
  const fillDelay = useTwapStore((state) => state.getFillDelay())!;
  const srcUsd = useTwapStore((state) => state.srcUsd);
  const setCreateOrderLoading = useTwapStore((state) => state.setLoading);
  const { priorityFeePerGas, maxFeePerGas } = useGasPriceQuery();

  const resetTwapStore = useTwapStore((state) => state.reset);
  const analytics = useSendAnalyticsEvents();

  return useMutation(
    async () => {
      console.log({
        srcToken,
        dstToken,
        srcAmount: srcAmount.toString(),
        srcChunkAmount: srcChunkAmount.toString(),
        dstMinChunkAmountOut: dstMinChunkAmountOut.toString(),
        deadline,
        fillDelay,
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
        (fillDelay.amount * fillDelay.resolution) / 1000,
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

const useValidateProvider = () => {
  const setWrongNetwork = useTwapStore((state) => state.setWrongNetwork);

  return async (props: InitLibProps) => {
    const { provider, account, connectedChainId, config } = props;
    if (!provider || !account) {
      return false;
    }
    const chain = connectedChainId || (await new Web3(provider).eth.getChainId());
    setWrongNetwork(config.chainId !== chain);
    if (config.chainId !== chain) {
      return false;
    }
    return true;
  };
};

export const useInitLib = () => {
  const setTwapLib = useTwapStore((state) => state.setLib);
  const isValidProviderGet = useValidateProvider();

  return async (props: InitLibProps) => {
    const isValidProvider = await isValidProviderGet(props);
    setTwapLib(!isValidProvider ? undefined : new TWAPLib(props.config, props.account!, props.provider));
  };
};

const useOrderFillWarning = () => {
  const chunkSize = useTwapStore((state) => state.getSrcChunkAmount());
  const fillDelay = useTwapStore((state) => state.getFillDelay())!;
  const maxDuration = useTwapStore((state) => state.duration);
  const srcToken = useTwapStore((state) => state.srcToken);
  const dstToken = useTwapStore((state) => state.dstToken);
  const srcUsdValue = useTwapStore((state) => state.srcUsd);
  const srcBalance = useTwapStore((state) => state.srcBalance);
  const srcAmount = useTwapStore((state) => state.getSrcAmount());
  const minAmountOut = useTwapStore((state) => state.getDstMinAmountOut());
  const lib = useTwapStore((state) => state.lib);
  const deadline = useTwapStore((state) => state.getDeadline());
  const translation = useTwapContext().translations;
  const isLimitOrder = useTwapStore((state) => state.isLimitOrder);
  const limitPrice = useTwapStore((state) => state.getLimitPrice(false));

  if (!srcToken || !dstToken || lib?.validateTokens(srcToken, dstToken) === TokensValidation.invalid) return translation.selectTokens;
  if (srcAmount.isZero()) return translation.enterAmount;
  if (srcBalance && srcAmount.gt(srcBalance)) return translation.insufficientFunds;
  if (chunkSize.isZero()) return translation.enterTradeSize;
  if (maxDuration.amount === 0) return translation.enterMaxDuration;
  if (isLimitOrder && limitPrice.limitPrice.isZero()) return translation.insertLimitPriceWarning;
  const valuesValidation = lib?.validateOrderInputs(
    srcToken!,
    dstToken!,
    srcAmount,
    chunkSize,
    minAmountOut,
    deadline,
    (fillDelay.amount * fillDelay.resolution) / 1000,
    srcUsdValue
  );

  if (valuesValidation === OrderInputValidation.invalidTokens) {
    return translation.selectTokens;
  }

  if (valuesValidation === OrderInputValidation.invalidSmallestSrcChunkUsd) {
    return translation.tradeSizeMustBeEqual;
  }
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
  const warning = useOrderFillWarning();
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
  const lib = useTwapStore((state) => state.lib);
  const shouldWrap = useTwapStore((state) => state.shouldWrap());
  const shouldUnwrap = useTwapStore((state) => state.shouldUnwrap());
  const allowance = useHasAllowanceQuery();
  const warning = useOrderFillWarning();
  const wrongNetwork = useTwapStore((state) => state.wrongNetwork);
  const srcUsdLoading = useSrcUsd().isLoading;
  const dstUsdLoading = useDstUsd().isLoading;
  const showConfirmation = useTwapStore((state) => state.showConfirmation);
  const changeNetwork = useChangeNetworkButton();
  const connectButton = useConnectButton();
  const warningButton = useWarningButton();
  const unwrapButton = useUnWrapButton();
  const wrapButton = useWrapButton();
  const loadingButton = useLoadingButton();
  const approvebutton = useApproveButton();
  const createOrderButton = useCreateOrderButton();
  const showConfirmationButton = useShowConfirmationModalButton();

  if (wrongNetwork) {
    return changeNetwork;
  }
  if (!lib?.maker) {
    return connectButton;
  }
  if (warning) {
    return warningButton;
  }
  if (shouldUnwrap) {
    return unwrapButton;
  }
  if (shouldWrap) {
    return wrapButton;
  }
  if (allowance.isLoading || srcUsdLoading || dstUsdLoading) {
    return loadingButton;
  }
  if (allowance.data === false) {
    return approvebutton;
  }
  if (showConfirmation) {
    return createOrderButton;
  }
  return showConfirmationButton;
};

const useSrcTokenPanel = () => {
  const onSrcAmountChange = useTwapStore((state) => state.setSrcAmountUi);
  const srcToken = useTwapStore((state) => state.srcToken);
  const selectSrcToken = useTwapStore((state) => state.setSrcToken);
  const srcTokenAmount = useTwapStore((state) => state.srcAmountUi);
  const srcUsdLoading = useSrcUsd().isLoading;
  const srcBalacneLoading = useSrcBalance().isLoading;
  const srcBalance = useTwapStore((state) => state.getSrcBalanceUi());
  const srcUsd = useTwapStore((state) => state.getSrcAmountUsdUi());
  const onSrcTokenClick = useSendAnalyticsEvents().onSrcTokenClick;

  const onSelectToken = useCallback((token: TokenData) => {
    selectSrcToken(token);
    onSrcTokenClick(token.symbol);
  }, []);

  return {
    onChange: onSrcAmountChange,
    token: srcToken,
    selectToken: onSelectToken,
    amount: srcTokenAmount,
    usdValue: srcUsd,
    balance: srcBalance,
    usdLoading: srcUsdLoading,
    balanceLoading: srcBalacneLoading,
  };
};

const useDstTokenPanel = () => {
  const dstToken = useTwapStore((state) => state.dstToken);
  const selectToken = useTwapStore((state) => state.setDstToken);
  const amount = useTwapStore((state) => state.getDstAmountUi());
  const dstUsd = useTwapStore((state) => state.getDstAmountUsdUi());
  const balance = useTwapStore((state) => state.getDstBalanceUi());
  const dstUsdLoading = useDstUsd().isLoading;
  const dstBalanceLoading = useDstBalance().isLoading;
  const onDstTokenClick = useSendAnalyticsEvents().onDstTokenClick;

  const onSelectToken = useCallback((token: TokenData) => {
    selectToken(token);
    onDstTokenClick(token.symbol);
  }, []);

  return {
    token: dstToken,
    selectToken: onSelectToken,
    amount,
    usdValue: dstUsd,
    balance,
    onChange: null,
    usdLoading: dstUsdLoading,
    balanceLoading: dstBalanceLoading,
  };
};

export const useTokenPanel = (isSrc?: boolean) => {
  const srcValues = useSrcTokenPanel();
  const dstValues = useDstTokenPanel();
  const isLimitOrder = useTwapStore((state) => state.isLimitOrder);
  const { connectedChainId } = useTwapContext();
  const translations = useTwapContext().translations;
  const [tokenListOpen, setTokenListOpen] = useState(false);
  const maker = useTwapStore((state) => state.lib)?.maker;
  const wrongNetwork = useTwapStore((state) => state.wrongNetwork);

  const { selectToken, token, amount, onChange, balance, usdValue, usdLoading, balanceLoading } = isSrc ? srcValues : dstValues;

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
    connectedChainId,
    usdLoading,
    balanceLoading,
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
  const isLimitOrder = useTwapStore((state) => state.isLimitOrder);
  const toggleLimitOrder = useTwapStore((state) => state.toggleLimitOrder);
  const setLimitPrice = useTwapStore((state) => state.setLimitPriceUi);
  const { limitPriceUi: limitPrice, leftToken, rightToken } = useTwapStore((state) => state.getLimitPrice(inverted));
  const { marketPriceUi } = useTwapStore((state) => state.getMarketPrice(false));

  const analytics = useSendAnalyticsEvents();

  const onChange = (amountUi = "") => {
    setLimitPrice({ priceUi: amountUi, inverted });
  };

  const onToggleLimit = useCallback(() => {
    setInverted(false);
    toggleLimitOrder();
    onChange(marketPriceUi);
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
// TODO delete and use the useTwapStore
export const useOrderSummary = () => {
  const srcToken = useTwapStore((state) => state.srcToken);
  const dstToken = useTwapStore((state) => state.dstToken);
  const srcAmount = useTwapStore((state) => state.srcAmountUi);
  const isLimitOrder = useTwapStore((state) => state.isLimitOrder);
  const showConfirmation = useTwapStore((state) => state.showConfirmation);
  const setShowConfirmation = useTwapStore((state) => state.setShowConfirmation);
  const disclaimerAccepted = useTwapStore((state) => state.disclaimerAccepted);
  const setDisclaimerAccepted = useTwapStore((state) => state.setDisclaimerAccepted);
  const deadlineUi = useTwapStore((state) => state.getDeadlineUi());
  const fillDelayMillis = useTwapStore((state) => state.getFillDelayMillis());
  const srcChunkAmount = useTwapStore((state) => state.getSrcChunkAmountUi());
  const minAmountOut = useTwapStore((state) => state.getDstMinAmountOutUi());
  const srcUsd = useTwapStore((state) => state.getSrcAmountUsdUi());
  const dstUsd = useTwapStore((state) => state.getDstAmountUsdUi());
  const dstAmount = useTwapStore((state) => state.getDstAmountUi());
  const translations = useTwapContext().translations;
  const maker = useTwapStore((state) => state.lib?.maker);
  const totalChunks = useTwapStore((state) => state.chunks);

  const result = {
    srcToken,
    dstToken,
    deadline: deadlineUi,
    fillDelay: fillDelayUi(fillDelayMillis, translations),
    totalChunks,
    srcChunkAmount,
    srcUsd,
    srcAmount,
    dstUsd,
    dstAmount,
    minAmountOut,
    isLimitOrder,
    showConfirmation,
    closeConfirmation: () => setShowConfirmation(false),
    disclaimerAccepted,
    setDisclaimerAccepted,
    maker,
  };

  const isValid = _.every(_.values(result));

  return { ...result, isValid }; // TODO check isValid in components
};

export const useCustomActions = () => {
  const onPercentClick = useTwapStore((state) => state.setSrcAmountPercent);

  return { onPercentClick };
};

export const useChunks = () => {
  const chunksAmount = useTwapStore((state) => state.getSrcChunkAmountUi());
  const onTotalChunksChange = useTwapStore((state) => state.setChunks);
  const totalChunks = useTwapStore((state) => state.chunks);
  const usdValue = useTwapStore((state) => state.getSrcChunkAmountUsdUi());
  const srcToken = useTwapStore((state) => state.srcToken);
  const maxPossibleChunks = useTwapStore((state) => state.getMaxPossibleChunks());
  const srcAmountUi = useTwapStore((state) => state.srcAmountUi);
  const usdLoading = useSrcUsd().isLoading;

  return {
    chunksAmount,
    onTotalChunksChange,
    totalChunks,
    usdValue,
    token: srcToken,
    usdLoading,
    maxPossibleChunks,
    ready: !!srcToken && !!srcAmountUi,
  };
};

export const disconnectAndReset = () => {
  return useTwapStore((state) => state.reset);
};

export const useMaxDuration = () => {
  const duration = useTwapStore((state) => state.duration);
  const setDuration = useTwapStore((state) => state.setDuration);

  return {
    maxDuration: duration,
    onChange: setDuration,
  };
};

export const useFillDelay = () => {
  const fillDelay = useTwapStore((state) => state.getFillDelay());
  const setFillDelay = useTwapStore((state) => state.setFillDelay);
  const customFillDelayEnabled = useTwapStore((state) => state.customFillDelayEnabled);
  const setCustomFillDelayEnabled = useTwapStore((state) => state.setCustomFillDelayEnabled);
  const onCustomIntervalClick = useSendAnalyticsEvents().onCustomIntervalClick;

  const onCustomFillDelayClick = useCallback(() => {
    setCustomFillDelayEnabled();
    onCustomIntervalClick();
  }, []);

  return {
    fillDelay,
    onCustomFillDelayClick,
    onChange: setFillDelay,
    customFillDelayEnabled,
  };
};

export const useCancelOrder = () => {
  const lib = useTwapStore((state) => state.lib);
  const { refetch } = useOrdersHistoryQuery();
  const { priorityFeePerGas, maxFeePerGas } = useGasPriceQuery();
  const analytics = useSendAnalyticsEvents();

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

export const useSetTokens = () => {
  const srcTokenSelect = useTwapStore((state) => state.setSrcToken);
  const dstTokenSelect = useTwapStore((state) => state.setDstToken);

  return (srcToken?: TokenData, dstToken?: TokenData) => {
    srcTokenSelect(srcToken);
    dstTokenSelect(dstToken);
  };
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

export const useSrcUsd = () => {
  const srcToken = useTwapStore((state) => state.srcToken);
  const setSrcUsd = useTwapStore((state) => state.setSrcUsd);
  return useUsdValueQuery(srcToken, setSrcUsd);
};

export const useDstUsd = () => {
  const dstToken = useTwapStore((state) => state.dstToken);
  const setDstUsd = useTwapStore((state) => state.setDstUsd);
  return useUsdValueQuery(dstToken, setDstUsd);
};

export const useSrcBalance = () => {
  const srcToken = useTwapStore((state) => state.srcToken);
  const setSrcBalance = useTwapStore((state) => state.setSrcBalance);
  return useBalanceQuery(srcToken, setSrcBalance);
};

export const useDstBalance = () => {
  const dstToken = useTwapStore((state) => state.dstToken);
  const setDstBalance = useTwapStore((state) => state.setDstBalance);
  return useBalanceQuery(dstToken, setDstBalance);
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
  const lib = useTwapStore((state) => state.lib);
  const amount = useTwapStore((state) => state.getSrcAmount());
  const srcToken = useTwapStore((state) => state.srcToken);
  return useQuery(["useHasAllowanceQuery", srcToken?.address, amount.toString()], () => lib!.hasAllowance(srcToken!, amount), {
    enabled: !!lib && !!srcToken && amount.gt(0),
    staleTime: 10_000,
    refetchOnWindowFocus: true,
  });
};

const useUsdValueQuery = (token?: TokenData, onSuccess?: (value: BN) => void) => {
  const lib = useTwapStore((state) => state.lib);
  const query = useQuery(["useUsdValueQuery", token?.address], () => Paraswap.priceUsd(lib!.config.chainId, token!), {
    enabled: !!lib && !!token,
    onSuccess,
    refetchInterval: 60_000,
    staleTime: 60_000,
  });

  return { ...query, isLoading: query.isLoading && query.fetchStatus === "fetching" };
};
const useBalanceQuery = (token?: TokenData, onSuccess?: (value: BN) => void) => {
  const lib = useTwapStore((state) => state.lib);
  const query = useQuery(["useBalanceQuery", lib?.maker, token?.address], () => lib!.makerBalance(token!), {
    enabled: !!lib && !!token,
    onSuccess,
    refetchInterval: 10_000,
  });

  return { ...query, isLoading: query.isLoading && query.fetchStatus === "fetching" };
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

/**
 * Helpers
 */

export const fillDelayUi = (value: number, translations: Translations) => {
  if (!value) {
    return "0";
  }
  const time = moment.duration(value);
  const days = time.days();
  const hours = time.hours();
  const minutes = time.minutes();
  const seconds = time.seconds();

  const arr: string[] = [];

  if (days) {
    arr.push(`${days} ${translations.days} `);
  }
  if (hours) {
    arr.push(`${hours} ${translations.hours} `);
  }
  if (minutes) {
    arr.push(`${minutes} ${translations.minutes}`);
  }
  if (seconds) {
    arr.push(`${seconds} ${translations.seconds}`);
  }
  return arr.join(" ");
};
