import { TWAP } from "@orbs-network/twap-ui-dragonswap";
import tokens from "./token.json";
import { useMarketPrice, usePriceUSD, useRefetchBalances, useTokenBalance } from "../hooks";
import { Popup, TokensList, UISelector } from "../Components";
import { useCallback, useEffect, useMemo, useState } from "react";
import MuiTooltip from "@mui/material/Tooltip";
import { TooltipProps, Configs, TokensListModalProps, ModalProps, Widget } from "@orbs-network/twap-ui";
import { Panels, useDappContext } from "../context";
import { eqIgnoreCase, getNetwork, networks } from "@orbs-network/twap-sdk";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount, useWalletClient } from "wagmi";
const config = Configs.DragonSwap;

export const useDappTokens = () => {
  const nativeToken = getNetwork(config.chainId)?.native;
  return useMemo(() => {
    return tokens.tokens
      .filter((it: any) => it.chainId === config?.chainId)
      .map((t: any) => ({
        ...t,
        logoURI: `https://dzyb4dm7r8k8w.cloudfront.net/prod/logos/${t.address}/logo.png`,
      }));
  }, [nativeToken, config?.chainId]);
};

const TokensListModal = ({ isOpen, onSelect, onClose }: TokensListModalProps) => {
  return (
    <Popup isOpen={isOpen} onClose={onClose}>
      <TokensList onClick={onSelect} />
    </Popup>
  );
};

const Modal = (props: ModalProps) => {
  return (
    <Popup isOpen={props.isOpen} onClose={props.onClose}>
      <div>{props.children}</div>
    </Popup>
  );
};

const useUSD = (address?: string) => {
  const res = usePriceUSD(address);
  return res?.toString();
};

const Tooltip = (props: TooltipProps) => {
  return (
    <MuiTooltip title={props.tooltipText} arrow>
      <span>{props.children}</span>
    </MuiTooltip>
  );
};

const TWAPComponent = ({ limit }: { limit?: boolean }) => {
  const { address: account, chainId } = useAccount();
  const client = useWalletClient();
  const { openConnectModal } = useConnectModal();
  const dappTokens = useDappTokens();
  const { theme } = useDappContext();
  const [fromToken, setFromToken] = useState<any>(undefined);
  const [toToken, setToToken] = useState<any>(undefined);

  useEffect(() => {
    setFromToken(undefined);
    setToToken(undefined);
  }, [chainId]);

  useEffect(() => {
    if (!fromToken) {
      setFromToken(dappTokens?.[1]);
    }
    if (!toToken) {
      setToToken(dappTokens?.[3]);
    }
  }, [dappTokens, toToken, fromToken]);

  const onSwitchTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
  };

  const { outAmount, isLoading } = useMarketPrice(fromToken, toToken);

  const onSwitchFromNativeToWtoken = useCallback(() => {
    const wToken = Object.values(networks).find((it) => it.id === chainId)?.wToken.address;
    const token = dappTokens.find((it: any) => eqIgnoreCase(it.address, wToken || ""));
    if (token) {
      setFromToken(token);
    }
  }, [dappTokens, chainId]);

  const srcUsd = useUSD(fromToken?.address);
  const dstUsd = useUSD(toToken?.address);
  const srcBalance = useTokenBalance(fromToken).data?.wei;
  const dstBalance = useTokenBalance(toToken).data?.wei;
  const refetchBalances = useRefetchBalances();

  return (
    <TWAP
      title={limit ? "Limit" : "TWAP"}
      account={account as string}
      walletClientTransport={client.data?.transport}
      srcTokenAddress={fromToken?.address}
      dstTokenAddress={toToken?.address}
      dexTokens={dappTokens}
      isDarkTheme={theme === "dark"}
      marketPrice={outAmount}
      marketPriceLoading={isLoading}
      chainId={chainId}
      isLimitPanel={limit}
      srcUsd1Token={srcUsd ? Number(srcUsd) : 0}
      dstUsd1Token={dstUsd ? Number(dstUsd) : 0}
      components={{ Tooltip, TokensListModal, Modal }}
      isExactAppoval={true}
      minChunkSizeUsd={4}
      srcBalance={srcBalance}
      dstBalance={dstBalance}
      actions={{
        onSwitchFromNativeToWrapped: onSwitchFromNativeToWtoken,
        onSwitchTokens,
        onSrcTokenSelect: setFromToken,
        onDstTokenSelect: setToToken,
        refetchBalances,
        onConnect: openConnectModal,
      }}
    />
  );
};

export const Dragonswap = () => {
  const { panel } = useDappContext();
  return (
    <div>
      <div>
        <UISelector />
        <TWAPComponent limit={panel === Panels.LIMIT} />
        <Widget.PoweredByOrbs />
        <Widget.Orders />
        <Widget.LimitPriceWarning />
      </div>
    </div>
  );
};
