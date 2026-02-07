import React from "react";
import { Navbar } from "../components/Navbar";
import { DotGrid } from "../components/DotGrid";

export const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#0f0a18]">
      <div className="fixed inset-0 z-0">
        <DotGrid
          dotSize={5}
          gap={15}
          baseColor="#271E37"
          activeColor="#5227FF"
          proximity={100}
          shockRadius={200}
          shockStrength={5}
          returnDuration={1.5}
          style={{ width: "100%", height: "100%" }}
        />
      </div>
      <Navbar />
      <div className="relative z-10 flex-1 flex items-center justify-center p-4 pt-24">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
};
