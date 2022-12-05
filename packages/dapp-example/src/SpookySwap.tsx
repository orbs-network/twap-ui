import { StyledLayoutSpookyswap, StyledModalList, StyledModalListItem } from "./styles";
import { Orders, TWAP, SpookySwapTWAPProps, SpookySwapOrdersProps } from "@orbs-network/twap-ui-spookyswap";
import { useConnectWallet, useGetTokens } from "./hooks";
import { TokenData } from "@orbs-network/twap";
import { useWeb3React } from "@web3-react/core";
import { Configs } from "@orbs-network/twap";
import { Dapp } from "./Components";
import { DappLayout, Popup } from "./Components";

const parseToken = (token: any): TokenData => {
  return { symbol: token.symbol, address: token.address, decimals: token.decimals, logoUrl: token.logoURI };
};

const config = Configs.SpookySwap;

const useDappTokens = () => {
  return useGetTokens(config.chainId, parseToken);
};

interface TokenSelectModalProps {
  isOpen: boolean;
  selectedToken?: any;
  onSelect: (token: any) => void;
  onClose: () => void;
}

export const TokenSelectModal = ({ isOpen, selectedToken, onSelect, onClose }: TokenSelectModalProps) => {
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
              <img src={token.logoUrl || ""} width={20} height={20} alt="" />
              {token.symbol}
            </StyledModalListItem>
          );
        })}
      </StyledModalList>
    </Popup>
  );
};

const logo = "https://s2.coinmarketcap.com/static/img/coins/64x64/9608.png";

const DappComponent = () => {
  const { account, library } = useWeb3React();
  const connect = useConnectWallet();
  const { data: dappTokens } = useDappTokens();

  const getTokenImage = (token: any) => token.logoUrl;

  const getProvider = () => library;

  const twapProps: SpookySwapTWAPProps = {
    getProvider,
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
  const ordersProps: SpookySwapOrdersProps = { account, getTokenImage, dappTokens, getProvider };

  return (
    <DappLayout name={config.partner} favicon={logo}>
      <StyledLayoutSpookyswap>
        <TWAP {...twapProps} />
      </StyledLayoutSpookyswap>
      <StyledLayoutSpookyswap>
        <Orders {...ordersProps} />
      </StyledLayoutSpookyswap>
    </DappLayout>
  );
};

const dapp: Dapp = {
  name: config.partner,
  Component: DappComponent,
  logo,
};

export default dapp;
