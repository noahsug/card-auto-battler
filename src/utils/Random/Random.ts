import { shuffle } from './shuffle';
import { sample } from './sample';
import { isNumber } from 'lodash';

// based on https://github.com/mljs/xsadd which is based on the XORSHIFT-ADD (XSadd) algorithm

const LOOP = 8;
const FLOAT_MUL = 1 / 16777216;

const sh1 = 15;
const sh2 = 18;
const sh3 = 11;

function multiplyUint32(n: number, m: number) {
  n >>>= 0;
  m >>>= 0;
  const nlo = n & 0xffff;
  const nhi = n - nlo;
  return (((nhi * m) >>> 0) + nlo * m) >>> 0;
}

function nextState(state: Uint32Array) {
  let t = state[0];
  t ^= t << sh1;
  t ^= t >>> sh2;
  t ^= state[3] << sh3;
  state[0] = state[1];
  state[1] = state[2];
  state[2] = state[3];
  state[3] = t;
}

function periodCertification(state: Uint32Array) {
  if (state[0] === 0 && state[1] === 0 && state[2] === 0 && state[3] === 0) {
    state[0] = 88; // X
    state[1] = 83; // S
    state[2] = 65; // A
    state[3] = 68; // D
  }
}

function createState(seed: number) {
  if (!Number.isInteger(seed)) {
    throw new TypeError('seed must be an integer');
  }

  const state = new Uint32Array([seed, 0, 0, 0]);

  for (let i = 1; i < LOOP; i++) {
    state[i & 3] ^=
      (i + multiplyUint32(1812433253, state[(i - 1) & 3] ^ ((state[(i - 1) & 3] >>> 30) >>> 0))) >>>
      0;
  }

  periodCertification(state);
  for (let i = 0; i < LOOP; i++) {
    nextState(state);
  }

  return state;
}

export function getRandomSeed(seedSeed: number = Math.random()) {
  if (seedSeed < 0 || seedSeed >= 1) {
    throw new RangeError(`The seed's seed must be between 0 and 1`);
  }
  return Math.floor(2 ** 32 * seedSeed);
}

export function getRandomState(seed: number = getRandomSeed()) {
  return createState(seed);
}

type RandomIntFn = {
  (max: number): number;
  (min: number, max: number): number;
};

export class Random {
  private state: Uint32Array = new Uint32Array(4);

  // Initialize Random from a seed (a single Uint32) or from an existing state.
  constructor(seed?: number);
  constructor(state: Uint32Array);
  constructor(seedOrState?: number | Uint32Array) {
    if (isNumber(seedOrState)) {
      this.seed(seedOrState);
    } else if (seedOrState) {
      this.setStateRef(seedOrState);
    } else {
      this.seed(getRandomSeed());
    }
  }

  // Returns a pseudorandom integer between 0 and 2^32 - 1.
  randomUint32 = () => {
    nextState(this.state);
    return (this.state[3] + this.state[2]) >>> 0;
  };

  // Returns a pseudorandom number between 0 and 1.
  random = () => {
    return (this.randomUint32() >>> 8) * FLOAT_MUL;
  };

  // Returns a pseudorandom integer between between min (default: 0) and max, inclusive.
  randomInt: RandomIntFn = (...args: unknown[]) => {
    if (args.length === 1) {
      const [max] = args as [number];
      return this.randomInt(0, max);
    }

    const [min, max] = args as [number, number];
    if (min > max) {
      throw new RangeError('min must be less than or equal to max');
    }
    return Math.floor(this.random() * (max - min + 1)) + min;
  };

  // shuffle array in place
  shuffle = <T>(array: T[]): T[] => {
    return shuffle(array, this.random);
  };

  sample = <T>(array: T[], size: number): T[] => {
    return sample(array, size, this.random);
  };

  pick = <T>(array: T[]): T => {
    return sample(array, 1, this.random)[0];
  };

  // Initialize with a new seed (a single Uint32)
  seed(seed: number) {
    this.state = createState(seed);
  }

  // returns a copy of the current state
  getState() {
    return new Uint32Array(this.state);
  }

  // sets the current state to a copy of the passed in state
  setState(state: Uint32Array) {
    this.setStateRef(new Uint32Array(state));
  }

  // returns a reference to the current state (changing the returned state will affect the Random
  // instance)
  getStateRef() {
    return this.state;
  }

  // sets the current state to the given reference (the passed in state will change with the Random
  // instance's state)
  setStateRef(state: Uint32Array) {
    this.state = state;
  }
}
