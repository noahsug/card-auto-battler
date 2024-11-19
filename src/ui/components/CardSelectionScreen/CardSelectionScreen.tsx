import { useState } from 'react';

import { NUM_CARD_SELECTION_PICKS } from '../../../game/constants';
import { CardState, GameState } from '../../../game/gameState';
import { Card } from '../Card';
import { BottomRow, CardGrid, Message, useCardSize } from '../CardGrid';
import { HUD } from '../HUD';
import { Button } from '../shared/Button';
import { ScrollingCenterContent } from '../shared/CenterContent';
import { Container } from '../shared/Container';

interface Props {
  game: GameState;
  cards: CardState[];
  onCardsSelected: (selectedCardIndexes: number[]) => void;
  onViewDeck: () => void;
}

export function CardSelectionScreen({ game, cards, onCardsSelected, onViewDeck }: Props) {
  const [selectedCardIndexes, setSelectedCardIndexes] = useState<number[]>([]);
  const cardSize = useCardSize();

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
    // indicate which cards are selected
    const opacity = selectedCardIndexes.includes(index) ? '0.33' : '1';
    return { opacity };
  }

  return (
    <Container>
      <HUD game={game} onViewDeck={onViewDeck} />

      <ScrollingCenterContent>
        <CardGrid>
          {cards.map((card, i) => (
            <Card
              key={i}
              card={card}
              size={cardSize}
              onClick={() => handleCardSelected(i)}
              style={getStyle(i)}
            />
          ))}
        </CardGrid>
      </ScrollingCenterContent>

      <BottomRow>
        {numCardsToPick > 0 && <Message>Select {numCardsToPick} Cards</Message>}
        {numCardsToPick <= 0 && <Button onClick={handleContinue}>Continue</Button>}
      </BottomRow>
    </Container>
  );
}
