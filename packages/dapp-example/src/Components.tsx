import Modal from "@mui/material/Modal";
import { ReactNode, useState } from "react";
import { Helmet } from "react-helmet";
import { AiOutlineClose } from "react-icons/ai";
import {
  StyledCloseIcon,
  StyledDappLayout,
  StyledMenuDrawer,
  StyledMenuList,
  StyledMenuListItemButton,
  StyledMenuLogo,
  StyledMenuMobileToggle,
  StyledWrongNetwork,
  StyledWrongNetworkButton,
  StyledWrongNetworkText,
} from "./styles";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import useMediaQuery from "@mui/material/useMediaQuery";
import { FiMenu } from "react-icons/fi";
import Backdrop from "@mui/material/Backdrop";
import { Fade } from "@mui/material";
import { Config } from "@orbs-network/twap";
import { useChangeNetwork, useNetwork } from "./hooks";
export interface Dapp {
  name: string;
  path: string;
  Component: any;
  logo: string;
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

interface WrongNetworkPopup {
  config: Config;
}

export const WrongNetworkPopup = ({ config }: WrongNetworkPopup) => {
  const changeNetwork = useChangeNetwork();
  const { isInValidNetwork } = useNetwork(config.chainId);

  const onClick = async () => {
    try {
      await changeNetwork(config.chainId);
    } catch (error) {}
  };

  return (
    <Popup isOpen={isInValidNetwork} onClose={() => {}}>
      <StyledWrongNetwork>
        <StyledWrongNetworkText>Change network to {config.partner}</StyledWrongNetworkText>
        <StyledWrongNetworkButton onClick={onClick}>Change</StyledWrongNetworkButton>
      </StyledWrongNetwork>
    </Popup>
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

const drawerWidth = 260;

interface DappsMenuProps {
  dapps: Dapp[];
  onSelect: (dapp: Dapp) => void;
  isSelected: (dapp: Dapp) => boolean;
}

export const DappsMenu = ({ dapps, onSelect, isSelected }: DappsMenuProps) => {
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
        <StyledMenuList>
          <Backdrop open={isMobile && isOpen} onClick={() => setIsOpen(false)} />
          {dapps.map((dapp) => (
            <ListItem onClick={() => onSelectClick(dapp)} key={dapp.path} disablePadding selected={isSelected(dapp)}>
              <StyledMenuListItemButton>
                <StyledMenuLogo src={dapp.logo} />
                <ListItemText primary={dapp.name} />
              </StyledMenuListItemButton>
            </ListItem>
          ))}
        </StyledMenuList>
      </StyledMenuDrawer>
    </>
  );
};

export const DappLayout = ({ children }: { children: ReactNode }) => {
  return (
    <Fade in>
      <StyledDappLayout>{children}</StyledDappLayout>
    </Fade>
  );
};
