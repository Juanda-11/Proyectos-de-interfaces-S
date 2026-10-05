import { useEffect, useState } from 'react';

const format = (d) =>
  `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

export default function useClock() {
  const [time, setTime] = useState(format(new Date()));
  useEffect(() => {
    const id = setInterval(() => setTime(format(new Date())), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}
