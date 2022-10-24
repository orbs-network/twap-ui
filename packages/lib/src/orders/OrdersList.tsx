import { Box, styled } from "@mui/system";
import React, { useState } from "react";
import { useWeb3 } from "../store/store";
import { createTxData } from "./data";
import LimitOrder from "./Order";

// TODO chnage all limitOrder -->  orders, ordersList, Order

const data = createTxData();
function OrdersList() {
  const [selected, setSelected] = useState<number | undefined>(undefined);
  const { account } = useWeb3();
  console.log({ account });

  const onSelect = (value: number) => {
    setSelected((prevState) => (prevState === value ? undefined : value));
  };
  return (
    <StyledContainer>
      {data.map((it, index) => {
        return <LimitOrder key={index} expanded={index === selected} onExpand={() => onSelect(index)} />;
      })}
    </StyledContainer>
  );
}

export default OrdersList;

const StyledContainer = styled(Box)({
  width: "100%",
  display: "flex",
  flexDirection: "column",
  gap: 10,
});
