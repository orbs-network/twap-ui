import Modal from "@mui/material/Modal";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import {
  StyledCloseIcon,
  StyledDappLayoutContent,
  StyledDrawerContent,
  StyledListToken,
  StyledMenuDrawer,
  StyledMenuList,
  StyledMenuListItemButton,
  StyledMenuLogo,
  StyledMenuMobileToggle,
  StyledSearchInput,
  StyledThemeToggle,
  StyledTokens,
  StyledTokensList,
  StyledUISelector,
  StyledUISelectorButton,
} from "./styles";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import useMediaQuery from "@mui/material/useMediaQuery";
import { FiMenu } from "@react-icons/all-files/fi/FiMenu";
import Backdrop from "@mui/material/Backdrop";
import { Button, Fade, IconButton, styled, TextField, Typography } from "@mui/material";
import { Config } from "@orbs-network/twap";
import { Components, hooks, Styles } from "@orbs-network/twap-ui";
import { eqIgnoreCase } from "@defi.org/web3-candies";
import { BsSun } from "@react-icons/all-files/bs/BsSun";
import { AiOutlineClose } from "@react-icons/all-files/ai/AiOutlineClose";
import { BsMoon } from "@react-icons/all-files/bs/BsMoon";

import { dapps } from "./config";
import { Status } from "./Status";
import { useAddedTokens, useBalance, useDebounce, useDisconnectWallet, useSelectedDapp, useTheme } from "./hooks";
import { FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import { TokenData } from "@orbs-network/twap";
import { SelectorOption, TokenListItem } from "./types";
import _ from "lodash";
import { useNavigate } from "react-router-dom";
import { network } from "@defi.org/web3-candies";
import { usePersistedStore } from "./store";
import { useWeb3React } from "@web3-react/core";
import { MdDeleteSweep } from "@react-icons/all-files/md/MdDeleteSweep";
import { BiArrowBack } from "@react-icons/all-files/bi/BiArrowBack";

const FAVICON = "https://raw.githubusercontent.com/orbs-network/twap-ui/master/logo/64.png";

export interface Dapp {
  config: Config;
  logo: string;
  Component: any;
  invertLogo?: boolean;
  theme?: "light" | "dark";
  workInProgress?: boolean;
}

export const Popup = ({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: ReactNode }) => {
  return (
    <Modal open={isOpen} onClose={onClose}>
      <>
        <StyledCloseIcon onClick={onClose}>
          <AiOutlineClose className="icon" />
        </StyledCloseIcon>
        <Fade in={isOpen}>
          <div>{children}</div>
        </Fade>
      </>
    </Modal>
  );
};

export const MetaTags = ({ title }: { title: string }) => {
  return (
    <Helmet>
      <link rel="icon" href={FAVICON} />
      <title>TWAP On {title}</title>
    </Helmet>
  );
};

const ToggleTheme = () => {
  const { selectedDapp } = useSelectedDapp();
  const showLight = !selectedDapp?.theme || selectedDapp.theme === "light";
  const showDark = !selectedDapp?.theme || selectedDapp.theme === "dark";
  const size = 18;
  const { setTheme, isDarkTheme } = useTheme();
  return (
    <StyledThemeToggle>
      {showLight && (
        <button
          style={{
            opacity: isDarkTheme ? 0.5 : 1,
          }}
          onClick={() => setTheme("light")}
        >
          <BsMoon style={{ width: size, height: size }} />
        </button>
      )}
      {showDark && (
        <button
          style={{
            opacity: !isDarkTheme ? 0.5 : 1,
          }}
          onClick={() => setTheme("dark")}
        >
          <BsMoon style={{ width: size, height: size }} />
        </button>
      )}
    </StyledThemeToggle>
  );
};

const drawerWidth = 260;

export const DappsMenu = () => {
  const { isSelected } = useSelectedDapp();

  const isMobile = useMediaQuery("(max-width:1200px)");
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const disconnect = useDisconnectWallet();
  const reset = hooks.useResetStore();
  const onSelect = (dapp: Dapp) => {
    reset();
    disconnect();
    navigate(`/${dapp.config.name.toLowerCase()}`);
  };

  const open = !isMobile ? true : isMobile && isOpen;

  const handleDrawerToggle = () => {
    setIsOpen(!isOpen);
  };

  const onSelectClick = (dapp: Dapp) => {
    if (isMobile) {
      setIsOpen(false);
    }
    onSelect(dapp);
  };

  return (
    <>
      {isMobile && (
        <StyledMenuMobileToggle className="menu-button" color="inherit" edge="start" onClick={handleDrawerToggle}>
          <FiMenu />
        </StyledMenuMobileToggle>
      )}
      <StyledMenuDrawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            background: "rgb(16, 23, 38)",
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <Backdrop open={isMobile && isOpen} onClick={() => setIsOpen(false)} />

        <StyledDrawerContent>
          <ToggleTheme />
          <StyledMenuList>
            {dapps.map((dapp) => (
              <ListItem onClick={() => onSelectClick(dapp)} key={dapp.config.name.toLowerCase()} disablePadding selected={isSelected(dapp)}>
                <StyledMenuListItemButton>
                  <div>
                    <StyledMenuLogo src={network(dapp.config.chainId).logoUrl} style={{ width: 16, height: 16 }} />
                    <StyledMenuLogo src={dapp.logo} width={32} height={32} style={{ filter: dapp.invertLogo ? "invert(100%)" : "unset" }} />
                  </div>
                  <ListItemText primary={`${dapp.workInProgress ? `[WIP] ${dapp.config.name}` : dapp.config.name}`} />
                </StyledMenuListItemButton>
              </ListItem>
            ))}
          </StyledMenuList>
          <Status />
        </StyledDrawerContent>
      </StyledMenuDrawer>
    </>
  );
};

export const DappLayout = ({ children, name, className }: { children: ReactNode; name: string; className?: string }) => {
  return (
    <>
      <MetaTags title={name} />
      <DappsMenu />
      <StyledDappLayoutContent className={className}>{children}</StyledDappLayoutContent>
    </>
  );
};

export const TokenSearchInput = ({ setValue }: { value: string; setValue: (value: string) => void }) => {
  const [localValue, setLocalValue] = useState("");
  const debouncedValue = useDebounce(localValue, 300);

  useEffect(() => {
    setValue(debouncedValue);
  }, [debouncedValue]);

  return <StyledSearchInput placeholder="Insert token name..." value={localValue} onChange={(e) => setLocalValue(e.target.value)} />;
};

const Row = (props: any) => {
  const { index, style, data } = props;

  const item: TokenListItem = data.tokens[index];
  const { balance, isLoading } = useBalance(item.token);

  const formattedValue = hooks.useFormatNumber({ value: balance, decimalScale: 6 });

  if (!item) return null;
  return (
    <div style={style}>
      <StyledListToken onClick={() => data.onClick(item.rawToken)}>
        <Styles.StyledRowFlex justifyContent="flex-start" style={{ width: "unset", flex: 1 }}>
          <Components.Base.TokenLogo
            logo={item.token.logoUrl}
            alt={item.token.symbol}
            style={{
              width: 30,
              height: 30,
            }}
          />
          {item.token.symbol}
        </Styles.StyledRowFlex>
        <Components.Base.SmallLabel loading={isLoading} className="balance">
          {formattedValue}
        </Components.Base.SmallLabel>
      </StyledListToken>
    </div>
  );
};

const filterTokens = (list: TokenListItem[], filterValue: string) => {
  if (!filterValue) return list;
  return _.filter(list, (it) => {
    return it.token.symbol.toLowerCase().indexOf(filterValue.toLowerCase()) >= 0 || eqIgnoreCase(it.token.address, filterValue);
  });
};

interface TokensListProps {
  tokens?: TokenListItem[];
  onClick: (token: TokenData) => void;
}

const AddToken = ({ onAddToken }: { onAddToken: (token: TokenData) => void }) => {
  const [data, setData] = useState({ address: "", symbol: "", decimals: 18, logoUrl: "" } as TokenData);

  const onChange = (e: any) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
  };

  const _onSubmit = () => {
    if (!data.address || !data.symbol || !data.decimals) {
      alert("Please fill all fields");
      return;
    }
    onAddToken(data);
  };

  return (
    <StyledAddToken>
      <StyledAddTokenInput label="Address" name="address" value={data["address"]} onChange={onChange} />
      <StyledAddTokenInput label="Symbol" name="symbol" value={data["symbol"]} onChange={onChange} />
      <StyledAddTokenInput label="Decimals" name="decimals" type="number" value={data["decimals"]} onChange={onChange} />
      <StyledAddTokenInput label="Logo" name="logoUrl" value={data["logoUrl"]} onChange={onChange} />
      <StyledSubmitBtn onClick={_onSubmit}>Submit</StyledSubmitBtn>
    </StyledAddToken>
  );
};

const StyledSubmitBtn = styled(Button)({
  marginLeft: "auto",
  marginRight: "auto",
});

const StyledAddToken = styled(Styles.StyledColumnFlex)({
  padding: 10,
  gap: 20,
});

const StyledAddTokenInput = styled(TextField)({
  width: "100%",
});

const testToken = {
  address: "0xCdC3A010A3473c0C4b2cB03D8489D6BA387B83CD",
  symbol: "liveThe",
  decimals: 18,
};

const ManageAddedTokens = () => {
  const addedTokens = useAddedTokens();
  const { chainId } = useWeb3React();
  const { removeToken } = usePersistedStore();

  return (
    <StyledManageTokens>
      {_.isEmpty(addedTokens) ? (
        <Typography style={{ textAlign: "center", width: "100%" }}>No tokens</Typography>
      ) : (
        addedTokens.map((t: TokenData) => {
          return (
            <StyledListToken>
              <Styles.StyledRowFlex justifyContent="space-between">
                <Styles.StyledRowFlex justifyContent="flex-start" style={{ width: "unset", flex: 1 }}>
                  <Components.Base.TokenLogo
                    logo={t.logoUrl}
                    alt={t.symbol}
                    style={{
                      width: 30,
                      height: 30,
                    }}
                  />
                  {t.symbol}
                </Styles.StyledRowFlex>
                <IconButton onClick={() => removeToken(chainId!, t)}>
                  <MdDeleteSweep />
                </IconButton>
              </Styles.StyledRowFlex>
            </StyledListToken>
          );
        })
      )}
    </StyledManageTokens>
  );
};

const StyledManageTokens = styled(Styles.StyledColumnFlex)({
  flex: 1,
  overflowY: "auto",
});

enum TokenListView {
  DEFAULT,
  ADD_TOKEN,
  MANAGE_TOKENS,
}

export const TokensList = ({ tokens = [], onClick }: TokensListProps) => {
  const [filterValue, setFilterValue] = useState("");
  const tokensLength = _.size(tokens);
  const [view, setView] = useState(TokenListView.DEFAULT);
  const { addToken } = usePersistedStore();
  const { chainId } = useWeb3React();

  const onAddToken = (token: TokenData) => {
    setView(TokenListView.DEFAULT);
    addToken(chainId!, token);
  };

  const filteredTokens = useMemo(() => filterTokens(tokens, filterValue), [filterValue, tokensLength]);

  return (
    <StyledTokens>
      {view !== TokenListView.DEFAULT && (
        <StyledListBackBtn onClick={() => setView(TokenListView.DEFAULT)}>
          <BiArrowBack />
          Back
        </StyledListBackBtn>
      )}
      {view === TokenListView.DEFAULT && <TokenSearchInput setValue={setFilterValue} value={filterValue} />}
      {view === TokenListView.DEFAULT && (
        <StyledListSettings>
          <StyledListBtn onClick={() => setView(TokenListView.ADD_TOKEN)}>Add token</StyledListBtn>
          <StyledListBtn onClick={() => setView(TokenListView.MANAGE_TOKENS)}>Manage tokens</StyledListBtn>
        </StyledListSettings>
      )}
      {view === TokenListView.ADD_TOKEN && <AddToken onAddToken={onAddToken} />}
      {view === TokenListView.MANAGE_TOKENS && <ManageAddedTokens />}
      {view === TokenListView.DEFAULT && (
        <StyledTokensList>
          <AutoSizer>
            {({ height, width }: any) => (
              <List
                overscanCount={30}
                className="List"
                itemData={{ tokens: filteredTokens, onClick }}
                height={height || 0}
                itemCount={filteredTokens.length}
                itemSize={50}
                width={width || 0}
              >
                {Row}
              </List>
            )}
          </AutoSizer>
        </StyledTokensList>
      )}
    </StyledTokens>
  );
};

const StyledListSettings = styled(Styles.StyledRowFlex)({
  padding: "10px 10px 0px 10px",
  justifyContent: "flex-start",
});
const StyledListBtn = styled("button")({
  background: "none",
  border: "1px solid rgba(255,255,255,0.2)",
  borderRadius: 5,
  padding: "5px 10px",
  color: "white",
  cursor: "pointer",
  transition: "all 0.2s all",

  "&:hover": {
    border: "1px solid rgba(255,255,255,0.8)",
  },
});

const StyledListBackBtn = styled("button")({
  background: "none",
  display: "flex",
  alignItems: "center",
  gap: 7,
  width: "fit-content",
  margin: "10px 0px 20px 15px",
  border: "unset",
  cursor: "pointer",
});

export const UISelector = ({
  className = "",
  select,
  limit,
  selected,
}: {
  className?: string;
  select?: (value: SelectorOption) => void;
  limit?: boolean;
  selected?: SelectorOption;
}) => {
  const tabs = limit ? [SelectorOption.TWAP, SelectorOption.LIMIT] : [SelectorOption.TWAP];

  return (
    <StyledUISelector className={`ui-selector ${className}`}>
      {tabs.map((it) => {
        return (
          <StyledUISelectorButton className={`${selected === it ? " ui-selector-btn-selected" : ""} ui-selector-btn`} key={it} onClick={() => select?.(it)}>
            {it}
          </StyledUISelectorButton>
        );
      })}
    </StyledUISelector>
  );
};
