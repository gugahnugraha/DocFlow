"use client";

import { useState } from "react";
import { LockOpen, Eye, EyeOff, ShieldCheck, AlertCircle, Upload } from "lucide-react";
import Header from "@/components/Header";
import DropZone from "@/components/DropZone";
import Button from "@/components/Button";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function UnlockPage() {
  const { t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleUnlock = async () => {
    if (!file) return;
    setProcessing(true); setError(""); setSuccess(false);
    try {
      const fd = new FormData();
      fd.append("file", file);
      if (password) fd.append("password", password);
      const res = await fetch("/api/unlock", { method: "POST", body: fd });
      if (!res.ok) { const j = await res.json(); setError(j.error || t.common.errors.failed); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = "unlocked.pdf"; a.click();
      URL.revokeObjectURL(url);
      setSuccess(true);
    } catch { setError(t.common.errors.processingFailed); }
    finally { setProcessing(false); }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "var(--bg)" }}>
        <div className="w-full max-w-md">
          <Header activePath="/unlock" />
          <div className="card p-8 mt-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <LockOpen className="w-8 h-8 text-brand-500" />
              </div>
              <h1 className="text-2xl font-bold text-[var(--text)] mb-2">{t.pages.unlock.title}</h1>
              <p className="text-sm text-[var(--text-muted)]">{t.pages.unlock.subtitle}</p>
            </div>

            {!file ? (
              <>
                <DropZone onFiles={f => setFile(f[0])} accept="application/pdf" />
                <div className="mt-5 grid grid-cols-4 gap-2">
                  {[
                    { icon: <LockOpen className="w-4 h-4" />, label: t.pages.unlock.steps.select },
                    { icon: <LockOpen className="w-4 h-4" />, label: t.pages.unlock.steps.password },
                    { icon: <LockOpen className="w-4 h-4" />, label: t.pages.unlock.steps.process },
                    { icon: <LockOpen className="w-4 h-4" />, label: t.pages.unlock.steps.download },
                  ].map(f => (
                    <div key={f.label} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white border border-[var(--border)] text-center">
                      <span className="text-brand-500">{f.icon}</span>
                      <span className="text-xs font-medium text-[var(--text-muted)]">{f.label}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3.5 bg-[var(--bg)] rounded-xl border border-[var(--border)]">
                  <div className="w-9 h-9 bg-brand-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <LockOpen className="w-4 h-4 text-brand-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--text)] truncate">{file.name}</p>
                    <p className="text-xs text-[var(--text-subtle)]">{(file.size / 1024).toFixed(0)} KB</p>
                  </div>
                  <button onClick={() => { setFile(null); setError(""); setSuccess(false); }}
                    className="text-xs text-[var(--text-subtle)] hover:text-brand-500 font-medium transition-colors">{t.pages.unlock.change}</button>
                </div>

                <div>
                  <label className="label">{t.pages.unlock.passwordLabel}</label>
                  <div className="relative">
                    <input type={showPw ? "text" : "password"} value={password}
                      onChange={e => { setPassword(e.target.value); setError(""); }}
                      placeholder={t.pages.unlock.passwordPlaceholder} className="input pr-10" />
                    <button onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]">
                      {showPw ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                    </button>
                  </div>
                  <p className="text-[11px] text-[var(--text-subtle)] mt-1">{t.pages.unlock.helper}</p>
                </div>

                {error && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-red-700 font-medium">{error}</p>
                  </div>
                )}
                {success && (
                  <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <p className="text-xs text-emerald-700 font-semibold">{t.pages.unlock.success}</p>
                  </div>
                )}

                <Button onClick={handleUnlock} loading={processing} fullWidth size="lg" icon={<LockOpen className="w-5 h-5"/>}>
                  {processing ? t.common.actions.processing : t.pages.unlock.title}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
