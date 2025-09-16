import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
  Outlet,
  useNavigate,
  useLocation,
} from '@tanstack/react-router'
import { useEffect } from 'react'

import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'API Gateway Dashboard',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  component: RootComponent,
  shellComponent: RootDocument,
  notFoundComponent: () => {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
          <p className="text-lg text-gray-600 mb-8">Page not found</p>
          <a href="/dashboard" className="text-blue-500 hover:text-blue-700">
            Go to Dashboard
          </a>
        </div>
      </div>
    )
  },
})

function RootComponent() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const user = localStorage.getItem('user')
    const isLoginPage = location.pathname === '/login'
    const isDashboardPage = location.pathname.startsWith('/dashboard')

    if (!user && !isLoginPage) {
      navigate({ to: '/login' })
    } else if (user && (location.pathname === '/' || isLoginPage)) {
      navigate({ to: '/dashboard' })
    }
  }, [location.pathname, navigate])

  return <Outlet />
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
