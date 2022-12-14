import Modal from "@mui/material/Modal";
import { ReactNode, useState } from "react";
import { Helmet } from "react-helmet";
import { AiOutlineClose } from "react-icons/ai";
import { StyledCloseIcon, StyledDappLayout, StyledMenuDrawer, StyledMenuList, StyledMenuListItemButton, StyledMenuLogo, StyledMenuMobileToggle, StyledThemeToggle } from "./styles";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import useMediaQuery from "@mui/material/useMediaQuery";
import { FiMenu } from "react-icons/fi";
import Backdrop from "@mui/material/Backdrop";
import { Fade } from "@mui/material";
import { Config } from "@orbs-network/twap";
import { BsFillSunFill, BsFillMoonFill } from "react-icons/bs";
import { dapps } from "./config";
import { Status } from "./Status";
import { useSelectedDapp, useTheme } from "./hooks";
import { useSearchParams } from "react-router-dom";
export interface Dapp {
  config: Config;
  logo: string;
  Component: any;
}

export const Popup = ({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: ReactNode }) => {
  return (
    <Modal open={isOpen} onClose={onClose} onBackdropClick={onClose}>
      <>
        <StyledCloseIcon onClick={onClose}>
          <AiOutlineClose className="icon" />
        </StyledCloseIcon>
        {children}
      </>
    </Modal>
  );
};

export const MetaTags = ({ title, favicon }: { title: string; favicon: string }) => {
  return (
    <Helmet>
      <link rel="icon" href={favicon} />
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
        <ToggleTheme />
        <StyledMenuList>
          <Backdrop open={isMobile && isOpen} onClick={() => setIsOpen(false)} />
          {dapps.map((dapp) => (
            <ListItem onClick={() => onSelectClick(dapp)} key={dapp.config.partner.toLowerCase()} disablePadding selected={isSelected(dapp)}>
              <StyledMenuListItemButton>
                <StyledMenuLogo src={dapp.logo} />
                <ListItemText primary={dapp.config.partner} />
              </StyledMenuListItemButton>
            </ListItem>
          ))}
        </StyledMenuList>
        <Status />
      </StyledMenuDrawer>
    </>
  );
};

export const DappLayout = ({ children, name, favicon }: { children: ReactNode; name: string; favicon: string }) => {
  return (
    <>
      <MetaTags title={name} favicon={favicon} />
      <Fade in>
        <StyledDappLayout>{children}</StyledDappLayout>
      </Fade>
    </>
  );
};
