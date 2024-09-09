import { css } from 'styled-components';

export function getHandDrawnBorderRadius() {
  return css`
    border-top-left-radius: 255px 15px;
    border-top-right-radius: 15px 225px;
    border-bottom-right-radius: 225px 15px;
    border-bottom-left-radius: 15px 255px;
  `;
}

export function maskImage({ src }: { src: string }) {
  return css`
    mask-image: url(${src});
    -webkit-mask-image: url(${src});
    mask-repeat: no-repeat;
    mask-size: 100%;
  `;
}
