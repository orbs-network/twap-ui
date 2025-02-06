import { switchMetaMaskNetwork } from "@defi.org/web3-candies";
import { useState } from "react";
import { useWidgetContext } from "..";

export const useSwitchChain = () => {
  const { config } = useWidgetContext();
  const [loading, setLoading] = useState(false);

  const changeNetwork = async (onSuccess: () => void, onError: () => void) => {
    try {
      await switchMetaMaskNetwork(config.chainId);
      onSuccess();
    } catch (error) {
      onError();
    }
  };

  const onChangeNetwork = async () => {
    const onSuccess = () => {
      setLoading(false);
    };
    const onError = () => {
      setLoading(false);
    };
    setLoading(true);
    changeNetwork(onSuccess, onError);
  };
  return {
    changeNetwork: onChangeNetwork,
    loading,
  };
};
