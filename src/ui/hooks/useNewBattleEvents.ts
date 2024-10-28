// import { BattleEvent } from '../../game/actions';
// import { useMemo, useRef } from 'react';

// // We assume battle events are only ever added to or cleared
// export function useNewBattleEvents(battleEvents: BattleEvent[]): BattleEvent[] {
//   const newBattleEvents = useRef<BattleEvent[]>();

//   useMemo(() => {
//     if (battleEvents.length === 0) {
//       newBattleEvents.current = [];
//     } else {
//       const eventsToAdd = battleEvents.slice(textAnimationsRef.current.length);
//       textAnimationsRef.current.push(...newBattleEvents.map(createTextAnimation));
//     }
//   }, [battleEvents]);
// }
