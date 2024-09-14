import { Flip } from 'gsap/Flip';
import { useGSAP } from '@gsap/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { styled } from 'styled-components';

interface Props {
  currentCardIndex: number;
}

export default function Test() {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setCurrentCardIndex((prev) => prev + 1);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [currentCardIndex]);

  return <InnerTest currentCardIndex={currentCardIndex} />;
}

function InnerTest({ currentCardIndex }: Props) {
  const container = useRef(null);
  const flipState = useRef<Flip.FlipState>();
  const cards = ['1', '2', '3', '4', '5'];
  // const [currentCardIndex, setCurrentCardIndex] = useState(0);

  // Runs before render when currentCardIndex changes
  useMemo(() => {
    flipState.current = Flip.getState('.box');
    console.log('set');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCardIndex]);

  // useEffect(() => {
  //   const timeout = setTimeout(() => {
  //     setCurrentCardIndex((prev) => prev + 1);
  //     flipState.current = Flip.getState('.box');
  //     console.log('set');
  //   }, 1000);
  //   return () => clearTimeout(timeout);
  // }, [currentCardIndex]);

  useGSAP(
    () => {
      if (!flipState.current) return;
      console.log('animate');

      Flip.from(flipState.current, {
        ease: 'circ.inOut',
        duration: 0.6,
      });
    },
    { scope: container, dependencies: [currentCardIndex] },
  );

  console.log('render');

  return (
    <Root ref={container}>
      {/* {randoProp} */}
      {cards.map((_, i) => {
        const index = (currentCardIndex + i) % cards.length;
        const card = cards[index];
        return (
          <Card
            className="box"
            key={`box${card}`}
            style={{
              rotate: `0.0${card}turn`,
            }}
          >
            {card}
          </Card>
        );
      })}
    </Root>
  );
}

const Card = styled.div`
  height: 100px;
  width: 100px;
  border: 1px solid white;
`;

const Root = styled.div`
  border: 1px solid white;
  padding: 10px;
`;
