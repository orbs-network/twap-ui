import { Box, Typography } from '@mui/material'
import { styled } from '@mui/system'
import React, { useState } from 'react'
import AmountInput from '../base-components/AmountInput'
import CustomSwitch from '../base-components/CustomSwitch'
import InfoIconTooltip from '../base-components/InfoIconTooltip'
import TokenDisplay from '../base-components/TokenDisplay'
import { useDstToken, useSrcToken } from '../store/store'
import { StyledBorderWrapper, StyledShadowContainer } from '../styles'

function PriceInput() {
    const [open, setOpen] = useState(false)
    const {address: srcTokenAddress} = useSrcToken()
    const {address: dstTokenAddress} = useDstToken()
  return (
    <StyledContainer>
      <StyledTop>
        <StyledTitle>
          <InfoIconTooltip text="some-text">
            <CustomSwitch value={open} onChange={() => setOpen(!open)} />
            <Typography>Limit price</Typography>
          </InfoIconTooltip>
        </StyledTitle>
        <StyledNoneText fontWeight={500}>None</StyledNoneText>
      </StyledTop>
     {open &&  <StyledBottom>
        <TokenDisplay address={srcTokenAddress} />
        <AmountInput value=''  onChange={() => {}}/>
        <TokenDisplay address={dstTokenAddress} />
      </StyledBottom>}
    </StyledContainer>
  );
}

export default PriceInput

const StyledBottom =styled(Box)({
    display:'flex',
    alignItems:'center',
    justifyContent:'space-between',
    width:'100%',
    padding:'0px 20px',
    "& .input": {
        bordeBottom:'1px solid black'
    }
})


const StyledContainer = styled(StyledBorderWrapper)({
  display: "flex",
  flexDirection: "column",
  gap: 20,
  height:'auto'
});


const StyledNoneText = styled(Typography)({
    fontSize: 14,
})


const StyledTop = styled(Box)({
    display:'flex',
    justifyContent:'space-between',
    width:'100%',
    alignItems:'center',
    paddingRight:10
})

const StyledTitle = styled(StyledShadowContainer)({
  paddingRight: 20,
  paddingLeft: 14,
});
