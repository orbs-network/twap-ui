import { useTokenList, usePriceUSD, useMarketPrice, useTokenBalance, useTokensWithBalancesUSD, useUnwrapToken, useWrapToken } from "../hooks";
import { NumberInput, Popup, PanelToggle } from "../Components";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { Tooltip, Switch, Dropdown, Button, MenuProps, Flex, Typography } from "antd";
import {
  TWAP,
  SelectMenuProps,
  useFormatNumber,
  DEFAULT_DURATION_OPTIONS,
  ORBS_LOGO,
  ORBS_WEBSITE_URL,
  DISCLAIMER_URL,
  Module,
  Token,
  SelectMeuItem,
  ButtonProps,
  Components,
  TooltipProps,
  Partners,
  useTypedSrcAmount,
  SubmitOrderSuccessViewProps,
  useOrderHistoryPanel,
  useSubmitSwapPanel,
  useSrcTokenPanel,
  useDstTokenPanel,
  useTradesPanel,
  useDurationPanel,
  useFillDelayPanel,
  useLimitPricePanel,
  useMarketPricePanel,
  useTriggerPricePanel,
  useDisclaimerPanel,
  useInputErrors,
  makeElipsisAddress,
} from "@orbs-network/twap-ui";
import { Config, Configs, eqIgnoreCase, getNetwork, isNativeAddress, Order, OrderStatus, TimeDuration, TimeUnit } from "@orbs-network/twap-sdk";
import { RiErrorWarningLine } from "@react-icons/all-files/ri/RiErrorWarningLine";
import { HiArrowLeft } from "@react-icons/all-files/hi/HiArrowLeft";
import { HiOutlineTrash } from "@react-icons/all-files/hi/HiOutlineTrash";
import { useAccount, useChainId, useWalletClient } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useDappContext } from "../context";
import { GlobalStyles } from "./styles";
import { CurrencyInputPanel, Section, SwitchTokensButton } from "./components";
import { useDappStore } from "./store";
import { ChevronDown, Info, Repeat } from "react-feather";
import { ArrowUpDown, TriangleAlert } from "lucide-react";
import BN from "bignumber.js";
import { useGetToken } from "./hooks";
import styled from "styled-components";
import { abbreviate } from "../utils";
import clsx from "clsx";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
export const useSwitchChain = () => {
  const { data: walletClient } = useWalletClient();

  return useCallback((config: Config) => (walletClient as any)?.switchChain({ id: config.chainId }), [walletClient]);
};

const dexToPartner = (config: Config) => {
  switch (config) {
    case Configs.PancakeSwap:
    case Configs.PancakeSwapArbitrum:
    case Configs.PancakeSwapBase:
      return Partners.PANCAKESWAP;

    default:
      return Partners.THENA;
  }
};

const OrderHistoryModal = () => {
  const {
    isLoading,
    ordersToCancel,
    isCancelOrdersLoading,
    openOrdersCount,
    statuses,
    onSelectStatus,
    selectedStatus,
    onToggleCancelOrdersMode,
    cancelOrdersMode,
    onClosePreview,
    selectedOrder,
    onCancelOrders,
  } = useOrderHistoryPanel();
  const [isOpen, setIsOpen] = useState(false);
  const onSelect = useCallback((item: SelectMeuItem) => onSelectStatus(item?.value as OrderStatus), [onSelectStatus]);

  return (
    <>
      <Popup
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={
          selectedOrder ? (
            <div className="twap-orders__selected-order-header-title">
              <HiArrowLeft className="twap-orders__selected-order-header-back-icon" onClick={onClosePreview} />
              <p>{selectedOrder.title}</p>
            </div>
          ) : (
            "Orders"
          )
        }
      >
        {!selectedOrder && (
          <div className="twap-orders__list-header">
            <SelectMenu items={statuses} selected={statuses.find((it) => it.value === selectedStatus)} onSelect={onSelect} />

            <div className="twap-orders__list-header-select-toggle-container">
              <Button onClick={() => onToggleCancelOrdersMode(!cancelOrdersMode)}>{cancelOrdersMode ? "Close Select" : "Open Select"}</Button>
              {cancelOrdersMode && (
                <Button onClick={() => onCancelOrders(ordersToCancel || [])} loading={isCancelOrdersLoading} className="twap-orders__list-header-select-toggle-cancel">
                  <HiOutlineTrash className="twap-orders__list-header-select-toggle-cancel-icon" />
                  <p>{`Cancel (${ordersToCancel?.length || 0})`}</p>
                </Button>
              )}
            </div>
          </div>
        )}
        <Components.Orders />
      </Popup>
      <button onClick={() => setIsOpen(true)} className="twap-orders__button">
        {isLoading ? <Typography>Loading...</Typography> : <Typography> {openOrdersCount} Open orders</Typography>}
      </button>
    </>
  );
};

const ErrorView = () => {
  const { resetSwap } = useSubmitSwapPanel();
  const chainId = useChainId();
  const network = getNetwork(chainId);
  const { mutateAsync: onUnwrap } = useUnwrapToken();

  return (
    <div>
      <p>Transaction Failed</p>
      <p>
        Note: {network?.native.symbol} was wrapped to {network?.wToken.symbol}
      </p>
      <Button onClick={() => onUnwrap(resetSwap)}>Unwrap</Button>
    </div>
  );
};

const SubmitOrderErrorView = ({ wrapTxHash, children }: { wrapTxHash?: string; children: ReactNode }) => {
  if (wrapTxHash) {
    return <ErrorView />;
  }

  return children;
};

const SubmitOrderPanelModal = () => {
  const { onCloseModal, onOpenModal, onSubmitOrder, swapLoading, openSubmitModalButton } = useSubmitSwapPanel();
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const onOpen = useCallback(() => {
    onOpenModal();
    setIsOpen(true);
  }, [onOpenModal]);

  const onClose = useCallback(() => {
    onCloseModal();
    setIsOpen(false);
  }, [onCloseModal]);

  return (
    <>
      <Popup isOpen={isOpen} onClose={onClose} title="Submit Order">
        <Components.SubmitOrderPanel
          reviewDetails={
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
              <TwapButton onClick={onSubmitOrder} disabled={!disclaimerAccepted} loading={swapLoading}>
                Confirm Order
              </TwapButton>
            </>
          }
        />
      </Popup>
      <ConfirmationButton onClick={onOpen} text={openSubmitModalButton.text} disabled={openSubmitModalButton.disabled} />
    </>
  );
};

const StyledButton = styled(Button)<{ disabled?: boolean }>`
  background: #141414 !important;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  color: white !important;
  pointer-events: ${({ disabled }) => (disabled ? "none" : "auto")};
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
`;

const useUSD = (address?: string) => {
  const res = usePriceUSD(address);
  return !res ? "" : BN(res).toFixed();
};

const useToken = (addressOrSymbol?: string) => {
  const getToken = useGetToken();
  return useMemo(() => {
    return getToken(addressOrSymbol);
  }, [getToken, addressOrSymbol]);
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

  const items: MenuProps["items"] = props.items.map((it, index) => {
    return {
      key: index,
      label: it.text,
      onClick: () => handleSelect(it),
    };
  });
  return (
    <div style={{ width: "fit-content" }}>
      <Dropdown trigger={["click"]} menu={{ items }} open={open} onOpenChange={() => setAnchorEl(null)}>
        <Button
          className="px-2"
          type="primary"
          aria-controls={open ? "basic-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          onClick={handleClick}
        >
          <Flex gap={4} align="center">
            <Typography className="capitalize text-[12px]">{props.selected?.text}</Typography>
            <ChevronDown size={16} />
          </Flex>
        </Button>
      </Dropdown>
    </div>
  );
};

const ConfirmationButton = ({ onClick, text, disabled: _disabled }: { onClick: () => void; text: string; disabled: boolean }) => {
  const { chainId } = useAccount();
  const { address: account } = useAccount();

  const { openConnectModal } = useConnectModal();
  const switchChain = useSwitchChain();
  const config = useDappContext().config;
  const isWrongChain = config.chainId !== chainId;
  const disabled = !account ? false : isWrongChain ? false : _disabled;
  const { srcToken, dstToken } = useTokens();
  const network = getNetwork(chainId);
  const { mutateAsync: onUnwrap, isLoading: isUnwrapLoading } = useUnwrapToken();
  const { mutateAsync: onWrap, isLoading: isWrapLoading } = useWrapToken();

  const isWrapToken = isNativeAddress(srcToken?.address || "") && eqIgnoreCase(network?.wToken.address || "", dstToken?.address || "");
  const isUnwrapToken = isNativeAddress(dstToken?.address || "") && eqIgnoreCase(network?.wToken.address || "", srcToken?.address || "");

  const onConfirm = useCallback(() => {
    if (!account) {
      openConnectModal?.();
    } else if (config.chainId !== chainId) {
      switchChain(config);
    } else if (isUnwrapToken) {
      onUnwrap(undefined);
    } else if (isWrapToken) {
      onWrap(undefined);
    } else {
      onClick();
    }
  }, [account, config.chainId, chainId, openConnectModal, switchChain, onClick, onUnwrap, onWrap, isUnwrapToken, isWrapToken]);

  const buttonText = useMemo(() => {
    if (!account) return "Connect Wallet";
    if (isWrongChain) return "Switch Network";
    if (isUnwrapToken) return "Unwrap";
    if (isWrapToken) return "Wrap";
    return text;
  }, [isUnwrapToken, isWrapToken, text, account, isWrongChain]);

  return (
    <StyledButton
      size="large"
      type="primary"
      style={{
        width: "100%",
      }}
      onClick={onConfirm}
      disabled={disabled || isUnwrapLoading || isWrapLoading}
    >
      {buttonText}
    </StyledButton>
  );
};

const useTokens = () => {
  const { srcToken, dstToken, setSrcToken, setDstToken, resetTokens } = useDappStore();
  const allTokens = useTokenList();

  const chainId = useDappContext().config.chainId;
  const account = useAccount().address;
  const { isLoading } = useTokensWithBalancesUSD();
  const [searchParams] = useSearchParams();
  const srcTokenAddress = searchParams.get("srcToken");
  const dstTokenAddress = searchParams.get("dstToken");

  useEffect(() => {
    if (isLoading) return;
    if (!allTokens?.length) return;

    // Only set from URL if not already set
    if (srcTokenAddress && !srcToken) {
      const token = allTokens.find((it) => it.address === srcTokenAddress);
      if (token) {
        setSrcToken(token);
      }
    }

    if (dstTokenAddress && !dstToken) {
      const token = allTokens.find((it) => it.address === dstTokenAddress);
      if (token) {
        setDstToken(token);
      }
    }

    // Set defaults only if account is connected AND no token has been selected
    if (account) {
      if (!srcToken && !srcTokenAddress) {
        setSrcToken(allTokens[1]);
      }
      if (!dstToken && !dstTokenAddress) {
        setDstToken(allTokens[2]);
      }
    }
  }, [allTokens, srcTokenAddress, dstTokenAddress, srcToken, dstToken, account, isLoading]);

  useEffect(() => {
    resetTokens();
  }, [chainId]);

  return {
    srcToken,
    dstToken,
  };
};

const TokenPanel = ({ isSrcToken }: { isSrcToken?: boolean }) => {
  const srcTokenPanel = useSrcTokenPanel();
  const dstTokenPanel = useDstTokenPanel();
  const panel = isSrcToken ? srcTokenPanel : dstTokenPanel;
  const { setSrcToken, setDstToken } = useDappStore();

  const onSelect = useCallback(
    (token: Token) => {
      const queryParams = new URLSearchParams(window.location.search);
      queryParams.set(isSrcToken ? "srcToken" : "dstToken", token.address);
      window.history.pushState(null, "", `${window.location.pathname}?${queryParams.toString()}`);
      isSrcToken ? setSrcToken(token) : setDstToken(token);
    },
    [setSrcToken, setDstToken, isSrcToken],
  );

  return (
    <Section>
      <CurrencyInputPanel
        onSelect={onSelect}
        usd={panel.usd?.toString() || ""}
        balance={panel.balance?.toString() || ""}
        token={panel.token}
        onInputChange={panel.onChange}
        value={panel.value}
        title={isSrcToken ? "From" : "To"}
        disabled={isSrcToken ? false : true}
        isLoading={panel.isLoading}
      />
    </Section>
  );
};

const SELECT_DURATION_OPTIONS = [
  {
    text: "Hours",
    value: TimeUnit.Hours,
  },
  {
    text: "Days",
    value: TimeUnit.Days,
  },
  {
    text: "Months",
    value: TimeUnit.Months,
  },
];

const DURATION_OPTIONS = [
  {
    text: "1 Day",
    unit: TimeUnit.Days,
    value: 1,
  },

  {
    text: "1 Week",
    unit: TimeUnit.Days,
    value: 7,
  },
  {
    text: "1 Month",
    unit: TimeUnit.Days,
    value: 30,
  },
];

const PercentageButton = ({ onClick, children, selected }: { onClick: () => void; children: React.ReactNode; selected: boolean }) => {
  return (
    <button
      style={{
        border: "1px solid rgba(255, 255, 255, 0.12)",
        padding: "5px 10px",
        fontSize: 13,
        height: "auto",
      }}
      className={`${selected ? "bg-[rgba(255,255,255,0.12)]" : "bg-transparent"} hover:bg-[rgba(255,255,255,0.12)] rounded-lg text-white`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

const TradeAmountMessage = () => {
  const { error, amountPerTradeUsd, fromToken, amountPerTrade, totalTrades } = useTradesPanel();
  const tokenAmountF = useFormatNumber({ value: amountPerTrade });
  const amountPerTradeUsdF = useFormatNumber({ value: amountPerTradeUsd });

  if (totalTrades <= 1) return null;

  return (
    <Typography className={`trade-amount-message ${error ? "trade-amount-message-error" : ""}`}>
      {`${tokenAmountF} ${fromToken?.symbol} `}
      <span>{`($${amountPerTradeUsdF}) `}</span>
      per trade
    </Typography>
  );
};
const Label = ({ text, tooltip }: { text: string; tooltip?: string }) => {
  return (
    <Flex align="center" gap={4}>
      <Typography style={{ fontSize: 14, color: "white" }}>{text}</Typography>
      {tooltip && (
        <Tooltip title={tooltip} arrow>
          <Info size={14} color="white" />
        </Tooltip>
      )}
    </Flex>
  );
};

const TwapTooltip = ({ tooltipText, children }: TooltipProps) => {
  return (
    <Tooltip title={tooltipText || ""} arrow>
      {children || <Info size={14} color="white" />}
    </Tooltip>
  );
};

const OrderDuration = ({ defaultDuration }: { defaultDuration: TimeDuration }) => {
  const { label, tooltip, duration, onUnitSelect, onInputChange, onChange } = useDurationPanel();
  const [isCustom, setIsCustom] = useState(false);

  const onCustomChange = useCallback(
    (value: boolean) => {
      setIsCustom(value);
      onChange(defaultDuration);
    },
    [onChange, isCustom, defaultDuration],
  );

  const customSelected = SELECT_DURATION_OPTIONS.find((it) => {
    return it.value === duration.unit;
  });

  return (
    <Section className="order-delay twap-input-panel">
      <div className="flex flex-row gap-2 items-center justify-between">
        <Label text={label} tooltip={tooltip} />
        <div className="flex flex-row gap-2 items-center justify-between">
          <p className="text-sm text-white ">Custom</p>
          <Switch checked={isCustom} onChange={onCustomChange} />
        </div>
      </div>
      {isCustom ? (
        <div className="flex flex-row gap-2 items-center justify-between">
          <NumberInput onChange={onInputChange} value={duration.value} className="text-[18px]" />
          <SelectMenu items={SELECT_DURATION_OPTIONS} selected={customSelected} onSelect={(item) => onUnitSelect(Number(item.value))} />
        </div>
      ) : (
        <div className="flex flex-row gap-2 items-center justify-end">
          {DURATION_OPTIONS.map((it) => {
            const selected = it.unit * it.value === duration.unit * duration.value;
            return (
              <PercentageButton
                selected={selected}
                key={it.value}
                onClick={() =>
                  onChange({
                    unit: it.unit,
                    value: it.value || 1,
                  })
                }
              >
                {it.text}
              </PercentageButton>
            );
          })}
        </div>
      )}
    </Section>
  );
};

const FillDelay = ({ className }: { className?: string }) => {
  const { label, tooltip, onUnitSelect, fillDelay, onInputChange } = useFillDelayPanel();

  const selected = DEFAULT_DURATION_OPTIONS.find((it) => it.value === fillDelay.unit);

  return (
    <Section className={className}>
      <Label text={label} tooltip={tooltip} />
      <div className="flex flex-row gap-2 items-center justify-between">
        <NumberInput onChange={onInputChange} value={fillDelay.value} className="h-[40px]" />
        <SelectMenu items={DEFAULT_DURATION_OPTIONS} selected={selected} onSelect={(item) => onUnitSelect(Number(item.value))} />
      </div>
    </Section>
  );
};

const PriceToggle = () => {
  const { label, tooltip, isLimitPrice, toggleLimitPrice, hide } = useLimitPricePanel();

  return (
    <div className="flex flex-row gap-2 items-center flex-1">
      {!hide && (
        <div className="flex flex-row gap-2 items-center">
          <Switch checked={isLimitPrice} onChange={toggleLimitPrice} className="w-fit" />
          <Label text={label} tooltip={tooltip} />
        </div>
      )}
    </div>
  );
};


const PercentageInput = ({ value, onChange, prefix, isLoading }: { value: string; onChange: (value: string) => void; prefix?: string; isLoading?: boolean }) => {
  return (
    <NumberInput
      maxValue={100}
      prefix={prefix}
      onChange={onChange}
      value={value}
      className="max-w-[110px]  ml-auto rounded-xl justify-center"
      inputClassName="text-center  text-[18px]"
      suffix="%"
      placeholder={prefix ? `${prefix}0%` : "0%"}
      loading={isLoading}
      allowNegative
    />
  );
};

const SymbolInput = ({
  token,
  onChange,
  value,
  error,
  isLoading,
  usd,
}: {
  token?: Token;
  onChange: (value: string) => void;
  value: string;
  error?: boolean;
  isLoading?: boolean;
  usd?: string;
}) => {
  return (
    <div
      className={clsx(
        "flex flex-row gap-1 justify-between items-center  bg-[rgba(255,255,255,0.05)] rounded-[12px] border border-solid px-3 py-2 flex-1",
        error ? "border-[#FF0000]" : "border-transparent",
      )}
    >
      <p className="text-[14px] text-white font-medium w-auto">{token?.symbol}</p>
      <div className="flex flex-col items-end gap-0 flex-1">
        <NumberInput
          loading={isLoading}
          onChange={onChange}
          value={value}
          className="bg-transparent text-[18px] pt-0 pb-0 w-full rounded-none justify-end pr-0"
          inputClassName="text-right"
          error={error}
        />
        <p className="text-[12px] text-gray-500">${abbreviate(usd || "0")}</p>
      </div>
    </div>
  );
};

const ResetButton = ({ onClick, text }: { onClick: () => void; text: string }) => {
  return (
    <div onClick={onClick} className="text-sm text-white cursor-pointer opacity-80 hover:opacity-100">
      {text}
    </div>
  );
};

const LimitPrice = () => {
  const { warning, price, toToken, onReset, prefix, selectedPercentage, isLoading, onChange, onPercentageChange, error, isLimitPrice, usd } = useLimitPricePanel();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row gap-4 justify-between items-center flex-1">
        <PriceToggle />
        {isLimitPrice && <ResetButton onClick={onReset} text="set to default" />}
      </div>
      {isLimitPrice ? (
        <div className="flex flex-row gap-2 justify-between items-stretch flex-1">
          <SymbolInput isLoading={isLoading} error={Boolean(error)} token={toToken} onChange={onChange} value={price} usd={usd} />
          <PercentageInput isLoading={isLoading} prefix={prefix} onChange={onPercentageChange} value={selectedPercentage?.toString() || ""} />
        </div>
      ) : warning ? (
        <div className="flex flex-row gap-2 justify-between items-stretch flex-1 bg-[rgba(255,255,255,0.02)] rounded-[12px] px-2 py-2">
          <TriangleAlert size={14} color="white" className="relative top-[1px]" />
          <p className="text-[13px] text-white opacity-80 flex-1 leading-[18px]">
            {warning?.text}
            <a href={warning?.url} target="_blank" rel="noreferrer" className="text-white underline ml-1">
              Learn more
            </a>
          </p>
        </div>
      ) : null}
    </div>
  );
};

const PriceRate = () => {
  const { fromToken, isLimitPrice, isInverted, onInvert } = useLimitPricePanel();

  return (
    <div className="flex flex-row gap-4 justify-between items-center">
      <div className="flex flex-row gap-2 items-center justify-between w-full">
        {isLimitPrice ? (
          <p className="text-sm text-white font-bold">
            {isInverted ? "Buy" : "Sell"} {fromToken?.symbol} at rate
          </p>
        ) : (
          <p className="text-sm text-white font-bold">
            {isInverted ? "Buy" : "Sell"} {fromToken?.symbol} at best rate
          </p>
        )}
        <ArrowUpDown onClick={onInvert} className="cursor-pointer text-white" size={18} />
      </div>
    </div>
  );
};

const TriggerPrice = () => {
  const { price, toToken, onSetDefault, usd, prefix, selectedPercentage, isLoading, onChange, onPercentageChange, tooltip, label, error, hide } = useTriggerPricePanel();

  return (
    <>
      {!hide && (
        <div className="flex flex-col gap-2 justify-start items-start flex-1 w-full">
          <div className="flex flex-row gap-2 justify-between items-center w-full">
            <Label text={label} tooltip={tooltip} />
            <ResetButton onClick={onSetDefault} text="set to default" />
          </div>
          <div className="flex flex-row justify-between gap-2 items-stretch  overflow-hidden w-full">
            <SymbolInput isLoading={isLoading} error={Boolean(error)} token={toToken} onChange={onChange} value={price} usd={usd} />
            <PercentageInput isLoading={isLoading} prefix={prefix} onChange={onPercentageChange} value={selectedPercentage?.toString() || ""} />
          </div>
        </div>
      )}
    </>
  );
};

const TradeAmount = ({ className }: { className?: string }) => {
  const { onChange, totalTrades, tooltip, label } = useTradesPanel();

  return (
    <Section className={clsx(`trade-amount twap-input-panel ${className}`)}>
      <Label text={label} tooltip={tooltip} />
      <div className="flex flex-row gap-2 items-center justify-between bg-[rgba(255,255,255,0.05)] rounded-[12px] px-2 py-0 h-[40px]">
        <NumberInput onChange={(value) => onChange(Number(value))} value={totalTrades} className="bg-transparent flex-1" />
        <Typography>Orders</Typography>
      </div>
    </Section>
  );
};

const TwapButton = (props: ButtonProps) => {
  return (
    <StyledButton loading={props.loading} disabled={props.disabled} onClick={props.onClick} className={props.className}>
      {props.children}
    </StyledButton>
  );
};

const DisclaimerMessage = () => {
  const disclaimerPanel = useDisclaimerPanel();
  if (!disclaimerPanel) return null;
  const { text } = disclaimerPanel;
  return (
    <div className="flex flex-row gap-2 items-start justify-center w-full  bg-[rgba(255,255,255,0.1)] rounded-[12px] px-3 py-2">
      <RiErrorWarningLine style={{ color: "white", width: 16, height: 16, position: "relative", top: 2 }} />
      <p className="text-[13px] text-white opacity-80 flex-1 leading-[18px]">{text}</p>
    </div>
  );
};

const InputsError = () => {
  const error = useInputErrors();
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

const SubmitOrderSuccessView = ({ children }: SubmitOrderSuccessViewProps) => {
  return <div className="flex flex-col gap-2 w-full">{children}</div>;
};

const DEFAULT_LIMIT_DURATION = { unit: TimeUnit.Days, value: 7 };
const DEFAULT_TRIGGER_PRICE_DURATION = { unit: TimeUnit.Days, value: 30 };
const PanelInputs = () => {
  const { module } = useDappContext();

  if (module === Module.TWAP) {
    return (
      <div className="flex flex-row gap-[10px] items-stretch justify-between w-full">
        <FillDelay className="flex-1" />
        <TradeAmount className="max-w-[40%]" />
      </div>
    );
  }

  if (module === Module.LIMIT) {
    return <OrderDuration defaultDuration={DEFAULT_LIMIT_DURATION} />;
  }

  if (module === Module.STOP_LOSS || module === Module.TAKE_PROFIT) {
    return <OrderDuration defaultDuration={DEFAULT_TRIGGER_PRICE_DURATION} />;
  }

  return null;
};

const useCallbacks = () => {
  const getToken = useGetToken();
  const onOrderFilled = useCallback(
    (order: Order) => {
      const srcToken = getToken(order.srcTokenAddress);
      const dstToken = getToken(order.dstTokenAddress);
      toast.success(`Order ${makeElipsisAddress(order.id)} filled ${srcToken?.symbol} -> ${dstToken?.symbol}`);
    },
    [getToken],
  );

  const onCopy = useCallback(() => {
    toast.success("Copied to clipboard");
  }, []);

  return {
    onOrderFilled,
    onCopy,
  };
};

export const Dapp = () => {
  const { chainId, address: account } = useAccount();
  const { amount: typedSrcAmount } = useTypedSrcAmount();
  const { module, slippage, config } = useDappContext();

  const { srcToken, dstToken } = useTokens();
  const client = useWalletClient();
  const { outAmount: marketPrice, isLoading: marketPriceLoading } = useMarketPrice(srcToken, dstToken);

  const marketReferencePrice = useMemo(() => {
    return {
      value: BN(marketPrice || "")
        .multipliedBy(BN(typedSrcAmount || "0"))
        .toFixed(),
      isLoading: marketPriceLoading,
      noLiquidity: false,
    };
  }, [marketPrice, marketPriceLoading, typedSrcAmount]);

  const { data: srcBalance, refetch: refetchSrcBalance } = useTokenBalance(srcToken);
  const { data: dstBalance, refetch: refetchDstBalance } = useTokenBalance(dstToken);

  const refetchBalances = useCallback(() => {
    refetchSrcBalance();
    refetchDstBalance();
  }, [refetchSrcBalance, refetchDstBalance]);

  const srcUsd1Token = useUSD(srcToken?.address);
  const dstUsd1Token = useUSD(dstToken?.address);

  const { onOrderFilled, onCopy } = useCallbacks();

  return (
    <>
      <GlobalStyles isDarkMode={true} />
      <TWAP
        slippage={slippage}
        partner={dexToPartner(config)}
        chainId={chainId}
        provider={client.data?.transport}
        srcToken={srcToken}
        dstToken={dstToken}
        module={module}
        srcUsd1Token={srcUsd1Token}
        dstUsd1Token={dstUsd1Token}
        srcBalance={srcBalance?.wei}
        dstBalance={dstBalance?.wei}
        marketReferencePrice={marketReferencePrice}
        account={account}
        fees={0.25}
        useToken={useToken}
        components={{
          Tooltip: TwapTooltip,
          Button: TwapButton,
          SubmitOrderErrorView,
          SubmitOrderSuccessView,
        }}
        refetchBalances={refetchBalances}
        callbacks={{ onOrderFilled, onCopy }}
        overrides={{
          minChunkSizeUsd: 5,
        }}
      >
        <div className="flex flex-col gap-4 justify-center items-center max-w-[450px] w-full">
          <PanelToggle />
          <Flex vertical gap={0} align="center" style={{ width: "100%" }}>
            <TokenPanel isSrcToken />
            <SwitchTokensButton />
            <TokenPanel />
          </Flex>
          <Section>
            <PriceRate />
            <TriggerPrice />
            <LimitPrice />
          </Section>
          <PanelInputs />
          <TradeAmountMessage />
          <InputsError />
          <SubmitOrderPanelModal />
          <OrderHistoryModal />
          <DisclaimerMessage />
          <PoweredByOrbs />
        </div>
      </TWAP>
    </>
  );
};
