import React, { useState, useEffect } from 'react';
// import { Dialog } from '@/components/ui/dialog';
// import { Button } from '@/components/ui/button';
// import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { ChevronLeft, ChevronRight, PlusIcon } from 'images/icons';
import { format, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, getHours, setHours, getMinutes, setMinutes, differenceInMinutes } from 'date-fns';
import { Button } from './form';
import clsx from 'clsx';
import { useOpenDialog } from './Dialog';
import DatePicker from './DatePicker';
import { Appointment } from '@prisma/client';
import EventForm from './EventForm';

type ViewType = 'daily' | 'weekly' | 'monthly';

const eventTitle = (title: string) => {
  switch (title) {
    case "GOAL_SETTING":
      return "Goal Setting"
    case "FOLLOWUP":
      return "Follow-up"
  }
}

interface EventType extends Appointment {
  coach: string;
}

interface CalendarProps {
  currentTimeLineColor?: string;
  submitEvent: (args: any) => void;
  formOptions: {
    [key: string]: any;
  };
  schedule: {
    [key: string]: any;
  };
}

const Calendar: React.FC<CalendarProps> = ({ currentTimeLineColor = 'red', submitEvent, formOptions, schedule }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [view, setView] = useState<ViewType>('monthly');
  // const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  // const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  // const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedDateTime, setSelectedDateTime] = useState<Date | null>(null);
  // const [eventType, setEventType] = useState<string | null>(null);
  const openDialog = useOpenDialog();
  const { appointments } = schedule

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

  const handleDayClick = (date: Date) => {
    // setSelectedDate(date);
    const clickedDay = setMinutes(date, 0)
    // console.log("clicked day", date, clickedDay)
    // setIsAddEventOpen(true);
    setSelectedDateTime(clickedDay);
    openDialog(
      <EventForm
        selectedDateTime={clickedDay}
        submitEvent={submitEvent}
        formOptions={formOptions}
      />,
      "Add Event"
    )
  };

  const handleTimeClick = (date: Date, minutes: number) => {
    // setSelectedDate(date);
    // setSelectedTime(time);
    // console.log("clicked time", date, minutes)
    const clickedTime = setMinutes(date, minutes)
    setSelectedDateTime(clickedTime);
    // setIsAddEventOpen(true);
    openDialog(
      <EventForm
        selectedDateTime={clickedTime}
        submitEvent={submitEvent}
        formOptions={formOptions}
      />,
      "Add Event"
    )
  };

  const handleEventClick = (event: EventType) => {
    const eventTime = new Date(event.startTime)
    setSelectedDateTime(eventTime);
    openDialog(
      <EventForm
        selectedDateTime={eventTime}
        submitEvent={submitEvent}
        formOptions={{
          ...formOptions,
          defaults: {
            coachId: event.coachId,
            appointmentId: event.id,
            appointmentType: event.type.toLowerCase(),
            defaultTab: 0,
          }
        }}
      />,
      `${eventTitle(event.type)} with ${event.coach}`
    )
  }

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
        const dayAppointments = appointments.filter((apt: any) => 
          isSameDay(apt.startTime, cloneDay)
        );
        days.push(
          <div
            key={day.toString()}
            className={clsx(
              "p-2 border rounded-lg",
              !isSameMonth(day, monthStart) ? "text-gray-400" : isSameDay(day, new Date()) ? "bg-blue-500 text-white" : "",
              "hover:bg-blue-200 transition duration-100"
            )}
            // onClick={() => handleDayClick(cloneDay)}
          >
            <div>{formattedDate}</div>
            <div className="flex flex-col gap-y-1">
              {/* Overflow behavior needs revisit */}
              {dayAppointments.map((appointment: any) => (
                <div
                  key={appointment.id}
                  className="text-xs py-1 px-4 overflow-hidden bg-amber-300 font-semibold rounded-md cursor-pointer"
                  onClick={() => handleEventClick(appointment)}
                >
                  {eventTitle(appointment.type)} with {appointment.coach}
                </div>
              ))}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7 overflow-hidden">
          {days}
        </div>
      );
      days = [];
    }
    return <div className="h-[calc(100%-3.5rem)] grid grid-rows-5 gap-px shadow-md rounded-lg">{rows}</div>;
  };

  const renderHourColumn = (day: Date) => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const isToday = isSameDay(day, new Date());
    const currentHour = getHours(currentTime);
    const currentMinute = getMinutes(currentTime);

    const dayAppointments = appointments.filter((apt: any) => 
      isSameDay(apt.startTime, day)
    );

    return (
      <div className="grid grid-cols-1 gap-px">
        {hours.map((hour) => (
          <div
            key={hour}
            className="p-2 first:border-t-none first:rounded-t-lg last:rounded-b-lg border h-32 relative"
            // onClick={() => handleTimeClick(day, format(new Date().setHours(hour), 'HH:mm'))}
          >
            <span className="absolute left-2 top-2 z-10 text-xs text-gray-500">
              {format(new Date().setHours(hour), 'ha')}
            </span>
            {[0, 15, 30, 45].map((minute) => {
              const timeSlot = setMinutes(setHours(day, hour), minute);
              const slotAppointments = dayAppointments.filter((apt: any) => 
                timeSlot >= new Date(apt.startTime) && timeSlot < new Date(apt.endTime)
              );
              return (
                <div
                  key={minute}
                  className="absolute left-0 w-full h-1/4 pl-10 pr-2 hover:bg-blue-100 cursor-pointer transition duration-100"
                  style={{ top: `${(minute / 60) * 100}%` }}
                  onClick={() => !slotAppointments.length && handleTimeClick(setMinutes(setHours(day, hour), minute), minute)}
                >
                  {slotAppointments.map((appointment: any) => (
                    <div
                      key={appointment.id}
                      className={clsx(
                        "h-full text-xs py-1 px-4 overflow-hidden bg-amber-300 font-semibold z-10",
                        differenceInMinutes(appointment.endTime, appointment.startTime) > 15 && getMinutes(timeSlot) === getMinutes(appointment.startTime)
                          ? "rounded-t-md"
                          : differenceInMinutes(appointment.endTime, appointment.startTime) > 15
                            ? "rounded-b-md"
                            : "rounded-md"
                      )}
                      onClick={() => handleEventClick(appointment)}
                    >
                      {getMinutes(timeSlot) === getMinutes(appointment.startTime) ? `${eventTitle(appointment.type)} with ${appointment.coach}` : ""} 
                    </div>
                  ))}
                </div>
              )
            })}
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
            {days.map((day) => {
              const dayAppointments = appointments.filter((apt: any) => 
                isSameDay(apt.startTime, day)
              );
              return (
                <div key={day.toString()} className="border-x">
                  {hours.map((hour) => (
                    <div
                      key={hour}
                      className="p-2 border-b h-24 relative hover:bg-blue-200 transition duration-100 overflow-hidden"
                      // onClick={() => handleTimeClick(day, format(new Date().setHours(hour), 'HH:mm'))}
                    >
                      <span className="absolute left-2 top-2 z-10 text-xs text-gray-500">
                        {format(new Date().setHours(hour), 'ha')}
                      </span>
                      {[0, 15, 30, 45].map((minute) => {
                        const timeSlot = setMinutes(setHours(day, hour), minute);
                        const slotAppointments = dayAppointments.filter((apt: any) => 
                          timeSlot >= new Date(apt.startTime) && timeSlot < new Date(apt.endTime)
                        );
                        return (
                          <div
                            key={minute}
                            className="absolute left-0 w-full h-1/4 pl-10 pr-2 hover:bg-blue-100 cursor-pointer transition duration-100"
                            style={{ top: `${(minute / 60) * 100}%` }}
                            onClick={() => !slotAppointments.length && handleTimeClick(setMinutes(setHours(day, hour), minute), minute)}
                          >
                            {slotAppointments.map((appointment: any) => (
                              <div
                                key={appointment.id}
                                className={clsx(
                                  "h-full text-xs py-1 px-4 overflow-hidden bg-amber-300 font-semibold z-10",
                                  differenceInMinutes(appointment.endTime, appointment.startTime) > 15 && getMinutes(timeSlot) === getMinutes(appointment.startTime)
                                    ? "rounded-t-md"
                                    : differenceInMinutes(appointment.endTime, appointment.startTime) > 15
                                      ? "rounded-b-md"
                                      : "rounded-md"
                                )}
                                onClick={() => handleEventClick(appointment)}
                              >
                                {getMinutes(timeSlot) === getMinutes(appointment.startTime) ? `${eventTitle(appointment.type)} with ${appointment.coach}` : ""} 
                              </div>
                            ))}
                          </div>
                        )
                      })}
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
              )
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 md:p-8 h-full overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <Button onClick={navigatePrevious} className="rounded-full hover:shadow-md transition duration-100">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button onClick={navigateNext} className="rounded-full hover:shadow-md transition duration-100">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button onClick={navigateToToday} className="md:hidden hover:bg-blue-100 transition duration-100">T</Button>
          <Button onClick={navigateToToday} className="hidden md:flex hover:bg-blue-100 transition duration-100">Today</Button>
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
          <Button onClick={() => setView("daily")} className={view === "daily" ? "bg-blue-500 text-white" : "hover:bg-blue-100 transition duration-100"}>D</Button>
          <Button onClick={() => setView("weekly")} className={view === "weekly" ? "bg-blue-500 text-white" : "hover:bg-blue-100 transition duration-100"}>W</Button>
          <Button onClick={() => setView("monthly")} className={view === "monthly" ? "bg-blue-500 text-white" : "hover:bg-blue-100 transition duration-100"}>M</Button>
          <Button
            onClick={() => openDialog(
              <EventForm
                selectedDateTime={new Date()}
                submitEvent={submitEvent}
                formOptions={formOptions}
              />,
              "Add Event"
            )}
            className="items-center"
          >
            <PlusIcon className="h-4 w-4" />
            {/* Add Event */}
          </Button>
        </div>
        <div className="hidden md:flex items-center">
          <Button onClick={() => setView("daily")} className={view === "daily" ? "bg-blue-500 text-white" : "hover:bg-blue-100 transition duration-100"}>Daily</Button>
          <Button onClick={() => setView("weekly")} className={view === "weekly" ? "bg-blue-500 text-white" : "hover:bg-blue-100 transition duration-100"}>Weekly</Button>
          <Button onClick={() => setView("monthly")} className={view === "monthly" ? "bg-blue-500 text-white" : "hover:bg-blue-100 transition duration-100"}>Monthly</Button>
          <Button
            onClick={() => openDialog(
              <EventForm
              selectedDateTime={new Date()}
                submitEvent={submitEvent}
                formOptions={formOptions}
              />,
              "Add Event"
            )}
            className="items-center hover:shadow-md transition duration-100"
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