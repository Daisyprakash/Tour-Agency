import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Set the port for the Vite development server
    proxy: {
      '/api': {
        target: 'http://localhost:9000', // Your backend server
        changeOrigin: true,
        secure: false, // Set to true if your backend uses HTTPS
      },
    },
  },
});
