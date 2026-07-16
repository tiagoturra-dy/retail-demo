import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import './index.css';
import { Helper } from './helpers/helper';

if (!Helper.isBot(navigator.userAgent)) {
  createRoot(document.getElementById('root')).render(
    // <StrictMode>
      <App />
    // </StrictMode>,
  );
}
