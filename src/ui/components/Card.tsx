import { styled, ThemeProvider } from 'styled-components';

import '../index.css';
import Container from './shared/Container';
import suckerPunchImage from '../images/cards/sucker-punch.jpeg';

interface Props {
  size: 'small' | 'medium' | 'large';
}

export default function Card({ size }: Props) {
  return (
    <ThemeProvider theme={{ size }}>
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
    </ThemeProvider>
  );
}

const OuterContainer = styled.div`
  height: ${({ theme }) =>
    theme.size === 'small' ? '12rem' : theme.size === 'medium' ? '18rem' : '24rem'};
  width: 12rem;
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
  font-family: '3Dumb';
`;

const Text = styled.div`
  font-size: 0.8rem;
  text-align: center;
  margin: auto;
`;
