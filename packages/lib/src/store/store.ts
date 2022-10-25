import _ from "lodash";
import {
  Abi,
  account as candiesAccount,
  BigNumber,
  bn,
  contract,
  convertDecimals,
  eqIgnoreCase,
  erc20,
  parsebn,
  setWeb3Instance,
  Token,
  zero,
  zeroAddress,
} from "@defi.org/web3-candies";
import { useMutation, useQuery } from "react-query";
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import Web3 from "web3";
import { DstTokenState, GlobalState, MaxDurationState, OrderStatus, PriceState, SrcTokenState, TokenInfo, TradeIntervalState, TradeSizeState, Web3State } from "../types";
import create from "zustand";
import { TimeFormat } from "./TimeFormat";
import { nativeAddresses, TwapConfig } from "../consts";
import { changeNetwork } from "./connect";
import { TwapContext } from "../context";
import moment from "moment";
import twapAbi from "./twap-abi.json";
import lensAbi from "./lens-abi.json";

const srcTokenInitialState = {
  srcTokenInfo: undefined,
  srcToken: undefined,
  srcTokenAmount: undefined,
};

const dstTokenInitialState = {
  dstTokenInfo: undefined,
  dstToken: undefined,
};

const maxDurationInitialState = {
  millis: 0,
  timeFormat: TimeFormat.Minutes,
};

const tradeIntervalInitialState = {
  millis: 0,
  insertedTimeFormat: TimeFormat.Minutes,
  timeFormat: TimeFormat.Minutes,
  customInterval: false,
};

const priceInitialState = {
  limitPrice: undefined,
  isLimitOrder: false,
};

const tradeSizeInitialState = {
  tradeSize: undefined,
};

const globalInitialState = {
  showConfirmation: false,
  disclaimerAccepted: false,
};

export const useGlobalState = create<GlobalState>((set) => ({
  ...globalInitialState,
  setShowConfirmation: (showConfirmation) => {
    set({ showConfirmation });
    if (!showConfirmation) {
      set({ disclaimerAccepted: false });
    }
  },
  setDisclaimerAccepted: (disclaimerAccepted) => set({ disclaimerAccepted }),
  reset: () => set(globalInitialState),
}));

export const useSrcTokenStore = create<SrcTokenState>((set) => ({
  ...srcTokenInitialState,
  setSrcToken: (srcTokenInfo, keepAmount) => {
    set({ srcTokenInfo, srcToken: getToken(srcTokenInfo) });
    if (!keepAmount) {
      set({ srcTokenAmount: undefined });
    }
    useLimitPriceStore.getState().reset();
  },
  setSrcTokenAmount: (srcTokenAmount) => {
    set({ srcTokenAmount });
    const tradeSizeState = useTradeSizeStore.getState();
    if (srcTokenAmount && tradeSizeState.tradeSize && tradeSizeState.tradeSize.gt(srcTokenAmount)) {
      tradeSizeState.setTradeSize(srcTokenAmount);
    }
  },
  reset: () => set(srcTokenInitialState),
}));

export const useDstTokenStore = create<DstTokenState>((set) => ({
  ...dstTokenInitialState,
  setDstToken: (dstTokenInfo) => {
    useLimitPriceStore.getState().reset();
    set({ dstTokenInfo, dstToken: getToken(dstTokenInfo) });
  },
  reset: () => set(dstTokenInitialState),
}));

export const useMaxDurationStore = create<MaxDurationState>((set) => ({
  ...maxDurationInitialState,
  setMillis: (millis) => set({ millis }),
  setTimeFormat: (timeFormat) => set({ timeFormat }),
  reset: () => set(maxDurationInitialState),
}));

export const useTradeIntervalStore = create<TradeIntervalState>((set) => ({
  ...tradeIntervalInitialState,
  setMillis: (millis) => set({ millis }),
  setTimeFormat: (timeFormat) => set({ timeFormat }),
  setCustomInterval: (customInterval) => set({ customInterval }),
  reset: () => set(tradeIntervalInitialState),
}));

export const useLimitPriceStore = create<PriceState>((set, get) => ({
  ...priceInitialState,
  setLimitPrice: (limitPrice) => set({ limitPrice }),
  toggleLimit: (limitPrice) => set({ isLimitOrder: !get().isLimitOrder, limitPrice }),
  reset: () => set(priceInitialState),
  hideLimit: () => set({ isLimitOrder: false }),
}));

export const useTradeSizeStore = create<TradeSizeState>((set) => ({
  ...tradeSizeInitialState,
  setTradeSize: (tradeSize) => set({ tradeSize }),
  reset: () => set(tradeSizeInitialState),
}));

export const useWeb3Store = create<Web3State>((set) => ({
  web3: undefined,
  setWeb3: (web3) => set({ web3 }),
  account: undefined,
  setAccount: (account) => set({ account }),
  chain: undefined,
  setChain: (chain) => set({ chain }),
  integrationChain: undefined,
  integrationKey: undefined,
  setIntegrationChain: (integrationChain) => set({ integrationChain }),
  setIntegrationKey: (integrationKey) => set({ integrationKey }),
}));

const useTokenApproval = () => {
  const { account, chain, config } = useWeb3();
  const { srcToken, srcTokenAmount } = useSrcToken();

  const spender = config ? config.twapAddress : undefined;

  const { data: allowance, refetch } = useQuery(["allowance", account, srcToken?.address], async () => BigNumber(await srcToken!.methods.allowance(account!, spender!).call()), {
    enabled: !!account && !!chain && !!spender && !!srcToken && !!srcTokenAmount,
    refetchInterval: 5_000,
  });

  const { mutate: approve, isLoading: approveLoading } = useMutation(async () => {
    await srcToken?.methods.approve(spender!, srcTokenAmount!.toString()).send({ from: account });
    await new Promise((r) => setTimeout(r, 3000));
    await refetch();
  });

  return {
    isApproved: !srcTokenAmount ? false : allowance?.gte(srcTokenAmount || 0),
    approve,
    approveLoading,
  };
};

const useWrapToken = () => {
  const { srcTokenAmount, setSrcToken, srcTokenInfo } = useSrcToken();
  const { account, config } = useWeb3();
  const { token: wToken }: any = useTokenOrWrappedToken(srcTokenInfo);

  const { mutateAsync: wrap, isLoading } = useMutation(async () => {
    await wToken?.methods.deposit().send({ from: account, value: srcTokenAmount!.toString() });
    setSrcToken(config!.wrappedTokenInfo);
  });

  return {
    wrap,
    shouldWrap: isNativeToken(srcTokenInfo?.address),
    isLoading,
  };
};

export const useWeb3 = () => {
  const { setWeb3, web3, setAccount, account, setChain, chain, setIntegrationChain, integrationChain, integrationKey, setIntegrationKey } = useWeb3Store();

  const init = async (_integrationKey: string, provider?: any, integrationChainId?: number) => {
    const newWeb3 = provider ? new Web3(provider) : undefined;
    setWeb3(newWeb3);
    setWeb3Instance(newWeb3);
    setAccount(newWeb3 ? await candiesAccount() : undefined);
    setChain(newWeb3 ? await newWeb3.eth.getChainId() : undefined);
    setIntegrationChain(integrationChainId);
    setIntegrationKey(_integrationKey);
  };

  const rawConfig = _.get(TwapConfig, [integrationChain || ""]);

  return {
    init,
    web3,
    account,
    chain,
    integrationChain,
    isInvalidChain: chain && chain !== integrationChain,
    changeNetwork: () => changeNetwork(web3, integrationChain),
    config: _.merge(rawConfig, _.get(rawConfig, [integrationKey || ""])),
    ellipsisAccount: makeEllipsisAddress(account),
  };
};

const useAccountBalances = (token?: Token) => {
  const { account, isInvalidChain, web3 } = useWeb3();

  return useQuery(
    ["useAccountBalances", token?.address, account],
    async () => {
      if (isNativeToken(token!.address)) {
        return BigNumber((await web3?.eth.getBalance(account!)) || 0);
      }
      return BigNumber(await token!.methods.balanceOf(account!).call());
    },
    { enabled: !!token && !!account && !isInvalidChain, refetchInterval: 10_000 }
  );
};

// all actions (functions) related to src input
const useSrcToken = () => {
  const { setSrcToken, setSrcTokenAmount, srcTokenInfo, srcTokenAmount, srcToken } = useSrcTokenStore();

  const { getBnAmount } = useUiAmountToBigNumber(srcToken);
  const { getUiAmount } = useBigNumberToUiAmount(srcToken);

  const onChange = async (amountUi: string) => {
    const amount = await getBnAmount(amountUi);

    setSrcTokenAmount(amount);
  };

  const onChangePercent = async (percent: number) => {
    const value = balance?.multipliedBy(percent) || zero;
    const uiValue = await getUiAmount(value);
    onChange(uiValue);
  };

  const onSrcTokenSelect = (token: TokenInfo) => {
    setSrcToken(token);
  };

  const { isLoading: usdValueLoading, data: srcTokenUsdValue18 } = useUsdValue(srcToken);
  const { data: balance, isLoading: balanceLoading } = useAccountBalances(srcToken);

  return {
    onSrcTokenSelect,
    setSrcTokenAmount,
    setSrcToken,
    onChange,
    srcTokenInfo,
    srcToken,
    srcTokenAmount,
    srcTokenUiAmount: useBigNumberToUiAmount(srcToken, srcTokenAmount).data,
    usdValueLoading: usdValueLoading && srcTokenAmount?.gt(zero) ? true : false,
    srcTokenUsdValue18,
    srcTokenUsdValueUI: useBigNumberToUiAmount(srcToken, srcTokenAmount?.times(srcTokenUsdValue18 || 0).div(1e18)).data,
    balance,
    uiBalance: useBigNumberToUiAmount(srcToken, balance).data,
    balanceLoading,
    onChangePercent,
  };
};

// all actions (functions) related to src input
const useDstToken = () => {
  const { setDstToken, dstTokenInfo, dstToken } = useDstTokenStore();
  const { isLoading: usdValueLoading, data: dstTokenUsdValue18 } = useUsdValue(dstToken);
  const { srcTokenInfo, srcToken, srcTokenAmount, srcTokenUsdValue18 } = useSrcToken();
  const { limitPrice } = useLimitPriceStore();

  const { data: balance, isLoading: balanceLoading } = useAccountBalances(dstToken);

  const onDstTokenSelect = (token: TokenInfo) => {
    setDstToken(token);
  };

  const getDstAmount = () => {
    const srcTokenDecimals = srcTokenInfo?.decimals;
    const dstTokenDecimals = dstTokenInfo?.decimals;

    if (!srcTokenAmount || srcTokenAmount.isZero() || !srcToken || !dstToken || !srcTokenDecimals || !dstTokenDecimals) {
      return undefined;
    }
    let res;
    if (limitPrice) {
      res = srcTokenAmount.times(limitPrice);
    } else {
      res = srcTokenAmount.times(srcTokenUsdValue18 || 0).div(dstTokenUsdValue18 || 1);
    }
    return convertDecimals(res, srcTokenDecimals, dstTokenDecimals);
  };

  const dstTokenAmount = getDstAmount();

  const showAmount = !usdValueLoading;
  return {
    onDstTokenSelect,
    setDstToken,
    dstTokenUiAmount: useBigNumberToUiAmount(dstToken, showAmount ? dstTokenAmount : undefined).data,
    dstTokenInfo,
    dstToken,
    dstTokenAmount,
    usdValueLoading: usdValueLoading && dstTokenAmount ? true : false,
    dstTokenUsdValue18,
    dstTokenUsdValueUI: useBigNumberToUiAmount(dstToken, dstTokenAmount?.times(dstTokenUsdValue18 || 0).div(1e18)).data,
    balance,
    uiBalance: useBigNumberToUiAmount(dstToken, balance).data,
    balanceLoading,
  };
};

/**
 * @returns USD value for 1 whole token (mantissa)
 */
const useUsdValue = (token?: Token) => {
  const { isInvalidChain, config } = useWeb3();
  const { getUsdPrice } = useContext(TwapContext);
  return useQuery(
    ["useUsdValue", token?.address],
    async () => {
      const decimals = await token!.decimals();
      const address = isNativeToken(token!.address) ? config?.wrappedTokenInfo.address : token!.address;
      return getUsdPrice(address!, decimals);
    },
    {
      enabled: !!token && !isInvalidChain,
      // refetchInterval: 10000
    }
  );
};

// all actions (functions) related to max duration input
const useMaxDuration = () => {
  const { setMillis, setTimeFormat, timeFormat, millis } = useMaxDurationStore();

  const onChange = useCallback((timeFormat: TimeFormat, millis: number) => {
    setMillis(millis);
    setTimeFormat(timeFormat);
  }, []);

  const deadline = useMemo(() => {
    const now = moment().valueOf();
    return now + moment(millis).add(60_000, "milliseconds").valueOf();
  }, [millis]);

  return {
    setMaxDurationMillis: setMillis,
    setMaxDurationTimeFormat: setTimeFormat,
    onChange,
    maxDurationTimeFormat: timeFormat,
    maxDurationMillis: millis,
    deadline,
    deadlineUi: moment(deadline).format("DD/MM/YYYY HH:mm"),
  };
};

const useTradeInterval = () => {
  const { customInterval, millis, timeFormat, setMillis, setTimeFormat, setCustomInterval } = useTradeIntervalStore();
  const { maxDurationMillis } = useMaxDuration();
  const { totalTrades } = useTradeSize();

  const onChange = useCallback((timeFormat: TimeFormat, millis: number) => {
    setMillis(millis);
    setTimeFormat(timeFormat);
  }, []);

  const { derivedMillis, derivedTimeFormat } = useMemo(() => {
    return getDerivedTradeInterval(maxDurationMillis, totalTrades);
  }, [totalTrades, maxDurationMillis]);

  const tradeIntervalMillis = customInterval ? millis : derivedMillis;
  const tradeIntervalTimeFormat = customInterval ? timeFormat : derivedTimeFormat;

  return {
    tradeIntervalMillis,
    tradeIntervalTimeFormat,
    customInterval,
    onChange,
    onCustomIntervalClick: () => setCustomInterval(true),
    tradeIntervalUi: getIntervalForUi(tradeIntervalMillis),
  };
};

// all data related to trade size input
const useTradeSize = () => {
  const { srcToken, srcTokenAmount, srcTokenUsdValue18 } = useSrcToken();
  const { tradeSize, setTradeSize } = useTradeSizeStore();

  const totalTrades = useMemo(() => {
    if (!tradeSize || tradeSize.isZero()) {
      return 0;
    }
    return srcTokenAmount?.div(tradeSize).integerValue(BigNumber.ROUND_CEIL).toNumber() || 0;
  }, [srcTokenAmount, tradeSize]);

  const { getBnAmount } = useUiAmountToBigNumber(srcToken);

  const onChange = async (amountUi?: string) => {
    const tradeSize = await getBnAmount(amountUi);
    if (!tradeSize) {
      setTradeSize(undefined);
    } else {
      setTradeSize(tradeSize);
    }
  };

  return {
    totalTrades,
    tradeSize,
    uiTradeSize: useBigNumberToUiAmount(srcToken, tradeSize).data,
    onChange,
    uiUsdValue: useBigNumberToUiAmount(srcToken, !srcTokenUsdValue18 ? undefined : tradeSize?.times(srcTokenUsdValue18).div(1e18)).data,
  };
};

const useTokenOrWrappedToken = (tokenInfo?: TokenInfo) => {
  const { config } = useWeb3();
  const { data: token } = useQuery<Token>(
    ["useTokenOrWrappedToken", tokenInfo?.address],
    () => {
      if (isNativeToken(tokenInfo?.address)) {
        tokenInfo = config?.wrappedTokenInfo;
      }
      return getToken(tokenInfo);
    },
    { enabled: !!tokenInfo }
  );
  return { token, isLoading: !token };
};

const useChangeTokenPositions = () => {
  const { srcTokenInfo, setSrcTokenAmount, setSrcToken } = useSrcTokenStore();
  const { setDstToken, dstTokenInfo, dstTokenAmount } = useDstToken();

  return () => {
    setSrcTokenAmount(dstTokenAmount);
    setSrcToken(dstTokenInfo, true);
    setDstToken(srcTokenInfo);
  };
};

export const useLimitPrice = () => {
  const { isLimitOrder, limitPrice, toggleLimit, setLimitPrice } = useLimitPriceStore();
  const { srcTokenInfo } = useSrcToken();
  const { dstTokenInfo } = useDstToken();
  const [inverted, setInverted] = useState(false);
  const { marketPrice } = useMarketPrice();
  const [limitPriceUI, setlimitPriceUI] = useState<BigNumber | undefined>(limitPrice);
  const [invertedUI, setInvertedUI] = useState(false);

  const leftTokenInfo = inverted ? dstTokenInfo : srcTokenInfo;
  const rightTokenInfo = !inverted ? dstTokenInfo : srcTokenInfo;

  const onChange = (amountUi?: string) => {
    setLimitPrice(amountUi ? BigNumber(amountUi) : undefined);
    setlimitPriceUI(amountUi ? BigNumber(amountUi) : undefined);
    setInvertedUI(false);
  };

  const onToggleLimit = () => {
    toggleLimit(marketPrice);
    setlimitPriceUI(marketPrice);
    setInvertedUI(false);
    setInverted(false);
  };

  const toggleInverted = () => {
    setInverted(!inverted);
    if (!invertedUI) {
      setlimitPriceUI(BigNumber(1).div(limitPrice || 1));
    } else {
      setlimitPriceUI(limitPrice);
    }
    setInvertedUI(!invertedUI);
  };

  return {
    isLimitOrder,
    onToggleLimit,
    toggleInverted,
    onChange,
    leftTokenInfo,
    rightTokenInfo,
    limitPriceUI: limitPriceUI?.toFormat(),
    limitPrice,
  };
};

const useMarketPrice = () => {
  const [inverted, setInverted] = useState(false);
  const { srcToken, srcTokenInfo, srcTokenUsdValue18 } = useSrcToken();
  const { dstToken, dstTokenInfo, dstTokenUsdValue18 } = useDstToken();

  const leftToken = inverted ? dstToken : srcToken;
  const rightToken = !inverted ? dstToken : srcToken;

  const leftTokenInfo = inverted ? dstTokenInfo : srcTokenInfo;
  const rightTokenInfo = !inverted ? dstTokenInfo : srcTokenInfo;

  const leftUsdValue = inverted ? dstTokenUsdValue18 : srcTokenUsdValue18;
  const rightUsdValue = !inverted ? dstTokenUsdValue18 : srcTokenUsdValue18;

  const marketPrice = leftUsdValue && rightUsdValue && leftUsdValue.div(rightUsdValue);

  return {
    marketPrice: leftToken && rightToken ? marketPrice : undefined,
    toggleInverted: () => setInverted((prevState) => !prevState),
    leftToken,
    rightToken,
    inverted,
    leftTokenInfo,
    rightTokenInfo,
  };
};

export const useSubmitButtonValidation = () => {
  const { srcTokenAmount, balance: srcTokenBalance, srcToken, srcTokenUiAmount, srcTokenUsdValue18, srcTokenInfo } = useSrcToken();
  const { maxDurationMillis } = useMaxDuration();
  const tradeIntervalMillis = useTradeInterval().tradeIntervalMillis;
  const { tradeSize } = useTradeSize();

  return useMemo(() => {
    if (!srcToken) {
      return "Select token";
    }
    if (!srcTokenAmount || srcTokenAmount?.isZero()) {
      return "Enter amount";
    }
    if (srcTokenBalance && srcTokenAmount.gt(srcTokenBalance)) {
      return "Insufficient funds";
    }

    if (!tradeSize || tradeSize?.isZero()) {
      return "Enter trade size";
    }

    if (maxDurationMillis === 0) {
      return "Enter duration";
    }

    if (tradeIntervalMillis === 0) {
      return "Enter trade interval";
    }

    if (tradeSize?.gt(srcTokenAmount || zero)) {
      return `Maximum trade size is ${srcTokenUiAmount}`;
    }

    if (tradeIntervalMillis === 0) {
      return "Enter trade interval";
    }

    if (
      (srcTokenAmount && tradeSize && srcTokenUsdValue18 && srcTokenInfo && getSmallestTradeSize(srcTokenAmount, tradeSize))
        ?.times(srcTokenUsdValue18)
        .lt(BigNumber(10).pow(srcTokenInfo.decimals))
    ) {
      return `Trazde size must be equal to at least 1 USD`;
    }
  }, [srcTokenAmount, srcTokenUsdValue18, tradeSize, srcTokenAmount, tradeIntervalMillis, maxDurationMillis, srcToken, srcTokenInfo]);
};

const getSmallestTradeSize = (srcTokenAmount: BigNumber, tradeSize: BigNumber) => {
  return srcTokenAmount.modulo(tradeSize).eq(0) ? tradeSize : srcTokenAmount.modulo(tradeSize);
};

const usePartialFillValidation = () => {
  const { tradeIntervalMillis } = useTradeInterval();
  const { totalTrades } = useTradeSize();
  const { maxDurationMillis } = useMaxDuration();

  return useMemo(() => {
    if (!totalTrades || totalTrades === 0 || !tradeIntervalMillis || !maxDurationMillis) {
      return;
    }

    const showWarning = BigNumber(tradeIntervalMillis).times(totalTrades).gt(BigNumber(maxDurationMillis));

    if (showWarning) {
      return "Partial fill warning";
    }
  }, []);
};

const resetState = () => {
  useTradeSizeStore.getState().reset();
  useSrcTokenStore.getState().reset();
  useDstTokenStore.getState().reset();
  useMaxDurationStore.getState().reset();
  useTradeIntervalStore.getState().reset();
  useLimitPriceStore.getState().reset();
  useGlobalState.getState().reset();
};

function useSubmitOrder() {
  const warning = useSubmitButtonValidation();
  const { isApproved, approve, approveLoading } = useTokenApproval();
  const { isInvalidChain, changeNetwork, config, account } = useWeb3();
  const { wrap, shouldWrap, isLoading: wrapLoading } = useWrapToken();
  const { connect } = useContext(TwapContext);
  const { showConfirmation, setShowConfirmation, disclaimerAccepted } = useGlobalState();

  const { srcTokenInfo, dstTokenInfo, srcTokenAmount, tradeSize, minAmountOut, deadline, tradeIntervalMillis } = useConfirmation();

  const { mutate: createOrder, isLoading: createdOrderLoading } = useMutation(
    async () => {
      const twap = contract(twapAbi as Abi, config.twapAddress);

      return twap.methods
        .ask(
          config.exchangeAddress,
          srcTokenInfo?.address,
          dstTokenInfo?.address,
          srcTokenAmount,
          tradeSize,
          minAmountOut,
          Math.round(deadline / 1000),
          Math.round(tradeIntervalMillis / 1000)
        )
        .send({ from: account });
    },
    {
      onSuccess: () => {
        resetState();
      },
    }
  );

  const values = useMemo(() => {
    if (!account) {
      return { text: "Connect wallet", onClick: connect };
    }
    if (isInvalidChain) {
      return { text: "Switch network", onClick: changeNetwork };
    }
    if (warning) {
      return { text: warning, onClick: () => {}, disabled: true };
    }
    if (shouldWrap) {
      return { text: "Wrap", onClick: wrap, loading: wrapLoading };
    }
    if (!isApproved) {
      return { text: "Approve", onClick: approve, loading: approveLoading };
    }
    if (!showConfirmation) {
      return { text: "Place order", onClick: () => setShowConfirmation(true) };
    }

    return { text: "Confirm order", onClick: createOrder, loading: createdOrderLoading, disabled: !disclaimerAccepted };
  }, [disclaimerAccepted, isApproved, shouldWrap, warning, isInvalidChain, account, approveLoading, setShowConfirmation, showConfirmation, createdOrderLoading, createOrder]);

  return { ...values, showConfirmation };
}

export const useTokenPanel = (isSrcToken?: boolean) => {
  const srcToken = useSrcToken();
  const dstToken = useDstToken();
  const { isLimitOrder } = useLimitPriceStore();
  const [tokenListOpen, setTokenListOpen] = useState(false);

  const onSelect = useCallback(
    (token: TokenInfo) => {
      if (isSrcToken) {
        srcToken.onSrcTokenSelect(token);
      } else {
        dstToken.onDstTokenSelect(token);
      }
      setTokenListOpen(false);
    },
    [isSrcToken, setTokenListOpen]
  );

  return {
    selectedToken: isSrcToken ? srcToken.srcTokenInfo : dstToken.dstTokenInfo,
    value: isSrcToken ? srcToken.srcTokenUiAmount : dstToken.dstTokenUiAmount,
    onChange: isSrcToken ? srcToken.onChange : null,
    balance: isSrcToken ? srcToken.uiBalance : dstToken.uiBalance,
    balanceLoading: isSrcToken ? srcToken.balanceLoading : dstToken.balanceLoading,
    disabled: isSrcToken ? false : true,
    usdValue: isSrcToken ? srcToken.srcTokenUsdValueUI : dstToken.dstTokenUsdValueUI,
    usdValueLoading: isSrcToken ? srcToken.usdValueLoading : dstToken.usdValueLoading,
    onSelect,
    tokenListOpen,
    toggleTokenList: (value: boolean) => setTokenListOpen(value),
    amountPrefix: isSrcToken ? "" : isLimitOrder ? "≥" : "~",
  };
};

const useConfirmation = () => {
  const { deadlineUi, deadline } = useMaxDuration();
  const { tradeIntervalUi, tradeIntervalMillis } = useTradeInterval();
  const { totalTrades, uiTradeSize, tradeSize } = useTradeSize();
  const { srcTokenUsdValueUI, srcTokenUiAmount, srcTokenInfo, srcTokenAmount } = useSrcToken();
  const { dstTokenUsdValueUI, dstTokenUiAmount, dstTokenInfo, dstToken } = useDstToken();
  const { limitPrice, isLimitOrder } = useLimitPrice();
  const { showConfirmation, setShowConfirmation, disclaimerAccepted, setDisclaimerAccepted } = useGlobalState();

  const minAmountOut = useMemo(() => {
    if (!isLimitOrder) {
      return BigNumber(1);
    }
    return convertDecimals(tradeSize?.times(limitPrice || 0) || 0, srcTokenInfo?.decimals || 0, dstTokenInfo?.decimals || 0);
  }, [isLimitOrder, limitPrice, tradeSize, srcTokenInfo, dstTokenInfo]);

  const result = {
    deadlineUi,
    tradeIntervalUi,
    totalTrades,
    uiTradeSize,
    srcTokenUsdValue: srcTokenUsdValueUI,
    srcTokenUiAmount,
    srcTokenInfo,
    dstTokenUsdValue: dstTokenUsdValueUI,
    dstTokenUiAmount,
    dstTokenInfo,
    minAmountOut,
    minAmountOutUi: useBigNumberToUiAmount(dstToken, minAmountOut).data,
    isLimitOrder,
    srcTokenAmount,
    tradeSize,
    deadline,
    tradeIntervalMillis,
    showConfirmation,
    closeConfirmation: () => setShowConfirmation(false),
    disclaimerAccepted,
    setDisclaimerAccepted,
  };

  const isValid = _.every(_.values(result));

  return result;
};

const useLimitPriceToggleValidation = () => {
  const { srcTokenInfo } = useSrcTokenStore();
  const { dstTokenInfo } = useDstTokenStore();

  return useMemo(() => {
    if (!srcTokenInfo) {
      return "Select source token";
    }
    if (!dstTokenInfo) {
      return "Select destination token";
    }
  }, [srcTokenInfo, dstTokenInfo]);
};

// all hooks with state, export state only from here
export const store = {
  useSrcToken,
  useDstToken,
  useMaxDuration,
  useTradeInterval,
  useLimitPrice,
  useTradeSize,
  useChangeTokenPositions,
  useMarketPrice,
  reset: resetState,
  useTokenApproval,
  useAccountBalances,
  useWeb3,
  useWrapToken,
  useSubmitOrder,
  useTokenPanel,
  useConfirmation,
};

// all validation hooks
export const validation = {
  useSubmitButtonValidation,
  usePartialFillValidation,
  useLimitPriceToggleValidation,
};

const getDerivedTradeInterval = (maxDurationMillis: number, totalTrades: number) => {
  if (maxDurationMillis > 0 && totalTrades > 0) {
    const derivedMillis = Math.max(maxDurationMillis / totalTrades, 60_000);

    return {
      derivedMillis,
      derivedTimeFormat: TimeFormat.valueOf(derivedMillis),
    };
  } else {
    return {
      derivedMillis: 0,
      derivedTimeFormat: TimeFormat.Minutes,
    };
  }
};

const useBigNumberToUiAmount = (token?: Token, amount?: BigNumber) => {
  const [data, setData] = useState<string | undefined>(undefined);

  const getUiAmount = useCallback(
    async (amount?: BigNumber) => {
      if (!amount || !token) {
        return "";
      }

      return (await token.mantissa(amount || zero)).toFormat();
    },
    [token]
  );

  useEffect(() => {
    (async () => {
      if (!token) {
        return setData(undefined);
      }
      const result = await getUiAmount(amount);
      setData(result);
    })();
  }, [token, amount, getUiAmount]);

  return { data: data || " ", getUiAmount };
};

const useUiAmountToBigNumber = (token?: Token, amountUi?: string) => {
  const [data, setData] = useState<BigNumber | undefined>(undefined);

  const getBnAmount = useCallback(
    async (amountUi?: string) => {
      if (amountUi === "" || !token) {
        return undefined;
      }
      return token?.amount(parsebn(amountUi || "0"));
    },
    [token]
  );

  useEffect(() => {
    (async () => {
      if (!token) {
        return setData(undefined);
      }
      const result = await getBnAmount(amountUi);
      setData(result);
    })();
  }, [token, amountUi, getBnAmount]);

  return { data, getBnAmount };
};

const isNativeToken = (address?: string) => {
  if (!address) {
    return false;
  }

  return !!nativeAddresses.find((it) => eqIgnoreCase(address, it));
};

const getIntervalForUi = (value?: number) => {
  if (!value) {
    return "0";
  }
  const time = moment.duration(value);
  const days = time.days();
  const hours = time.hours();
  const minutes = time.minutes();
  const seconds = time.seconds();

  let arr: string[] = [];

  if (days) {
    arr.push(`${days} Days `);
  }
  if (hours) {
    arr.push(`${hours} Hours `);
  }
  if (minutes) {
    arr.push(`${minutes} Minutes`);
  }
  if (seconds) {
    arr.push(`${seconds} Seconds`);
  }
  return arr.join(" ");
};

export const makeEllipsisAddress = (address?: string, padding: number = 6): string => {
  if (!address) return "";
  const firstPart = address.substring(0, padding);
  const secondPart = address.substring(address.length - padding);
  return `${firstPart}...${secondPart}`;
};

const getToken = (tokenInfo?: TokenInfo) => {
  return erc20(tokenInfo!.symbol, tokenInfo!.address, tokenInfo!.decimals);
};

export const useOrders = () => {
  const { account, config, web3 } = useWeb3();

  return useQuery(
    ["useOrders"],
    async () => {
      const lens = contract(lensAbi as Abi, config.lensContract);
      const orders = await lens.methods.makerOrders(account).call();

      const latestBlock = await web3?.eth.getBlockNumber();
      function parseStatus(status: number, latestBlock: number) {
        if (status === 1) return OrderStatus.Canceled;
        if (status === 2) return OrderStatus.Filled;
        if (status < latestBlock) return OrderStatus.Expired;
        return OrderStatus.Open;
      }
      const arr = _.map(orders, (o) => {
        return {
          srcToken: o.ask.srcToken,
          dstToken: o.ask.dstToken,
          srcTokenAmount: BigNumber(o.ask.srcAmount), // left top (10 wbtc figma )
          tradeSize: BigNumber(o.ask.srcBidAmount),
          dstMinAmount: BigNumber(o.ask.dstMinAmount),
          deadline: parseInt(o.ask.deadline),
          delay: parseInt(o.ask.delay),
          id: o.id,
          status: parseStatus(parseInt(o.status), latestBlock!),
          srcFilledAmount: BigNumber(o.srcFilledAmount),
          time: parseInt(o.ask.time),
          // price:
        };
      });

      return _.groupBy(arr, "status");
    },
    {
      enabled: !!account && !!config && !!web3,
      refetchInterval: 30_000,
    }
  );
};
