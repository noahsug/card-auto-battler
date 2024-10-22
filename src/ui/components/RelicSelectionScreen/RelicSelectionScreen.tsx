import { useState } from 'react';
import { styled } from 'styled-components';

import { GameState, RelicState } from '../../../game/gameState';
import { assertIsNonNullable } from '../../../utils/asserts';
import { HUD } from '../HUD';
import { Button } from '../shared/Button';
import { CenterContent } from '../shared/CenterContent';
import { Container } from '../shared/Container';
import { Relic } from './Relic';

const RelicList = styled.div`
  display: flex;
  flex-direction: column;
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

interface Props {
  game: GameState;
  relics: RelicState[];
  onRelicSelected: (selectedRelicIndex: number) => void;
  onViewDeck: () => void;
}

export function RelicSelectionScreen({ game, relics, onRelicSelected, onViewDeck }: Props) {
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
    const opacity = selectedRelicIndex === index ? '0.33' : '1';
    return { opacity };
  }

  return (
    <Container>
      <HUD game={game} onViewDeck={onViewDeck} />

      <CenterContent>
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
      </CenterContent>

      <BottomRow>
        {selectedRelicIndex == null ? (
          <Message>Select a Relic</Message>
        ) : (
          <Button onClick={handleContinue}>Continue</Button>
        )}
      </BottomRow>
    </Container>
  );
}
