import React from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { LayoutDashboard, Menu, Bell, LogOut } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { NavItem } from "@/lib/types";
import { useSession } from "@/components/auth/SessionContextProvider"; // Import useSession

interface HeaderProps {
  navItems: NavItem[];
  portalName: string; // New prop for portal name
  iconTextColorClass?: string; // New prop for custom icon/button text color
}

const Header = ({ navItems, portalName, iconTextColorClass }: HeaderProps) => {
  const { signOut } = useSession(); // Use the signOut function

  const buttonHoverClasses = "hover:scale-110 hover:shadow-lg transition-all duration-200";

  return (
    <header className={cn(
      "sticky top-0 z-30 flex h-14 items-center justify-between border-b px-4 sm:px-6 backdrop-blur-lg",
      "bg-background/30 border border-white/20 shadow-lg" // Glassmorphism effect
    )}>
      {/* Mobile menu trigger (left on mobile) */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className={cn(
                "shrink-0 bg-transparent border-current hover:bg-foreground/10",
                iconTextColorClass || "text-foreground", // Apply custom color or default
                buttonHoverClasses
              )}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <nav className="grid gap-6 text-lg font-medium p-4">
              <div className="flex items-center gap-2 text-lg font-semibold mb-4 border-b pb-4">
                <LayoutDashboard className={cn("h-6 w-6", iconTextColorClass || "text-foreground")} />
                <span className={cn(iconTextColorClass || "text-foreground")}>Navigation</span>
              </div>
              {navItems.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  end
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-4 px-2.5",
                      iconTextColorClass || "text-foreground hover:text-foreground/80",
                      isActive && (iconTextColorClass || "text-foreground")
                    )
                  }
                >
                  {item.icon && React.cloneElement(item.icon as React.ReactElement, { className: cn((item.icon as React.ReactElement).props.className, iconTextColorClass || "text-foreground") })}
                  {item.title}
                </NavLink>
              ))}
              <Button variant="ghost" className={cn("flex items-center gap-4 px-2.5 w-full justify-start", iconTextColorClass || "text-foreground hover:text-foreground/80")} onClick={() => { console.log("Mobile logout button clicked"); signOut(); }}>
                <LogOut className="h-5 w-5" />
                Logout
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      {/* Portal Name for Desktop */}
      <div className="hidden md:flex items-center gap-2">
        <h2 className={cn("text-lg font-semibold", iconTextColorClass || "text-foreground")}>{portalName}</h2>
      </div>

      {/* Action buttons (right on both mobile and desktop) */}
      <div className="flex items-center gap-2 ml-auto">
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "hover:bg-foreground/10",
            iconTextColorClass || "text-foreground", // Apply custom color or default
            buttonHoverClasses
          )}
        >
          <Bell className="h-5 w-5" />
          <span className="sr-only">View notifications</span>
        </Button>
        <ThemeToggle onHeaderBg={true} iconTextColorClass={iconTextColorClass} />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => { console.log("Desktop logout button clicked"); signOut(); }} // This is the desktop logout button
          className={cn(
            "hover:bg-foreground/10",
            iconTextColorClass || "text-foreground", // Apply custom color or default
            buttonHoverClasses
          )}
        >
          <LogOut className="h-5 w-5" />
          <span className="sr-only">Logout</span>
        </Button>
      </div>
    </header>
  );
};

export default Header;