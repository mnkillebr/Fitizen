import React, { useState } from 'react';
import { addSeconds, format, setHours, setMinutes, setSeconds } from 'date-fns';
import DatePicker from './DatePicker';
import { Button, PrimaryButton } from './form';
import { DEFAULT_WORKOUT_DURATION } from '~/utils/magicNumbers';
import clsx from 'clsx';

interface SessionFormProps {
  selectedDateTime: Date | null;
  onSubmit: (sessionData: any) => void;
  onCancel: () => void;
  workouts: Array<{ name: string; id: string }>;
  defaults?: {
    [key: string]: any;
  };
}

const SessionForm: React.FC<SessionFormProps> = ({
  selectedDateTime,
  onSubmit,
  onCancel,
  workouts,
  defaults,
}) => {
  const [workout, setWorkout] = useState('');
  const [recurrence, setRecurrence] = useState('');
  const [cancel, setCancel] = useState(false);
  const [date, setDate] = useState(selectedDateTime || new Date());
  const [hour, setHour] = useState(selectedDateTime ? format(selectedDateTime, 'hh') : '09');
  const [minute, setMinute] = useState(selectedDateTime ? format(selectedDateTime, 'mm') : '00');
  const [meridiem, setMeridiem] = useState(selectedDateTime ? format(selectedDateTime, 'aa'): 'AM');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cancel) {
      return onSubmit({
        id: defaults?.sessionId,
        formType: "delete_workout_session",
      })
    } else {
      const selectedHour = parseInt(hour);
      const hours = selectedHour === 12 && meridiem === "PM" ? selectedHour : selectedHour === 12 && meridiem === "AM" ? 0 : meridiem === "AM" ? selectedHour : selectedHour + 12;
      const startTime = setHours(setMinutes(setSeconds(date, 0), parseInt(minute)), hours).toISOString();
      const duration = DEFAULT_WORKOUT_DURATION;
      const endTime = addSeconds(startTime, duration).toISOString();
      const submitObj = defaults ? {
        workoutId: defaults.workoutId,
        id: defaults.sessionId ? defaults.sessionId : '',
        recurrence,
        startTime,
        endTime,
        formType: "update_workout_session",
      } : {
        workoutId: workout,
        recurrence,
        startTime,
        endTime,
        formType: "workout_session",
      }
      return onSubmit(submitObj);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="block mb-2 font-semibold" htmlFor="workoutId">Workout</label>
        <select
          value={defaults?.workoutId ? defaults.workoutId : workout}
          onChange={(e) => setWorkout(e.target.value)}
          name="workoutId"
          id="workoutId"
          required
          disabled={defaults?.workoutId === undefined ? false : true}
          className={clsx(
            "w-full p-2 border rounded focus:outline-none text-sm",
            "bg-background-muted dark:border-border-muted",
            "focus:border-ring h-9"
          )}
        >
          <option value="">Select workout</option>
          {workouts.map(({ name, id }, workout_idx) => <option key={workout_idx} value={id}>{name}</option>)}
        </select>
      </div>
      <div className="mb-4">
        <label className="block mb-2 font-semibold" htmlFor="recurrence">Recurrence</label>
        <select
          value={defaults?.recurrence ? defaults.recurrence : recurrence}
          onChange={(e) => setRecurrence(e.target.value)}
          name="recurrence"
          id="recurrence"
          className={clsx(
            "w-full p-2 border rounded focus:outline-none text-sm",
            "bg-background-muted dark:border-border-muted",
            "focus:border-ring h-9"
          )}
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
            className={clsx(
              "w-full p-2 border rounded focus:outline-none text-sm",
              "bg-background-muted dark:border-border-muted",
              "focus:border-ring h-9"
            )}
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
            className={clsx(
              "w-full p-2 border rounded focus:outline-none text-sm",
              "bg-background-muted dark:border-border-muted",
              "focus:border-ring h-9"
            )}
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
            className={clsx(
              "w-full p-2 border rounded focus:outline-none text-sm",
              "bg-background-muted dark:border-border-muted",
              "focus:border-ring h-9"
            )}
          >
            <option key="am" value="AM">AM</option>
            <option key="pm" value="PM">PM</option>
          </select>
        </div>
      </div>
      {cancel ? <span className="flex font-semibold text-sm justify-end mb-1">Are you sure you wish to cancel this workout session?</span> : null}
      <div className="flex justify-end">
        {cancel ? (
          <>
            <Button
              type="button"
              onClick={() => setCancel(false)}
              className="mr-2 bg-gray-300 hover:bg-gray-200 dark:border dark:border-border-muted dark:bg-accent dark:hover:bg-border-muted"
            >
              No
            </Button>
            <PrimaryButton type="submit">Yes</PrimaryButton>
          </>
        ) : (
          <>
            <Button
              type="button"
              onClick={() => defaults?.sessionId ? setCancel(true) : onCancel()}
              className="mr-2 bg-gray-300 hover:bg-gray-200 dark:border dark:border-border-muted dark:bg-accent dark:hover:bg-border-muted"
            >
              {defaults?.sessionId ? "Cancel Session" : "Cancel"}
            </Button>
            <PrimaryButton type="submit">{defaults?.sessionId ? "Update" : "Schedule"}</PrimaryButton>
          </>
        )}
      </div>
    </form>
  );
};

export default SessionForm;