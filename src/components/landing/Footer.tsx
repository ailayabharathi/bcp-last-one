import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="container grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1">
          <h3 className="text-xl font-bold mb-4">Adhiyamaan College</h3>
          <p className="text-sm">
            Dr.M.G.R.Nagar, Hosur,<br />
            Krishnagiri District, Tamil Nadu,<br />
            India. Pin:635 130
          </p>
          <p className="text-sm mt-2">Phone: +1 (123) 456-7890</p>
          <p className="text-sm">Email: info@adhiyamaan.edu</p>
          <p className="text-sm mt-2">
            Website: <a href="http://www.adhiyamaan.ac.in" target="_blank" rel="noopener noreferrer" className="hover:underline">www.adhiyamaan.ac.in</a>
          </p>
        </div>

        <div className="col-span-1">
          <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2">
            <li>
              <Link to="/about" className="text-sm hover:underline">
                About Us
              </Link>
            </li>
            <li>
              <Link to="/admissions" className="text-sm hover:underline">
                Admissions
              </Link>
            </li>
            <li>
              <Link to="/academics" className="text-sm hover:underline">
                Academics
              </Link>
            </li>
            <li>
              <Link to="/contact" className="text-sm hover:underline">
                Contact Us
              </Link>            </li>
          </ul>
        </div>

        <div className="col-span-1">
          <h3 className="text-lg font-semibold mb-4">Departments</h3>
          <ul className="space-y-2">
            <li>
              <Link to="/departments/engineering" className="text-sm hover:underline">
                Engineering
              </Link>
            </li>
            <li>
              <Link to="/departments/arts-science" className="text-sm hover:underline">
                Arts & Science
              </Link>
            </li>
            <li>
              <Link to="/departments/management" className="text-sm hover:underline">
                Management
              </Link>
            </li>
            <li>
              <Link to="/departments/research" className="text-sm hover:underline">
                Research
              </Link>
            </li>
          </ul>
        </div>

        <div className="col-span-1">
          <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
          <div className="flex space-x-4">
            <a href="https://www.facebook.com/AdhiyamaanCollegeofEngineering" target="_blank" rel="noopener noreferrer" className="hover:text-accent-foreground">
              <Facebook className="h-6 w-6" />
            </a>
            <a href="https://twitter.com/adhiyamaan.ac.in" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
              <img src="/x-logo.webp" alt="X logo" className="h-6 w-6 invert" />
            </a>
            <a href="https://www.linkedin.com/school/adhiyamaan-college-of-engineering/" target="_blank" rel="noopener noreferrer" className="hover:text-accent-foreground">
              <Linkedin className="h-6 w-6" />
            </a>
            <a href="https://www.instagram.com/adhiyamaancollegeofengineering" target="_blank" rel="noopener noreferrer" className="hover:text-accent-foreground">
              <Instagram className="h-6 w-6" />
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-sm">
        &copy; {new Date().getFullYear()} Adhiyamaan College. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;