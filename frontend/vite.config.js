import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), svgr()],
  server: {
    host: "0.0.0.0",
    port: Number(process.env.VITE_PORT || 5173),
    strictPort: true,
  },
  preview: {
    host: "0.0.0.0",
    port: Number(process.env.VITE_PREVIEW_PORT || 4173),
    strictPort: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'mui-vendor': ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'chart-vendor': ['recharts'],
          'utils': ['axios'],
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    minify: 'esbuild',
    sourcemap: false,
  },
})
