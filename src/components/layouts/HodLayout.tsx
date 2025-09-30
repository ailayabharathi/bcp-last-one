import Sidebar from "@/components/shared/Sidebar";
import Header from "@/components/shared/Header";
import {
  LayoutDashboard,
  User,
  History,
  FileClock,
} from "lucide-react";
import { Outlet, useLocation } from "react-router-dom"; // Import useLocation
import { NavItem } from "@/lib/types";
import { useState } from "react";

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/hod/dashboard",
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
  {
    title: "Pending Requests",
    href: "/hod/pending-requests",
    icon: <FileClock className="h-4 w-4" />,
  },
  {
    title: "Request History",
    href: "/hod/request-history",
    icon: <History className="h-4 w-4" />,
  },
  {
    title: "Profile",
    href: "/hod/profile",
    icon: <User className="h-4 w-4" />,
  },
];

const HodLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation(); // Get current location

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Conditionally set portalName based on the current path
  const currentPortalName = location.pathname === "/hod/dashboard" ? "" : "HOD Portal";

  return (
    <div className="flex flex-col h-screen w-full">
      <div className="flex flex-1">
        <Sidebar
          navItems={navItems}
          portalName="HOD Portal" // Sidebar always shows full portal name
          variant="hod"
          isCollapsed={isCollapsed}
          toggleCollapse={toggleCollapse}
        />
        <div className="flex flex-col flex-1">
          <Header navItems={navItems} portalName={currentPortalName} /> {/* Pass conditional portalName */}
          <main className="flex-1 p-6 wavy-background">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default HodLayout;