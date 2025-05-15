import { useTwapContext } from "../../context";

// Skeleton Loader component
export const Loader = () => {
  const { components } = useTwapContext();
  if (!components.SkeletonLoader) return null;
  return <components.SkeletonLoader />;
};
