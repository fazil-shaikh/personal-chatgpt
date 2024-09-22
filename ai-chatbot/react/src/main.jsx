import React from 'react'
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from "react-router-dom";

// mounting point for the React application
const container = document.getElementById('root');

// generate a new root container for rendering components
// this allows for a more fluid user experience
const root = createRoot(container);

root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);