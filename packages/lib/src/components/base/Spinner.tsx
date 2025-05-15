import { useTwapContext } from "../../context";

// Circular Progress component
export const Spinner = () => {
  const { components } = useTwapContext();
  if (!components.Spinner) return null;
  return <components.Spinner />;
};
