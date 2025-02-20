import { defineConfig } from 'vite'
import { VitePluginNode } from 'vite-plugin-node'
import fullReload from 'vite-plugin-full-reload'

export default defineConfig({
  root: '.',
  optimizeDeps: {
    exclude: ['fsevents'],
  },
  server: {
    port: 4300,
    host: '0.0.0.0',
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 24678,
      clientPort: 4300
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
    fullReload(['client/**/*', 'server/**/*'])
  ],
})