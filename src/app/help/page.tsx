"use client";

import Header from "@/components/Header";
import { HelpCircle, Mail, MessageCircle } from "lucide-react";

export default function HelpPage() {
  const faqs = [
    {
      q: "Are my files secure?",
      a: "Yes. All processing is done securely. Files are automatically deleted from our servers immediately after processing is complete.",
    },
    {
      q: "What is the maximum file size?",
      a: "Free users can upload files up to 50MB. Pro users have a much higher limit of 2GB per file.",
    },
    {
      q: "Do I need to install any software?",
      a: "No! DocFlow is entirely web-based. You can process your PDFs from any modern browser on your PC, Mac, or mobile device.",
    },
    {
      q: "How can I cancel my Pro subscription?",
      a: "You can cancel your subscription at any time from the 'Account Settings' page. You will continue to have Pro access until the end of your billing cycle.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Header activePath="/help" />
      
      <main className="flex-1 max-w-screen-xl w-full mx-auto px-5 py-12">
        <div className="text-center max-w-2xl mx-auto mb-16 animate-fade-up" style={{ opacity: 0, animationFillMode: 'forwards' }}>
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <HelpCircle className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            How can we help?
          </h1>
          <p className="text-lg text-slate-500">
            Find answers to common questions or reach out to our support team.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 max-w-5xl mx-auto">
          {/* FAQs */}
          <div className="lg:col-span-2 space-y-6 animate-fade-up" style={{ animationDelay: '0.1s', opacity: 0, animationFillMode: 'forwards' }}>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-800 mb-2">{faq.q}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Support */}
          <div className="space-y-6 animate-fade-up" style={{ animationDelay: '0.2s', opacity: 0, animationFillMode: 'forwards' }}>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Contact Us</h2>
            
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
              <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Email Support</h3>
                <p className="text-sm text-slate-500 mb-3">Get help via email. We typically reply within 24 hours.</p>
                <a href="mailto:support@docflow.com" className="text-sm font-semibold text-orange-600 hover:text-orange-700">
                  support@docflow.com
                </a>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
              <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Live Chat</h3>
                <p className="text-sm text-slate-500 mb-3">Available for Pro users 24/7.</p>
                <button className="px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors w-full">
                  Start Chat
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
