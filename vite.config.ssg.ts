import { defineConfig } from 'vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

// Routes to pre-render
const routes = [
  '/',
  '/login',
  '/dashboard',
  '/dashboard/billing',
  '/dashboard/clients',
  '/dashboard/errors',
  '/dashboard/performance',
  '/dashboard/rate-limiting',
  '/dashboard/security',
  '/dashboard/settings',
  '/dashboard/traffic',
  '/dashboard/usage'
]

export default defineConfig({
  plugins: [
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    viteReact(),
    {
      name: 'ssg-html-generator',
      writeBundle(options, bundle) {
        // This will be handled by the pre-render script
      }
    }
  ],
  base: '/',
  build: {
    outDir: 'dist-ssg',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('d3')) {
              return 'd3-vendor'
            }
            if (id.includes('@tanstack')) {
              return 'tanstack-vendor'
            }
            if (id.includes('react')) {
              return 'react-vendor'
            }
          }
        },
      },
    },
  },
})