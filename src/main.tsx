import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';

import './index.css';

import './assets/styles/global/variables.css';
import './assets/styles/global/reset.css';
import './assets/styles/global/shared.css';
import './assets/styles/global/layout.css';
import './assets/styles/global/dark-theme.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
