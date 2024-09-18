import { styled } from 'styled-components';
import { useSprings, animated } from '@react-spring/web';
import { useRef } from 'react';
import wait from '../../utils/wait';

interface Props {
  currentCardIndex: number;
}

const cardSize = 100;

const Root = styled.div`
  border: 1px solid white;
  height: ${cardSize}px;
  width: ${cardSize}px;
  padding: 10px;
  position: relative;
`;

const Card = styled(animated.div)`
  position: absolute;
  inset: 0;
  display: flex;
  height: ${cardSize}px;
  width: ${cardSize}px;
  border: 1px solid white;
  font-size: 40px;
  justify-content: center;
  align-items: center;
`;

export default function Test({ currentCardIndex }: Props) {
  const cards = ['1', '2', '3', '4', '5'];

  const cardIndex = useRef(currentCardIndex);
  cardIndex.current = currentCardIndex % cards.length;
  if (cardIndex.current < 0) {
    cardIndex.current = cards.length + cardIndex.current;
  }

  function getIndex(i: number) {
    return (i - cardIndex.current + cards.length) % cards.length;
  }
  function getEndPosition(i: number) {
    return { y: getIndex(i) * cardSize, x: 0, scale: 1 };
  }

  const [springs] = useSprings(
    cards.length,
    (i) => {
      const startPosition = { y: i * cardSize };

      const isPlayedCard = i === (cardIndex.current - 1 + cards.length) % cards.length;
      if (isPlayedCard) {
        return {
          from: startPosition,
          to: async (next) => {
            await next({ x: 200, scale: 2 });
            await wait(500);
            await next(getEndPosition(i));
          },
        };
      }

      return {
        from: startPosition,
        to: getEndPosition(i),
      };
    },
    [currentCardIndex],
  );

  return (
    <Root style={{ height: cardSize * cards.length }}>
      {springs.map((style, i) => {
        return (
          <Card key={i} style={style}>
            {cards[i]}
          </Card>
        );
      })}
    </Root>
  );
}
