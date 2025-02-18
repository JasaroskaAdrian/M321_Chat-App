import { defineConfig } from 'vite';
import { VitePluginNode } from 'vite-plugin-node';

export default defineConfig({
  root: 'Client',
  optimizeDeps: {
    exclude: ['fsevents'], // Avoids macOS-specific optional dependency issues
  },
  server: {
    port: 443, // Vite server for frontend
    host: '0.0.0.0', // Allows external access
    hmr: {
      protocol: 'ws', // WebSocket protocol for Hot Module Replacement (HMR)
      host: 'localhost',
      port: 24678, // HMR server port
      clientPort: 443, // Frontend server port
    },
  },
  build: {
    sourcemap: true, // Useful for debugging in production builds
  },
  plugins: [
    ...VitePluginNode({
      adapter: 'express',
      appPath: './App/Server/server.js', // Path to the Express server
      exportName: 'viteNodeApp',
      tsCompiler: 'esbuild', // TypeScript compiler (optional for JS)
    }),
  ],
});