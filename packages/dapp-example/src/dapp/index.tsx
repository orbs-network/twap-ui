import { useTokenList, usePriceUSD, useMarketPrice, useTokenBalance } from "../hooks";
import { NumberInput, Popup } from "../Components";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Tooltip, Switch, Dropdown, Button, MenuProps, Flex, Typography, Avatar } from "antd";
import {
  TooltipProps,
  Widget,
  OrderHistoryModalProps,
  OrderConfirmationModalProps,
  LinkProps,
  SelectMenuProps,
  SelectMeuItem,
  ToggleProps,
  ButtonProps,
  InputProps,
} from "@orbs-network/twap-ui";
import { Config, eqIgnoreCase } from "@orbs-network/twap-sdk";
import { useAccount, useWalletClient } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { Panels, useDappContext } from "../context";
import { GlobalStyles } from "./styles";
import { CurrencyInputPanel, Section, SwitchTokensButton } from "./components";
import { useDappStore } from "./store";
import { RefreshCcw } from "react-feather";

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

const CustomTooltip = (props: TooltipProps) => {
  return (
    <Tooltip title={props.tooltipText} arrow>
      <span>{props.children}</span>
    </Tooltip>
  );
};

const useToken = (addressOrSymbol?: string) => {
  const tokens = useTokenList();

  return useMemo(() => {
    return tokens?.find((it: any) => eqIgnoreCase(it.address || "", addressOrSymbol || "") || eqIgnoreCase(it.symbol || "", addressOrSymbol || ""));
  }, [tokens, addressOrSymbol]);
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

  const items: MenuProps["items"] = props.items.map((it) => {
    return {
      key: it.value,
      label: it.text,
      onClick: () => handleSelect(it),
    };
  });
  return (
    <div>
      <Button id="basic-button" aria-controls={open ? "basic-menu" : undefined} aria-haspopup="true" aria-expanded={open ? "true" : undefined} onClick={handleClick}>
        {props.selected?.text}
      </Button>
      <Dropdown menu={{ items }} />
    </div>
  );
};

const CustomButton = (props: ButtonProps) => {
  return (
    <Button
      type="primary"
      onClick={props.onClick}
      disabled={props.disabled}
      loading={props.loading}
      style={{
        height: 45,
        borderRadius: 12,
        fontSize: 15,
        fontWeight: 500,
      }}
    >
      {props.children}
    </Button>
  );
};

export const useSwitchChain = () => {
  const { data: walletClient } = useWalletClient();

  return useCallback(
    (config: Config) => {
      (walletClient as any)?.switchChain({ id: config.chainId });
    },
    [walletClient],
  );
};

const ConfirmationButton = () => {
  const { onClick, text, disabled: _disabled } = Widget.useConfirmationButtonPanel();
  const { address, chainId } = useAccount();
  const { openConnectModal } = useConnectModal();
  const switchChain = useSwitchChain();
  const config = useDappContext().config;
  const isWrongChain = config.chainId !== chainId;
  const disabled = !address ? false : isWrongChain ? false : _disabled;

  return (
    <Button
      size="large"
      type="primary"
      style={{
        width: "100%",
      }}
      onClick={() => {
        if (!address) {
          openConnectModal?.();
        } else if (config.chainId !== chainId) {
          switchChain(config);
        } else {
          onClick();
        }
      }}
      disabled={disabled}
    >
      {isWrongChain ? "Switch Network" : address ? text : "Connect Wallet"}
    </Button>
  );
};

const CustomInput = (props: InputProps) => {
  return <NumberInput onChange={props.onChange} value={props.value} loading={props.isLoading} />;
};

const useTokens = () => {
  const { srcToken, dstToken, setSrcToken, setDstToken, resetTokens } = useDappStore();
  const allTokens = useTokenList();
  const { chainId } = useAccount();

  useEffect(() => {
    if (!srcToken) {
      setSrcToken(allTokens[1]);
    }
    if (!dstToken) {
      setDstToken(allTokens[2]);
    }
  }, [allTokens, dstToken, srcToken]);

  useEffect(() => {
    resetTokens();
  }, [chainId]);

  return {
    srcToken,
    dstToken,
  };
};

const TokenPanel = ({ isSrcToken }: { isSrcToken?: boolean }) => {
  const { input, usd, balance, token, onTokenSelect } = Widget.useTokenPanel({ isSrcToken: Boolean(isSrcToken) });

  return (
    <Section>
      <CurrencyInputPanel
        onSelect={onTokenSelect}
        usd={usd.data?.toString() || ""}
        balance={balance?.toString() || ""}
        token={token}
        onInputChange={input.onChange}
        value={input.value}
        title={isSrcToken ? "From" : "To"}
      />
    </Section>
  );
};

const LimitPanel = () => {
  const { input, usd, isInverted, percent, onInvert } = Widget.useLimitPanel();
  const { setSrcToken, setDstToken, srcToken, dstToken } = useDappStore();
  const onSelect = isInverted ? setSrcToken : setDstToken;
  const topToken = isInverted ? dstToken : srcToken;
  const bottomToken = isInverted ? srcToken : dstToken;
  return (
    <Section>
      <Flex vertical gap={10} align="center" style={{ width: "100%" }}>
        <CurrencyInputPanel
          token={bottomToken}
          onInputChange={() => {}}
          value={input.value}
          usd={usd?.toString() || ""}
          onSelect={onSelect}
          hideBalance
          title={
            <Flex justify="space-between" style={{ width: "100%" }}>
              <Flex align="center" gap={4}>
                <Typography>Swap when 1</Typography> <Avatar src={topToken?.logoUrl} size={20} /> <Typography>{topToken?.symbol} is worth</Typography>
              </Flex>
              <Button onClick={onInvert} type="text" icon={<RefreshCcw size={18} />} />
            </Flex>
          }
        />
      </Flex>
      <Flex
        gap={5}
        style={{
          marginLeft: "auto",
        }}
      >
        {percent.buttons.map((btn) => {
          return (
            <Button
              key={btn.text}
              type="text"
              onClick={btn.onClick}
              style={{
                border: "1px solid rgba(255, 255, 255, 0.12)",
                padding: "5px 10px",
                fontSize: 13,
                height: "auto",
              }}
            >
              {btn.text}
            </Button>
          );
        })}
      </Flex>
    </Section>
  );
};

const TWAPComponent = ({ limit }: { limit?: boolean }) => {
  const { chainId, address: account } = useAccount();
  const config = useDappContext().config;
  const { srcToken, dstToken } = useTokens();
  const client = useWalletClient();
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
        isLimitPanel={limit}
        srcUsd1Token={srcUsd ? Number(srcUsd) : 0}
        dstUsd1Token={dstUsd ? Number(dstUsd) : 0}
        srcBalance={srcBalance}
        dstBalance={dstBalance}
        marketReferencePrice={{ value: marketPrice, isLoading: marketPriceLoading }}
        components={{
          Tooltip: CustomTooltip,
          Link,
          OrderConfirmationModal: OrderConfirmationModal,
          OrdersModal: OrderHistoryModal,
          SelectMenu,
          Toggle,
          Button: CustomButton,
          Input: CustomInput,
        }}
        useToken={useToken}
        customMinChunkSizeUsd={4}
        fee={0.25}
        account={account}
        orderDisclaimerAcceptedByDefault
      >
        <Flex vertical gap={10} align="center">
          <LimitPanel />
          <TokenPanel isSrcToken />
          <SwitchTokensButton />
          <TokenPanel />
          <ConfirmationButton />
        </Flex>
      </Widget>
    </>
  );
};

export const Dapp = () => {
  const { panel } = useDappContext();
  return (
    <div className="dapp">
      <TWAPComponent limit={panel === Panels.LIMIT} />
    </div>
  );
};
