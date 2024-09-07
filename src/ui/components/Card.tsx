import { styled } from 'styled-components';

import Container from './shared/Container';
import suckerPunchImage from '../images/cards/sucker-punch.jpeg';

interface Props {
  size: 'small' | 'medium' | 'large';
}

export default function Card({ size }: Props) {
  return (
    <Root size={size}>
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
    </Root>
  );
}

const Root = styled.div<Props>`
  font-size: ${({ size }) => {
    switch (size) {
      case 'small':
        return '0.8rem';
      case 'medium':
        return '1rem';
      case 'large':
        return '2rem';
    }
  }};
`;

const OuterContainer = styled.div`
  height: 20em;
  width: 12em;
  background-color: #461513;
  border-radius: 1em;
  border: 0.4em solid #461513;
  text-align: center;
`;

const InnerContainer = styled(Container)`
  height: 100%;
  border-radius: 1em;
  background-color: #cfb59e;
`;

const Title = styled('h2')`
  margin-top: 0.5em;
`;

const Text = styled.div`
  margin: auto;
  padding-bottom: 0.5em;
`;
