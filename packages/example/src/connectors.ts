import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";

export const injected = new InjectedConnector({});

export enum ConnectionType {
  WALLET_CONNECT = "walletconnect",
  COINBASE = "coinbase",
  INJECTED = "injected",
}

export type Connection = {
  connector: Connector;
  title: string;
  image: string;
  id: ConnectionType;
  mobileCompatible: boolean;
};

export const wallets: Connection[] = [
  {
    image: "",
    title: "Metamask",
    connector: injected,
    id: ConnectionType.INJECTED,
    mobileCompatible: false,
  },
];

export type Connector = InjectedConnector;

export const getConnection = (id: ConnectionType) => {
  return wallets.find((c) => c.id === id);
};
