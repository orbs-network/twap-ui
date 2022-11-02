import Web3 from "web3";
import axios from "axios";
import _ from "lodash";
export const changeNetwork = async (web3?: Web3, chain?: number) => {
  if (!web3 || !chain) {
    return;
  }

  const provider = web3 ? web3.givenProvider : undefined;
  if (!provider) {
    return;
  }

  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: Web3.utils.toHex(chain) }],
    });
  } catch (error: any) {
    // if unknown chain, add chain
    if (error.code === 4902) {
      const list = (await axios.get("https://chainid.network/chains.json")).data;
      const chainArgs = list.find((it: any) => it.chainId === chain);
      if (!chainArgs) {
        return;
      }

      await provider.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainName: chainArgs.name,
            nativeCurrency: chainArgs.nativeCurrency,
            rpcUrls: chainArgs.rpc,
            chainId: Web3.utils.toHex(chain),
            blockExplorerUrls: [_.get(chainArgs, ["explorers", 0, "url"])],
            iconUrls: [`https://defillama.com/chain-icons/rsz_${chainArgs.chain}.jpg`],
          },
        ],
      });
    }
  }
};
