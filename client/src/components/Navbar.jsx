import React, { useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";


const Navbar = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const buttonRef = useRef(null);
  const hoverTimeoutRef = useRef(null);

  // Clear any pending timeout
  const clearHoverTimeout = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  const handleMouseEnter = useCallback(() => {
    clearHoverTimeout();
    setIsPopupOpen(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    clearHoverTimeout();
    hoverTimeoutRef.current = setTimeout(() => {
      setIsPopupOpen(false);
    }, 200); // delay to allow moving to popup
  }, []);

  return (
    <header className="fixed top-0 w-full bg-white shadow-md z-50">
      <nav className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img
            src="/nav.png"
            alt="Logo"
            className="h-9 w-auto object-contain"
          />
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-6">
       <a href="#testimonials" className="text-gray-700 hover:text-blue-600">
            Testimonials 
          </a>
          <a href="#features" className="text-gray-700 hover:text-blue-600">
            Features
          </a>
        </div>

        {/* College Account Button with Hover */}
        <div className="flex items-center space-x-4 relative">
          <button
            ref={buttonRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-sm focus:outline-none"
            title="College Account"
          >
            G
          </button>

        </div>
      </nav>
    </header>
  );
};

export default Navbar;