import { Box, styled } from "@mui/system";
import { useToken } from "../store/store";
import { StyledSmallTitle } from "../styles";

interface props {
  address: string;
  imageSize?: string;
}

function TokenDisplay({ address, imageSize }: props) {
  const { token } = useToken(address);
  return (
    <StyledContainer>
      {/* <StyledLogo size={imageSize} src={""} /> */}
      <StyledTokenName>{token?.name}</StyledTokenName>
    </StyledContainer>
  );
}

export default TokenDisplay;

const StyledContainer = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 6,
  justifyContent: "center",
  paddingLeft: 20,
});

const StyledTokenName = styled(StyledSmallTitle)({
  maxWidth: 50,
});

const StyledLogo = styled("img")(({ size }: { size?: string }) => ({
  width: size || 30,
  height: size || 30,
}));
