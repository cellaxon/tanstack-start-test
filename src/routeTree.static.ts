/* eslint-disable */
// @ts-nocheck

// Static route tree for client-only build

import { createRootRoute } from '@tanstack/react-router'
import { Route as rootRouteImport } from './routes/__root'
import { Route as LoginRouteImport } from './routes/login'
import { Route as DashboardRouteImport } from './routes/dashboard'
import { Route as IndexRouteImport } from './routes/index'
import { Route as DashboardIndexRouteImport } from './routes/dashboard/index'
import { Route as DashboardUsageRouteImport } from './routes/dashboard/usage'
import { Route as DashboardTrafficRouteImport } from './routes/dashboard/traffic'
import { Route as DashboardSettingsRouteImport } from './routes/dashboard/settings'
import { Route as DashboardSecurityRouteImport } from './routes/dashboard/security'
import { Route as DashboardRateLimitingRouteImport } from './routes/dashboard/rate-limiting'
import { Route as DashboardPerformanceRouteImport } from './routes/dashboard/performance'
import { Route as DashboardErrorsRouteImport } from './routes/dashboard/errors'
import { Route as DashboardClientsRouteImport } from './routes/dashboard/clients'
import { Route as DashboardBillingRouteImport } from './routes/dashboard/billing'

const rootRoute = rootRouteImport

const LoginRoute = LoginRouteImport.update({
  id: '/login',
  path: '/login',
  getParentRoute: () => rootRoute,
} as any)

const DashboardRoute = DashboardRouteImport.update({
  id: '/dashboard',
  path: '/dashboard',
  getParentRoute: () => rootRoute,
} as any)

const IndexRoute = IndexRouteImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

const DashboardIndexRoute = DashboardIndexRouteImport.update({
  id: '/dashboard/',
  path: '/',
  getParentRoute: () => DashboardRoute,
} as any)

const DashboardUsageRoute = DashboardUsageRouteImport.update({
  id: '/dashboard/usage',
  path: '/usage',
  getParentRoute: () => DashboardRoute,
} as any)

const DashboardTrafficRoute = DashboardTrafficRouteImport.update({
  id: '/dashboard/traffic',
  path: '/traffic',
  getParentRoute: () => DashboardRoute,
} as any)

const DashboardSettingsRoute = DashboardSettingsRouteImport.update({
  id: '/dashboard/settings',
  path: '/settings',
  getParentRoute: () => DashboardRoute,
} as any)

const DashboardSecurityRoute = DashboardSecurityRouteImport.update({
  id: '/dashboard/security',
  path: '/security',
  getParentRoute: () => DashboardRoute,
} as any)

const DashboardRateLimitingRoute = DashboardRateLimitingRouteImport.update({
  id: '/dashboard/rate-limiting',
  path: '/rate-limiting',
  getParentRoute: () => DashboardRoute,
} as any)

const DashboardPerformanceRoute = DashboardPerformanceRouteImport.update({
  id: '/dashboard/performance',
  path: '/performance',
  getParentRoute: () => DashboardRoute,
} as any)

const DashboardErrorsRoute = DashboardErrorsRouteImport.update({
  id: '/dashboard/errors',
  path: '/errors',
  getParentRoute: () => DashboardRoute,
} as any)

const DashboardClientsRoute = DashboardClientsRouteImport.update({
  id: '/dashboard/clients',
  path: '/clients',
  getParentRoute: () => DashboardRoute,
} as any)

const DashboardBillingRoute = DashboardBillingRouteImport.update({
  id: '/dashboard/billing',
  path: '/billing',
  getParentRoute: () => DashboardRoute,
} as any)

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/dashboard': {
      id: '/dashboard'
      path: '/dashboard'
      fullPath: '/dashboard'
      preLoaderRoute: typeof DashboardRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/login': {
      id: '/login'
      path: '/login'
      fullPath: '/login'
      preLoaderRoute: typeof LoginRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/dashboard/': {
      id: '/dashboard/'
      path: '/'
      fullPath: '/dashboard/'
      preLoaderRoute: typeof DashboardIndexRouteImport
      parentRoute: typeof DashboardRouteImport
    }
    '/dashboard/billing': {
      id: '/dashboard/billing'
      path: '/billing'
      fullPath: '/dashboard/billing'
      preLoaderRoute: typeof DashboardBillingRouteImport
      parentRoute: typeof DashboardRouteImport
    }
    '/dashboard/clients': {
      id: '/dashboard/clients'
      path: '/clients'
      fullPath: '/dashboard/clients'
      preLoaderRoute: typeof DashboardClientsRouteImport
      parentRoute: typeof DashboardRouteImport
    }
    '/dashboard/errors': {
      id: '/dashboard/errors'
      path: '/errors'
      fullPath: '/dashboard/errors'
      preLoaderRoute: typeof DashboardErrorsRouteImport
      parentRoute: typeof DashboardRouteImport
    }
    '/dashboard/performance': {
      id: '/dashboard/performance'
      path: '/performance'
      fullPath: '/dashboard/performance'
      preLoaderRoute: typeof DashboardPerformanceRouteImport
      parentRoute: typeof DashboardRouteImport
    }
    '/dashboard/rate-limiting': {
      id: '/dashboard/rate-limiting'
      path: '/rate-limiting'
      fullPath: '/dashboard/rate-limiting'
      preLoaderRoute: typeof DashboardRateLimitingRouteImport
      parentRoute: typeof DashboardRouteImport
    }
    '/dashboard/security': {
      id: '/dashboard/security'
      path: '/security'
      fullPath: '/dashboard/security'
      preLoaderRoute: typeof DashboardSecurityRouteImport
      parentRoute: typeof DashboardRouteImport
    }
    '/dashboard/settings': {
      id: '/dashboard/settings'
      path: '/settings'
      fullPath: '/dashboard/settings'
      preLoaderRoute: typeof DashboardSettingsRouteImport
      parentRoute: typeof DashboardRouteImport
    }
    '/dashboard/traffic': {
      id: '/dashboard/traffic'
      path: '/traffic'
      fullPath: '/dashboard/traffic'
      preLoaderRoute: typeof DashboardTrafficRouteImport
      parentRoute: typeof DashboardRouteImport
    }
    '/dashboard/usage': {
      id: '/dashboard/usage'
      path: '/usage'
      fullPath: '/dashboard/usage'
      preLoaderRoute: typeof DashboardUsageRouteImport
      parentRoute: typeof DashboardRouteImport
    }
  }
}

export const routeTree = rootRoute._addFileChildren({
  IndexRoute,
  DashboardRoute: DashboardRoute._addFileChildren({
    DashboardIndexRoute,
    DashboardBillingRoute,
    DashboardClientsRoute,
    DashboardErrorsRoute,
    DashboardPerformanceRoute,
    DashboardRateLimitingRoute,
    DashboardSecurityRoute,
    DashboardSettingsRoute,
    DashboardTrafficRoute,
    DashboardUsageRoute,
  }),
  LoginRoute,
})