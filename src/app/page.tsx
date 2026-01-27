'use client';

import { BookOpen, Brain, Trophy, ChevronRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import AuthButton from '@/components/AuthButton';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-base">vk</span>
            </div>
            <span className="font-semibold text-xl text-slate-800">vokab</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-slate-600 hover:text-slate-900 transition-colors font-medium"
            >
              My Decks
            </Link>
            <AuthButton />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              <span>Powered by Spaced Repetition</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              Master Your
              <span className="text-blue-600"> Flashcards</span>
            </h1>

            <p className="text-xl text-slate-600 mb-10 leading-relaxed">
              Learn vocabulary effectively with our intelligent spaced repetition system.
              Track your progress and master your cards across multiple study modes.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition-all hover:shadow-lg hover:shadow-blue-600/25"
              >
                Start Learning
                <ChevronRight className="w-5 h-5" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center justify-center gap-2 bg-white text-slate-700 px-8 py-4 rounded-xl text-lg font-semibold border border-slate-200 hover:border-slate-300 transition-all"
              >
                Learn More
              </a>
            </div>
          </div>

          {/* Preview Card */}
          <div className="mt-16 max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
              <div className="bg-slate-800 px-6 py-4 flex items-center gap-3">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <span className="text-slate-400 text-sm">vokab</span>
              </div>
              <div className="p-8">
                <div className="text-center">
                  <p className="text-slate-500 text-sm uppercase tracking-wide mb-2">Présent</p>
                  <h3 className="text-3xl font-bold text-slate-800 mb-1">faire</h3>
                  <p className="text-slate-500 mb-6">to do / to make</p>

                  <div className="bg-slate-50 rounded-xl p-6 mb-6">
                    <p className="text-lg text-slate-700 mb-3">
                      Complete: <span className="font-semibold">nous ___</span>
                    </p>
                    <div className="flex justify-center">
                      <div className="bg-white border-2 border-blue-500 rounded-lg px-6 py-3 text-xl font-mono">
                        faisons<span className="animate-pulse">|</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center gap-2">
                    {['é', 'è', 'ê', 'à', 'ù', 'ç', 'œ'].map((char) => (
                      <button
                        key={char}
                        className="w-10 h-10 bg-slate-100 rounded-lg font-mono text-lg hover:bg-slate-200 transition-colors"
                      >
                        {char}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
            Why Choose vokab
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Brain className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                Spaced Repetition
              </h3>
              <p className="text-slate-600">
                Our SRS algorithm shows you cards right when you&apos;re about to forget them,
                maximizing retention with minimal effort.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                Multiple Study Modes
              </h3>
              <p className="text-slate-600">
                Choose from Typing, Flashcard, or ProDeck modes to match your learning
                style and maximize retention.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                Track Your Mastery
              </h3>
              <p className="text-slate-600">
                Watch your progress grow with detailed stats showing mastery
                percentage for each card and deck.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-400 mb-2">3</div>
              <div className="text-slate-400">Study Modes</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-400 mb-2">Smart</div>
              <div className="text-slate-400">Spaced Repetition</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-400 mb-2">Fast</div>
              <div className="text-slate-400">Progress Tracking</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Ready to Master Your Flashcards?
          </h2>
          <p className="text-xl text-slate-600 mb-8">
            Start learning smarter with vokab today.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition-all hover:shadow-lg hover:shadow-blue-600/25"
          >
            Start Learning Free
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-slate-200">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-xs">vk</span>
            </div>
            <span className="font-medium text-slate-700">vokab</span>
          </div>
          <p className="text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} vokab. Built for learners.
          </p>
        </div>
      </footer>
    </div>
  );
}
