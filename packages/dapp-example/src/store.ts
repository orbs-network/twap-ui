export interface Token {
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
