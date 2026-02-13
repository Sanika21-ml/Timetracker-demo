import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { msalConfig } from './authConfig';

const pca = new PublicClientApplication(msalConfig);

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <MsalProvider instance={pca}>
    <App />
  </MsalProvider>
);
