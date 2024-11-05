import { useSpring, useSpringRef } from '@react-spring/web';

export type ControllerUpdate<T> = Parameters<
  ReturnType<typeof useSpring<{ from: T }>>[1]['start']
>[0];

export type Next = (options: object) => Promise<void>;

export type SpringRef = ReturnType<typeof useSpringRef>;
