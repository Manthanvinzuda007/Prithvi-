import './EcoBuddy.css';

export default function EcoBuddy({ size = 80, mood = 'happy', animated = true }) {
  const scale = size / 80;
  return (
    <div className={`eco-buddy ${mood} ${animated ? 'animated' : ''}`}
      style={{ transform: `scale(${scale})`, transformOrigin: 'bottom center', width: 80, height: 90 }}>
      {/* Leaf hat */}
      <div className="buddy-hat" />
      {/* Body */}
      <div className="buddy-body">
        {/* Eyes */}
        <div className="buddy-eyes">
          <div className="buddy-eye">
            <div className="buddy-pupil" />
          </div>
          <div className="buddy-eye">
            <div className="buddy-pupil" />
          </div>
        </div>
        {/* Mouth */}
        <div className={`buddy-mouth ${mood}`} />
        {/* Cheeks */}
        <div className="buddy-cheeks">
          <div className="buddy-cheek" />
          <div className="buddy-cheek" />
        </div>
      </div>
      {/* Arms */}
      <div className="buddy-arm buddy-arm-left" />
      <div className="buddy-arm buddy-arm-right" />
      {/* Legs */}
      <div className="buddy-legs">
        <div className="buddy-leg" />
        <div className="buddy-leg" />
      </div>
    </div>
  );
}
