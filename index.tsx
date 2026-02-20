import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { installLogRedactionGuard } from './services/redaction';
import { installSameOriginFetchGuard } from './services/sameOriginGuard';

installLogRedactionGuard();
installSameOriginFetchGuard();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
