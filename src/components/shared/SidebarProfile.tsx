"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User as UserIcon } from "lucide-react";
import { useSession } from "@/components/auth/SessionContextProvider";
import { cn } from "@/lib/utils";

interface SidebarProfileProps {
  isCollapsed: boolean;
  textColorClass?: string; // Prop to pass text color class
}

const SidebarProfile = ({ isCollapsed, textColorClass }: SidebarProfileProps) => {
  const { profile } = useSession();

  if (!profile) {
    return null; // Or a loading/placeholder state
  }

  // Determine border color based on text color class
  const borderColorClass = textColorClass === "text-white" || textColorClass?.includes('text-white') ? "border-white/20" : "border-primary-foreground/20";
  
  return (
    <div className={cn("flex items-center p-4 border-t", borderColorClass)}>
      <Avatar className="h-9 w-9">
        <AvatarImage src={profile.avatar_url} alt={profile.username} />
        <AvatarFallback>
          <UserIcon className={cn("h-5 w-5 sidebar-text-hover", "text-white")} />
        </AvatarFallback>
      </Avatar>
      {!isCollapsed && (
        <div className="ml-3 overflow-hidden">
          <p className={cn("text-sm font-medium truncate sidebar-text-hover", "text-white")}>
            {profile.first_name} {profile.last_name}
          </p>
          <p className={cn("text-xs truncate sidebar-text-hover", "text-white/70")}>
            {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
          </p>
        </div>
      )}
    </div>
  );
};

export default SidebarProfile;