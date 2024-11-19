import { styled } from 'styled-components';

import livesImage from '../../images/hourglass.png';
import battleImage from '../../images/swords.png';
import skullImage from '../../images/skull.png';
import deckImage from './cards.png';

import { MAX_LOSSES, MAX_WINS } from '../../../game/constants';
import { GameState } from '../../../game/gameState';
import { maskImage } from '../../style';
import { RelicImage } from '../RelicSelectionScreen/Relic';
import { Row } from '../shared/Row';
import { getIsBossBattle } from '../../../game/utils/selectors';
import { plural } from '../../../utils/plural';

const size = 'max(1.7rem, 4vmin)';
const padding = 'max(0.6rem, 2vmin)';

const IconRow = styled(Row)`
  justify-content: space-between;
`;

const Label = styled(Row)`
  font-size: ${size};
  font-family: var(--font-heading);
  background-color: var(--color-bg-opaque);
  padding: ${padding};
  justify-content: center;
`;

const ClickableLabel = styled(Label)`
  cursor: pointer;
`;

const Icon = styled.div<{ src: string }>`
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
        <Label>
          <Icon src={livesImage} />
          <div>
            {livesLeft} {plural(livesLeft, 'rewind')}
          </div>
        </Label>

        <Label>
          {getIsBossBattle(game) ? <Icon src={skullImage} /> : <Icon src={battleImage} />}
          <div>{getIsBossBattle(game) ? 'boss battle' : `battle ${wins + 1}`}</div>
        </Label>

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
