#!/usr/bin/env node

/**
 * SSG Build Testing Script
 * Tests the static site generation output for correctness
 */

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT_DIR = path.resolve(__dirname, '..')
const DIST_DIR = path.join(ROOT_DIR, 'dist-ssg')

// Colors for output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
}

// Test configuration
const tests = {
  fileStructure: {
    name: 'File Structure',
    files: [
      'index.html',
      'login/index.html',
      'dashboard/index.html',
      'dashboard/billing/index.html',
      'dashboard/clients/index.html',
      'dashboard/errors/index.html',
      'dashboard/performance/index.html',
      'dashboard/rate-limiting/index.html',
      'dashboard/security/index.html',
      'dashboard/settings/index.html',
      'dashboard/traffic/index.html',
      'dashboard/usage/index.html',
      '404.html',
      'sitemap.xml',
      'robots.txt',
      '_redirects'
    ]
  },
  htmlContent: {
    name: 'HTML Content Validation',
    routes: [
      { path: 'index.html', title: 'Home - API Gateway Dashboard' },
      { path: 'login/index.html', title: 'Login - API Gateway Dashboard' },
      { path: 'dashboard/index.html', title: 'Dashboard - API Gateway' },
      { path: 'dashboard/billing/index.html', title: 'Billing - Dashboard' }
    ]
  },
  assetPaths: {
    name: 'Asset Path Validation',
    routes: [
      { path: 'dashboard/index.html', expectedPath: '../assets/' },
      { path: 'dashboard/billing/index.html', expectedPath: '../../assets/' }
    ]
  }
}

async function runTests() {
  console.log(`\n${colors.blue}🧪 Starting SSG Build Tests${colors.reset}\n`)

  let totalTests = 0
  let passedTests = 0
  let failedTests = 0

  // Test 1: File Structure
  console.log(`${colors.cyan}📁 Testing File Structure...${colors.reset}`)
  for (const file of tests.fileStructure.files) {
    totalTests++
    const filePath = path.join(DIST_DIR, file)
    try {
      await fs.access(filePath)
      console.log(`  ${colors.green}✓${colors.reset} ${file}`)
      passedTests++
    } catch {
      console.log(`  ${colors.red}✗${colors.reset} ${file} - File not found`)
      failedTests++
    }
  }

  // Test 2: HTML Content
  console.log(`\n${colors.cyan}📝 Testing HTML Content...${colors.reset}`)
  for (const route of tests.htmlContent.routes) {
    totalTests++
    const filePath = path.join(DIST_DIR, route.path)
    try {
      const content = await fs.readFile(filePath, 'utf-8')
      if (content.includes(`<title>${route.title}</title>`)) {
        console.log(`  ${colors.green}✓${colors.reset} ${route.path} - Title correct`)
        passedTests++
      } else {
        console.log(`  ${colors.red}✗${colors.reset} ${route.path} - Title mismatch`)
        failedTests++
      }
    } catch (error) {
      console.log(`  ${colors.red}✗${colors.reset} ${route.path} - Error reading file`)
      failedTests++
    }
  }

  // Test 3: Asset Paths
  console.log(`\n${colors.cyan}🔗 Testing Asset Paths...${colors.reset}`)
  for (const route of tests.assetPaths.routes) {
    totalTests++
    const filePath = path.join(DIST_DIR, route.path)
    try {
      const content = await fs.readFile(filePath, 'utf-8')
      if (content.includes(`href="${route.expectedPath}`)) {
        console.log(`  ${colors.green}✓${colors.reset} ${route.path} - Asset paths correct`)
        passedTests++
      } else {
        console.log(`  ${colors.red}✗${colors.reset} ${route.path} - Asset paths incorrect`)
        failedTests++
      }
    } catch {
      console.log(`  ${colors.red}✗${colors.reset} ${route.path} - Error reading file`)
      failedTests++
    }
  }

  // Test 4: File Sizes
  console.log(`\n${colors.cyan}📊 Checking File Sizes...${colors.reset}`)
  const assetDir = path.join(DIST_DIR, 'assets')
  try {
    const files = await fs.readdir(assetDir)
    let totalSize = 0

    for (const file of files) {
      const stats = await fs.stat(path.join(assetDir, file))
      totalSize += stats.size
      const sizeKB = (stats.size / 1024).toFixed(2)

      if (file.endsWith('.js')) {
        console.log(`  📦 ${file}: ${sizeKB} KB`)
      }
    }

    const totalSizeMB = (totalSize / 1024 / 1024).toFixed(2)
    console.log(`  ${colors.blue}Total assets size: ${totalSizeMB} MB${colors.reset}`)
  } catch (error) {
    console.log(`  ${colors.red}✗${colors.reset} Could not read assets directory`)
  }

  // Summary
  console.log(`\n${colors.blue}═══════════════════════════════${colors.reset}`)
  console.log(`${colors.cyan}📈 Test Summary:${colors.reset}`)
  console.log(`  Total Tests: ${totalTests}`)
  console.log(`  ${colors.green}Passed: ${passedTests}${colors.reset}`)
  console.log(`  ${colors.red}Failed: ${failedTests}${colors.reset}`)

  const successRate = ((passedTests / totalTests) * 100).toFixed(1)
  if (failedTests === 0) {
    console.log(`\n${colors.green}✨ All tests passed! (${successRate}%)${colors.reset}`)
  } else {
    console.log(`\n${colors.yellow}⚠️  Some tests failed (${successRate}% passed)${colors.reset}`)
  }

  return failedTests === 0
}

// Server testing function
async function startTestServer() {
  console.log(`\n${colors.blue}🚀 Starting Test Server...${colors.reset}`)

  const PORT = 8080
  console.log(`\nServer starting on http://localhost:${PORT}`)
  console.log(`\n${colors.cyan}Test these routes:${colors.reset}`)
  console.log(`  http://localhost:${PORT}/`)
  console.log(`  http://localhost:${PORT}/login`)
  console.log(`  http://localhost:${PORT}/dashboard`)
  console.log(`  http://localhost:${PORT}/dashboard/billing`)
  console.log(`\n${colors.yellow}Press Ctrl+C to stop the server${colors.reset}\n`)

  try {
    await execAsync(`npx serve dist-ssg -p ${PORT}`)
  } catch (error) {
    // Server stopped by user
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2)

  if (args.includes('--serve')) {
    await startTestServer()
  } else {
    const success = await runTests()

    if (args.includes('--strict')) {
      process.exit(success ? 0 : 1)
    }

    if (!args.includes('--no-serve')) {
      console.log(`\n${colors.yellow}Tip: Run with --serve to start a test server${colors.reset}`)
      console.log(`${colors.yellow}     npm run test:ssg -- --serve${colors.reset}`)
    }
  }
}

main().catch(error => {
  console.error(`${colors.red}Error:${colors.reset}`, error)
  process.exit(1)
})