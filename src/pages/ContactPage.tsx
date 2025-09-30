import React from "react";
import Header from "@/components/landing/Header";
import ContactSection from "@/components/landing/ContactSection";
import Footer from "@/components/landing/Footer";

const ContactPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default ContactPage;