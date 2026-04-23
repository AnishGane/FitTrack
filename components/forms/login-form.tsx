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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"

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
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

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
    setIsGoogleLoading(true);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/"
      })
    } catch (error) {
      console.log(error);
      toast.error("Error logging in with Google");
    } finally {
      setIsGoogleLoading(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} id="form-rhf-demo" className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl text-black font-semibold">Login to your account</h1>
          <p className="text-black/60 text-[13px] text-balance">
            Enter your email below to login to your account
          </p>
        </div>
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="gap-1 text-neutral-800">
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
                className="border border-black/50 placeholder:text-black/50 py-4.5!"
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
            <Field data-invalid={fieldState.invalid} className="gap-1 text-neutral-800">
              <FieldLabel htmlFor="form-rhf-demo-password">
                Password
              </FieldLabel>
              <InputGroup className="border border-black/50 rounded-md placeholder:text-black/50 py-4.5!">
                <InputGroupInput
                  {...field}
                  id="form-rhf-demo-password"
                  aria-invalid={fieldState.invalid}
                  placeholder="••••••"
                  autoComplete="off"
                  type={showPassword ? "text" : "password"}
                />
                <InputGroupAddon align="inline-end">
                  {showPassword ? (
                    <EyeIcon onClick={() => setShowPassword(false)} className="size-4 cursor-pointer text-black" />
                  ) : (
                    <EyeOffIcon onClick={() => setShowPassword(true)} className="size-4 cursor-pointer text-black" />
                  )}
                </InputGroupAddon>
              </InputGroup>
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />
        <Field>
          <Button type="submit" disabled={loading} className="py-5 font-semibold cursor-pointer">
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
          <Button disabled={isGoogleLoading} variant="outline" className="py-5 cursor-pointer bg-transparent! text-neutral-800! border border-border hover:bg-black/5!" type="button" onClick={handleLoginWithGoogle}>
            {
              isGoogleLoading ? (
                <>
                  <Loader2 className="animate-spin" />
                  Logging in with Google...
                </>
              ) : (
                <>
                  <Google />
                  Login with Google
                </>
              )
            }
          </Button>
          <FieldDescription className="text-center text-neutral-500! py-2">
            Don&apos;t have an account yet?{" "}
            <Link href="/signup">
              Sign up
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
