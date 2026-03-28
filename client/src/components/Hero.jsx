import React from "react";
import { Link } from "react-router-dom";
import { useClerk, useUser, SignInButton } from "@clerk/react";
import { ArrowRight, BadgeCheck, CheckCircle2 } from "lucide-react";


const Hero = () => {
  const { signOut } = useClerk();
  const { isSignedIn } = useUser();

  const handleAuthClick = () => {
    if (isSignedIn) {
      signOut();
    }
  };

  return (
    <section className="relative min-h-[calc(100vh-72px)] flex items-center overflow-hidden bg-white">
      
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.07),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(37,99,235,0.05),_transparent_30%)]" />

      <div className="relative max-w-[85rem] mx-auto w-full px-6 py-4 md:py-6 flex flex-col-reverse md:flex-row items-center gap-6 lg:gap-8">
        
        {/* Left Content */}
        <div className="text-center md:text-left flex-1">

          <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm">
            <BadgeCheck className="w-4 h-4" />
            AI-Powered Smart Finance Platform
          </div>

          <h2 className="mt-4 text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.08] tracking-tight">
            Transform Financial Complexity Into{" "}
            <span className="text-blue-600">
              Confident Decisions
            </span>
          </h2>

          <p className="mt-4 text-base md:text-lg text-gray-600 leading-7 max-w-2xl mx-auto md:mx-0">
            FinovaAI unifies critical financial data into one intelligent platform 
            for faster insights and smarter portfolio decisions.
          </p>

          {/* Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            
            {isSignedIn ? (
              <button
                onClick={handleAuthClick}
                className="group px-6 py-3 md:px-8 md:py-4 bg-blue-600 text-white text-sm md:text-lg rounded-xl shadow-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                Explore Platform
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </button>
            ) : (
              <SignInButton mode="modal">
                <button className="group px-6 py-3 md:px-8 md:py-4 bg-blue-600 text-white text-sm md:text-lg rounded-xl shadow-lg hover:bg-blue-700 transition flex items-center justify-center gap-2">
                  Explore Platform
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </button>
              </SignInButton>
            )}

            <Link
              to="/dashboard"
              className="px-6 py-3 md:px-8 md:py-4 border border-blue-600 text-blue-600 text-sm md:text-lg rounded-xl shadow-sm hover:bg-blue-50 transition flex items-center justify-center gap-2"
            >
              View Insights
            </Link>
          </div>

          {/* Trust Points */}
          <div className="mt-6 flex flex-wrap gap-3 justify-center md:justify-start">
            <div className="flex items-center gap-2 rounded-full bg-gray-50 border border-gray-200 px-4 py-2 text-sm text-gray-700">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              Trusted Data
            </div>
            <div className="flex items-center gap-2 rounded-full bg-gray-50 border border-gray-200 px-4 py-2 text-sm text-gray-700">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              AI Insights
            </div>
            <div className="flex items-center gap-2 rounded-full bg-gray-50 border border-gray-200 px-4 py-2 text-sm text-gray-700">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              Smarter Portfolios
            </div>
          </div>
        </div>

        {/* Right Image (same as before) */}
        <div className="flex-1 flex justify-center w-full">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-blue-50 blur-3xl opacity-70 scale-90" />
            <img
              src="/hero.png"
              alt="FinovaAI"
              className="relative max-w-xs md:max-w-md lg:max-w-2xl h-auto object-contain drop-shadow-[0_20px_40px_rgba(37,99,235,0.12)]"
            />
          </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;
