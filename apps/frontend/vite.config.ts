import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import type { IncomingMessage, ServerResponse } from 'http'

// Plugin personalizado para manejar redirecciones
const redirectPlugin = () => {
  return {
    name: 'redirect-plugin',
    configureServer(server: any) {
      server.middlewares.use((req: IncomingMessage, res: ServerResponse, next: () => void) => {
        // En desarrollo, redirigir la raíz a /profile-craft/
        if (process.env.NODE_ENV !== 'production' && req.url === '/') {
          res.writeHead(301, { Location: '/profile-craft/' });
          res.end();
          return;
        }
        // Redirigir /profile-craft a /profile-craft/
        if (req.url === '/profile-craft') {
          res.writeHead(301, { Location: '/profile-craft/' });
          res.end();
          return;
        }
        next();
      });
    }
  };
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), redirectPlugin()],
  base: '/profile-craft/',
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src'),
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true,
    port: 5174,
  },
  define: {
    // Make sure environment variables are properly defined at build time
    __DEV__: JSON.stringify(false),
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
  },
})
