import { Orders, Twap } from "@orbs-network/twap-ui-pangolin";
import { Popup, useDefaultProps } from "./defaults";
import { StyledLayoutPangolin, StyledModalList, StyledModalListItem } from "./styles";
import _ from "lodash";
import { useEffect, useState } from "react";
import { erc20s, networks, zeroAddress } from "@defi.org/web3-candies";
import { useWeb3React } from "@web3-react/core";

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
const useDappTokens = (connectedChainId?: number) => {
  const [tokens, setTokens] = useState<any>(undefined);

  const getTokens = async () => {
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

    setTokens({ native: nativeToken, ..._.mapKeys(_tokens, (t) => t.address) });
  };

  useEffect(() => {
    if (connectedChainId === chainId) {
      getTokens();
    }
  }, [connectedChainId]);

  return tokens;
};

const TokenSelectModal = ({ isOpen, onClose, onCurrencySelect }: TokenSelectModalProps) => {
  const { chainId } = useWeb3React();

  const list = useDappTokens(chainId);

  if (!list) return null;

  return (
    <Popup isOpen={isOpen} onClose={onClose}>
      <StyledModalList>
        {_.map(list, (token: any) => {
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
  const defaultProps = useDefaultProps();
  const { chainId } = useWeb3React();

  const dappTokens = useDappTokens(chainId);
  const props = {
    ...defaultProps,
    TokenSelectModal,
    dappTokens: dappTokens,
    srcToken: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
  };
  return (
    <>
      <StyledLayoutPangolin>
        <Twap {...props} />
      </StyledLayoutPangolin>
      <StyledLayoutPangolin>
        <Orders {...props} />
      </StyledLayoutPangolin>
    </>
  );
};

export default Dapp;
