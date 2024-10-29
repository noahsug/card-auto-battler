import { styled } from 'styled-components';

import { GameState } from '../../../game/gameState';
import { Card } from '../Card';
import { ScrollingCenterContent } from '../shared/CenterContent';
import { Container } from '../shared/Container';
import { Button } from '../shared/Button';
import { Row } from '../shared/Row';
import { CardGrid, useCardSize } from '../CardGrid';

const BackButton = styled(Button)`
  scale: 0.75;
  margin-bottom: 0.5rem;
`;

// // TODO: clicking on a card expands the card, clicking anywhere else closes the overlay
// function handleClick(event: React.MouseEvent) {
//   if ('classList' in event.target) {
//     console.log(event.target.classList);
//   }
// }

interface Props {
  game: GameState;
  onBack: () => void;
}

export function ViewDeckOverlay({ game, onBack }: Props) {
  const cardSize = useCardSize();

  return (
    <Container onClick={onBack}>
      <Row>
        <BackButton>back</BackButton>
      </Row>

      <ScrollingCenterContent>
        <CardGrid>
          {game.user.cards.map((card, i) => (
            <Card key={i} card={card} size={cardSize} />
          ))}
        </CardGrid>
      </ScrollingCenterContent>
    </Container>
  );
}
