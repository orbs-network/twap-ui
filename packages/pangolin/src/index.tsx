import { Components, hooks, Translations, TwapAdapter, useTwapContext, Styles as TwapStyles, TWAPTokenSelectProps, TWAPProps, Configs, Token } from "@orbs-network/twap-ui";
import { memo, useCallback, useState, createContext, ReactNode, useContext } from "react";
import translations from "./i18n/en.json";
import Web3 from "web3";
import { configureStyles } from "./styles";
import { isNativeAddress, network } from "@defi.org/web3-candies";

interface PangolinTWAPProps extends TWAPProps {
  theme: any;
  partnerDaas?: string;
}

interface ContextProps {
  twapProps: PangolinTWAPProps;
  children: ReactNode;
}

interface Values extends PangolinTWAPProps {
  toggleOrders: () => void;
  showOrders: boolean;
}

const Context = createContext({} as Values);

const AdapterContextProvider = ({ twapProps, children }: ContextProps) => {
  const [showOrders, setShowOrders] = useState(false);

  const values = {
    ...twapProps,
    toggleOrders: () => setShowOrders(!showOrders),
    showOrders,
  };

  return <Context.Provider value={values}>{children}</Context.Provider>;
};

const useAdapterContext = () => useContext(Context);

const parseToken = (rawToken: any): Token | undefined => {
  const { config } = getConfig();
  if (!rawToken.symbol) {
    console.error("Invalid token", rawToken);
    return;
  }

  if (!rawToken.address || isNativeAddress(rawToken.address)) {
    return network(config.chainId).native;
  }

  return {
    address: Web3.utils.toChecksumAddress(rawToken.address),
    decimals: rawToken.decimals,
    symbol: rawToken.symbol,
    logoUrl: rawToken.tokenInfo ? rawToken.tokenInfo.logoURI : "",
  };
};

const useGlobalStyles = (theme: any) => {
  return configureStyles(theme);
};

const getConfig = (partnerDaas?: string) => {
  const _partnerDaas = partnerDaas && !isNativeAddress(partnerDaas) ? partnerDaas : undefined;
  const config = _partnerDaas ? Configs.PangolinDaas : Configs.Pangolin;

  return {
    partnerDaas: _partnerDaas,
    config,
  };
};

const Tooltip = () => {
  return <div></div>;
};
const TWAP = memo((props: PangolinTWAPProps) => {
  const globalStyles = useGlobalStyles(props.theme);
  const memoizedConnect = useCallback(() => {
    props.connect?.();
  }, []);

  const { partnerDaas, config } = getConfig(props.partnerDaas);

  return (
    <TwapAdapter
      connect={memoizedConnect}
      config={config}
      maxFeePerGas={props.maxFeePerGas}
      priorityFeePerGas={props.priorityFeePerGas}
      translations={translations as Translations}
      provider={props.provider}
      account={props.account}
      chainId={props.connectedChainId}
      askDataParams={[partnerDaas]}
      dappTokens={props.dappTokens}
      onSrcTokenSelected={props.onSrcTokenSelected}
      onDstTokenSelected={props.onDstTokenSelected}
      parsedTokens={[]}
      isLimitPanel={props.limit}
      Components={{ Tooltip }}
    >
      <AdapterContextProvider twapProps={props}>
        <div className="twap-container">{props.limit ? <LimitPanel /> : <TWAPPanel />}</div>
      </AdapterContextProvider>
    </TwapAdapter>
  );
});

const TWAPPanel = () => {
  return (
    <>
      <TokenPanel isSrcToken={true} />
      <Components.ChangeTokensOrder />
      <TokenPanel isSrcToken={false} />
      <TradeSize />
      <TradeInterval />
      <MaxDuration />
      {/* <Components.SubmitButton /> */}

      <Components.PoweredBy />
    </>
  );
};

const LimitPanel = () => {
  return (
    <>
      <TokenPanel isSrcToken={true} />
      <Components.ChangeTokensOrder />
      <TokenPanel />
      {/* <Components.SubmitButton /> */}
      <Components.PoweredBy />
    </>
  );
};

const buttons = [
  { text: "25%", value: 0.25 },
  { text: "50%", value: 0.5 },
  { text: "75%", value: 0.75 },
  { text: "100%", value: 1 },
];
const SrcTokenPercentSelector = () => {
  const onPercentClick = hooks.useOnSrcAmountPercent();

  return (
    <TwapStyles.StyledRowFlex gap={5} style={{ width: "auto" }}>
      {buttons.map((btn) => {
        return (
          <button className="twap-percent-button" key={btn.text} onClick={() => onPercentClick(btn.value)}>
            {btn.text}
          </button>
        );
      })}
    </TwapStyles.StyledRowFlex>
  );
};

const TradeSize = () => {
  return (
    <Components.Base.Card className="twap-trade-size">
      <TwapStyles.StyledColumnFlex gap={5}>
        <TwapStyles.StyledRowFlex gap={15} justifyContent="space-between" style={{ minHeight: 40 }}>
          <Components.Labels.TotalTradesLabel />
        </TwapStyles.StyledRowFlex>
        <TwapStyles.StyledRowFlex className="twap-chunks-size" justifyContent="space-between">
          <Components.TradeSize />
          <Components.ChunksUSD />
        </TwapStyles.StyledRowFlex>
      </TwapStyles.StyledColumnFlex>
    </Components.Base.Card>
  );
};

const MaxDuration = () => {
  return (
    <Components.Base.Card>
      <TwapStyles.StyledRowFlex gap={10} justifyContent="space-between">
        <Components.Labels.MaxDurationLabel />
      </TwapStyles.StyledRowFlex>
    </Components.Base.Card>
  );
};

const TradeInterval = () => {
  return (
    <Components.Base.Card>
      <TwapStyles.StyledRowFlex>
        <Components.Labels.TradeIntervalLabel />
        <TwapStyles.StyledRowFlex style={{ flex: 1 }}>
          <Components.TradeIntervalSelector />
        </TwapStyles.StyledRowFlex>
      </TwapStyles.StyledRowFlex>
    </Components.Base.Card>
  );
};

const ModifiedTokenSelectModal = (props: TWAPTokenSelectProps) => {
  const TokenSelectModal = useAdapterContext().TokenSelectModal;

  return <TokenSelectModal onCurrencySelect={props.onSelect} isOpen={props.isOpen} onClose={props.onClose} />;
};

const memoizedTokenSelect = memo(ModifiedTokenSelectModal);

const TokenSelect = ({ open, onClose, isSrcToken }: { open: boolean; onClose: () => void; isSrcToken?: boolean }) => {
  return <Components.TokenSelectModal Component={memoizedTokenSelect} isOpen={open} onClose={onClose} isSrc={isSrcToken} />;
};

const TokenPanel = ({ isSrcToken }: { isSrcToken?: boolean }) => {
  const [tokenListOpen, setTokenListOpen] = useState(false);
  const translations = useTwapContext().translations;

  const onClose = useCallback(() => {
    setTokenListOpen(false);
  }, []);

  return (
    <>
      <TokenSelect onClose={onClose} open={tokenListOpen} isSrcToken={isSrcToken} />
      <TwapStyles.StyledColumnFlex gap={4} className="twap-token-panel">
        <TwapStyles.StyledRowFlex justifyContent="space-between">
          <Components.Base.SmallLabel className="twap-panel-title">{isSrcToken ? translations.from : `${translations.to} (${translations.estimated})`}</Components.Base.SmallLabel>
          {isSrcToken && <SrcTokenPercentSelector />}
        </TwapStyles.StyledRowFlex>
        <Components.Base.Card>
          <TwapStyles.StyledColumnFlex gap={15}>
            <TwapStyles.StyledRowFlex justifyContent="space-between">
              <Components.TokenPanelInput isSrc={isSrcToken} />
              <Components.TokenSelect isSrc={isSrcToken} onClick={() => setTokenListOpen(true)} />
            </TwapStyles.StyledRowFlex>
            <TwapStyles.StyledRowFlex justifyContent="space-between">
              <Components.TokenUSD isSrc={isSrcToken} />
              <Components.TokenBalance isSrc={isSrcToken} />
            </TwapStyles.StyledRowFlex>
          </TwapStyles.StyledColumnFlex>
        </Components.Base.Card>
      </TwapStyles.StyledColumnFlex>
    </>
  );
};

const memoizedTWAP = memo(TWAP);

export { memoizedTWAP as TWAP };
