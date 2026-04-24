"use client";

import React, { useState, useEffect } from 'react';
import MarketingCourseCard from '@/components/landing/MarketingCourseCard';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';

interface MarketingCourse {
  id: string;
  title: string;
  description: string;
  image_src: string;
  lessons_count: string;
  level: string;
  price: string;
  button_text: string;
}

const CoursesSection: React.FC = () => {
  const [coursesData, setCoursesData] = useState<MarketingCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      const { data, error } = await supabase
        .from('marketing_courses')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        showError("Marketing kurslarini yuklashda xato.");
        setIsLoading(false);
      } else {
        setCoursesData(data || []);
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <section id="kurslar" className="py-16 sm:py-24 bg-white content-layer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-base text-primary font-semibold tracking-wide uppercase">
            Darsliklarimiz
          </h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Mashhur video kurslarimiz
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Eng talab yuqori bo'lgan fanlar bo'yicha yaratilgan video kurslar orqali bilimingizni kengaytiring.
          </p>
        </div>

        {isLoading ? (
          <p className="text-center mt-12">Kurslar yuklanmoqda...</p>
        ) : (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
            {coursesData.map(course => (
              <MarketingCourseCard
                key={course.id}
                id={course.id}
                imageSrc={course.image_src}
                title={course.title}
                description={course.description}
                lessonsCount={course.lessons_count}
                level={course.level}
                price={course.price}
                buttonText={course.button_text}
                onButtonClick={() => console.log(`${course.title} sotib olish`)}
              />
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <a href="/courses" className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-base font-semibold text-white shadow-md shadow-cyan-200 transition-transform hover:-translate-y-0.5 hover:bg-primary-dark">
            Barcha kurslarni ko'rish
          </a>
        </div>
      </div>
    </section>
  );
};

export default CoursesSection;