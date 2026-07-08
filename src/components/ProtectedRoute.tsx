"use client";

import { useSession, signIn } from "next-auth/react";
import { FileType, Lock } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const { t } = useLanguage();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-orange-500" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--text)] mb-3">
            {t.components.protectedRoute.title}
          </h1>
          <p className="text-[var(--text-muted)] mb-8">
            {t.components.protectedRoute.description}
          </p>
          <button
            onClick={() => signIn()}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 mx-auto"
          >
            <FileType className="w-5 h-5" />
            {t.components.protectedRoute.cta}
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
