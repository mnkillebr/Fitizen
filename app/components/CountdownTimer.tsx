import React, { useState, useEffect, useCallback, useRef, BaseSyntheticEvent } from 'react';
import { motion } from 'framer-motion';
import {
  PlayIcon,
  PauseIcon,
  StopIcon,
  ArrowPathIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
} from '@heroicons/react/24/solid';

const presetTimes = [5, 10, 15, 20];

interface CountdownTimerProps {
  autoStart?: boolean;
  defaultTime?: number;
  label?: string;
  showPresetTimes?: boolean;
  showCustomInput?: boolean;
  showControls?: boolean;
  showSound?: boolean;
  onCountdownEnd?: () => void;
};

export default function CountdownTimer({
  autoStart = false,
  defaultTime = 15,
  label,
  showPresetTimes = true,
  showCustomInput = true,
  showControls = true,
  showSound = false,
  onCountdownEnd = () => {},
}: CountdownTimerProps) {
  const [time, setTime] = useState(defaultTime);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [customMinutes, setCustomMinutes] = useState('');
  const [customSeconds, setCustomSeconds] = useState('');
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  const initializeAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext)();
    }
    setIsSoundEnabled(true);
  }, []);

  const playBoxingBell = useCallback(() => {
    if (!audioContextRef.current || !isSoundEnabled) return;

    const audioContext = audioContextRef.current;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime);

    gainNode.gain.setValueAtTime(1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 1.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 1.5);

    // Play a second bell sound after a short delay
    setTimeout(() => {
      const secondOscillator = audioContext.createOscillator();
      const secondGainNode = audioContext.createGain();

      secondOscillator.connect(secondGainNode);
      secondGainNode.connect(audioContext.destination);

      secondOscillator.type = 'sine';
      secondOscillator.frequency.setValueAtTime(440, audioContext.currentTime);

      secondGainNode.gain.setValueAtTime(1, audioContext.currentTime);
      secondGainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 1.5);

      secondOscillator.start(audioContext.currentTime);
      secondOscillator.stop(audioContext.currentTime + 1.5);
    }, 500);
  }, [isSoundEnabled]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && time > 0) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);
    } else if (time === 0) {
      setIsRunning(false);
      playBoxingBell();
      onCountdownEnd();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, time]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (seconds <= 10 && seconds > 0) {
      return seconds.toString();
    }
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`;
  };

  const handleStart = (e: BaseSyntheticEvent) => {
    e.preventDefault();
    if (time > 0) {
      setIsRunning(true);
    }
  };

  const handlePause = (e: BaseSyntheticEvent) => {
    e.preventDefault();
    setIsRunning(false);
  };

  const handleStop = (e: BaseSyntheticEvent) => {
    e.preventDefault();
    setIsRunning(false);
    setTime(0);
  };

  const handleReset = (e: BaseSyntheticEvent) => {
    e.preventDefault();
    setIsRunning(false);
    setTime(0);
    setCustomMinutes('');
    setCustomSeconds('');
  };

  const handlePresetSelect = (minutes: number) => {
    setTime(minutes * 60);
    setCustomMinutes('');
    setCustomSeconds('');
  };

  const handleCustomTimeChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'minutes' | 'seconds'
  ) => {
    const value = e.target.value;
    if (type === 'minutes') {
      setCustomMinutes(value);
    } else {
      setCustomSeconds(value);
    }
  };

  const handleCustomTimeSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const minutes = parseInt(customMinutes) || 0;
    const seconds = parseInt(customSeconds) || 0;
    const totalSeconds = minutes * 60 + seconds;
    if (totalSeconds > 0) {
      setTime(totalSeconds);
      setCustomMinutes('');
      setCustomSeconds('');
    }
  };

  const toggleSound = (e: BaseSyntheticEvent) => {
    e.preventDefault();
    if (isSoundEnabled) {
      setIsSoundEnabled(false);
    } else {
      initializeAudioContext();
    }
  };

  return (
    <div className="flex flex-col">
      <div className="p-8 bg-white rounded-lg shadow-md">
        <div className="text-center mb-4">
          {time <= 10 && time > 0 ? (
            <motion.div
              key={time}
              initial={{ opacity: 0, scale: 2 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-6xl font-bold"
            >
              {formatTime(time)}
            </motion.div>
          ) : (
            <div className="text-6xl font-bold">{formatTime(time)}</div>
          )}
        </div>
        {showPresetTimes ? (
          <div className="flex justify-center space-x-2 mb-4">
            {presetTimes.map((preset) => (
              <button
                key={preset}
                onClick={() => handlePresetSelect(preset)}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                {preset} min
              </button>
            ))}
          </div>
        ) : null}
        {showCustomInput ? (
          <form
            onSubmit={handleCustomTimeSubmit}
            className="flex justify-center mb-4"
          >
            <input
              type="number"
              value={customMinutes}
              onChange={(e) => handleCustomTimeChange(e, 'minutes')}
              placeholder="Min"
              min="0"
              className="w-16 px-2 py-1 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            />
            <input
              type="number"
              value={customSeconds}
              onChange={(e) => handleCustomTimeChange(e, 'seconds')}
              placeholder="Sec"
              min="0"
              max="59"
              className="w-16 px-2 py-1 border-t border-b border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            />
            <button
              type="submit"
              className="px-3 py-1 bg-green-500 text-white rounded-r hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
            >
              Set
            </button>
          </form>
        ) : null}
        {showControls ? (
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleStart}
              disabled={isRunning}
              className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
            >
              <PlayIcon className="size-6" />
            </button>
            <button
              onClick={handlePause}
              disabled={!isRunning}
              className="p-2 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50 disabled:opacity-50"
            >
              <PauseIcon className="size-6" />
            </button>
            <button
              onClick={handleStop}
              className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
            >
              <StopIcon className="size-6" />
            </button>
            <button
              onClick={handleReset}
              className="p-2 bg-gray-500 text-white rounded-full hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
            >
              <ArrowPathIcon className="size-6" />
            </button>
            <button
              onClick={toggleSound}
              className="p-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
            >
              {isSoundEnabled ? (
                <SpeakerWaveIcon className="h-6 w-6" />
              ) : (
                <SpeakerXMarkIcon className="h-6 w-6" />
              )}
            </button>
          </div>
        ) : null}
        {label ? (
          <div className="text-2xl text-center font-semibold">{label}</div>
        ) : null}
        {showSound ? (
          <div className="flex justify-center space-x-4">
            <button
              onClick={toggleSound}
              className="p-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
            >
              {isSoundEnabled ? (
                <SpeakerWaveIcon className="h-6 w-6" />
              ) : (
                <SpeakerXMarkIcon className="h-6 w-6" />
              )}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
