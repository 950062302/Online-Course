import React from 'react';
import TrueFocus from '@/components/TrueFocus';
import { ArrowRight, Sparkles, Star } from 'lucide-react';

const HeroSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-white via-cyan-50/60 to-white py-16 sm:py-24 lg:py-32 content-layer">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(26,255,255,0.18),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(26,255,255,0.12),transparent_35%)]" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white/80 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm backdrop-blur">
              <Sparkles className="h-4 w-4 text-primary" />
              Premium onlayn ta'lim muhit
            </div>

            <h1 className="mt-6 text-3xl sm:text-5xl lg:text-7xl font-black tracking-tight text-gray-950 leading-tight">
              <span className="bg-gradient-to-r from-primary via-cyan-400 to-cyan-500 bg-clip-text text-transparent">EduDars.uz</span>
              <br />
              kelajagingizni tezroq quradi
            </h1>

            <p className="mt-6 text-base sm:text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Zamonaviy kurslar, aniq natijalar va qulay platforma bilan bilim olishni yanada samarali va yoqimli qiling.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <a
                href="#application-form"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-4 text-base font-semibold text-white shadow-lg shadow-cyan-200 transition-transform duration-300 hover:-translate-y-1 hover:bg-primary-dark"
              >
                Ariza qoldirish
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#kurslar"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-cyan-200 bg-white px-6 py-4 text-base font-semibold text-gray-900 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:border-cyan-300 hover:bg-cyan-50"
              >
                Kurslarni ko‘rish
              </a>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-3 text-sm text-gray-600">
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm border border-gray-100">
                <Star className="h-4 w-4 text-amber-400" />
                Kuchli o‘quv tizimi
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm border border-gray-100">
                <Star className="h-4 w-4 text-amber-400" />
                Mobilga mos
              </div>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-xl rounded-[2rem] border border-cyan-100 bg-white p-4 shadow-[0_25px_80px_rgba(26,255,255,0.18)]">
              <div className="rounded-[1.5rem] bg-gradient-to-br from-primary to-cyan-500 p-8 sm:p-10 text-white min-h-[340px] flex items-center justify-center">
                <TrueFocus
                  sentence="Online Ta'lim"
                  blurAmount={3}
                  borderColor="#FFFFFF"
                  glowColor="rgba(255, 255, 255, 0.6)"
                  animationDuration={0.8}
                  pauseBetweenAnimations={1.5}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;