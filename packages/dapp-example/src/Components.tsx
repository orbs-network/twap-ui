import { Modal, Typography } from "antd";
import { CSSProperties, ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { Module, Token, useFormatNumber } from "@orbs-network/twap-ui";
import { Config, Configs, eqIgnoreCase, getNetwork, PartnerChains, Partners } from "@orbs-network/twap-sdk";
import { useToken, useTokenBalance, useTokenList, useTokenUsd } from "./hooks";
import { Virtuoso } from "react-virtuoso";
import { useDappContext } from "./context";
import { useSwitchChain } from "wagmi";
import { NumericFormat } from "react-number-format";
import BN from "bignumber.js";
import { isAddress, maxUint256 } from "viem";
import { useAppParams } from "./dapp/hooks";
import { AiFillQuestionCircle } from "@react-icons/all-files/ai/AiFillQuestionCircle";
import clsx from "clsx";
import { SettingsIcon } from "lucide-react";
import { configToPartner, getProductionLink } from "./utils";

export const NumberInput = (props: {
  onChange: (value: string) => void;
  value?: string | number;
  placeholder?: string;
  disabled?: boolean;
  isAllowed?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  loading?: boolean;
  className?: string;
  maxValue?: number;
  prefix?: string;
  decimalScale?: number;
  minAmount?: number;
  suffix?: string;
  error?: boolean;
  inputClassName?: string;
  allowNegative?: boolean;
}) => {
  const {
    onChange,
    value,
    placeholder,
    allowNegative = false,
    disabled,
    onFocus,
    onBlur,
    maxValue,
    prefix,
    decimalScale,
    minAmount,
    suffix,
    error,
    loading,
    inputClassName,
  } = props;

  const inputValue = value || minAmount || "";

  return (
    <div
      className={clsx(
        ` text-white flex min-h-[30px] items-center px-3 text-right w-full rounded-lg  py-2 bg-[rgba(255,255,255,0.05)] ${props.className} ${
          disabled ? "input-disabled" : ""
        } relative ${error ? "text-[#FF0000]" : ""}`,
      )}
    >
      {loading && <div className="w-[70%] h-[22px] bg-[rgba(255,255,255,0.1)] rounded-lg animate-pulse" />}
      {!loading && (
        <NumericFormat
          className={clsx("bg-transparent w-full h-full outline-none", inputClassName)}
          allowNegative={allowNegative}
          disabled={disabled}
          decimalScale={decimalScale}
          onBlur={onBlur}
          name="number-input"
          onFocus={onFocus}
          placeholder={placeholder || "0"}
          max={maxValue}
          isAllowed={(values) => {
            const { floatValue = 0 } = values;
            return maxValue ? floatValue <= parseFloat(maxValue.toString()) : BN(floatValue).isLessThanOrEqualTo(maxUint256.toString());
          }}
          prefix={prefix ? `${prefix} ` : ""}
          suffix={suffix ? `${suffix} ` : ""}
          value={disabled && value === "0" ? "" : inputValue}
          thousandSeparator={","}
          decimalSeparator="."
          type="text"
          valueIsNumericString
          min={minAmount}
          onValueChange={(values, _sourceInfo) => {
            if (_sourceInfo.source !== "event") {
              return;
            }

            onChange(values.value === "." ? "0." : values.value);
          }}
        />
      )}
    </div>
  );
};

export const Popup = ({
  isOpen,
  onClose,
  children,
  className = "",
  title,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  title?: ReactNode;
}) => {
  return (
    <Modal
      centered={true}
      open={isOpen}
      onCancel={onClose}
      footer={null}
      classNames={{
        content: `popup-main ${className} text-white`,
      }}
      styles={{
        content: {
          borderRadius: 16,
        },
      }}
    >
      <div className="popup-header text-[20px] pb-2 text-white">{title && title}</div>
      <div className="popup-content text-white">{children}</div>
    </Modal>
  );
};

export const TokenSearchInput = ({ setValue, value }: { value: string; setValue: (value: string) => void }) => {
  return <input className="token-select-input" placeholder="Insert token name..." value={value || ""} onChange={(e: any) => setValue(e.target.value)} />;
};

function TokenLogo({ logo, className = "", style = {}, alt = "Token logo" }: { logo?: string; className?: string; style?: CSSProperties; alt?: string }) {
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
  }, [logo]);

  return logo && !error ? (
    <img alt={alt} style={style} onError={() => setError(true)} className={`twap-token-logo ${className}`} src={logo} />
  ) : (
    <AiFillQuestionCircle style={{ width: 20, height: 20 }} className="twap-token-svg" />
  );
}

const Row = ({ onClick, token }: any) => {
  const balance = useTokenBalance(token).data?.ui;
  const balanceF = useFormatNumber({ value: balance, decimalScale: 6 });

  const usd = useTokenUsd(token?.address);
  const usdF = useFormatNumber({ value: usd || "0", decimalScale: 2 });

  return (
    <div onClick={() => onClick(token)} className="token-select-list-token list-item">
      <div className="token-select-list-token-left">
        <TokenLogo
          logo={token.logoUrl}
          alt={token.symbol}
          style={{
            width: 30,
            height: 30,
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />
        {token.symbol}
      </div>
      <div className="token-select-list-token-right">
        <Typography className="usd">{`$${usdF}`}</Typography>
        <Typography className="balance">{balanceF}</Typography>
      </div>
    </div>
  );
};

const partners = Object.entries(PartnerChains).map(([partner, chains]) => ({ partner, chains }));

export const PartnerSelector = () => {
  const { partnerSelect, partner, chainId } = useAppParams();

  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState("");

  const onClose = useCallback(() => setIsOpen(false), []);
  const onOpen = useCallback(() => setIsOpen(true), []);

  const network = useMemo(() => getNetwork(chainId), [chainId]);
  const onSelect = useCallback(
    (partner: Partners, chainId: number) => {
      partnerSelect(partner, chainId);
      onClose();
    },
    [onClose, partnerSelect],
  );

  const list = useMemo(() => {
    if (!filter) return partners;
    return partners.filter((it) => {
      return it.partner.toLowerCase().indexOf(filter.toLowerCase()) >= 0 || it.chains.toString().indexOf(filter) >= 0;
    });
  }, [filter]);

  return (
    <>
      <button className="config-select-button px-4" onClick={onOpen}>
        <p>
          {partner} <small>{`(${network?.shortname})`}</small>
        </p>
        <svg fill="none" height="7" width="14" xmlns="http://www.w3.org/2000/svg">
          <title>Dropdown</title>
          <path
            d="M12.75 1.54001L8.51647 5.0038C7.77974 5.60658 6.72026 5.60658 5.98352 5.0038L1.75 1.54001"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.5"
            xmlns="http://www.w3.org/2000/svg"
          ></path>
        </svg>
      </button>
      <Popup
        title={
          <div className="flex items-center gap-2">
            Partner select <small className="text-[14px] text-white/50">{`(${Object.values(Configs).length})`}</small>
          </div>
        }
        isOpen={isOpen}
        onClose={onClose}
        className="config-select-popup"
      >
        <div className="config-select-content">
          <input value={filter} onChange={(e) => setFilter(e.target.value)} className="token-select-input" placeholder="Search..." />
          <div className="config-select-list">
            {list.map((it, index) => {
              const productionLink = getProductionLink(it.partner as Partners);

              return it.chains.map((chain) => {
                const network = getNetwork(chain);
                return (
                  <div className="config-select-list-item list-item items-center w-full" onClick={() => onSelect(it.partner as Partners, chain)} key={index}>
                    <p>
                      <span className="capitalize"> {it.partner}</span> <small>{`(${network?.shortname} ${chain})`}</small>
                    </p>
                    {productionLink ? <p className="text-sm text-white ml-auto">Prod</p> : null}
                  </div>
                );
              });
            })}
          </div>
        </div>
      </Popup>
    </>
  );
};

interface TokensListProps {
  onClick: (token: Token) => void;
}

export const TokensList = ({ onClick }: TokensListProps) => {
  const tokens = useTokenList();

  const [filterValue, setFilterValue] = useState("");

  const dynamicToken = useToken(isAddress(filterValue) ? filterValue : undefined).token;

  const filteredTokens = useMemo(() => {
    if (!filterValue) return tokens;
    const result = tokens.filter((it) => {
      return it.symbol.toLowerCase().indexOf(filterValue.toLowerCase()) >= 0 || eqIgnoreCase(it.address, filterValue);
    });
    return !result.length && dynamicToken ? [dynamicToken] : result;
  }, [filterValue, tokens, dynamicToken]);

  return (
    <div className="token-select">
      <TokenSearchInput setValue={setFilterValue} value={filterValue} />
      <div className="token-select-list">
        <Virtuoso
          totalCount={filteredTokens.length}
          overscan={10}
          className="twap-order-history-list"
          style={{ height: "100%", width: "100%" }}
          itemContent={(index) => {
            const token = filteredTokens[index];
            return <Row onClick={onClick} token={token} />;
          }}
        />
      </div>
    </div>
  );
};

const SettingsModal = ({ className }: { className?: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { slippage, setSlippage } = useDappContext();
  return (
    <>
      <SettingsIcon onClick={() => setIsOpen(true)} className="cursor-pointer text-white" />
      <Modal
        footer={null}
        classNames={{
          content: `popup-main ${className}`,
        }}
        open={isOpen}
        onCancel={() => setIsOpen(false)}
      >
        <div className="text-white pt-6">
          <div className="flex flex-row gap-2 items-center justify-between">
            <p>Price protection</p>
            <NumberInput onChange={(value) => setSlippage(Number(value))} value={slippage} />
          </div>
        </div>
      </Modal>
    </>
  );
};

export const PanelToggle = () => {
  const { onModuleSelect, module } = useDappContext();

  return (
    <div className="flex items-center gap-2 mb-[20px]">
      <div className="panel-selector">
        {Object.values(Module).map((it) => {
          return (
            <button className={`${module === it ? "panel-selector-btn-selected" : ""} panel-selector-btn`} key={it} onClick={() => onModuleSelect(it)}>
              {it.replace("_", " ")}
            </button>
          );
        })}
      </div>
      <SettingsModal />
    </div>
  );
};
