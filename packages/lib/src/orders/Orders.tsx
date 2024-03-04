import { ORDERS_CONTAINER_ID } from "../consts";
import { useTwapContext } from "../context";

export const Orders = () => {
  const ordersId = useTwapContext().ordersId;
  return <div id={ordersId || ORDERS_CONTAINER_ID} />;
};
