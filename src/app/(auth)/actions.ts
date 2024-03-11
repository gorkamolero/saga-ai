"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies, headers } from "next/headers";
import type { SignupInput } from "./signup/page";
import { type LoginInput } from "./login/page";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";

const supabase = createClient(cookies());
const origin = headers().get("origin");

export const signUp = async (signup: SignupInput) => {
  "use server";

  const {
    data: { user },
    error,
  } = await supabase.auth.signUp({
    email: signup.email,
    password: signup.password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return {
      error: error.message,
    };
  }

  if (!user) {
    return {
      error: "User not found",
    };
  }

  await db.insert(users).values({
    id: user.id,
    email: user.email,
  });
};

export const signIn = async (data: LoginInput) => {
  "use server";

  const { error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });
  if (error) {
    return {
      error: error.message,
    };
  }
};
