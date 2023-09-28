import { ORDERS_CONTAINER_ID } from "../consts";
import { useTwapStore } from "../store";

export const Orders = () => {
  const { lib } = useTwapStore();
  if (!lib) return null;
  return <div id={ORDERS_CONTAINER_ID} />;
};
