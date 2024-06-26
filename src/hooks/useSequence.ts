import { useState, useEffect, useRef } from 'react';

type GoTo = (sequenceFunction: SequenceFunction) => void;
export type SequenceFunction = (goTo: GoTo) => unknown;
export type Sequence = SequenceFunction[];

export function useSequence(sequenceFunctions: Sequence) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const isRunningSequenceFunction = useRef(false);

  useEffect(() => {
    const goTo: GoTo = (sequenceFunction: SequenceFunction) => {
      if (!isRunningSequenceFunction.current)
        throw new Error('useSequence: run called outside of sequence function');

      const nextIndex = sequenceFunctions.indexOf(sequenceFunction);
      if (nextIndex === -1)
        throw new Error('useSequence: run called with invalid sequence function');

      // set index one before what we want, since the index is incremented when the current
      // sequence function finishes.
      setCurrentIndex(nextIndex - 1);
    };

    (async () => {
      if (sequenceFunctions.length === 0) return;
      if (isRunningSequenceFunction.current) return;
      if (currentIndex > sequenceFunctions.length) return;

      isRunningSequenceFunction.current = true;
      await sequenceFunctions[currentIndex](goTo);

      setCurrentIndex((index) => {
        isRunningSequenceFunction.current = false;
        return index + 1;
      });
    })();
  }, [currentIndex, sequenceFunctions]);
}
