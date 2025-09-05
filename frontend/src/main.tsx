import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App'; // Make sure App.tsx exists

// Get the root container
const container = document.getElementById('root');

if (!container) {
  throw new Error("Root element not found. Ensure <div id='root'></div> exists in index.html.");
}

// Create React root and render App
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
