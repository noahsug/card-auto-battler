import { useState } from 'react';
import { styled } from 'styled-components';

import { GameState, RelicState } from '../../../game/gameState';
import { assertIsNonNullable } from '../../../utils/asserts';
import { HUD } from '../HUD';
import { Button } from '../shared/Button';
import { ScrollingCenterContent } from '../shared/CenterContent';
import { Container } from '../shared/Container';
import { Relic } from './Relic';
import { BottomRowMessage, BottomRow } from '../shared/Row';

const RelicList = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: auto;

  > * {
    margin: 1.5rem 0.5rem;
  }
`;

interface Props {
  game: GameState;
  relics: RelicState[];
  onRelicSelected: (selectedRelicIndex: number) => void;
  onViewDeck: () => void;
}

export function AddRelicsScreen({ game, relics, onRelicSelected, onViewDeck }: Props) {
  const [selectedRelicIndex, setSelectedRelicIndex] = useState<number>();

  function handleContinue() {
    assertIsNonNullable(selectedRelicIndex);
    onRelicSelected(selectedRelicIndex);
  }

  function handleRelicSelected(index: number) {
    if (selectedRelicIndex === index) {
      setSelectedRelicIndex(undefined);
    } else {
      setSelectedRelicIndex(index);
    }
  }

  function getStyle(index: number) {
    // indicate which relic is selected
    const filter = selectedRelicIndex === index ? 'brightness(2.5)' : '';
    return { filter };
  }

  return (
    <Container>
      <HUD game={game} onViewDeck={onViewDeck} />

      <ScrollingCenterContent>
        <RelicList>
          {relics.map((relic, i) => (
            <Relic
              key={i}
              relic={relic}
              onClick={() => handleRelicSelected(i)}
              style={getStyle(i)}
            />
          ))}
        </RelicList>
      </ScrollingCenterContent>

      <BottomRow>
        {selectedRelicIndex == null ? (
          <BottomRowMessage>Select 1 Relic</BottomRowMessage>
        ) : (
          <Button onClick={handleContinue}>Continue</Button>
        )}
      </BottomRow>
    </Container>
  );
}
