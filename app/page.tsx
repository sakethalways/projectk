'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MapPin, Users, CheckCircle, Star, Globe, TrendingUp } from 'lucide-react';
import AdminLoginModal from '@/components/admin-login-modal';
import AvailableGuides from '@/components/available-guides';
import SearchGuides from '@/components/search-guides';

export default function Home() {
  const [showAdminModal, setShowAdminModal] = useState(false);

  return (
    <div className="min-h-screen bg-cream-100 dark:bg-dark-bg" suppressHydrationWarning>
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white dark:bg-dark-surface border-b border-emerald-200 dark:border-slate-700 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex justify-between items-center gap-2">
          {/* Logo */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-dark-text">GUIDO</h1>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
            <Link href="/guide/login">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs sm:text-sm h-9 sm:h-10 px-3 sm:px-4 text-gray-700 dark:text-dark-text hover:bg-emerald-50 dark:hover:bg-slate-700"
                suppressHydrationWarning
              >
                Guide Login
              </Button>
            </Link>
            <Link href="/tourist/login">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs sm:text-sm h-9 sm:h-10 px-3 sm:px-4 text-gray-700 dark:text-dark-text hover:bg-emerald-50 dark:hover:bg-slate-700"
                suppressHydrationWarning
              >
                Tourist Login
              </Button>
            </Link>
            <Link href="/guide/signup">
              <Button
                size="sm"
                className="text-xs sm:text-sm h-9 sm:h-10 px-3 sm:px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-medium"
                suppressHydrationWarning
              >
                Register
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 sm:py-16 lg:py-20">
        {/* Decorative background shapes */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-100 rounded-full blur-3xl opacity-20 dark:opacity-10"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-100 rounded-full blur-3xl opacity-20 dark:opacity-10"></div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-block mb-4 sm:mb-6">
              <span className="inline-block px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/50">
                <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">✨ Discover Local Experiences</span>
              </span>
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-dark-text mb-4 sm:mb-6 leading-tight">
              Connect with Local Guides
            </h2>

            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-12 sm:mb-16 max-w-2xl mx-auto leading-relaxed">
              Experience authentic travel with verified local guides. Book tours, explore hidden gems, and create unforgettable memories.
            </p>

            {/* Hero Illustration */}
            <div className="flex justify-center mb-12 sm:mb-16">
              <div className="relative w-full max-w-md">
                <Image
                  src="/guido-hero.png"
                  alt="GUIDO Hero Illustration"
                  width={500}
                  height={500}
                  priority
                  className="w-full h-auto drop-shadow-lg"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
              <Link href="/guide/signup">
                <Button
                  size="lg"
                  className="h-12 sm:h-14 px-6 sm:px-8 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg active:scale-95"
                  suppressHydrationWarning
                >
                  Become a Guide
                </Button>
              </Link>
              <Link href="/tourist/signup">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 sm:h-14 px-6 sm:px-8 border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800 font-semibold rounded-lg"
                  suppressHydrationWarning
                >
                  Book a Tour
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-16 sm:mb-20">
            <Card className="bg-white dark:bg-dark-surface border border-emerald-100 dark:border-slate-700 p-4 sm:p-6 rounded-lg text-center">
              <div className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">500+</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">Verified Guides</div>
            </Card>
            <Card className="bg-white dark:bg-dark-surface border border-emerald-100 dark:border-slate-700 p-4 sm:p-6 rounded-lg text-center">
              <div className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">1K+</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">Happy Tourists</div>
            </Card>
            <Card className="bg-white dark:bg-dark-surface border border-emerald-100 dark:border-slate-700 p-4 sm:p-6 rounded-lg text-center">
              <div className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">4.8★</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">Avg Rating</div>
            </Card>
            <Card className="bg-white dark:bg-dark-surface border border-emerald-100 dark:border-slate-700 p-4 sm:p-6 rounded-lg text-center">
              <div className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">25+</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">Cities</div>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Guides Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-dark-text mb-3 sm:mb-4 flex items-center justify-center gap-3 flex-wrap">
            <Star className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-500 flex-shrink-0" />
            <span>Featured Guides</span>
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Check out some of our most-rated and verified guides
          </p>
        </div>

        {/* Search & Filter */}
        <div className="mb-10 sm:mb-12">
          <SearchGuides />
        </div>

        {/* Guides Grid */}
        <AvailableGuides />
      </section>

      {/* Features Section */}
      <section className="bg-white dark:bg-dark-surface py-12 sm:py-16 lg:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-dark-text mb-3 sm:mb-4">Why Choose GUIDO?</h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Everything you need for authentic travel experiences
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            <Card className="bg-cream-100 dark:bg-slate-800 border border-emerald-100 dark:border-slate-700 p-6 sm:p-8 rounded-lg hover:shadow-lg transition-shadow">
              <CheckCircle className="w-12 h-12 text-emerald-500 mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-dark-text mb-3">Verified Guides</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                All guides undergo thorough verification to ensure your safety and the quality of your experience.
              </p>
            </Card>

            <Card className="bg-cream-100 dark:bg-slate-800 border border-emerald-100 dark:border-slate-700 p-6 sm:p-8 rounded-lg hover:shadow-lg transition-shadow">
              <Users className="w-12 h-12 text-emerald-500 mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-dark-text mb-3">Local Experts</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Connect with local experts who know hidden gems and can offer authentic travel experiences.
              </p>
            </Card>

            <Card className="bg-cream-100 dark:bg-slate-800 border border-emerald-100 dark:border-slate-700 p-6 sm:p-8 rounded-lg hover:shadow-lg transition-shadow">
              <TrendingUp className="w-12 h-12 text-emerald-500 mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-dark-text mb-3">Easy Booking</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Simple and secure booking process with transparent pricing and instant confirmation.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-dark-text mb-3 sm:mb-4">How It Works</h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Get started as a guide or tourist in just a few easy steps
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-4 sm:gap-6">
          <div className="relative">
            {/* Connect line */}
            <div className="hidden md:block absolute top-12 left-1/2 w-full h-1 bg-gradient-to-r from-emerald-300 to-emerald-100 dark:from-emerald-700 dark:to-emerald-900 transform -translate-y-1/2"></div>

            <div className="relative bg-white dark:bg-dark-surface border-2 border-emerald-300 dark:border-emerald-700 rounded-lg p-6 text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4 flex-shrink-0 relative z-10">
                1
              </div>
              <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-dark-text mb-2">Sign Up</h4>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Create your account with email</p>
            </div>
          </div>

          <div className="relative">
            <div className="hidden md:block absolute top-12 left-1/2 w-full h-1 bg-gradient-to-r from-emerald-300 to-emerald-100 dark:from-emerald-700 dark:to-emerald-900 transform -translate-y-1/2"></div>

            <div className="relative bg-white dark:bg-dark-surface border-2 border-emerald-300 dark:border-emerald-700 rounded-lg p-6 text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4 flex-shrink-0 relative z-10">
                2
              </div>
              <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-dark-text mb-2">Complete Profile</h4>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Add your details & documents</p>
            </div>
          </div>

          <div className="relative">
            <div className="hidden md:block absolute top-12 left-1/2 w-full h-1 bg-gradient-to-r from-emerald-300 to-emerald-100 dark:from-emerald-700 dark:to-emerald-900 transform -translate-y-1/2"></div>

            <div className="relative bg-white dark:bg-dark-surface border-2 border-emerald-300 dark:border-emerald-700 rounded-lg p-6 text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4 flex-shrink-0 relative z-10">
                3
              </div>
              <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-dark-text mb-2">Get Verified</h4>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Admin reviews your profile</p>
            </div>
          </div>

          <div className="relative">
            <div className="relative bg-white dark:bg-dark-surface border-2 border-emerald-300 dark:border-emerald-700 rounded-lg p-6 text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4 flex-shrink-0 relative z-10">
                4
              </div>
              <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-dark-text mb-2">Start Earning</h4>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Accept bookings & earn</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative bg-gradient-to-r from-emerald-500 to-emerald-600 dark:from-emerald-700 dark:to-emerald-900 py-12 sm:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6">Ready to Join?</h2>
          <p className="text-base sm:text-lg text-emerald-50 mb-8 sm:mb-10">
            Start your journey with GUIDO today. Whether you're a guide or a tourist, we've got you covered.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link href="/guide/signup">
              <Button
                size="lg"
                className="h-12 sm:h-14 px-6 sm:px-8 bg-white text-emerald-600 hover:bg-emerald-50 font-semibold"
                suppressHydrationWarning
              >
                Become a Guide
              </Button>
            </Link>
            <Link href="/tourist/signup">
              <Button
                variant="outline"
                size="lg"
                className="h-12 sm:h-14 px-6 sm:px-8 border-2 border-white text-white hover:bg-white/10 font-semibold"
                suppressHydrationWarning
              >
                Book a Tour
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-dark-surface border-t border-emerald-100 dark:border-slate-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-6 mb-8 sm:mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-gray-900 dark:text-dark-text">GUIDO</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Connecting verified guides with travelers worldwide for authentic local experiences.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-dark-text mb-4 text-sm">For Guides</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/guide/signup" className="text-sm text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400">
                    Register as Guide
                  </Link>
                </li>
                <li>
                  <Link href="/guide/login" className="text-sm text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400">
                    Guide Login
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-dark-text mb-4 text-sm">For Tourists</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/tourist/signup" className="text-sm text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400">
                    Register as Tourist
                  </Link>
                </li>
                <li>
                  <Link href="/tourist/login" className="text-sm text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400">
                    Tourist Login
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-dark-text mb-4 text-sm">Support</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Contact: +91 9550574212</p>
              <button
                onClick={() => setShowAdminModal(true)}
                className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300"
                suppressHydrationWarning
              >
                Admin Access →
              </button>
            </div>
          </div>

          <div className="border-t border-emerald-100 dark:border-slate-700 pt-8 sm:pt-10">
            <p className="text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              &copy; 2024 GUIDO. All rights reserved. | <a href="#" className="hover:text-emerald-600 dark:hover:text-emerald-400">Privacy</a> | <a href="#" className="hover:text-emerald-600 dark:hover:text-emerald-400">Terms</a>
            </p>
          </div>
        </div>
      </footer>

      <AdminLoginModal open={showAdminModal} onOpenChange={setShowAdminModal} />
    </div>
  );
}
