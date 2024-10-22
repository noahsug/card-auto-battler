import { styled } from 'styled-components';

import { maskImage } from '../../style';
import { Row } from '../shared/Row';
import livesImage from './heart.png';
import battleImage from './swords.png';
import deckImage from './cards.png';
import { MAX_LOSSES } from '../../../game/constants';
import { GameState } from '../../../game/gameState';

const size = 2;

const IconRow = styled(Row)`
  justify-content: space-between;
`;

const Label = styled(Row)`
  font-size: ${size}rem;
  font-family: var(--font-heading);
  letter-spacing: var(--letter-spacing-heading);
  background-color: var(--color-bg-opaque);
  padding: 0.5rem;
  justify-content: center;
`;

const ClickableLabel = styled(Label)`
  cursor: pointer;
`;

const Icon = styled.div<{ src: string }>`
  width: ${size}rem;
  height: ${size}rem;
  margin-right: 0.75rem;
  ${maskImage}
  background-color: var(--color-primary);
`;

const RelicRow = styled(Row)`
  margin-top: 0.5rem;
  justify-content: left;
  gap: 0.5rem;
`;

const RelicImage = styled(Icon)<{ $color: string }>`
  margin: 0;
  background-color: green;
  background-color: ${(props) => props.$color};
`;

interface Props {
  game: GameState;
  onViewDeck: () => void;
}

export function HUD({ game, onViewDeck }: Props) {
  const { wins, losses, user } = game;

  return (
    <>
      <IconRow>
        <Label>
          <Icon src={livesImage} />
          <div>{MAX_LOSSES - losses} lives</div>
        </Label>

        <Label>
          <Icon src={battleImage} />
          <div>round {wins + 1}</div>
        </Label>

        <ClickableLabel onClick={onViewDeck}>
          <Icon src={deckImage} />
          <div>cards ({user.cards.length})</div>
        </ClickableLabel>
      </IconRow>
      <RelicRow>
        {user.relics.map((relic, i) => (
          <RelicImage key={i} src={relic.image} $color={relic.color} />
        ))}
      </RelicRow>
    </>
  );
}
