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
import { Button, styled, TextField, Typography } from "@mui/material";
import { Components, Config, hooks, isEmpty, size, Styles, Token } from "@orbs-network/twap-ui";
import { eqIgnoreCase } from "@defi.org/web3-candies";

import { AiOutlineClose } from "@react-icons/all-files/ai/AiOutlineClose";
import { BsMoon } from "@react-icons/all-files/bs/BsMoon";

import { dapps } from "./config";
import { Status } from "./Status";
import { useAddedTokens, useBalance, useDebounce, useDisconnectWallet, useSelectedDapp, useTheme } from "./hooks";
import { FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import { SelectorOption, TokenListItem } from "./types";
import { useNavigate } from "react-router-dom";
import { useWeb3React } from "@web3-react/core";
import { MdDeleteSweep } from "@react-icons/all-files/md/MdDeleteSweep";
import { BiArrowBack } from "@react-icons/all-files/bi/BiArrowBack";

const FAVICON = "https://raw.githubusercontent.com/orbs-network/twap-ui/master/logo/64.png";

export interface Dapp {
  logo: string;
  Component: any;
  invertLogo?: boolean;
  theme?: "light" | "dark";
  workInProgress?: boolean;
  configs: Config[];
  path: string;
}

export const Popup = ({ isOpen, onClose, children, className = '' }: { isOpen: boolean; onClose: () => void; children: ReactNode, className?: string}) => {
  return (
    <Modal open={isOpen} onClose={onClose} className={className} >
      <>{children}</>
    </Modal>
  );
};

const PopupContent = ({ children, className = '' }: { children: ReactNode, className?: string }) => {
  return <StyledPoupContent className={className}>{children}</StyledPoupContent>;
};

const PopupHeader = ({ onClose, title, Component }: { onClose: () => void; title?: string; Component?: ReactNode }) => {
  return (
    <StyledPopupHeader>
      {Component ? Component : title && <p className="twap-popup-title">{title}</p>}
      <StyledCloseIcon onClick={onClose}>
        <AiOutlineClose className="icon" />
      </StyledCloseIcon>
    </StyledPopupHeader>
  );
};

const PopupBody = ({ children }: { children: ReactNode }) => {
  return <StyledPoupBody>{children}</StyledPoupBody>;
};

Popup.Header = PopupHeader;
Popup.Content = PopupContent;
Popup.Body = PopupBody;
const StyledPoupBody = styled("div")({
  width: "100%",
  flex: 1,
});
const StyledPoupContent = styled("div")({
  maxWidth: 600,
  maxHeight: 600,
  position: "relative",
  left: "50%",
  top: "50%",
  transform: "translate(-50%, -50%)",
  background: "rgba(0, 0, 0, 0.5)",
  padding: 15,
  borderRadius: 10,
  display: "flex",
  flexDirection: "column",
});

const StyledPopupHeader = styled("div")({
  display: "flex",
  justifyContent: "space-between",
  height: 50,
  alignItems: "center",
  ".twap-popup-title": {},
});

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
  const onSelect = (dapp: Dapp) => {
    disconnect();
    navigate(`/${dapp.path}`);
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
              <ListItem onClick={() => onSelectClick(dapp)} key={dapp.path} disablePadding selected={isSelected(dapp)}>
                <StyledMenuListItemButton>
                  <div>
                    {/* <StyledMenuLogo src={network(dapp.config.chainId).logoUrl} style={{ width: 16, height: 16 }} /> */}
                    <StyledMenuLogo src={dapp.logo} width={32} height={32} style={{ filter: dapp.invertLogo ? "invert(100%)" : "unset" }} />
                  </div>
                  <ListItemText primary={`${dapp.workInProgress ? `[WIP] ${dapp.path}` : dapp.path}`} />
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

  return <StyledSearchInput placeholder="Insert token name..." value={localValue} onChange={(e: any) => setLocalValue(e.target.value)} />;
};

const Row = (props: any) => {
  const { index, style, data } = props;

  const item: TokenListItem = data.tokens[index];
  const { balance, isLoading } = useBalance(item.token);

  const formattedValue = hooks.useFormatNumberV2({ value: balance, decimalScale: 6 });

  if (!item) return null;
  return (
    <div style={style}>
      <StyledListToken onClick={() => data.onClick(item.rawToken)} className='twap-tokens-list-item'>
        <StyledListTokenLeft>
          <Components.Base.TokenLogo
            logo={item.token.logoUrl}
            alt={item.token.symbol}
            style={{
              width: 30,
              height: 30,
            }}
          />
          {item.token.symbol}
        </StyledListTokenLeft>
        <Components.Base.SmallLabel loading={isLoading} className="balance">
          {formattedValue}
        </Components.Base.SmallLabel>
      </StyledListToken>
    </div>
  );
};

const StyledListTokenLeft = styled('div')({
  display: 'flex',
  alignItems: 'center',
  gap: 10
})

const filterTokens = (list: TokenListItem[], filterValue: string) => {
  if (!filterValue) return list;
  return list.filter((it) => {
    return it.token.symbol.toLowerCase().indexOf(filterValue.toLowerCase()) >= 0 || eqIgnoreCase(it.token.address, filterValue);
  });
};

interface TokensListProps {
  tokens?: TokenListItem[];
  onClick: (token: Token) => void;
}

const AddToken = ({ onAddToken }: { onAddToken: (token: Token) => void }) => {
  const [data, setData] = useState({ address: "", symbol: "", decimals: 18, logoUrl: "" } as Token);

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
  // const { removeToken } = usePersistedStore();

  return (
    <StyledManageTokens>
      {isEmpty(addedTokens) ? (
        <Typography style={{ textAlign: "center", width: "100%" }}>No tokens</Typography>
      ) : (
        addedTokens.map((t: Token) => {
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
                {/* <IconButton onClick={() => removeToken(chainId!, t)}>
                  <MdDeleteSweep />
                </IconButton> */}
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
  const tokensLength = size(tokens);
  const [view, setView] = useState(TokenListView.DEFAULT);
  // const { addToken } = usePersistedStore();

  const onAddToken = (token: Token) => {
    setView(TokenListView.DEFAULT);
    // addToken(chainId!, token);
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
  const onSelect = (value: SelectorOption) => {
    select?.(value);
    const search = window.location.search;
    const params = new URLSearchParams(search);
    const theme = params.get("theme");
    if (theme) {
      window.history.replaceState({}, "", `${window.location.pathname}?theme=${theme}`);
    } else {
      window.history.replaceState({}, "", `${window.location.pathname}`);
    }
  };
  return (
    <StyledUISelector className={`ui-selector ${className}`}>
      {tabs.map((it) => {
        return (
          <StyledUISelectorButton className={`${selected === it ? " ui-selector-btn-selected" : ""} ui-selector-btn`} key={it} onClick={() => onSelect?.(it)}>
            {it}
          </StyledUISelectorButton>
        );
      })}
    </StyledUISelector>
  );
};
