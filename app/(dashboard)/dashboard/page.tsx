import { auth, currentUser } from "@clerk/nextjs/server"
import { Card } from "@/components/ui/card"
import { FileText, Plus, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { getWillStats, getWills } from "@/lib/actions/wills"
import { formatDistanceToNow } from "date-fns"

export default async function DashboardPage() {
  const { userId } = await auth()
  const user = await currentUser()

  if (!userId) {
    return null
  }

  const [stats, allWills] = await Promise.all([getWillStats(), getWills()])

  // Get recent wills (last 5 updated)
  const recentWills = allWills.slice(0, 5)

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
                {stats.total}
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
                {stats.draft}
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
                {stats.completed}
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
        {recentWills.length === 0 ? (
          <Card className="p-6">
            <p className="text-center text-neutral-600 dark:text-neutral-400 py-8">
              No recent activity yet. Create your first will to get started!
            </p>
          </Card>
        ) : (
          <Card className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {recentWills.map((will: any) => (
              <Link
                key={will.id}
                href={`/dashboard/wills/${will.id}`}
                className="flex items-center justify-between p-4 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-neutral-400" />
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-neutral-50">
                      {will.title}
                    </p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Updated {formatDistanceToNow(new Date(will.updatedAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className={
                    will.status === 'draft'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : will.status === 'completed'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  }
                >
                  {will.status.charAt(0).toUpperCase() + will.status.slice(1)}
                </Badge>
              </Link>
            ))}
          </Card>
        )}
      </div>
    </div>
  )
}
