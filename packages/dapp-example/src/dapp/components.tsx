import { Token, Widget } from "@orbs-network/twap-ui";
import { Avatar, Button, Flex, Typography } from "antd";
import { ReactNode, useState } from "react";
import { NumberInput, Popup, TokensList } from "../Components";
import { numericFormatter } from "react-number-format";
import { ArrowDown } from "react-feather";
import { useDappStore } from "./store";

const TokenSelectModal = ({ isOpen, onSelect, onClose }: { isOpen: boolean; onSelect: (token: Token) => void; onClose: () => void }) => {
  return (
    <Popup isOpen={isOpen} onClose={onClose} title="Token Select">
      <TokensList onClick={onSelect} />
    </Popup>
  );
};

export const SwitchTokensButton = () => {
  const { switchTokens } = useDappStore();
  return <Button onClick={switchTokens} type="primary" icon={<ArrowDown />} />;
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
}: {
  onSelect: (token: Token) => void;
  usd?: string;
  balance?: string;
  token?: Token;
  onInputChange: (value: string) => void;
  value?: string;
  title?: ReactNode;
  hideBalance?: boolean;
  hideUsd?: boolean;
}) => {
  return (
    <Flex vertical gap={10} style={{ width: "100%" }}>
      <Flex className="token-panel-title">{title}</Flex>
      <Flex gap={10}>
        <NumberInput onChange={onInputChange} value={value} className="token-panel-input" />
        <TokenSelectButton onSelect={onSelect} token={token} />
      </Flex>
      <Flex justify="space-between">
        {!hideUsd && <Typography style={{ fontSize: 14, color: "white", opacity: 0.5 }}>${numericFormatter(usd, { thousandSeparator: true, decimalScale: 2 })}</Typography>}
        {!hideBalance && (
          <Typography style={{ fontSize: 14, color: "white", opacity: 0.5 }}>
            {numericFormatter(balance, { thousandSeparator: true, decimalScale: 2 })} {token?.symbol}
          </Typography>
        )}
      </Flex>
    </Flex>
  );
};

export const Section = ({ children }: { children: React.ReactNode }) => {
  return (
    <Flex vertical gap={10} style={{ width: "100%", borderRadius: 12, padding: 16, background: "#131313" }}>
      {children}
    </Flex>
  );
};
