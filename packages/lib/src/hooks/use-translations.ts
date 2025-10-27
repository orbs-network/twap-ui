import { useTwapContext } from "../context/twap-context";
import { Translations } from "../types";
import defaultTranslations from "../i18n/en.json";
import { useCallback } from "react";

export const useTranslations = () => {
  const context = useTwapContext();

  const t = useCallback(
    (key: keyof Translations, args?: Record<string, string>): string => {
      const dynamicTranslation = context.getTranslation?.(key, args);
      const staticTranslation = context.translations?.[key] || defaultTranslations[key];
      return dynamicTranslation || staticTranslation.replace(/{(\w+)}/g, (match, p1) => args?.[p1] || match);
    },
    [context.getTranslation, context.translations],
  );

  return t;
};
