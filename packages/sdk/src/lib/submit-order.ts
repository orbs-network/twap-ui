import { API_ENDPOINT } from "./consts";
import { Address, Hex, RePermitTypedData, Signature } from "./types";

interface OrderPayload {
  permitted: {
    token: Address; // inputToken
    amount: string; // "1000000000" (USDT 6 decimals)
  };
  spender: Address; // generateAddress()
  nonce: string; // nonce
  deadline: string; // deadline.toString()
  witness: {
    info: {
      reactor: Address; // generateAddress()
      swapper: Address | ""; // "" initially, set to signer later
      nonce: string;
      deadline: string; // deadline.toString()
      additionalValidationContract: Address; // "0x000...000"
      additionalValidationData: Hex; // "0x"
    };
    exclusiveFiller: Address; // "0x000...000"
    exclusivityOverrideBps: string; // "100"
    input: {
      token: Address; // inputToken
      amount: string; // "1000000000"
      maxAmount: string; // "1000000000"
    };
    output: {
      token: Address; // outputToken
      amount: string; // expectedOutputAmount (wei, as string)
      recipient: Address; // generateAddress()
      maxAmount: string; // limitAmount (wei, as string)
    };
    epoch: string; // "" for no epoch
    slippage: string; // "100" (=1%)
    trigger: string; // triggerAmount (wei, as string)
    chainId: string; // "56" (BSC)
  };
}

export const submitOrder = async (permitData: RePermitTypedData, signature: Signature) => {
  const order: OrderPayload = {
    permitted: {
      token: permitData.message.witness.input.token,
      amount: permitData.message.witness.input.amount,
    },
    spender: permitData.message.spender,
    nonce: permitData.message.nonce,
    deadline: permitData.message.deadline,
    witness: {
      info: {
        reactor: permitData.message.witness.info.reactor,
        swapper: permitData.message.witness.info.swapper,
        nonce: permitData.message.witness.info.nonce,
        deadline: permitData.message.witness.info.deadline,
        additionalValidationContract: permitData.message.witness.info.additionalValidationContract,
        additionalValidationData: permitData.message.witness.info.additionalValidationData,
      },
      exclusiveFiller: permitData.message.witness.exclusiveFiller,
      exclusivityOverrideBps: permitData.message.witness.exclusivityOverrideBps,
      input: permitData.message.witness.input,
      output: permitData.message.witness.output,
      epoch: permitData.message.witness.epoch,
      slippage: permitData.message.witness.slippage,
      trigger: permitData.message.witness.output.maxAmount,
      chainId: permitData.domain.chainId.toString(),
    },
  };

  console.log({ order });

  const response = await fetch(`${API_ENDPOINT}/orders`, {
    method: "POST",
    body: JSON.stringify({
      signature,
      order,
      status: "pending",
    }),
  });
  const data = await response.json();
  return data;
};
