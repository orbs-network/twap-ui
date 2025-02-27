import React, { useCallback, useState } from "react";
import { TokenLogo } from "../../components/base";
import { StyledText } from "../../styles";
import { IoIosArrowDown } from "@react-icons/all-files/io/IoIosArrowDown";
import { useTwapContext } from "../../context";
import { useToken, useTokenSelect } from "../../hooks/ui-hooks";

export const TokenSelect = ({ className = "", isSrcToken = false, onCustomSelect }: { className?: string; isSrcToken?: boolean; onCustomSelect?: (token: any) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { uiPreferences, translations } = useTwapContext();
  const TokensListModal = useTwapContext().components.TokensListModal;
  const token = useToken({ isSrcToken });

  const onSelect = useTokenSelect({ isSrcToken });
  const onOpen = useCallback(() => setIsOpen(true), []);
  const onClose = useCallback(() => setIsOpen(false), []);

  const onTokenSelect = useCallback(
    (token: any) => {
      if (onCustomSelect) {
        onCustomSelect(token);
      } else {
        onSelect(token);
      }
      onClose();
    },
    [onSelect, onClose, onCustomSelect],
  );

  return (
    <>
      {TokensListModal && <TokensListModal onClose={onClose} isOpen={isOpen} isSrcToken={isSrcToken} onSelect={onTokenSelect} />}
      <div className={`twap-token-select ${className} ${!token ? "twap-token-select-not-selected" : "twap-token-select-selected"}`} onClick={onOpen}>
        {token && <TokenLogo logo={token?.logoUrl} />}
        <StyledText className="twap-token-select-symbol">{token ? token.symbol : translations.selectToken}</StyledText>
        {uiPreferences.tokenSelect?.icon || <IoIosArrowDown className="twap-token-select-icon" />}
      </div>
    </>
  );
};
