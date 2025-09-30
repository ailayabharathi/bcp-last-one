import React from "react";
import Header from "@/components/landing/Header";
import AboutSection from "@/components/landing/AboutSection";
import Footer from "@/components/landing/Footer";

const AboutPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <AboutSection />
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;