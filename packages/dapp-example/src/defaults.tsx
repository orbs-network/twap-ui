import { InjectedConnector } from "@web3-react/injected-connector";
import { erc20s, networks, zeroAddress } from "@defi.org/web3-candies";
import { ReactNode, useEffect, useMemo, useState } from "react";
import _ from "lodash";
import MenuItem from "@mui/material/MenuItem";
import Modal from "@mui/material/Modal";
import { AiOutlineClose } from "react-icons/ai";
import { Configs } from "@orbs-network/twap";
import { StyledApp, StyledCloseIcon, StyledContent, StyledDappSelector, StyledModalList, StyledModalListItem } from "./styles";
import { TokenData } from "@orbs-network/twap";
import { useWeb3React } from "@web3-react/core";
export const injectedConnector = new InjectedConnector({});

const tokenlistsNetworkNames = {
  [networks.eth.id]: "ethereum",
  [networks.ftm.id]: "ftm",
};

const useTokenList = (chainId?: number) => {
  const [tokens, setTokens] = useState<any[]>([]);

  useEffect(() => {
    if (!chainId) return;
    const name = tokenlistsNetworkNames[chainId];
    if (!name) return;
    (async () => {
      const response = await fetch(`https://raw.githubusercontent.com/viaprotocol/tokenlists/main/tokenlists/${name}.json`);
      const tokenList = await response.json();
      const parsed = tokenList.map(({ symbol, address, decimals, logoURI }: any) => ({ symbol, address, decimals, logoUrl: logoURI }));

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
      setTokens(_tokens);
    })();
  }, [chainId]);

  return tokens;
};

interface DefaultTokenSelectModalProps {
  chainId?: number;
  isOpen: boolean;
  selectedToken?: TokenData;
  onSelect: (token: TokenData) => void;
  onClose: () => void;
}

export const DefaultTokenSelectModal = ({ chainId, isOpen, selectedToken, onSelect, onClose }: DefaultTokenSelectModalProps) => {
  const list = useTokenList(chainId);

  return (
    <Popup isOpen={isOpen} onClose={onClose}>
      <StyledModalList>
        {list.map((token: TokenData) => {
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

export const useDefaultProps = () => {
  const { activate, library, chainId, account } = useWeb3React();
  const tokensList = useTokenList(chainId);

  return {
    connectedChainId: chainId,
    getProvider: () => library,
    account,
    TokenSelectModal: DefaultTokenSelectModal,
    connect: () => activate(injectedConnector),
    tokensList,
    onSrcTokenSelected: (value: any) => {},
    onDstTokenSelected: (value: any) => {},
    srcToken: undefined,
    dstToken: undefined,
    provider: library,
  };
};
