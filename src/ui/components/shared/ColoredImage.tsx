import { styled } from 'styled-components';

const MaskedImage = styled.div<{ $src: string; $width: string; $height: string }>`
  mask-image: url(${({ $src }) => $src});
  -webkit-mask-image: url(${({ $src }) => $src});
  mask-size: 100% 100%;
  background-color: ${({ color }) => color};
  width: ${({ $width }) => $width};
  height: ${({ $height }) => $height};
`;
