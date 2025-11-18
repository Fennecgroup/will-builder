import { auth, currentUser } from "@clerk/nextjs/server"
import { Card } from "@/components/ui/card"
import { FileText, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function DashboardPage() {
  const { userId } = await auth()
  const user = await currentUser()

  return (
    <div className="container mx-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
          Welcome back, {user?.firstName || "there"}!
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Manage your wills and estate planning documents
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Total Wills
              </p>
              <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-50 mt-2">
                0
              </p>
            </div>
            <FileText className="h-12 w-12 text-neutral-400" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Draft Wills
              </p>
              <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-50 mt-2">
                0
              </p>
            </div>
            <FileText className="h-12 w-12 text-neutral-400" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Completed Wills
              </p>
              <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-50 mt-2">
                0
              </p>
            </div>
            <FileText className="h-12 w-12 text-neutral-400" />
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50 mb-4">
          Quick Actions
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-neutral-900 dark:bg-neutral-50 flex items-center justify-center mb-4">
                <Plus className="h-6 w-6 text-neutral-50 dark:text-neutral-900" />
              </div>
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-50 mb-2">
                Create New Will
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                Start building your will with AI assistance
              </p>
              <Button asChild className="w-full">
                <Link href="/dashboard/wills/new">Get Started</Link>
              </Button>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-neutral-900 dark:bg-neutral-50 flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-neutral-50 dark:text-neutral-900" />
              </div>
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-50 mb-2">
                View My Wills
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                Access and manage your existing wills
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/dashboard/wills">View All</Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50 mb-4">
          Recent Activity
        </h2>
        <Card className="p-6">
          <p className="text-center text-neutral-600 dark:text-neutral-400 py-8">
            No recent activity yet. Create your first will to get started!
          </p>
        </Card>
      </div>
    </div>
  )
}
