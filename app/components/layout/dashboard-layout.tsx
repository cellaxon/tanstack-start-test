import React from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import {
  BarChart3,
  Activity,
  TrendingUp,
  Clock,
  Shield,
  Settings,
  LogOut,
  Menu,
  Home,
  AlertCircle,
  Users,
  DollarSign
} from 'lucide-react'
import { cn } from '@/lib/utils'

const menuItems = [
  {
    title: 'Dashboard',
    icon: Home,
    href: '/dashboard',
    description: 'Overview of API Gateway metrics'
  },
  {
    title: 'API Traffic',
    icon: BarChart3,
    href: '/dashboard/traffic',
    description: 'Real-time API traffic analysis'
  },
  {
    title: 'Performance',
    icon: Activity,
    href: '/dashboard/performance',
    description: 'Response time and latency metrics'
  },
  {
    title: 'Usage Analytics',
    icon: TrendingUp,
    href: '/dashboard/usage',
    description: 'API usage patterns and trends'
  },
  {
    title: 'Error Rates',
    icon: AlertCircle,
    href: '/dashboard/errors',
    description: 'Error tracking and monitoring'
  },
  {
    title: 'Rate Limiting',
    icon: Clock,
    href: '/dashboard/rate-limiting',
    description: 'Rate limit status and configurations'
  },
  {
    title: 'Security',
    icon: Shield,
    href: '/dashboard/security',
    description: 'Security events and threat detection'
  },
  {
    title: 'Clients',
    icon: Users,
    href: '/dashboard/clients',
    description: 'API client management'
  },
  {
    title: 'Billing',
    icon: DollarSign,
    href: '/dashboard/billing',
    description: 'Usage costs and billing information'
  },
  {
    title: 'Settings',
    icon: Settings,
    href: '/dashboard/settings',
    description: 'Dashboard configuration'
  }
]

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = React.useState(true)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">API Gateway Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Welcome, {user?.username}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-16 bottom-0 z-40 w-64 bg-white border-r border-gray-200 transition-transform duration-200",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <nav className="p-4 space-y-1 overflow-y-auto h-full">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <item.icon className="h-4 w-4" />
                <div className="flex-1">
                  <div>{item.title}</div>
                  {isActive && (
                    <div className="text-xs text-gray-500 mt-0.5">
                      {item.description}
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "pt-16 transition-all duration-200",
        sidebarOpen ? "lg:ml-64" : ""
      )}>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}