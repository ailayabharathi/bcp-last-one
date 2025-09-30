import Sidebar from "@/components/shared/Sidebar";
import Header from "@/components/shared/Header";
import {
  LayoutDashboard,
  User,
  History,
  FileClock,
  Users,
} from "lucide-react";
import { Outlet } from "react-router-dom";
import { NavItem } from "@/lib/types";
import { useState } from "react";

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/tutor/dashboard",
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
  {
    title: "Pending Requests",
    href: "/tutor/pending-requests",
    icon: <FileClock className="h-4 w-4" />,
  },
  {
    title: "Request History",
    href: "/tutor/request-history",
    icon: <History className="h-4 w-4" />,
  },
  {
    title: "My Students",
    href: "/tutor/students",
    icon: <Users className="h-4 w-4" />,
  },
  {
    title: "Profile",
    href: "/tutor/profile",
    icon: <User className="h-4 w-4" />,
  },
];

const TutorLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="flex flex-col h-screen w-full">
      <div className="flex flex-1">
        <Sidebar
          navItems={navItems}
          portalName="Tutor Portal"
          variant="tutor"
          isCollapsed={isCollapsed}
          toggleCollapse={toggleCollapse}
        />
        <div className="flex flex-col flex-1"> {/* This div now contains both Header and main content */}
          <Header navItems={navItems} portalName="Tutor Portal" />
          <main className="flex-1 p-6 wavy-background"> {/* Applied wavy-background */}
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default TutorLayout;