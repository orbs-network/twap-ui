import { GlobalStyles, styled, ThemeProvider } from "@mui/material";
import {
  Components,
  TWAPTokenSelectProps,
  Translations,
  TwapAdapter,
  Styles as TwapStyles,
  Orders,
  store,
  TWAPProps,
  getConfig,
  hooks,
  LimitPriceInputProps,
  LimitPricePercentProps,
  Styles,
  LimitPriceZeroButtonProps,
} from "@orbs-network/twap-ui";
import translations from "./i18n/en.json";
import { Configs, TokenData, Config } from "@orbs-network/twap";
import { createContext, FC, useContext, useMemo } from "react";
import Web3 from "web3";
import { isNativeAddress } from "@defi.org/web3-candies";
import { memo, ReactNode, useCallback, useState } from "react";
import {
  StyledBalance,
  StyledPanelInput,
  StyledTokenChange,
  StyledTokenPanel,
  StyledTokenSelect,
  StyledUSD,
  configureStyles,
  StyledOrders,
  StyledPoweredBy,
  darkTheme,
  lightTheme,
  StyledLimitSwitch,
  Card,
  StyledLimitInput,
  StyledSelectButton,
  StyledLimitPanel,
  StyledTradeIntervalInput,
  StyledTradeIntervalResolution,
  StyledTradeInterval,
  StyledResetLimitButtonContainer,
  StyledResetLimitButtonLeft,
  StyledResetLimitButtonRight,
  StyledChunksSelect,
  StyledChunksSelectSlider,
  StyledChunksSelectInput,
  StyledContent,
  StyledSmallText,
  StyledBalanceWarning,
  StyledSwapModalContent,
  StyledTop,
  StyledTokenSelectLimit,
  StyledCreateOrderModal,
} from "./styles";
import { IoMdClose } from "@react-icons/all-files/io/IoMdClose";
import { IoIosArrowDown } from "@react-icons/all-files/io/IoIosArrowDown";

import BN from "bignumber.js";
import { BsArrowDownShort } from "@react-icons/all-files/bs/BsArrowDownShort";
import { IoWalletSharp } from "@react-icons/all-files/io5/IoWalletSharp";
import _ from "lodash";
import { addMissingTokens } from "@orbs-network/twap-ui";
import { LimitPriceTokenSelectProps } from "@orbs-network/twap-ui";
import { TwapContextUIPreferences } from "@orbs-network/twap-ui";

const configs = [Configs.SushiArb, Configs.SushiBase];

const uiPreferences: TwapContextUIPreferences = {
  disableThousandSeparator: true,
  switchVariant: "ios",
};

const ModifiedTokenSelectModal = (props: TWAPTokenSelectProps) => {
  const { TokenSelectModal, dappTokens } = useAdapterContext();

  return (
    <TokenSelectModal
      otherAsset={props.dstTokenSelected}
      selectedAsset={props.srcTokenSelected}
      setSelectedAsset={props.onSelect}
      popup={props.isOpen}
      setPopup={props.onClose}
      baseAssets={dappTokens}
      setOtherAsset={props.onSelect}
    />
  );
};
const memoizedTokenSelect = memo(ModifiedTokenSelectModal);

const TokenSelect = ({ open, onClose, isSrcToken }: { open: boolean; onClose: () => void; isSrcToken?: boolean }) => {
  return <Components.TokenSelectModal Component={memoizedTokenSelect} isOpen={open} onClose={onClose} isSrc={isSrcToken} />;
};

const SmallText = ({ value = "", prefix }: { value?: string; prefix?: string }) => {
  const splitted = value?.split(".");
  const nums = splitted?.[0];
  const decimals = splitted?.[1];
  return (
    <StyledSmallText>
      {prefix}
      {nums}
      {decimals && <small>.{decimals}</small>}
    </StyledSmallText>
  );
};

const Balance = ({ isSrc }: { isSrc?: boolean }) => {
  const onClick = hooks.useSetSrcAmountPercent();
  const _balance = hooks.useTokenBalance(isSrc);
  const isZeroBalance = BN(_balance || 0).eq(0);
  const balance = hooks.useFormatDecimals(_balance, 2);

  return (
    <StyledBalance onClick={!isZeroBalance ? () => onClick(1) : () => {}}>
      <IoWalletSharp />
      <SmallText value={isZeroBalance ? "0.00" : balance} />
    </StyledBalance>
  );
};

const TokenChange = () => {
  return <StyledTokenChange icon={<BsArrowDownShort />} />;
};

const TokenPanelUsd = ({ isSrc, exceedsBalance }: { isSrc?: boolean; exceedsBalance?: boolean }) => {
  const _usd = hooks.useTokenUsd(isSrc);
  const usd = hooks.useFormatDecimals(_usd, 2);

  if (exceedsBalance) {
    return <StyledBalanceWarning>Exceeds Balance</StyledBalanceWarning>;
  }

  return <USD usd={usd} />
};

const TokenPanel = ({ isSrcToken }: { isSrcToken?: boolean }) => {
  const [tokenListOpen, setTokenListOpen] = useState(false);

  const onClose = useCallback(() => {
    setTokenListOpen(false);
  }, []);

  const insufficientFunds = hooks.useBalanceWarning();

  const exceedsBalance = !isSrcToken ? undefined : insufficientFunds;

  return (
    <>
      <TokenSelect onClose={onClose} open={tokenListOpen} isSrcToken={isSrcToken} />

      <StyledTokenPanel error={exceedsBalance ? 1 : 0}>
        <TwapStyles.StyledColumnFlex gap={10}>
          <TwapStyles.StyledRowFlex justifyContent="space-between">
            <StyledPanelInput placeholder="0" isSrc={isSrcToken} />
            <StyledTokenSelect hideArrow={false} isSrc={isSrcToken} onClick={() => setTokenListOpen(true)} />
          </TwapStyles.StyledRowFlex>
          <TwapStyles.StyledRowFlex justifyContent="space-between">
            <TokenPanelUsd exceedsBalance={exceedsBalance} isSrc={isSrcToken} />
            <Balance isSrc={isSrcToken} />
          </TwapStyles.StyledRowFlex>
        </TwapStyles.StyledColumnFlex>
      </StyledTokenPanel>
    </>
  );
};

const parseTokens = (rawTokens: any[], config: Config): TokenData[] => {
  const result = rawTokens.map((rawToken) => {
    const { address, decimals, symbol, logoURI } = rawToken;
    try {
      if (!symbol) {
        console.error("Invalid token", rawToken);
        return;
      }
      if (!address || isNativeAddress(address) || address === "BNB") {
        return config.nativeToken;
      }
      return {
        address: Web3.utils.toChecksumAddress(address),
        decimals,
        symbol,
        logoUrl: logoURI,
      };
    } catch (error) {}
  });

  return _.compact(result);
};

interface SushiProps extends TWAPProps {
  Modal: FC<{ open: boolean; onClose?: () => void; children: ReactNode; title?: string; className?: string; disableBackdropClick?: boolean; header?: ReactNode }>;
}

const AdapterContext = createContext({} as SushiProps);

const AdapterContextProvider = AdapterContext.Provider;

const useAdapterContext = () => useContext(AdapterContext);

const useMarketPrice = (props: SushiProps) => {
  const { srcToken, dstToken } = store.useTwapStore((s) => ({
    srcToken: s.srcToken,
    dstToken: s.dstToken,
  }));

  const amount = hooks.useAmountBN(srcToken?.decimals, "1");
  const trade = props.useTrade!(srcToken?.address, dstToken?.address, BN(amount || 0).isZero() ? undefined : amount);
  return trade?.outAmount;
};

const TWAP = (props: SushiProps) => {
  const chainId = hooks.useChainId(props.provider, props.connectedChainId);
  const config = useMemo(() => {
    return getConfig(configs, chainId);
  }, [chainId]);

  const theme = useMemo(() => {
    return props.isDarkTheme ? darkTheme : lightTheme;
  }, [props.isDarkTheme]);

  const parsedTokens = useMemo(() => {
    if (!_.size(props.dappTokens) || !config) {
      return [];
    }

    const tokens = parseTokens(props.dappTokens, config);

    return addMissingTokens(config, tokens);
  }, [props.dappTokens]);

  const marketPrice = useMarketPrice(props);

  return (
    <div className="twap-adapter-wrapper">
      <TwapAdapter
        connect={props.connect}
        config={config}
        maxFeePerGas={props.maxFeePerGas}
        priorityFeePerGas={props.priorityFeePerGas}
        translations={translations as Translations}
        provider={props.provider}
        account={props.account}
        dappTokens={props.dappTokens}
        connectedChainId={chainId}
        parsedTokens={parsedTokens}
        srcToken={props.srcToken}
        dstToken={props.dstToken}
        onDstTokenSelected={props.onDstTokenSelected}
        onSrcTokenSelected={props.onSrcTokenSelected}
        marketPrice={marketPrice}
        isLimitPanel={props.limit}
        priceUsd={props.priceUsd}
        uiPreferences={uiPreferences}
      >
        <ThemeProvider theme={theme}>
          <GlobalStyles styles={configureStyles(theme) as any} />
          <AdapterContextProvider value={props}>
            {props.limit ? <LimitPanel /> : <TWAPPanel />}
            <Components.LimitPriceMessage />
            <StyledPoweredBy />

            <StyledOrders />
            <SubmitOrderModal />
          </AdapterContextProvider>
        </ThemeProvider>
      </TwapAdapter>
    </div>
  );
};

const USD = ({usd, className = ''}:{usd?: string, className?: string}) => {
  return (
    <StyledUSD className='twap-custom-usd'>
      <SmallText prefix="$ " value={BN(usd || 0).isZero() ? "0.00" : usd} />
    </StyledUSD>
  );
};


const SubmitOrderModal = () => {
  const { Modal } = useAdapterContext();
  const { isOpen, onClose, title } = hooks.useConfirmationModal();

  const onCloseWithDelay = useCallback(() => {
    onClose(500);
  }, [onClose]);

  return (
    <Modal title={title} open={isOpen} onClose={onCloseWithDelay}>
      <StyledSwapModalContent>
        <StyledCreateOrderModal  Components={{USD}} />
      </StyledSwapModalContent>
    </Modal>
  );
};

const LimitInput = (props: LimitPriceInputProps) => {
  return <StyledLimitInput placeholder="0" onChange={props.onChange} value={props.value} loading={props.isLoading} />;
};

const LimitPercentButton = (props: LimitPricePercentProps) => {
  return (
    <StyledSelectButton onClick={props.onClick} selected={props.selected ? 1 : 0}>
      {props.text}
    </StyledSelectButton>
  );
};

const LimitPriceZeroButton = ({ text, onClick }: LimitPriceZeroButtonProps) => {
  return (
    <StyledResetLimitButtonContainer>
      <StyledResetLimitButtonLeft selected={1} onClick={onClick}>
        {text}
      </StyledResetLimitButtonLeft>
      <StyledResetLimitButtonRight selected={1} onClick={onClick}>
        <IoMdClose />
      </StyledResetLimitButtonRight>
    </StyledResetLimitButtonContainer>
  );
};

const LimitPriceTokenSelect = (props: LimitPriceTokenSelectProps) => {
  return (
    <StyledTokenSelectLimit onClick={props.onClick}>
      <Components.Base.TokenDisplay logo={props.token?.logoUrl} symbol={props.token?.symbol} />
      <IoIosArrowDown size={20} />
    </StyledTokenSelectLimit>
  );
};

const LimitPrice = () => {
  const [isSrc, setIsSrc] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const onSrcSelect = useCallback(() => {
    setIsSrc(true);
    setIsOpen(true);
  }, []);

  const onDstSelect = useCallback(() => {
    setIsSrc(false);
    setIsOpen(true);
  }, []);

  const hide = hooks.useShouldWrapOrUnwrapOnly();

  if (hide) return null;

  return (
    <>
      <TokenSelect onClose={() => setIsOpen(false)} open={isOpen} isSrcToken={isSrc} />
      <Card>
        <Card.Header>
          <Components.Labels.LimitPriceLabel />
          <StyledLimitSwitch />
        </Card.Header>
        <Card.Body>
          <StyledLimitPanel
            onSrcSelect={onSrcSelect}
            Components={{ Input: LimitInput, PercentButton: LimitPercentButton, ZeroButton: LimitPriceZeroButton, TokenSelect: LimitPriceTokenSelect }}
            onDstSelect={onDstSelect}
            styles={{
              percentButtonsGap: "5px",
            }}
          />
        </Card.Body>
      </Card>
    </>
  );
};

const TWAPPanel = () => {
  return (
    <div className="twap-container">
      <StyledContent>
        <StyledTop>
          <TokenPanel isSrcToken={true} />
          <TokenChange />
          <TokenPanel />
        </StyledTop>
        <LimitPrice />
        <TotalTrades />
        <TradeIntervalSelect />

        <Components.ShowConfirmation />
      </StyledContent>
    </div>
  );
};

const LimitPanel = () => {
  return (
    <div className="twap-container">
      <StyledContent>
        <StyledTop>
          <TokenPanel isSrcToken={true} />
          <TokenChange />
          <TokenPanel />
        </StyledTop>
        <LimitPrice />
        <Components.ShowConfirmation />
      </StyledContent>
    </div>
  );
};

const TotalTrades = () => {
  const hide = hooks.useShouldWrapOrUnwrapOnly();

  if (hide) return null;
  return (
    <Card>
      <Card.Header>
        <Components.Labels.TotalTradesLabel />
      </Card.Header>
      <StyledChunksSelect>
        <Styles.StyledRowFlex style={{ alignItems: "stretch" }}>
          <StyledChunksSelectInput>
            <Components.ChunkSelector.Input />
          </StyledChunksSelectInput>
          <StyledChunksSelectSlider>
            <Components.ChunkSelector.Slider />
          </StyledChunksSelectSlider>
        </Styles.StyledRowFlex>
      </StyledChunksSelect>
    </Card>
  );
};

const TradeIntervalSelect = () => {
  const hide = hooks.useShouldWrapOrUnwrapOnly();

  if (hide) return null;
  return (
    <Card>
      <Card.Header>
        <Components.Labels.TradeIntervalLabel />
      </Card.Header>
      <StyledTradeInterval>
        <Styles.StyledRowFlex style={{ alignItems: "stretch" }}>
          <StyledTradeIntervalInput>
            <Components.TradeInterval.Input />
          </StyledTradeIntervalInput>
          <StyledTradeIntervalResolution>
            <Components.TradeInterval.Resolution />
          </StyledTradeIntervalResolution>
        </Styles.StyledRowFlex>
      </StyledTradeInterval>
    </Card>
  );
};

export const useIsSupportedChain = (chainId?: number) => {
  return _.find(configs, (config: Config) => config.chainId === chainId);
};

export { Orders, TWAP };
