import { InjectedConnector } from "@web3-react/injected-connector";
// import { WalletConnectConnector } from "@web3-react/walletconnect-connector";

export const injectedConnector = new InjectedConnector({});

// enum ConnectionType {
//   WALLET_CONNECT = "walletconnect",
//   COINBASE = "coinbase",
//   INJECTED = "injected",
// }

// type Connection = {
//   connector: InjectedConnector | WalletConnectConnector;
//   title: string;
//   image: string;
//   id: ConnectionType;
//   mobileCompatible: boolean;
// };

// const wallets: Connection[] = [
//   {
//     image: "",
//     title: "Metamask",
//     connector: injectedConnector,
//     id: ConnectionType.INJECTED,
//     mobileCompatible: false,
//   },
// ];

// const getConnection = (id: ConnectionType) => {
//   return wallets.find((c) => c.id === id);
// };
