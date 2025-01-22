import { Config } from "@orbs-network/twap-sdk";
import { FC, ReactNode } from "react";
import { Token, Translations, TwapContextUIPreferences, TWAPProps } from "../types";

export type WidgetModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: ReactNode;
};

export type TokensListModalProps = {
  isSrcToken?: boolean;
  isOpen: boolean;
  onClose: () => void;
  selectedToken?: Token;
};

interface Components {
  Modal: FC<WidgetModalProps>;
  TokensListModal: FC<TokensListModalProps>;
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
