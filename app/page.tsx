'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MapPin, Users, CheckCircle, Star } from 'lucide-react';
import AdminLoginModal from '@/components/admin-login-modal';
import AvailableGuides from '@/components/available-guides';
import SearchGuides from '@/components/search-guides';

export default function Home() {
  const [showAdminModal, setShowAdminModal] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800" suppressHydrationWarning>
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-border">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            <h1 className="text-lg sm:text-2xl font-bold text-foreground">GuideVerify</h1>
          </div>
          <div className="flex flex-wrap gap-1 sm:gap-3" suppressHydrationWarning>
            <Link href="/guide/login">
              <Button variant="outline" size="sm" className="text-xs sm:text-sm h-8 sm:h-10" suppressHydrationWarning>Guide</Button>
            </Link>
            <Link href="/tourist/login">
              <Button variant="outline" size="sm" className="text-xs sm:text-sm h-8 sm:h-10" suppressHydrationWarning>Tourist</Button>
            </Link>
            <Link href="/guide/signup">
              <Button size="sm" className="text-xs sm:text-sm h-8 sm:h-10" suppressHydrationWarning>Register</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-6 text-balance">
            Become a Verified Travel Guide
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto text-balance">
            Join our platform and connect with tourists. Get verified by our admin team in minutes.
          </p>
          <Link href="/guide/signup">
            <Button size="lg" className="text-sm sm:text-base px-6 sm:px-8 py-4 sm:py-6" suppressHydrationWarning>
              Start Your Journey
            </Button>
          </Link>
        </div>

        {/* Available Guides Section */}
        <div className="mt-12 sm:mt-14 mb-12 sm:mb-14">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2 sm:mb-4 flex items-center justify-center gap-2 flex-wrap">
              <Star className="w-6 h-6 sm:w-8 sm:h-8 text-primary flex-shrink-0" />
              <span>Featured Guides</span>
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Discover our verified and approved guides
            </p>
          </div>

          {/* Search & Filter Section */}
          <div className="mb-10 sm:mb-12">
            <SearchGuides />
          </div>

          {/* Featured Guides Cards */}
          <AvailableGuides />
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-4 sm:gap-6 mb-12 sm:mb-14">
          <Card className="p-5 sm:p-6 border border-border hover:shadow-lg transition-shadow">
            <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-primary mb-3" />
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2 sm:mb-3">Easy Registration</h3>
            <p className="text-sm text-muted-foreground">
              Simple sign-up process with your details and document verification.
            </p>
          </Card>

          <Card className="p-5 sm:p-6 border border-border hover:shadow-lg transition-shadow">
            <Users className="w-10 h-10 sm:w-12 sm:h-12 text-primary mb-3" />
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2 sm:mb-3">Quick Verification</h3>
            <p className="text-sm text-muted-foreground">
              Our admin team reviews your profile. Track your status in real-time.
            </p>
          </Card>

          <Card className="p-5 sm:p-6 border border-border hover:shadow-lg transition-shadow">
            <MapPin className="w-10 h-10 sm:w-12 sm:h-12 text-primary mb-3" />
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2 sm:mb-3">Connect Tourists</h3>
            <p className="text-sm text-muted-foreground">
              Access your dashboard and connect with travelers worldwide.
            </p>
          </Card>
        </div>

        {/* Steps */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 sm:p-8 border border-border mb-8 sm:mb-10">
          <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-6 sm:mb-8 text-center">How It Works</h3>
          <div className="grid md:grid-cols-4 gap-4 sm:gap-6">
            <div className="text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold mx-auto mb-3 flex-shrink-0">
                1
              </div>
              <h4 className="font-semibold text-foreground mb-1 text-sm sm:text-base">Register</h4>
              <p className="text-muted-foreground text-xs sm:text-sm">Sign up with your details</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold mx-auto mb-3 flex-shrink-0">
                2
              </div>
              <h4 className="font-semibold text-foreground mb-1 text-sm sm:text-base">Submit Docs</h4>
              <p className="text-muted-foreground text-xs sm:text-sm">Upload ID and photo</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold mx-auto mb-3 flex-shrink-0">
                3
              </div>
              <h4 className="font-semibold text-foreground mb-1 text-sm sm:text-base">Wait for Review</h4>
              <p className="text-muted-foreground text-xs sm:text-sm">Admin verifies info</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold mx-auto mb-3 flex-shrink-0">
                4
              </div>
              <h4 className="font-semibold text-foreground mb-1 text-sm sm:text-base">Get Verified</h4>
              <p className="text-muted-foreground text-xs sm:text-sm">Start working</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-border">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="grid md:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <div>
              <h4 className="font-semibold text-foreground mb-2 sm:mb-3 text-sm sm:text-base">GuideVerify</h4>
              <p className="text-muted-foreground text-xs sm:text-sm">Connecting verified guides with travelers worldwide.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2 sm:mb-3 text-sm sm:text-base">Quick Links</h4>
              <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                <li>
                  <Link href="/guide/signup" className="text-primary hover:text-primary/80">
                    Register as Guide
                  </Link>
                </li>
                <li>
                  <Link href="/guide/login" className="text-primary hover:text-primary/80">
                    Guide Login
                  </Link>
                </li>
                <li>
                  <Link href="/tourist/signup" className="text-primary hover:text-primary/80">
                    Register as Tourist
                  </Link>
                </li>
                <li>
                  <Link href="/tourist/login" className="text-primary hover:text-primary/80">
                    Tourist Login
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2 sm:mb-3 text-sm sm:text-base">Support</h4>
              <p className="text-muted-foreground text-xs sm:text-sm">Contact: 9550574212</p>
              <button
                onClick={() => setShowAdminModal(true)}
                className="text-xs text-muted-foreground hover:text-foreground mt-2 underline"
                suppressHydrationWarning
              >
                Admin Access
              </button>
            </div>
          </div>
          <div className="border-t border-border pt-6 sm:pt-8 text-center text-muted-foreground text-xs sm:text-sm">
            <p>&copy; 2024 GuideVerify. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <AdminLoginModal open={showAdminModal} onOpenChange={setShowAdminModal} />
    </div>
  );
}
