import { useCallback, useEffect, useState } from 'react';
import { styled } from 'styled-components';
import sortBy from 'lodash/sortBy';

import { applyCardOrderingEffects } from '../../../game/utils/cards';
import { CardState, GameState } from '../../../game/gameState';
import { plural } from '../../../utils/plural';
import { useUnits } from '../../hooks/useUnits';
import { Card } from '../Card';
import { HUD } from '../HUD';
import { Button } from '../shared/Button';
import { ScrollingCenterContent } from '../shared/CenterContent';
import { Container } from '../shared/Container';
import { BottomRow, BottomRowMessage } from '../shared/Row';

const CardGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  overflow-y: auto;
`;

interface Props {
  game: GameState;
  cards: CardState[];
  buttonText: string;
  invalidSelections?: number[];
  numCardSelections?: number;
  onViewDeck?: () => void;
  onCardSelectionChange?: (selectedCardIndexes: number[]) => void;
  onCardsSelected?: (cards: CardState[]) => void;
}

export function CardSelection({
  game,
  cards,
  buttonText,
  invalidSelections = [],
  numCardSelections = 0,
  onViewDeck,
  onCardSelectionChange,
  onCardsSelected,
}: Props) {
  const [, windowDimensions] = useUnits();
  const cardSize = windowDimensions.width >= windowDimensions.height ? 'large' : 'small';

  const [selectedCardIndexes, setSelectedCardIndexes] = useState<number[]>([]);
  const cardSelectionsRemaining = numCardSelections - selectedCardIndexes.length;

  const handleCardSelected = useCallback(
    (index: number) => {
      if (invalidSelections.includes(index)) return;

      if (selectedCardIndexes.includes(index)) {
        // unselect card
        setSelectedCardIndexes((prev) => prev.filter((i) => i !== index));
      } else if (cardSelectionsRemaining > 0) {
        // select card
        setSelectedCardIndexes((prev) => [...prev, index]);
      } else {
        // replace the last selected card
        setSelectedCardIndexes((prev) => {
          const copy = [...prev];
          copy.pop();
          return [...copy, index];
        });
      }
    },
    [cardSelectionsRemaining, invalidSelections, selectedCardIndexes],
  );

  const handleContinue = useCallback(() => {
    onCardsSelected?.(selectedCardIndexes.map((i) => cards[i]));
  }, [cards, onCardsSelected, selectedCardIndexes]);

  useEffect(() => {
    onCardSelectionChange?.(selectedCardIndexes);
  }, [onCardSelectionChange, selectedCardIndexes]);

  // indicate which cards are selected
  function getStyle(index: number) {
    if (selectedCardIndexes.includes(index)) {
      return { scale: '1', filter: 'brightness(1.15)' };
    } else if (
      invalidSelections.includes(index) ||
      (cardSelectionsRemaining === 0 && numCardSelections > 0)
    ) {
      return { scale: '.85', filter: 'brightness(.5)' };
    } else {
      return { scale: '.85', filter: '' };
    }
  }

  return (
    <Container>
      {onViewDeck && <HUD game={game} onViewDeck={onViewDeck} />}

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
        {cardSelectionsRemaining > 0 ? (
          <BottomRowMessage>
            {buttonText} {cardSelectionsRemaining} {plural(cardSelectionsRemaining, 'Card')}
          </BottomRowMessage>
        ) : (
          <Button onClick={handleContinue}>{buttonText}</Button>
        )}
      </BottomRow>
    </Container>
  );
}

export function sortCards(cards: CardState[]) {
  const sortedCards = sortBy(cards, (card) => card.acquiredId);
  return applyCardOrderingEffects(sortedCards);
}
