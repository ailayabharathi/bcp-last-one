import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";

interface ProfileHeaderProps {
  name: string;
  subtitle: string;
  imageUrl?: string;
}

// Define the problematic image URL that causes CORS errors
const problematicImageUrl = 'https://images.meesho.com/images/products/455752769/8xzbm_512.jpg?width=512';

const ProfileHeader = ({ name, subtitle, imageUrl }: ProfileHeaderProps) => {
  // Prevent loading the problematic external image URL
  const displayImageUrl = imageUrl === problematicImageUrl ? undefined : imageUrl;

  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-16 w-16">
        <AvatarImage src={displayImageUrl} alt={name} />
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
};

export default ProfileHeader;