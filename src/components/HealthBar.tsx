import './HealthBar.css';

interface Props {
  health: number;
  maxHealth: number;
}

export default function HealthBar({ health, maxHealth }: Props) {
  health = Math.max(health, 0);

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
