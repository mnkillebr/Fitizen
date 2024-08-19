import { useEffect, useState } from 'react';

export default function CurrentDate() {
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    const now = new Date();
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
  }, []);

  return <div>{currentDate}</div>;
};
