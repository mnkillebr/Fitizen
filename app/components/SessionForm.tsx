import React, { useState } from 'react';
import { format, setHours, setMinutes } from 'date-fns';
import DatePicker from './DatePicker';
import { Button, PrimaryButton } from './form';

interface SessionFormProps {
  selectedDateTime: Date | null;
  onSubmit: (sessionData: any) => void;
  onCancel: () => void;
}

const SessionForm: React.FC<SessionFormProps> = ({
  selectedDateTime,
  onSubmit,
  onCancel,
}) => {
  const [sessionType, setSessionType] = useState('');
  const [recurrence, setRecurrence] = useState('');
  const [date, setDate] = useState(selectedDateTime || new Date());
  const [hour, setHour] = useState(selectedDateTime ? format(selectedDateTime, 'hh') : '09');
  const [minute, setMinute] = useState(selectedDateTime ? format(selectedDateTime, 'mm') : '00');
  const [meridiem, setMeridiem] = useState(selectedDateTime ? format(selectedDateTime, 'aa'): 'AM');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sessionDateTime = setMinutes(setHours(date, parseInt(hour)), parseInt(minute));
    onSubmit({
      sessionType,
      recurrence,
      dateTime: sessionDateTime,
      formType: "session",
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="block mb-2 font-semibold">Session Type</label>
        <select
          value={sessionType}
          onChange={(e) => setSessionType(e.target.value)}
          required
          className="w-full py-2 px-1 border-2 rounded focus:outline-accent bg-white"
        >
          <option value="">Select session type</option>
          <option value="study">Study (45 min)</option>
          <option value="nap">Nap (30 min)</option>
          <option value="focus">Focus (1 hour)</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="block mb-2 font-semibold">Recurrence</label>
        <select
          value={recurrence}
          onChange={(e) => setRecurrence(e.target.value)}
          className="w-full py-2 px-1 border-2 rounded focus:outline-accent bg-white"
        >
          <option value="">No recurrence</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="block mb-2 font-semibold">Date</label>
        <DatePicker
          currentDate={date}
          onDateChange={(date: Date) => setDate(date)}
          view="daily"
          inForm
        />
      </div>
      <div className="mb-4">
        <label className="block mb-2 font-semibold">Time</label>
        <div className="flex gap-x-1">
          <select
            value={hour}
            onChange={(e) => setHour(e.target.value)}
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
            className="w-full py-2 px-1 border-2 rounded focus:outline-accent bg-white"
          >
            <option key="am" value="AM">AM</option>
            <option key="pm" value="PM">PM</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="button" onClick={onCancel} className="mr-2 bg-slate-200 hover:bg-slate-100">
          Cancel
        </Button>
        <PrimaryButton type="submit">Schedule</PrimaryButton>
      </div>
    </form>
  );
};

export default SessionForm;