import React, { useCallback, useState } from "react";
import { TokenLogo } from "../../components/base";
import { IoIosArrowDown } from "@react-icons/all-files/io/IoIosArrowDown";
import { useTwapContext } from "../../context";
import { useTokenSelect } from "../../hooks/ui-hooks";

export const TokenSelect = ({ className = "", isSrcToken = false }: { className?: string; isSrcToken?: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { translations, components, srcToken, dstToken } = useTwapContext();
  const token = isSrcToken ? srcToken : dstToken;

  const onSelect = useTokenSelect({ isSrcToken });
  const onOpen = useCallback(() => setIsOpen(true), []);
  const onClose = useCallback(() => setIsOpen(false), []);

  const onTokenSelect = useCallback(
    (token: any) => {
      onSelect(token);
      onClose();
    },
    [onSelect, onClose],
  );

  const modal = !components.TokenSelectModal ? undefined : <components.TokenSelectModal onClose={onClose} isOpen={isOpen} isSrcToken={isSrcToken} onSelect={onTokenSelect} />;

  if (components.CurrencySelectButton) {
    return (
      <>
        {modal}
        <components.CurrencySelectButton onSelect={onTokenSelect} isSrcToken={isSrcToken} token={token} onClick={onOpen} />
      </>
    );
  }

  return (
    <>
      {modal}
      <div className={`twap-token-select ${className} ${!token ? "twap-token-select-not-selected" : "twap-token-select-selected"}`} onClick={onOpen}>
        {token && components.TokenLogo ? <components.TokenLogo token={token} /> : <TokenLogo logo={token?.logoUrl} />}
        <p className="twap-token-select-symbol">{token ? token.symbol : translations.selectToken}</p>
        {<IoIosArrowDown className="twap-token-select-icon" />}
      </div>
    </>
  );
};
