import { styled } from 'styled-components';
import { Z_INDEX } from '../../constants';

export const OverlayBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: ${Z_INDEX.overlay};
`;
