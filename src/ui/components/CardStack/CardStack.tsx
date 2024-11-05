import { useState } from 'react';
import { styled } from 'styled-components';

import { baseCardSize, cardSizeScaling } from '../Card';
import { Props as AnimationProps, CardStackAnimation } from './CardStackAnimation';

interface Props extends Omit<AnimationProps, 'selfElement' | 'targetElement'> {
  targetElement: Element | null;
}

const cardSize = {
  height: baseCardSize.height * cardSizeScaling.medium,
  width: baseCardSize.width * cardSizeScaling.medium,
};

const Root = styled.div`
  position: relative;

  height: ${cardSize.height}rem;
  width: ${cardSize.width}rem;
`;

export function CardStack(props: Props) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  return (
    <Root ref={setContainer}>
      {container && props.targetElement && (
        <CardStackAnimation
          {...props}
          selfElement={container}
          targetElement={props.targetElement}
        />
      )}
    </Root>
  );
}
