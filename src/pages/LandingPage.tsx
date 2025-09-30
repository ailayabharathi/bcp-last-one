"use client";

import React from "react";
import Header from "@/components/landing/Header"; // Updated import
import HeroSection from "@/components/landing/HeroSection"; // Updated import
import BonafideDetailsSection from "@/components/landing/BonafideDetailsSection"; // New component
import Footer from "@/components/landing/Footer"; // Updated import

const LandingPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <HeroSection />
        <BonafideDetailsSection />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;