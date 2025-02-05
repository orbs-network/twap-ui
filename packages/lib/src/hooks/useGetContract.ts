import { Abi } from "@defi.org/web3-candies";
import { useCallback } from "react";
import { useWidgetContext } from "../widget/widget-context";

export const useGetContract = () => {
  const web3 = useWidgetContext().web3;

  return useCallback(
    (abi: Abi, address: string) => {
      if (!web3) return undefined;
      return new web3.eth.Contract(abi as any, address);
    },
    [web3],
  );
};
