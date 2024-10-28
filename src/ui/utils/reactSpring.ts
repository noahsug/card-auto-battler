import { useSpring } from '@react-spring/web';

export type ControllerUpdate<T> = Parameters<
  ReturnType<typeof useSpring<{ from: T }>>[1]['start']
>[0];

// TODO: doesn't work, ends up having "any" as the type
// export type TransitionTo<T> = Parameters<typeof useTransition<object, { enter: T }>>[1]['enter'];
