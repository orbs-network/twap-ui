import { useTwapContext } from "../context";

export const useTranslation = () => {
  return useTwapContext().translations;
};
