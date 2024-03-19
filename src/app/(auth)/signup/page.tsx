'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState } from 'react';

// import { FaGithub } from "react-icons/fa";
// import { FcGoogle } from "react-icons/fc";
import { signUp } from '../actions';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

export type SignupInput = z.infer<typeof registerSchema>;

export default function Signup() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const form = useForm<SignupInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: SignupInput) => {
    setSuccess('Check your email for further instructions');
    const result = await signUp(data);
    if (result?.error) {
      setSuccess(null);
      setError(result.error);
    }
  };

  return (
    <div className="h-screen w-full bg-background lg:w-1/2">
      <div className="flex h-full items-center justify-center">
        <div className="w-full max-w-md p-8">
          <h1 className="text-2xl mb-4 font-semibold">Sign up</h1>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex w-full flex-1 flex-col justify-center gap-2 text-muted-foreground animate-in"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground">
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Your email address"
                        {...field}
                        autoComplete="on"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground">
                      Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Your password"
                        type="password"
                        autoComplete="on"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button variant="default" className="my-3 w-full" type="submit">
                Sign up
              </Button>
              {success && (
                <div className="mb-3 mt-1 rounded-md border border-border bg-secondary/50 p-3">
                  <p className="text-sm text-center font-medium text-muted-foreground">
                    {success}
                  </p>
                </div>
              )}
              {error && (
                <div className="mb-3 mt-1 rounded-md border border-destructive bg-destructive/10 p-3">
                  <p className="text-sm text-center font-medium text-destructive">
                    {error}
                  </p>
                </div>
              )}
            </form>
          </Form>
          {/* 
            <div className="flex items-center gap-2 py-4">
              <hr className="w-full" />
              <p className="text-xs text-muted-foreground">OR</p>
              <hr className="w-full" />
            </div>
            <OauthButton provider={"google"} />
            <OauthButton provider={"github"} />
             */}
          <p className="text-sm py-4 text-center text-muted-foreground underline">
            <Link href="/login">Already have an account? Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
