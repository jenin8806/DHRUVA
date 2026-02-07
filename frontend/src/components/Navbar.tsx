import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Lock, LogOut, ScanLine } from "lucide-react";
import { useWeb3 } from "../context/Web3Context";
import { useAuth } from "../context/AuthContext";

export const Navbar = () => {
  const navigate = useNavigate();
  const { disconnect } = useWeb3();
  const { isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    disconnect();
    logout();
    navigate("/");
  };

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinkStyle =
    "relative text-xs font-semibold uppercase tracking-wider text-white/80 hover:text-white transition-colors";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[100] h-16 transition-all duration-300 ${isScrolled
        ? "bg-[#050515]/90 backdrop-blur-md border-b border-white/10"
        : "bg-transparent border-b border-transparent"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">
          <div
            className="flex items-center cursor-pointer group"
            onClick={() => navigate("/")}
          >
            <div className="rounded-lg bg-[#5227FF]/20 p-2 border border-[#5227FF]/40 transition-all group-hover:bg-[#5227FF]/30">
              <Shield className="h-5 w-5 text-[#3DC2EC]" />
            </div>
            <span className="ml-3 text-xl font-bold text-white tracking-tight">
              Dhruva
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className={navLinkStyle}>
              Architecture
            </a>
            <a href="#features" className={navLinkStyle}>
              Capabilities
            </a>
            <a href="#use-cases" className={navLinkStyle}>
              Ecosystem
            </a>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate("/verify")}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                >
                  <ScanLine className="w-3.5 h-3.5" />
                  Verify
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                >
                  <Lock className="w-3.5 h-3.5" />
                  Login
                </button>
                <button
                  onClick={() => navigate("/signup")}
                  className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-white bg-[#5227FF] hover:bg-[#3DC2EC] hover:text-[#0f0a18] rounded-lg transition-all border border-[#5227FF]/50"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
