import { PangolinTWAPProps, TWAP } from "@orbs-network/twap-ui-pangolin";
import { DappLayout, Popup, TokenSearchInput, TokenSelectListItem } from "./Components";
import { StyledModalList, StyledPangolinTWAP, StyledLayoutPangolinDaasTWAP, StyledModalContent } from "./styles";
import _ from "lodash";
import { erc20s, zeroAddress } from "@defi.org/web3-candies";
import { useWeb3React } from "@web3-react/core";
import { useQuery } from "@tanstack/react-query";
import { Configs } from "@orbs-network/twap";
import { Dapp } from "./Components";
import { useConnectWallet, useNetwork, useTheme } from "./hooks";
import { pangolinDarkTheme, pangolinLightTheme } from "./themes";
import Web3 from "web3";
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

const TokenSelectModal = ({ isOpen, onClose, onCurrencySelect }: TokenSelectModalProps) => {
  const { data: tokensList } = useDappTokens();
  const [filterValue, setFilterValue] = useState("");

  if (!tokensList) return null;

  return (
    <Popup isOpen={isOpen} onClose={onClose}>
      <StyledModalContent>
        <TokenSearchInput setValue={setFilterValue} value={filterValue} />
        <StyledModalList>
          {_.map(tokensList, (token: any) => {
            const address = token.tokenInfo ? token.tokenInfo.address : token.address;
            const decimals = token.tokenInfo ? token.tokenInfo.decimals : token.decimals;
            const symbol = token.tokenInfo ? token.tokenInfo.symbol : token.symbol;
            const logo = token.tokenInfo ? token.tokenInfo.logoURI : nativeTokenLogo;

            return (
              <TokenSelectListItem filter={filterValue} key={address} onClick={() => onCurrencySelect(token)} decimals={decimals} logo={logo} symbol={symbol} address={address} />
            );
          })}
        </StyledModalList>
      </StyledModalContent>
    </Popup>
  );
};
const logo = "https://s2.coinmarketcap.com/static/img/coins/64x64/8422.png";

const PangolinComponent = () => {
  const { account, library: provider, chainId } = useWeb3React();
  const { data: dappTokens } = useDappTokens();
  const { isDarkTheme } = useTheme();

  const connect = useConnectWallet();

  const twapProps: PangolinTWAPProps = {
    account,
    TokenSelectModal,
    srcToken: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7", //WAVAX
    dstToken: "0x340fE1D898ECCAad394e2ba0fC1F93d27c7b717A", // ORBS
    dappTokens,
    provider,
    onSrcTokenSelected: (token: any) => console.log(token),
    onDstTokenSelected: (token: any) => console.log(token),
    connect,
    connectedChainId: chainId,
    theme: isDarkTheme ? pangolinDarkTheme : pangolinLightTheme,
  };

  return (
    <DappLayout name={config.partner}>
      <StyledPangolinTWAP>
        <TWAP {...twapProps} />
      </StyledPangolinTWAP>
    </DappLayout>
  );
};

const PangolinDaasComponent = () => {
  const { account, library: provider, chainId } = useWeb3React();
  const { data: dappTokens } = useDappTokens();
  console.log(dappTokens);

  const { isDarkTheme } = useTheme();

  const connect = useConnectWallet();

  const twapProps: PangolinTWAPProps = {
    account,
    TokenSelectModal,
    srcToken: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7", //WAVAX
    dstToken: "0x340fE1D898ECCAad394e2ba0fC1F93d27c7b717A", // ORBS
    dappTokens,
    provider,
    onSrcTokenSelected: (token: any) => console.log(token),
    onDstTokenSelected: (token: any) => console.log(token),
    connect,
    connectedChainId: chainId,
    theme: isDarkTheme ? pangolinDarkTheme : pangolinLightTheme,
    partnerDaas: "0xFA1c2Ae5c52a02cbaD6A05CdcA89f032Fa3a4D0d",
  };

  return (
    <DappLayout name={config.partner}>
      <StyledLayoutPangolinDaasTWAP>
        <TWAP {...twapProps} />
      </StyledLayoutPangolinDaasTWAP>
    </DappLayout>
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
