import { Flip } from 'gsap/Flip';
import { useGSAP } from '@gsap/react';
import { useEffect, useRef, useState } from 'react';

export default function Test() {
  const container = useRef(null);
  const flipState = useRef<Flip.FlipState>();
  const [expand, setExpand] = useState(true);
  const [text, setText] = useState(0);

  function handleClick() {
    setText(text + 1);
  }

  // For demonstration
  useEffect(() => {
    const timer = setTimeout(() => {
      flipState.current = Flip.getState('.box');
      setExpand(!expand);
    }, 1000);
    return () => clearTimeout(timer);
  }, [expand]);

  useGSAP(
    () => {
      if (!flipState.current) return;
      Flip.from(flipState.current, {
        ease: 'expo.inOut',
        duration: 0.6,
        // fade: true,
        // absolute: true,
        // scale: true,
      });
    },
    { scope: container, dependencies: [expand] },
  );

  return (
    <button onClick={handleClick} ref={container} style={{ background: 'none', border: 'none' }}>
      {text}
      <div
        style={{
          height: '200px',
          width: '200px',
          backgroundColor: 'white',
        }}
      >
        <div
          className="box"
          data-flip-id="box"
          style={{
            display: expand ? 'none' : 'block',
            height: '100px',
            width: '100px',
            backgroundColor: 'white',
            border: '1px solid black',
          }}
        ></div>
      </div>
      <div
        style={{
          height: '200px',
          width: '200px',
          backgroundColor: 'white',
        }}
      >
        <div
          className="box"
          data-flip-id="box"
          style={{
            display: expand ? 'block' : 'none',
            height: '100px',
            width: '100px',
            backgroundColor: 'white',
            border: '1px solid black',
          }}
        ></div>
      </div>
    </button>
  );
}
