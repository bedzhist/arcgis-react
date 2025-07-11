import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './config';
import { AuthProvider, ThemeProvider } from './contexts';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>
);
