import { Orders, TWAP } from "@orbs-network/twap-ui-pangolin";
import { Popup, TokensList, UISelector } from "./Components";
import { StyledModalContent, StyledPangolin, StyledPangolinBox, StyledPangolinDaasBox, StyledPangolinLayout, StyledPangolinOrdersLayout } from "./styles";
import _ from "lodash";
import { erc20s, zeroAddress, erc20sData } from "@defi.org/web3-candies";
import { useWeb3React } from "@web3-react/core";
import { useQuery } from "@tanstack/react-query";
import { Configs } from "@orbs-network/twap";
import { Dapp } from "./Components";
import { useConnectWallet, useNetwork, useTheme } from "./hooks";
import { pangolinDarkTheme, pangolinLightTheme } from "./themes";
import Web3 from "web3";
import { SelectorOption, TokenListItem } from "./types";
import { useState } from "react";

interface TokenSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCurrencySelect: (token: any) => void;
}

const config = Configs.Pangolin;

const nativeToken = {
  decimals: 18,
  name: "Avalanche",
  symbol: "AVAX",
  "_constructor-name_": "Currency",
  address: Web3.utils.toChecksumAddress(zeroAddress),
};

const nativeTokenLogo = "https://raw.githubusercontent.com/pangolindex/sdk/master/src/images/chains/avax.png";

const chainId = config.chainId;

const useDappTokens = () => {
  const { account } = useWeb3React();
  const { isInValidNetwork } = useNetwork(chainId);

  return useQuery(
    ["useDappTokens", chainId],
    async () => {
      const response = await fetch(`https://raw.githubusercontent.com/pangolindex/tokenlists/main/pangolin.tokenlist.json`);
      const tokenList = await response.json();

      const parsed = tokenList.tokens
        .filter((t: any) => t.chainId === config.chainId)
        .map(({ symbol, address, decimals, logoURI, name }: any) => ({
          decimals,
          symbol,
          name,
          chainId,
          address,
          tokenInfo: { symbol, address, decimals, logoURI: (logoURI as string)?.replace("/logo_24.png", "/logo_48.png"), name, chainId },
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
      enabled: !!account && !isInValidNetwork,
    }
  );
};

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

const TokenSelectModal = ({ isOpen, onClose, onCurrencySelect }: TokenSelectModalProps) => {
  const { data: tokensList } = useDappTokens();
  const parsedList = parseList(tokensList);

  return (
    <Popup isOpen={isOpen} onClose={onClose}>
      <StyledModalContent>
        <TokensList tokens={parsedList} onClick={onCurrencySelect} />
      </StyledModalContent>
    </Popup>
  );
};
const logo = "https://s2.coinmarketcap.com/static/img/coins/64x64/8422.png";

const TWAPComponent = ({ partnerDaas, limit }: { partnerDaas?: string; limit?: boolean }) => {
  const { account, library: provider, chainId } = useWeb3React();
  const { data: dappTokens } = useDappTokens();
  const { isDarkTheme } = useTheme();

  const connect = useConnectWallet();

  return (
    <TWAP
      account={account}
      TokenSelectModal={TokenSelectModal}
      srcToken={zeroAddress} //AVAX
      dstToken={erc20sData.avax.USDC.address} // ORBS
      dappTokens={dappTokens}
      provider={provider}
      onSrcTokenSelected={(token: any) => console.log(token, "selected")}
      onDstTokenSelected={(token: any) => console.log(token, "selected")}
      connect={connect}
      connectedChainId={chainId}
      theme={isDarkTheme ? pangolinDarkTheme : pangolinLightTheme}
      partnerDaas={partnerDaas}
      limit={limit}
    />
  );
};

const PangolinComponent = () => {
  const [selected, setSelected] = useState(SelectorOption.TWAP);

  return (
    <StyledPangolin>
      <StyledPangolinLayout name={config.name}>
        <UISelector limit={true} select={setSelected} selected={selected} />
        <StyledPangolinBox>
          <TWAPComponent limit={selected === SelectorOption.LIMIT} />
        </StyledPangolinBox>
      </StyledPangolinLayout>
      <StyledPangolinOrdersLayout>
        <Orders />
      </StyledPangolinOrdersLayout>
    </StyledPangolin>
  );
};

const PangolinDaasComponent = () => {
  return (
    <StyledPangolin>
      <StyledPangolinLayout name={config.name}>
        <StyledPangolinDaasBox>
          <TWAPComponent partnerDaas="0xFA1c2Ae5c52a02cbaD6A05CdcA89f032Fa3a4D0d" />
        </StyledPangolinDaasBox>
      </StyledPangolinLayout>
    </StyledPangolin>
  );
};

const pangolin: Dapp = {
  Component: PangolinComponent,
  logo,
  config,
};

const pangolinDaas: Dapp = {
  Component: PangolinDaasComponent,
  logo,
  config: Configs.PangolinDaas,
  invertLogo: true,
};

export { pangolin, pangolinDaas };
