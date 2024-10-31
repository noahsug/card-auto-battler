import { animated } from '@react-spring/web';
import { useEffect, useRef, useState } from 'react';
import { styled } from 'styled-components';

import { Card, baseCardSize, cardSizeScaling } from '../Card';
import { Props as AnimationProps, useCardStackAnimation } from './useCardStackAnimation';

type Props = Omit<AnimationProps, 'selfElement'>;

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
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  const render = useCardStackAnimation({
    ...props,
    selfElement: container,
  });

  return (
    <div>
      <StackedCardsContainer ref={setContainer}>
        {render((style, { card }) => (
          <AnimatedContainer style={style}>
            <Card card={card} size="medium" />
          </AnimatedContainer>
        ))}
      </StackedCardsContainer>
    </div>
  );
}
