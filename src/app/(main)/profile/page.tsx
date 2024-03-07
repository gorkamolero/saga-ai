import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { capitalizeFirstLetter } from "@/lib/utils";
import { api } from "@/trpc/server";

export default async function ProfilePage() {
  const profile = await api.profiles.getCurrent.query();

  if (!profile) return null;

  return (
    <div className="flex w-full justify-center ">
      <Card className="mt-12 w-full max-w-xl">
        <CardHeader>
          <CardTitle>
            {profile.firstName} {profile.firstName}
          </CardTitle>
          <CardDescription>{profile.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Bio: {profile.bio}</p>
        </CardContent>
        <div className="flex">
          <CardContent>
            <p>X: {profile.x_profile}</p>
          </CardContent>
          <CardContent>
            <p>Website: {profile.website}</p>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}
