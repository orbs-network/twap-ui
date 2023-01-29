import Modal from "@mui/material/Modal";
import { ReactNode, useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { AiOutlineClose } from "react-icons/ai";
import {
  StyledCloseIcon,
  StyledDappLayout,
  StyledDrawerContent,
  StyledMenuDrawer,
  StyledMenuList,
  StyledMenuListItemButton,
  StyledMenuLogo,
  StyledMenuMobileToggle,
  StyledModalListItem,
  StyledSearchInput,
  StyledThemeToggle,
} from "./styles";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import useMediaQuery from "@mui/material/useMediaQuery";
import { FiMenu } from "react-icons/fi";
import Backdrop from "@mui/material/Backdrop";
import { Fade } from "@mui/material";
import { Config } from "@orbs-network/twap";
import { Components, Styles } from "@orbs-network/twap-ui";

import { BsFillSunFill, BsFillMoonFill } from "react-icons/bs";
import { dapps } from "./config";
import { Status } from "./Status";
import { useDebounce, useListTokenBalace, useSelectedDapp, useTheme } from "./hooks";
import { showTokenInList } from "./utils";

const FAVICON = "https://github.com/orbs-network/twap-ui/raw/66e183e804002fe382d9b0070caef060ad2e21ac/logo/64.png";

export interface Dapp {
  config: Config;
  logo: string;
  Component: any;
  invertLogo?: boolean;
}

export const Popup = ({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: ReactNode }) => {
  return (
    <Modal open={isOpen} onClose={onClose} onBackdropClick={onClose}>
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
  const size = 18;
  const { setTheme, isDarkTheme } = useTheme();
  return (
    <StyledThemeToggle>
      <button
        style={{
          opacity: isDarkTheme ? 0.5 : 1,
        }}
        onClick={() => setTheme("light")}
      >
        <BsFillSunFill style={{ width: size, height: size }} />
      </button>
      <button
        style={{
          opacity: !isDarkTheme ? 0.5 : 1,
        }}
        onClick={() => setTheme("dark")}
      >
        <BsFillMoonFill style={{ width: size, height: size }} />
      </button>
    </StyledThemeToggle>
  );
};

interface DappsMenuProps {
  onSelect: (dapp: Dapp) => void;
}
const drawerWidth = 260;

export const DappsMenu = ({ onSelect }: DappsMenuProps) => {
  const { isSelected } = useSelectedDapp();

  const isMobile = useMediaQuery("(max-width:1100px)");
  const [isOpen, setIsOpen] = useState(false);

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
        <StyledMenuMobileToggle color="inherit" edge="start" onClick={handleDrawerToggle}>
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
              <ListItem onClick={() => onSelectClick(dapp)} key={dapp.config.partner.toLowerCase()} disablePadding selected={isSelected(dapp)}>
                <StyledMenuListItemButton>
                  <StyledMenuLogo
                    src={dapp.logo}
                    style={{
                      filter: dapp.invertLogo ? "invert(100%)" : "unset",
                    }}
                  />
                  <ListItemText primary={dapp.config.partner} />
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

export const TokenSelectListItem = ({
  logo,
  symbol,
  address,
  decimals,
  onClick,
  filter,
}: {
  logo?: string;
  symbol: string;
  address: string;
  decimals: number;
  onClick: () => void;
  filter: string;
}) => {
  const { balance, isLoading } = useListTokenBalace(address, decimals, symbol, logo);
  if (!showTokenInList(symbol, filter)) {
    return null;
  }

  return (
    <StyledModalListItem onClick={onClick}>
      <Styles.StyledRowFlex justifyContent="flex-start" style={{ width: "unset", flex: 1 }}>
        <Components.Base.TokenLogo
          logo={logo}
          alt={symbol}
          style={{
            width: 30,
            height: 30,
          }}
        />
        {symbol}
      </Styles.StyledRowFlex>
      <Components.Base.SmallLabel loading={isLoading} className="balance">
        <Components.Base.NumberDisplay value={balance} decimalScale={6} />
      </Components.Base.SmallLabel>
    </StyledModalListItem>
  );
};

export const DappLayout = ({ children, name }: { children: ReactNode; name: string }) => {
  return (
    <>
      <MetaTags title={name} />
      <Fade in>
        <StyledDappLayout>{children}</StyledDappLayout>
      </Fade>
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
