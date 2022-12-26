import { OrdersProps, TWAPProps } from "@orbs-network/twap-ui";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface PangolinOrdersProps extends OrdersProps {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface

export interface PangolinTheme {
  swapWidget: {
    backgroundColor: string;
    detailsBackground: string;
    interactiveBgColor: string;
    interactiveColor: string;
    primary: string;
    secondary: string;
  };
  textInput: {
    labelText: string;
  };
  drawer: {
    text: string;
    backgroundColor: string;
  };
  numberOptions: {
    activeTextColor: string;
    text: string;
    activeBackgroundColor: string;
    borderColor: string;
    inactiveBackgroundColor: string;
  };
  button: {
    primary: {
      background: string;
      color: string;
    };
  };
}

export interface PangolinTWAPProps extends TWAPProps {
  theme: any;
}
