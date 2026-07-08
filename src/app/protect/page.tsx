"use client";

import { useState, useCallback } from "react";
import { Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import Link from "next/link";
import Header from "@/components/Header";
import DropZone from "@/components/DropZone";
import Button from "@/components/Button";
import PdfPreview from "@/components/PdfPreview";
import ProtectedRoute from "@/components/ProtectedRoute";

function strength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: "", color: "" };
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^a-zA-Z0-9]/.test(pw)) s++;
  const levels = [
    { label: "Sangat Lemah", color: "#ef4444" },
    { label: "Lemah",        color: "#f97316" },
    { label: "Cukup",        color: "#eab308" },
    { label: "Kuat",         color: "#3b82f6" },
    { label: "Sangat Kuat",  color: "#22c55e" },
  ];
  return { score: s, ...levels[Math.min(s, 4)] };
}

export default function ProtectPage() {
  const [file, setFile] = useState<File | null>(null);
  const [userPw, setUserPw] = useState(""); const [showU, setShowU] = useState(false);
  const [ownerPw, setOwnerPw] = useState(""); const [showO, setShowO] = useState(false);
  const [useOwner, setUseOwner] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const sw = strength(userPw);

  const handleProtect = async () => {
    if (!file || !userPw) return;
    setProcessing(true);
    try {
      const fd = new FormData();
      fd.append("file", file); fd.append("userPassword", userPw);
      if (useOwner && ownerPw) fd.append("ownerPassword", ownerPw);
      const res = await fetch("/api/protect", { method: "POST", body: fd });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = "protected.pdf"; a.click();
      URL.revokeObjectURL(url);
      setSuccess(true);
    } catch { alert("Gagal memproses file"); }
    finally { setProcessing(false); }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen" style={{ background: "var(--bg)" }}>
        <Header activePath="/protect" />
        <main className="flex flex-col lg:flex-row min-h-[calc(100vh-60px)]">
          {!file ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="w-full max-w-lg">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-8 h-8 text-brand-500" />
                  </div>
                  <h1 className="text-2xl font-bold text-[var(--text)] mb-2">Protect PDF</h1>
                  <p className="text-sm text-[var(--text-muted)]">Lindungi dokumen PDF dengan kata sandi</p>
                </div>
                <DropZone onFiles={f => setFile(f[0])} accept="application/pdf" />
                <div className="mt-5 grid grid-cols-4 gap-2">
                  {[
                    { icon: <Lock className="w-4 h-4" />, label: "Pilih File" },
                    { icon: <Lock className="w-4 h-4" />, label: "Password" },
                    { icon: <ShieldCheck className="w-4 h-4" />, label: "Protect" },
                    { icon: <ShieldCheck className="w-4 h-4" />, label: "Simpan" },
                  ].map(f => (
                    <div key={f.label} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white border border-[var(--border)] text-center">
                      <span className="text-brand-500">{f.icon}</span>
                      <span className="text-xs font-medium text-[var(--text-muted)]">{f.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 p-8 flex items-center justify-center">
                <div className="card overflow-hidden max-w-[200px] w-full">
                  <PdfPreview file={file} pageNumber={1} />
                  <div className="p-3 border-t border-[var(--border)]">
                    <p className="text-xs font-semibold text-[var(--text)] truncate">{file.name}</p>
                  </div>
                </div>
              </div>
              <div className="sidebar">
                <div className="sidebar-header">
                  <h2 className="font-bold text-[var(--text)] text-lg">Protect PDF</h2>
                </div>
                <div className="sidebar-body">
                  {success && (
                    <div className="flex items-center gap-2.5 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                      <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      <p className="text-xs font-semibold text-emerald-700">PDF berhasil diproteksi!</p>
                    </div>
                  )}
                  <div>
                    <label className="label">Password buka PDF <span className="text-brand-500">*</span></label>
                    <div className="relative">
                      <input type={showU ? "text" : "password"} value={userPw}
                        onChange={e => { setUserPw(e.target.value); setSuccess(false); }}
                        placeholder="Masukkan password…"
                        className="input pr-10" />
                      <button onClick={() => setShowU(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]">
                        {showU ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                      </button>
                    </div>
                    {userPw && (
                      <div className="mt-2">
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ background: sw.color, width: `${sw.score * 20}%` }} />
                        </div>
                        <p className="text-[11px] mt-1 font-semibold" style={{ color: sw.color }}>{sw.label}</p>
                      </div>
                    )}
                  </div>
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input type="checkbox" checked={useOwner} onChange={e => setUseOwner(e.target.checked)} className="w-4 h-4 accent-brand-500 rounded" />
                    <span className="text-sm text-[var(--text-muted)]">Tambah password pemilik (opsional)</span>
                  </label>
                  {useOwner && (
                    <div className="relative">
                      <input type={showO ? "text" : "password"} value={ownerPw} onChange={e => setOwnerPw(e.target.value)}
                        placeholder="Password pemilik…" className="input pr-10" />
                      <button onClick={() => setShowO(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]">
                        {showO ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                      </button>
                    </div>
                  )}
                  <div className="card p-3 bg-amber-50 border-amber-100">
                    <p className="text-xs text-amber-700 leading-relaxed">Simpan password dengan aman. File tidak dapat dibuka tanpa password yang benar.</p>
                  </div>
                </div>
                <div className="sidebar-footer space-y-2">
                  <Button onClick={handleProtect} loading={processing} disabled={!userPw} fullWidth size="lg" icon={<Lock className="w-5 h-5"/>}>
                    {processing ? "Memproses…" : "Protect PDF"}
                  </Button>
                  <Link href="/">
                    <Button variant="ghost" fullWidth size="sm">Ganti file</Button>
                  </Link>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
