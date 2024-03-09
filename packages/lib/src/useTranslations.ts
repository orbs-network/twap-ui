import { create } from "zustand";
import { Translations } from "./types";
import defaultTranlations from "./i18n/en.json";

interface TranslationsStore {
  translations: Translations;
  setTranslations: (translations?: Partial<Translations>) => void;
}

export const useTranslations = create<TranslationsStore>((set, get) => ({
  translations: defaultTranlations,
  setTranslations: (translations = {}) => set({ translations: { ...get().translations, ...translations } }),
}));
