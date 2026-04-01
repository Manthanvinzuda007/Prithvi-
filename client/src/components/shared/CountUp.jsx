import { useState, useEffect, useRef } from 'react';

export default function CountUp({ from = 0, to, duration = 1500, prefix = '', suffix = '', className = '' }) {
  const [val, setVal] = useState(from);
  const rafRef = useRef();

  useEffect(() => {
    const start = performance.now();
    const range = to - from;
    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(from + range * eased));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [to]);

  return (
    <span className={className}>
      {prefix}{val.toLocaleString('en-IN')}{suffix}
    </span>
  );
}
