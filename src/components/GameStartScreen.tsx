import styled from 'styled-components';

import { useActions } from './GameStateContext';
import { Screen } from './shared';

export default function GameStartScreen() {
  const { startGame } = useActions();

  return (
    <Root onClick={startGame}>
      <Bold>CLICK</Bold>
      to start
    </Root>
  );
}

const Root = styled(Screen)`
  font-size: 50rem;
`;

const Bold = styled.div`
  font-size: 80rem;
  font-weight: bold;
  color: darkred;
  margin-bottom: 20rem;
`;
