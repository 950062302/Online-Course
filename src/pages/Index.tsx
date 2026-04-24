"use client";

import React from 'react';
import LandingPageHeader from '@/components/landing/LandingPageHeader';
import HeroSection from '@/components/landing/HeroSection';
import AboutSection from '@/components/landing/AboutSection';
import ResultsCarousel from '@/components/landing/ResultsCarousel';
import TariffsSection from '@/components/landing/TariffsSection';
import CoursesSection from '@/components/landing/CoursesSection';
import AdvantagesSection from '@/components/landing/AdvantagesSection';
import ContactSection from '@/components/landing/ContactSection';
import ApplicationContactLayout from '@/components/landing/ApplicationContactLayout';
import LandingFooter from '@/components/landing/LandingFooter';
import ScrollFadeIn from '@/components/ui/ScrollFadeIn';

const Index: React.FC = () => {
  return (
    <div className="antialiased relative min-h-screen">
      <LandingPageHeader />
      <main className="content-layer">
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

        <ScrollFadeIn>
          <CoursesSection />
        </ScrollFadeIn>

        <ScrollFadeIn>
          <AdvantagesSection />
        </ScrollFadeIn>

        <ScrollFadeIn>
          <ContactSection />
        </ScrollFadeIn>

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

export default Index;