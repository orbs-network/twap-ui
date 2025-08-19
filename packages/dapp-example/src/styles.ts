import { Config } from "@orbs-network/twap-sdk";
import { Configs } from "@orbs-network/twap-ui";
import { createGlobalStyle } from "styled-components";

export const darkTheme = {
  palette: {
    mode: "dark",
  },
};

export const lightTheme = {
  palette: {
    mode: "light",
  },
};

const fonts = {
  [Configs.Chronos.name]: "TT Firs Neue Trial",
  [Configs.QuickSwap.name]: "Inter",
  Kinetix: "Inter",
  [Configs.Thena.name]: "Inter",
  sushiswap: "Inter",
  [Configs.SpookySwap.name]: "Red Hat Display",
  [Configs.PancakeSwap.name]: "Kanit",
  [Configs.BaseSwap.name]: "Montserrat",
  StellaSwap: "DM Sans",
  [Configs.Lynex.name]: "Montserrat",
  [Configs.SparkDEX.name]: "Montserrat",
  [Configs.Arbidex.name]: "Quicksand",
  SyncSwap: "Inter",
  [Configs.DragonSwap.name]: "Fredoka",
};

export const GlobalStyles = createGlobalStyle<{ config: Config }>(({ config }) => {
  return {
    ".list-item": {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "10px 16px 10px 8px",
      borderRadius: 16,
      marginBottom: 0,
      cursor: "pointer",
      "&:hover": {
        background: "rgba(255,255,255, 0.1)",
      },
    },
    ".config-select-content": {
      display: "flex",
      flexDirection: "column",
      gap: 10,
    },
    ".config-select-list": {
      flex: 1,
      overflowY: "auto",
      maxHeight: "40vh",
      "&-item": {
        paddingLeft: 12,
        justifyContent: "flex-start",
        gap: 16,
        img: {
          width: 40,
          height: 40,
          borderRadius: "50%",
        },
      },
    },
    ".config-select-button": {
      background: "#1A1A1E",
      borderRadius: 10,
      fontSize: 15,
      border: "none",
      color: "white",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: 5,
      p: {
        fontWeight: 700,
      },
      "&:hover": {
        transform: "scale(1.02)",
        transformOrigin: "center",
      },
    },
    ".input": {
      border: "none",
      color: "white",
      outline: "none",
      background: "rgba(255, 255, 255, 0.05)",
      borderRadius: 12,
      padding: "10px 10px",
      fontSize: 24,
      fontWeight: 500,
      width: "100%",
    },
    ".popup-main": {
      maxHeight: "80vh",
      maxWidth: 580,
      width: "90vw",
      margin: "auto",
      backgroundColor: "rgb(19, 19, 19)!important",
      borderRadius: 16,
      border: "1px solid rgba(255, 255, 255, 0.12)",
      color: "white",
      outline: "none",
      position: "relative",
      paddingTop: 0,
      display: "flex",
      flexDirection: "column",
      ".ant-modal-body": {
        display: "flex",
        flexDirection: "column",
        gap: 10,
      },
      ".popup-content": {
        flex: 1,
        overflowY: "auto",
        maxHeight: "500px",
        height: "70vh",
      },
      ".popup-header": {
        position: "sticky",
        top: 0,
        padding: "10px 10px",
        background: "rgb(19, 19, 19)",
        zIndex: 1,
        display: "flex",
        justifyContent: "space-between",
        borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
        marginBottom: 10,
        h2: {
          fontSize: 20,
        },
        ".close-btn": {
          right: 7,
          marginLeft: "auto",
          top: 7,
          background: "transparent",
          padding: 5,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer ",
          border: "none",
          svg: {
            color: "white",
            width: 20,
            height: 20,
          },
        },
      },
    },

    body: {
      fontFamily: fonts[config.name] || "Montserrat",
      lineHeight: "normal",
      "*": {
        fontFamily: "inherit",
        scrollbarWidth: "none",
      },
    },
    ".app": {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "30px 50px",
    },
    ".navbar": {
      width: "100%",
      display: "flex",
      justifyContent: "space-between",
      marginBottom: 50,
    },
    ".dapp": {
      maxWidth: 500,
      marginLeft: "auto",
      marginRight: "auto",
    },
    ".panel-selector": {
      display: "flex",
      borderRadius: 18,
      gap: 5,
      width: "fit-content",
      padding: 5,
      background: "rgba(255,255,255, 0.2)",
      marginBottom: 20,
      "&-btn": {
        background: "transparent",
        padding: "5px 15px",
        fontWeight: 500,
        fontSize: 14,
        borderRadius: 20,
        color: "white",
        border: "unset",
        cursor: "pointer",

        "&:hover": {
          background: "rgba(0,0,0, 0.4)",
        },
        "&-selected": {
          background: "black",
          "&:hover": {
            background: "black",
          },
        },
      },
    },
    ".token-select-input": {
      width: "100%",
      fontSize: 16,
      fontWeight: 500,
      background: "transparent",
      borderRadius: 12,
      border: "1px solid rgba(255,255,255, 0.2)",
      padding: "10px 10px",
      color: "white",
      outline: "none",
    },
    ".token-select-list": {
      height: 500,
      maxHeight: "70vh",
      paddingTop: 20,
      "&-token": {
        "&-left": {
          display: "flex",
          gap: 10,
          alignItems: "center",
        },
        "&-right": {
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 5,
          ".balance": {
            fontSize: 13,
            opacity: 0.5,
          },
          ".usd": {
            fontSize: 15,
          },
        },
      },
    },
    ".MuiModal-root": {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
  };
});
