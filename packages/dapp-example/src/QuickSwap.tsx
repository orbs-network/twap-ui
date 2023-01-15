import { StyledLayoutQuickswap, StyledModalList, StyledModalListItem } from "./styles";
import { Orders, TWAP, QuickSwapTWAPProps, QuickSwapOrdersProps } from "@orbs-network/twap-ui-quickswap";
import { useConnectWallet, useGetTokensFromViaProtocol } from "./hooks";
import { TokenData } from "@orbs-network/twap";
import { Configs } from "@orbs-network/twap";
import { useWeb3React } from "@web3-react/core";
import { Dapp } from "./Components";
import { Components } from "@orbs-network/twap-ui";

import { DappLayout, Popup } from "./Components";

const config = Configs.QuickSwap;

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
                  height: 30,
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
const logo = "https://s2.coinmarketcap.com/static/img/coins/64x64/8206.png";
const DappComponent = () => {
  const { account, library } = useWeb3React();
  const connect = useConnectWallet();
  const { data: dappTokens } = useDappTokens();

  const getTokenImageUrl = (symbol: string) => dappTokens?.find((t) => t.symbol === symbol)?.logoUrl;

  const twapProps: QuickSwapTWAPProps = {
    getProvider: () => library,
    connect,
    account,
    srcToken: "USDC",
    dstToken: "ORBS",
    getTokenImageUrl,
    dappTokens,
    onSrcTokenSelected: (token: any) => console.log(token),
    onDstTokenSelected: (token: any) => console.log(token),
    TokenSelectModal,
  };
  const ordersProps: QuickSwapOrdersProps = { account, getTokenImageUrl, dappTokens, getProvider: () => library };

  return (
    <DappLayout name={config.partner}>
      <StyledLayoutQuickswap>
        <TWAP {...twapProps} />
      </StyledLayoutQuickswap>
      <StyledLayoutQuickswap>
        <Orders {...ordersProps} />
      </StyledLayoutQuickswap>
    </DappLayout>
  );
};

const dapp: Dapp = {
  Component: DappComponent,
  logo,
  config,
};

export default dapp;
