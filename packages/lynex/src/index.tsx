import { Config, Configs } from "@orbs-network/twap-sdk";
import { Translations, Widget, UIPreferences, WidgetProps, WidgetProvider, Components, Types, useWidgetContext } from "@orbs-network/twap-ui";
import translations from "./i18n/en.json";
import { useMemo, ReactNode } from "react";
import React from "react";
import { IoIosArrowDown } from "@react-icons/all-files/io/IoIosArrowDown";
import { MdErrorOutline } from "@react-icons/all-files/md/MdErrorOutline";
import { GlobalStyles } from "./styles";

const uiPreferences: UIPreferences = {
  input: { disableThousandSeparator: true, placeholder: "0.0" },
  tokenSelect: { icon: <IoIosArrowDown style={{ width: 14 }} /> },
  menu: { icon: <IoIosArrowDown style={{ width: 14 }} /> },
  usd: { prefix: "$" },
  message: { errorIcon: <MdErrorOutline style={{ width: 14 }} /> },
};

interface AdapterProps extends Partial<WidgetProps> {
  title: string;
}

const configs = [Configs.Lynex, Configs.Ocelex];

const TWAP = (props: AdapterProps) => {
  const config = useMemo(() => {
    return configs.find((it) => it.chainId === props.chainId) || configs[0];
  }, [props.chainId]);

  return (
    <WidgetProvider
      connect={props.connect!}
      config={config as Config}
      minChunkSizeUsd={props.minChunkSizeUsd}
      translations={translations as Translations}
      walletProvider={props.walletProvider}
      walletClientTransport={props.walletClientTransport}
      account={props.account}
      srcToken={props.srcToken}
      dstToken={props.dstToken}
      onSrcTokenSelected={props.onSrcTokenSelected}
      onDstTokenSelected={props.onDstTokenSelected}
      isLimitPanel={props.isLimitPanel}
      uiPreferences={uiPreferences}
      onSwitchTokens={props.onSwitchTokens}
      srcUsd1Token={props.srcUsd1Token ? Number(props.srcUsd1Token) : 0}
      dstUsd1Token={props.dstUsd1Token ? Number(props.dstUsd1Token) : 0}
      marketPrice={props.marketPrice}
      marketPriceLoading={props.marketPriceLoading}
      chainId={props.chainId}
      isExactAppoval={props.isExactAppoval}
      components={props.components!}
      useToken={props.useToken}
      callbacks={props.callbacks}
      onSwitchFromNativeToWtoken={props.onSwitchFromNativeToWtoken}
    >
      <GlobalStyles />
      <div>
        {props.isLimitPanel ? <LimitPanel title={props.title} /> : <TWAPPanel title={props.title} />}
        <Widget.ErrorMessage />
        <Widget.ShowConfirmationButton />
      </div>
    </WidgetProvider>
  );
};

const InputsPanel = ({ title }: { title?: string }) => {
  return (
    <>
      <ResetButton />
      <div className="twap-inputs-panel">
        <p> {title}</p>
        <Widget.PriceSwitch />
      </div>
      <LimitPrice />
      <div>
        <TokenPanel isSrcToken={true} />
        <Widget.SwitchTokens />
        <TokenPanel isSrcToken={false} />
      </div>
    </>
  );
};

const LimitPrice = () => {
  return (
    <Widget.LimitPricePanel>
      <Widget.LimitPricePanel.Main className="twap-panel-body" />
    </Widget.LimitPricePanel>
  );
};

const ResetButton = () => {
  const { twap } = useWidgetContext();

  return <button onClick={twap.actionHandlers.resetTwap}>Reset</button>;
};

const TWAPPanel = ({ title }: { title?: string }) => {
  return (
    <>
      <InputsPanel title={title} />
      <div>
        <Widget.FillDelayPanel>
          <Widget.FillDelayPanel.Main className="twap-panel-body" />
        </Widget.FillDelayPanel>
        <Widget.TradesAmountPanel>
          <Widget.TradesAmountPanel.Main className="twap-panel-body" />
        </Widget.TradesAmountPanel>
      </div>
    </>
  );
};

const TokenPanel = ({ isSrcToken }: { isSrcToken?: boolean }) => {
  return (
    <Widget.TokenPanel isSrcToken={Boolean(isSrcToken)}>
      <Widget.TokenPanel.BalanceSelect />
      <div className="twap-panel-body">
        <div className={`twap-token-panel-top`}>
          <Widget.TokenPanel.Input />
          <Widget.TokenPanel.Select />
        </div>
        <div className={`twap-token-panel-bottom`}>
          <Widget.TokenPanel.Usd />
          <Widget.TokenPanel.Balance prefix={<span> Balance: </span>} />
        </div>
      </div>
    </Widget.TokenPanel>
  );
};

const LimitPanel = ({ title }: { title?: string }) => {
  return (
    <>
      <InputsPanel title={title} />
      <Widget.DurationPanel>
        <Widget.DurationPanel.Main />
      </Widget.DurationPanel>
    </>
  );
};

TWAP.LimitPriceWarning = Widget.LimitPriceWarning;
TWAP.Orders = Widget.Orders;
TWAP.PoweredByOrbs = Widget.PoweredByOrbs;

const Portal = ({ children, containerId }: { children: ReactNode; containerId: string }) => {
  return <Components.Base.Portal containerId={containerId}>{children}</Components.Base.Portal>;
};

export { TWAP, Portal, Types };
