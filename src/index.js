import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import {ChakraProvider, ColorModeScript, extendTheme} from "@chakra-ui/react";
import {BrowserRouter} from "react-router-dom";
import {SGUAI} from "./SGUAI";

const root = ReactDOM.createRoot(document.getElementById('root'));

const config = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

const theme = extendTheme({ config });

window.SGuai = new SGUAI();

root.render(
  <React.StrictMode>
    <BrowserRouter basename="/">
      <ChakraProvider theme={theme}>
        <ColorModeScript initialColorMode={theme.config.initialColorMode} />
        <App />
      </ChakraProvider>
    </BrowserRouter>
  </React.StrictMode>
);