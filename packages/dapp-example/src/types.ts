import { Token } from "@orbs-network/twap-ui";

export interface TokenListItem {
  token: Token;
  rawToken: any;
}

export enum SelectorOption {
  "TWAP" = "TWAP",
  LIMIT = "LIMIT",
}
