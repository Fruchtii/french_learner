'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import VerbQuiz from '@/components/VerbQuiz';

export default function LearnPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">V</span>
            </div>
            <span className="font-semibold text-xl text-slate-800">VerbeMaître</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              Verb Trainer
            </h1>
            <p className="text-slate-600">
              Practice conjugating French irregular verbs
            </p>
          </div>

          {/* Quiz Component */}
          <VerbQuiz />
        </div>
      </main>
    </div>
  );
}
