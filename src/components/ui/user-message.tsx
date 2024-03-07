import { AvatarImage, AvatarFallback, Avatar } from "@/components/ui/avatar";

export const UserMessage = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex items-start space-x-2">
      <Avatar>
        <AvatarImage alt="GM" src="/placeholder.svg?height=40&width=40" />
        <AvatarFallback>GM</AvatarFallback>
      </Avatar>

      <div className="flex flex-col space-y-2">
        <div className="rounded-md bg-white p-4 text-sm text-gray-600 shadow">
          {children}
        </div>
      </div>
    </div>
  );
};
