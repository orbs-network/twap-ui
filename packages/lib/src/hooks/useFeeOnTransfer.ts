import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useNetwork } from ".";
import { feeOnTransferDetectorAddresses, AMOUNT_TO_BORROW } from "../consts";
import { useWidgetContext } from "../widget/widget-context";
import { useGetContract } from "./useGetContract";
import FEE_ON_TRANSFER_ABI from "../abi/FEE_ON_TRANSFER.json";
import BN from "bignumber.js";

export const useFeeOnTransfer = (tokenAddress?: string) => {
  const { config } = useWidgetContext();

  const address = useMemo(() => {
    if (!config.chainId) return undefined;
    return feeOnTransferDetectorAddresses[config.chainId as keyof typeof feeOnTransferDetectorAddresses];
  }, [config.chainId]);

  const network = useNetwork();

  const getContract = useGetContract();

  return useQuery({
    queryFn: async () => {
      try {
        if (!address) return null;
        const contract = getContract(FEE_ON_TRANSFER_ABI as any, address!);

        if (!contract) {
          return null;
        }
        const res = await contract?.methods.validate(tokenAddress, network?.wToken.address, AMOUNT_TO_BORROW).call();
        return {
          buyFee: res.buyFeeBps,
          sellFee: res.sellFeeBps,
          hasFeeOnTranfer: BN(res.buyFeeBps).gt(0) || BN(res.sellFeeBps).gt(0),
        };
      } catch (error) {
        return null;
      }
    },
    queryKey: ["useFeeOnTransfer", tokenAddress, config.chainId, address],
    enabled: !!tokenAddress && !!config && !!network,
    staleTime: Infinity,
  });
};
