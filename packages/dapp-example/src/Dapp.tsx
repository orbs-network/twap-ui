import { useTokenList, usePriceUSD, useMarketPrice, useTokenBalance, useRefetchBalances } from "./hooks";
import { Popup, TokensList, UISelector } from "./Components";
import { useCallback, useEffect, useMemo, useState } from "react";
import MuiTooltip from "@mui/material/Tooltip";
import { TooltipProps, TokensListModalProps, ModalProps, Widget, Token, UIPreferences } from "@orbs-network/twap-ui";
import { eqIgnoreCase, networks } from "@orbs-network/twap-sdk";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { Panels, useDappContext } from "./context";

const TokensListModal = ({ isOpen, onSelect, onClose }: TokensListModalProps) => {
  return (
    <Popup isOpen={isOpen} onClose={onClose} title="Token Select">
      <TokensList onClick={onSelect} />
    </Popup>
  );
};

const Modal = (props: ModalProps) => {
  return (
    <Popup isOpen={props.isOpen} onClose={props.onClose}>
      {props.children}
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

const useToken = (addressOrSymbol?: string) => {
  const tokens = useTokenList();

  return useMemo(() => {
    return tokens?.find((it: any) => eqIgnoreCase(it.address || "", addressOrSymbol || "") || eqIgnoreCase(it.symbol || "", addressOrSymbol || ""));
  }, [tokens, addressOrSymbol]);
};

const uiPreferences: UIPreferences = {
  input: { disableThousandSeparator: true, placeholder: "0.0" },
  usd: { prefix: "$" },
};

const TWAPComponent = ({ limit }: { limit?: boolean }) => {
  const { address: account, chainId } = useAccount();
  const { openConnectModal } = useConnectModal();
  const config = useDappContext().config;
  const dappTokens = useTokenList();
  const client = useWalletClient();
  const [srcToken, setSrcToken] = useState<Token | undefined>(undefined);
  const [dstToken, setDstToken] = useState<Token | undefined>(undefined);
  const { theme } = useDappContext();
  const refetchBalances = useRefetchBalances();

  useEffect(() => {
    setSrcToken(undefined);
    setDstToken(undefined);
  }, [chainId]);

  useEffect(() => {
    if (!srcToken) {
      setSrcToken(dappTokens[1]);
    }
    if (!dstToken) {
      setDstToken(dappTokens[2]);
    }
  }, [dappTokens, dstToken, srcToken]);

  const onSwitchTokens = () => {
    setSrcToken(dstToken);
    setDstToken(srcToken);
  };

  const onSwitchFromNativeToWtoken = useCallback(() => {
    const wToken = Object.values(networks).find((it) => it.id === chainId)?.wToken.address;
    const token = dappTokens?.find((it: any) => eqIgnoreCase(it.address, wToken || ""));
    if (token) {
      setSrcToken(token);
    }
  }, [dappTokens, chainId]);

  const { outAmount: marketPrice, isLoading: marketPriceLoading } = useMarketPrice(srcToken, dstToken);

  const srcUsd = useUSD(srcToken?.address);
  const dstUsd = useUSD(dstToken?.address);
  const srcBalance = useTokenBalance(srcToken).data?.wei;
  const dstBalance = useTokenBalance(dstToken).data?.wei;

  return (
    <Widget
      config={config}
      walletClientTransport={client.data?.transport}
      account={account as string}
      srcToken={srcToken}
      dstToken={dstToken}
      actions={{
        onSwitchFromNativeToWrapped: onSwitchFromNativeToWtoken,
        onSrcTokenSelect: setSrcToken,
        onDstTokenSelect: setDstToken,
        onConnect: openConnectModal,
        refetchBalances,
        onSwitchTokens,
      }}
      isLimitPanel={limit}
      uiPreferences={uiPreferences}
      srcUsd1Token={srcUsd ? Number(srcUsd) : 0}
      dstUsd1Token={dstUsd ? Number(dstUsd) : 0}
      srcBalance={srcBalance}
      dstBalance={dstBalance}
      marketPrice={marketPrice}
      marketPriceLoading={marketPriceLoading}
      chainId={chainId}
      isExactAppoval={true}
      components={{ Tooltip, TokensListModal, Modal }}
      useToken={useToken}
      includeStyles={true}
      isDarkTheme={theme === "dark"}
      minChunkSizeUsd={4}
      fee="0.25"
    >
      <Widget.SwapPanel />
    </Widget>
  );
};

export const Dapp = () => {
  const { panel } = useDappContext();
  return (
    <div className="dapp">
      <UISelector />
      <TWAPComponent limit={panel === Panels.LIMIT} />
    </div>
  );
};
