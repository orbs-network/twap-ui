import { useState, useCallback, useEffect } from "react";
import Web3 from "web3";

export const useChainId = (provider?: any, connectedChainId?: number) => {
  const [chainId, setChainId] = useState<number | undefined>(undefined);
  const getChain = useCallback(async () => {
    if (!provider) {
      setChainId(undefined);
      return;
    }
    const chain = connectedChainId || (await new Web3(provider).eth.getChainId());
    setChainId(chain);
  }, [connectedChainId, provider, setChainId]);

  useEffect(() => {
    getChain();
  }, [getChain]);

  return chainId;
};
