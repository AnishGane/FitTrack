"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Google } from "../ui/google"
import { authClient } from "@/lib/auth-client"
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { SignInUser } from "@/server/users"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { EyeIcon, EyeOffIcon, Loader2 } from "lucide-react"
import Link from "next/link"

const LoginFormSchema = z.object({
  email: z.string().email("Please enter a valid email").toLowerCase(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof LoginFormSchema>>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(data: z.infer<typeof LoginFormSchema>) {
    setLoading(true);
    try {
      const response = await SignInUser(data.email, data.password);
      if (!response) return;
      if (response.success) {
        toast.success(response.message || "Login success");
        router.push("/");
      } else {
        toast.error(response.message || "Login failed");
      }
    } catch (error) {
      toast.error((error as Error).message || "Error signing in user");
    } finally {
      setLoading(false);
    }
  }

  const handleLoginWithGoogle = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/"
    })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} id="form-rhf-demo" className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter your email below to login to your account
          </p>
        </div>
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="gap-1">
              <FieldLabel htmlFor="form-rhf-demo-email">
                Email
              </FieldLabel>
              <Input
                {...field}
                id="form-rhf-demo-email"
                aria-invalid={fieldState.invalid}
                placeholder="your email address"
                autoComplete="on"
                autoFocus={true}
                className="border border-black/50 "
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />
        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="gap-1">
              <FieldLabel htmlFor="form-rhf-demo-password">
                Password
              </FieldLabel>
              <div className="relative">
                <Input
                  {...field}
                  id="form-rhf-demo-password"
                  aria-invalid={fieldState.invalid}
                  placeholder="••••••"
                  autoComplete="off"
                  type={showPassword ? "text" : "password"}
                  className="border border-black/50"
                />
                {showPassword ? (
                  <EyeIcon onClick={() => setShowPassword(false)} className="size-3.5 absolute right-3 top-2.5 cursor-pointer text-black" />
                ) : (
                  <EyeOffIcon onClick={() => setShowPassword(true)} className="size-3.5 absolute top-2.5 right-3 cursor-pointer text-black" />
                )}
              </div>
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />
        <Field>
          <Button type="submit" disabled={loading} className="py-5 font-semibold">
            {loading ? (
              <>
                <Loader2 className="animate-spin" />
                Login...
              </>
            ) : "Login"}
          </Button>
        </Field>
        <FieldSeparator>
          Or continue with
        </FieldSeparator>
        <Field>
          <Button variant="outline" className="py-5 cursor-pointer" type="button" onClick={handleLoginWithGoogle}>
            <Google />
            Login with Google
          </Button>
          <FieldDescription className="text-center py-2">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="underline underline-offset-4">
              Sign up
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
