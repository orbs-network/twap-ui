import { Config } from "@orbs-network/twap-sdk";
import { FC, ReactNode } from "react";
import { Token, Translations, TwapContextUIPreferences, TWAPProps } from "../types";

export type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: ReactNode;
};

interface Components {
  Modal: FC<ModalProps>;
  TokensListModal: FC<{ isSrcToken?: boolean; isOpen: boolean; onClose: () => void }>;
}

export interface PanelProps extends TWAPProps {
  config: Config;
  translations?: Translations;
  tokens?: Token[];
  srcToken?: Token;
  dstToken?: Token;
  uiPreferences?: TwapContextUIPreferences;
  srcUsd?: string | number;
  dstUsd?: string | number;
  marketPrice?: string;
  isExactAppoval?: boolean;
  children: React.ReactNode;
  components: Components;
}
