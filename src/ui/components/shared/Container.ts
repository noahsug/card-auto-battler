import { styled } from 'styled-components';

export const Container = styled.div`
  position: relative;
  height: 100vh;
  display: flex;
  margin: auto;
  flex-flow: column;
  padding: 1rem 0.5rem;
`;

export const ScrollingContainer = styled(Container)`
  overflow-y: auto;
  padding-bottom: 0;
`;
