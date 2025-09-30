"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AboutSection = () => {
  return (
    <section className="container py-16 animate-fade-in delay-500">
      <Card className="p-6 md:p-10 shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-primary">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl md:text-4xl font-bold mb-4 text-primary">
            About Adhiyamaan College
          </CardTitle>
        </CardHeader>
        <CardContent className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          <p className="mb-4">
            Adhiyamaan College has a rich history of academic excellence and a commitment to fostering innovation and critical thinking. Established with the vision of providing quality education, we have grown into a leading institution known for our comprehensive programs and vibrant campus life.
          </p>
          <p>
            Our dedicated faculty, state-of-the-art facilities, and student-centric approach ensure that every student receives the best possible learning experience, preparing them for successful careers and meaningful contributions to society.
          </p>
        </CardContent>
      </Card>
    </section>
  );
};

export default AboutSection;