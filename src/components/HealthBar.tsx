import styled from 'styled-components';

interface Props {
  health: number;
  maxHealth: number;
}

export default function HealthBar({ health, maxHealth }: Props) {
  health = Math.max(health, 0);

  const healthPercent = Math.min(health / maxHealth, 1) * 100;

  return (
    <OuterBar>
      <InnerBar $percent={healthPercent} />
      <BarText>
        {health} / {maxHealth}
      </BarText>
    </OuterBar>
  );
}

const OuterBar = styled.div`
  width: 300rem;
  height: 20rem;
  background-color: darkred;
  border-radius: 10rem;
  overflow: hidden;
  position: relative;
`;

const InnerBar = styled.div<{ $percent: number }>`
  width: ${({ $percent }) => $percent}%;
  height: 100%;
  background-color: #c00;
  transition: width 0.5s;
`;

const BarText = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  color: white;
  font-weight: bold;
  font-size: 15rem;
  text-align: center;
  line-height: 20rem;
`;
