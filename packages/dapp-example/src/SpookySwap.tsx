import { StyledLayoutSpookyswap, StyledModalContent, StyledModalList, StyledModalListItem } from "./styles";
import { Orders, TWAP, SpookySwapTWAPProps, SpookySwapOrdersProps } from "@orbs-network/twap-ui-spookyswap";
import { useConnectWallet, useGetTokensFromViaProtocol, useTheme } from "./hooks";
import { TokenData } from "@orbs-network/twap";
import { useWeb3React } from "@web3-react/core";
import { Configs } from "@orbs-network/twap";
import { Dapp, TokenSearchInput, TokenSelectListItem } from "./Components";
import { DappLayout, Popup } from "./Components";
import { useState } from "react";

const config = Configs.SpookySwap;

const useDappTokens = () => {
  return useGetTokensFromViaProtocol(config.chainId);
};

interface TokenSelectModalProps {
  isOpen: boolean;
  selectedToken?: any;
  onSelect: (token: any) => void;
  onClose: () => void;
}

export const TokenSelectModal = ({ isOpen, selectedToken, onSelect, onClose }: TokenSelectModalProps) => {
  const list = useDappTokens().data;
  const [filterValue, setFilterValue] = useState("");

  return (
    <Popup isOpen={isOpen} onClose={onClose}>
      <StyledModalContent>
        <TokenSearchInput setValue={setFilterValue} value={filterValue} />
        <StyledModalList>
          {list?.map((token: TokenData) => {
            if (token.address === selectedToken?.address) {
              return null;
            }
            return (
              <TokenSelectListItem
                filter={filterValue}
                onClick={() => onSelect(token)}
                key={token.address}
                logo={token.logoUrl}
                symbol={token.symbol}
                address={token.address}
                decimals={token.decimals}
              />
            );
          })}
        </StyledModalList>
      </StyledModalContent>
    </Popup>
  );
};

const logo = "https://s2.coinmarketcap.com/static/img/coins/64x64/9608.png";

const DappComponent = () => {
  const { account, library } = useWeb3React();
  const connect = useConnectWallet();
  const { data: dappTokens } = useDappTokens();

  const getTokenImageUrl = (symbol: string) => dappTokens?.find((t) => t.symbol === symbol)?.logoUrl;

  const getProvider = () => library;
  const { isDarkTheme } = useTheme();

  const twapProps: SpookySwapTWAPProps = {
    getProvider,
    connect,
    account,
    srcToken: "WFTM",
    dstToken: "ORBS",
    getTokenImageUrl,
    dappTokens,
    onSrcTokenSelected: (token: any) => console.log(token),
    onDstTokenSelected: (token: any) => console.log(token),
    TokenSelectModal,
    isDarkTheme,
  };
  const ordersProps: SpookySwapOrdersProps = { account, getTokenImageUrl, dappTokens, getProvider, isDarkTheme };

  return (
    <DappLayout name={config.partner}>
      <StyledLayoutSpookyswap mode={isDarkTheme ? "dark" : "light"}>
        <TWAP {...twapProps} />
      </StyledLayoutSpookyswap>
      <StyledLayoutSpookyswap mode={isDarkTheme ? "dark" : "light"}>
        <Orders {...ordersProps} />
      </StyledLayoutSpookyswap>
    </DappLayout>
  );
};

const dapp: Dapp = {
  Component: DappComponent,
  logo,
  config,
};

export default dapp;
