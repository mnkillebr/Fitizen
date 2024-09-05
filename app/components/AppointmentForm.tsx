import React, { useState } from 'react';
import { format, setHours, setMinutes, addMinutes, setSeconds } from 'date-fns';
import DatePicker from './DatePicker';
import { Button, PrimaryButton } from './form';

interface AppointmentFormProps {
  selectedDateTime: Date | null;
  onSubmit: (appointmentData: any) => void;
  onCancel: () => void;
  coaches: Array<{ name: string; id: string }>;
  defaults?: {
    [key: string]: any;
  };
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({
  selectedDateTime,
  onSubmit,
  onCancel,
  coaches,
  defaults,
}) => {
  // console.log(selectedDateTime)
  const [coach, setCoach] = useState('');
  const [appointmentType, setAppointmentType] = useState(defaults?.appointmentType || '');
  const [cancel, setCancel] = useState(false);
  const [date, setDate] = useState(selectedDateTime || new Date());
  const [hour, setHour] = useState(selectedDateTime ? format(selectedDateTime, 'hh') : '09');
  const [minute, setMinute] = useState(selectedDateTime ? format(selectedDateTime, 'mm') : '00');
  const [meridiem, setMeridiem] = useState(selectedDateTime ? format(selectedDateTime, 'aa'): 'AM');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cancel) {
      return onSubmit({
        id: defaults?.appointmentId,
        formType: "delete_appointment",
      })
    } else {
      const selectedHour = parseInt(hour);
      const hours = selectedHour === 12 && meridiem === "PM" ? selectedHour : selectedHour === 12 && meridiem === "AM" ? 0 : meridiem === "AM" ? selectedHour : selectedHour + 12;
      const startTime = setHours(setMinutes(setSeconds(date, 0), parseInt(minute)), hours);
      const duration = appointmentType === "goal_setting" ? 15 : 30
      const endTime = addMinutes(startTime, duration)
      const submitObj = defaults ? {
        coachId: defaults.coachId,
        id: defaults.appointmentId,
        type: defaults.appointmentType.toLowerCase(),
        startTime,
        endTime, 
        formType: "update_appointment",
      } : {
        coachId: coach,
        type: appointmentType,
        startTime,
        endTime, 
        formType: "appointment",
      }
      return onSubmit(submitObj);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="block mb-2 font-semibold" htmlFor="coachId">Coach</label>
        <select
          value={defaults?.coachId ? defaults.coachId : coach}
          onChange={(e) => setCoach(e.target.value)}
          name="coachId"
          id="coachId"
          required
          className="w-full py-2 px-1 border-2 rounded focus:outline-accent bg-white"
        >
          <option value="">Select a coach</option>
          {coaches.map(({ name, id }, coach_idx) => <option key={coach_idx} value={id}>{name}</option>)}
        </select>
      </div>
      <div className="mb-4">
        <label className="block mb-2 font-semibold" htmlFor="type">Appointment Type</label>
        <select
          value={defaults?.appointmentType ? defaults.appointmentType: appointmentType}
          onChange={(e) => setAppointmentType(e.target.value)}
          name="type"
          id="type"
          required
          className="w-full py-2 px-1 border-2 rounded focus:outline-accent bg-white"
        >
          <option value="">Select appointment type</option>
          <option value="goal_setting">Goal Setting (15 min)</option>
          <option value="followup">Follow-up (30 min)</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="block mb-2 font-semibold">Date</label>
        <DatePicker
          currentDate={date}
          view="daily"
          onDateChange={(date: Date) => setDate(date)}
          inForm
        />
      </div>
      <div className="mb-4">
        <label className="block mb-2 font-semibold">Time</label>
        <div className="flex gap-x-1">
          <select
            value={hour}
            onChange={(e) => setHour(e.target.value)}
            name="hour"
            className="w-full py-2 px-1 border-2 rounded focus:outline-accent bg-white"
          >
            {Array.from({ length: 12 }, (_, i) => i).map((h) => (
              <option key={h+1} value={(h+1).toString().padStart(2, '0')}>
                {(h+1).toString().padStart(2, '0')}
              </option>
            ))}
          </select>
          <select
            value={minute}
            onChange={(e) => setMinute(e.target.value)}
            name="minute"
            className="w-full py-2 px-1 border-2 rounded focus:outline-accent bg-white"
          >
            {['00', '15', '30', '45'].map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <select
            value={meridiem}
            onChange={(e) => setMeridiem(e.target.value)}
            name="meridiem"
            className="w-full py-2 px-1 border-2 rounded focus:outline-accent bg-white"
          >
            <option key="am" value="AM">AM</option>
            <option key="pm" value="PM">PM</option>
          </select>
        </div>
      </div>
      {cancel ? <span className="flex font-semibold text-sm justify-end mb-1">Are you sure you wish to cancel this appointment?</span> : null}
      <div className="flex justify-end">
        {cancel ? (
          <>
            <Button type="button" onClick={() => setCancel(false)} className="mr-2 bg-slate-200 hover:bg-slate-100">
              No
            </Button>
            <PrimaryButton type="submit">Yes</PrimaryButton>
          </>
        ) : (
          <>
            <Button type="button" onClick={() => defaults?.appointmentId ? setCancel(true) : onCancel()} className="mr-2 bg-slate-200 hover:bg-slate-100">
              {defaults?.appointmentId ? "Cancel Appointment" : "Cancel"}
            </Button>
            <PrimaryButton type="submit">{defaults?.appointmentId ? "Update" : "Schedule"}</PrimaryButton>
          </>
        )}
      </div>
    </form>
  );
};

export default AppointmentForm;