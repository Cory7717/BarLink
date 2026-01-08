'use client';

import Navigation from "@/components/Navigation";
import { useState } from "react";

export default function ContactPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      topic: formData.get('topic'),
      message: formData.get('message'),
    };

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(result.message);
        (e.target as HTMLFormElement).reset();
      } else {
        setStatus('error');
        setMessage(result.error || 'Failed to send message');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Network error. Please try emailing us directly.');
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-purple-900/20 to-slate-950 text-white">
      <Navigation />
      <main className="mx-auto max-w-3xl px-4 pb-16 pt-10 space-y-6">
        <header>
          <p className="text-sm text-emerald-300">Support</p>
          <h1 className="text-3xl font-bold bg-linear-to-r from-cyan-200 to-blue-200 bg-clip-text text-transparent">Contact BarPulse</h1>
          <p className="text-slate-200">Questions, issues, or feedback? We usually reply within one business day.</p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-slate-700/50 bg-linear-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-md p-6 shadow-lg"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm text-slate-100">
              Name
              <input name="name" className="mt-2 w-full rounded-lg border border-slate-600/50 bg-slate-800/50 backdrop-blur-sm px-3 py-2 text-white placeholder:text-slate-400 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all" required />
            </label>
            <label className="text-sm text-slate-100">
              Email
              <input name="email" type="email" className="mt-2 w-full rounded-lg border border-slate-600/50 bg-slate-800/50 backdrop-blur-sm px-3 py-2 text-white placeholder:text-slate-400 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all" required />
            </label>
          </div>
          <label className="text-sm text-slate-100">
            Topic
            <select name="topic" className="mt-2 w-full rounded-lg border border-slate-600/50 bg-slate-800/50 backdrop-blur-sm px-3 py-2 text-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all">
              <option value="General question">General question</option>
              <option value="Billing">Billing</option>
              <option value="Report an issue">Report an issue</option>
              <option value="Owner onboarding help">Owner onboarding help</option>
            </select>
          </label>
          <label className="text-sm text-slate-100">
            Message
            <textarea name="message" className="mt-2 w-full rounded-lg border border-slate-600/50 bg-slate-800/50 backdrop-blur-sm px-3 py-3 text-white placeholder:text-slate-400 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all" rows={4} required />
          </label>
          {status === 'success' && (
            <div className="rounded-lg bg-emerald-500/20 border border-emerald-500/50 p-4 text-emerald-100">
              {message}
            </div>
          )}
          {status === 'error' && (
            <div className="rounded-lg bg-red-500/20 border border-red-500/50 p-4 text-red-100">
              {message}
            </div>
          )}
          <button 
            type="submit" 
            disabled={status === 'loading'}
            className="w-full rounded-lg bg-linear-to-r from-emerald-500 to-emerald-600 px-4 py-3 text-sm font-semibold text-slate-950 hover:from-emerald-400 hover:to-emerald-500 hover:shadow-lg hover:shadow-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'loading' ? 'Sending...' : 'Send message'}
          </button>
          <p className="text-xs text-slate-400">
            Or email us directly at <a className="underline hover:text-emerald-200" href="mailto:coryarmer@gmail.com">coryarmer@gmail.com</a>.
          </p>
        </form>
      </main>
    </div>
  );
}
