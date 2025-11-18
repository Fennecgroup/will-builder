import { auth } from "@clerk/nextjs/server"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, FileText } from "lucide-react"
import Link from "next/link"

export default async function WillsPage() {
  const { userId } = await auth()

  return (
    <div className="container mx-auto p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
            My Wills
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            Manage and create your estate planning documents
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/dashboard/wills/new">
            <Plus className="h-5 w-5 mr-2" />
            Create New Will
          </Link>
        </Button>
      </div>

      {/* Empty State */}
      <Card className="p-12">
        <div className="flex flex-col items-center text-center max-w-md mx-auto">
          <div className="h-20 w-20 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-6">
            <FileText className="h-10 w-10 text-neutral-400" />
          </div>
          <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50 mb-2">
            No wills yet
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            Get started by creating your first will. Our AI-powered platform will guide you through the process step by step.
          </p>
          <Button asChild size="lg">
            <Link href="/dashboard/wills/new">
              <Plus className="h-5 w-5 mr-2" />
              Create Your First Will
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  )
}
