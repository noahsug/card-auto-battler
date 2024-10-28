import { useSpring } from '@react-spring/web';

export type ControllerUpdate<T> = Parameters<
  ReturnType<typeof useSpring<{ from: T }>>[1]['start']
>[0];
