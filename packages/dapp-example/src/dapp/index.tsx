import { useTokenList, usePriceUSD, useMarketPrice, useTokenBalance, useTokensWithBalancesUSD } from "../hooks";
import { NumberInput, Popup, PanelToggle } from "../Components";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Tooltip, Switch, Dropdown, Button, MenuProps, Flex, Typography, Avatar } from "antd";
import {
  TooltipProps,
  TWAP,
  SubmitOrderPanelProps,
  SelectMenuProps,
  useFormatNumber,
  useLimitPriceToggle,
  useChunkSizeMessage,
  useOnOpenConfirmationButton,
  useFillDelayPanel,
  useDurationPanel,
  DEFAULT_DURATION_OPTIONS,
  useTokenPanel,
  useLimitPricePanel,
  OrderHistory,
  useDisclaimerMessage,
  ORBS_LOGO,
  ORBS_WEBSITE_URL,
  CancelOrderButtonProps,
  OrdersHistoryProps,
  DISCLAIMER_URL,
  useChunksPanel,
  useOrderHistoryPanel,
  Module,
  useTriggerPricePanel,
  Token,
  useConfirmationPanel,
  useFieldsErrors,
  useMarketPricePanel,
  useInvertTrade,
  useTriggerPriceWarning,
  SelectMeuItem,
} from "@orbs-network/twap-ui";
import { Config, TimeDuration, TimeUnit } from "@orbs-network/twap-sdk";
import { RiErrorWarningLine } from "@react-icons/all-files/ri/RiErrorWarningLine";

import { useAccount, useWalletClient } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useDappContext } from "../context";
import { GlobalStyles } from "./styles";
import { CurrencyInputPanel, Section, SwitchTokensButton } from "./components";
import { useDappStore } from "./store";
import { ChevronDown, Info, RefreshCcw, Repeat, X } from "react-feather";
import { ArrowUpDown, TriangleAlert } from "lucide-react";
import BN from "bignumber.js";
import { useGetToken } from "./hooks";
import styled from "styled-components";
import { abbreviate } from "../utils";
import clsx from "clsx";

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
  } = useConfirmationPanel();
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
  const { onClick, text, disabled: _disabled } = useOnOpenConfirmationButton();
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
      {!address ? "Connect Wallet" : isWrongChain ? "Switch Network" : text}
    </StyledButton>
  );
};

const useTokens = () => {
  const { srcToken, dstToken, setSrcToken, setDstToken, resetTokens } = useDappStore();
  const allTokens = useTokenList();
  const chainId = useDappContext().config.chainId;
  const account = useAccount().address;
  const { isLoading } = useTokensWithBalancesUSD();

  useEffect(() => {
    if (!account && isLoading) {
      if (!srcToken) {
        setSrcToken(allTokens[1]);
      }
      if (!dstToken) {
        setDstToken(allTokens[2]);
      }
    } else {
      setSrcToken(allTokens[1]);
      setDstToken(allTokens[2]);
    }
  }, [allTokens, dstToken, srcToken, account, isLoading]);

  useEffect(() => {
    resetTokens();
  }, [chainId]);

  return {
    srcToken,
    dstToken,
  };
};

const TokenPanel = ({ isSrcToken }: { isSrcToken?: boolean }) => {
  const { input, usd, balance, token, isLoading } = useTokenPanel({ isSrcToken: Boolean(isSrcToken) });
  const { panel } = useDappContext();
  const { setSrcToken, setDstToken } = useDappStore();

  const onSelect = isSrcToken ? setSrcToken : setDstToken;

  const toTitle = useMemo(() => {
    return "To";
  }, [panel]);

  return (
    <Section>
      <CurrencyInputPanel
        onSelect={onSelect}
        usd={usd.data?.toString() || ""}
        balance={balance?.toString() || ""}
        token={token}
        onInputChange={input.onChange}
        value={input.value}
        title={isSrcToken ? "From" : toTitle}
        disabled={isSrcToken ? false : true}
        isLoading={isLoading}
      />
    </Section>
  );
};

const options = [1, 5, 10];

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

const LimitPanel = () => {
  const { onChange, isActive, price, usd, onPercentageChange, marketDiffPercentage, onReset, selectedPercentage, srcToken, dstToken } = useLimitPricePanel();
  const { onInvert, isInverted } = useInvertTrade();
  const { setSrcToken, setDstToken } = useDappStore();
  const { panel } = useDappContext();
  const onSelect = isInverted ? setSrcToken : setDstToken;
  const prefix = isInverted ? "-" : "+";
  const showReset = marketDiffPercentage && marketDiffPercentage !== selectedPercentage;

  if (!isActive || (panel !== Module.TWAP && panel !== Module.LIMIT)) return null;
  return (
    <Section>
      <Flex vertical gap={10} align="center" style={{ width: "100%" }}>
        <Flex justify="space-between" style={{ width: "100%" }}>
          <Flex align="center" gap={4}>
            <Typography>Swap when 1</Typography> <Avatar src={srcToken?.logoUrl} size={20} /> <Typography>{srcToken?.symbol} is worth</Typography>
          </Flex>
          <Button onClick={onInvert} type="text" icon={<RefreshCcw size={18} />} />
        </Flex>
        <CurrencyInputPanel token={dstToken} onInputChange={onChange} value={price} usd={usd} onSelect={onSelect} hideBalance />
      </Flex>
      <Flex
        gap={5}
        style={{
          marginLeft: "auto",
        }}
      >
        <PercentageButton selected={Boolean(!selectedPercentage)} onClick={onReset}>
          <div className="flex flex-row gap-2 items-center">
            {showReset ? `${prefix}${Math.abs(marketDiffPercentage || 0)}%` : "Market"}
            {showReset ? <X size={16} /> : null}
          </div>
        </PercentageButton>
        {options.map((pt) => {
          return (
            <PercentageButton selected={selectedPercentage === pt} key={pt} onClick={() => onPercentageChange(pt)}>
              {`${prefix}${pt}%`}
            </PercentageButton>
          );
        })}
      </Flex>
    </Section>
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
      <Typography style={{ fontSize: 14, color: "white" }}>{label}</Typography>
      {tooltip && (
        <Tooltip title={tooltip} arrow>
          <Info size={14} color="white" />
        </Tooltip>
      )}
    </Flex>
  );
};

const OrderDuration = ({ defaultDuration }: { defaultDuration: TimeDuration }) => {
  const { title, tooltip, duration, onUnitSelect, onInputChange, setDuration } = useDurationPanel();
  const [isCustom, setIsCustom] = useState(false);

  const onCustomChange = useCallback(
    (value: boolean) => {
      setIsCustom(value);
      setDuration(defaultDuration);
    },
    [setDuration, isCustom, defaultDuration],
  );

  const customSelected = SELECT_DURATION_OPTIONS.find((it) => {
    return it.value === duration.unit;
  });

  return (
    <Section className="order-delay twap-input-panel">
      <div className="flex flex-row gap-2 items-center justify-between">
        <Label label={title} tooltip={tooltip} />
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
                  setDuration({
                    unit: it.unit,
                    value: it.value || 1,
                  })
                }
              >
                {`${it.text}`}
              </PercentageButton>
            );
          })}
        </div>
      )}
    </Section>
  );
};

const FillDelay = ({ className }: { className?: string }) => {
  const { title, tooltip, onUnitSelect, fillDelay, onInputChange } = useFillDelayPanel();

  const selected = DEFAULT_DURATION_OPTIONS.find((it) => it.value === fillDelay.unit);

  return (
    <Section className={className}>
      <Label label={title} tooltip={tooltip} />
      <div className="flex flex-row gap-2 items-center justify-between">
        <NumberInput onChange={onInputChange} value={fillDelay.value} className="h-[40px]" />
        <SelectMenu items={DEFAULT_DURATION_OPTIONS} selected={selected} onSelect={(item) => onUnitSelect(Number(item.value))} />
      </div>
    </Section>
  );
};

const TriggerPriceToggle = () => {
  const { isMarketOrder, setIsMarketOrder } = useLimitPriceToggle();
  const { label, tooltip } = useLimitPricePanel();
  const { panel } = useDappContext();
  if (panel !== Module.STOP_LOSS && panel !== Module.TAKE_PROFIT) return null;
  return (
    <div className="flex flex-row gap-2 items-center flex-1">
      <div className="flex flex-row gap-2 items-center">
        <Switch checked={!isMarketOrder} onChange={() => setIsMarketOrder(!isMarketOrder)} className="w-fit" />
        <Label label={label} tooltip={tooltip} />
      </div>
      {isMarketOrder && <MarketPriceDisplay />}
    </div>
  );
};

const MarketPriceDisplay = () => {
  const { onInvert, leftToken, rightToken, price } = useMarketPricePanel();
  const priceF = useFormatNumber({ value: price });

  if (!leftToken || !rightToken) return null;

  return (
    <div className="flex gap-2 items-center justify-end flex-end flex-1 text-[13px] text-white">
      <p>1 {leftToken?.symbol}</p>
      <Repeat size={16} onClick={onInvert} className="cursor-pointer text-white" />
      <p>
        {priceF} {rightToken?.symbol}
      </p>
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
    />
  );
};

const SymbolInput = ({ token, onChange, value, error, isLoading }: { token?: Token; onChange: (value: string) => void; value: string; error?: boolean; isLoading?: boolean }) => {
  const usd = useUSD(token?.address);

  const totalUsd = !usd ? 0 : BN(usd).multipliedBy(value).toString();
  return (
    <div
      className={clsx(
        "flex flex-row gap-1 justify-between items-center  bg-[rgba(255,255,255,0.05)] rounded-[12px] border border-solid px-3 py-2 flex-1",
        error ? "border-[#FF0000]" : "border-transparent",
      )}
    >
      <p className="text-[14px] text-white font-medium">{token?.symbol}</p>
      <div className="flex flex-col items-end gap-0 w-full">
        <NumberInput
          loading={isLoading}
          onChange={onChange}
          value={value}
          className="bg-transparent text-[18px] pt-0 pb-0 w-full rounded-none justify-end pr-0"
          inputClassName="text-right"
          error={error}
        />
        <p className="text-[12px] text-gray-500">${abbreviate(totalUsd)}</p>
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

const TriggerLimitPrice = () => {
  const { price, dstToken, onReset, prefix, marketDiffPercentage, isLoading, onChange, onPercentageChange, error } = useLimitPricePanel();
  const { isMarketOrder } = useLimitPriceToggle();
  const triggerPriceWarning = useTriggerPriceWarning();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row gap-4 justify-between items-center flex-1">
        <TriggerPriceToggle />
        {!isMarketOrder && <ResetButton onClick={onReset} text="set to default" />}
      </div>
      {!isMarketOrder ? (
        <div className="flex flex-row gap-2 justify-between items-stretch flex-1">
          <SymbolInput isLoading={isLoading} error={Boolean(error)} token={dstToken} onChange={onChange} value={price} />
          <PercentageInput isLoading={isLoading} prefix={prefix} onChange={(value) => onPercentageChange(Number(value))} value={marketDiffPercentage?.toString() || ""} />
        </div>
      ) : triggerPriceWarning ? (
        <div className="flex flex-row gap-2 justify-between items-stretch flex-1 bg-[rgba(255,255,255,0.02)] rounded-[12px] px-2 py-2">
          <TriangleAlert size={14} color="white" className="relative top-[1px]" />
          <p className="text-[13px] text-white opacity-80 flex-1 leading-[18px]">
            {triggerPriceWarning?.text}
            <a href={triggerPriceWarning?.url} target="_blank" rel="noreferrer" className="text-white underline ml-1">
              Learn more
            </a>
          </p>
        </div>
      ) : null}
    </div>
  );
};

const TriggerPrice = () => {
  const { price, srcToken, dstToken, onReset, prefix, marketDiffPercentage, isLoading, onChange, onPercentageChange, tooltip, label, error } = useTriggerPricePanel();
  const { onInvert, isInverted } = useInvertTrade();

  return (
    <Section>
      <div className="flex flex-row gap-4 justify-between items-center">
        <div className="flex flex-row gap-2 items-center justify-between w-full">
          <p className="text-sm text-white font-bold">
            {isInverted ? "Buy" : "Sell"} {srcToken?.symbol} at rate
          </p>
          <ArrowUpDown onClick={onInvert} className="cursor-pointer text-white" size={18} />
        </div>
      </div>
      <div className="flex flex-col gap-2 justify-start items-start flex-1 w-full">
        <div className="flex flex-row gap-2 justify-between items-center w-full">
          <Label label={label} tooltip={tooltip} />
          <ResetButton onClick={onReset} text="set market rate" />
        </div>
        <div className="flex flex-row justify-between gap-2 items-stretch  overflow-hidden w-full">
          <SymbolInput isLoading={isLoading} error={Boolean(error)} token={dstToken} onChange={onChange} value={price} />
          <PercentageInput isLoading={isLoading} prefix={prefix} onChange={(value) => onPercentageChange(Number(value))} value={marketDiffPercentage?.toString() || ""} />
        </div>
      </div>
      <TriggerLimitPrice />
    </Section>
  );
};

const TradeAmount = ({ className }: { className?: string }) => {
  const { onChange, trades, tooltip, label } = useChunksPanel();

  return (
    <Section className={clsx(`trade-amount twap-input-panel ${className}`)}>
      <Label label={label} tooltip={tooltip} />
      <div className="flex flex-row gap-2 items-center justify-between bg-[rgba(255,255,255,0.05)] rounded-[12px] px-2 py-0 h-[40px]">
        <NumberInput onChange={(value) => onChange(Number(value))} value={trades} className="bg-transparent flex-1" />
        <Typography>Orders</Typography>
      </div>
    </Section>
  );
};

const CancelOrderButton = (props: CancelOrderButtonProps) => {
  return <StyledButton onClick={props.onClick}>Cancel</StyledButton>;
};

const LimitPriceToggle = () => {
  const { isMarketOrder, setIsMarketOrder } = useLimitPriceToggle();
  const { panel } = useDappContext();

  if (panel !== Module.TWAP) return null;
  return (
    <Flex gap={10} align="center" justify="flex-end" style={{ width: "100%" }}>
      <Typography>Limit Price</Typography>
      <Switch checked={!isMarketOrder} onChange={() => setIsMarketOrder(!isMarketOrder)} />
    </Flex>
  );
};

const WarningMessage = () => {
  const { text } = useDisclaimerMessage();
  const { panel } = useDappContext();
  if (panel === Module.STOP_LOSS || panel === Module.TAKE_PROFIT) return null;
  return (
    <div className="flex flex-row gap-2 items-start justify-center w-full  bg-[rgba(255,255,255,0.1)] rounded-[12px] px-3 py-2">
      <RiErrorWarningLine style={{ color: "white", width: 16, height: 16, position: "relative", top: 2 }} />
      <p className="text-[13px] text-white opacity-80 flex-1 leading-[18px]">{text}</p>
    </div>
  );
};

const InputsError = () => {
  const error = useFieldsErrors();
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

const DEFAULT_LIMIT_DURATION = { unit: TimeUnit.Days, value: 7 };
const DEFAULT_TRIGGER_PRICE_DURATION = { unit: TimeUnit.Days, value: 30 };
const PanelInputs = () => {
  const { panel } = useDappContext();

  if (panel === Module.TWAP) {
    return (
      <div className="flex flex-row gap-[10px] items-stretch justify-between w-full">
        <FillDelay className="flex-1" />
        <TradeAmount className="max-w-[40%]" />
      </div>
    );
  }

  if (panel === Module.LIMIT) {
    return <OrderDuration defaultDuration={DEFAULT_LIMIT_DURATION} />;
  }

  if (panel === Module.STOP_LOSS || panel === Module.TAKE_PROFIT) {
    return (
      <>
        <TriggerPrice />
        <OrderDuration defaultDuration={DEFAULT_TRIGGER_PRICE_DURATION} />
      </>
    );
  }

  return null;
};

export const Dapp = () => {
  const { chainId, address: account } = useAccount();
  const { config, panel, slippage } = useDappContext();
  const { srcToken, dstToken } = useTokens();
  const client = useWalletClient();
  const { outAmount: marketPrice, isLoading: marketPriceLoading } = useMarketPrice(srcToken, dstToken);
  const twap = panel === Module.TWAP;

  return (
    <>
      <GlobalStyles isDarkMode={true} />
      <TWAP
        slippage={slippage}
        config={config}
        chainId={chainId}
        provider={client.data?.transport}
        srcToken={srcToken}
        dstToken={dstToken}
        module={panel}
        srcUsd1Token={useUSD(srcToken?.address)}
        dstUsd1Token={useUSD(dstToken?.address)}
        srcBalance={useTokenBalance(srcToken).data?.wei}
        dstBalance={useTokenBalance(dstToken).data?.wei}
        customMinChunkSizeUsd={5}
        stateDefaults={{
          disclaimerAccepted: true,
        }}
        marketReferencePrice={{ value: marketPrice, isLoading: marketPriceLoading, noLiquidity: false }}
        OrderHistory={{
          Panel: OrderHistoryModal,
          SelectMenu: SelectMenu,
          CancelOrderButton,
        }}
        SubmitOrderPanel={SubmitOrderPanel}
        components={{
          Tooltip: CustomTooltip,
        }}
        useToken={useToken}
        fee={0.25}
        account={account}
      >
        <div className="flex flex-col gap-4 justify-center items-center max-w-[450px] w-full">
          <PanelToggle />
          <LimitPriceToggle />
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

          <OrderHistory />
          <WarningMessage />
          <PoweredByOrbs />
        </div>
      </TWAP>
    </>
  );
};
