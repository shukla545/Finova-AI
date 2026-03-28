import React from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";

const Landing = () => {
  return (
    <div>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pt-[90px]">
        <Navbar />
        <Hero/>
        <Features/>
      </div>
    </div>
  );
};

export default Landing;