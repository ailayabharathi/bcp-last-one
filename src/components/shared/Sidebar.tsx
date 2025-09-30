import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { LayoutDashboard, ChevronLeft, ChevronRight } from "lucide-react";
import { NavItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import SidebarProfile from "@/components/shared/SidebarProfile"; // Updated import
import React from "react";

interface SidebarProps {
  navItems: NavItem[];
  portalName: string;
  variant?: 'default' | 'admin' | 'student' | 'principal' | 'hod' | 'tutor';
  isCollapsed?: boolean;
  toggleCollapse?: () => void;
}

const Sidebar = ({ navItems, portalName, variant = 'default', isCollapsed = false, toggleCollapse }: SidebarProps) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Trigger animation on mount
    setAnimate(true);
  }, []);
  // Determine text color based on variant and theme
  const isStudent = variant === 'student';
  const isDark = document.documentElement.classList.contains('dark');
  
  // Ensure text is always visible - use white text in all cases for maximum contrast
  const textColorClass = "text-white";

  return (
    <aside className={cn(
      "hidden md:flex md:flex-col border-r transition-all duration-500 ease-out relative h-full bg-sidebar-gradient",
      isCollapsed ? "md:w-20" : "md:w-64",
      animate ? "animate-sidebar-blow-up" : ""
    )}>
      <div className={cn(
        "flex h-14 items-center border-b px-6",
        isStudent ? "border-white/20" : "border-primary-foreground/20", // Use white border for student
        isCollapsed && "justify-center px-0"
      )}>
        <LayoutDashboard className={cn("h-6 w-6 sidebar-text-hover", textColorClass, isCollapsed ? "mr-0" : "mr-2")} />
        {!isCollapsed && <h2 className={cn("text-lg font-semibold sidebar-text-hover", textColorClass)}>{portalName}</h2>}
      </div>

      <nav className="flex-1 space-y-2 p-4">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all sidebar-text-hover",
                isCollapsed && "justify-center",
                textColorClass, // Applied here
                isStudent ? "hover:bg-white/10" : "hover:bg-primary-foreground/10", // Adjusted hover background
                isActive && (
                  isStudent ? "bg-white/20" : "bg-primary-foreground/20" // Adjusted active background
                )
              )
            }
          >
            {item.icon && React.cloneElement(item.icon as React.ReactElement, { className: cn((item.icon as React.ReactElement).props.className, textColorClass, "sidebar-text-hover") })}
            {!isCollapsed && <span className="sidebar-text-hover">{item.title}</span>}
          </NavLink>
        ))}
      </nav>

      <SidebarProfile isCollapsed={isCollapsed} textColorClass={textColorClass} /> {/* Use generic SidebarProfile */}

      {toggleCollapse && (
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleCollapse}
          className={cn(
            "absolute top-5 rounded-full bg-background border shadow-md -right-4 z-10",
            isStudent ? "border-white/20 bg-white/20 text-white hover:bg-white/30" : "border-primary-foreground/20 bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30" // Adjusted button styling for gradient
          )}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      )}
    </aside>
  );
};

export default Sidebar;