import { SignupForm } from "@/components/forms/signup-form"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { Suspense } from "react"

export default async function SignupPage() {
  async function SignupGuard() {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (session) {
      redirect("/dashboard")
    }

    return <SignupForm />
  }

  return (
    <Suspense fallback={null}>
      <SignupGuard />
    </Suspense>
  )
}
