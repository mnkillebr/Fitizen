import { useEffect, useState } from 'react';

type CurrentDateProps = {
  incomingDate?: string;
}

export default function CurrentDate({ incomingDate }: CurrentDateProps) {
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    const now = incomingDate ? new Date(incomingDate) : new Date();
    const formattedDate = now.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: '2-digit',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });

    setCurrentDate(formattedDate);
  }, [incomingDate]);

  return <div>{currentDate}</div>;
};
