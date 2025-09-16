#!/usr/bin/env node

/**
 * Advanced SSG (Static Site Generation) Script
 * Generates individual HTML files for each route with optimized loading
 */

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT_DIR = path.resolve(__dirname, '..')
const DIST_DIR = path.join(ROOT_DIR, 'dist-ssg')

// Route configuration with metadata
const routeConfig = {
  '/': {
    title: 'Home - API Gateway Dashboard',
    description: 'API Gateway Dashboard Home'
  },
  '/login': {
    title: 'Login - API Gateway Dashboard',
    description: 'Sign in to API Gateway Dashboard'
  },
  '/dashboard': {
    title: 'Dashboard - API Gateway',
    description: 'API Gateway Dashboard Overview'
  },
  '/dashboard/billing': {
    title: 'Billing - Dashboard',
    description: 'Billing and payment information'
  },
  '/dashboard/clients': {
    title: 'Clients - Dashboard',
    description: 'API client management'
  },
  '/dashboard/errors': {
    title: 'Errors - Dashboard',
    description: 'Error logs and monitoring'
  },
  '/dashboard/performance': {
    title: 'Performance - Dashboard',
    description: 'Performance metrics and analytics'
  },
  '/dashboard/rate-limiting': {
    title: 'Rate Limiting - Dashboard',
    description: 'Rate limit configuration'
  },
  '/dashboard/security': {
    title: 'Security - Dashboard',
    description: 'Security settings and logs'
  },
  '/dashboard/settings': {
    title: 'Settings - Dashboard',
    description: 'Dashboard settings'
  },
  '/dashboard/traffic': {
    title: 'Traffic - Dashboard',
    description: 'API traffic analytics'
  },
  '/dashboard/usage': {
    title: 'Usage - Dashboard',
    description: 'API usage statistics'
  }
}

async function generateSSG() {
  console.log('🚀 Starting advanced SSG build...\n')

  try {
    // Read the base index.html
    const indexHtmlPath = path.join(DIST_DIR, 'index.html')
    let baseHtml = await fs.readFile(indexHtmlPath, 'utf-8')

    // Extract the base path for assets
    const assetPaths = baseHtml.match(/(?:href|src)="(\/assets\/[^"]+)"/g) || []

    for (const [route, config] of Object.entries(routeConfig)) {
      if (route === '/') {
        // Update root index.html with metadata
        let rootHtml = baseHtml
          .replace(/<title>.*?<\/title>/, `<title>${config.title}</title>`)
          .replace(/<meta name="description"[^>]*>/, '')
          .replace('</head>', `  <meta name="description" content="${config.description}">\n</head>`)

        await fs.writeFile(indexHtmlPath, rootHtml)
        console.log(`✓ Updated root: ${route}`)
        continue
      }

      // Create directory structure
      const routePath = path.join(DIST_DIR, route)
      await fs.mkdir(routePath, { recursive: true })

      // Calculate relative path to root
      const depth = route.split('/').filter(p => p).length
      const relativePath = '../'.repeat(depth)

      // Create optimized HTML for this route
      let routeHtml = baseHtml
        // Update title
        .replace(/<title>.*?<\/title>/, `<title>${config.title}</title>`)
        // Add meta description
        .replace(/<meta name="description"[^>]*>/, '')
        .replace('</head>', `  <meta name="description" content="${config.description}">\n</head>`)
        // Add canonical URL
        .replace('</head>', `  <link rel="canonical" href="${route}">\n</head>`)
        // Update asset paths to use relative paths
        .replace(/href="\/assets\//g, `href="${relativePath}assets/`)
        .replace(/src="\/assets\//g, `src="${relativePath}assets/`)
        .replace(/href="\/favicon/g, `href="${relativePath}favicon`)
        .replace(/href="\/logo/g, `href="${relativePath}logo`)
        .replace(/href="\/manifest/g, `href="${relativePath}manifest`)
        // Add route preload hint
        .replace('</head>', `  <link rel="preconnect" href="${relativePath}">\n  <script>window.__SSG_ROUTE__ = '${route}';</script>\n</head>`)

      // Write the optimized HTML file
      const outputPath = path.join(routePath, 'index.html')
      await fs.writeFile(outputPath, routeHtml)

      console.log(`✓ Generated: ${route}/index.html (${config.title})`)
    }

    // Create _redirects for Netlify (fallback for dynamic routes)
    const redirectsContent = `# Fallback for client-side routing
/*    /index.html   200`
    await fs.writeFile(path.join(DIST_DIR, '_redirects'), redirectsContent)
    console.log('✓ Created _redirects file')

    // Create 404.html
    const notFoundHtml = baseHtml
      .replace(/<title>.*?<\/title>/, '<title>404 - Page Not Found</title>')
      .replace('</head>', '  <meta name="robots" content="noindex">\n</head>')

    await fs.writeFile(path.join(DIST_DIR, '404.html'), notFoundHtml)
    console.log('✓ Created 404.html')

    // Generate sitemap.xml
    const baseUrl = 'https://your-domain.com' // Update this
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${Object.keys(routeConfig).map(route => `  <url>
    <loc>${baseUrl}${route}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${route === '/' ? '1.0' : route.startsWith('/dashboard') ? '0.8' : '0.6'}</priority>
  </url>`).join('\n')}
</urlset>`

    await fs.writeFile(path.join(DIST_DIR, 'sitemap.xml'), sitemap)
    console.log('✓ Created sitemap.xml')

    // Generate robots.txt
    const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml`

    await fs.writeFile(path.join(DIST_DIR, 'robots.txt'), robotsTxt)
    console.log('✓ Updated robots.txt')

    console.log('\n✨ SSG build complete!')
    console.log(`📁 Output: ${DIST_DIR}`)
    console.log(`📄 Generated ${Object.keys(routeConfig).length} static pages`)
    console.log('\n🌐 Each route now has its own index.html with:')
    console.log('  • Optimized metadata (title, description)')
    console.log('  • Relative asset paths (works in subdirectories)')
    console.log('  • Canonical URLs')
    console.log('  • SEO-friendly structure')

  } catch (error) {
    console.error('❌ SSG build failed:', error)
    process.exit(1)
  }
}

// Run the SSG build
generateSSG()