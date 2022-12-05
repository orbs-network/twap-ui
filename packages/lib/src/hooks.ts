import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { Config, OrderInputValidation, TokenData, TokensValidation, TWAPLib } from "@orbs-network/twap";
import { useTwapContext } from "./context";
import Web3 from "web3";
import { useCallback, useMemo, useState } from "react";
import {
  allTokensListAtom,
  balanceGet,
  confirmationAtom,
  createOrderLoadingAtom,
  customFillDelayEnabledAtom,
  deadlineGet,
  deadlineUiGet,
  disclaimerAcceptedAtom,
  dstAmountUiGet,
  dstBalanceUiGet,
  dstMinAmountOutGet,
  dstMinAmountOutUiGet,
  dstTokenAtom,
  dstUsdUiGet,
  fillDelayAtom,
  fillDelayMillisGet,
  gasPriceGet,
  invalidChainAtom,
  isLimitOrderAtom,
  limitPriceGet,
  limitPriceUiAtom,
  marketPriceGet,
  maxDurationAtom,
  maxPossibleChunksGet,
  orderHistoryGet,
  OrderUI,
  refetchAllowanceSet,
  resetAllQueriesSet,
  resetAllSet,
  shouldUnwrapGet,
  shouldWrapNativeGet,
  srcAmountGet,
  srcAmountPercentSet,
  srcAmountUiAtom,
  srcBalanceUiGet,
  srcChunkAmountGet,
  srcChunkAmountUiGet,
  srcChunkAmountUsdUiGet,
  srcTokenAtom,
  srcUsdUiGet,
  switchTokensSet,
  tokenAllowanceGet,
  totalChunksAtom,
  twapLibAtom,
  usdGet,
} from "./state";
import BN from "bignumber.js";
import moment from "moment";
import { Translations } from "./types";
import _ from "lodash";
import { useSendAnalyticsEvents } from "./analytics";
import { zeroAddress } from "@defi.org/web3-candies";
import { queryClientAtom } from "jotai-tanstack-query";

const useWrapToken = () => {
  const lib = useAtomValue(twapLibAtom);
  const srcAmount = useAtomValue(srcAmountGet);
  const srcToken = useAtomValue(srcTokenAtom);
  const dstToken = useAtomValue(dstTokenAtom);

  const { priorityFeePerGas, maxFeePerGas } = useGasPrice();

  const setSrcToken = useSetAtom(srcTokenAtom);
  const analytics = useSendAnalyticsEvents();
  const reset = useSetAtom(resetAllSet);

  return useMutation(
    async () => {
      analytics.onWrapClick(srcAmount);
      return lib!.wrapNativeToken(srcAmount, priorityFeePerGas, maxFeePerGas);
    },
    {
      onSuccess: () => {
        analytics.onWrapSuccess();
        if (lib?.validateTokens(srcToken!, dstToken!) === TokensValidation.wrapOnly) {
          reset();
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
  const srcTokenAmount = useAtomValue(srcAmountGet);
  const lib = useAtomValue(twapLibAtom);
  const { priorityFeePerGas, maxFeePerGas } = useGasPrice();
  const reset = useSetAtom(resetAllSet);

  return useMutation(
    async () => {
      return lib?.unwrapNativeToken(srcTokenAmount, priorityFeePerGas, maxFeePerGas);
    },
    {
      onSuccess: () => {
        reset();
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

const useGasPrice = () => {
  const { maxFeePerGas, priorityFeePerGas } = useTwapContext();
  const gasPrice = useMemo(() => {
    return { maxFeePerGas, priorityFeePerGas };
  }, [maxFeePerGas, priorityFeePerGas]);

  return useAtomValue(gasPriceGet(gasPrice));
};

const useApproveToken = () => {
  const lib = useAtomValue(twapLibAtom);
  const srcAmount = useAtomValue(srcAmountGet).integerValue(BN.ROUND_FLOOR);
  const { priorityFeePerGas, maxFeePerGas } = useGasPrice();

  const srcToken = useAtomValue(srcTokenAtom);
  const refetchAllowance = useSetAtom(refetchAllowanceSet);
  const analytics = useSendAnalyticsEvents();
  const client = useAtomValue(queryClientAtom);

  return useMutation(
    async () => {
      analytics.onApproveClick(srcAmount);

      await lib?.approve(srcToken!, srcAmount, priorityFeePerGas, maxFeePerGas);
      await client.refetchQueries();
    },
    {
      onSuccess: () => {
        refetchAllowance();
        analytics.onApproveSuccess();
      },
      onError: (error: Error) => {
        analytics.onApproveError(error.message);
      },
    }
  );
};

export const useCreateOrder = () => {
  const lib = useAtomValue(twapLibAtom);
  const srcToken = useAtomValue(srcTokenAtom)!;
  const dstToken = useAtomValue(dstTokenAtom)!;
  const srcAmount = useAtomValue(srcAmountGet);
  const srcChunkAmount = useAtomValue(srcChunkAmountGet);
  const dstMinChunkAmountOut = useAtomValue(dstMinAmountOutGet);
  const deadline = useAtomValue(deadlineGet);
  const fillDelay = useAtomValue(fillDelayAtom);
  const srcUsd = useAtomValue(usdGet(srcToken)).value;
  const setCreateOrderLoading = useSetAtom(createOrderLoadingAtom);
  const { priorityFeePerGas, maxFeePerGas } = useGasPrice();

  const reset = useSetAtom(resetAllSet);
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
        reset();
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
  const setTwapLib = useSetAtom(twapLibAtom);
  const setInvalidChain = useSetAtom(invalidChainAtom);

  return async (config: Config, provider?: any, account?: string, connectedChainId?: number) => {
    if (!provider || !account) {
      setTwapLib(undefined);
      setInvalidChain(false);
      return;
    }
    const chain = connectedChainId || (await new Web3(provider).eth.getChainId());
    if (config.chainId === chain) {
      setTwapLib(new TWAPLib(config, account, provider));
      setInvalidChain(false);
    } else {
      setTwapLib(undefined);
      setInvalidChain(true);
    }
  };
};

export const useSetTokensList = () => {
  const setTokenList = useSetAtom(allTokensListAtom);

  return (tokenList: TokenData[]) => {
    setTokenList(tokenList || []);
  };
};

const useOrderFillWarning = () => {
  const chunkSize = useAtomValue(srcChunkAmountGet);
  const fillDelay = useAtomValue(fillDelayAtom);
  const maxDuration = useAtomValue(maxDurationAtom);
  const srcToken = useAtomValue(srcTokenAtom);
  const dstToken = useAtomValue(dstTokenAtom);
  const srcUsdValue = useAtomValue(usdGet(srcToken)).value;
  const srcBalance = useAtomValue(balanceGet(srcToken)).value;
  const srcAmount = useAtomValue(srcAmountGet);
  const minAmountOut = useAtomValue(dstMinAmountOutGet);
  const lib = useAtomValue(twapLibAtom);
  const deadline = useAtomValue(deadlineGet);
  const translation = useTwapContext().translations;
  const isLimitOrder = useAtomValue(isLimitOrderAtom);
  const limitPrice = useAtomValue(limitPriceGet(false));

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
  return useSetAtom(switchTokensSet);
};

const useChangeNetwork = () => {
  const { translations } = useTwapContext();
  const setInvalidChain = useSetAtom(invalidChainAtom);
  const changeNetwork = useChangeNetworkCallback();
  const initLib = useInitLib();
  const context = useTwapContext();
  const [loading, setLoading] = useState(false);
  const onChangeNetwork = async () => {
    const onSuccess = () => {
      setInvalidChain(false);
      initLib(context.config, context.provider, context.account);
    };
    setLoading(true);
    await changeNetwork(onSuccess);
    setLoading(false);
  };

  return { text: translations.switchNetwork, onClick: onChangeNetwork, loading, disabled: loading };
};

const useConnect = () => {
  const translations = useTwapContext().translations;
  const { connect } = useTwapContext();

  return { text: translations.connect, onClick: connect ? connect : undefined, loading: false, disabled: false };
};

export const useShowConfirmationButton = () => {
  const lib = useAtomValue(twapLibAtom);
  const translations = useTwapContext().translations;
  const shouldWrap = useAtomValue(shouldWrapNativeGet);
  const shouldUnwrap = useAtomValue(shouldUnwrapGet);
  const allowance = useAtomValue(tokenAllowanceGet);
  const showConfirmation = useSetAtom(confirmationAtom);
  const connectArgs = useConnect();
  const changeNetworkArgs = useChangeNetwork();
  const { mutate: approve, isLoading: approveLoading } = useApproveToken();
  const warning = useOrderFillWarning();
  const { mutate: wrap, isLoading: wrapLoading } = useWrapToken();
  const { mutate: unwrap, isLoading: unwrapLoading } = useUnwrapToken();
  const createOrderLoading = useAtomValue(createOrderLoadingAtom);
  const srcToken = useAtomValue(srcTokenAtom);
  const dsToken = useAtomValue(dstTokenAtom);

  const srcUsdLoading = useAtomValue(usdGet(srcToken)).loading;
  const dstUsdLoading = useAtomValue(usdGet(dsToken)).loading;

  const wrongNetwork = useAtomValue(invalidChainAtom);

  if (wrongNetwork) {
    return changeNetworkArgs;
  }

  if (!lib?.maker) {
    return connectArgs;
  }

  if (warning) {
    return { text: warning, onClick: () => {}, disabled: true, loading: false };
  }
  if (shouldUnwrap) {
    return { text: translations.unwrap, onClick: unwrap, loading: unwrapLoading, disabled: unwrapLoading };
  }
  if (shouldWrap) {
    return { text: translations.wrap, onClick: wrap, loading: wrapLoading, disabled: wrapLoading };
  }
  if (allowance.loading) {
    return { text: "", onClick: () => {}, loading: true, disabled: true };
  }
  if (srcUsdLoading || dstUsdLoading) {
    return { text: translations.placeOrder, onClick: () => {}, loading: false, disabled: true };
  }
  if (allowance.hasAllowance === false) {
    return { text: translations.approve, onClick: approve, loading: approveLoading, disabled: approveLoading };
  }
  if (createOrderLoading) {
    return { text: "", onClick: () => showConfirmation(true), loading: true, disabled: false };
  }
  return { text: translations.placeOrder, onClick: () => showConfirmation(true), loading: false, disabled: false };
};

export const useOrders = () => {
  const { orders = {}, loading } = useAtomValue(orderHistoryGet);
  return { orders, loading };
};

export const useCreateOrderButton = () => {
  const { mutate: createOrder } = useCreateOrder();
  const disclaimerAccepted = useAtomValue(disclaimerAcceptedAtom);
  const lib = useAtomValue(twapLibAtom);
  const translations = useTwapContext().translations;
  const connectArgs = useConnect();
  const changeNetworkArgs = useChangeNetwork();
  const wrongNetwork = useAtomValue(invalidChainAtom);

  const createOrderLoading = useAtomValue(createOrderLoadingAtom);

  if (!lib?.maker) {
    return connectArgs;
  }
  if (wrongNetwork) {
    return changeNetworkArgs;
  }

  return { text: translations.confirmOrder, onClick: createOrder, loading: createOrderLoading, disabled: !disclaimerAccepted || createOrderLoading };
};

const useSrcTokenPanel = () => {
  const onChange = useSetAtom(srcAmountUiAtom);
  const token = useAtomValue(srcTokenAtom);
  const selectToken = useSetAtom(srcTokenAtom);
  const amount = useAtomValue(srcAmountUiAtom);
  const usdValue = useAtomValue(srcUsdUiGet);
  const balance = useAtomValue(srcBalanceUiGet);
  const usdLoading = useAtomValue(usdGet(useAtomValue(srcTokenAtom))).loading;
  const balanceLoading = useAtomValue(balanceGet(useAtomValue(srcTokenAtom))).loading;

  const analytics = useSendAnalyticsEvents();

  const onSelectToken = (token: TokenData) => {
    selectToken(token);
    analytics.onSrcTokenClick(token.symbol);
  };

  return {
    onChange,
    token,
    selectToken: onSelectToken,
    amount,
    usdValue,
    balance,
    usdLoading,
    balanceLoading,
  };
};

const useDstTokenPanel = () => {
  const token = useAtomValue(dstTokenAtom);
  const selectToken = useSetAtom(dstTokenAtom);
  const amount = useAtomValue(dstAmountUiGet);
  const usdValue = useAtomValue(dstUsdUiGet);
  const balance = useAtomValue(dstBalanceUiGet);
  const usdLoading = useAtomValue(usdGet(useAtomValue(dstTokenAtom))).loading;
  const balanceLoading = useAtomValue(balanceGet(useAtomValue(dstTokenAtom))).loading;
  const analytics = useSendAnalyticsEvents();

  const onSelectToken = (token: TokenData) => {
    selectToken(token);
    analytics.onDstTokenClick(token.symbol);
  };

  return {
    token,
    selectToken: onSelectToken,
    amount,
    usdValue,
    balance,
    onChange: () => {},
    usdLoading,
    balanceLoading,
  };
};

export const useTokenPanel = (isSrc?: boolean) => {
  const srcValues = useSrcTokenPanel();
  const dstValues = useDstTokenPanel();
  const isLimitOrder = useAtomValue(isLimitOrderAtom);
  const { connectedChainId } = useTwapContext();
  const translations = useTwapContext().translations;
  const [tokenListOpen, setTokenListOpen] = useState(false);
  const maker = useMaker();
  const wrongNetwork = useAtomValue(invalidChainAtom);

  const { selectToken, token, amount, onChange, balance, usdValue, usdLoading, balanceLoading } = isSrc ? srcValues : dstValues;

  const onTokenSelect = useCallback((token: TokenData) => {
    selectToken(token);
    setTokenListOpen(false);
  }, []);

  const selectTokenWarning = useMemo(() => {
    if (!maker) {
      return translations.connect;
    }
    if (wrongNetwork) {
      return translations.switchNetwork;
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
  const { leftToken, rightToken, marketPriceUi: marketPrice } = useAtomValue(marketPriceGet(inverted));

  return { leftToken, rightToken, marketPrice, toggleInverted: () => setInverted(!inverted), ready: !!leftToken && !!rightToken };
};

export const useLimitPrice = () => {
  const [inverted, setInverted] = useState(false);
  const translations = useTwapContext().translations;
  const [isLimitOrder, setIsLimitOrder] = useAtom(isLimitOrderAtom);
  const setLimitPrice = useSetAtom(limitPriceUiAtom);
  const { limitPriceUi: limitPrice, leftToken, rightToken } = useAtomValue(limitPriceGet(inverted));
  const { marketPrice } = useMarketPrice();
  const analytics = useSendAnalyticsEvents();

  const onChange = (amountUi = "") => {
    setLimitPrice({ price: amountUi, inverted });
  };

  const onToggleLimit = () => {
    setInverted(false);
    setIsLimitOrder(!isLimitOrder);
    onChange(marketPrice);
    analytics.onLimitToggleClick(isLimitOrder ? false : true);
  };

  const toggleInverted = () => {
    setInverted(!inverted);
  };

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

export const useOrderOverview = () => {
  const totalChunks = useAtomValue(totalChunksAtom);
  const srcToken = useAtomValue(srcTokenAtom);
  const dstToken = useAtomValue(dstTokenAtom);
  const srcAmount = useAtomValue(srcAmountUiAtom);
  const isLimitOrder = useAtomValue(isLimitOrderAtom);
  const [showConfirmation, setShowConfirmation] = useAtom(confirmationAtom);
  const [disclaimerAccepted, setDisclaimerAccepted] = useAtom(disclaimerAcceptedAtom);
  const deadlineUi = useAtomValue(deadlineUiGet);
  const fillDelayMillis = useAtomValue(fillDelayMillisGet);
  const srcChunkAmount = useAtomValue(srcChunkAmountUiGet);
  const minAmountOut = useAtomValue(dstMinAmountOutUiGet);
  const srcUsd = useAtomValue(srcUsdUiGet);
  const dstUsd = useAtomValue(dstUsdUiGet);
  const dstAmount = useAtomValue(dstAmountUiGet);
  const translations = useTwapContext().translations;
  const maker = useMaker();

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

export const resetState = () => {
  const reset = useSetAtom(resetAllSet);
  return reset;
};

export const useCustomActions = () => {
  const onPercentClick = useSetAtom(srcAmountPercentSet);

  return { onPercentClick };
};

export const useChunks = () => {
  const chunksAmount = useAtomValue(srcChunkAmountUiGet);
  const onTotalChunksChange = useSetAtom(totalChunksAtom);
  const totalChunks = useAtomValue(totalChunksAtom);
  const usdValue = useAtomValue(srcChunkAmountUsdUiGet);
  const token = useAtomValue(srcTokenAtom);
  const maxPossibleChunks = useAtomValue(maxPossibleChunksGet);
  const srcToken = useAtomValue(srcTokenAtom);
  const srcAmountUi = useAtomValue(srcAmountUiAtom);
  const usdLoading = useAtomValue(usdGet(useAtomValue(srcTokenAtom))).loading;

  return {
    chunksAmount,
    onTotalChunksChange,
    totalChunks,
    usdValue,
    token,
    usdLoading,
    maxPossibleChunks,
    ready: !!srcToken && !!srcAmountUi,
  };
};

export const disconnectAndReset = () => {
  const resetState = useSetAtom(resetAllSet);
  const resetLib = useSetAtom(twapLibAtom);

  return () => {
    resetState();
    resetLib(undefined);
  };
};

export const useMaxDuration = () => {
  const [maxDuration, setMaxDuration] = useAtom(maxDurationAtom);

  return {
    maxDuration,
    onChange: setMaxDuration,
  };
};

export const useFillDelay = () => {
  const [fillDelay, setFillDelay] = useAtom(fillDelayAtom);
  const [customFillDelayEnabled, setCustomFillDelayEnabled] = useAtom(customFillDelayEnabledAtom);
  const analytics = useSendAnalyticsEvents();

  const onCustomFillDelayClick = () => {
    setCustomFillDelayEnabled(true);
    analytics.onCustomIntervalClick();
  };

  return {
    fillDelay,
    onCustomFillDelayClick,
    onChange: setFillDelay,
    customFillDelayEnabled,
  };
};

export const useCancelOrder = () => {
  const lib = useAtomValue(twapLibAtom);
  const reset = useSetAtom(resetAllQueriesSet);
  const { priorityFeePerGas, maxFeePerGas } = useGasPrice();

  const analytics = useSendAnalyticsEvents();

  return useMutation(
    async (orderId: number) => {
      analytics.onCancelOrderClick(orderId);
      return lib?.cancelOrder(orderId, priorityFeePerGas, maxFeePerGas);
    },
    {
      onSuccess: (_result, orderId) => {
        analytics.onCancelOrderClick(orderId);
        reset();
      },
      onError: (error: Error) => {
        analytics.onCancelOrderError(error.message);
      },
    }
  );
};

export const useSetTokens = () => {
  const srcTokenSelect = useSetAtom(srcTokenAtom);
  const dstTokenSelect = useSetAtom(dstTokenAtom);

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

export const useMaker = () => {
  const lib = useAtomValue(twapLibAtom);
  return lib?.maker;
};

export const useChangeNetworkCallback = () => {
  const { provider: _provider, config } = useTwapContext();

  return async (onSuccess: () => void) => {
    const chain = config.chainId;

    const web3 = new Web3(_provider) as any

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
