import { StyledModalContent, StyledStella, StyledStellaSwapBox, StyledStellaSwapLayout } from "./styles";
import { TWAP } from "@orbs-network/twap-ui-stellaswap";
import { useConnectWallet, useGetPriceUsdCallback, useGetTokens, useTheme } from "./hooks";
import { useWeb3React } from "@web3-react/core";
import { Dapp, TokensList, UISelector } from "./Components";
import { Popup } from "./Components";
import { useMemo, useState } from "react";
import { erc20s } from "@defi.org/web3-candies";
import { SelectorOption, TokenListItem } from "./types";
import { mapKeys, size, Configs } from "@orbs-network/twap-ui";
const config = { ...Configs.QuickSwap };
config.name = "StellaSwap";

const parseListToken = (tokenList?: any[]) => {
  return tokenList?.map(({ symbol, address, decimals, logoURI, name, chainId }: any) => ({
    decimals,
    symbol,
    name,
    chainId,
    address,
    tokenInfo: { address, chainId, decimals, symbol, name, logoURI: (logoURI as string)?.replace("/logo_24.png", "/logo_48.png") },
    tags: [],
  }));
};

const nativeTokenLogo = "https://s2.coinmarketcap.com/static/img/coins/64x64/3890.png";
export const useDappTokens = () => {
  return useGetTokens({
    parse: parseListToken,
    baseAssets: erc20s.poly,
    url: "https://raw.githubusercontent.com/viaprotocol/tokenlists/main/tokenlists/moonbeam.json",
    modifyList: (tokens) => ({ ...mapKeys(tokens, (t: any) => t.address) }),
  });
};
interface TokenSelectModalProps {
  popup: boolean;
  setPopup: (value: boolean) => void;
  selectedAsset: any;
  setSelectedAsset: (value: any) => void;
  otherAsset: any;
  setOtherAsset: (value: any) => void;
  baseAssets: any[];
  onAssetSelect: () => void;
}

const parseList = (rawList?: any): TokenListItem[] => {
  return rawList.map((rawToken: any) => {
    return {
      token: {
        address: rawToken.address ?? rawToken.tokenInfo?.address,
        decimals: rawToken.decimals ?? rawToken.tokenInfo?.decimals,
        symbol: rawToken.symbol ?? rawToken.tokenInfo?.symbol,
        logoUrl: rawToken.tokenInfo?.logoURI || nativeTokenLogo,
      },
      rawToken,
    };
  });
};
const TokenSelectModal = ({ popup, setPopup, setSelectedAsset, baseAssets }: TokenSelectModalProps) => {
  const tokensListSize = size(baseAssets);
  const parsedList = useMemo(() => parseList(baseAssets), [tokensListSize]);

  return (
    <Popup isOpen={popup} onClose={() => setPopup(true)}>
      <StyledModalContent>
        <TokensList tokens={parsedList} onClick={setSelectedAsset} />
      </StyledModalContent>
    </Popup>
  );
};

const TWAPComponent = ({ limit }: { limit?: boolean }) => {
  const { account, library } = useWeb3React();
  const connect = useConnectWallet();
  const { data: dappTokens } = useDappTokens();
  const { isDarkTheme } = useTheme();
  const priceUsd = useGetPriceUsdCallback();

  return (
    <TWAP
      connect={connect}
      account={account}
      // srcToken={zeroAddress}
      // dstToken={erc20sData.poly.USDC.address} //USDC
      dappTokens={dappTokens}
      TokenSelectModal={TokenSelectModal}
      provider={library}
      isDarkTheme={isDarkTheme}
      limit={limit}
      onSrcTokenSelected={(token: any) => console.log(token)}
      onDstTokenSelected={(token: any) => console.log(token)}
    />
  );
};

const DappComponent = () => {
  const [selected, setSelected] = useState(SelectorOption.TWAP);
  const { isDarkTheme } = useTheme();

  return (
    <StyledStella isDarkMode={isDarkTheme ? 1 : 0}>
      <StyledStellaSwapLayout name={config.name}>
        <UISelector selected={selected} select={setSelected} limit={true} />
        <StyledStellaSwapBox isDarkMode={isDarkTheme ? 1 : 0}>
          <TWAPComponent limit={selected === SelectorOption.LIMIT} />
        </StyledStellaSwapBox>
        <StyledStellaSwapBox isDarkMode={isDarkTheme ? 1 : 0}></StyledStellaSwapBox>
      </StyledStellaSwapLayout>
    </StyledStella>
  );
};

const dapp: Dapp = {
  Component: DappComponent,
  logo: "https://s2.coinmarketcap.com/static/img/coins/64x64/17358.png",
  configs: [config],
  path: config.name.toLowerCase(),
  workInProgress: true,
};

export default dapp;
