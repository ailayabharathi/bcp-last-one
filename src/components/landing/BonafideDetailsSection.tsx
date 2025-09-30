"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle, FileText, Info, ListOrdered, Users } from "lucide-react";

const BonafideDetailsSection = () => {
  const details = [
    {
      icon: <Info className="h-6 w-6 text-primary" />,
      title: "What is a Bonafide Certificate?",
      description:
        "A Bonafide Certificate is an official document issued by the college confirming that an individual is a genuine student of the institution during a specified period. It serves as proof of enrollment and student status.",
    },
    {
      icon: <Users className="h-6 w-6 text-primary" />,
      title: "Purpose and Uses",
      description:
        "This certificate is commonly required for various purposes such as applying for scholarships, educational loans, internships, passport applications, visa applications, opening bank accounts, or for any other official verification of student status.",
    },
    {
      icon: <ListOrdered className="h-6 w-6 text-primary" />,
      title: "How to Apply",
      description: (
        <ul className="list-disc list-inside space-y-1">
          <li>Obtain the application form from the administrative office or download it from the college website.</li>
          <li>Fill in all required details accurately.</li>
          <li>Attach necessary supporting documents (e.g., student ID copy, fee receipt).</li>
          <li>Submit the form to the designated department (e.g., Registrar's office, Student Affairs).</li>
          <li>Pay any applicable processing fees.</li>
        </ul>
      ),
    },
    {
      icon: <FileText className="h-6 w-6 text-primary" />,
      title: "Required Documents",
      description: (
        <ul className="list-disc list-inside space-y-1">
          <li>Student ID Card (photocopy)</li>
          <li>Latest Fee Receipt (photocopy)</li>
          <li>Application form (duly filled)</li>
          <li>Any specific request letter if required for a particular purpose</li>
        </ul>
      ),
    },
    {
      icon: <CheckCircle className="h-6 w-6 text-primary" />,
      title: "Processing Time",
      description:
        "The certificate is typically processed within 3-5 working days from the date of application submission. Students will be notified once the certificate is ready for collection.",
    },
  ];

  return (
    <section id="bonafide-details" className="py-12 md:py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Bonafide Certificate Details
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Everything you need to know about obtaining your Bonafide Certificate from Adhiyamaan College.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {details.map((item, index) => (
            <Card key={index} className="flex flex-col items-start p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center space-x-4 p-0 mb-4">
                <div className="flex-shrink-0">{item.icon}</div>
                <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white">{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-0 text-gray-700 dark:text-gray-300 text-base leading-relaxed">
                {item.description}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BonafideDetailsSection;