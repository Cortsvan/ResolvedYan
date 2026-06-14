// ============================================================
// src/main.jsx
// ------------------------------------------------------------
// This is the ENTRY POINT of the React application.
// When the browser loads the app, this file runs first.
//
// It tells React: "Find the <div id="root"> in index.html
// and render our App component inside it."
//
// You rarely need to change this file as a beginner.
// ============================================================

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// Import our global CSS styles (including Tailwind)
import "./index.css";
// Import our root App component
import App from "./App.jsx";

// Find the HTML element with id="root" in index.html
// and mount our React application inside it
createRoot(document.getElementById("root")).render(
  // StrictMode is a development tool that helps find potential problems.
  // It makes React run some checks twice in development mode.
  // It has NO effect in production builds.
  <StrictMode>
    <App />
  </StrictMode>
);
