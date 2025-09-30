"use client";

import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { ThemeToggle } from "@/components/shared/ThemeToggle"; // Updated import path
import { cn } from "@/lib/utils";

const Header = () => {
  const navLinks = [
    { title: "Home", href: "/" },
    { title: "About Us", href: "/about" },
    { title: "Contact Us", href: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <img src="/LOGO.jpg" alt="Logo" className="h-12 w-auto" />
          <span className="font-bold text-lg">Adhiyamaan College</span>
        </Link>

        {/* Group navigation and theme toggle to align right */}
        <div className="flex items-center gap-4">
          {/* Desktop Navigation */}
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              {navLinks.map((link) => (
                <NavigationMenuItem key={link.title}>
                  <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                    <Link to={link.href}>
                      {link.title}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          {/* Theme Toggle */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;