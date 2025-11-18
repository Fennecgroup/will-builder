import { auth, currentUser } from "@clerk/nextjs/server"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { UserButton } from "@clerk/nextjs"

export default async function SettingsPage() {
  const { userId } = await auth()
  const user = await currentUser()

  return (
    <div className="container mx-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
          Settings
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Profile Section */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50 mb-4">
          Profile
        </h2>
        <div className="flex items-center gap-4 mb-6">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-16 w-16",
              },
            }}
          />
          <div>
            <p className="font-medium text-neutral-900 dark:text-neutral-50">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {user?.emailAddresses[0]?.emailAddress}
            </p>
          </div>
        </div>
        <Separator className="my-4" />
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Manage your profile, email, and authentication settings through the Clerk user menu.
        </p>
      </Card>

      {/* Account Information */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50 mb-4">
          Account Information
        </h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              User ID
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 font-mono">
              {userId}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Account Created
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
            </p>
          </div>
        </div>
      </Card>

      {/* Preferences */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50 mb-4">
          Preferences
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Additional preference settings will be available here in future updates.
        </p>
      </Card>
    </div>
  )
}
