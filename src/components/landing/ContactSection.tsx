"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mail, Phone, MapPin, Instagram, Facebook, Linkedin } from "lucide-react";

const ContactSection = () => {
  return (
    <section id="contact" className="py-12 md:py-20 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            Get in Touch
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We'd love to hear from you! Reach out to us for any inquiries or support.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-10 items-start justify-center">
          {/* Contact Information */}
          <Card className="p-6 shadow-lg border-t-4 border-primary max-w-7xl mx-auto rounded-none">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-2xl font-semibold text-foreground">Contact Information</CardTitle>
              <CardDescription className="mt-2 text-muted-foreground">
                Our team is here to help you.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="md:col-span-2 flex items-start space-x-4">
                <MapPin className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-medium text-foreground">Our Location</h4>
                  <p className="text-muted-foreground">
                    Adhiyamaan College of Engineering<br />
                    Dr.M.G.R.Nagar, Hosur,<br />
                    Krishnagiri District, Tamil Nadu,<br />
                    India. Pin:635 130
                  </p>
                </div>
              </div>

              {/* Email Addresses */}
              <div className="pt-6 border-t border-border md:pt-0 md:border-t-0">
                <h4 className="font-medium text-foreground mb-3">Email Us</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-4">
                    <Mail className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">Principal</p>
                      <p className="text-muted-foreground">principal@adhiyamaan.ac.in</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Mail className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">Controller of Examination</p>
                      <p className="text-muted-foreground">coe@adhiyamaan.ac.in</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Mail className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">Dean (Academic)</p>
                      <p className="text-muted-foreground">deanacademic@adhiyamaan.ac.in</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Phone Numbers */}
              <div className="pt-6 border-t border-border md:pt-0 md:border-t-0">
                <h4 className="font-medium text-foreground mb-3">Call Us</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-4">
                    <Phone className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">Reception</p>
                      <p className="text-muted-foreground">(04344) 260570</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Phone className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">Administrative Office</p>
                      <p className="text-muted-foreground">(04344) 261002</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Phone className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">Accounts Office</p>
                      <p className="text-muted-foreground">(04344) 261001 / 261034</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Phone className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">Principal Office</p>
                      <p className="text-muted-foreground">(04344) 261020</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media Links */}
              <div className="md:col-span-2 pt-6 border-t border-border mt-6 md:pt-0 md:border-t-0">
                <h4 className="font-medium text-foreground mb-3">Follow Us</h4>
                <div className="flex space-x-4">
                  <a href="https://www.instagram.com/adhiyamaancollegeofengineering" target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:text-pink-700 transition-colors">
                    <Instagram className="h-6 w-6" />
                    <span className="sr-only">Instagram</span>
                  </a>
                  <a href="https://www.twitter.com/adhiyamaan.ac.in" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                    <img src="/x-logo.webp" alt="X logo" className="h-6 w-6 dark:invert" />
                    <span className="sr-only">X (formerly Twitter)</span>
                  </a>
                  <a href="https://www.facebook.com/AdhiyamaanCollegeofEngineering" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 transition-colors">
                    <Facebook className="h-6 w-6" />
                    <span className="sr-only">Facebook</span>
                  </a>
                  <a href="https://www.linkedin.com/school/adhiyamaan-college-of-engineering/" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 transition-colors">
                    <Linkedin className="h-6 w-6" />
                    <span className="sr-only">LinkedIn</span>
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;