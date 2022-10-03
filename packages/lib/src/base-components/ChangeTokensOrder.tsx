import { styled } from "@mui/system";

function ChangeTokensOrder({ image, onClick }: { image: string; onClick: () => void }) {
  return (
    <StyledContainer onClick={onClick} className="twap-change-order">
      <img src={image} />
    </StyledContainer>
  );
}

export default ChangeTokensOrder;

const StyledContainer = styled("button")({
  borderRadius: "50%",
  border: "unset",
  marginLeft: "auto",
  marginRight: "auto",
  overflow: "hidden",
  "& img": {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
});
