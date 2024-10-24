import { styled } from 'styled-components';
import { assert } from '../../utils/asserts';
import { Number } from './shared/Number';

const Value = styled(Number)`
  font-weight: bold;
  font-size: 1.1em;
`;

function TextLine({ text }: { text: string }) {
  const parts = text.split(/(\d+)/);
  return (
    <div>
      {parts.map((part, i) => {
        if (!/\d+/.test(part)) return part;

        const fontFamily = 'var(--font-number)';
        return (
          <Value style={{ fontFamily }} key={i}>
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
  assert(text.endsWith('.'));
  const textLines = text.split('.').slice(0, -1);

  return (
    <>
      {textLines.map((text, i) => (
        <TextLine text={text} key={i} />
      ))}
    </>
  );
}
