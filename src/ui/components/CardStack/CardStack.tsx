import { styled } from 'styled-components';
import { useRef } from 'react';
import { animated } from '@react-spring/web';

import { Props as AnimationProps, useCardStackAnimation } from './useCardStackAnimation';
import { Card, baseCardSize, cardSizeScaling } from '../Card';

interface Props
  extends Pick<AnimationProps, 'cards' | 'currentCardIndex' | 'targetElement' | 'turn'> {
  playerType: 'user' | 'enemy';
}

const cardSize = {
  height: baseCardSize.height * cardSizeScaling.medium,
  width: baseCardSize.width * cardSizeScaling.medium,
};

const StackedCardsContainer = styled.div`
  position: relative;

  /* matches Card width/height */
  height: ${cardSize.height}rem;
  width: ${cardSize.width}rem;
`;

const AnimatedContainer = styled(animated.div)`
  position: absolute;
  inset: 0;
`;

export function CardStack({ cards, currentCardIndex, targetElement, playerType, turn }: Props) {
  const container = useRef<HTMLDivElement>(null);

  // for the user, cards fly out from the left to the right
  const cardDealDirection = playerType === 'user' ? 1 : -1;

  const render = useCardStackAnimation({
    cards,
    currentCardIndex,
    selfElement: container.current,
    targetElement,
    cardDealDirection,
    turn,
  });

  const cardColor = playerType === 'user' ? 'regular' : 'red';
  return (
    <div>
      <StackedCardsContainer ref={container}>
        {render((style, { card }) => (
          <AnimatedContainer style={style}>
            <Card card={card} size="medium" color={cardColor} />
          </AnimatedContainer>
        ))}
      </StackedCardsContainer>
    </div>
  );
}
