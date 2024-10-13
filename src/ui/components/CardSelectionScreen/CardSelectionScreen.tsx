import { useState } from 'react';
import { styled } from 'styled-components';

import { NUM_CARD_SELECTION_PICKS } from '../../../game/constants';
import { CardState } from '../../../game/gameState';
import { Card } from '../Card';
import Button from '../shared/Button';
import Container from '../shared/Container';

interface Props {
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

const Message = styled.h2`
  text-align: center;
  font-size: 2.5rem;
`;

const BottomRow = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: end;
  margin-bottom: 0.25rem;
`;

// TODO: add lives/rounds
export function CardSelectionScreen({ cards, onCardsSelected }: Props) {
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
      <BottomRow>
        {numCardsToPick > 0 && <Message>Select {numCardsToPick} Cards</Message>}
        {numCardsToPick <= 0 && <Button onClick={handleContinue}>Continue</Button>}
      </BottomRow>
    </Container>
  );
}
