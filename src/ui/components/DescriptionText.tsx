import { styled } from 'styled-components';
import { CardColor, cardColors } from '../../game/gameState';
import { assert } from '../../utils/asserts';
import { getCardColor } from './Card/cardColor';

const Value = styled.span`
  font-weight: bold;
`;

const numericWords = ['double', 'triple', 'quadruple', 'quintuple'];

const cardColorsToHighlight: string[] = cardColors.filter((color) => color !== 'basic');

function TextLine({ text }: { text: string }) {
  const parts = text.split(
    new RegExp(`(\\d+%{0,1}|${numericWords.join('|')}|${cardColorsToHighlight.join('|')})`),
  );
  return (
    <div>
      {parts.map((part, i) => {
        const isNumber = part.match(/^\d+%{0,1}$/) != null;
        const isNumericWord = numericWords.includes(part);
        const isColor = cardColorsToHighlight.includes(part);
        if (!isNumber && !isNumericWord && !isColor) return part;

        const style: React.CSSProperties = {};
        if (isNumber) {
          style.fontFamily = 'var(--font-number)';
          style.fontSize = '1.2em';
        } else if (isColor) {
          style.color = getCardColor(part as CardColor, { saturate: 100, brighten: -62 });
          style.textDecoration = 'uppercase';
        }

        return (
          <Value style={style} key={i}>
            {part}
          </Value>
        );
      })}
      .
    </div>
  );
}

export function DescriptionText({ text }: { text: string }) {
  // 'hi there. bob.' -> '[hi there, bob]'
  assert(text.endsWith('.'), 'description text must end with a period');
  const textLines = text.split('.').slice(0, -1);

  return (
    <>
      {textLines.map((text, i) => (
        <TextLine text={text} key={i} />
      ))}
    </>
  );
}
