import { useTokenList, usePriceUSD, useMarketPrice, useTokenBalance } from "../hooks";
import { NumberInput, Popup, PanelToggle } from "../Components";
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
  useFormatNumber,
} from "@orbs-network/twap-ui";
import { Config, TimeUnit } from "@orbs-network/twap-sdk";
import { useAccount, useWalletClient } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { Panels, useDappContext } from "../context";
import { GlobalStyles, StyledLayout } from "./styles";
import { CurrencyInputPanel, Section, SwitchTokensButton } from "./components";
import { useDappStore } from "./store";
import { ChevronDown, Info, RefreshCcw } from "react-feather";
import BN from "bignumber.js";
import { useGetToken } from "./hooks";

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
  return !res ? "" : BN(res).toFixed();
};

const CustomTooltip = (props: TooltipProps) => {
  return (
    <Tooltip title={props.tooltipText} arrow>
      <span>{props.children}</span>
    </Tooltip>
  );
};

const useToken = (addressOrSymbol?: string) => {
  const getToken = useGetToken();
  return useMemo(() => {
    return getToken(addressOrSymbol);
  }, [getToken, addressOrSymbol]);
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
    setAnchorEl(open ? null : event.currentTarget);
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
    <div style={{ width: "fit-content" }}>
      <Dropdown trigger={["click"]} menu={{ items }} open={open} onOpenChange={() => setAnchorEl(null)}>
        <Button type="primary" aria-controls={open ? "basic-menu" : undefined} aria-haspopup="true" aria-expanded={open ? "true" : undefined} onClick={handleClick}>
          <Flex gap={4} align="center">
            <Typography style={{ textTransform: "capitalize" }}>{props.selected?.text}</Typography>
            <ChevronDown size={16} />
          </Flex>
        </Button>
      </Dropdown>
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
  const { input, usd, balance, token } = Widget.useTokenPanel({ isSrcToken: Boolean(isSrcToken) });

  const { setSrcToken, setDstToken } = useDappStore();

  const onSelect = isSrcToken ? setSrcToken : setDstToken;

  return (
    <Section>
      <CurrencyInputPanel
        onSelect={onSelect}
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
  const { input, usd, isInverted, percent, onInvert, isLimitOrder } = Widget.useLimitPanel();
  const { setSrcToken, setDstToken, srcToken, dstToken } = useDappStore();
  const onSelect = isInverted ? setSrcToken : setDstToken;
  const topToken = isInverted ? dstToken : srcToken;
  const bottomToken = isInverted ? srcToken : dstToken;

  if (!isLimitOrder) return null;
  return (
    <Section>
      <Flex vertical gap={10} align="center" style={{ width: "100%" }}>
        <Flex justify="space-between" style={{ width: "100%" }}>
          <Flex align="center" gap={4}>
            <Typography>Swap when 1</Typography> <Avatar src={topToken?.logoUrl} size={20} /> <Typography>{topToken?.symbol} is worth</Typography>
          </Flex>
          <Button onClick={onInvert} type="text" icon={<RefreshCcw size={18} />} />
        </Flex>
        <CurrencyInputPanel token={bottomToken} onInputChange={input.onChange} value={input.value} usd={usd?.toString() || ""} onSelect={onSelect} hideBalance />
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

const TradeAmountMessage = () => {
  const { usdAmount, tokenAmount, token, hide, error } = Widget.useTradeAmountMessagePanel();
  const tokenAmountF = useFormatNumber({ value: tokenAmount });

  if (hide) return null;

  return (
    <Typography className={`trade-amount-message ${error ? "trade-amount-message-error" : ""}`}>
      {`${tokenAmountF} ${token?.symbol} `}
      <span>{`($${usdAmount}) `}</span>
      per trade
    </Typography>
  );
};
const Label = ({ label, tooltip }: { label: string; tooltip?: string }) => {
  return (
    <Flex align="center" gap={4}>
      <Typography style={{ fontSize: 14, color: "white", opacity: 0.5 }}>{label}</Typography>
      {tooltip && (
        <Tooltip title={tooltip} arrow>
          <Info size={14} color="white" />
        </Tooltip>
      )}
    </Flex>
  );
};

const timeArr: { text: string; value: TimeUnit }[] = [
  {
    text: "Minutes",
    value: TimeUnit.Minutes,
  },
  {
    text: "Hours",
    value: TimeUnit.Hours,
  },
  {
    text: "Days",
    value: TimeUnit.Days,
  },
];

const OrderDuration = () => {
  const { title, tooltip, duration, onUnitSelect, onInputChange } = Widget.useDurationPanel();

  const selected = timeArr.find((it) => it.value === duration.unit);

  return (
    <Section className="order-delay twap-input-panel">
      <Label label={title} tooltip={tooltip} />
      <Flex justify="space-between" style={{ width: "100%" }}>
        <NumberInput onChange={onInputChange} value={duration.value} />
        <SelectMenu items={timeArr} selected={selected} onSelect={(item) => onUnitSelect(Number(item.value))} />
      </Flex>
    </Section>
  );
};

const FillDelay = () => {
  const { title, tooltip, onUnitSelect, fillDelay, onInputChange } = Widget.useFillDelayPanel();

  const selected = timeArr.find((it) => it.value === fillDelay.unit);

  return (
    <Section className="fill-duration twap-input-panel">
      <Label label={title} tooltip={tooltip} />
      <Flex justify="space-between" style={{ width: "100%" }}>
        <NumberInput onChange={onInputChange} value={fillDelay.value} />
        <SelectMenu items={timeArr} selected={selected} onSelect={(item) => onUnitSelect(Number(item.value))} />
      </Flex>
    </Section>
  );
};

const TradeAmount = () => {
  const { onChange, trades, tooltip, label } = Widget.useTradesAmountPanel();

  return (
    <Section className="trade-amount twap-input-panel">
      <Label label={label} tooltip={tooltip} />
      <Flex justify="space-between" style={{ width: "100%" }}>
        <NumberInput onChange={(value) => onChange(Number(value))} value={trades} />
        <Typography>trades</Typography>
      </Flex>
    </Section>
  );
};

const MarketPriceToggle = () => {
  const { isMarketOrder, setIsMarketOrder } = Widget.usePriceModePanel();
  return (
    <Flex gap={10} align="center" justify="flex-end" style={{ width: "100%" }}>
      <Typography>Limit Price</Typography>
      <Switch checked={!isMarketOrder} onChange={() => setIsMarketOrder(!isMarketOrder)} />
    </Flex>
  );
};


const InputsError = () => {
  const error = Widget.useInputsError();
  if (!error) return null;
  return <Typography style={{ color: "red" }}>{error}</Typography>;
}

export const Dapp = () => {
  const { chainId, address: account } = useAccount();
  const { config, panel } = useDappContext();
  const { srcToken, dstToken } = useTokens();
  const client = useWalletClient();
  const { outAmount: marketPrice, isLoading: marketPriceLoading } = useMarketPrice(srcToken, dstToken);
  const srcUsd = useUSD(srcToken?.address);
  const dstUsd = useUSD(dstToken?.address);
  const srcBalance = useTokenBalance(srcToken).data?.wei;
  const dstBalance = useTokenBalance(dstToken).data?.wei;
  const limit = panel === Panels.LIMIT;

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
        srcUsd1Token={srcUsd}
        dstUsd1Token={dstUsd}
        srcBalance={srcBalance}
        dstBalance={dstBalance}
        customMinChunkSizeUsd={5}
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
        fee={0.25}
        account={account}
        orderDisclaimerAcceptedByDefault
      >
        <StyledLayout>
          <Flex vertical gap={10} align="center">
            <PanelToggle />
            {!limit && <MarketPriceToggle />}
            <LimitPanel />
            <Flex vertical gap={0} align="center" style={{ width: "100%" }}>
              <TokenPanel isSrcToken />
              <SwitchTokensButton />
              <TokenPanel />
            </Flex>
            {limit ? (
              <OrderDuration />
            ) : (
              <Flex gap={10} align="stretch" justify="space-between" style={{ width: "100%" }}>
                <FillDelay />
                <TradeAmount />
              </Flex>
            )}
            <TradeAmountMessage />
            <ConfirmationButton />
            <InputsError />
            <Widget.PoweredByOrbs />
            <Widget.Orders />
            <Widget.WarningMessage />
          </Flex>
        </StyledLayout>
      </Widget>
    </>
  );
};
