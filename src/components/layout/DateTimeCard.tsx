"use client";

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Moon } from 'lucide-react';

const DateTimeCard: React.FC = () => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formattedTime = format(currentDateTime, 'hh:mm');
  const timePeriod = format(currentDateTime, 'a').toUpperCase();
  const formattedDate = format(currentDateTime, 'EEEE, MMMM do');

  return (
    <div className="dark-gradient-card flex items-center px-2 py-1 w-36 sm:w-44 h-9 sm:h-11">
      <Moon className="h-4 w-4 sm:h-5 sm:w-5 text-primary mr-2" />
      <div>
        <p className="text-sm sm:text-base font-bold text-gray-800 leading-tight">
          <span>{formattedTime}</span>
          <span className="text-[10px] sm:text-xs ml-0.5">{timePeriod}</span>
        </p>
        <p className="text-xxs text-gray-500 mt-0.5 truncate max-w-[120px] sm:max-w-[150px]">
          {formattedDate}
        </p>
      </div>
    </div>
  );
};

export default DateTimeCard;