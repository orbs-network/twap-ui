import { StyledBaseSwap, StyledBaseSwapBox, StyledBaseSwapLayout, StyledModalContent } from "./styles";
import { TWAP, Orders } from "@orbs-network/twap-ui-baseswap";
import { useConnectWallet, useGetTokens, useTheme } from "./hooks";
import { useWeb3React } from "@web3-react/core";
import { Configs } from "@orbs-network/twap";
import { Dapp, TokensList, UISelector } from "./Components";
import { Popup } from "./Components";
import { SelectorOption, TokenListItem } from "./types";
import _ from "lodash";
import { erc20sData, zeroAddress, erc20s } from "@defi.org/web3-candies";
import { createContext, ReactNode, useContext, useState } from "react";

const config = Configs.BaseSwap;

const useDappTokens = () => {
  return useGetTokens({
    chainId: config.chainId,
    tokens,
    baseAssets: erc20s.base,
  });
};

interface TokenSelectModalProps {
  isOpen: boolean;
  selectedCurrency?: any;
  onCurrencySelect: (token: any) => void;
  onDismiss: () => void;
}

const getTokenLogoURL = (address: string) => {
  return `https://baseswap.fi/images/tokens/${address.toLowerCase()}.png`;
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
      dstToken={erc20sData.base.USDC.address}
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

const logo = "https://baseswap.fi/images/newlogo.png";

const DappComponent = () => {
  const [selected, setSelected] = useState(SelectorOption.TWAP);

  return (
    <ContextWrapper>
      <ListPopup />
      <StyledBaseSwap>
        <StyledBaseSwapLayout name={config.name}>
          <UISelector limit={true} select={setSelected} selected={selected} />
          <StyledBaseSwapBox>
            <TWAPComponent limit={selected === SelectorOption.LIMIT} />
          </StyledBaseSwapBox>

          <StyledBaseSwapBox>
            <Orders />
          </StyledBaseSwapBox>
        </StyledBaseSwapLayout>
      </StyledBaseSwap>
    </ContextWrapper>
  );
};

const dapp: Dapp = {
  Component: DappComponent,
  logo,
  config,
};

export default dapp;

const tokens = {
  "0x78a087d713Be963Bf307b18F2Ff8122EF9A63ae9": {
    decimals: 18,
    symbol: "BSWAP",
    name: "BaseSwap Token",
    isNative: false,
    isToken: true,
    chainId: 8453,
    address: "0x78a087d713Be963Bf307b18F2Ff8122EF9A63ae9",
    tokenInfo: {
      name: "BaseSwap Token",
      symbol: "BSWAP",
      address: "0x78a087d713Be963Bf307b18F2Ff8122EF9A63ae9",
      chainId: 8453,
      decimals: 18,
      logoURI: "https://baseswap.fi/images/tokens/0x78a087d713Be963Bf307b18F2Ff8122EF9A63ae9.png",
    },
    tags: [],
  },
  "0xd5046B976188EB40f6DE40fB527F89c05b323385": {
    decimals: 18,
    symbol: "BSX",
    name: "Base X",
    isNative: false,
    isToken: true,
    chainId: 8453,
    address: "0xd5046B976188EB40f6DE40fB527F89c05b323385",
    tokenInfo: {
      name: "Base X",
      symbol: "BSX",
      address: "0xd5046B976188EB40f6DE40fB527F89c05b323385",
      chainId: 8453,
      decimals: 18,
      logoURI: "https://baseswap.fi/images/tokens/0xd5046B976188EB40f6DE40fB527F89c05b323385.png",
    },
    tags: [],
  },
  "0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA": {
    decimals: 6,
    symbol: "USDbC",
    name: "USD Base Coin",
    isNative: false,
    isToken: true,
    chainId: 8453,
    address: "0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA",
    tokenInfo: {
      name: "USD Base Coin",
      symbol: "USDbC",
      address: "0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA",
      chainId: 8453,
      decimals: 6,
      logoURI: "",
    },
    tags: [],
  },
  "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb": {
    decimals: 18,
    symbol: "DAI",
    name: "DAI Stablecoin Token",
    isNative: false,
    isToken: true,
    chainId: 8453,
    address: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
    tokenInfo: {
      name: "DAI Stablecoin Token",
      symbol: "DAI",
      address: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
      chainId: 8453,
      decimals: 18,
      logoURI: "",
    },
    tags: [],
  },
  "0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22": {
    decimals: 18,
    symbol: "cbETH",
    name: "Coinbase Wrapped Staked ETH",
    isNative: false,
    isToken: true,
    chainId: 8453,
    address: "0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22",
    tokenInfo: {
      name: "Coinbase Wrapped Staked ETH",
      symbol: "cbETH",
      address: "0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22",
      chainId: 8453,
      decimals: 18,
      logoURI: "",
    },
    tags: [],
  },
  "0x4A3A6Dd60A34bB2Aba60D73B4C88315E9CeB6A3D": {
    decimals: 18,
    symbol: "MIM",
    name: "Magic Internet Money",
    isNative: false,
    isToken: true,
    chainId: 8453,
    address: "0x4A3A6Dd60A34bB2Aba60D73B4C88315E9CeB6A3D",
    tokenInfo: {
      name: "Magic Internet Money",
      symbol: "MIM",
      address: "0x4A3A6Dd60A34bB2Aba60D73B4C88315E9CeB6A3D",
      chainId: 8453,
      decimals: 18,
      logoURI: "",
    },
    tags: [],
  },
  "0x8901cB2e82CC95c01e42206F8d1F417FE53e7Af0": {
    decimals: 18,
    symbol: "YFX",
    name: "Yield Farming Index",
    isNative: false,
    isToken: true,
    chainId: 8453,
    address: "0x8901cB2e82CC95c01e42206F8d1F417FE53e7Af0",
    tokenInfo: {
      name: "Yield Farming Index",
      symbol: "YFX",
      address: "0x8901cB2e82CC95c01e42206F8d1F417FE53e7Af0",
      chainId: 8453,
      decimals: 18,
      logoURI: "",
    },
    tags: [],
  },
  "0xCd239E01C36d3079c0dAeF355C61cFF591C40DB1": {
    decimals: 18,
    symbol: "GMD",
    name: "GMD Protocol",
    isNative: false,
    isToken: true,
    chainId: 8453,
    address: "0xCd239E01C36d3079c0dAeF355C61cFF591C40DB1",
    tokenInfo: {
      name: "GMD Protocol",
      symbol: "GMD",
      address: "0xcd239e01c36d3079c0daef355c61cff591c40db1",
      chainId: 8453,
      decimals: 18,
      logoURI: "",
    },
    tags: [],
  },
  "0xfB825E93822DD971EBDFdB2180A751958dBD5e16": {
    decimals: 18,
    symbol: "GND",
    name: "GND Protocol",
    isNative: false,
    isToken: true,
    chainId: 8453,
    address: "0xfB825E93822DD971EBDFdB2180A751958dBD5e16",
    tokenInfo: {
      name: "GND Protocol",
      symbol: "GND",
      address: "0xfb825e93822dd971ebdfdb2180a751958dbd5e16",
      chainId: 8453,
      decimals: 18,
      logoURI: "",
    },
    tags: [],
  },
  "0x1a35EE4640b0A3B87705B0A4B45D227Ba60Ca2ad": {
    decimals: 8,
    symbol: "axlWBTC",
    name: "Axelar Wrapped Bitcoin",
    isNative: false,
    isToken: true,
    chainId: 8453,
    address: "0x1a35EE4640b0A3B87705B0A4B45D227Ba60Ca2ad",
    tokenInfo: {
      name: "Axelar Wrapped Bitcoin",
      symbol: "axlWBTC",
      address: "0x1a35EE4640b0A3B87705B0A4B45D227Ba60Ca2ad",
      chainId: 8453,
      decimals: 8,
      logoURI: "",
    },
    tags: [],
  },
  "0x37DEfBC399e5737D53Dfb5533d9954572F5B19bf": {
    decimals: 9,
    symbol: "BLAZE",
    name: "BlazeBot",
    isNative: false,
    isToken: true,
    chainId: 8453,
    address: "0x37DEfBC399e5737D53Dfb5533d9954572F5B19bf",
    tokenInfo: {
      name: "BlazeBot",
      symbol: "BLAZE",
      address: "0x37DEfBC399e5737D53Dfb5533d9954572F5B19bf",
      chainId: 8453,
      decimals: 9,
      logoURI: "",
    },
    tags: [],
  },
  "0x6B4712AE9797C199edd44F897cA09BC57628a1CF": {
    decimals: 18,
    symbol: "UNIDX",
    name: "Unidex Exchange",
    isNative: false,
    isToken: true,
    chainId: 8453,
    address: "0x6B4712AE9797C199edd44F897cA09BC57628a1CF",
    tokenInfo: {
      name: "Unidex Exchange",
      symbol: "UNIDX",
      address: "0x6B4712AE9797C199edd44F897cA09BC57628a1CF",
      chainId: 8453,
      decimals: 18,
      logoURI: "",
    },
    tags: [],
  },
  "0x0A074378461FB7ed3300eA638c6Cc38246db4434": {
    decimals: 18,
    symbol: "EDE",
    name: "El Dorado Exchange",
    isNative: false,
    isToken: true,
    chainId: 8453,
    address: "0x0A074378461FB7ed3300eA638c6Cc38246db4434",
    tokenInfo: {
      name: "El Dorado Exchange",
      symbol: "EDE",
      address: "0x0A074378461FB7ed3300eA638c6Cc38246db4434",
      chainId: 8453,
      decimals: 18,
      logoURI: "",
    },
    tags: [],
  },
  "0xB79DD08EA68A908A97220C76d19A6aA9cBDE4376": {
    decimals: 6,
    symbol: "USD+",
    name: "USD+",
    isNative: false,
    isToken: true,
    chainId: 8453,
    address: "0xB79DD08EA68A908A97220C76d19A6aA9cBDE4376",
    tokenInfo: {
      name: "USD+",
      symbol: "USD+",
      address: "0xB79DD08EA68A908A97220C76d19A6aA9cBDE4376",
      chainId: 8453,
      decimals: 6,
      logoURI: "",
    },
    tags: [],
  },
  "0x65a2508C429a6078a7BC2f7dF81aB575BD9D9275": {
    decimals: 18,
    symbol: "DAI+",
    name: "DAI+",
    isNative: false,
    isToken: true,
    chainId: 8453,
    address: "0x65a2508C429a6078a7BC2f7dF81aB575BD9D9275",
    tokenInfo: {
      name: "DAI+",
      symbol: "DAI+",
      address: "0x65a2508C429a6078a7BC2f7dF81aB575BD9D9275",
      chainId: 8453,
      decimals: 18,
      logoURI: "",
    },
    tags: [],
  },
  "0x4788de271F50EA6f5D5D2a5072B8D3C61d650326": {
    decimals: 18,
    symbol: "BASIN",
    name: "Basin Protocol",
    isNative: false,
    isToken: true,
    chainId: 8453,
    address: "0x4788de271F50EA6f5D5D2a5072B8D3C61d650326",
    tokenInfo: {
      name: "Basin Protocol",
      symbol: "BASIN",
      address: "0x4788de271F50EA6f5D5D2a5072B8D3C61d650326",
      chainId: 8453,
      decimals: 18,
      logoURI: "",
    },
    tags: [],
  },
  "0xAB8a1c03b8E4e1D21c8Ddd6eDf9e07f26E843492": {
    decimals: 18,
    symbol: "OGRE",
    name: "Ogre",
    isNative: false,
    isToken: true,
    chainId: 8453,
    address: "0xAB8a1c03b8E4e1D21c8Ddd6eDf9e07f26E843492",
    tokenInfo: {
      name: "Ogre",
      symbol: "OGRE",
      address: "0xAB8a1c03b8E4e1D21c8Ddd6eDf9e07f26E843492",
      chainId: 8453,
      decimals: 18,
      logoURI: "",
    },
    tags: [],
  },
  "0xEB466342C4d449BC9f53A865D5Cb90586f405215": {
    decimals: 6,
    symbol: "axlUSDC",
    name: "axlUSDC",
    isNative: false,
    isToken: true,
    chainId: 8453,
    address: "0xEB466342C4d449BC9f53A865D5Cb90586f405215",
    tokenInfo: {
      name: "axlUSDC",
      symbol: "axlUSDC",
      address: "0xEB466342C4d449BC9f53A865D5Cb90586f405215",
      chainId: 8453,
      decimals: 6,
      logoURI: "",
    },
    tags: [],
  },
  "0x4200000000000000000000000000000000000006": {
    decimals: 18,
    symbol: "WETH",
    name: "Wrapped Ether",
    isNative: false,
    isToken: true,
    chainId: 8453,
    address: "0x4200000000000000000000000000000000000006",
    tokenInfo: {
      name: "Wrapped Ether",
      symbol: "WETH",
      address: "0x4200000000000000000000000000000000000006",
      chainId: 8453,
      decimals: 18,
      logoURI: "https://pancakeswap.finance/images/tokens/0x2170Ed0880ac9A755fd29B2688956BD959F933F8.png",
    },
    tags: [],
  },
  "0x58Ed4FD0C3d930b674BA50a293f03ef6cD7dE7a3": {
    decimals: 18,
    symbol: "ARX",
    name: "Arbidex",
    isNative: false,
    isToken: true,
    chainId: 8453,
    address: "0x58Ed4FD0C3d930b674BA50a293f03ef6cD7dE7a3",
    tokenInfo: {
      name: "Arbidex",
      symbol: "ARX",
      address: "0x58Ed4FD0C3d930b674BA50a293f03ef6cD7dE7a3",
      chainId: 8453,
      decimals: 18,
      logoURI: "https://baseswap.fi/images/tokens/0x58Ed4FD0C3d930b674BA50a293f03ef6cD7dE7a3.png",
    },
    tags: [],
  },
  "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913": {
    decimals: 6,
    symbol: "USDC",
    name: "USDC Stablecoin",
    isNative: false,
    isToken: true,
    chainId: 8453,
    address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    tokenInfo: {
      name: "USDC Stablecoin",
      symbol: "USDC",
      address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      chainId: 8453,
      decimals: 6,
      logoURI: "https://baseswap.fi/images/tokens/0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913.png",
    },
    tags: [],
  },
  "0x4621b7A9c75199271F773Ebd9A499dbd165c3191": {
    decimals: 6,
    symbol: "DOLA",
    name: "DOLA USD Stablecoin",
    isNative: false,
    isToken: true,
    chainId: 8453,
    address: "0x4621b7A9c75199271F773Ebd9A499dbd165c3191",
    tokenInfo: {
      name: "DOLA USD Stablecoin",
      symbol: "DOLA",
      address: "0x4621b7A9c75199271F773Ebd9A499dbd165c3191",
      chainId: 8453,
      decimals: 6,
      logoURI: "18",
    },
    tags: [],
  },
  "0x1A9132ee02d7E98e51b7389D2e7BB537184867Aa": {
    decimals: 18,
    symbol: "BULLRUN",
    name: "BullRun",
    isNative: false,
    isToken: true,
    chainId: 8453,
    address: "0x1A9132ee02d7E98e51b7389D2e7BB537184867Aa",
    tokenInfo: {
      name: "BullRun",
      symbol: "BULLRUN",
      address: "0x1A9132ee02d7E98e51b7389D2e7BB537184867Aa",
      chainId: 8453,
      decimals: 18,
      logoURI: "",
    },
    tags: [],
  },
  "0xbf1aeA8670D2528E08334083616dD9C5F3B087aE": {
    decimals: 18,
    symbol: "MAI",
    name: "MAI Stablecoin ",
    isNative: false,
    isToken: true,
    chainId: 8453,
    address: "0xbf1aeA8670D2528E08334083616dD9C5F3B087aE",
    tokenInfo: {
      name: "MAI Stablecoin ",
      symbol: "MAI",
      address: "0xbf1aeA8670D2528E08334083616dD9C5F3B087aE",
      chainId: 8453,
      decimals: 18,
      logoURI: "",
    },
    tags: [],
  },
};
