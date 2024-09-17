import { styled } from 'styled-components';
import { useSprings, animated } from '@react-spring/web';

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
  const getIndex = (i: number) => (currentCardIndex + i) % cards.length;

  const [springs] = useSprings(
    cards.length,
    (i) => ({
      from: {
        y: i * cardSize,
      },
      to: {
        y: getIndex(i) * cardSize,
      },
    }),
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
