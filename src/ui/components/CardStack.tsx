import { styled } from 'styled-components';
import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { Flip } from 'gsap/Flip';
import { useGSAP } from '@gsap/react';

import type { CardState } from '../../game/gameState';
import Card, { CardRoot } from './Card';

interface Props {
  cards: CardState[];
  currentCardIndex: number;
  direction: 'left' | 'right';
  // isActive: boolean;
}

const maxRotation = 1 / 33; // in turns
// store random rotations for each card, the same card will always have the same rotation
const rotations = new Array(20).fill(0).map(() => Math.random() * 2 * maxRotation - maxRotation);
function getRotation(index: number) {
  return rotations[index % rotations.length];
}

export default function CardStack({ cards, currentCardIndex, direction }: Props) {
  const container = useRef(null);
  const animationStates = useRef<Flip.FlipState[]>([]);
  // const cardElements = gsap.utils.toArray<Element>('.card', container.current);

  // cardElements.forEach((element, i) => {
  //   const index = (cards.length + currentCardIndex - 1 - i) % cards.length;
  //   const rotation = getRotation(index);
  //   gsap.set(element, { rotation });
  // });

  useMemo(() => {
    const cardElements = gsap.utils.toArray<Element>('.card', container.current);
    animationStates.current = cardElements.map((element) => Flip.getState(element));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCardIndex]);

  // const prevCurrentCardIndex = useRef(currentCardIndex);
  // const [activeCardIndex, setActiveCardIndex] = useState(-1);

  // useEffect(() => {
  //   if (prevCurrentCardIndex.current === currentCardIndex) return;

  //   const cardElements = gsap.utils.toArray<Element>('.card', container.current);
  //   animationState.current = Flip.getState(cardElements);

  //   setActiveCardIndex(prevCurrentCardIndex.current);
  //   prevCurrentCardIndex.current = currentCardIndex;
  // }, [currentCardIndex]);

  useGSAP(
    () => {
      // if (!animationState.current || activeCardIndex === -1) return;
      if (animationStates.current.length === 0) return;

      const otherCardAnimations = animationStates.current.slice(0, -1);
      otherCardAnimations.forEach((state) => {
        Flip.from(state, {
          duration: 0.5,
          ease: 'power3.inOut',
        });
      });

      const playedCardAnimation = animationStates.current[animationStates.current.length - 1];
      const playedCard = playedCardAnimation.targets[0];
      const rotation = getRotation((currentCardIndex - 1) % cards.length);

      const tl = gsap.timeline();
      const fit = Flip.fit(playedCard, playedCardAnimation, {
        duration: 0,
        ease: 'power3.inOut',
      });
      tl.add(fit as gsap.core.Tween)
        .set(playedCard, { zIndex: 1 })
        .to(playedCard, {
          duration: 0.5,
          ease: 'power3.inOut',
          y: '-10rem',
          scale: 2,
          rotation: 0,
        })
        .to(
          playedCard,
          {
            duration: 0.5,
            ease: 'back.in',
            y: '-100vh',
          },
          '+=1',
        )
        .then(() => {
          gsap.set(playedCard, {
            x: '-100vw',
            y: 0,
            scale: 1,
            zIndex: 0,
            rotation: rotation * 360,
          });
          const state = Flip.getState(playedCard);
          gsap.set(playedCard, { x: 0 });
          Flip.from(state, {
            delay: 0.5,
            duration: 1,
            ease: 'power3.inOut',
          });
        });
    },
    { scope: container, dependencies: [animationStates.current] },
  );

  return (
    <div ref={container}>
      <StackedCardsContainer $direction={direction === 'left' ? -1 : 1}>
        {cards.map((_, i) => {
          // display cards in reverse order, so the next card is on top (aka at the end)
          const index = (cards.length + currentCardIndex - 1 - i) % cards.length;
          // if (index === activeCardIndex) return null;
          return (
            <Card
              key={index}
              // data-flip-id={`card-${index}`}
              card={cards[index]}
              size="small"
              type="user"
              rotation={getRotation(index)}
            />
          );
        })}
      </StackedCardsContainer>

      {/* {activeCardIndex !== -1 && (
        <ActiveCardContainer>
          <Card
            key={activeCardIndex}
            // data-flip-id={`card-${activeCardIndex}`}
            card={cards[activeCardIndex]!}
            size="medium"
            type="user"
            rotation={getRotation(activeCardIndex)}
          />
        </ActiveCardContainer>
      )} */}
    </div>
  );
}

const maxGap = 3; // rem
const maxCardsDisplayed = 3;

function getOffset(i: number) {
  const displayNumber = Math.min(i, maxCardsDisplayed);
  const ratio = Math.sin((Math.PI / 2) * (displayNumber / maxCardsDisplayed));
  return maxGap * ratio;
}

function getCardGaps({ $direction }: { $direction: number }) {
  const gaps = [];
  for (let i = 0; i < maxCardsDisplayed - 1; i++) {
    const offset = getOffset(i) * $direction;
    gaps.push(`
      &:nth-last-child(${i + 1}) {
        left: ${offset}rem;
      }
    `);
  }
  return gaps.join('\n');
}

const StackedCardsContainer = styled.div<{ $direction: number }>`
  position: relative;

  /* matches Card width/height */
  height: ${20 * 0.8}rem;
  width: ${12 * 0.8}rem;

  ${CardRoot} {
    position: absolute;
    left: ${(props) => maxGap * props.$direction}rem;

    ${getCardGaps}
  }
`;

const ActiveCardContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
  z-index: 1;
  opacity: 0.5;
`;
