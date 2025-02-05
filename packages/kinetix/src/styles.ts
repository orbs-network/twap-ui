// import { Components, Styles } from "@orbs-network/twap-ui";
// import { DefaultTheme, styled } from "styled-components";
// const MOBILE = 500;

// export const lightTheme = {
//   palette: {
//     mode: "light",
//   },

//   typography: {
//     fontFamily: "inherit",
//   },
// };
// const isDark = (theme: DefaultTheme) => theme.palette.mode === "dark";

// export const darkTheme = {
//   palette: {
//     mode: "dark",
//   },
//   typography: {
//     fontFamily: "inherit",
//   },
// };

// export const StyledMaxButton = styled("button")({
//   background: "rgb(194 194 194/1)",
//   borderRadius: 38,
//   border: "unset",
//   padding: "3px 8px",
//   fontSize: 13,
//   fontWeight: 400,
//   color: "rgb(29 30 32/1)",
//   cursor: "pointer",
// });

// const baseStyles = (theme: DefaultTheme) => {
//   const darkMode = isDark(theme);
//   return {
//     mainBackground: "#3C3837",
//     button: "linear-gradient(88deg,#ee4e3d 10.27%,#f39837 115.95%)",
//     buttonColor: darkMode ? "white" : "rgb(49, 65, 94)",
//     secondaryBackground: "#333333",
//     iconsColor: "white",
//     tooltipBackground: darkMode ? "rgb(38 40 43/1)" : "#D8DEEA",
//     tooltipTextColor: darkMode ? "rgb(40, 13, 95)" : "rgb(77, 103, 147)",
//     spinnerColor: darkMode ? "rgb(194 194 194/1)" : "rgb(77, 103, 147)",
//     cardBackground: darkMode ? "rgb(29 30 32/1)" : "rgb(228, 233, 241)",
//     progressBarColor: darkMode ? "rgb(140, 140, 227)" : "rgb(102, 101, 221)",
//     progressBarTrackColor: darkMode ? "#373E55" : "#D8DEEA",
//     textColorMain: "rgb(194 194 194/1)",
//     labelColor: "rgb(100 102 104/1)",
//     skeleton: darkMode ? "rgb(255,255,255, 0.1)" : "rgb(0,0,0, 0.1)",
//     darkMode,
//     inputColor: "rgb(169 169 169/1)",
//   };
// };

// const buttonStyles = (theme: DefaultTheme) => {
//   const styles = baseStyles(theme);
//   return {
//     color: styles.buttonColor,
//     padding: "0px 5px",
//     fontSize: 16,
//     fontWeight: 600,
//     cursor: "pointer",
//     transition: "0.2s all",
//     borderRadius: 12,
//     backgroundImage: styles.button,
//   };
// };

// export const StyledPoweredBy = styled(Components.PoweredBy)(({ theme }) => ({
//   marginTop: 20,
//   p: {
//     color: baseStyles(theme).labelColor,
//     fontSize: 15,
//     fontWeight: 500,
//   },
// }));

// export const StyledTopGrid = styled(Styles.StyledColumnFlex)({
//   gap: 0,
// });
// export const StyledTokenBalance = styled(Components.TokenBalance)(({ theme }) => ({
//   maxWidth: "unset",
//   "*": {
//     fontSize: 16,
//     fontWeight: 500,
//     color: baseStyles(theme).labelColor,
//   },
// }));

// export const StyledTokenPanel = styled(Components.Base.Card)(({ theme }) => {
//   const styles = baseStyles(theme);
//   return {
//     width: "100%",
//     ".twap-loader": {
//       backgroundColor: `${styles.skeleton}!important`,
//     },
//     input: {
//       textAlign: "left",
//       fontSize: 22,
//       height: 33,
//       fontWeight: 500,
//     },
//   };
// });

// export const StyledTokenPanelHeader = styled(Styles.StyledRowFlex)(({ theme }) => {
//   const styles = baseStyles(theme);
//   return {
//     width: "auto",
//     gap: 0,
//     flex: 1,
//     justifyContent: "flex-start",
//     overflow: "hidden",
//     "*": {
//       color: styles.labelColor,
//       fontSize: 15,
//       fontWeight: 500,
//     },
//   };
// });

// export const StyledTokenPanelInput = styled(Components.TokenPanelInput)({});

// export const StyledTokenSelect = styled("div")(({ theme }) => {
//   const styles = baseStyles(theme);
//   return {
//     ".twap-token-select": {
//       background: "rgb(53 56 59/1)",
//       borderRadius: 11,
//       transition: "0.2s all",
//       ".twap-token-selected": {
//         padding: "8px 12px 8px 12px",
//       },
//       ".twap-token-not-selected": {
//         padding: "8px 12px 8px 12px",
//       },
//       "*": {
//         fontSize: 15,
//         fontWeight: 500,
//         color: styles.textColorMain,
//       },

//       ".twap-token-logo": {
//         width: 20,
//         height: 20,
//       },

//       svg: {
//         marginLeft: 15,
//         width: 18,
//         height: 18,
//         "*": {
//           fill: styles.labelColor,
//         },
//       },
//       "&:hover": {
//         background: "#43464A",
//       },
//     },
//   };
// });

// export const StyledChangeTokensOrder = styled(Components.ChangeTokensOrder)({
//   height: 4,
//   button: {
//     position: "absolute",
//     background: "black",
//     width: 32,
//     height: 32,
//     borderRadius: "50%",
//     ".MuiTouchRipple-root": {
//       display: "none",
//     },
//     svg: {
//       width: 12,
//       height: 12,
//       opacity: 0.5,
//     },
//   },
// });

// export const StyledTradeSize = styled(Components.Base.Card)(({ theme }) => {
//   const styles = baseStyles(theme);
//   return {
//     ".twap-usd": {
//       color: styles.labelColor,
//     },
//     ".twap-chunks-size": {
//       "*": {
//         color: styles.labelColor,
//       },
//     },
//     ".twap-chunks-amount-placeholder": {
//       color: styles.textColorMain,
//     },

//     span: {
//       color: styles.textColorMain,
//     },
//   };
// });

// export const StyledPriceCard = styled(Components.Base.Card)({});

// export const configureStyles = (theme: DefaultTheme) => {
//   const styles = baseStyles(theme);
//   const darkMode = isDark(theme);
//   return {
//     ".twap-label": {
//       color: styles.labelColor,
//       fontSize: 15,
//       fontWeight: 500,
//       "& p": {
//         fontWeight: "inherit",
//       },
//     },
//     ".twap-button": {
//       ...buttonStyles(theme),
//     },
//     ".twap-ui-close": {
//       "*": {
//         color: styles.textColorMain,
//       },
//     },
//     ".twap-modal": {
//       color: styles.textColorMain,
//       fontFamily: "Inter",
//       ".twap-modal-content": {
//         background: "rgb(29 30 32/1)",
//         padding: 16,
//         border: "1px solid rgb(38 40 43/1)",
//         borderRadius: 16,
//       },
//     },
//     ".twap-card": {
//       background: styles.cardBackground,
//       borderRadius: 16,
//       padding: 12,
//       minHeight: 50,
//       svg: {
//         fill: styles.textColorMain,
//       },
//     },

//     ".twap-tooltip": {
//       "& .MuiTooltip-tooltip": {
//         backgroundColor: styles.tooltipBackground,
//         borderRadius: 12,
//         color: styles.textColorMain,
//         fontSize: 14,
//         fontFamily: "Inter",
//         lineHeight: "20px",
//         padding: 16,
//         "& *": {
//           color: styles.textColorMain,
//           fontSize: "inherit",
//         },
//       },
//       "& .MuiTooltip-arrow": {
//         color: styles.tooltipBackground,
//       },
//     },
//     ".twap-loader": {
//       backgroundColor: `${styles.skeleton}!important`,
//     },
//     ".twap-button-loader": {
//       color: `${styles.spinnerColor}!important`,
//     },
//     ".twap-time-selector": {
//       ".twap-time-selector-selected": {
//         p: {
//           color: styles.textColorMain,
//         },
//       },
//       ".twap-input": {
//         input: {
//           fontSize: 17,
//         },
//       },
//     },
//     ".twap-time-selector-list": {
//       background: styles.cardBackground,
//       border: darkMode ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)",
//       right: 0,
//       p: {
//         color: "white",
//       },
//       ".twap-time-selector-list-item": {
//         "&:hover": {
//           background: darkMode ? "rgba(255,255,255, 0.05)" : "rgba(0,0,0, 0.03)",
//         },
//       },
//     },

//     ".twap-container": {
//       width: "100%",
//       display: "flex",
//       flexDirection: "column" as const,
//       gap: 15,
//       "*": {
//         "&::-webkit-scrollbar": {
//           display: "none",
//         },
//       },
//     },
//     ".twap-slider": {
//       "& .MuiSlider-valueLabel": {
//         background: styles.tooltipBackground,
//       },
//       "& .MuiSlider-valueLabelLabel": {
//         color: styles.tooltipTextColor,
//       },
//       "& .MuiSlider-track": {
//         color: styles.button,
//       },
//       "& .MuiSlider-thumb": {
//         background: styles.iconsColor,
//       },
//     },

//     ".twap-token-name": {
//       fontSize: 18,
//     },
//     ".twap-token-logo": {
//       width: 28,
//       height: 28,
//     },
//     ".twap-switch": {
//       "& .MuiSwitch-thumb": {
//         background: "white",
//       },
//       "& .MuiSwitch-track": {
//         background: `${styles.secondaryBackground}!important`,
//         opacity: "1!important",
//       },
//       "& .Mui-checked+.MuiSwitch-track": {
//         backgroundColor: `${styles.secondaryBackground}!important`,
//         opacity: "1!important",
//       },
//       "& .Mui-checked .MuiSwitch-thumb": {
//         background: styles.button,
//       },
//     },

//     ".twap-input": {
//       input: {
//         fontFamily: "inherit",
//         fontWeight: 500,
//         outline: "1px solid transparent",
//         transition: "0.2s all",
//         color: styles.inputColor,
//         "&::placeholder": {
//           opacity: 0.5,
//         },
//       },
//     },
//     ".twap-odnp-link": {
//       padding: "10px 20px!important",
//       minHeight: 40,
//     },
//     ".twap-odnp-separator": {
//       background: `${styles.textColorMain}!important`,
//     },
//     ".twap-odnp-button": {
//       height: 32,
//       border: "unset",
//       borderRadius: 14,
//       fontWeight: 500,
//       fontSize: 14,
//       background: "rgb(53 56 59/1)",
//       "&:hover": {
//         background: "#43464A",
//       },
//     },

//     ".twap-button-disabled": {
//       cursor: "not-allowed!important",
//       opacity: "0.5!important",
//     },

//     ".twap-order-preview": {
//       ".twap-order-progress": {
//         height: 4,
//         background: "rgba(255,255,255, 0.1)!important",
//         ".MuiLinearProgress-bar": {
//           height: 4,
//           background: styles.button,
//         },
//       },
//     },
//     ".MuiBackdrop-root": {
//       backdropFilter: "blur(15px)",
//       background: "rgba(0,0,0,.4)!important",
//     },
//     "@media(max-width:450px)": {
//       ".twap-limit-price-input": {
//         ".twap-token-display img": {
//           display: "none",
//         },
//       },
//       ".twap-trade-size": {
//         ".twap-chunks-size": {
//           display: "flex",
//           flexDirection: "column",
//         },
//       },
//     },
//   };
// };

export {};
