import styled from 'styled-components';

import { Screen } from './shared';
import Card from './Card';
import { cards } from '../gameState/cards';

export default function CardCollectionScreen() {
  const cardComponents = cards.map((card, i) => {
    return <Card key={i} card={card} scale={0.75} />;
  });

  return (
    <Root>
      <CardGrid>{cardComponents}</CardGrid>
    </Root>
  );
}

const CardGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;

  > * {
    margin: 10rem;
  }
`;

const Root = styled(Screen)`
  font-size: 50rem;
  height: auto;
`;
