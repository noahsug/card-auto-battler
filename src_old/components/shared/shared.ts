import styled from 'styled-components';

export const Screen = styled.div`
  text-align: center;
  align-items: center;
  justify-content: center;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

export const Title = styled.div`
  font-size: 50rem;
  margin-bottom: 20rem;
`;

export const Subtitle = styled.div`
  font-size: 30rem;
  margin-bottom: 12rem;
`;

export const TopRightButton = styled.button`
  position: absolute;
  top: 10rem;
  right: 10rem;
  font-size: 20rem;
  padding: 1rem 2rem;
  border: none;
  text-decoration: underline;
  background-color: #fff;
  cursor: pointer;
`;
