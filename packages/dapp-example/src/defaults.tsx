import { InjectedConnector } from "@web3-react/injected-connector";
import { erc20s, networks, zeroAddress } from "@defi.org/web3-candies";
import { ReactNode } from "react";
import _ from "lodash";
import Modal from "@mui/material/Modal";
import { AiOutlineClose } from "react-icons/ai";
import { StyledCloseIcon } from "./styles";
import { TokenData } from "@orbs-network/twap";
import { useWeb3React } from "@web3-react/core";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
export const injectedConnector = new InjectedConnector({});

const tokenlistsNetworkNames = {
  [networks.eth.id]: "ethereum",
  [networks.ftm.id]: "ftm",
  [networks.poly.id]: "polygon",
  [networks.avax.id]: "avax",
  [networks.bsc.id]: "bsc",
  [networks.arb.id]: "arbitrum",
  [networks.oeth.id]: "optimism",
};

export const useGetTokens = (chainId: number, parseToken: (token: any) => TokenData) => {
  const { account } = useWeb3React();

  return useQuery(
    ["useGetTokens", chainId],
    async () => {
      const name = tokenlistsNetworkNames[chainId!];
      if (!name) return;
      const response = await fetch(`https://raw.githubusercontent.com/viaprotocol/tokenlists/main/tokenlists/${name}.json`);
      const tokenList = await response.json();
      const parsed = tokenList.map((t: any) => parseToken(t));
      const networkShortName = _.find(networks, (n) => n.id === chainId)!.shortname;
      const topTokens = [
        zeroAddress,
        ..._.chain(erc20s)
          .find((it: any, k) => k === networkShortName)
          .map((t: any) => t().address)
          .value(),
      ];

      const _tokens = _.sortBy(parsed, (t: any) => {
        const index = topTokens.indexOf(t.address);
        return index >= 0 ? index : Number.MAX_SAFE_INTEGER;
      });
      return _tokens;
    },
    { enabled: !!account }
  );
};

export const Popup = ({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: ReactNode }) => {
  return (
    <Modal open={isOpen} onClose={onClose} onBackdropClick={onClose}>
      <>
        <StyledCloseIcon onClick={onClose}>
          <AiOutlineClose className="icon" />
        </StyledCloseIcon>
        {children}
      </>
    </Modal>
  );
};



export const MetaTags = ({ title }: { title: string, favicon?: string }) => {
  return (
    <Helmet>
      {/* <link rel="icon" href="/favicon.ico" /> */}
      <title>TWAP On {title}</title>
    </Helmet>
  );
};

export const useConnectWallet = () => {
  const { activate } = useWeb3React();
  return () => activate(injectedConnector);
};
