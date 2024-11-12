import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Import your publishable key
const PUBLISHABLE_KEY = "pk_test_c291bmQtcGlnZW9uLTYwLmNsZXJrLmFjY291bnRzLmRldiQ"

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
