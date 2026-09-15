import { useEffect, useRef, useState } from 'react';

export default function Toast() {
  const [msg, setMsg] = useState('');
  const [show, setShow] = useState(false);
  const timerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const handler = (e: Event) => {
      setMsg((e as CustomEvent<string>).detail);
      setShow(true);
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setShow(false), 2200);
    };
    window.addEventListener('app-toast', handler);
    return () => window.removeEventListener('app-toast', handler);
  }, []);

  if (!show) return null;
  return <div className="toast">{msg}</div>;
}
