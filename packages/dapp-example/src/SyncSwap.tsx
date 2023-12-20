import { StyledModalContent, StyledQuickswapLayout, StyledSyncSwap, StyledSyncSwapBox } from "./styles";
import { useConnectWallet, useGetTokens } from "./hooks";
import { Configs } from "@orbs-network/twap";
import { useWeb3React } from "@web3-react/core";
import { Dapp, TokensList, UISelector } from "./Components";
import { Popup } from "./Components";
import { useCallback, useEffect, useState } from "react";
import _ from "lodash";
import { SelectorOption, TokenListItem } from "./types";
import { TWAP, Orders } from "@orbs-network/twap-ui-syncswap";
import { erc20s, zeroAddress, isNativeAddress } from "@defi.org/web3-candies";
import { create } from "zustand";
import { Styles } from "@orbs-network/twap-ui";
import { Button, styled } from "@mui/material";
import BN from "bignumber.js";
const config = Configs.SyncSwap;

const palletes = [
  {
    name: "light",
    options: {
      normal: "#060828",
      primary: "#5155a6", // #4E529A // zkSync official color darker
      secondary: "#474ba3", // #4E529A #494c91
      banner: "#e4e2ff",

      overlay: "#ffffff",
      overlay2: "#F6F5FA",
      //overlay3: '#f0f0f5',

      error: "#d50000",
      info: "#6f7183", // rgb(110, 114, 125)
      light: "#e5e5e5",
      light2: "#dbdbdb",
      disable: "#505050",

      background: "theme-background-light",
      banner2: "theme-banner-light",
      portfolio: "theme-portfolio-light",
    },
  },
  {
    name: "bitcoin",
    options: {
      normal: "#000000",
      primary: "#e06f00",
      secondary: "#d17c17",
      banner: "#ffefdc",

      overlay: "#ffffff",
      overlay2: "#fff8e7",
      //overlay3: '#fffaed',

      error: "#d50000",
      info: "#737373",
      light: "#e3e3e3",
      light2: "#dbdbdb",
      disable: "#636363",

      background: "theme-background-bitcoin",
      banner2: "theme-banner-bitcoin",
      portfolio: "theme-portfolio-bitcoin",
    },
  },
  {
    name: "green",
    options: {
      normal: "#000000",
      primary: "#1b6b31",
      secondary: "#009104",
      banner: "#edffed",

      overlay: "#ffffff",
      overlay2: "#eff9ec",
      //overlay3: '#ecf5eb',

      error: "#d50000",
      info: "#737373",
      light: "#e3e3e3",
      light2: "#dbdbdb",
      disable: "#5a5a5a",

      background: "theme-background-green",
      banner2: "theme-banner-green",
      portfolio: "theme-portfolio-green",
    },
  },
  {
    name: "sakura",
    options: {
      normal: "#3a0010",
      primary: "#d62f6c",
      secondary: "#e3547d",
      banner: "#ffe5eb",

      overlay: "#ffffff",
      overlay2: "#fff4fa",
      //overlay3: '#fff6fe',

      error: "#d50000",
      info: "#815b69",
      light: "#e3e3e3",
      light2: "#dbdbdb",
      disable: "#878085",

      background: "theme-background-pink",
      banner2: "theme-banner-pink",
      portfolio: "theme-portfolio-pink",
    },
  },
  {
    name: "dark",
    options: {
      normal: "#dfdfe9",
      primary: "#aab3ff",
      secondary: "#4b519f",
      banner: "#191634",

      overlay: "#20213e",
      overlay2: "#181932",
      //overlay3: '#25274d',

      error: "#d50000",
      info: "#bcbed5",
      light: "#282b48",
      light2: "#424566",
      disable: "#b9b9b9",

      background: "theme-background-dark",
      banner2: "theme-banner-dark",
      portfolio: "theme-portfolio-dark",
    },
  },
];

export const parseList = (rawList?: any): TokenListItem[] => {
  return _.map(rawList, (rawToken) => {
    return {
      token: {
        address: rawToken.address,
        decimals: rawToken.decimals ?? 18,
        symbol: rawToken.symbol,
        logoUrl: isNativeAddress(rawToken.address) ? config.nativeToken.logoUrl : `https://tokens.syncswap.xyz/tokens/${rawToken.address}/logo.png`,
      },
      rawToken,
    };
  });
};

const TokenSelectModal = () => {
  const store = useStore();

  return (
    <Popup isOpen={store.showTokenSelectModal} onClose={store.closeTokenSelectModal}>
      <StyledModalContent>
        <TokensList
          tokens={parsedList}
          onClick={(token) => {
            if (store.type === 0) store.setSrcToken(token.address);
            else store.setDstToken(token.address);
            store.closeTokenSelectModal();
          }}
        />
      </StyledModalContent>
    </Popup>
  );
};

interface UseStore {
  openTokenSelectModal: (type?: number) => void;
  closeTokenSelectModal: () => void;
  showTokenSelectModal: boolean;
  srcToken?: string;
  dstToken?: string;
  setSrcToken: (token: string) => void;
  setDstToken: (token: string) => void;
  type: number;
  selectedPallete: any;
  setSelectedPallete: (pallete: any) => void;
}

const useStore = create<UseStore>((set) => ({
  showTokenSelectModal: false,
  type: 0,
  openTokenSelectModal: (type) => set({ showTokenSelectModal: true, type }),
  closeTokenSelectModal: () => set({ showTokenSelectModal: false }),
  setSrcToken: (token) => set({ srcToken: token }),
  setDstToken: (token) => set({ dstToken: token }),
  setSelectedPallete: (pallete) => set({ selectedPallete: pallete }),
  srcToken: "ETH",
  dstToken: "USDC",
  selectedPallete: palletes[0],
}));

const usePallete = () => {
  const { setSelectedPallete, selectedPallete } = useStore();
  return {
    pallete: selectedPallete,
    setPallete: setSelectedPallete,
  };
};

const useGasPrice = () => {
  const { library } = useWeb3React();
  return useCallback(async () => {
    return library?.eth.getGasPrice();
  }, [library]);
};

const TWAPComponent = ({ limit }: { limit?: boolean }) => {
  const { account, library } = useWeb3React();
  const connect = useConnectWallet();
  const store = useStore();
  const { data: tokens } = useDappTokens();
  const palette = usePallete().pallete.options;
  const getGasPrice = useGasPrice();

  return (
    <>
      <TWAP
        connect={connect}
        themeOptions={palette}
        account={account}
        srcToken={store.srcToken}
        dstToken={store.dstToken}
        dappTokens={tokens}
        getProvider={() => library}
        useGasPrice={library ? getGasPrice : undefined}
        limit={limit}
        openTokenSelectModal={store.openTokenSelectModal}
      />
      <TokenSelectModal />
    </>
  );
};

const Palletes = () => {
  const { setPallete, pallete } = usePallete();
  return (
    <Styles.StyledRowFlex>
      {palletes.map((it) => {
        const selected = it.name === pallete.name;
        return (
          <StyledPalleteOption selected={selected ? 1 : 0} _color={pallete.options.primary} variant="text" key={it.name} onClick={() => setPallete(it)}>
            {it.name}
          </StyledPalleteOption>
        );
      })}
    </Styles.StyledRowFlex>
  );
};

const StyledPalleteOption = styled(Button)<{ _color: string; selected: number }>(({ _color, selected }) => ({
  borderRadius: 0,
  cursor: "pointer",
  margin: 5,
  color: _color,
  borderBottom: selected ? `1px solid ${_color}!important` : "",
}));

const logo = "https://syncswap.xyz/images/syncswap.svg";
const DappComponent = () => {
  const [selected, setSelected] = useState(SelectorOption.TWAP);
  const pallete = usePallete().pallete.options;

  return (
    <StyledSyncSwap className={pallete.background} color={pallete.normal}>
      <Palletes />
      <StyledQuickswapLayout name={config.name}>
        <UISelector select={setSelected} selected={selected} limit={true} />
        <StyledSyncSwapBox>
          <TWAPComponent limit={selected === SelectorOption.LIMIT} />
        </StyledSyncSwapBox>
        <StyledSyncSwapBox>
          <Orders />
        </StyledSyncSwapBox>
      </StyledQuickswapLayout>
    </StyledSyncSwap>
  );
};

const dapp: Dapp = {
  Component: DappComponent,
  logo,
  config,
  workInProgress: true,
};

export default dapp;

const dappTokens = [
  {
    address: zeroAddress,
    symbol: "ETH",
    decimals: 18,
    name: "Ethereum",
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    address: "0x3355df6d4c9c3035724fd0e3914de96a5a83aaf4",
    decimals: 6,
  },
  {
    symbol: "USDT",
    name: "Tether USD",
    address: "0x493257fd37edb34451f62edf8d2a0c418852ba4c",
    decimals: 6,
  },
  {
    symbol: "ceBUSD",
    name: "Celer Network BUSD",
    address: "0x2039bb4116b4efc145ec4f0e2ea75012d6c0f181",
    bridgable: false,
  },
  {
    symbol: "WBTC",
    name: "Wrapped BTC",
    address: "0xbbeb516fb02a01611cbbe0453fe3c580d7281011",
    decimals: 8,
  },
  {
    symbol: "DAI",
    name: "DAI Stablecoin",
    address: "0x4b9eb6c0b6ea15176bbf62841c6b2a8a398cb656",
  },
  {
    symbol: "zkUSD",
    name: "zkUSD Dollar",
    address: "0xfc7e56298657b002b3e656400e746b7212912757",
    decimals: 6,
    bridgable: false,
  },
  {
    symbol: "LUSD",
    name: "LUSD Stablecoin",
    address: "0x503234f203fc7eb888eec8513210612a43cf6115",
  },
  {
    symbol: "Cheems",
    name: "Cheems Token",
    address: "0xd599da85f8fc4877e61f547dfacffe1238a7149e",
    bridgable: false,
  },
  {
    symbol: "DVF",
    name: "Rhino.fi",
    address: "0xbbd1ba24d589c319c86519646817f2f153c9b716",
  },
  {
    symbol: "GOVI",
    name: "GOVI",
    address: "0xd63ef5e9c628c8a0e8984cdfb7444aee44b09044",
  },
  {
    symbol: "uGOLD",
    name: "Holdstation Gold",
    address: "0x10d967f46b06580c4a87b05c78f04e4df25c0db0",
    bridgable: false,
  },
  {
    symbol: "FUL",
    name: "Fulcrom Finance",
    address: "0xe593853b4d603d5b8f21036bb4ad0d1880097a6e",
    bridgable: false,
  },
  {
    symbol: "KAT",
    name: "KaratDAO",
    address: "0xcdb7d260c107499c80b4b748e8331c64595972a1",
    bridgable: false,
  },
  {
    symbol: "PIKO",
    name: "Pinnako",
    address: "0xf8c6da1bbdc31ea5f968ace76e931685ca7f9962",
    bridgable: false,
  },
  {
    symbol: "OT",
    name: "Onchain Trade",
    address: "0xd0ea21ba66b67be636de1ec4bd9696eb8c61e9aa",
    bridgable: false,
  },
  {
    symbol: "SIS",
    name: "Symbiosis",
    address: "0xdd9f72afed3631a6c85b5369d84875e6c42f1827",
  },
  {
    symbol: "ZZ",
    name: "ZigZag",
    address: "0x1ab721f531cab4c87d536be8b985eafce17f0184",
  },
  {
    symbol: "USD+",
    name: "USD+",
    address: "0x8e86e46278518efc1c5ced245cba2c7e3ef11557",
    decimals: 6,
    bridgable: false,
  },
  {
    symbol: "MAV",
    name: "Maverick",
    address: "0x787c09494ec8bcb24dcaf8659e7d5d69979ee508",
    bridgable: false,
  },
  {
    symbol: "ZAT",
    name: "zkApes Token",
    address: "0x47ef4a5641992a72cfd57b9406c9d9cefee8e0c4",
    bridgable: false,
  },
  {
    symbol: "MUTE",
    name: "Mute",
    address: "0x0e97c7a0f8b2c9885c8ac9fc6136e829cbc21d42",
  },
  {
    symbol: "rETH",
    name: "Rocket Pool ETH",
    address: "0x32fd44bb869620c0ef993754c8a00be67c464806",
  },
  {
    symbol: "FRAX",
    name: "Frax",
    address: "0xb4c1544cb4163f4c2eca1ae9ce999f63892d912a",
    bridgable: false,
  },
  {
    symbol: "frxETH",
    name: "Frax Ether",
    address: "0xb54aae4a0743aeec1d584f2b2abc1ebdc12f1b0f",
    bridgable: false,
  },
  {
    symbol: "cbETH",
    name: "Coinbase Wrapped Staked ETH",
    address: "0x75af292c1c9a37b3ea2e6041168b4e48875b9ed5",
  },
  {
    symbol: "crvUSD",
    name: "Curve USD Stablecoin",
    address: "0x43cd37cc4b9ec54833c8ac362dd55e58bfd62b86",
  },
  {
    symbol: "wTBT",
    name: "Wrapped TProtocol T-Bill",
    address: "0xd90764041da2720396863836e9f78ddaee140533",
  },
  {
    symbol: "TiUSD",
    name: "TiTi USD on zkSync",
    address: "0xc059767cb62f003e863f9e7bd1fc813beff9693c",
    bridgable: false,
  },
  {
    symbol: "TiTi",
    name: "TiTi Protocol",
    address: "0x4ebfb78c4780c304dff7de518db630b67e3f044b",
  },
  {
    symbol: "ceMATIC",
    name: "Celer Network MATIC",
    address: "0x28a487240e4d45cff4a2980d334cc933b7483842",
    bridgable: false,
  },
  {
    symbol: "ceBNB",
    name: "Celer Network BNB",
    address: "0x7400793aad94c8ca801aa036357d10f5fd0ce08f",
    bridgable: false,
  },
  {
    symbol: "ceAVAX",
    name: "Celer Network AVAX",
    address: "0x6a5279e99ca7786fb13f827fc1fb4f61684933d6",
    bridgable: false,
  },
  {
    symbol: "WEFI",
    name: "WeFi",
    address: "0x81e7186947fb59aaaaeb476a47daac60680cbbaf",
    bridgable: false,
  },
  {
    symbol: "ERA",
    name: "ERA Name Service",
    address: "0xecd9f240ed3895c77db676004328dd1d246f33c9",
    bridgable: false,
  },
  {
    symbol: "Beany",
    name: "Beanycoin",
    address: "0xc65364c35d8e2aaba17d00e468c29576f3ec105c",
    bridgable: false,
  },
  {
    symbol: "PVP",
    name: "PvP Bot",
    address: "0xbcf7da740a4d3e5b6b92f32167d1ee48a422f955",
    bridgable: false,
    decimals: 6,
  },
  {
    symbol: "SNRK",
    name: "Snark Launch",
    address: "0x533b5f887383196c6bc642f83338a69596465307",
    bridgable: false,
  },
  {
    symbol: "PEPE",
    name: "Pepe",
    address: "0xfd282f16a64c6d304ac05d1a58da15bed0467c71",
  },
  {
    symbol: "LSD",
    name: "LSDx Finance",
    address: "0x458a2e32eabc7626187e6b75f29d7030a5202bd4",
  },
  {
    symbol: "VC",
    name: "Velocore",
    address: "0x85d84c774cf8e9ff85342684b0e795df72a24908",
    bridgable: false,
  },
  {
    symbol: "SPACE",
    name: "SpaceFi",
    address: "0x47260090ce5e83454d5f05a0abbb2c953835f777",
    bridgable: false,
  },
  {
    symbol: "VS",
    name: "veSync Finance",
    address: "0x5756a28e2aae01f600fc2c01358395f5c1f8ad3a",
    bridgable: false,
  },
  {
    symbol: "iZi",
    name: "iZUMi",
    address: "0x16a9494e257703797d747540f01683952547ee5b",
    bridgable: false,
  },
  {
    symbol: "TES",
    name: "Tiny Era Shard",
    address: "0xcab3f741fa54e79e34753b95717b23018332b8ac",
    bridgable: false,
  },
  {
    symbol: "TINC",
    name: "Tiny Coin",
    address: "0x5f018e9d51b167aa5eec28037199767b2b31dcb0",
    bridgable: false,
  },
  {
    symbol: "PEPERA",
    name: "Pepera",
    address: "0x60143f39b54a731ac790708c8719211878e638c3",
    bridgable: false,
  },
  {
    symbol: "DOGERA",
    name: "Dogera",
    address: "0xa59af353e423f54d47f2ce5f85e3e265d95282cd",
    bridgable: false,
  },
  {
    symbol: "ZKDOGE",
    name: "zkDOGE",
    address: "0xbfb4b5616044eded03e5b1ad75141f0d9cb1499b",
    bridgable: false,
  },
  {
    symbol: "ZPC",
    name: "ZenPandaCoin",
    address: "0x4be6f11ee1310ecf29a9d0130a12a9d0885e0c92",
    bridgable: false,
  },
  {
    symbol: "DCA",
    name: "AutoDCA",
    address: "0x8b69a4e5aeb67858e3d03d0124176e85c3dfa51d",
    hidden: true,
    bridgable: false,
  },
  {
    symbol: "Array",
    name: "Array",
    address: "0x6068ad384b4d330d4de77f47041885956c9f32a3",
    bridgable: false,
    hidden: true,
  },
  {
    symbol: "WETH",
    name: "Wrapped Ethereum",
    address: "0x5aea5775959fbc2557cc8789bc1bf90a239d9a91",
    bridgable: false,
  },
  {
    symbol: "IBEX",
    name: "Impermax",
    address: "0xbe9f8c0d6f0fd7e46cdacca340747ea2f247991d",
    hidden: true,
  },
  {
    symbol: "ZKSPAD",
    name: "ZKSPad",
    address: "0x68a682b4dcadc5d483457ab0454b65d4ab78955e",
    hidden: true,
    bridgable: false,
  },
  {
    symbol: "ZKDC",
    name: "zkDucks",
    address: "0xe2c55af390a0f82dd3fe29d6b31df2f756f7decd",
    hidden: true,
    bridgable: false,
  },
];
const parsedList = parseList(dappTokens);

export const useDappTokens = () => {
  return useGetTokens({
    chainId: config.chainId,
    parse: parseList,
    baseAssets: erc20s.SyncSwap,
    tokens: dappTokens,
    modifyList: (list) => {
      return list.map((item: TokenListItem) => {
        return item.token;
      });
    },
  });
};
