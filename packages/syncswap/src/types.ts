import { DefaultTheme } from "styled-components";

export interface SyncSwapPallete {
  normal: string;
  primary: string;
  secondary: string;
  banner: string;

  overlay: string;
  overlay2: string;

  error: string;
  info: string;
  light: string;
  light2: string;
  disable: string;

  background: string;
  banner2: string;
  portfolio: string;
}

export interface CustomTheme extends DefaultTheme {
  dappStyles: SyncSwapPallete;
}
