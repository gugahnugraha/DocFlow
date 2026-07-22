"use client";

import Header from "@/components/Header";
import { Check, Sparkles } from "lucide-react";
import Link from "next/link";

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Header activePath="/pricing" />
      
      <main className="flex-1 max-w-screen-xl w-full mx-auto px-5 py-16">
        <div className="text-center max-w-2xl mx-auto mb-16 animate-fade-up" style={{ opacity: 0, animationFillMode: 'forwards' }}>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-slate-500">
            Start using DocFlow for free. Upgrade when you need more power and advanced features.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm animate-fade-up" style={{ animationDelay: '0.1s', opacity: 0, animationFillMode: 'forwards' }}>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Free</h2>
            <p className="text-slate-500 text-sm mb-6">Perfect for occasional PDF editing.</p>
            <div className="mb-8">
              <span className="text-4xl font-extrabold text-slate-900">$0</span>
              <span className="text-slate-500"> /forever</span>
            </div>
            <ul className="space-y-4 mb-8">
              {["Access to 12 basic PDF tools", "Max file size: 50MB", "Process 3 files per day", "Standard processing speed"].map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-full bg-green-100 p-1 text-green-600">
                    <Check className="w-3 h-3" />
                  </div>
                  <span className="text-slate-700 text-sm font-medium">{feature}</span>
                </li>
              ))}
            </ul>
            <Link href="/" className="block w-full py-3 px-4 text-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold transition-colors">
              Get Started Free
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-xl relative animate-fade-up" style={{ animationDelay: '0.2s', opacity: 0, animationFillMode: 'forwards' }}>
            <div className="absolute top-0 right-8 transform -translate-y-1/2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-orange-400 to-orange-500 text-white text-xs font-bold shadow-lg">
                <Sparkles className="w-3 h-3" /> MOST POPULAR
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">DocFlow Pro</h2>
            <p className="text-slate-400 text-sm mb-6">For professionals who need unlimited power.</p>
            <div className="mb-8">
              <span className="text-4xl font-extrabold text-white">$9</span>
              <span className="text-slate-400"> /month</span>
            </div>
            <ul className="space-y-4 mb-8">
              {["Unlimited file processing", "Max file size: 2GB", "Priority processing speed", "Batch processing support", "No ads or watermarks"].map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-full bg-orange-500/20 p-1 text-orange-500">
                    <Check className="w-3 h-3" />
                  </div>
                  <span className="text-slate-300 text-sm font-medium">{feature}</span>
                </li>
              ))}
            </ul>
            <Link href="/login" className="block w-full py-3 px-4 text-center rounded-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold transition-all shadow-lg shadow-orange-500/20">
              Upgrade to Pro
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
