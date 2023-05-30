import { TokenData, Configs } from "@orbs-network/twap";
import Web3 from "web3";
import { configureStyles } from "./styles";
import { isNativeAddress } from "@defi.org/web3-candies";

export const parseToken = (rawToken: any): TokenData | undefined => {
  const { config } = getConfig();
  if (!rawToken.symbol) {
    console.error("Invalid token", rawToken);
    return;
  }

  if (!rawToken.address || isNativeAddress(rawToken.address)) {
    return config.nativeToken;
  }

  return {
    address: Web3.utils.toChecksumAddress(rawToken.address),
    decimals: rawToken.decimals,
    symbol: rawToken.symbol,
    logoUrl: rawToken.tokenInfo ? rawToken.tokenInfo.logoURI : "",
  };
};

export const useGlobalStyles = (theme: any) => {
  return configureStyles(theme);
};

export const getConfig = (partnerDaas?: string) => {
  const _partnerDaas = partnerDaas && !isNativeAddress(partnerDaas) ? partnerDaas : undefined;
  const config = _partnerDaas ? Configs.PangolinDaas : Configs.Pangolin;

  return {
    partnerDaas: _partnerDaas,
    config,
  };
};
