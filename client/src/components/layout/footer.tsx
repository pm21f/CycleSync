import React from "react";
import { Link } from "wouter";
import { LunaLogo } from "@/components/icons";

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-neutral-200 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex md:justify-between">
          <div className="mb-8 md:mb-0 md:w-1/4">
            <div className="flex items-center">
              <LunaLogo className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-semibold text-primary">Luna</span>
            </div>
            <p className="mt-3 text-neutral-600 text-sm">
              Empowering women with personalized menstrual health tracking, insights, and support.
            </p>
            <div className="mt-4 flex space-x-4">
              <a href="#" className="text-neutral-500 hover:text-primary">
                <i className="ri-instagram-line text-lg"></i>
              </a>
              <a href="#" className="text-neutral-500 hover:text-primary">
                <i className="ri-twitter-line text-lg"></i>
              </a>
              <a href="#" className="text-neutral-500 hover:text-primary">
                <i className="ri-facebook-circle-line text-lg"></i>
              </a>
              <a href="#" className="text-neutral-500 hover:text-primary">
                <i className="ri-pinterest-line text-lg"></i>
              </a>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 md:w-2/3">
            <div>
              <h3 className="text-sm font-semibold text-neutral-700 uppercase tracking-wider">Features</h3>
              <ul className="mt-4 space-y-2">
                <li><Link href="/"><a className="text-neutral-600 hover:text-primary text-sm">Cycle Tracking</a></Link></li>
                <li><Link href="/calendar"><a className="text-neutral-600 hover:text-primary text-sm">Period Predictions</a></Link></li>
                <li><Link href="/insights"><a className="text-neutral-600 hover:text-primary text-sm">Health Insights</a></Link></li>
                <li><Link href="/"><a className="text-neutral-600 hover:text-primary text-sm">Symptom Logging</a></Link></li>
                <li><Link href="/community"><a className="text-neutral-600 hover:text-primary text-sm">Community Support</a></Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-neutral-700 uppercase tracking-wider">Resources</h3>
              <ul className="mt-4 space-y-2">
                <li><Link href="/resources"><a className="text-neutral-600 hover:text-primary text-sm">Educational Articles</a></Link></li>
                <li><Link href="/resources"><a className="text-neutral-600 hover:text-primary text-sm">Expert Videos</a></Link></li>
                <li><Link href="/resources"><a className="text-neutral-600 hover:text-primary text-sm">Q&A Database</a></Link></li>
                <li><Link href="/resources"><a className="text-neutral-600 hover:text-primary text-sm">Health Condition Guide</a></Link></li>
                <li><Link href="/resources"><a className="text-neutral-600 hover:text-primary text-sm">Wellness Tips</a></Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-neutral-700 uppercase tracking-wider">About</h3>
              <ul className="mt-4 space-y-2">
                <li><a href="#" className="text-neutral-600 hover:text-primary text-sm">Our Mission</a></li>
                <li><a href="#" className="text-neutral-600 hover:text-primary text-sm">Privacy Policy</a></li>
                <li><a href="#" className="text-neutral-600 hover:text-primary text-sm">Terms of Service</a></li>
                <li><a href="#" className="text-neutral-600 hover:text-primary text-sm">Contact Us</a></li>
                <li><a href="#" className="text-neutral-600 hover:text-primary text-sm">Help Center</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-8 border-t border-neutral-200 pt-8 md:flex md:items-center md:justify-between">
          <div className="text-sm text-neutral-500">
            © {new Date().getFullYear()} Luna Health, Inc. All rights reserved.
          </div>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <a href="#" className="text-neutral-500 hover:text-primary text-sm">Privacy</a>
            <a href="#" className="text-neutral-500 hover:text-primary text-sm">Terms</a>
            <a href="#" className="text-neutral-500 hover:text-primary text-sm">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
