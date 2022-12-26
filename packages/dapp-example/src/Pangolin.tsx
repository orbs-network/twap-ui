import { Orders, PangolinOrdersProps, PangolinTWAPProps, TWAP } from "@orbs-network/twap-ui-pangolin";
import { DappLayout, Popup } from "./Components";
import { StyledLayoutPangolin, StyledModalList, StyledModalListItem } from "./styles";
import _ from "lodash";
import { erc20s } from "@defi.org/web3-candies";
import { useWeb3React } from "@web3-react/core";
import { useQuery } from "@tanstack/react-query";
import { Configs } from "@orbs-network/twap";
import { Dapp } from "./Components";
import { useConnectWallet, useNetwork, useTheme } from "./hooks";
import { Components } from "@orbs-network/twap-ui";

interface TokenSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCurrencySelect: (token: any) => void;
}

const config = Configs.Pangolin;

const nativeToken = {
  decimals: 18,
  name: "Avalanche",
  symbol: "AVAX",
  "_constructor-name_": "Currency",
};

const nativeTokenLogo = "https://raw.githubusercontent.com/pangolindex/sdk/master/src/images/chains/avax.png";

const chainId = config.chainId;

const useDappTokens = () => {
  const { account } = useWeb3React();
  const { isInValidNetwork } = useNetwork(chainId);

  return useQuery(
    ["useDappTokens", chainId],
    async () => {
      const response = await fetch(`https://raw.githubusercontent.com/pangolindex/tokenlists/main/pangolin.tokenlist.json`);
      const tokenList = await response.json();

      const parsed = tokenList.tokens.map(({ symbol, address, decimals, logoURI, name }: any) => ({
        decimals,
        symbol,
        name,
        chainId,
        address,
        tokenInfo: { symbol, address, decimals, logoURI: (logoURI as string)?.replace("/logo_24.png", "/logo_48.png"), name, chainId },
        tags: [],
      }));
      const candiesAddresses = _.map(erc20s.avax, (t) => t().address);

      const _tokens = _.sortBy(parsed, (t: any) => {
        const index = candiesAddresses.indexOf(t.address);
        return index >= 0 ? index : Number.MAX_SAFE_INTEGER;
      });

      return { native: nativeToken, ..._.mapKeys(_tokens, (t) => t.address) };
    },
    {
      enabled: !!account && !isInValidNetwork,
    }
  );
};

const TokenSelectModal = ({ isOpen, onClose, onCurrencySelect }: TokenSelectModalProps) => {
  const { data: tokensList } = useDappTokens();

  if (!tokensList) return null;

  return (
    <Popup isOpen={isOpen} onClose={onClose}>
      <StyledModalList>
        {_.map(tokensList, (token: any) => {
          if (!token.tokenInfo) {
            return (
              <StyledModalListItem onClick={() => onCurrencySelect(token)} key={token.symbol}>
                <img src={nativeTokenLogo} width={20} height={20} alt="" />
                {token.symbol}
              </StyledModalListItem>
            );
          }
          return (
            <StyledModalListItem onClick={() => onCurrencySelect(token)} key={token.tokenInfo.address}>
              <Components.TokenLogo
                logo={token.tokenInfo.logoURI}
                alt={token.tokenInfo.symbol}
                style={{
                  width: 30,
                  height: 30,
                }}
              />
              {token.tokenInfo.symbol}
            </StyledModalListItem>
          );
        })}
      </StyledModalList>
    </Popup>
  );
};
const logo = "https://s2.coinmarketcap.com/static/img/coins/64x64/8422.png";
const DappComponent = () => {
  const { account, library: provider, chainId } = useWeb3React();
  const { data: dappTokens } = useDappTokens();
  const { isDarkTheme } = useTheme();

  const connect = useConnectWallet();

  const twapProps: PangolinTWAPProps = {
    account,
    TokenSelectModal,
    srcToken: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7", //WAVAX
    dstToken: "0x340fE1D898ECCAad394e2ba0fC1F93d27c7b717A", // ORBS
    dappTokens,
    provider,
    onSrcTokenSelected: (token: any) => console.log(token),
    onDstTokenSelected: (token: any) => console.log(token),
    connect,
    connectedChainId: chainId,
    theme: isDarkTheme ? darkTheme : lightTheme,
  };
  const ordersProps: PangolinOrdersProps = { account, dappTokens, provider, isDarkTheme };

  return (
    <DappLayout name={config.partner}>
      <StyledLayoutPangolin mode={isDarkTheme ? "dark" : "light"}>
        <TWAP {...twapProps} />
      </StyledLayoutPangolin>
      <StyledLayoutPangolin mode={isDarkTheme ? "dark" : "light"}>
        <Orders {...ordersProps} />
      </StyledLayoutPangolin>
    </DappLayout>
  );
};

const dapp: Dapp = {
  Component: DappComponent,
  logo,
  config,
};

export default dapp;

const lightTheme = {
  white: "#FFFFFF",
  black: "#000000",
  text1: "#000000",
  text2: "#565A69",
  text3: "#888D9B",
  text4: "#C3C5CB",
  text5: "#EDEEF2",
  text6: "#EDEEF2",
  text7: "#000000",
  text8: "#565A69",
  text9: "#282828",
  text10: "#000000",
  text11: "#18C145",
  text12: "#E84142",
  text13: "#000000",
  text14: "#000000",
  text15: "#000000",
  bg1: "#FFFFFF",
  bg2: "#F7F8FA",
  bg3: "#EDEEF2",
  bg4: "#CED0D9",
  bg5: "#888D9B",
  bg6: "#FFFFFF",
  bg7: "#FFFFFF",
  bg8: "#FFFFFF",
  bg9: "#000000",
  modalBG: "rgba(0,0,0,0.3)",
  modalBG2: "rgba(0,0,0,0.8)",
  advancedBG: "rgba(255,255,255,0.6)",
  closeCircleBG: "rgba(0,0,0,0.2)",
  primary1: "#ffc800",
  primary2: "#FF6B00",
  primary3: "#FF6B00",
  primary4: "#FF6B00",
  primary5: "#FF6B00",
  primary6: "#FFFFFF",
  primaryText1: "#ffffff",
  secondary1: "#ff007a",
  secondary2: "#F6DDE8",
  secondary3: "#FDEAF1",
  red1: "#FF6871",
  red2: "#F82D3A",
  red3: "#E84142",
  red3Gradient: "rgba(232, 65, 66, 0.3)",
  green1: "#27AE60",
  green2: "#18C145",
  green2Gradient: " rgba(24, 193, 69, 0.3)",
  yellow1: "#FFE270",
  yellow2: "#FF6B00",
  yellow3: "#FFC800",
  orange1: "#E6E9EC",
  blue1: "#2172E5",
  avaxRed: "#E84142",
  colorBeta11: "#E67826",
  color22: "#707070",
  color33: "#FF6B00",
  primary: "#FFC800",
  mustardYellow: "#E1AA00",
  eerieBlack: "#1C1C1C",
  ghostWhite: "#F7F8FA",
  ghostWhite1: "#FAF9FD",
  chineseBlack: "#111111",
  darkGunmetal: "#212427",
  platinum: "#E5E5E5",
  darkSilver: "#717171",
  venetianRed: "#CC1512",
  oceanBlue: "#18C145",
  quickSilver: "#A3A3A3",
  error: "#CC1512",
  warning: "#F3841E",
  success: "#18C145",
  color2: "#F7F8FA",
  color3: "#E5E5E5",
  color4: "#111111",
  color5: "#FFFFFF",
  color6: "#111111",
  color7: "#F7F8FA",
  color8: "#E5E5E5",
  color9: "#A3A3A3",
  color10: "#FFFFFF",
  color11: "#000000",
  color12: "#E5E5E5",
  grids: {
    sm: 8,
    md: 12,
    lg: 24,
  },
  shadow1: "#2F80ED",
  mediaWidth: {},
  flexColumnNoWrap: ["\n      display: flex;\n      flex-flow: column nowrap;\n    "],
  flexRowNoWrap: ["\n      display: flex;\n      flex-flow: row nowrap;\n    "],
  swapWidget: {
    primary: "#000000",
    secondary: "#A3A3A3",
    backgroundColor: "#F7F8FA",
    detailsBackground: "#FFFFFF",
    interactiveColor: "#A3A3A3",
    interactiveBgColor: "#E5E5E5",
  },
  drawer: {
    text: "#000000",
    backgroundColor: "#F7F8FA",
  },
  textInput: {
    text: "#A3A3A3",
    labelText: "#A3A3A3",
    placeholderText: "#A3A3A3",
    backgroundColor: "#FFFFFF",
  },
  currencySelect: {
    defaultText: "#FFFFFF",
    selectedText: "#000000",
    defaultBackgroundColor: "#FFC800",
    selectedBackgroundColor: "#F7F8FA",
  },
  loader: {
    text: "#000000",
  },
  numberOptions: {
    text: "#000000",
    activeTextColor: "#000000",
    activeBackgroundColor: "#FFC800",
    inactiveBackgroundColor: "#F7F8FA",
    borderColor: "#FAF9FD",
  },
  switch: {
    onColor: "#FFC800",
    offColor: "#CED0D9",
    backgroundColor: "#E5E5E5",
  },
  toggleButton: {
    backgroundColor: "#E5E5E5",
    selectedColor: "#F7F8FA",
    fontColor: "#111111",
  },
  button: {
    primary: {
      background: "#FFC800",
      color: "#000000",
    },
    secondary: {
      background: "#111111",
      color: "#FFFFFF",
    },
    outline: {
      borderColor: "#FFC800",
      color: "#000000",
    },
    plain: {
      color: "#000000",
    },
    disable: {
      background: "#E5E5E5",
      color: "#717171",
    },
    confirmed: {
      background: "#18C145",
      color: "#18C145",
      borderColor: "#18C145",
    },
  },
  bridge: {
    primaryBgColor: "#FFFFFF",
    secondaryBgColor: "#F7F8FA",
    text: "#000000",
    infoIconColor: "#000000",
    routeInfoColor: "#E5E5E5",
    transferKeyColor: "#A3A3A3",
    loaderCloseIconColor: "#E1AA00",
    informationBoxesBackgroundColor: "#111111",
  },
  tabs: {
    tabColor: "#A3A3A3",
    tabListColor: "#000000",
    tabPanelBorderColor: "#A3A3A3",
  },
  dropdown: {
    color: "#000000",
    primaryBgColor: "#FFFFFF",
  },
  chainInput: {
    text: "#000000",
    primaryBgColor: "#F7F8FA",
  },
};

const darkTheme = {
  white: "#FFFFFF",
  black: "#000000",
  text1: "#FFFFFF",
  text2: "#C3C5CB",
  text3: "#6C7284",
  text4: "#565A69",
  text5: "#2C2F36",
  text6: "#111111",
  text7: "#e6e9ec",
  text8: "#707070",
  text9: "#282828",
  text10: "#FAF9FD",
  text11: "#18C145",
  text12: "#E84142",
  text13: "#A3A3A3",
  text14: "#8C8D93",
  text15: "#FFC800",
  bg1: "#212429",
  bg2: "#111111",
  bg3: "#40444F",
  bg4: "#565A69",
  bg5: "#6C7284",
  bg6: "#1c1c1c",
  bg7: "#2C2D33",
  bg8: "#212427",
  bg9: "#ffffff",
  modalBG: "rgba(0,0,0,.425)",
  modalBG2: "rgba(0,0,0,.8)",
  advancedBG: "rgba(0,0,0,0.1)",
  closeCircleBG: "rgba(255,255,255,0.2)",
  primary1: "#ffc800",
  primary2: "#FF6B00",
  primary3: "#FF6B00",
  primary4: "#FF6B00",
  primary5: "#FF6B00",
  primary6: "#FF6B00",
  primaryText1: "#6da8ff",
  secondary1: "#2172E5",
  secondary2: "#17000b26",
  secondary3: "#17000b26",
  red1: "#FF6871",
  red2: "#F82D3A",
  red3: "#E84142",
  red3Gradient: "rgba(232, 65, 66, 0.3)",
  green1: "#27AE60",
  green2: "#18C145",
  green2Gradient: " rgba(24, 193, 69, 0.3)",
  yellow1: "#FFE270",
  yellow2: "#FF6B00",
  yellow3: "#FFC800",
  orange1: "#E6E9EC",
  blue1: "#2172E5",
  avaxRed: "#E84142",
  colorBeta11: "#E67826",
  color22: "#707070",
  color33: "#FF6B00",
  primary: "#FFC800",
  mustardYellow: "#E1AA00",
  eerieBlack: "#1C1C1C",
  ghostWhite: "#F7F8FA",
  ghostWhite1: "#FAF9FD",
  chineseBlack: "#111111",
  darkGunmetal: "#212427",
  platinum: "#E5E5E5",
  darkSilver: "#717171",
  venetianRed: "#CC1512",
  oceanBlue: "#18C145",
  quickSilver: "#A3A3A3",
  error: "#CC1512",
  warning: "#F3841E",
  success: "#18C145",
  color2: "#111111",
  color3: "#1C1C1C",
  color4: "#FAF9FD",
  color5: "#212427",
  color6: "#FFFFFF",
  color7: "#212427",
  color8: "#111111",
  color9: "#717171",
  color10: "#1C1C1C",
  color11: "#FFFFFF",
  color12: "#717171",
  grids: {
    sm: 8,
    md: 12,
    lg: 24,
  },
  shadow1: "#000",
  mediaWidth: {},
  flexColumnNoWrap: ["\n      display: flex;\n      flex-flow: column nowrap;\n    "],
  flexRowNoWrap: ["\n      display: flex;\n      flex-flow: row nowrap;\n    "],
  swapWidget: {
    primary: "#FFFFFF",
    secondary: "#717171",
    backgroundColor: "#111111",
    detailsBackground: "#000000",
    interactiveColor: "#717171",
    interactiveBgColor: "#212427",
  },
  drawer: {
    text: "#FFFFFF",
    backgroundColor: "#111111",
  },
  textInput: {
    text: "#717171",
    labelText: "#717171",
    placeholderText: "#717171",
    backgroundColor: "#1C1C1C",
  },
  currencySelect: {
    defaultText: "#000000",
    selectedText: "#FFFFFF",
    defaultBackgroundColor: "#FFC800",
    selectedBackgroundColor: "#111111",
  },
  loader: {
    text: "#FFFFFF",
  },
  numberOptions: {
    text: "#FFFFFF",
    activeTextColor: "#000000",
    activeBackgroundColor: "#FFC800",
    inactiveBackgroundColor: "#111111",
    borderColor: "#FAF9FD",
  },
  switch: {
    onColor: "#FFC800",
    offColor: "#CED0D9",
    backgroundColor: "#717171",
  },
  toggleButton: {
    backgroundColor: "#717171",
    selectedColor: "#111111",
    fontColor: "#E5E5E5",
  },
  button: {
    primary: {
      background: "#FFC800",
      color: "#000000",
    },
    secondary: {
      background: "#111111",
      color: "#FFFFFF",
    },
    outline: {
      borderColor: "#FFC800",
      color: "#000000",
    },
    plain: {
      color: "#000000",
    },
    disable: {
      background: "#E5E5E5",
      color: "#717171",
    },
    confirmed: {
      background: "#18C145",
      color: "#18C145",
      borderColor: "#18C145",
    },
  },
  bridge: {
    primaryBgColor: "#1C1C1C",
    secondaryBgColor: "#111111",
    text: "#FFFFFF",
    infoIconColor: "#FFFFFF",
    routeInfoColor: "#717171",
    transferKeyColor: "#717171",
    loaderCloseIconColor: "#E1AA00",
    informationBoxesBackgroundColor: "#111111",
  },
  tabs: {
    tabColor: "#717171",
    tabListColor: "#FFFFFF",
    tabPanelBorderColor: "#717171",
  },
  dropdown: {
    color: "#FFFFFF",
    primaryBgColor: "#212427",
  },
  chainInput: {
    text: "#FFFFFF",
    primaryBgColor: "#111111",
  },
};
