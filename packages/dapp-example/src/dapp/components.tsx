import { Token, useFormatNumber } from "@orbs-network/twap-ui";
import { Avatar, Button, Flex, Typography } from "antd";
import { useState } from "react";
import { NumberInput, Popup, TokensList } from "../Components";
import { ArrowDown } from "react-feather";
import { useDappStore } from "./store";
import clsx from "clsx";

const TokenSelectModal = ({ isOpen, onSelect, onClose }: { isOpen: boolean; onSelect: (token: Token) => void; onClose: () => void }) => {
  return (
    <Popup isOpen={isOpen} onClose={onClose} title="Token Select">
      <TokensList onClick={onSelect} />
    </Popup>
  );
};

export const SwitchTokensButton = () => {
  const { switchTokens } = useDappStore();
  return (
    <Flex style={{ height: 10 }} align="center" justify="center">
      <Button onClick={switchTokens} type="primary" icon={<ArrowDown />} />;
    </Flex>
  );
};

const TokenSelectButton = ({ onSelect, token }: { onSelect: (token: Token) => void; token?: Token }) => {
  const [isOpen, setIsOpen] = useState(false);

  const onTokenSelect = (token: Token) => {
    onSelect(token);
    setIsOpen(false);
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        style={{
          borderRadius: 20,
          fontSize: 15,
          height: "auto",
          fontWeight: 500,
          background: "transparent",
          border: "1px solid #E0E0E0",
          color: "white",
          padding: "4px 12px 4px 4px ",
        }}
      >
        <Avatar src={token?.logoUrl} size={30} />
        <Typography style={{ fontSize: 15, fontWeight: 500, color: "white" }}>{token?.symbol}</Typography>
      </Button>
      <TokenSelectModal isOpen={isOpen} onSelect={onTokenSelect} onClose={() => setIsOpen(false)} />
    </>
  );
};

export const CurrencyInputPanel = ({
  onSelect,
  usd = "",
  balance = "",
  token,
  onInputChange,
  value = "",
  title,
  hideBalance = false,
  hideUsd = false,
  disabled = false,
}: {
  onSelect: (token: Token) => void;
  usd?: string;
  balance?: string;
  token?: Token;
  onInputChange: (value: string) => void;
  value?: string;
  title?: string;
  hideBalance?: boolean;
  hideUsd?: boolean;
  disabled?: boolean;
}) => {
  const usdF = useFormatNumber({ value: usd, decimalScale: 2 });
  const balanceF = useFormatNumber({ value: balance, decimalScale: 4 });
  return (
    <Flex vertical gap={10} style={{ width: "100%" }}>
      {title && <Typography className="token-panel-title">{title}</Typography>}
      <Flex gap={10}>
        <NumberInput onChange={onInputChange} value={value} disabled={disabled} className="flex-1" />
        <TokenSelectButton onSelect={onSelect} token={token} />
      </Flex>
      <Flex justify="space-between">
        {!hideUsd && <Typography style={{ fontSize: 14, color: "white", opacity: 0.5 }}>${usdF || "0"}</Typography>}
        {!hideBalance && (
          <Typography style={{ fontSize: 14, color: "white", opacity: 0.5 }} onClick={() => onInputChange(balance)}>
            {balanceF || "0"} {token?.symbol}
          </Typography>
        )}
      </Flex>
    </Flex>
  );
};

export const Section = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  return <div className={clsx(`flex flex-col w-full bg-[#131313] rounded-[12px] p-4 gap-4`, className)}>{children}</div>;
};
