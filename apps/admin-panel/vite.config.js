import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  root: path.resolve(__dirname),
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../../shared'),
      // Backwards-compatible aliases for legacy imports
      '../firebase': path.resolve(__dirname, '../../shared/firebase'),
      '../contexts': path.resolve(__dirname, '../../shared/contexts'),
      '../services': path.resolve(__dirname, '../../shared/services'),
      '../components': path.resolve(__dirname, '../../shared/components'),
      '../layouts': path.resolve(__dirname, '../../shared/layouts'),
      '../data': path.resolve(__dirname, '../../shared/data'),
      '../styles': path.resolve(__dirname, '../../shared/styles')
    },
  },
  server: {
    port: 3001,
    open: false,
  },
  build: {
    outDir: path.resolve(__dirname, '../../dist/admin'),
    emptyOutDir: false, // Don't wipe /telecaller subfolder if built
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
