import { Token } from "@orbs-network/twap-ui";
import { create } from "zustand";

type DappStore = {
  srcToken: Token | undefined;
  dstToken: Token | undefined;
  setSrcToken: (token: Token) => void;
  setDstToken: (token: Token) => void;
  resetTokens: () => void;
  switchTokens: () => void;
};

export const useDappStore = create<DappStore>((set) => ({
  srcToken: undefined,
  dstToken: undefined,
  setSrcToken: (token: Token) => set({ srcToken: token }),
  setDstToken: (token: Token) => set({ dstToken: token }),
  resetTokens: () => set({ srcToken: undefined, dstToken: undefined }),
  switchTokens: () => set((state) => ({ srcToken: state.dstToken, dstToken: state.srcToken })),
}));
