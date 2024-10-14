import { useState } from 'react';
import { styled } from 'styled-components';

import { NUM_CARD_SELECTION_PICKS } from '../../../game/constants';
import { CardState, GameState } from '../../../game/gameState';
import { Card } from '../Card';
import { Button } from '../shared/Button';
import { Container } from '../shared/Container';
import { HUD } from '../HUD';
import { CenterContent } from '../shared/CenterContent';

interface Props {
  game: GameState;
  cards: CardState[];
  onCardsSelected: (selectedCardIndexes: number[]) => void;
}

const CardGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;

  > * {
    margin: 0.25rem 0.25rem;
  }
`;

const bottomRowHeight = 4;

const Message = styled.h2`
  text-align: center;
  font-size: 2.5rem;
  line-height: ${bottomRowHeight}rem;
`;

const BottomRow = styled.div`
  margin: 0 auto 0.25rem;
  height: ${bottomRowHeight}rem;
`;

export function CardSelectionScreen({ game, cards, onCardsSelected }: Props) {
  const [selectedCardIndexes, setSelectedCardIndexes] = useState<number[]>([]);

  const numCardsToPick = NUM_CARD_SELECTION_PICKS - selectedCardIndexes.length;

  function handleCardSelected(index: number) {
    if (selectedCardIndexes.includes(index)) {
      // unselect card
      setSelectedCardIndexes((prev) => prev.filter((i) => i !== index));
    } else if (numCardsToPick > 0) {
      // select card
      setSelectedCardIndexes((prev) => [...prev, index]);
    }
  }

  function handleContinue() {
    onCardsSelected(selectedCardIndexes);
  }

  function getStyle(index: number) {
    // hide card after it's been selected
    const opacity = selectedCardIndexes.includes(index) ? '0.33' : '1';
    return { opacity };
  }

  return (
    <Container>
      <HUD game={game} />

      <CenterContent>
        <CardGrid>
          {cards.map((card, i) => (
            <Card
              key={i}
              card={card}
              size={'small'}
              onClick={() => handleCardSelected(i)}
              style={getStyle(i)}
            />
          ))}
        </CardGrid>
      </CenterContent>

      <BottomRow>
        {numCardsToPick > 0 && <Message>Select {numCardsToPick} Cards</Message>}
        {numCardsToPick <= 0 && <Button onClick={handleContinue}>Continue</Button>}
      </BottomRow>
    </Container>
  );
}
