import { defineConfig } from 'vite'
import { VitePluginNode } from 'vite-plugin-node'

export default defineConfig({
  root: '.',
  optimizeDeps: {
    exclude: ['fsevents'],
  },
  server: {
    port: 4200,
    host: '0.0.0.0',
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 24678,
      clientPort: 4200
    },
  },
  build: {
    sourcemap: true,
  },
  plugins: [
    ...VitePluginNode({
      adapter: 'express',
      appPath: './App/Server/server.js',
      exportName: 'viteNodeApp',
      tsCompiler: 'esbuild',
    }),
  ],
})