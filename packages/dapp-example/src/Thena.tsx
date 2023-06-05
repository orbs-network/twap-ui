import { StyledModalContent, StyledThenaLayout, StyledThenaGradient, StyledThenaBox, StyledThena } from "./styles";
import { Orders, TWAP, Limit, ThenaTWAPProps, ThenaOrdersProps } from "@orbs-network/twap-ui-thena";
import { useConnectWallet, useNetwork, useTheme } from "./hooks";
import { Configs } from "@orbs-network/twap";
import { useWeb3React } from "@web3-react/core";
import { Dapp, TokensList, UISelector } from "./Components";
import { Popup } from "./Components";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import _ from "lodash";
import { erc20s, zeroAddress, isNativeAddress } from "@defi.org/web3-candies";
import { TokenListItem } from "./types";

const config = Configs.Thena;

const nativeTokenLogo = "https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png";
export const useDappTokens = () => {
  const { account } = useWeb3React();

  // const { isInValidNetwork } = useNetwork(config.chainId);
  const isInValidNetwork = false;
  return useQuery(
    ["useDappTokens", config.chainId],
    async () => {
      const response = await fetch(`https://api.thena.fi/api/v1/assets`);

      const tokenList = (await response.json()).data;
      const tokens = [config.nativeToken, ...tokenList];

      const parsed = tokens.map(({ symbol, address, decimals, logoURI, name }: any) => ({
        decimals,
        symbol,
        name,
        address,
        logoURI: isNativeAddress(address) ? nativeTokenLogo : logoURI,
      }));
      const candiesAddresses = [zeroAddress, ..._.map(erc20s.bsc, (t) => t().address)];

      const _tokens = _.sortBy(parsed, (t: any) => {
        const index = candiesAddresses.indexOf(t.address);
        return index >= 0 ? index : Number.MAX_SAFE_INTEGER;
      });

      return { ..._.mapKeys(_tokens, (t) => t.address) } as any;
    },
    { enabled: !!account && !isInValidNetwork }
  );
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
const logo =
  "https://www.gitbook.com/cdn-cgi/image/width=40,dpr=2,height=40,fit=contain,format=auto/https%3A%2F%2F2770290301-files.gitbook.io%2F~%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252Fp4Ew3qUZPqMSVg5hJI12%252Ficon%252FIfdx379foqQ3kMzwzmSx%252FTHE.png%3Falt%3Dmedia%26token%3D67208295-11aa-4faa-9c85-117b381682f3";
const DappComponent = () => {
  const { account, library } = useWeb3React();
  const connect = useConnectWallet();
  const { data: dappTokens } = useDappTokens();
  const { isDarkTheme } = useTheme();

  const twapProps: ThenaTWAPProps = {
    connect,
    account,
    srcToken: "BNB",
    dstToken: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
    dappTokens,
    TokenSelectModal,
    provider: library,
    isDarkTheme,
  };
  const ordersProps: ThenaOrdersProps = { account, dappTokens, provider: library, isDarkTheme };

  return (
    <StyledThena isDarkMode={isDarkTheme ? 1 : 0}>
      <StyledThenaLayout name={config.partner}>
        <UISelector
          options={[
            {
              title: "TWAP",
              component: (
                <StyledThenaGradient>
                  <StyledThenaBox isDarkMode={isDarkTheme ? 1 : 0}>
                    <TWAP {...twapProps} />
                  </StyledThenaBox>
                </StyledThenaGradient>
              ),
            },
            {
              title: "LIMIT",
              component: (
                <StyledThenaGradient>
                  <StyledThenaBox isDarkMode={isDarkTheme ? 1 : 0}>
                    <Limit {...twapProps} />
                  </StyledThenaBox>
                </StyledThenaGradient>
              ),
            },
          ]}
        />
        <StyledThenaGradient>
          <StyledThenaBox isDarkMode={isDarkTheme ? 1 : 0}>
            <Orders {...ordersProps} />
          </StyledThenaBox>
        </StyledThenaGradient>
      </StyledThenaLayout>
    </StyledThena>
  );
};

const dapp: Dapp = {
  Component: DappComponent,
  logo,
  config,
};

export default dapp;
