import React, { useState, useEffect } from 'react';
// import { Dialog } from '@/components/ui/dialog';
// import { Button } from '@/components/ui/button';
// import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { ChevronLeft, ChevronRight, PlusIcon } from 'images/icons';
import { format, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, getHours, getMinutes } from 'date-fns';
import { Button } from './form';
import clsx from 'clsx';
import { useOpenDialog } from './Dialog';
import DatePicker from './DatePicker';

type ViewType = 'daily' | 'weekly' | 'monthly';

interface Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
}

interface CalendarProps {
  currentTimeLineColor?: string;
}

const Calendar: React.FC<CalendarProps> = ({ currentTimeLineColor = 'red' }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewType>('monthly');
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const openDialog = useOpenDialog();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  const navigateToToday = () => setCurrentDate(new Date());

  const navigatePrevious = () => {
    switch (view) {
      case 'daily':
        setCurrentDate(subDays(currentDate, 1));
        break;
      case 'weekly':
        setCurrentDate(subWeeks(currentDate, 1));
        break;
      case 'monthly':
        setCurrentDate(subMonths(currentDate, 1));
        break;
    }
  };

  const navigateNext = () => {
    switch (view) {
      case 'daily':
        setCurrentDate(addDays(currentDate, 1));
        break;
      case 'weekly':
        setCurrentDate(addWeeks(currentDate, 1));
        break;
      case 'monthly':
        setCurrentDate(addMonths(currentDate, 1));
        break;
    }
  };


  const renderMonthlyView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = "d";
    const rows = [];

    let days = [];
    let day = startDate;
    let formattedDate = "";

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, dateFormat);
        const cloneDay = day;
        days.push(
          <div
            key={day.toString()}
            className={clsx(
              "p-2 border rounded-lg",
              !isSameMonth(day, monthStart) ? "text-gray-400" : isSameDay(day, new Date()) ? "bg-blue-500 text-white" : "",
            )}
          >
            {formattedDate}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7">
          {days}
        </div>
      );
      days = [];
    }
    return <div className="h-[calc(100%-3.5rem)] grid gap-px shadow-md rounded-lg">{rows}</div>;
  };

  const renderHourColumn = (day: Date) => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const isToday = isSameDay(day, new Date());
    const currentHour = getHours(currentTime);
    const currentMinute = getMinutes(currentTime);

    return (
      <div className="grid grid-cols-1 gap-px">
        {hours.map((hour) => (
          <div key={hour} className="p-2 first:border-t-none first:rounded-t-lg last:rounded-b-lg border h-16 relative">
            {format(new Date().setHours(hour), 'ha')}
            {isToday && hour === currentHour && (
              <div
                className="absolute left-0 right-0"
                style={{
                  top: `${(currentMinute / 60) * 100}%`,
                  borderTop: `2px solid ${currentTimeLineColor}`,
                }}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderDailyView = () => {
    return (
      <div className="h-full">
        <h2 className="text-xl font-bold mb-4">{format(currentDate, 'EEEE, MMMM d, yyyy')}</h2>
        <div className="h-[calc(100%-6.25rem)] overflow-y-auto shadow-md border-t rounded-lg">
          {renderHourColumn(currentDate)}
        </div>
      </div>
    );
  };

  const renderWeeklyView = () => {
    const weekStart = startOfWeek(currentDate);
    const weekEnd = endOfWeek(currentDate);
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="h-[calc(100%-3.5rem)] shadow-md rounded-lg flex flex-col">
        <div className="grid grid-cols-7 gap-px z-10 sticky top-0">
          {days.map((day) => (
            <div
              key={day.toString()}
              className={clsx(
                "border border-b-2 h-full rounded-t-lg p-2",
                isSameDay(day, new Date()) ? "bg-blue-500 text-white" : ""
              )}>
              <div>{format(day, "EEE")}</div>
              <div>{format(day, "d")}</div>
            </div>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-7 gap-px">
            {days.map((day) => (
              <div key={day.toString()} className="border-x">
                {hours.map((hour) => (
                  <div key={hour} className="p-2 border-b h-16 relative">
                    <span className="text-xs text-gray-500">
                      {format(new Date().setHours(hour), 'ha')}
                    </span>
                    {isSameDay(day, new Date()) &&
                      hour === getHours(currentTime) && (
                        <div
                          className="absolute left-0 right-0"
                          style={{
                            top: `${(getMinutes(currentTime) / 60) * 100}%`,
                            borderTop: `2px solid ${currentTimeLineColor}`,
                          }}
                        />
                      )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 md:p-8 h-full overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <Button onClick={navigatePrevious} className="rounded-full hover:shadow-md">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button onClick={navigateNext} className="rounded-full hover:shadow-md">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button onClick={navigateToToday} className="md:hidden hover:bg-blue-100">T</Button>
          <Button onClick={navigateToToday} className="hidden md:flex hover:bg-blue-100">Today</Button>
        </div>
        {/* <h2 className="md:hidden text-xl font-bold">
          {format(currentDate, "MMM yyyy")}
        </h2>
        <h2 className="hidden md:flex text-xl font-bold">
          {format(currentDate, "MMMM yyyy")}
        </h2> */}
        <DatePicker
          currentDate={currentDate}
          view={view}
          onDateChange={setCurrentDate}
        />
        <div className="flex md:hidden items-center">
          <Button onClick={() => setView("daily")} className={view === "daily" ? "bg-blue-500 text-white" : "hover:bg-blue-100"}>D</Button>
          <Button onClick={() => setView("weekly")} className={view === "weekly" ? "bg-blue-500 text-white" : "hover:bg-blue-100"}>W</Button>
          <Button onClick={() => setView("monthly")} className={view === "monthly" ? "bg-blue-500 text-white" : "hover:bg-blue-100"}>M</Button>
          <Button
            onClick={() => openDialog(
              <div>
                Add Event
              </div>,
              "Add Event"
            )}
            className="items-center"
          >
            <PlusIcon className="h-4 w-4" />
            {/* Add Event */}
          </Button>
        </div>
        <div className="hidden md:flex items-center">
          <Button onClick={() => setView("daily")} className={view === "daily" ? "bg-blue-500 text-white" : "hover:bg-blue-100"}>Daily</Button>
          <Button onClick={() => setView("weekly")} className={view === "weekly" ? "bg-blue-500 text-white" : "hover:bg-blue-100"}>Weekly</Button>
          <Button onClick={() => setView("monthly")} className={view === "monthly" ? "bg-blue-500 text-white" : "hover:bg-blue-100"}>Monthly</Button>
          <Button
            onClick={() => openDialog(
              <div>
                Add Event
              </div>,
              "Add Event"
            )}
            className="items-center hover:shadow-md"
          >
            <PlusIcon className="h-4 w-4" />
            Add Event
          </Button>
        </div>
      </div>

      {view === "monthly" && renderMonthlyView()}
      {view === "weekly" && renderWeeklyView()}
      {view === "daily" && renderDailyView()}

      {/* <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>Add Event</Dialog.Title>
          </Dialog.Header>
          <div>
            Add event form fields here
          </div>
          <Dialog.Footer>
            <Button onClick={() => setIsAddEventOpen(false)}>Cancel</Button>
            <Button>Save</Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog> */}
    </div>
  );
};

export default Calendar;