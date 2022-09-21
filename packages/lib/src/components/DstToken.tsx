import TokenInput from "../base-components/TokenInput";
import { useDstToken } from "../store/store";

function DstToken() {
  const { address, uiAmount } = useDstToken();

  return <TokenInput disabled={true} address={address} amount={uiAmount} />;
}

export default DstToken;
