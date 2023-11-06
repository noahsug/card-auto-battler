import './HealthBar.css';

export default function HealthBar({ health, maxHealth }: { health: number; maxHealth: number }) {
  const healthPercent = Math.min(health / maxHealth, 1) * 100;

  return (
    <div className="HealthBar">
      <div className="HealthBar-inner" style={{ width: `${healthPercent}%` }} />
      <div className="HealthBar-text">
        {health} / {maxHealth}
      </div>
    </div>
  );
}
