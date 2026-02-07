import { useState, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Shield, ArrowRight, AlertCircle, User, Mail, Eye, EyeOff } from "lucide-react";
import { AuthLayout } from "../layouts/AuthLayout";
import { BackButton } from "../components/BackButton";

export const AuthPage = () => {
  const location = useLocation();
  const isSignup = location.pathname === "/signup";
  const searchParams = new URLSearchParams(location.search);
  const roleParam = searchParams.get("role");
  const initialRole = roleParam === "org" ? "org" : roleParam === "verifier" ? "verifier" : "user";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"user" | "org" | "verifier">(initialRole as "user" | "org" | "verifier");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { loginWithPassword, signup } = useAuth();
  const navigate = useNavigate();

  const inputClass =
    "w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 !text-white placeholder-gray-500 focus:outline-none focus:border-[#5227FF] focus:ring-1 focus:ring-[#5227FF] transition-all";
  const labelClass = "block text-xs font-semibold text-white uppercase tracking-wider mb-2";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      if (isSignup) {
        if (password !== confirmPassword) {
          setError("Passwords do not match");
          return;
        }
        await signup(name, email, role, username, password);
        navigate(role === "org" ? "/org/dashboard" : role === "verifier" ? "/verifier/dashboard" : "/dashboard");
      } else {
        const user = await loginWithPassword(username.trim(), password);
        if (!user) {
          setError("Invalid username or password");
          return;
        }
        navigate(user.role === "org" ? "/org/dashboard" : user.role === "verifier" ? "/verifier/dashboard" : "/dashboard");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    }
  };

  return (
    <AuthLayout>
      <div className="rounded-2xl border border-white/10 bg-[#0f0a18]/80 backdrop-blur-xl p-8 shadow-2xl">
        <div className="mb-6">
          <BackButton to="/" />
        </div>
        <div className="text-center mb-8">
          <div className="inline-flex rounded-xl bg-[#5227FF]/20 p-3 border border-[#5227FF]/40 mb-4">
            <Shield className="h-10 w-10 text-[#3DC2EC]" />
          </div>
          <h2 className="text-2xl font-bold text-white">
            {isSignup ? "Sign up" : "Log in"}
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            {isSignup ? "Create your account" : "Enter your credentials"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/30 p-3 rounded-xl text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isSignup && (
            <>
              <div>
                <label className={labelClass}>Full name</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    className={inputClass}
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <User className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                </div>
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    className={inputClass}
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                </div>
              </div>
              <div>
                <label className={labelClass}>Role</label>
                <select
                  className={inputClass}
                  value={role}
                  onChange={(e) => setRole(e.target.value as "user" | "org" | "verifier")}
                >
                  <option value="user" className="bg-[#0f0a18] text-white">Holder (Student / Professional)</option>
                  <option value="org" className="bg-[#0f0a18] text-white">Issuer (University / Employer)</option>
                  <option value="verifier" className="bg-[#0f0a18] text-white">Verifier (Employer / Bank)</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className={labelClass}>Username</label>
            <input
              type="text"
              required
              autoComplete="username"
              className={inputClass}
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                className={inputClass}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {!isSignup && (
              <div className="text-right mt-2">
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-xs font-medium text-[#3DC2EC] hover:text-[#5227FF] transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}
          </div>

          {isSignup && (
            <div>
              <label className={labelClass}>Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  className={inputClass}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}
          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-[#5227FF] text-white font-semibold hover:bg-[#3DC2EC] hover:text-[#0f0a18] transition-all flex items-center justify-center gap-2 border border-[#5227FF]/50"
          >
            {isSignup ? "Create account" : "Sign in"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate(isSignup ? "/login" : "/signup")}
            className="text-sm font-medium text-[#3DC2EC] hover:underline"
          >
            {isSignup ? "Already have an account? Log in" : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </AuthLayout>
  );
};
