import { StyledKinetix, StyledKinetixBox, StyledKinetixLayout, StyledLynex, StyledLynexBox, StyledLynexLayout, StyledModalContent } from "./styles";
import { TWAP } from "@orbs-network/twap-ui-kinetix";
import { useConnectWallet, useGetPriceUsdCallback, useGetTokens, useTheme } from "./hooks";
import { useWeb3React } from "@web3-react/core";
import { Dapp, TokensList, UISelector } from "./Components";
import { Popup } from "./Components";
import { SelectorOption, TokenListItem } from "./types";
import { useMemo, useState } from "react";
import { size, Configs } from "@orbs-network/twap-ui";

const backendApi = "https://lynex-backend-7e21c8e31085.herokuapp.com/api/v1";

const config = { ...Configs.Lynex };
config.name = "Kinetix";
const parseListToken = (tokenList: any) => {
  return tokenList.map(({ symbol, address, decimals, logoURI, name }: any) => ({
    decimals,
    symbol,
    name,
    address,
    logoURI,
  }));
};

export const useDappTokens = () => {
  return useGetTokens({
    parse: parseListToken,
    modifyFetchResponse: (response: any) => {
      return response.data;
    },
    baseAssets: [],
    url: `${backendApi}/assets`,
  });
};

interface TokenSelectModalProps {
  isOpen: boolean;
  selectedCurrency?: any;
  onCurrencySelect: (token: any) => void;
  onDismiss: () => void;
}

const parseList = (rawList?: any): TokenListItem[] => {
  return rawList.map((rawToken: any) => {
    return {
      token: {
        address: rawToken.address,
        decimals: rawToken.decimals,
        symbol: rawToken.symbol,
        logoUrl: rawToken.logoURI,
      },
      rawToken,
    };
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
  const priceUsd = useGetPriceUsdCallback();
  const { isDarkTheme } = useTheme();

  return (
    <TWAP
      provider={library?.givenProvider}
      connect={connect}
      account={account}
      // srcToken="ETH"
      // dstToken="USDC"
      dappTokens={dappTokens}
      onSrcTokenSelected={(token: any) => console.log(token)}
      onDstTokenSelected={(token: any) => console.log(token)}
      TokenSelectModal={TokenSelectModal}
      isDarkTheme={isDarkTheme}
      limit={limit}
    />
  );
};

const logo = "https://app.lynex.fi/images/header/logo.svg";

const DappComponent = () => {
  const [selected, setSelected] = useState(SelectorOption.TWAP);

  return (
    <StyledKinetix>
      <StyledKinetixLayout name={config.name}>
        <UISelector limit={true} select={setSelected} selected={selected} />
        <StyledKinetixBox>
          <TWAPComponent limit={selected === SelectorOption.LIMIT} />
        </StyledKinetixBox>

        <StyledKinetixBox></StyledKinetixBox>
      </StyledKinetixLayout>
    </StyledKinetix>
  );
};

const dapp: Dapp = {
  Component: DappComponent,
  logo,
  configs: [config],
  path: config.name.toLowerCase(),
  workInProgress: true,
};

export default dapp;
