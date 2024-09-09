import { styled } from 'styled-components';

import Container from './shared/Container';
import suckerPunchImage from '../images/cards/sucker-punch.png';
import textBackground from '../images/text-background.png';

interface Props {
  size: 'small' | 'medium' | 'large';
}

export default function Card({ size }: Props) {
  return (
    <Root size={size}>
      <OuterContainer>
        <Title>Sucker Punch</Title>
        <Image src={suckerPunchImage} />
        <Text>
          <div>
            Deal <Value>3</Value> damage.
          </div>
          <div>Deal double damage if the enemy played at least two cards last turn.</div>
        </Text>
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
        return '2.5rem';
    }
  }};
`;

const CARD_COLOR = `hsla(26, 40%, 85%, 1)`;
const CARD_TITLE_COLOR = CARD_COLOR.replace('85', '90');

const OuterContainer = styled(Container)`
  height: 20em;
  width: 12em;
  text-align: center;
  color: var(--color-bg);
  background-color: ${CARD_COLOR};
  border-top-left-radius: 255px 15px;
  border-top-right-radius: 15px 225px;
  border-bottom-right-radius: 225px 15px;
  border-bottom-left-radius: 15px 255px;
  border: solid 0.5em var(--color-bg);
  padding: 0.5em 0;
`;

const Title = styled('h2')`
  width: 95%;
  mask-image: url(${textBackground});
  mask-repeat: no-repeat;
  mask-size: 100%;
  color: ${CARD_TITLE_COLOR};
  height: 1.2em;
  background-color: var(--color-bg);
`;

const Image = styled.img`
  height: 9em;
  object-fit: cover;
`;

const Text = styled.div`
  padding: 0.5em 0.25em 0;
  margin: auto;

  > div + div {
    margin-top: 0.2em;
  }
`;

const Value = styled.span`
  font-weight: bold;
  font-size: 1.1em;
`;
