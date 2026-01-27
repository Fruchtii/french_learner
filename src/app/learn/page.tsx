'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import StudySession from '@/components/StudySession';

export default function LearnPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Home</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">V</span>
            </div>
            <span className="font-semibold text-lg text-slate-800">VerbeMaître</span>
          </div>
        </div>
      </nav>

      {/* Main Content - Centered vertically */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 pt-16 pb-4">
        {/* Header - More compact */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-slate-800 mb-1">
            Verb Trainer
          </h1>
          <p className="text-slate-500 text-sm">
            Master French irregular verb conjugations
          </p>
        </div>

        {/* Study Session Component */}
        <StudySession initialMode="typing" />
      </main>
    </div>
  );
}
