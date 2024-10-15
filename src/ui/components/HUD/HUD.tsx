import { styled } from 'styled-components';

import { maskImage } from '../../style';
import { Row } from '../shared/Row';
import livesImage from './heart.png';
import battleImage from './swords.png';
import deckImage from './cards.png';
import { MAX_LOSSES } from '../../../game/constants';
import { GameState } from '../../../game/gameState';

const size = 2;

const Label = styled(Row)`
  font-size: ${size}rem;
  font-family: var(--font-heading);
  letter-spacing: var(--letter-spacing-heading);
  background-color: var(--color-bg-opaque);
  padding: 0.5rem;
  justify-content: center;
`;

const LabelText = styled.div``;

const Icon = styled.div<{ src: string }>`
  width: ${size}rem;
  height: ${size}rem;
  margin-right: 0.75rem;
  ${maskImage}
  background-color: var(--color-primary);
`;

interface Props {
  game: GameState;
  onViewDeck: () => void;
}

export function HUD({ game, onViewDeck }: Props) {
  const { wins, losses, user } = game;

  return (
    <Row>
      <Label>
        <Icon src={livesImage} />
        <LabelText>{MAX_LOSSES - losses} lives</LabelText>
      </Label>

      <Label>
        <Icon src={battleImage} />
        <LabelText>round {wins + 1}</LabelText>
      </Label>

      <Label onClick={onViewDeck}>
        <Icon src={deckImage} />
        <LabelText>deck ({user.cards.length})</LabelText>
      </Label>
    </Row>
  );
}
