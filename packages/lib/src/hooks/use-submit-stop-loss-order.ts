import { useMutation } from "@tanstack/react-query";
import { useTwapContext } from "../context";
import { _TypedDataEncoder } from "@ethersproject/hash";
import { usePermitData } from "./use-permit-data";

export const useCreateOffchainOrder = () => {
  const { walletClient, account } = useTwapContext();
  const permitData = usePermitData();
  return useMutation({
    mutationFn: async () => {
      if (!permitData) {
        throw new Error("permit is not defined");
      }

      const typedDataMessage = _TypedDataEncoder.getPayload(permitData.domain, permitData.types, permitData.message);

      const signature = await walletClient?.signTypedData({
        account: account as `0x${string}`,
        types: typedDataMessage.types,
        primaryType: typedDataMessage.primaryType,
        message: typedDataMessage.message,
        domain: typedDataMessage.domain,
      });

      return signature;
    },
  });
};
