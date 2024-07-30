import { QRCodeSVG } from "qrcode.react";
import { ReactNode, useState } from "react";
import { useTwapContext } from "../../context/context";
import { StyledColumnFlex, StyledOneLineText, StyledRowFlex, StyledText } from "../../styles";
import Button from "./Button";
// import { FaApple } from "@react-icons/all-files/fa/FaApple";
// import { FaGooglePlay } from "@react-icons/all-files/fa/FaGooglePlay";
import { styled } from "styled-components";

const mobile = 700;

const icon = "https://services-healthpage.orbs.network/img/odnp-logo.png";

function Odnp({ className = "" }: { className?: string }) {
  const { account } = useTwapContext();

  const [open, setOpen] = useState(false);
  const { translations } = useTwapContext();

  if (!account) return null;
  return (
    <>
      <StyledButton onClick={() => setOpen(true)} className="twap-odnp-button">
        <StyledRowFlex className="twap-odnp-button-children">
          <img src={icon} />
          <StyledOneLineText>{translations.notify}</StyledOneLineText>
        </StyledRowFlex>
      </StyledButton>
      <StyledOdnp className={`twap-odnp ${className}`}>
        <StyledColumnFlex gap={20} style={{ alignItems: "center" }} className="twap-odnp-header">
          <p className="twap-odnp-title">Get free mobile alerts for on-chain events</p>
          <StyledText className="twap-odnp-subtitle">Get a push notification or even a phone call to make sure you never lose your funds and you're always up to date</StyledText>
        </StyledColumnFlex>
        <StyledColumnFlex gap={30} style={{ alignItems: "center" }}>
          <StyledFlex className="twap-odnp-sections">
            <LeftSection />
            <StyledSeparator className="twap-odnp-separator" />
            <RightSection />
          </StyledFlex>
        </StyledColumnFlex>
      </StyledOdnp>
    </>
  );
}

const Link = ({ Icon, name, url }: { Icon: any; name: string; url: string }) => {
  return (
    <StyledLink href={url} target="_blank" className="twap-button twap-odnp-link">
      <StyledRowFlex>
        <Icon style={{ width: 20, height: 25 }} />
        <p>Download on {name}</p>
      </StyledRowFlex>
    </StyledLink>
  );
};

const StyledLink = styled("a")({
  width: "90%",
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
      </StyledColumnFlex>
      <StyledColumnFlex style={{ alignItems: "center" }} className="twap-odnp-left-buttons">
        {/* <Link name="Apple" Icon={FaApple} url="https://apps.apple.com/us/app/defi-notifications/id1588243632" /> */}
        {/* <Link name="Android" Icon={FaGooglePlay} url="https://play.google.com/store/apps/details?id=com.orbs.openDefiNotificationsApp" /> */}
      </StyledColumnFlex>
    </StyledLeft>
  );
};

const StyledCloseButton = styled(Button)({
  width: "100%",
});

const RightSection = () => {
  return (
    <StyledRight
      title={
        <>
          Open the “DeFi Notifications” <br /> mobile app
        </>
      }
      step={2}
      className="twap-odnp-section-right"
    >
      <StyledColumnFlex style={{ alignItems: "center" }} className="twap-odnp-section-right-flex" gap={20}>
        <QR />
        <p className="twap-odnp-section-right-bottom-text">and Scan the QR Code to select what to monitor</p>
      </StyledColumnFlex>
    </StyledRight>
  );
};

const Section = ({ title, children, className = "", step }: { title: ReactNode; children: ReactNode; className?: string; step: number }) => {
  return (
    <StyledSection className={`twap-odnp-section ${className}`}>
      <figure className="twap-odnp-section-step">{step}</figure>
      <StyledColumnFlex gap={20} className="twap-odnp-section-content">
        <StyledText className="twap-odnp-section-title">{title}</StyledText>
        {children}
      </StyledColumnFlex>
    </StyledSection>
  );
};

const StyledLeft = styled(Section)({
  ".twap-odnp-left-logo": {
    width: 70,
    height: 70,
  },
});
const StyledRight = styled(Section)({
  ".twap-odnp-section-right-bottom-text": {
    fontSize: 15,
    fontWeight: 400,
    maxWidth: 200,
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
  justifyContent: "space-between",
  gap: 20,
  ".twap-odnp-section-step": {
    fontWeight: 600,
    fontSize: 20,
    padding: 0,
    margin: 0,
  },
  ".twap-odnp-section-content": {
    justifyContent: "space-between",
    flex: 1,
    alignItems: "center",
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
  marginTop: 50,
  gap: 20,
  [`@media(max-width: ${mobile}px)`]: {
    flexDirection: "column",
    alignItems: "center",
  },
});

const StyledButton = styled("button")({
  padding: "4px 15px",
  cursor: "pointer",
  "& img": {
    width: 22,
    height: 22,
  },
  "& p": {
    fontSize: 14,
    fontWeight: "inherit",
  },
  [`@media(max-width: ${mobile}px)`]: {
    "& p": {
      fontSize: 12,
    },
  },
});

const StyledOdnp = styled(StyledColumnFlex)({
  textAlign: "center",
  gap: 0,
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
  const {
    uiPreferences: { qrSize },
    account,
  } = useTwapContext();

  if (!account) return null;
  return (
    <QRCodeSVG
      className="twap-odnp-qr-code"
      value={"http://onelink.to/9cqqbe" + "?opendefiqr=" + account + "project:" + "twap" + ";"}
      size={qrSize || 180}
      bgColor={"#ffffff"}
      fgColor={"#000000"}
      level={"M"}
      includeMargin={false}
    />
  );
};

export default Odnp;
