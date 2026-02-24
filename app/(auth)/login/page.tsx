import { LoginForm } from "@/components/forms/login-form"
import { auth } from "@/lib/auth"
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default async function LoginPage() {
  async function LoginGuard() {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (session) {
      redirect("/dashboard")
    }

    return <LoginForm />
  }

  return (
    <Suspense fallback={null}>
      <LoginGuard />
    </Suspense>
  )
}
