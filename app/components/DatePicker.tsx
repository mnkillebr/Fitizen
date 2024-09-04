import React, { useEffect, useState } from "react";
import { format, addYears, subYears, addMonths, subMonths, addWeeks, subWeeks, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, eachWeekOfInterval, isSameMonth, isSameDay, isSameWeek, parse } from "date-fns";
import { Popover, PopoverButton, /*PopoverContent, PopoverTrigger,*/ PopoverPanel, useClose } from "@headlessui/react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronDoubleLeft, ChevronRight, ChevronDoubleRight } from "images/icons";
import { Button } from "./form";
import clsx from "clsx";

interface DatePickerProps {
  currentDate: Date;
  view: 'monthly' | 'weekly' | 'daily';
  onDateChange: (date: Date) => void;
  inForm?: boolean;
}

const DatePicker: React.FC<DatePickerProps> = ({ currentDate, view, onDateChange, inForm }) => {
  const [pickerDate, setPickerDate] = useState(currentDate);
  const [manualInput, setManualInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPickerDate(currentDate);
    }
  }, [isOpen, currentDate]);

  const navigateYear = (direction: 'prev' | 'next') => {
    setPickerDate(direction === 'prev' ? subYears(pickerDate, 1) : addYears(pickerDate, 1));
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setPickerDate(direction === 'prev' ? subMonths(pickerDate, 1) : addMonths(pickerDate, 1));
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setPickerDate(direction === 'prev' ? subWeeks(pickerDate, 1) : addWeeks(pickerDate, 1));
  };

  const handleMonthSelect = (month: number) => {
    const newDate = new Date(pickerDate.getFullYear(), month, 1);
    onDateChange(newDate);
  };

  const handleWeekSelect = (week: Date) => {
    onDateChange(week);
  };

  const handleDaySelect = (day: Date) => {
    onDateChange(day);
  };

  const handleManualInput = () => {
    try {
      const parsedDate = parse(manualInput, 'd MMMM yyyy', new Date());
      onDateChange(parsedDate);
    } catch (error) {
      console.error('Invalid date format');
    }
  };

  const renderMonthlyPicker = () => {
    const months = eachMonthOfYear(pickerDate);
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <Button onClick={() => navigateYear('prev')}>
            <ChevronDoubleLeft className="h-4 w-4" />
          </Button>
          <span className="text-lg font-bold">{format(pickerDate, 'yyyy')}</span>
          <Button onClick={() => navigateYear('next')}>
            <ChevronDoubleRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {months.map((month, index) => (
            <Button
              key={month.toString()}
              onClick={() => handleMonthSelect(index)}
              className={clsx(
                isSameMonth(month, currentDate) ? "bg-blue-500 text-white" : ""
              )}
            >
              {format(month, 'MMM')}
            </Button>
          ))}
        </div>
      </div>
    );
  };

  const renderWeeklyPicker = () => {
    const monthStart = startOfMonth(pickerDate);
    const monthEnd = endOfMonth(pickerDate);
    const weeks = eachWeekOfInterval({ start: monthStart, end: monthEnd });

    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <Button onClick={() => navigateYear('prev')}>
            <ChevronDoubleLeft className="h-4 w-4" />
          </Button>
          <Button onClick={() => navigateMonth('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-lg font-bold">{format(pickerDate, 'MMMM yyyy')}</span>
          <Button onClick={() => navigateMonth('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button onClick={() => navigateYear('next')}>
            <ChevronDoubleRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(day => (
            <div key={day} className="text-center font-bold">{day}</div>
          ))}
        </div>
        {weeks.map(week => {
          const days = eachDayOfInterval({
            start: startOfWeek(week),
            end: endOfWeek(week)
          });
          return (
            <div
              key={week.toString()}
              className={clsx(
                "grid grid-cols-7 gap-1",
                view === "weekly" && isSameWeek(week, currentDate) ? "bg-blue-200" : "",
                view === "weekly" ? "hover:bg-blue-100" : ""
              )}
            >
              {days.map(day => (
                <Button
                  key={day.toString()}
                  onClick={() => handleWeekSelect(day)}
                  className={clsx(
                    isSameDay(day, currentDate) ? "bg-blue-500 text-white" : "",
                    isSameMonth(day, pickerDate) ? "" : "opacity-30",
                    view === "daily" ? "hover:bg-blue-100" : ""
                  )}
                >
                  {format(day, 'd')}
                </Button>
              ))}
            </div>
          );
        })}
      </div>
    );
  };

  const renderDailyPicker = () => {
    return (
      <div>
        <div className="mb-4">
          <input
            type="text"
            placeholder="DD Month YYYY"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleManualInput()}
          />
        </div>
        {renderWeeklyPicker()}
      </div>
    );
  };

  return (
    <Popover>
      {({ open }) => (
        <>
          <PopoverButton
            className={clsx(
              inForm ? "" : "text-xl font-bold outline-none"
            )}
            onClick={() => setIsOpen(!open)}
          >
            {inForm ? format(currentDate, "MM/dd/yyyy") : format(currentDate, "MMMM yyyy")}
          </PopoverButton>
          <AnimatePresence>
            {open && (
              <PopoverPanel
                static
                as={motion.div}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                anchor={inForm ? "bottom start" : "bottom"}
                className="flex origin-top flex-col w-auto p-2 border bg-white z-10"
              >
                {view === 'monthly' && renderMonthlyPicker()}
                {view === 'weekly' && renderWeeklyPicker()}
                {view === 'daily' && renderDailyPicker()}
              </PopoverPanel>
            )}
          </AnimatePresence>
        </>
      )}
    </Popover>
  );
};

export default DatePicker;

function eachMonthOfYear(date: Date): Date[] {
  return Array.from({ length: 12 }, (_, i) => new Date(date.getFullYear(), i, 1));
}