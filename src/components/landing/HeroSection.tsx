"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section
      className="relative h-[60vh] md:h-[80vh] bg-cover bg-center flex items-center justify-center text-white overflow-hidden"
      style={{ backgroundImage: "url('/ace pic.jpg')" }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-primary/75 to-primary/55"></div>
      <div className="relative z-10 text-center px-4 animate-fade-in">
        <h1 className="text-4xl md:text-7xl font-extrabold mb-4 drop-shadow-lg animate-fade-in delay-100">
          Welcome to Adhiyamaan College of Engineering
        </h1>
        <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto animate-fade-in delay-200">
          Empowering minds, shaping futures. Discover excellence in education and innovation.
        </p>
        <Button 
          asChild 
          size="lg" 
          className="bg-white text-primary hover:bg-gray-50 transition-all duration-500 ease-out
                     animate-fade-in delay-300 font-semibold shadow-lg border-2 border-white/20
                     relative overflow-hidden group transform
                     hover:scale-110 hover:shadow-2xl hover:-translate-y-2
                     active:scale-105 active:translate-y-0
                     before:absolute before:inset-0 before:bg-gradient-to-r 
                     before:from-primary/10 before:via-primary/20 before:to-primary/10
                     before:translate-x-[-100%] before:transition-transform before:duration-700
                     hover:before:translate-x-[100%]
                     focus:ring-4 focus:ring-white/30 focus:outline-none"
        >
          <Link to="/login" className="relative z-10 flex items-center gap-2">
            <span>Login</span>
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1 group-hover:scale-110">
              →
            </span>
          </Link>
        </Button>
      </div>
    </section>
  );
};

export default HeroSection;