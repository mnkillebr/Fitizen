import { useState, useEffect, BaseSyntheticEvent } from 'react';
import { useNavigate } from '@remix-run/react';
import {
  PlayIcon,
  PauseIcon,
  StopIcon,
  ArrowPathIcon,
  FlagIcon,
} from '@heroicons/react/24/solid';

type Lap = {
  id: number;
  time: string;
};

interface StopwatchProps {
  autoStart?: boolean;
  label?: string;
  showMS?: boolean;
  showLaps?: boolean;
}

export default function Stopwatch({
  autoStart = false,
  label,
  showMS = false,
  showLaps = false,
}: StopwatchProps) {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [laps, setLaps] = useState<Lap[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 10);
      }, 10);
    } else if (!isRunning && interval) {
      clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  const formatTime = (milliseconds: number): string => {
    const hours = Math.floor(milliseconds / 3600000);
    const minutes = Math.floor((milliseconds % 3600000) / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    const ms = milliseconds % 1000;

    if (showMS) {
      return `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms
        .toString()
        .padStart(3, '0')}`;
    }
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
  };

  const handlePlayPause = (e: BaseSyntheticEvent) => {
    e.preventDefault();
    setIsRunning(!isRunning);
  };

  const handleStop = (e: BaseSyntheticEvent) => {
    e.preventDefault();
    setIsRunning(false);
    setTime(0);
    setLaps([]);
  };

  const handleReset = (e: BaseSyntheticEvent) => {
    e.preventDefault();
    setTime(0);
    setLaps([]);
  };

  const handleLap = (e: BaseSyntheticEvent) => {
    e.preventDefault();
    setLaps((prevLaps) => [
      ...prevLaps,
      { id: prevLaps.length + 1, time: formatTime(time) },
    ]);
  };

  return (
    <div className="flex flex-col justify-center">
      <div className="px-4 py-2 bg-white rounded-lg shadow-md">
        {label ? (
          <h2 className="text-xl text-center font-medium">{label}</h2>
        ) : null}
        <h1 className="text-3xl font-bold mb-4 text-center">
          {formatTime(time)}
        </h1>
        <input type="hidden" name="duration" value={time} />
        <div className="flex justify-center space-x-3 mb-2">
          <button
            onClick={handlePlayPause}
            className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            {isRunning ? (
              <PauseIcon className="size-6" />
            ) : (
              <PlayIcon className="size-6" />
            )}
          </button>
          <button
            onClick={handleStop}
            className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
          >
            <StopIcon className="size-6" />
          </button>
          <button
            onClick={handleReset}
            className="p-2 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50"
          >
            <ArrowPathIcon className="size-6" />
          </button>
          {showLaps ? <button
            onClick={handleLap}
            className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
          >
            <FlagIcon className="size-6" />
          </button> : null}
        </div>
        {laps.length > 0 && (
          <div className="mt-4">
            <h2 className="text-xl font-semibold mb-2">Laps</h2>
            <ul className="space-y-1">
              {laps.map((lap) => (
                <li key={lap.id} className="text-sm">
                  Lap {lap.id}: {lap.time}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
