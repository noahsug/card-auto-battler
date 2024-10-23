import { styled } from 'styled-components';

export const CenterContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  flex: 1;
`;

export const ScrollingCenterContent = styled(CenterContent)`
  overflow-y: auto;
  padding-bottom: 0;
`;
