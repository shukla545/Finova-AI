import React from "react";
import { featuresData } from "../assets/features";
import {
  Newspaper,
  FileText,
  LineChart,
  Users,
  ShieldCheck,
  Brain,
} from "lucide-react";

const iconMap = {
  Newspaper,
  FileText,
  LineChart,
  Users,
  ShieldCheck,
  Brain,
};

const Features = () => {
  return (
    <section id="features" className="py-12 md:py-16 bg-gray-50">
      <div className="max-w-[85rem] mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-block px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold border border-blue-100">
            Platform Features
          </span>

          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-4">
            Explore Our AI-Powered Financial Intelligence Platform
          </h2>

          <p className="text-gray-600 text-base md:text-lg mt-4 leading-7">
            Discover the key capabilities that help investors and financial
            institutions simplify fragmented data, verify information, and make
            smarter portfolio decisions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          {featuresData.map((feature, index) => {
            const Icon = iconMap[feature.iconName];

            return (
              <div
                key={index}
                className="p-6 bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-start space-y-4"
              >
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                  {Icon && <Icon className="h-7 w-7 text-blue-600" />}
                </div>

                <h3 className="text-xl font-semibold text-gray-900">
                  {feature.title}
                </h3>

                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;