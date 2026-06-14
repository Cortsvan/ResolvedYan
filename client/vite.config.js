// vite.config.js
// This is the configuration file for Vite (our build tool).
// We add the Tailwind CSS plugin here so Vite knows to process
// Tailwind utility classes in our CSS files.
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),       // Enables React/JSX support
    tailwindcss(), // Enables Tailwind CSS processing
  ],
});
