import { StyledLayoutSpiritswap, StyledModalContent, StyledModalList, StyledModalListItem } from "./styles";
import { Orders, TWAP, SpiritSwapTWAPProps, SpiritSwapOrdersProps } from "@orbs-network/twap-ui-spiritswap";
import { useConnectWallet, useGetTokensFromViaProtocol } from "./hooks";
import { TokenData } from "@orbs-network/twap";
import { Configs } from "@orbs-network/twap";
import { useWeb3React } from "@web3-react/core";
import { Dapp, TokenSearchInput, TokenSelectListItem } from "./Components";
import { DappLayout, Popup } from "./Components";
import { useState } from "react";

const config = Configs.SpiritSwap;

const useDappTokens = () => {
  return useGetTokensFromViaProtocol(config.chainId);
};

interface TokenSelectModalProps {
  isOpen: boolean;
  selectedToken?: any;
  onSelect: (token: any) => void;
  onClose: () => void;
}

const TokenSelectModal = ({ isOpen, selectedToken, onSelect, onClose }: TokenSelectModalProps) => {
  const { data: list } = useDappTokens();
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
const logo = "https://s2.coinmarketcap.com/static/img/coins/64x64/10239.png";
const DappComponent = () => {
  const { account, library } = useWeb3React();
  const connect = useConnectWallet();
  const { data: dappTokens } = useDappTokens();

  const getTokenImageUrl = (symbol: string) => dappTokens?.find((t) => t.symbol === symbol)?.logoUrl;

  const twapProps: SpiritSwapTWAPProps = {
    getProvider: () => library,
    connect,
    account,
    srcToken: "WFTM",
    dstToken: "USDC",
    getTokenImageUrl,
    dappTokens,
    onSrcTokenSelected: (token: any) => console.log(token),
    onDstTokenSelected: (token: any) => console.log(token),
    TokenSelectModal,
  };
  const ordersProps: SpiritSwapOrdersProps = { account, getTokenImageUrl, dappTokens, getProvider: () => library };

  return (
    <DappLayout name={config.partner}>
      <StyledLayoutSpiritswap>
        <TWAP {...twapProps} />
      </StyledLayoutSpiritswap>
      <StyledLayoutSpiritswap>
        <Orders {...ordersProps} />
      </StyledLayoutSpiritswap>
    </DappLayout>
  );
};

const dapp: Dapp = {
  Component: DappComponent,
  logo,
  config,
};

export default dapp;
