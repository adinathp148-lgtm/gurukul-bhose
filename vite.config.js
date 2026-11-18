import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Root fallback vite configuration pointing to apps/public-website
export default defineConfig({
  root: path.resolve(__dirname, 'apps/public-website'),
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'apps/public-website/src'),
      '@shared': path.resolve(__dirname, 'shared'),
      // Backwards-compatible aliases for legacy imports
      '../firebase': path.resolve(__dirname, 'shared/firebase'),
      '../contexts': path.resolve(__dirname, 'shared/contexts'),
      '../services': path.resolve(__dirname, 'shared/services'),
      '../components': path.resolve(__dirname, 'shared/components'),
      '../layouts': path.resolve(__dirname, 'shared/layouts'),
      '../data': path.resolve(__dirname, 'shared/data'),
      '../styles': path.resolve(__dirname, 'shared/styles')
    },
  },
  server: {
    port: 3000,
    open: false,
  },
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: false,
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom', 'react-helmet-async'],
          'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
          'vendor-icons': ['lucide-react']
        }
      }
    }
  }
});
