import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // This allows the app to access the API key from Vercel's environment variables
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
    // Prevents "process is not defined" error in browser
    'process.env': {},
  },
});