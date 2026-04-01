import { useEffect, useRef } from 'react';

export default function ProgressRing({ percentage = 0, size = 120, thickness = 10, color = '#22c55e', label, sublabel }) {
  const circleRef = useRef();
  const r = (size - thickness) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percentage / 100) * circ;

  useEffect(() => {
    if (!circleRef.current) return;
    circleRef.current.style.setProperty('--dash-total', circ);
    circleRef.current.style.setProperty('--dash-offset', offset);
    circleRef.current.style.strokeDashoffset = circ;
    const timer = setTimeout(() => {
      if (circleRef.current) circleRef.current.style.strokeDashoffset = offset;
    }, 100);
    return () => clearTimeout(timer);
  }, [percentage, circ, offset]);

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={thickness} />
        <circle ref={circleRef} cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={thickness}
          strokeLinecap="round" strokeDasharray={circ}
          style={{ transition: 'stroke-dashoffset 1s ease', strokeDashoffset: circ }} />
      </svg>
      <div style={{ position: 'absolute', textAlign: 'center' }}>
        {label && <div style={{ fontFamily: 'Baloo 2', fontWeight: 700, fontSize: size > 100 ? 22 : 16, color: '#1a2e1a', lineHeight: 1 }}>{label}</div>}
        {sublabel && <div style={{ fontSize: 11, color: '#7a907a', fontWeight: 600, marginTop: 2 }}>{sublabel}</div>}
      </div>
    </div>
  );
}
