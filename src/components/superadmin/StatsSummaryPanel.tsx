"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, ArrowDown, DollarSign, Users, BookOpen, Mail } from 'lucide-react';

const StatsSummaryPanel: React.FC = () => {
  return (
    <div id="stats-summary" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Jami Daromad Kartochkasi */}
      <Card className="bg-gray-800 p-5 rounded-xl shadow-xl transition duration-300 hover:shadow-2xl border-l-4 border-ferrari-red text-white">
        <CardHeader className="p-0 mb-2">
          <CardTitle className="text-sm font-medium text-gray-400 flex justify-between items-center">
            Jami Daromad <DollarSign className="h-5 w-5 text-ferrari-red" />
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <p className="text-3xl font-bold text-white mt-2">45,670,000 <span className="text-lg font-medium text-gray-300">UZS</span></p>
          <p className="text-sm text-green-500 mt-1 flex items-center">
            <ArrowUp className="w-4 h-4 mr-1" />
            +12.5% (o'tgan oyga nisbatan)
          </p>
        </CardContent>
      </Card>

      {/* Yangi Foydalanuvchilar Kartochkasi */}
      <Card className="bg-gray-800 p-5 rounded-xl shadow-xl transition duration-300 hover:shadow-2xl border-l-4 border-emerald-500 text-white">
        <CardHeader className="p-0 mb-2">
          <CardTitle className="text-sm font-medium text-gray-400 flex justify-between items-center">
            Yangi Foydalanuvchilar <Users className="h-5 w-5 text-emerald-500" />
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <p className="text-3xl font-bold text-white mt-2">1,245</p>
          <p className="text-sm text-red-500 mt-1 flex items-center">
            <ArrowDown className="w-4 h-4 mr-1" />
            -3.1% (o'tgan oyga nisbatan)
          </p>
        </CardContent>
      </Card>

      {/* Faol Kurslar Kartochkasi */}
      <Card className="bg-gray-800 p-5 rounded-xl shadow-xl transition duration-300 hover:shadow-2xl border-l-4 border-amber-500 text-white">
        <CardHeader className="p-0 mb-2">
          <CardTitle className="text-sm font-medium text-gray-400 flex justify-between items-center">
            Faol Kurslar <BookOpen className="h-5 w-5 text-amber-500" />
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <p className="text-3xl font-bold text-white mt-2">45</p>
          <p className="text-sm text-gray-300 mt-1">2 ta yangi kurs qo'shildi</p>
        </CardContent>
      </Card>

      {/* Kutilayotgan Arizalar Kartochkasi */}
      <Card className="bg-gray-800 p-5 rounded-xl shadow-xl transition duration-300 hover:shadow-2xl border-l-4 border-rose-500 text-white">
        <CardHeader className="p-0 mb-2">
          <CardTitle className="text-sm font-medium text-gray-400 flex justify-between items-center">
            Kutilayotgan Arizalar <Mail className="h-5 w-5 text-rose-500" />
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <p className="text-3xl font-bold text-white mt-2">18</p>
          <p className="text-sm text-gray-300 mt-1">Hozirda ko'rib chiqilmoqda</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsSummaryPanel;