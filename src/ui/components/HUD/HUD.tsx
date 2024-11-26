import { styled } from 'styled-components';

import deckImage from './cards.png';
import livesImage from './hourglass.png';
import skullImage from './skull.png';
import battleImage from './swords.png';

import { MAX_LOSSES } from '../../../game/constants';
import { GameState } from '../../../game/gameState';
import { getIsBossBattle } from '../../../game/utils/selectors';
import { plural } from '../../../utils/plural';
import { maskImage } from '../../style';
import { RelicImage } from '../AddRelicsScreen/Relic';
import { Row } from '../shared/Row';

const size = 'max(1.7rem, 4vmin)';
const padding = 'max(0.6rem, 2vmin)';

const IconRow = styled(Row)`
  justify-content: space-between;
`;

export const Label = styled(Row)`
  font-size: ${size};
  padding: ${padding};
  font-family: var(--font-heading);
  justify-content: center;
`;

const HUDLabel = styled(Label)`
  background-color: var(--color-bg-opaque);
`;

const ClickableLabel = styled(HUDLabel)`
  cursor: pointer;
`;

export const Icon = styled.div<{ src: string }>`
  width: ${size};
  height: ${size};
  margin-right: ${padding};
  ${maskImage}
  background-color: var(--color-primary);
`;

const RelicRow = styled(Row)`
  margin-top: 0.5rem;
  justify-content: left;
  gap: 0.5rem;
`;

const HUDRelicImage = styled(RelicImage)`
  width: ${size};
  height: ${size};
`;

interface Props {
  game: GameState;
  onViewDeck: () => void;
}

export function HUD({ game, onViewDeck }: Props) {
  const { wins, losses, user } = game;
  const livesLeft = MAX_LOSSES - losses;

  return (
    <>
      <IconRow>
        <HUDLabel>
          <Icon src={livesImage} />
          <div>
            {livesLeft} {plural(livesLeft, 'rewind')}
          </div>
        </HUDLabel>

        <HUDLabel>
          {getIsBossBattle(game) ? <Icon src={skullImage} /> : <Icon src={battleImage} />}
          <div>{getIsBossBattle(game) ? 'boss battle' : `battle ${wins + 1}`}</div>
        </HUDLabel>

        <ClickableLabel onClick={onViewDeck}>
          <Icon src={deckImage} />
          <div>cards ({user.cards.length})</div>
        </ClickableLabel>
      </IconRow>
      <RelicRow>
        {user.relics.map((relic, i) => (
          <HUDRelicImage key={i} src={relic.image} $tribe={relic.tribe} />
        ))}
      </RelicRow>
    </>
  );
}
