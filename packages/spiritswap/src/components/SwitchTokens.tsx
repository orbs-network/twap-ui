import { Box, styled } from "@mui/system";
// import Img from "../assets/images/swap-order.png";

import { changeTokenPositions } from "../store/store";

function SwitchTokens() {
  const switchTokens = changeTokenPositions();

  return (
    <StyledContainer>
      <StyledFlex onClick={switchTokens}>
        <StyledBigFigure />
        <StyledSmallFigure></StyledSmallFigure>
      </StyledFlex>
    </StyledContainer>
  );
}

export default SwitchTokens;

const StyledContainer = styled(Box)({
  position: "relative",
  display: "flex",
  justifyContent: "center",
  width: "100%",
  "&::after": {
    position: "absolute",
    left: "0",
    top: "50%",
    transform: "translate(0, -50%)",
    background: "#EAECF0",
    height: 1,
    width: "100%",
    content: "''",
  },
});

const StyledFlex = styled(Box)({
  width: 68,
  height: 68,
  position: "relative",
  zIndex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
});

const StyledBigFigure = styled(Box)({
  width: "100%",
  height: "100%",
  position: "absolute",
  left: "50%",
  top: "50%",
  transform: "translate(-50%, -50%)",
  background: "linear-gradient(114.98deg, #62DCEA 1.42%, #E772DA 105.73%)",
  opacity: 0.1,
  borderRadius: "50%",
});

const StyledSmallFigure = styled(Box)({
  width: 50,
  height: 50,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "50%",
  background: "linear-gradient(114.98deg, #62DCEA 1.42%, #E772DA 105.73%)",
  boxShadow: "0px 10px 80px rgba(237, 125, 93, 0.8)",
});
