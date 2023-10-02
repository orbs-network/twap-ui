import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Token {
  address: string;
  decimals: number;
  symbol: string;
}

interface PersistedStore {
  tokens: {
    [key: number]: Token[];
  };
  addToken: (chainId: number, token: Token) => void;
  removeToken: (chainId: number, token: Token) => void;
}

export const usePersistedStore = create(
  persist<PersistedStore>(
    (set) => ({
      tokens: {},
      removeToken: (chainId, token) =>
        set((state) => ({
          tokens: {
            ...state.tokens,
            [chainId]: state.tokens[chainId].filter((t) => t.address !== token.address),
          },
        })),

      addToken: (chainId, token) =>
        set((state) => ({
          tokens: {
            ...state.tokens,
            [chainId]: [token, ...(state.tokens[chainId] || [])],
          },
        })),
    }),
    {
      name: `persisted-store`,
    }
  )
);
