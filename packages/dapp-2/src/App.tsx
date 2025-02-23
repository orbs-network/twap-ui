import { wagmiConfig } from "./wagmi-config";
import {WagmiProvider} from "wagmi";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {RainbowKitProvider, ConnectButton} from "@rainbow-me/rainbowkit";
const queryClient = new QueryClient();
import '@rainbow-me/rainbowkit/styles.css';

console.log('test');


export function App() {

  return  <WagmiProvider config={wagmiConfig}>
  <QueryClientProvider client={queryClient}>
    <RainbowKitProvider>
        <ConnectButton />
    </RainbowKitProvider>
  </QueryClientProvider>
</WagmiProvider>
}
