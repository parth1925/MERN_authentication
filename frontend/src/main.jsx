import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx';
import { AppProvider } from './context/AppContext.jsx';
import { ToastContainer } from 'react-toastify';

//backend url 
export const server = "http://localhost:5000";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
    <ToastContainer />
  </StrictMode>
);