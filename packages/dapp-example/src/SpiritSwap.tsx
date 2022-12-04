import { StyledLayoutSpiritswap, StyledModalList, StyledModalListItem } from "./styles";
import { Orders, Twap, SpiritSwapTWAPProps, SpiritSwapOrdersProps } from "@orbs-network/twap-ui-spiritswap";
import { MetaTags, Popup, useConnectWallet, useGetTokens } from "./defaults";
import { TokenData } from "@orbs-network/twap";
import { Configs } from "@orbs-network/twap";
import { useWeb3React } from "@web3-react/core";
import { Helmet } from "react-helmet";

const parseToken = (token: any): TokenData => {
  return { symbol: token.symbol, address: token.address, decimals: token.decimals, logoUrl: token.logoURI };
};

const useDappTokens = () => {
  return useGetTokens(Configs.SpookySwap.chainId, parseToken);
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
              <img src={token.logoUrl || ""} width={20} height={20} alt="" />
              {token.symbol}
            </StyledModalListItem>
          );
        })}
      </StyledModalList>
    </Popup>
  );
};

const Dapp = () => {
  const { account, library } = useWeb3React();
  const connect = useConnectWallet();
  const { data: dappTokens } = useDappTokens();

  const getRpc = () => {
    return "https://rpc.ankr.com/fantom/";
  };

  const getTokenImage = (token: any) => {
    return token.logoUrl;
  };

  const twapProps: SpiritSwapTWAPProps = {
    getProvider: () => library,
    connect,
    account,
    srcToken: "WFTM",
    dstToken: "ORBS",
    getRpc,
    getTokenImage,
    dappTokens,
    onSrcTokenSelected: (token: any) => console.log(token),
    onDstTokenSelected: (token: any) => console.log(token),
    TokenSelectModal,
  };
  const ordersProps: SpiritSwapOrdersProps = { account, getRpc, getTokenImage, dappTokens };

  return (
    <>
     <MetaTags title={Configs.SpiritSwap.partner} />

      <StyledLayoutSpiritswap>
        <Twap {...twapProps} />
      </StyledLayoutSpiritswap>
      <StyledLayoutSpiritswap>
        <Orders {...ordersProps} />
      </StyledLayoutSpiritswap>
    </>
  );
};


const dapp = {
  name: Configs.SpiritSwap.partner,
  path: Configs.SpiritSwap.partner.toLowerCase(),
  Component: Dapp,
  logo: "https://s2.coinmarketcap.com/static/img/coins/64x64/10239.png",
};

export default dapp;
