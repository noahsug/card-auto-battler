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

export class Random {
  private state: Uint32Array = new Uint32Array(4);

  static getRandomSeed(seedSeed: number = Math.random()) {
    if (seedSeed < 0 || seedSeed >= 1) {
      throw new RangeError(`The seed's seed must be between 0 and 1`);
    }
    return Math.floor(2 ** 32 * seedSeed);
  }

  static getRandomState(seed: number = Random.getRandomSeed()) {
    return createState(seed);
  }

  constructor(seed?: number);
  constructor(state: Uint32Array);
  constructor(seedOrState?: number | Uint32Array) {
    if (seedOrState instanceof Uint32Array) {
      this.setStateRef(seedOrState);
    } else {
      this.seed(seedOrState ?? Random.getRandomSeed());
    }

    this.next = this.next.bind(this);
    this.nextInt = this.nextInt.bind(this);
  }

  // Returns a pseudorandom number between 0 and 1.
  public next() {
    return (this.nextUint32() >>> 8) * FLOAT_MUL;
  }

  // Returns a pseudorandom integer between between min (default: 0) and max (default: 2^32 - 1),
  // inclusive.
  public nextInt(): number;
  public nextInt(max: number): number;
  public nextInt(min: number, max: number): number;
  public nextInt(...args: unknown[]) {
    if (args.length === 0) {
      return this.nextUint32();
    }

    if (args.length === 1) {
      const [max] = args as [number];
      return this.nextInt(0, max);
    }

    const [min, max] = args as [number, number];
    if (min > max) {
      throw new RangeError('min must be less than or equal to max');
    }
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  public seed(seed: number) {
    this.state = createState(seed);
  }

  // returns a copy of the current state
  public getState() {
    return new Uint32Array(this.state);
  }

  // sets the current state to a copy of the passed in state
  public setState(state: Uint32Array) {
    this.setStateRef(new Uint32Array(state));
  }

  // returns a reference to the current state (changing the returned state will affect the Random
  // instance)
  public getStateRef() {
    return this.state;
  }

  // sets the current state to the given reference (the passed in state will change with the Random
  // instance's state)
  public setStateRef(state: Uint32Array) {
    if (state.length !== 4) {
      throw new TypeError('state must be an Uint32Array of length 4');
    }
    this.state = state;
  }

  // Returns a pseudorandom integer between 0 and 2^32 - 1.
  private nextUint32() {
    nextState(this.state);
    return (this.state[3] + this.state[2]) >>> 0;
  }
}
