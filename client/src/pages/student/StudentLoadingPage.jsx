import './StudentLoadingPage.css';

const MESSAGES = [
  "Preparing your eco-adventure...",
  "Loading today's missions...",
  "Getting your garden ready...",
  "Counting your Eco-Points...",
  "Growing your virtual forest...",
];

export default function StudentLoadingPage() {
  const msg = MESSAGES[Math.floor(Date.now() / 3000) % MESSAGES.length];

  return (
    <div className="student-loading-page">
      {/* Falling leaves background */}
      {[...Array(5)].map((_, i) => (
        <div key={i} className="prithvi-bg-leaf load-leaf" style={{
          left: `${15 + i * 17}%`,
          width: `${10 + i * 3}px`,
          height: `${10 + i * 3}px`,
          background: ['#22c55e','#4ade80','#86efac','#fcd34d','#15803d'][i],
          animationDuration: `${9 + i * 2}s`,
          animationDelay: `${i * 0.8}s`,
          opacity: 0.18,
        }} />
      ))}

      <div className="loading-center">
        {/* Earth + orbit - prithvi-loader-spin-earth + prithvi-loader-leaf-orbit */}
        <div className="earth-orbit-wrap">
          <div className="prithvi-loader-earth">
            {/* CSS continents via pseudo-elements + box-shadow in CSS */}
          </div>
          <div className="orbit-leaf" />
          <div className="orbit-leaf" />
          <div className="orbit-leaf" />
        </div>

        <div className="loading-logo">PRITHVI</div>
        <p className="loading-msg">{msg}</p>

        {/* Progress bar */}
        <div className="loading-bar-track">
          <div className="loading-bar-fill" />
        </div>
      </div>
    </div>
  );
}
