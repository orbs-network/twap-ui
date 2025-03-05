import React, { useCallback, useState } from "react";
import { TokenLogo } from "../../components/base";
import { StyledText } from "../../styles";
import { IoIosArrowDown } from "@react-icons/all-files/io/IoIosArrowDown";
import { useTwapContext } from "../../context";
import { useToken, useTokenSelect } from "../../hooks/ui-hooks";

export const TokenSelect = ({ className = "", isSrcToken = false }: { className?: string; isSrcToken?: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    translations,
    modals: { TokenSelectModal },
    components,
  } = useTwapContext();
  const token = useToken({ isSrcToken });

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

  const modal = <TokenSelectModal onClose={onClose} isOpen={isOpen} isSrcToken={isSrcToken} onSelect={onTokenSelect} />;

  if (components.CurrencySelectButton) {
    return (
      <>
        {modal}
        <components.CurrencySelectButton token={token} onClick={onOpen} />
      </>
    );
  }

  return (
    <>
      {modal}
      <div className={`twap-token-select ${className} ${!token ? "twap-token-select-not-selected" : "twap-token-select-selected"}`} onClick={onOpen}>
        {token && <TokenLogo logo={token?.logoUrl} />}
        <StyledText className="twap-token-select-symbol">{token ? token.symbol : translations.selectToken}</StyledText>
        {<IoIosArrowDown className="twap-token-select-icon" />}
      </div>
    </>
  );
};
