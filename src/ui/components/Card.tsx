import { styled } from 'styled-components';

import Container from './shared/Container';
import suckerPunchImage from '../images/cards/sucker-punch.jpeg';

export default function Card() {
  return (
    <OuterContainer>
      <InnerContainer>
        <Title>Sucker Punch</Title>
        <img src={suckerPunchImage} />
        <Text>
          <div>Deal 3 damage.</div>
          <div>Repeat for each bleed the enemy has.</div>
        </Text>
      </InnerContainer>
    </OuterContainer>
  );
}

const OuterContainer = styled.div`
  height: 12rem;
  width: 7rem;
  background-color: #461513;
  border-radius: 1rem;
  border: 0.4rem solid #461513;
`;

const InnerContainer = styled(Container)`
  height: 100%;
  border-radius: 1rem;
  background-color: #cfb59e;
`;

const Title = styled.div`
  text-align: center;
`;

const Text = styled.div`
  font-size: 0.8rem;
  text-align: center;
  margin: auto;
`;
