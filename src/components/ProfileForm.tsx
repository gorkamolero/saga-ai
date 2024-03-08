"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Textarea } from "@/components/ui/textarea";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema } from "@/lib/validators/profile";

import { useRouter } from "next/navigation";
import { api as clientApi } from "@/trpc/react";
import { FaXTwitter } from "react-icons/fa6";
import { ProfileInput } from "@/server/api/routers/users";

export default function ProfileFormClient({
  profile,
}: {
  profile: ProfileInput;
}) {
  const form = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: profile?.firstName ?? undefined,
      lastName: profile?.lastName ?? undefined,
      bio: profile?.bio ?? undefined,
      x_handle: profile?.x_handle ?? undefined,
      website: profile?.website ?? undefined,
    },
  });

  const router = useRouter();

  const { mutate } = clientApi.users.createProfile.useMutation({
    onSuccess: () => {
      router.push("/profile");
    },
    onError: (e: any) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      console.error("Error creating investment:", errorMessage);
    },
  });

  const onSubmit = async (data: ProfileInput) => {
    mutate(data);
  };

  return (
    <Card className="w-full max-w-2xl border border-border">
      <CardHeader>
        <CardTitle>Create Profile</CardTitle>
        <CardDescription>Yabba dabba doo</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex w-full flex-1 flex-col justify-center gap-6 text-muted-foreground"
          >
            <div className="flex flex-row gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="">First name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Your first name"
                        {...field}
                        minLength={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="">Last name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Your last name"
                        {...field}
                        minLength={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us a little bit about yourself"
                      className="resize-none"
                      minLength={12}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="x_handle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>X Profile</FormLabel>
                  <FormControl>
                    <Input
                      startIcon={FaXTwitter}
                      placeholder="Your X profile"
                      minLength={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Your website url"
                      {...field}
                      minLength={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button variant="default" className="my-4 w-full" type="submit">
              Submit
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
