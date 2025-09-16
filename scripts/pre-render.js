#!/usr/bin/env node

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT_DIR = path.resolve(__dirname, '..')
const DIST_DIR = path.join(ROOT_DIR, 'dist-ssg')

// Define all routes to pre-render
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

async function preRender() {
  console.log('🚀 Starting pre-rendering...')

  try {
    // Read the base index.html
    const indexHtmlPath = path.join(DIST_DIR, 'index.html')
    const indexHtml = await fs.readFile(indexHtmlPath, 'utf-8')

    // Process each route
    for (const route of routes) {
      if (route === '/') {
        console.log(`✓ Root route already has index.html`)
        continue
      }

      // Create directory structure
      const routePath = path.join(DIST_DIR, route)
      await fs.mkdir(routePath, { recursive: true })

      // Create a modified index.html for this route
      // Add base tag and route information for proper asset loading
      const modifiedHtml = indexHtml
        .replace('<head>', `<head>\n  <base href="/">`)
        .replace('</head>', `  <script>window.__INITIAL_ROUTE__ = '${route}';</script>\n</head>`)

      // Write the index.html file
      const outputPath = path.join(routePath, 'index.html')
      await fs.writeFile(outputPath, modifiedHtml)

      console.log(`✓ Pre-rendered: ${route}`)
    }

    // Copy 404.html for fallback
    const notFoundHtml = indexHtml
      .replace('<head>', `<head>\n  <base href="/">`)
      .replace('<title>', '<title>404 - ')

    await fs.writeFile(path.join(DIST_DIR, '404.html'), notFoundHtml)
    console.log(`✓ Created 404.html fallback`)

    console.log('✨ Pre-rendering complete!')
    console.log(`📁 Output directory: ${DIST_DIR}`)

  } catch (error) {
    console.error('❌ Pre-rendering failed:', error)
    process.exit(1)
  }
}

// Run the pre-render
preRender()