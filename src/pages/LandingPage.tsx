"use client";

import React from 'react';
import LandingPageHeader from '@/components/landing/LandingPageHeader';
import HeroSection from '@/components/landing/HeroSection';
import AboutSection from '@/components/landing/AboutSection';
import ResultsCarousel from '@/components/landing/ResultsCarousel';
import CoursesSection from '@/components/landing/CoursesSection';
import AdvantagesSection from '@/components/landing/AdvantagesSection';
import ContactSection from '@/components/landing/ContactSection';
import LandingFooter from '@/components/landing/LandingFooter';
import ApplicationContactLayout from '@/components/landing/ApplicationContactLayout';
import TariffsSection from '@/components/landing/TariffsSection';
import ScrollFadeIn from '@/components/ui/ScrollFadeIn';

const LandingPage: React.FC = () => {
  return (
    <div className="antialiased relative min-h-screen bg-gradient-to-b from-white via-cyan-50/30 to-white">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-white">
        Kontentga o‘tish
      </a>
      <div id="top" />
      <LandingPageHeader />
      <main id="main-content" className="content-layer">
        <ScrollFadeIn>
          <HeroSection />
        </ScrollFadeIn>

        <ScrollFadeIn>
          <AboutSection />
        </ScrollFadeIn>

        <ScrollFadeIn>
          <ResultsCarousel />
        </ScrollFadeIn>

        <ScrollFadeIn>
          <TariffsSection />
        </ScrollFadeIn>

        <section id="kurslar">
          <ScrollFadeIn>
            <CoursesSection />
          </ScrollFadeIn>
        </section>

        <section id="afzalliklar">
          <ScrollFadeIn>
            <AdvantagesSection />
          </ScrollFadeIn>
        </section>

        <section id="aloqa">
          <ScrollFadeIn>
            <ContactSection />
          </ScrollFadeIn>
        </section>

        <section id="application-form" className="py-16 sm:py-24 bg-white content-layer">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollFadeIn>
              <ApplicationContactLayout />
            </ScrollFadeIn>
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
};

export default LandingPage;