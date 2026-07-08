"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FileType, Eye, EyeOff, ShieldCheck, Mail, Lock } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import Link from "next/link";

export default function LoginPage() {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (session) {
      router.push("/");
    }
  }, [session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/",
    });

    if (result?.error) {
      setError(t.loginSignup.errors.invalidCredentials);
    } else if (result?.url) {
      router.push(result.url);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Column: Form */}
      <div className="flex-1 flex items-center justify-center bg-white px-4 py-8">
        <div className="max-w-sm w-full">
          <div className="mb-6">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/30">
                <FileType className="w-4 h-4 text-white flex-shrink-0" />
              </div>
              <span className="text-xl font-bold">
                <span className="text-gray-900">Doc</span>
                <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Flow</span>
              </span>
            </Link>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.loginSignup.welcomeBackTitle}</h1>
            <p className="text-gray-500 text-sm">{t.loginSignup.welcomeBackSubtitle}</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t.loginSignup.email}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 flex-shrink-0" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-gray-50 text-sm"
                  placeholder={t.loginSignup.emailPlaceholder}
                  required
                />
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t.loginSignup.password}
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 flex-shrink-0" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-gray-50 text-sm"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-4.5 h-4.5 flex-shrink-0" />
                  ) : (
                    <Eye className="w-4.5 h-4.5 flex-shrink-0" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-xs text-gray-600">{t.loginSignup.rememberMe}</span>
              </label>
              <a href="#" className="text-xs font-semibold text-orange-600 hover:text-orange-700">
                {t.loginSignup.forgotPassword}
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 hover:from-orange-600 hover:via-orange-700 hover:to-red-600 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {loading ? t.loginSignup.signingIn : t.loginSignup.signIn}
            </button>
          </form>

          <div className="flex items-center my-4">
            <div className="flex-1 border-t border-gray-200" />
            <span className="mx-3 text-xs text-gray-500">{t.common.text.orContinueWith}</span>
            <div className="flex-1 border-t border-gray-200" />
          </div>

          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="w-full flex items-center justify-center gap-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 shadow-sm text-sm"
          >
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {t.loginSignup.continueWithGoogle}
          </button>

          <div className="text-center mt-5">
            <p className="text-xs text-gray-500">
              {t.loginSignup.dontHaveAccount}{" "}
              <Link href="/signup" className="font-semibold text-orange-600 hover:text-orange-700 text-xs">
                {t.loginSignup.signUpLink}
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Column: Hero */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 px-8 py-8">
        <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center mb-6 border border-white/20">
          <ShieldCheck className="w-8 h-8 text-white flex-shrink-0" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-4 text-center">
          {t.loginSignup.heroTitle}
        </h2>
        <p className="text-white/90 text-base text-center max-w-md mb-7">
          {t.loginSignup.heroDescription}
        </p>

        <div className="grid grid-cols-2 gap-3 w-full max-w-md">
          <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
            <svg className="w-5 h-5 text-yellow-200 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <div>
              <h3 className="text-white font-semibold text-sm">{t.loginSignup.heroBadges.fast}</h3>
            </div>
          </div>

          <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
            <svg className="w-5 h-5 text-emerald-200 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <div>
              <h3 className="text-white font-semibold text-sm">{t.loginSignup.heroBadges.private}</h3>
            </div>
          </div>

          <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
            <svg className="w-5 h-5 text-sky-200 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-white font-semibold text-sm">{t.loginSignup.heroBadges.free}</h3>
            </div>
          </div>

          <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
            <svg className="w-5 h-5 text-purple-200 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <div>
              <h3 className="text-white font-semibold text-sm">{t.loginSignup.heroBadges.formats}</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
