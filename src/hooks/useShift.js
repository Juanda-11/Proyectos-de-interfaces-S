import { useEffect, useState } from 'react';
import { getShiftStatus } from '../utils/shift';

// Estado del turno recalculado cada 15 s con la hora real del dispositivo.
export default function useShift(shift) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(id);
  }, []);
  return getShiftStatus(shift, now);
}
