import { useCallback, useState } from 'react';

import { CardState, GameState } from '../../../game/gameState';
import { Card } from '../Card';
import { CardGrid, useCardSize } from '../CardGrid';
import { HUD } from '../HUD';
import { Button } from '../shared/Button';
import { ScrollingCenterContent } from '../shared/CenterContent';
import { Container } from '../shared/Container';
import { BottomRow, BottomRowMessage } from '../shared/Row';
import { plural } from '../../../utils/plural';

interface Props {
  game: GameState;
  onCardsSelected: (selectedCardIndexes: number[]) => void;
  onViewDeck: () => void;
}

export function CardChainScreen({ game, onCardsSelected, onViewDeck }: Props) {
  const [selectedCardIndexes, setSelectedCardIndexes] = useState<number[]>([]);
  const cardSize = useCardSize();
  const cards = game.user.cards;

  const numCardsToPick = 2 - selectedCardIndexes.length;

  function handleCardSelected(index: number) {
    if (selectedCardIndexes.includes(index)) {
      // unselect card
      setSelectedCardIndexes((prev) => prev.filter((i) => i !== index));
    } else if (numCardsToPick > 0) {
      // select card
      setSelectedCardIndexes((prev) => [...prev, index]);
    }
  }

  const handleContinue = useCallback(() => {
    onCardsSelected(selectedCardIndexes);
  }, [onCardsSelected, selectedCardIndexes]);

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
        {numCardsToPick > 0 ? (
          <BottomRowMessage>
            Chain {numCardsToPick} {plural(numCardsToPick, 'Card')}
          </BottomRowMessage>
        ) : (
          <Button onClick={handleContinue}>Continue</Button>
        )}
      </BottomRow>
    </Container>
  );
}
