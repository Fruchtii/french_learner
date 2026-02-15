'use client';

import { Brain, ChevronRight, Sparkles, Layers, Keyboard, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import AuthButton from '@/components/AuthButton';
import VokabLogo from '@/components/VokabLogo';
import ThemeToggle from '@/components/ThemeToggle';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-slate-950/80 backdrop-blur-xl border-b border-white/5 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <VokabLogo variant="light" size={32} />
          <div className="flex items-center gap-5">
            <Link
              href="/dashboard"
              className="text-slate-400 hover:text-white transition-colors font-medium text-sm"
            >
              My Decks
            </Link>
            <ThemeToggle />
            <AuthButton />
          </div>
        </div>
      </nav>

      {/* Ambient background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/8 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-600/8 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl" />
      </div>

      {/* Hero Section */}
      <section className="relative pt-36 pb-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            {/* Badge */}
            <div className="animate-slideUp inline-flex items-center gap-2 bg-white/5 border border-white/10 text-indigo-300 px-4 py-2 rounded-full text-sm font-medium mb-8 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Spaced Repetition System</span>
            </div>

            {/* Main heading */}
            <h1 className="animate-slideUp-d1 text-5xl md:text-7xl font-extrabold mb-6 leading-[1.1] tracking-tight">
              Learn smarter,{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
                not harder
              </span>
            </h1>

            {/* Subtitle */}
            <p className="animate-slideUp-d2 text-lg md:text-xl text-slate-400 mb-10 leading-relaxed max-w-2xl mx-auto">
              Master vocabulary with intelligent spaced repetition.
              Three study modes, persistent progress, and a clean interface
              designed to keep you focused.
            </p>

            {/* CTA Buttons */}
            <div className="animate-slideUp-d3 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/dashboard"
                className="group inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-indigo-500 transition-all hover:shadow-xl hover:shadow-indigo-600/20 hover:-translate-y-0.5"
              >
                Start Learning
                <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center justify-center gap-2 bg-white/5 text-slate-300 px-8 py-4 rounded-xl text-lg font-semibold border border-white/10 hover:bg-white/10 hover:text-white transition-all"
              >
                See how it works
              </a>
            </div>
          </div>

          {/* Interactive Preview Card */}
          <div className="animate-slideUp-d4 mt-20 max-w-2xl mx-auto">
            <div className="relative">
              {/* Glow behind card */}
              <div className="absolute -inset-4 bg-gradient-to-r from-indigo-600/20 via-violet-600/20 to-purple-600/20 rounded-3xl blur-2xl opacity-60" />

              <div className="relative bg-slate-900 rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                {/* Terminal-style header */}
                <div className="bg-slate-800/80 px-5 py-3 flex items-center gap-3 border-b border-white/5">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                  </div>
                  <span className="text-slate-500 text-xs font-mono ml-2">vokab / study</span>
                </div>

                <div className="p-8">
                  <div className="text-center">
                    {/* Tense badge */}
                    <div className="inline-flex items-center gap-1.5 bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wider mb-4 border border-indigo-500/20">
                      Présent
                    </div>

                    <h3 className="text-4xl font-bold text-white mb-1">faire</h3>
                    <p className="text-slate-500 text-sm mb-8">to do / to make</p>

                    <div className="bg-slate-800/50 rounded-xl p-6 mb-6 border border-white/5">
                      <p className="text-base text-slate-400 mb-4">
                        Conjugate for <span className="font-semibold text-white">nous</span>
                      </p>
                      <div className="flex justify-center">
                        <div className="bg-slate-950/50 border-2 border-indigo-500/40 rounded-lg px-8 py-3 text-xl font-mono text-white inline-flex items-center">
                          faisons<span className="ml-0.5 w-0.5 h-6 bg-indigo-400 animate-pulse rounded-full"></span>
                        </div>
                      </div>
                    </div>

                    {/* Accent buttons */}
                    <div className="flex justify-center gap-2">
                      {['é', 'è', 'ê', 'à', 'ù', 'ç', 'œ'].map((char) => (
                        <div
                          key={char}
                          className="w-9 h-9 bg-slate-800 rounded-lg font-mono text-sm text-slate-300 flex items-center justify-center border border-white/5"
                        >
                          {char}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
              Three ways to study
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Each mode targets a different level of recall depth.
              Mix and match based on your confidence.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Typing Mode */}
            <div className="group relative bg-slate-900/50 rounded-2xl p-8 border border-white/5 hover:border-blue-500/30 transition-all duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-b from-blue-600/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-5 border border-blue-500/20 group-hover:shadow-lg group-hover:shadow-blue-500/10 transition-shadow">
                  <Keyboard className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Typing
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Active recall at its best. Type the answer from memory
                  with instant feedback on spelling mistakes.
                </p>
              </div>
            </div>

            {/* Flashcard Mode */}
            <div className="group relative bg-slate-900/50 rounded-2xl p-8 border border-white/5 hover:border-slate-400/30 transition-all duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-b from-slate-400/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-12 h-12 bg-slate-500/10 rounded-xl flex items-center justify-center mb-5 border border-slate-500/20 group-hover:shadow-lg group-hover:shadow-slate-400/10 transition-shadow">
                  <Layers className="w-6 h-6 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Flashcard
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Classic reveal-and-grade. Tap to see the answer, then
                  honestly rate whether you knew it.
                </p>
              </div>
            </div>

            {/* ProDeck Mode */}
            <div className="group relative bg-slate-900/50 rounded-2xl p-8 border border-white/5 hover:border-purple-500/30 transition-all duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-b from-purple-600/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-5 border border-purple-500/20 group-hover:shadow-lg group-hover:shadow-purple-500/10 transition-shadow">
                  <Sparkles className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  ProDeck
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Progressive reveal for deep learning. Letters appear
                  gradually so you can test partial recall.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-28 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/20 to-transparent" />
        <div className="max-w-5xl mx-auto relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
              Built on science
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              The Leitner Box system optimizes your review schedule automatically.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            {[
              { box: 0, label: 'New / Wrong', interval: 'Immediate', color: 'from-red-500/20 to-red-600/5', border: 'border-red-500/20', text: 'text-red-400' },
              { box: 1, label: 'Learning', interval: '1 minute', color: 'from-amber-500/20 to-amber-600/5', border: 'border-amber-500/20', text: 'text-amber-400' },
              { box: 2, label: 'Familiar', interval: '10 minutes', color: 'from-blue-500/20 to-blue-600/5', border: 'border-blue-500/20', text: 'text-blue-400' },
              { box: 3, label: 'Mastered', interval: '24 hours', color: 'from-green-500/20 to-green-600/5', border: 'border-green-500/20', text: 'text-green-400' },
            ].map((item, i) => (
              <div key={i} className={`bg-gradient-to-b ${item.color} rounded-xl p-5 border ${item.border}`}>
                <div className={`text-3xl font-bold ${item.text} mb-1`}>{item.box}</div>
                <div className="text-white font-semibold text-sm mb-1">{item.label}</div>
                <div className="text-slate-500 text-xs">Review after {item.interval}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <div className="flex items-center gap-3 text-slate-500 text-sm">
              <span>Get it right</span>
              <ArrowRight className="w-4 h-4" />
              <span>Moves up a box</span>
              <span className="mx-2 text-slate-700">|</span>
              <span>Get it wrong</span>
              <ArrowRight className="w-4 h-4" />
              <span>Back to Box 0</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl font-extrabold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-2">3</div>
              <div className="text-slate-500 text-sm font-medium">Study Modes</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-extrabold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent mb-2">
                <Brain className="w-12 h-12 inline text-indigo-400" />
              </div>
              <div className="text-slate-500 text-sm font-medium">Spaced Repetition</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-extrabold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent mb-2">&infin;</div>
              <div className="text-slate-500 text-sm font-medium">Custom Decks</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center relative">
          <div className="absolute -inset-12 bg-gradient-to-r from-indigo-600/10 via-violet-600/10 to-purple-600/10 rounded-3xl blur-3xl" />
          <div className="relative bg-slate-900/50 rounded-2xl p-12 border border-white/5">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
              Ready to start?
            </h2>
            <p className="text-lg text-slate-400 mb-8">
              Create your first deck or study built-in French verbs.
            </p>
            <Link
              href="/dashboard"
              className="group inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-indigo-500 transition-all hover:shadow-xl hover:shadow-indigo-600/20 hover:-translate-y-0.5"
            >
              Open Dashboard
              <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <VokabLogo variant="light" size={24} />
          <p className="text-slate-600 text-xs">
            &copy; {new Date().getFullYear()} vokab. Built for learners.
          </p>
        </div>
      </footer>
    </div>
  );
}
