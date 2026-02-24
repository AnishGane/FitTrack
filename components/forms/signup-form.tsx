"use client";

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
import Link from "next/link"
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { SignUpUser } from "@/server/users"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { EyeIcon, EyeOffIcon, Loader2 } from "lucide-react"
import { Google } from "../ui/google"
import { authClient } from "@/lib/auth-client"

const SignUpFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"form">) {

  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({
    password: false,
    confirmPassword: false
  });

  const form = useForm<z.infer<typeof SignUpFormSchema>>({
    resolver: zodResolver(SignUpFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  const handleSignUpWithGoogle = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/"
    })
  }

  async function onSubmit(data: z.infer<typeof SignUpFormSchema>) {
    setLoading(true);
    try {
      const response = await SignUpUser(data.email, data.password, data.name);
      if (!response) {
        toast.error("Signup failed. Please try again.");
        return;
      }
      if (response.success) {
        toast.success(response.message || "Account created successfully");
        router.push("/");
      } else {
        toast.error(response.message || "Signup failed");
      }
    } catch (error) {
      toast.error((error as Error).message || "Error signing in user");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} id="form-rhf-demo" className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Fill in the form below to create your account
          </p>
        </div>
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="gap-1">
              <FieldLabel htmlFor="form-rhf-demo-name">
                Full Name
              </FieldLabel>
              <Input
                {...field}
                id="form-rhf-demo-name"
                aria-invalid={fieldState.invalid}
                placeholder="Ashley Smith"
                autoComplete="off"
                className="border border-black/50"
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />
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
                placeholder="ashleysmith@gmail.com"
                autoComplete="off"
                className="border border-black/50"
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
              <FieldDescription className="text-xs">
                We&apos;ll never share your email with anyone else.
              </FieldDescription>
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
                  type={showPassword.password ? "text" : "password"}
                  className="border border-black/50"
                />
                {showPassword.password ? (
                  <EyeIcon onClick={() => setShowPassword({
                    ...showPassword,
                    password: false
                  })} className="size-3.5 absolute right-3 top-2.5 cursor-pointer text-black" />
                ) : (
                  <EyeOffIcon onClick={() => setShowPassword({
                    ...showPassword,
                    password: true
                  })} className="size-3.5 absolute top-2.5 right-3 cursor-pointer text-black" />
                )}
              </div>
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
              <FieldDescription className="text-xs">
                Your password must be at least 6 characters long.
              </FieldDescription>
            </Field>
          )}
        />
        <Controller
          name="confirmPassword"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="gap-1">
              <FieldLabel htmlFor="form-rhf-demo-confirmPassword">
                Confirm Password
              </FieldLabel>
              <div className="relative">

                <Input
                  {...field}
                  id="form-rhf-demo-confirmPassword"
                  aria-invalid={fieldState.invalid}
                  placeholder="••••••"
                  autoComplete="off"
                  type={showPassword.confirmPassword ? "text" : "password"}
                  className="border border-black/50"
                />
                {showPassword.confirmPassword ? (
                  <EyeIcon onClick={() => setShowPassword({
                    ...showPassword,
                    confirmPassword: false
                  })} className="size-3.5 absolute right-3 top-2.5 cursor-pointer text-black" />
                ) : (
                  <EyeOffIcon onClick={() => setShowPassword({
                    ...showPassword,
                    confirmPassword: true
                  })} className="size-3.5 absolute top-2.5 right-3 cursor-pointer text-black" />
                )}
              </div>
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
              <FieldDescription className="text-xs">
                Please confirm your password.
              </FieldDescription>
            </Field>
          )}
        />
        <Field>
          <Button type="submit" disabled={loading} className="py-5 font-semibold">
            {loading ? (
              <>
                <Loader2 className="animate-spin" />
                Creating account...
              </>
            ) : "Create account"}
          </Button>
        </Field>
        <FieldSeparator>
          Or continue with
        </FieldSeparator>
        <Field>
          <Button variant="outline" type="button" className="py-5 cursor-pointer" onClick={handleSignUpWithGoogle}>
            <Google />
            Signup with Google
          </Button>
          <FieldDescription className="px-6 text-center py-2">
            Already have an account? <Link href="/login">Sign in</Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
