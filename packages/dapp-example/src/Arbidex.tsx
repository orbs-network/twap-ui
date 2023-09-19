import { StyledArbidexSwap, StyledArbidexBox, StyledArbidexLayout, StyledModalContent } from "./styles";
import { TWAP, Orders } from "@orbs-network/twap-ui-arbidex";
import { useConnectWallet, useNetwork, useTheme } from "./hooks";
import { useWeb3React } from "@web3-react/core";
import { Configs } from "@orbs-network/twap";
import { Dapp, TokensList, UISelector } from "./Components";
import { Popup } from "./Components";
import { SelectorOption, TokenListItem } from "./types";
import _ from "lodash";
import { erc20sData, zeroAddress, erc20s, isNativeAddress } from "@defi.org/web3-candies";
import { createContext, ReactNode, useContext, useState } from "react";
import { useQuery } from "@tanstack/react-query";

const config = Configs.Arbidex;

export const useDappTokens = () => {
  const { account } = useWeb3React();
  const { isInValidNetwork } = useNetwork(config.chainId);

  return useQuery(
    ["useGetTokens", config.chainId],
    async () => {
      const response = await fetch(`https://raw.githubusercontent.com/viaprotocol/tokenlists/main/tokenlists/arbitrum.json`);

      const tokens = await response.json();

      const parsed = tokens.map(({ symbol, address, decimals, name, logoURI }: any) => ({
        decimals,
        symbol,
        name,
        address,
        logoURI: isNativeAddress(address) ? config.nativeToken.logoUrl : logoURI,
      }));
      const candiesAddresses = [zeroAddress, ..._.map(erc20s.arb, (t) => t().address)];

      const _tokens = _.sortBy(parsed, (t: any) => {
        const index = candiesAddresses.indexOf(t.address);
        return index >= 0 ? index : Number.MAX_SAFE_INTEGER;
      });

      return { ..._.mapKeys(_tokens, (t) => t.address) } as any;
    },
    { enabled: !!account && !isInValidNetwork }
  );
};

interface TokenSelectModalProps {
  isOpen: boolean;
  selectedCurrency?: any;
  onCurrencySelect: (token: any) => void;
  onDismiss: () => void;
}

const getTokenLogoURL = (address: string) => {
  return `https://arbidex.fi/images/tokens/${address.toLowerCase()}.png`;
};

const parseList = (rawList?: any): TokenListItem[] => {
  return _.map(rawList, (rawToken) => {
    return {
      token: {
        address: rawToken.address ?? rawToken.tokenInfo?.address,
        decimals: rawToken.decimals ?? rawToken.tokenInfo?.decimals,
        symbol: rawToken.symbol ?? rawToken.tokenInfo?.symbol,
        logoUrl: getTokenLogoURL(rawToken.address ?? rawToken.tokenInfo?.address),
      },
      rawToken,
    };
  });
};

export const TokenSelectModal = ({ onCurrencySelect }: TokenSelectModalProps) => {
  const tokensList = useDappTokens().data;
  const parsedList = parseList(tokensList);
  const { close } = useContext(Context);

  const onClick = (token: any) => {
    onCurrencySelect(token);
    close();
  };

  return (
    <StyledModalContent>
      <TokensList tokens={parsedList} onClick={onClick} />
    </StyledModalContent>
  );
};

interface ContextProps {
  modal: any;
  open: (modal: any) => void;
  close: () => void;
}
const Context = createContext({} as ContextProps);

const ContextWrapper = ({ children }: { children: ReactNode }) => {
  const [modal, setModal] = useState<any>(undefined);

  return <Context.Provider value={{ modal, open: (modal: any) => setModal(modal), close: () => setModal(undefined) }}>{children}</Context.Provider>;
};

const ListPopup = () => {
  const { modal, close } = useContext(Context);

  return (
    <Popup isOpen={!!modal} onClose={close}>
      {modal}
    </Popup>
  );
};

const useModal = (Component: any) => {
  const { open } = useContext(Context);

  const onClick = () => {
    open(Component);
  };

  return [onClick];
};

const TWAPComponent = ({ limit }: { limit?: boolean }) => {
  const { account, library } = useWeb3React();
  const connect = useConnectWallet();
  const { data: dappTokens } = useDappTokens();

  const { isDarkTheme } = useTheme();

  return (
    <TWAP
      provider={library?.givenProvider}
      connect={connect}
      account={account}
      srcToken={zeroAddress}
      dstToken={erc20sData.arb.USDC.address}
      dappTokens={dappTokens}
      onSrcTokenSelected={(token: any) => console.log(token)}
      onDstTokenSelected={(token: any) => console.log(token)}
      TokenSelectModal={TokenSelectModal}
      isDarkTheme={isDarkTheme}
      limit={limit}
      useModal={useModal}
    />
  );
};

const logo = "https://arbidex.fi/images/tokens/0xd5954c3084a1ccd70b4da011e67760b8e78aee84.png";

const DappComponent = () => {
  const [selected, setSelected] = useState(SelectorOption.TWAP);

  return (
    <ContextWrapper>
      <ListPopup />
      <StyledArbidexSwap>
        <StyledArbidexLayout name={config.name}>
          <UISelector limit={true} select={setSelected} selected={selected} />
          <StyledArbidexBox>
            <TWAPComponent limit={selected === SelectorOption.LIMIT} />
          </StyledArbidexBox>

          <StyledArbidexBox>
            <Orders />
          </StyledArbidexBox>
        </StyledArbidexLayout>
      </StyledArbidexSwap>
    </ContextWrapper>
  );
};

const dapp: Dapp = {
  Component: DappComponent,
  logo,
  config,
};

export default dapp;
