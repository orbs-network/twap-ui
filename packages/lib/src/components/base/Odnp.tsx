import { QRCodeSVG } from "qrcode.react";
import { ReactNode, useState } from "react";
import { useTwapContext } from "../../context";
import { StyledColumnFlex, StyledOneLineText, StyledRowFlex, StyledText } from "../../styles";
import { makeElipsisAddress } from "../../utils";
import Modal from "./Modal";
import Tooltip from "./Tooltip";
import { FaApple, FaGooglePlay } from "react-icons/fa";
import { IconType } from "react-icons";
import { styled, Typography } from "@mui/material";

const mobile = 700;

const icon = "https://open-defi-notifications.web.app/widget/assets/icon.png";

function Odnp({ className = "" }: { className?: string }) {
  const { account } = useTwapContext();

  const [open, setOpen] = useState(false);
  const translations = useTwapContext().translations;

  if (!account) return null;
  return (
    <>
      <StyledButton onClick={() => setOpen(true)} className="twap-odnp-button">
        <StyledRowFlex>
          <img src={icon} />
          <StyledOneLineText>{translations.notify}</StyledOneLineText>
        </StyledRowFlex>
      </StyledButton>
      <StyledModal open={open} onClose={() => setOpen(false)}>
        <StyledOdnp className={`twap-odnp ${className}`}>
          <StyledColumnFlex gap={20} style={{ alignItems: "center" }}>
            <Typography className="twap-odnp-title" variant="h2">
              Get free mobile alerts for on-chain events
            </Typography>
            <StyledText className="twap-odnp-subtitle">Get a push notification or even a phone call to make sure you never lose your funds and you're always up to date</StyledText>
          </StyledColumnFlex>
          <StyledFlex>
            <LeftSection />
            <StyledSeparator />
            <RightSection />
          </StyledFlex>
        </StyledOdnp>
      </StyledModal>
    </>
  );
}

const Link = ({ Icon, name, url }: { Icon: IconType; name: string; url: string }) => {
  return (
    <StyledLink href={url} target="_blank" className="twap-button twap-odnp-link">
      <StyledRowFlex>
        <Icon style={{ width: 20, height: 25 }} />
        <Typography>Download on {name}</Typography>
      </StyledRowFlex>
    </StyledLink>
  );
};

const StyledLink = styled("a")({
  width: "90%!important",
  textDecoration: "unset!important",
  height: "auto",
  padding: "10px 10px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  p: {
    fontWeight: "600!important",
    fontSize: 14,
    color: "inherit",
  },
  [`@media(max-width: ${mobile}px)`]: {
    padding: "5px 10px",
  },
});

const StyledModal = styled(Modal)({
  ".twap-modal-content": {
    maxWidth: 700,
    paddingTop: 50,
    paddingBottom: 50,
  },
});

const LeftSection = () => {
  return (
    <StyledLeft
      title={
        <>
          Download the mobile app <br /> "DeFi Notifications"
        </>
      }
      step={1}
    >
      <StyledColumnFlex style={{ alignItems: "center" }}>
        <img className="twap-odnp-left-logo" src={icon} />
        <StyledText className="twap-odnp-left-app">DeFi Notifications</StyledText>
      </StyledColumnFlex>
      <StyledColumnFlex style={{ alignItems: "center" }}>
        <Link name="Apple" Icon={FaApple} url="https://apps.apple.com/us/app/defi-notifications/id1588243632" />
        <Link name="Android" Icon={FaGooglePlay} url="https://play.google.com/store/apps/details?id=com.orbs.openDefiNotificationsApp" />
      </StyledColumnFlex>
    </StyledLeft>
  );
};

const RightSection = () => {
  const { account } = useTwapContext();
  return (
    <StyledRight title="Open the mobile app" step={2}>
      <StyledColumnFlex style={{ alignItems: "center" }}>
        <QR />
        <Tooltip text={account}>
          <StyledText className="twap-odnp-right-address">{makeElipsisAddress(account)}</StyledText>
        </Tooltip>
      </StyledColumnFlex>
    </StyledRight>
  );
};

const Section = ({ title, children, className = "", step }: { title: ReactNode; children: ReactNode; className?: string; step: number }) => {
  return (
    <StyledSection className={className} gap={30}>
      <StyledColumnFlex style={{ alignItems: "center" }} gap={5}>
        <StyledText className="twap-odnp-section-step">{step}</StyledText>
        <StyledText className="twap-odnp-section-title">{title}</StyledText>
      </StyledColumnFlex>
      {children}
    </StyledSection>
  );
};

const StyledLeft = styled(Section)({
  ".twap-odnp-left-logo": {
    width: 50,
    height: 50,
  },
  ".twap-odnp-left-app": {
    fontWeight: 600,
    fontSize: 15,
  },
});
const StyledRight = styled(Section)({
  ".twap-odnp-right-address": {
    fontSize: 14,
    fontWeight: 500,
  },
  [`@media(max-width: ${mobile}px)`]: {
    display: "none",
  },
});

const StyledSeparator = styled("div")({
  background: "white",
  width: 1,
  opacity: 0.7,
});

const StyledSection = styled(StyledColumnFlex)({
  ".twap-odnp-section-step": {
    fontWeight: 600,
    fontSize: 20,
  },
  ".twap-odnp-section-title": {
    fontSize: 17,
    fontWeight: 600,
  },
  width: "50%",
  alignItems: "center",
  [`@media(max-width: ${mobile}px)`]: {
    width: "100%",
    ".twap-odnp-section-step": {
      display: "none",
    },
  },
});

const StyledFlex = styled(StyledRowFlex)({
  alignItems: "stretch",
  marginTop: 30,
  gap: 20,
  [`@media(max-width: ${mobile}px)`]: {
    flexDirection: "column",
    alignItems: "center",
  },
});

const StyledButton = styled("button")({
  height: "auto",
  padding: "4px 15px",
  cursor: "pointer",
  "& img": {
    width: 22,
  },
  "& p": {
    fontSize: 14,
    fontWeight: "inherit",
  },
});

const StyledOdnp = styled(StyledColumnFlex)({
  textAlign: "center",
  ".twap-odnp-title": {
    fontSize: 26,
    lineHeight: "32px",
    textAlign: "center",
    fontWeight: 600,
  },
  ".twap-odnp-subtitle": {
    fontSize: 17,
    lineHeight: "24px",
    fontWeight: 400,
    maxWidth: "90%",
  },
  [`@media(max-width: ${mobile}px)`]: {
    ".twap-odnp-title": {
      fontSize: 20,
      lineHeight: "26px",
    },
    ".twap-odnp-subtitle": {
      maxWidth: "unset",
    },
  },
});

const QR = () => {
  const { account } = useTwapContext();

  if (!account) return null;
  return (
    <QRCodeSVG
      className="twap-odnp-qr-code"
      value={"http://onelink.to/9cqqbe" + "?opendefiqr=" + account + "project:" + "twap" + ";"}
      size={180}
      bgColor={"#ffffff"}
      fgColor={"#000000"}
      level={"M"}
      includeMargin={false}
    />
  );
};

export default Odnp;
