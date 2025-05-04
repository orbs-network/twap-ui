import { useCallback, useEffect, useMemo, useReducer } from "react";
import { DEFAULT_LIMIT_PANEL_DURATION } from "../consts";
import { State, Token, Translations, TwapProps } from "../types";
import { WalletClient, createPublicClient, custom, createWalletClient, http } from "viem";
import * as chains from "viem/chains";
import { constructSDK } from "@orbs-network/twap-sdk";
import defaultTranslations from "../i18n/en.json";

export const useTwapListeners = ({
  isLimitPanel,
  updateState,
  isTwapMarketByDefault,
  srcToken,
  dstToken,
  onSrcAmountChange,
  state,
}: {
  isLimitPanel?: boolean;
  isTwapMarketByDefault?: boolean;
  srcToken?: Token;
  dstToken?: Token;
  onSrcAmountChange?: (amount: string) => void;
  state: State;
  updateState: (state: Partial<State>) => void;
}) => {
  useEffect(() => {
    updateState({ typedPrice: undefined, selectedPricePercent: undefined });
  }, [srcToken?.address, dstToken?.address]);

  useEffect(() => {
    if (onSrcAmountChange) {
      onSrcAmountChange(state.typedSrcAmount || "");
    }
  }, [onSrcAmountChange, state.typedSrcAmount]);

  useEffect(() => {
    if (isLimitPanel) {
      updateState({ typedDuration: DEFAULT_LIMIT_PANEL_DURATION, isMarketOrder: false });
    } else {
      updateState({ typedDuration: undefined, isMarketOrder: isTwapMarketByDefault ? true : false });
    }
  }, [isLimitPanel, updateState, isTwapMarketByDefault]);

  useEffect(() => {
    setInterval(() => {
      updateState({ currentTime: Date.now() });
    }, 60_000);
  }, [updateState]);
};

enum ActionType {
  UPDATED_STATE = "UPDATED_STATE",
  RESET = "RESET",
}
type Action = { type: ActionType.UPDATED_STATE; value: Partial<State> } | { type: ActionType.RESET };

const initialState = {
  disclaimerAccepted: true,
  currentTime: Date.now(),
} as State;

const contextReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case ActionType.UPDATED_STATE:
      return { ...state, ...action.value };
    case ActionType.RESET:
      return {
        ...initialState,
        currentTime: Date.now(),
        trade: state.trade,
        swapStatus: state.swapStatus,
        isMarketOrder: state.isMarketOrder,
      };
    default:
      return state;
  }
};

const useInitiateWallet = (props: TwapProps): { walletClient: WalletClient | undefined; publicClient: ReturnType<typeof createPublicClient> } => {
  const chain = useMemo(() => Object.values(chains).find((it: any) => it.id === props.chainId), [props.chainId]);
  const transport = useMemo(() => (props.provider ? custom(props.provider) : undefined), [props.provider]);
  const walletClient = useMemo(() => {
    return transport ? createWalletClient({ chain, transport }) : undefined;
  }, [transport]);

  const publicClient = useMemo(() => {
    if (!chain) return;
    return createPublicClient({ chain, transport: transport || http() });
  }, [transport, chain]);

  return {
    walletClient,
    publicClient: publicClient as ReturnType<typeof createPublicClient>,
  };
};

const getInitialState = ({ orderDisclaimerAcceptedByDefault = true }: TwapProps) => {
  return {
    ...initialState,
    disclaimerAccepted: orderDisclaimerAcceptedByDefault,
  };
};

export const useTwapStore = (props: TwapProps) => {
  const [state, dispatch] = useReducer(contextReducer, getInitialState(props));
  const updateState = useCallback((value: Partial<State>) => dispatch({ type: ActionType.UPDATED_STATE, value }), [dispatch]);

  const resetState = useCallback(() => dispatch({ type: ActionType.RESET }), [dispatch]);
  return {
    state,
    updateState,
    resetState,
  };
};

const useTranslations = (translations?: Partial<Translations>): Translations => {
  return useMemo(() => {
    if (!translations) return defaultTranslations;
    return {
      ...defaultTranslations,
      ...translations,
    } as Translations;
  }, [translations]);
};

export const useInitTwap = (props: TwapProps) => {
  const { state, updateState, resetState } = useTwapStore(props);
  const translations = useTranslations(props.translations);
  const twapSDK = useMemo(() => constructSDK({ config: props.config }), [props.config]);
  const { walletClient, publicClient } = useInitiateWallet(props);

  return {
    state,
    updateState,
    resetState,
    translations,
    twapSDK,
    walletClient,
    publicClient,
    isWrongChain: !props.account || !props.chainId ? false : props.config.chainId !== props.chainId,
  };
};
