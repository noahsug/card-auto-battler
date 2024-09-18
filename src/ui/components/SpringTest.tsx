import { styled } from 'styled-components';
import { useTransition, animated } from '@react-spring/web';
import { useRef } from 'react';

import wait from '../../utils/wait';

interface Props {
  currentCardIndex: number;
  cards: number[];
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

export default function Test({ currentCardIndex, cards }: Props) {
  const cardIndex = useRef(currentCardIndex);
  cardIndex.current = currentCardIndex % cards.length;
  if (cardIndex.current < 0) {
    cardIndex.current = cards.length + cardIndex.current;
  }

  const playedCardIndex = (cardIndex.current - 1 + cards.length) % cards.length;

  function getDeckIndex(i: number) {
    return (i - cardIndex.current + cards.length) % cards.length;
  }
  function getEndPosition(i: number) {
    return { y: getDeckIndex(i) * cardSize, x: 0, scale: 1, opacity: 1 };
  }
  function animatePlayCard(i: number) {
    return async (next: (...args: unknown[]) => Promise<void>) => {
      await next({ x: 200, scale: 2 });
      await wait(500);
      await next(getEndPosition(i));
    };
  }

  const transitions = useTransition(cards, {
    key: (card: number) => card,
    from: { y: -100 },
    enter: (_, i: number) => getEndPosition(i),
    update: (_, i: number) => (i === playedCardIndex ? animatePlayCard(i) : getEndPosition(i)),
    leave: () => [{ x: -200 }, { scale: 0.1, opacity: 0 }],
  });

  return (
    <Root style={{ height: cardSize * cards.length }}>
      {transitions((style, item) => (
        <Card style={style}>{item}</Card>
      ))}
    </Root>
  );
}
