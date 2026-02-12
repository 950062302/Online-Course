"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Star } from 'lucide-react';

const data = [
  { name: 'Yan', uv: 4000, pv: 2400, amt: 2400 },
  { name: 'Fev', uv: 3000, pv: 1398, amt: 2210 },
  { name: 'Mar', uv: 2000, pv: 9800, amt: 2290 },
  { name: 'Apr', uv: 2780, pv: 3908, amt: 2000 },
  { name: 'May', uv: 1890, pv: 4800, amt: 2181 },
  { name: 'Iyun', uv: 2390, pv: 3800, amt: 2500 },
  { name: 'Iyul', uv: 3490, pv: 4300, amt: 2100 },
];

const ReportsAndAnalyticsPanel: React.FC = () => {
  return (
    <Card className="shadow-lg bg-gray-800 text-white">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-white">Hisobotlar va Tahlil</CardTitle>
        <CardDescription className="text-gray-400">
          Platformaning barcha asosiy ko'rsatkichlari (KPI) chuqur tahlil qilinadi va vizual hisobotlar taqdim etiladi.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tahliliy Karta 1: Foydalanuvchilarning Biriktirilishi (Retention) */}
            <Card className="bg-gray-900 p-5 rounded-lg border-2 border-dashed border-ferrari-red text-white">
              <CardTitle className="text-lg font-bold text-ferrari-red mb-3 flex items-center">
                <Users className="h-5 w-5 mr-2" /> Foydalanuvchilarning Biriktirilishi (Retention)
              </CardTitle>
              <p className="text-gray-300">O'quvchilarning kursni boshlagandan keyin necha foizi uni tugatishi bo'yicha hisobot.</p>
              <span className="inline-block mt-3 text-2xl font-extrabold text-green-500">78%</span>
              <p className="text-sm text-gray-400">Global o'rtacha ko'rsatkichga qaraganda +5% yuqori</p>
            </Card>

            {/* Tahliliy Karta 2: Kurs Samadorligi Ratingi */}
            <Card className="bg-gray-900 p-5 rounded-lg border-2 border-dashed border-ferrari-red text-white">
              <CardTitle className="text-lg font-bold text-ferrari-red mb-3 flex items-center">
                <Star className="h-5 w-5 mr-2" /> Kurs Samadorligi Ratingi
              </CardTitle>
              <p className="text-gray-300">Har bir kursning o'quvchilar tomonidan berilgan umumiy reytingi va baholari.</p>
              <span className="inline-block mt-3 text-2xl font-extrabold text-amber-500">4.7 / 5.0</span>
              <p className="text-sm text-gray-400">Eng yaxshi natijani ko'rsatayotgan kurs: "To'liq Grammatika Kursi"</p>
            </Card>
          </div>

          {/* Grafik: Oylik Daromadlar */}
          <Card className="bg-gray-900 p-5 rounded-xl shadow-md border border-gray-700 text-white">
            <CardTitle className="text-xl font-semibold text-white mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-blue-500" /> Oylik Daromadlar Trendi
            </CardTitle>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={data}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                  <XAxis dataKey="name" stroke="#d1d5db" />
                  <YAxis stroke="#d1d5db" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#374151', border: '1px solid #4b5563', borderRadius: '8px', color: 'white' }}
                    labelStyle={{ color: 'white', fontWeight: 'bold' }}
                    itemStyle={{ color: 'white' }}
                  />
                  <Line type="monotone" dataKey="pv" stroke="#FF2800" activeDot={{ r: 8 }} name="O'tgan oy" />
                  <Line type="monotone" dataKey="uv" stroke="#10b981" activeDot={{ r: 8 }} name="Joriy oy" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="mt-8 p-4 bg-red-900 border border-red-800 rounded-lg text-sm text-red-200 font-medium">
            Bu bo'limga interaktiv diagrammalar, filtrlash imkoniyatlari va jadvallar qo'shilishi dizaynni yanada qimmatbaho qiladi.
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportsAndAnalyticsPanel;