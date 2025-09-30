import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";

interface ProfileHeaderProps {
  name: string;
  subtitle: string;
  imageUrl?: string;
}

const ProfileHeader = ({ name, subtitle, imageUrl }: ProfileHeaderProps) => (
  <div className="flex items-center gap-4">
    <Avatar className="h-16 w-16">
      <AvatarImage src={imageUrl} alt={name} />
      <AvatarFallback>
        <User className="h-8 w-8" />
      </AvatarFallback>
    </Avatar>
    <div>
      <h1 className="text-2xl font-bold">{name}</h1>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </div>
  </div>
);

export default ProfileHeader;