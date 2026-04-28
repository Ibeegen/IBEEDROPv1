import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

import { registerSW } from 'virtual:pwa-register';

// Register the service worker
const updateSW = registerSW({
  onNeedRefresh() {
    // We could show a prompt here.
  },
  onOfflineReady() {
    // The app is ready to work offline.
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
