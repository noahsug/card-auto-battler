import { useState, useEffect, useRef } from 'react';

type Run = (sequenceFunction: SequenceFunction) => unknown;
export type SequenceFunction = (run: Run) => unknown;
export type Sequence = SequenceFunction[];

export default function useSequence(sequenceFunctions: Sequence) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const isRunningSequenceFunction = useRef(false);

  useEffect(() => {
    const run: Run = (sequenceFunction: SequenceFunction) => {
      if (!isRunningSequenceFunction.current)
        throw new Error('useSequence: run called outside of sequence function');

      const nextsequenceFunctionIndex = sequenceFunctions.indexOf(sequenceFunction);
      if (nextsequenceFunctionIndex === -1)
        throw new Error('useSequence: run called with invalid sequence function');

      setCurrentIndex(nextsequenceFunctionIndex - 1);
    };

    (async () => {
      if (sequenceFunctions.length === 0) return;
      if (isRunningSequenceFunction.current) return;
      if (currentIndex > sequenceFunctions.length) return;

      isRunningSequenceFunction.current = true;
      await sequenceFunctions[currentIndex](run);

      setCurrentIndex((index) => {
        isRunningSequenceFunction.current = false;
        return index + 1;
      });
    })();
  }, [currentIndex, sequenceFunctions]);
}
