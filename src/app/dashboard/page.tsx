"use client";

import Header from "@/components/Header";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useSession } from "next-auth/react";
import { FileText, Clock, UploadCloud, MoreVertical } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-slate-50/50">
        <Header activePath="/dashboard" />
        <main className="flex-1 max-w-screen-xl w-full mx-auto px-5 py-10">
          <DashboardContent />
        </main>
      </div>
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { data: session } = useSession();

  return (
    <div className="space-y-8 animate-fade-up" style={{ opacity: 0, animationFillMode: 'forwards' }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-slate-500 mt-1">
            Welcome back, {session?.user?.name || "User"}! Here's your recent activity.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          <UploadCloud className="w-4 h-4" />
          Process New PDF
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Processed Files</p>
            <p className="text-2xl font-bold text-slate-900">0</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Time Saved (hrs)</p>
            <p className="text-2xl font-bold text-slate-900">0.0</p>
          </div>
        </div>
      </div>

      {/* Recent Files Empty State */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">Recent Activity</h2>
          <button className="text-slate-400 hover:text-slate-600"><MoreVertical className="w-5 h-5" /></button>
        </div>
        <div className="p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-slate-700 font-semibold mb-1">No recent activity</h3>
          <p className="text-sm text-slate-500 max-w-sm mb-6">
            You haven't processed any PDF files yet. When you merge, split, or compress a file, it will appear here.
          </p>
          <Link
            href="/"
            className="text-sm font-semibold text-orange-600 hover:text-orange-700"
          >
            Explore PDF Tools &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
