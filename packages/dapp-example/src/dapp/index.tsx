import { useTokenList, usePriceUSD, useMarketPrice, useTokenBalance } from "../hooks";
import { NumberInput, Popup, PanelToggle } from "../Components";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Tooltip, Switch, Dropdown, Button, MenuProps, Flex, Typography, Avatar } from "antd";
import {
  TooltipProps,
  TWAP,
  SubmitOrderPanelProps,
  LinkProps,
  SelectMenuProps,
  SelectMeuItem,
  useFormatNumber,
  usePriceTogglePanel,
  useChunkSizeMessage,
  useFillDelayPanel,
  useDurationPanel,
  DEFAULT_DURATION_OPTIONS,
  useTokenPanel,
  useShowOrderConfirmationModalButton,
  useLimitPricePanel,
  useInputsError,
  OrderHistory,
  useDisclaimerMessage,
  ORBS_LOGO,
  ORBS_WEBSITE_URL,
  CancelOrderButtonProps,
  OrdersHistoryProps,
  useSubmitOrderPanel,
  DISCLAIMER_URL,
  useChunksPanel,
  useOrderHistoryPanel,
  Token,
  useStopLossPanel,
} from "@orbs-network/twap-ui";
import { Config } from "@orbs-network/twap-sdk";
import { RiErrorWarningLine } from "@react-icons/all-files/ri/RiErrorWarningLine";

import { useAccount, useWalletClient } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { Panels, useDappContext } from "../context";
import { GlobalStyles, StyledLayout } from "./styles";
import { CurrencyInputPanel, Section, SwitchTokensButton } from "./components";
import { useDappStore } from "./store";
import { ChevronDown, Info, RefreshCcw } from "react-feather";
import BN from "bignumber.js";
import { useGetToken } from "./hooks";
import styled from "styled-components";

const OrderHistoryModal = (props: OrdersHistoryProps) => {
  const { isOpen, onClose, onOpen, isLoading, openOrdersCount } = useOrderHistoryPanel();
  return (
    <>
      <Popup isOpen={isOpen} onClose={onClose}>
        {props.children}
      </Popup>
      <button onClick={onOpen} className="twap-orders__button">
        {isLoading ? <Typography>Loading...</Typography> : <Typography> {openOrdersCount} Orders</Typography>}
      </button>
    </>
  );
};

const SubmitOrderPanel = (props: SubmitOrderPanelProps) => {
  const {
    swap: { onSubmit, submitted, disabled, isLoading },
    setDisclaimerAccepted,
    disclaimerAccepted,
  } = useSubmitOrderPanel();
  return (
    <Popup isOpen={props.isOpen} onClose={props.onClose}>
      {props.children}
      {!submitted && (
        <>
          <Flex justify="space-between" align="center" style={{ width: "100%", marginTop: 10 }}>
            <Flex align="center" gap={6}>
              Accept{" "}
              <a href={DISCLAIMER_URL} target="_blank" rel="noreferrer">
                Disclaimer
              </a>
            </Flex>
            <Switch checked={disclaimerAccepted} onChange={() => setDisclaimerAccepted(!disclaimerAccepted)} />
          </Flex>
          <StyledButton onClick={onSubmit} disabled={disabled}>
            <p>{isLoading ? "Loading..." : "Confirm"}</p>
          </StyledButton>
        </>
      )}
    </Popup>
  );
};

const StyledButton = styled(Button)`
  width: 100%;
  background: #141414 !important;
  margin-top: 20px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  color: white;
`;

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
  const { onClick, text, disabled: _disabled } = useShowOrderConfirmationModalButton();
  const { address, chainId } = useAccount();
  const { openConnectModal } = useConnectModal();
  const switchChain = useSwitchChain();
  const config = useDappContext().config;
  const isWrongChain = config.chainId !== chainId;
  const disabled = !address ? false : isWrongChain ? false : _disabled;

  return (
    <StyledButton
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
    </StyledButton>
  );
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
  const { input, usd, balance, token } = useTokenPanel({ isSrcToken: Boolean(isSrcToken) });

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
  const { input, usd, isInverted, percent, onInvert, hide } = useLimitPricePanel();
  const { setSrcToken, setDstToken, srcToken, dstToken } = useDappStore();
  const onSelect = isInverted ? setSrcToken : setDstToken;
  const topToken = isInverted ? dstToken : srcToken;
  const bottomToken = isInverted ? srcToken : dstToken;

  if (hide) return null;
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

const TokenDisplay = ({ token }: { token?: Token }) => {
  return (
    <div style={{ display: "flex", flexDirection: "row", gap: 10, alignItems: "center" }}>
      <img src={token?.logoUrl} alt={token?.symbol} style={{ width: 25, height: 25, borderRadius: 999 }} />
      <p style={{ fontSize: 14, color: "white", opacity: 0.5 }}>{token?.symbol}</p>
    </div>
  );
};

const TradeAmountMessage = () => {
  const { usdAmount, tokenAmount, token, error } = useChunkSizeMessage();
  const tokenAmountF = useFormatNumber({ value: tokenAmount });

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

const OrderDuration = () => {
  const { title, tooltip, duration, onUnitSelect, onInputChange } = useDurationPanel();

  const selected = DEFAULT_DURATION_OPTIONS.find((it) => it.value === duration.unit);

  return (
    <Section className="order-delay twap-input-panel">
      <Label label={title} tooltip={tooltip} />
      <Flex justify="space-between" style={{ width: "100%" }}>
        <NumberInput onChange={onInputChange} value={duration.value} />
        <SelectMenu items={DEFAULT_DURATION_OPTIONS} selected={selected} onSelect={(item) => onUnitSelect(Number(item.value))} />
      </Flex>
    </Section>
  );
};

const FillDelay = () => {
  const { title, tooltip, onUnitSelect, fillDelay, onInputChange } = useFillDelayPanel();

  const selected = DEFAULT_DURATION_OPTIONS.find((it) => it.value === fillDelay.unit);

  return (
    <Section className="fill-duration twap-input-panel">
      <Label label={title} tooltip={tooltip} />
      <Flex justify="space-between" style={{ width: "100%" }}>
        <NumberInput onChange={onInputChange} value={fillDelay.value} />
        <SelectMenu items={DEFAULT_DURATION_OPTIONS} selected={selected} onSelect={(item) => onUnitSelect(Number(item.value))} />
      </Flex>
    </Section>
  );
};

const StopLoss = () => {
  const { value, token, onChange } = useStopLossPanel();

  return (
    <Section className="fill-duration twap-input-panel">
      <Label label="Stop Loss" tooltip="Stop Loss" />
      <div style={{ display: "flex", flexDirection: "row", gap: 10, width: "100%", justifyContent: "space-between", alignItems: "center" }}>
        <NumberInput onChange={onChange} value={value} />
        <TokenDisplay token={token} />
      </div>
    </Section>
  );
};

const StopLossLimit = () => {
  const { input, isLimitOrder } = useLimitPricePanel();
  const { dstToken } = useDappStore();

  if (!isLimitOrder) return null;
  return (
    <Section className="stop-loss-limit twap-input-panel">
      <Label label="Limit Price" tooltip="Limit Price" />
      <div style={{ display: "flex", flexDirection: "row", gap: 10, width: "100%", justifyContent: "space-between", alignItems: "center" }}>
        <NumberInput onChange={input.onChange} value={input.value} />
        <TokenDisplay token={dstToken} />
      </div>
    </Section>
  );
};

const TradeAmount = () => {
  const { onChange, trades, tooltip, label } = useChunksPanel();

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

const CancelOrderButton = (props: CancelOrderButtonProps) => {
  return (
    <StyledButton onClick={props.onClick} disabled={props.isLoading}>
      {props.isLoading ? "Loading..." : "Cancel"}
    </StyledButton>
  );
};

const MarketPriceToggle = () => {
  const { isMarketOrder, setIsMarketOrder } = usePriceTogglePanel();
  return (
    <Flex gap={10} align="center" justify="flex-end" style={{ width: "100%" }}>
      <Typography>Limit Price</Typography>
      <Switch checked={!isMarketOrder} onChange={() => setIsMarketOrder(!isMarketOrder)} />
    </Flex>
  );
};

const WarningMessage = () => {
  const { text } = useDisclaimerMessage();

  return (
    <Flex style={{ width: "100%" }} justify="center" gap={10}>
      <RiErrorWarningLine style={{ color: "white", width: 16, height: 16, position: "relative", top: 2 }} />
      <Typography style={{ flex: 1 }}>{text}</Typography>
    </Flex>
  );
};

const InputsError = () => {
  const error = useInputsError();
  if (!error) return null;
  return <Typography style={{ color: "red", textAlign: "left", width: "100%" }}>{error.message}</Typography>;
};

const PoweredByOrbs = () => {
  return (
    <a href={ORBS_WEBSITE_URL} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <Typography>Powered by Orbs</Typography>
      <img src={ORBS_LOGO} alt="Orbs" style={{ width: 22, height: 22 }} />
    </a>
  );
};

const PanelInputs = () => {
  const { panel } = useDappContext();

  const limit = panel === Panels.LIMIT;
  const twap = panel === Panels.TWAP;

  if (twap) {
    return (
      <Flex gap={10} align="stretch" justify="space-between" style={{ width: "100%" }}>
        <FillDelay />
        <TradeAmount />
      </Flex>
    );
  }

  if (limit) {
    return <OrderDuration />;
  }

  return null;
};

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
  const twap = panel === Panels.TWAP;

  return (
    <>
      <GlobalStyles isDarkMode={true} />
      <TWAP
        config={config}
        isExactAppoval={true}
        chainId={chainId}
        provider={client.data?.transport}
        srcToken={srcToken}
        dstToken={dstToken}
        srcUsd1Token={srcUsd}
        isLimitPanel={limit}
        dstUsd1Token={dstUsd}
        srcBalance={srcBalance}
        dstBalance={dstBalance}
        customMinChunkSizeUsd={1}
        marketReferencePrice={{ value: marketPrice, isLoading: marketPriceLoading, noLiquidity: false }}
        OrderHistory={{
          Panel: OrderHistoryModal,
          SelectMenu: SelectMenu,
          CancelOrderButton,
        }}
        SubmitOrderPanel={SubmitOrderPanel}
        TransactionModal={{
          Link: Link,
        }}
        components={{
          Tooltip: CustomTooltip,
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
            <PanelInputs />
            {twap && <TradeAmountMessage />}
            <InputsError />
            <ConfirmationButton />

            <PoweredByOrbs />
            <OrderHistory />
            <WarningMessage />
          </Flex>
        </StyledLayout>
      </TWAP>
    </>
  );
};
