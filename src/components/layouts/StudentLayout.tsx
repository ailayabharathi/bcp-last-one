import Sidebar from "@/components/shared/Sidebar";
import Header from "@/components/shared/Header";
import { LayoutDashboard, FilePlus, History, User } from "lucide-react";
import { Outlet } from "react-router-dom";
import { useState } from "react";
import { NavItem } from "@/lib/types";
import { cn } from "@/lib/utils";

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/student/dashboard",
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
  {
    title: "New Request",
    href: "/student/request",
    icon: <FilePlus className="h-4 w-4" />,
  },
  {
    title: "My Requests",
    href: "/student/my-requests",
    icon: <History className="h-4 w-4" />,
  },
  {
    title: "Profile",
    href: "/student/profile",
    icon: <User className="h-4 w-4" />,
  },
];

const StudentLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  // Removed theme state as background is now universal
  // const [theme, setTheme] = useState('default');

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="flex flex-col h-screen w-full"> {/* Removed data-student-theme */}
      <div className="flex flex-1">
        <Sidebar
          navItems={navItems}
          portalName="Student Portal"
          variant="student"
          isCollapsed={isCollapsed}
          toggleCollapse={toggleCollapse}
        />
        <div className="flex flex-col flex-1"> {/* This div now contains both Header and main content */}
          <Header navItems={navItems} portalName="Student Portal" />
          <main className="flex-1 p-6 wavy-background"> {/* Applied wavy-background */}
            <Outlet /> {/* Removed context={{ setTheme }} */}
          </main>
        </div>
      </div>
    </div>
  );
};

export default StudentLayout;