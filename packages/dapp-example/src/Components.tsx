import Dialog from "@mui/material/Dialog";
import React, { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { Components, Token, useFormatNumber } from "@orbs-network/twap-ui";
import { Config, Configs, eqIgnoreCase, getNetwork } from "@orbs-network/twap-sdk";
import { MdClose } from "@react-icons/all-files/md/MdClose";
import { BsMoon } from "@react-icons/all-files/bs/BsMoon";
import { BsSun } from "@react-icons/all-files/bs/BsSun";
import { useToken, useTokenBalance, useTokenList, useTokenUsd } from "./hooks";
import { Virtuoso } from "react-virtuoso";
import { Panels, useDappContext } from "./context";
import { useSwitchChain } from "wagmi";

export const Popup = ({ isOpen, onClose, children, className = "", title }: { isOpen: boolean; onClose: () => void; children: ReactNode; className?: string; title?: string }) => {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      classes={{
        paper: `popup-main ${className}`,
      }}
    >
      <div className="popup-header">
        {title && <h2>{title}</h2>}
        <button onClick={onClose} className="close-btn">
          <MdClose />
        </button>
      </div>
      <div className="popup-content">{children}</div>
    </Dialog>
  );
};

export const ToggleTheme = () => {
  const size = 18;
  const { setTheme, theme } = useDappContext();
  return (
    <div>
      <button
        style={{
          opacity: theme === "dark" ? 0.5 : 1,
        }}
        onClick={() => setTheme("light")}
      >
        <BsMoon style={{ width: size, height: size }} />
      </button>
      <button
        style={{
          opacity: theme === "light" ? 0.5 : 1,
        }}
        onClick={() => setTheme("dark")}
      >
        <BsSun style={{ width: size, height: size }} />
      </button>
    </div>
  );
};

export const TokenSearchInput = ({ setValue, value }: { value: string; setValue: (value: string) => void }) => {
  return <input className="token-select-input" placeholder="Insert token name..." value={value || ""} onChange={(e: any) => setValue(e.target.value)} />;
};

const Row = ({ onClick, token }: any) => {
  const balance = useTokenBalance(token).data?.ui;
  const balanceF = useFormatNumber({ value: balance, decimalScale: 6 });

  const usd = useTokenUsd(token?.address);
  const usdF = useFormatNumber({ value: usd || "0", decimalScale: 2 });

  return (
    <div onClick={() => onClick(token)} className="token-select-list-token list-item">
      <div className="token-select-list-token-left">
        <Components.Base.TokenLogo
          logo={token.logoUrl}
          alt={token.symbol}
          style={{
            width: 30,
            height: 30,
          }}
        />
        {token.symbol}
      </div>
      <div className="token-select-list-token-right">
        <Components.Base.SmallLabel loading={usd === undefined} className="usd">
          {`$${usdF}`}
        </Components.Base.SmallLabel>
        <Components.Base.SmallLabel loading={balance === undefined} className="balance">
          {balanceF}
        </Components.Base.SmallLabel>
      </div>
    </div>
  );
};

const configs = Object.values(Configs);

export const ConfigSelector = () => {
  const { setConfig, config } = useDappContext();
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState("");

  const onClose = useCallback(() => setIsOpen(false), []);
  const onOpen = useCallback(() => setIsOpen(true), []);
  const { switchChain } = useSwitchChain();

  const network = useMemo(() => getNetwork(config.chainId), [config.chainId]);
  const onSelect = useCallback(
    (config: Config) => {
      setConfig(config);
      switchChain({ chainId: config.chainId });
      onClose();
    },
    [onClose, setConfig, switchChain],
  );

  const list = useMemo(() => {
    if (!filter) return configs;
    return configs.filter((it) => {
      return it.name.toLowerCase().indexOf(filter.toLowerCase()) >= 0 || it.chainId.toString().indexOf(filter) >= 0;
    });
  }, [filter]);

  return (
    <>
      <button className="config-select-button" onClick={onOpen}>
        <p>
          {config.name} <small>{`(${network?.shortname})`}</small>
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
      <Popup title="Partner select" isOpen={isOpen} onClose={onClose} className="config-select-popup">
        <div className="config-select-list">
          <input value={filter} onChange={(e) => setFilter(e.target.value)} className="token-select-input" placeholder="Search..." />
          {list.map((config, index) => {
            const chain = getNetwork(config.chainId);
            return (
              <div className="config-select-list-item list-item" onClick={() => onSelect(config as Config)} key={index}>
                <p>
                  {config.name} <small>{`(${chain?.shortname})`}</small>
                </p>
              </div>
            );
          })}
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

  const dynamicToken = useToken(filterValue).token;

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

export const UISelector = () => {
  const { setPanel, panel } = useDappContext();

  return (
    <div className="panel-selector">
      {Object.values(Panels).map((it) => {
        return (
          <button className={`${panel === it ? "panel-selector-btn-selected" : ""} panel-selector-btn`} key={it} onClick={() => setPanel(it)}>
            {it}
          </button>
        );
      })}
    </div>
  );
};
