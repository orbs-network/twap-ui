import { Orders, PangolinOrdersProps, PangolinTWAPProps, Twap } from "@orbs-network/twap-ui-pangolin";
import { MetaTags, Popup } from "./defaults";
import { StyledLayoutPangolin, StyledModalList, StyledModalListItem } from "./styles";
import _ from "lodash";
import { erc20s } from "@defi.org/web3-candies";
import { useWeb3React } from "@web3-react/core";
import { useQuery } from "@tanstack/react-query";
import { Configs } from "@orbs-network/twap";

interface TokenSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCurrencySelect: (token: any) => void;
}

const nativeToken = {
  decimals: 18,
  name: "Avalanche",
  symbol: "AVAX",
  "_constructor-name_": "Currency",
};

const nativeTokenLogo = "https://raw.githubusercontent.com/pangolindex/sdk/master/src/images/chains/avax.png";

const chainId = 43114;

const useDappTokens = () => {
  const { account } = useWeb3React();

  return useQuery(
    ["useDappTokens", chainId],
    async () => {
      const response = await fetch(`https://raw.githubusercontent.com/pangolindex/tokenlists/main/pangolin.tokenlist.json`);
      const tokenList = await response.json();

      const parsed = tokenList.tokens.map(({ symbol, address, decimals, logoURI, name }: any) => ({
        decimals,
        symbol,
        name,
        chainId,
        address,
        tokenInfo: { symbol, address, decimals, logoURI, name, chainId },
        tags: [],
      }));
      const candiesAddresses = _.map(erc20s.avax, (t) => t().address);

      const _tokens = _.sortBy(parsed, (t: any) => {
        const index = candiesAddresses.indexOf(t.address);
        return index >= 0 ? index : Number.MAX_SAFE_INTEGER;
      });

      return { native: nativeToken, ..._.mapKeys(_tokens, (t) => t.address) };
    },
    {
      enabled: !!account,
    }
  );
};

const TokenSelectModal = ({ isOpen, onClose, onCurrencySelect }: TokenSelectModalProps) => {
  const { data: tokensList } = useDappTokens();

  if (!tokensList) return null;

  return (
    <Popup isOpen={isOpen} onClose={onClose}>
      <StyledModalList>
        {_.map(tokensList, (token: any) => {
          if (!token.tokenInfo) {
            return (
              <StyledModalListItem onClick={() => onCurrencySelect(token)} key={token.symbol}>
                <img src={nativeTokenLogo} width={20} height={20} alt="" />
                {token.symbol}
              </StyledModalListItem>
            );
          }
          return (
            <StyledModalListItem onClick={() => onCurrencySelect(token)} key={token.tokenInfo.address}>
              <img src={token.tokenInfo.logoURI || ""} width={20} height={20} alt="" />
              {token.tokenInfo.symbol}
            </StyledModalListItem>
          );
        })}
      </StyledModalList>
    </Popup>
  );
};

const Dapp = () => {
  const { library, account } = useWeb3React();
  const { data: dappTokens } = useDappTokens();

  const twapProps: PangolinTWAPProps = {
    account,
    TokenSelectModal,
    srcToken: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
    dstToken: "0x340fE1D898ECCAad394e2ba0fC1F93d27c7b717A",
    dappTokens,
    provider: library,
    onSrcTokenSelected: (token: any) => console.log(token),
    onDstTokenSelected: (token: any) => console.log(token),
  };
  const ordersProps: PangolinOrdersProps = { account, dappTokens };

  return (
    <>
      <MetaTags title={Configs.Pangolin.partner} />

      <StyledLayoutPangolin>
        <Twap {...twapProps} />
      </StyledLayoutPangolin>
      <StyledLayoutPangolin>
        <Orders {...ordersProps} />
      </StyledLayoutPangolin>
    </>
  );
};

const dapp = {
  name: Configs.Pangolin.partner,
  path: Configs.Pangolin.partner.toLowerCase(),
  Component: Dapp,
  logo: "https://s2.coinmarketcap.com/static/img/coins/64x64/8422.png",
};

export default dapp;
