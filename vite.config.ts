import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import type { IncomingMessage, ServerResponse } from 'http'

// Plugin personalizado para manejar redirecciones
const redirectPlugin = () => {
  return {
    name: 'redirect-plugin',
    configureServer(server: any) {
      server.middlewares.use((req: IncomingMessage, res: ServerResponse, next: () => void) => {
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
  server: {
    host: true,
    port: 5174,
  },
  define: {
    // Make sure environment variables are properly defined at build time
    __DEV__: JSON.stringify(false),
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
  },
})
