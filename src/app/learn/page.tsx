'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import StudySession from '@/components/StudySession';
import AuthButton from '@/components/AuthButton';
import VokabLogo from '@/components/VokabLogo';
import ThemeToggle from '@/components/ThemeToggle';

export default function LearnPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Home</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-2">
              <VokabLogo variant="dark" size={28} />
            </Link>
            <ThemeToggle />
            <AuthButton />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 pt-16 pb-4">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            French Verb Conjugation
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Master irregular verbs with 3 interactive study modes
          </p>
        </div>

        {/* Study Session Component */}
        <StudySession initialMode="typing" />
      </main>
    </div>
  );
}
