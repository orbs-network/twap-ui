import { useTokenList, usePriceUSD, useMarketPrice, useTokenBalance, useRefetchBalances } from "./hooks";
import { Popup, TokensList, UISelector } from "./Components";
import { useCallback, useEffect, useMemo, useState } from "react";
import MuiTooltip from "@mui/material/Tooltip";
import {
  TooltipProps,
  TokenSelectModalProps,
  Widget,
  Token,
  OrderHistoryModalProps,
  OrderConfirmationModalProps,
  TokenLogoProps,
  LinkProps,
  SelectMenuProps,
  SelectMeuItem,
  ToggleProps,
} from "@orbs-network/twap-ui";
import { eqIgnoreCase, networks } from "@orbs-network/twap-sdk";
import { useAccount, useWalletClient } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { Panels, useDappContext } from "./context";
import { GlobalStyles } from "./dapp-styles";
import { Button, Menu, MenuItem, Switch } from "@mui/material";

const TokenSelectModal = ({ isOpen, onSelect, onClose }: TokenSelectModalProps) => {
  return (
    <Popup isOpen={isOpen} onClose={onClose} title="Token Select">
      <TokensList onClick={onSelect} />
    </Popup>
  );
};

const OrderHistoryModal = (props: OrderHistoryModalProps) => {
  return (
    <Popup isOpen={props.isOpen} onClose={props.onClose}>
      {props.children}
    </Popup>
  );
};

const OrderConfirmationModal = (props: OrderConfirmationModalProps) => {
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

const TokenLogo = ({ token }: TokenLogoProps) => {
  return <img src={token?.logoUrl} />;
};

const Link = ({ href, children }: LinkProps) => {
  return (
    <a href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
};

const Toggle = (props: ToggleProps) => {
  return <Switch checked={props.checked} onChange={props.onChange} />;
};

const SelectMenu = (props: SelectMenuProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (item: SelectMeuItem) => {
    props.onSelect(item);
    handleClose();
  };

  return (
    <div>
      <Button
        id="basic-button"
        variant="contained"
        aria-controls={open ? "basic-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
      >
        {props.selected?.text}
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          paper: {
            style: {
              backgroundColor: "black",
              color: "white",
            },
          },
        }}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        {props.items.map((it) => {
          return (
            <MenuItem onClick={() => handleSelect(it)} key={it.value}>
              {it.text}
            </MenuItem>
          );
        })}
      </Menu>
    </div>
  );
};

const TWAPComponent = ({ limit }: { limit?: boolean }) => {
  const { chainId, address: account } = useAccount();
  const { openConnectModal } = useConnectModal();
  const config = useDappContext().config;
  const dappTokens = useTokenList();

  const client = useWalletClient();
  const [srcToken, setSrcToken] = useState<Token | undefined>(undefined);
  const [dstToken, setDstToken] = useState<Token | undefined>(undefined);
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

  const onWrapSuccess = useCallback(async () => {
    const wToken = Object.values(networks).find((it) => it.id === chainId)?.wToken.address;
    const token = dappTokens?.find((it: any) => eqIgnoreCase(it.address, wToken || ""));
    if (token) {
      setSrcToken(token);
    }
    await refetchBalances();
  }, [dappTokens, chainId, refetchBalances]);

  const { outAmount: marketPrice, isLoading: marketPriceLoading } = useMarketPrice(srcToken, dstToken);

  const srcUsd = useUSD(srcToken?.address);
  const dstUsd = useUSD(dstToken?.address);
  const srcBalance = useTokenBalance(srcToken).data?.wei;
  const dstBalance = useTokenBalance(dstToken).data?.wei;
  return (
    <>
      <GlobalStyles isDarkMode={true} />
      <Widget
        config={config}
        isExactAppoval={true}
        chainId={chainId}
        provider={client.data?.transport}
        srcToken={srcToken}
        dstToken={dstToken}
        callbacks={{
          wrap: {
            onSuccess: onWrapSuccess,
          },
          unwrap: {
            onSuccess: refetchBalances,
          },
          onSrcTokenSelect: setSrcToken,
          onDstTokenSelect: setDstToken,
          onConnect: openConnectModal,
          onSwitchTokens,
        }}
        isLimitPanel={limit}
        srcUsd1Token={srcUsd ? Number(srcUsd) : 0}
        dstUsd1Token={dstUsd ? Number(dstUsd) : 0}
        srcBalance={srcBalance}
        dstBalance={dstBalance}
        marketReferencePrice={{ value: marketPrice, isLoading: marketPriceLoading }}
        components={{ Tooltip, TokenLogo, Link, OrderConfirmationModal: OrderConfirmationModal, OrdersModal: OrderHistoryModal, TokenSelectModal, SelectMenu, Toggle }}
        useToken={useToken}
        customMinChunkSizeUsd={4}

        fee={0.25}
        account={account}
        orderDisclaimerAcceptedByDefault
      />
    </>
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
