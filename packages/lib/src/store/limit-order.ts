import { eqIgnoreCase } from "@defi.org/web3-candies";
import _ from "lodash";
import { useContext, useMemo } from "react";
import { OrdersContext } from "../context";
import { TokenInfo } from "../types";

export const useTokenFromTokensList = (address?: string) => {
  const { tokensList } = useContext(OrdersContext);
  if (!address) {
    return {} as TokenInfo;
  }
  return tokensList.find((it) => eqIgnoreCase(it.address, address)) || ({} as TokenInfo);
};
