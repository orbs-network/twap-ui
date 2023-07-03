import { TokenData } from "@orbs-network/twap";

export interface TokenListItem {
  token: TokenData;
  rawToken: any;
}

export enum SelectorOption {
  "TWAP" = "TWAP",
  LIMIT = "LIMIT",
}
