import { StyledModalContent, StyledSushiLayout, StyledSushi } from "./styles";
import { TWAP, Orders } from "@orbs-network/twap-ui-sushiswap";
import { useConnectWallet, useGetTokens, useTheme } from "./hooks";
import { Configs } from "@orbs-network/twap";
import { useWeb3React } from "@web3-react/core";
import { Dapp, TokensList, UISelector } from "./Components";
import { Popup } from "./Components";
import { useMemo, useState } from "react";
import _ from "lodash";
import { erc20s, zeroAddress } from "@defi.org/web3-candies";
import { SelectorOption, TokenListItem } from "./types";
const config = { ...Configs.QuickSwap };
config.name = "SushiSwap";

const nativeTokenLogo = "https://s2.coinmarketcap.com/static/img/coins/64x64/3890.png";

const parseListToken = (tokenList?: any[]) => {
  return tokenList
    ?.filter((t: any) => t.chainId === config.chainId)
    .map(({ symbol, address, decimals, logoURI, name }: any) => ({
      decimals,
      symbol,
      name,
      address,
      logoURI: (logoURI as string)?.replace("/logo_24.png", "/logo_48.png"),
    }));
};
export const useDappTokens = () => {
  return useGetTokens({
    chainId: config.chainId,
    parse: parseListToken,
    modifyList: (tokens: any) => ({ ..._.mapKeys(tokens, (t) => t.address) }),
    url: "https://raw.githubusercontent.com/viaprotocol/tokenlists/main/tokenlists/polygon.json",
    baseAssets: erc20s.poly,
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
        address: rawToken.address,
        decimals: rawToken.decimals,
        symbol: rawToken.symbol,
        logoUrl: rawToken.logoURI || nativeTokenLogo,
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

const TWAPComponent = () => {
  const { account, library } = useWeb3React();
  const connect = useConnectWallet();
  const { data: dappTokens } = useDappTokens();
  const { isDarkTheme } = useTheme();

  return (
    <TWAP
      connect={connect}
      account={account}
      srcToken={zeroAddress}
      dstToken="0x614389EaAE0A6821DC49062D56BDA3d9d45Fa2ff" //ORBS
      dappTokens={dappTokens}
      TokenSelectModal={TokenSelectModal}
      provider={library}
      isDarkTheme={isDarkTheme}
    />
  );
};

const DappComponent = () => {
  const [selected, setSelected] = useState(SelectorOption.TWAP);
  const { isDarkTheme } = useTheme();

  return (
    <StyledSushi isDarkMode={isDarkTheme ? 1 : 0}>
      <StyledSushiLayout name={config.name}>
        <UISelector selected={selected} select={setSelected} limit={true} />

        <TWAPComponent />
        <Orders />
      </StyledSushiLayout>
    </StyledSushi>
  );
};

const dapp: Dapp = {
  Component: DappComponent,
  logo: "https://cdn.cdnlogo.com/logos/s/10/sushiswap.svg",
  config,
  workInProgress: true,
};

export default dapp;
