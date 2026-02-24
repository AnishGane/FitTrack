import { LoginForm } from "@/components/forms/login-form"
import { auth } from "@/lib/auth"
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div>
      <LoginForm />
    </div>
  )
}
