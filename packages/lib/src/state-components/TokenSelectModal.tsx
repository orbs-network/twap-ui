import { TokenData } from "@orbs-network/twap";
import { useTwapStore } from "../store";

interface Props {
  Modal?: any;
  onSrcSelect?: (token: any) => void;
  onDstSelect?: (token: any) => void;
  isOpen: boolean;
  onClose: () => void;
  isSrc?: boolean;
  parseToken: (value: any) => TokenData;
}

const TokenSelectModal = ({ Modal, isOpen, onClose, parseToken, onSrcSelect, onDstSelect, isSrc }: Props) => {
  const setSrcToken = useTwapStore((store) => store.setSrcToken);
  const setDstToken = useTwapStore((store) => store.setDstToken);

  const onTokenSelected = (token: any) => {
    onClose();

    if (isSrc) {
      setSrcToken(parseToken ? parseToken(token) : token);
      onSrcSelect?.(token);
    } else {
      setDstToken(parseToken ? parseToken(token) : token);
      onDstSelect?.(token);
    }
  };

  if (!isOpen) return null;
  return <Modal isOpen={true} onClose={onClose} onCurrencySelect={onTokenSelected} selectedCurrency={undefined} otherSelectedCurrency={undefined} />;
};

export default TokenSelectModal;
