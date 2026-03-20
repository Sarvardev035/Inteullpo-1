import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';
import App from './App.jsx';
import { FinanceProvider } from './context/FinanceContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <FinanceProvider>
        <App />
        <ToastContainer position="top-right" autoClose={2500} />
      </FinanceProvider>
    </BrowserRouter>
  </React.StrictMode>
);
