"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const SignInUser = async (email: string, password: string) => {
  try {
    await auth.api.signInEmail({
      body: {
        email,
        password,
      },
      headers: await headers(),
    });

    return {
      success: true,
      message: "User Logged in Successfully",
    };
  } catch (err) {
    return {
      success: false,
      message: (err as Error).message || "Error signing in user",
    };
  }
};

export const SignUpUser = async (
  email: string,
  password: string,
  name: string,
) => {
  try {
    await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
      headers: await headers(),
    });

    return {
      success: true,
      message: "User signed up successfully",
    };
  } catch (err) {
    const e = err as Error;
    return {
      success: false,
      message: e.message || "Error signing up user",
    };
  }
};

export const signOutUser = async () => {
  try {
    await auth.api.signOut({
      headers: await headers(),
    });
    return {
      success: true,
      message: "User signed out successfully",
    };
  } catch (err) {
    const e = err as Error;
    return {
      success: false,
      message: e.message || "Error signing out user",
    };
  }
};
