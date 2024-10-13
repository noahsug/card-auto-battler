import { animated } from '@react-spring/web';
import { useRef } from 'react';
import { styled } from 'styled-components';

import { Card, baseCardSize, cardSizeScaling } from '../Card';
import { Props as AnimationProps, useCardStackAnimation } from './useCardStackAnimation';

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

  height: ${cardSize.height}rem;
  width: ${cardSize.width}rem;
`;

const AnimatedContainer = styled(animated.div)`
  position: absolute;
  inset: 0;
`;

export function CardStack(props: Props) {
  const container = useRef<HTMLDivElement>(null);
  const { playerType, ...animationProps } = props;

  // for the user, cards fly out from the left to the right
  const cardDealDirection = playerType === 'user' ? 1 : -1;

  const render = useCardStackAnimation({
    ...animationProps,
    selfElement: container.current,
    cardDealDirection,
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
