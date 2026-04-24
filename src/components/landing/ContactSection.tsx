"use client";

import React from 'react';
// ScrollFloat komponenti endi bu yerda ishlatilmaydi

const ContactSection: React.FC = () => {
  return (
    <section id="aloqa" className="bg-white py-16 sm:py-24 content-layer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Bugundan boshlang!
        </h2>
        <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
          Agar savollaringiz bo‘lsa, bemalol biz bilan bog‘laning yoki istalgan kursni sinab ko‘ring.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          <a href="#kurslar" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-semibold rounded-full shadow-sm text-gray-900 bg-cyan-50 hover:bg-cyan-100 transition duration-300 transform hover:scale-105">
            Barcha kurslar
          </a>
          <a href="tel:+998931273300" className="inline-flex items-center justify-center px-6 py-3 border border-primary text-base font-semibold rounded-full text-primary hover:bg-primary hover:text-white transition duration-300 transform hover:scale-105">
            Biz bilan bog‘lanish
          </a>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;