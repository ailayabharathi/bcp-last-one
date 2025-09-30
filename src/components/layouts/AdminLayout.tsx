import Sidebar from "@/components/shared/Sidebar";
import Header from "@/components/shared/Header";
import {
  LayoutDashboard,
  User,
  Users,
  Building,
  FileText,
  ClipboardList,
  Briefcase,
} from "lucide-react";
import { Outlet } from "react-router-dom";
import { NavItem } from "@/lib/types";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
  {
    title: "Student Management",
    href: "/admin/student-management",
    icon: <Users className="h-4 w-4" />,
  },
  {
    title: "Batch Management",
    href: "/admin/batch-management",
    icon: <ClipboardList className="h-4 w-4" />,
  },
  {
    title: "Manage Faculties",
    href: "/admin/manage-faculties",
    icon: <Users className="h-4 w-4" />,
  },
  {
    title: "Manage Tutors",
    href: "/admin/manage-tutors",
    icon: <Briefcase className="h-4 w-4" />,
  },
  {
    title: "Department Management",
    href: "/admin/department-management",
    icon: <Building className="h-4 w-4" />,
  },
  {
    title: "Template Management",
    href: "/admin/template-management",
    icon: <FileText className="h-4 w-4" />,
  },
  {
    title: "Profile",
    href: "/admin/profile",
    icon: <User className="h-4 w-4" />,
  },
];

const AdminLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="flex flex-col h-screen w-full">
      <div className="flex flex-1">
        <Sidebar
          navItems={navItems}
          portalName="Admin Portal"
          variant="admin"
          isCollapsed={isCollapsed}
          toggleCollapse={toggleCollapse}
        />
        <div className="flex flex-col flex-1"> {/* This div now contains both Header and main content */}
          <Header navItems={navItems} portalName="Admin Portal" />
          <main className="flex-1 p-6 admin-layout-theme wavy-background"> {/* Applied wavy-background */}
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;