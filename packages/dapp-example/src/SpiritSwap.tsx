import { StyledLayoutSpiritswap, StyledModalList, StyledModalListItem } from "./styles";
import { Orders, TWAP, SpiritSwapTWAPProps, SpiritSwapOrdersProps } from "@orbs-network/twap-ui-spiritswap";
import { useConnectWallet, useGetTokensFromViaProtocol } from "./hooks";
import { TokenData } from "@orbs-network/twap";
import { Configs } from "@orbs-network/twap";
import { useWeb3React } from "@web3-react/core";
import { Dapp } from "./Components";
import { Components } from "@orbs-network/twap-ui";

import { DappLayout, Popup } from "./Components";

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

  return (
    <Popup isOpen={isOpen} onClose={onClose}>
      <StyledModalList>
        {list?.map((token: TokenData) => {
          if (token.address === selectedToken?.address) {
            return null;
          }
          return (
            <StyledModalListItem onClick={() => onSelect(token)} key={token.address}>
              <Components.TokenLogo
                logo={token.logoUrl}
                alt={token.symbol}
                style={{
                  width: 30,
                  height: 30
                }}
              />
              {token.symbol}
            </StyledModalListItem>
          );
        })}
      </StyledModalList>
    </Popup>
  );
};
const logo = "https://s2.coinmarketcap.com/static/img/coins/64x64/10239.png";
const DappComponent = () => {
  const { account, library } = useWeb3React();
  const connect = useConnectWallet();
  const { data: dappTokens } = useDappTokens();

  const getTokenImage = (token: any) => {
    return token.logoUrl;
  };

  const twapProps: SpiritSwapTWAPProps = {
    getProvider: () => library,
    connect,
    account,
    srcToken: "WFTM",
    dstToken: "ORBS",
    getTokenImage,
    dappTokens,
    onSrcTokenSelected: (token: any) => console.log(token),
    onDstTokenSelected: (token: any) => console.log(token),
    TokenSelectModal,
  };
  const ordersProps: SpiritSwapOrdersProps = { account, getTokenImage, dappTokens, getProvider: () => library };

  return (
    <DappLayout name={config.partner} favicon={logo}>
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
