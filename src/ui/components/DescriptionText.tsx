import { styled } from 'styled-components';
import { Tribe, tribes } from '../../game/gameState';
import { assert } from '../../utils/asserts';
import { getCardColor } from './Card/getCardColor';

const Value = styled.span`
  font-weight: bold;
`;

const numericWords = ['twice', 'double', 'triple', 'quadruple', 'quintuple', 'crit'];

const tribeTextToHighlight: string[] = tribes.filter((tribe) => tribe !== 'basic');

function getWordListRegexString(words: string[]) {
  const capitalizedWords = words.map((word) => word[0].toUpperCase() + word.slice(1));
  return `${[...words, ...capitalizedWords].join('|')}`;
}

function TextLine({ text }: { text: string }) {
  const wordsMatcher = getWordListRegexString([...numericWords, ...tribeTextToHighlight]);

  const parts = text.split(new RegExp(`\\b(\\d+%{0,1}|${wordsMatcher})\\b`));
  return (
    <div>
      {parts.map((part, i) => {
        const isNumber = part.match(/^\d+%{0,1}$/) != null;
        const isNumericWord = numericWords.includes(part.toLocaleLowerCase());
        const isTribe = tribeTextToHighlight.includes(part.toLocaleLowerCase());
        if (!isNumber && !isNumericWord && !isTribe) return part;

        const style: React.CSSProperties = {};
        if (isNumber) {
          style.fontFamily = 'var(--font-number)';
          style.fontSize = '1.2em';
        } else if (isTribe) {
          style.color = getCardColor(part as Tribe, { saturate: 100, brighten: -62 });
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
