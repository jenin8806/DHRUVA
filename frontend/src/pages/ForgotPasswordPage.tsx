import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Shield, Key, ArrowRight, CheckCircle, Mail } from "lucide-react";
import { AuthLayout } from "../layouts/AuthLayout";
import { BackButton } from "../components/BackButton";

export const ForgotPasswordPage = () => {
    const [email, setEmail] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);

    const inputClass =
        "w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#5227FF] focus:ring-1 focus:ring-[#5227FF] transition-all";
    const labelClass = "block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2";

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        // Simulate API call
        setTimeout(() => {
            setIsSubmitted(true);
        }, 1000);
    };

    return (
        <AuthLayout>
            <div className="rounded-2xl border border-white/10 bg-[#050515]/80 backdrop-blur-xl p-8 shadow-2xl">
                <div className="mb-6">
                    <BackButton to="/login" />
                </div>
                <div className="text-center mb-8">
                    <div className="inline-flex rounded-xl bg-[#5227FF]/20 p-3 border border-[#5227FF]/40 mb-4">
                        <Shield className="h-10 w-10 text-[#3DC2EC]" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">
                        Reset Password
                    </h2>
                    <p className="text-sm text-gray-400 mt-1">
                        Enter your email to receive recovery instructions
                    </p>
                </div>

                {!isSubmitted ? (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className={labelClass}>Email Address</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    required
                                    className={inputClass}
                                    placeholder="john@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3.5 rounded-xl bg-[#5227FF] text-white font-semibold hover:bg-[#3DC2EC] hover:text-[#0f0a18] transition-all flex items-center justify-center gap-2 border border-[#5227FF]/50"
                        >
                            Send Reset Link
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>
                ) : (
                    <div className="text-center animate-in fade-in zoom-in duration-300">
                        <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-6">
                            <CheckCircle className="w-12 h-12 text-emerald-400 mb-2" />
                            <h3 className="text-lg font-bold text-white mb-1">Check your email</h3>
                            <p className="text-sm text-gray-400">
                                We've sent password reset instructions to <br />
                                <span className="text-white font-medium">{email}</span>
                            </p>
                        </div>
                        <Link
                            to="/login"
                            className="inline-flex items-center text-sm font-medium text-[#3DC2EC] hover:text-[#5227FF] transition-colors"
                        >
                            Back to Login
                        </Link>
                    </div>
                )}
            </div>
        </AuthLayout>
    );
};
