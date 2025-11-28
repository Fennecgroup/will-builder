"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { UserButton } from "@clerk/nextjs"
import { Home, FileText, Settings, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { isWillEditorRoute } from "@/lib/utils/route-helpers"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "My Wills", href: "/dashboard/wills", icon: FileText },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Auto-collapse when entering will editor
  useEffect(() => {
    setIsCollapsed(isWillEditorRoute(pathname))
  }, [pathname])

  return (
    <div className={cn(
      "flex h-screen flex-col border-r bg-neutral-50 dark:bg-neutral-900 transition-all duration-300 ease-in-out",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <Image
            src="/logo.svg"
            alt="Fennec Logo"
            width={32}
            height={32}
            className="h-8 w-8 flex-shrink-0"
          />
          {!isCollapsed && (
            <span className="text-lg font-semibold">Fennec</span>
          )}
        </Link>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-md transition-colors"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <TooltipProvider>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => {
            // Use exact matching for root dashboard, prefix matching for nested routes
            const isActive = item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname === item.href || pathname.startsWith(`${item.href}/`)

            const linkContent = (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isCollapsed && "justify-center",
                  isActive
                    ? "bg-neutral-900 text-neutral-50 dark:bg-neutral-50 dark:text-neutral-900"
                    : "text-neutral-700 hover:bg-neutral-200 dark:text-neutral-300 dark:hover:bg-neutral-800"
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && item.name}
              </Link>
            )

            return isCollapsed ? (
              <Tooltip key={item.name}>
                <TooltipTrigger asChild>
                  {linkContent}
                </TooltipTrigger>
                <TooltipContent side="right">
                  {item.name}
                </TooltipContent>
              </Tooltip>
            ) : linkContent
          })}
        </nav>
      </TooltipProvider>

      {/* User Profile */}
      <div className="border-t p-4">
        <div className={cn(
          "flex items-center gap-3",
          isCollapsed && "justify-center"
        )}>
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-10 w-10",
              },
            }}
          />
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                Your Account
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Manage profile
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
