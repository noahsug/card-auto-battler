import { useCallback, useState } from 'react';
import cloneDeep from 'lodash/cloneDeep';

import { CardState, GameState } from '../../../game/gameState';
import { plural } from '../../../utils/plural';
import { Card } from '../Card';
import { CardGrid, useCardSize } from '../CardGrid';
import { HUD } from '../HUD';
import { Button } from '../shared/Button';
import { ScrollingCenterContent } from '../shared/CenterContent';
import { Container } from '../shared/Container';
import { BottomRow, BottomRowMessage } from '../shared/Row';

interface Props {
  game: GameState;
  onCardsSelected: (selectedCardIndexes: number[]) => void;
  onViewDeck: () => void;
}

export function CardChainScreen({ game, onCardsSelected, onViewDeck }: Props) {
  const [selectedCardIndexes, setSelectedCardIndexes] = useState<number[]>([]);
  const cardSize = useCardSize();
  const cards = cloneDeep(game.user.cards);

  // mark selected cards as chained
  const fromCard = cards[selectedCardIndexes[0]];
  const toCard = cards[selectedCardIndexes[1]];
  if (fromCard) fromCard.chain.toId = toCard?.acquiredId || -1;
  if (toCard) toCard.chain.fromId = fromCard?.acquiredId || -1;

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

  // indicate which cards are selected
  function getStyle(index: number) {
    const scale = selectedCardIndexes.includes(index) ? '1' : '.85';
    return { scale };
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
          <Button onClick={handleContinue}>Chain</Button>
        )}
      </BottomRow>
    </Container>
  );
}
