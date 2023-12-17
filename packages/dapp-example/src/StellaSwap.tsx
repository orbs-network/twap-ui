import { StyledModalContent, StyledStella, StyledStellaSwapBox, StyledStellaSwapLayout } from "./styles";
import { TWAP, Orders } from "@orbs-network/twap-ui-stellaswap";
import { useConnectWallet, useGetTokens, useTheme } from "./hooks";
import { Configs } from "@orbs-network/twap";
import { useWeb3React } from "@web3-react/core";
import { Dapp, TokensList, UISelector } from "./Components";
import { Popup } from "./Components";
import { useMemo, useState } from "react";
import _ from "lodash";
import { erc20s, zeroAddress, erc20sData } from "@defi.org/web3-candies";
import { SelectorOption, TokenListItem } from "./types";
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
    chainId: config.chainId,
    parse: parseListToken,
    baseAssets: erc20s.poly,
    url: "https://raw.githubusercontent.com/viaprotocol/tokenlists/main/tokenlists/moonbeam.json",
    modifyList: (tokens) => ({ ..._.mapKeys(tokens, (t) => t.address) }),
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
  return _.map(rawList, (rawToken) => {
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
  const tokensListSize = _.size(baseAssets);
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

  return (
    <TWAP
      connect={connect}
      account={account}
      srcToken={zeroAddress}
      dstToken={erc20sData.poly.USDC.address} //USDC
      dappTokens={dappTokens}
      TokenSelectModal={TokenSelectModal}
      provider={library}
      isDarkTheme={isDarkTheme}
      limit={limit}
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
        <StyledStellaSwapBox isDarkMode={isDarkTheme ? 1 : 0}>
          <Orders />
        </StyledStellaSwapBox>
      </StyledStellaSwapLayout>
    </StyledStella>
  );
};

const dapp: Dapp = {
  Component: DappComponent,
  logo: "https://s2.coinmarketcap.com/static/img/coins/64x64/17358.png",
  config,
  workInProgress: true,
};

export default dapp;
