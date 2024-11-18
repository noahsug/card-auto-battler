import { Random, getRandomSeed, getRandomState } from './Random';

describe('next', () => {
  it('generates a random float from 0 to 1', () => {
    const random = new Random();
    const value = random.random();

    expect(value).toBeGreaterThanOrEqual(0);
    expect(value).toBeLessThanOrEqual(1);
  });

  it('is bound to the instance', () => {
    const seed = getRandomSeed();
    const random = new Random();
    const next = random.random;

    random.seed(seed);
    const value1 = next();

    random.seed(seed);
    const value2 = random.random();

    expect(value1).toBe(value2);
  });
});

describe('nextUint32', () => {
  it('generates a random int from 0 to 2^32 - 1', () => {
    const random = new Random();
    const value = random.randomUint32();

    expect(Number.isInteger(value)).toBe(true);
    expect(value).toBeGreaterThanOrEqual(0);
    expect(value).toBeLessThanOrEqual(2 ** 32 - 1);
  });
});

describe('nextInt', () => {
  it('generates a random int from min to max', () => {
    const random = new Random();
    const value = random.randomInt(5, 10);

    expect(Number.isInteger(value)).toBe(true);
    expect(value).toBeGreaterThanOrEqual(5);
    expect(value).toBeLessThanOrEqual(10);
  });

  it('generates a random int from 0 to max', () => {
    const random = new Random();
    const value = random.randomInt(10);

    expect(Number.isInteger(value)).toBe(true);
    expect(value).toBeGreaterThanOrEqual(0);
    expect(value).toBeLessThanOrEqual(10);
  });

  it('the generated int is inclusive of min and max', () => {
    const random = new Random();
    const value = random.randomInt(5, 5);

    expect(value).toBe(5);
  });

  it('throws an error if min is greater than max', () => {
    const random = new Random();

    expect(() => random.randomInt(10, 5)).toThrowError();
  });
});

describe('getRandomSeed', () => {
  it('generates a random seed between 0 and 2^32 - 1', () => {
    const seed = getRandomSeed();

    expect(Number.isInteger(seed)).toBe(true);
    expect(seed).toBeGreaterThanOrEqual(0);
    expect(seed).toBeLessThanOrEqual(2 ** 32 - 1);
  });

  it('can seed the random seed with a value between 0 - 1', () => {
    const seedSeed = Math.random();

    const seed1 = getRandomSeed(seedSeed);
    const seed2 = getRandomSeed(seedSeed);

    expect(seed1).toBe(seed2);
  });

  it('throws an error if the seed seed is less than 0 or greater or equal to 1', () => {
    expect(() => getRandomSeed(-1)).toThrowError();
    expect(() => getRandomSeed(0)).not.toThrowError();
    expect(() => getRandomSeed(0.9999)).not.toThrowError();
    expect(() => getRandomSeed(1)).toThrowError();
  });
});

describe('seed', () => {
  it('changes the seed', () => {
    const seed = getRandomSeed();
    const random = new Random(seed);

    const values1 = [random.random(), random.random(), random.random()];

    random.seed(seed);
    const values2 = [random.random(), random.random(), random.random()];

    expect(values1).toEqual(values2);
  });
});

describe('getState', () => {
  it('returns a copy of the current state', () => {
    const random = new Random();

    expect(random.getState()).not.toBe(random.getState());
  });

  it('state changes after generating the next random value', () => {
    const random = new Random();
    const state1 = random.getState();

    random.random();
    const state2 = random.getState();

    expect(state1).not.toEqual(state2);
  });
});

describe('getStateRef', () => {
  it('returns the current state reference', () => {
    const random = new Random();

    expect(random.getStateRef()).toBe(random.getStateRef());
  });
});

describe('setState', () => {
  it('sets the current state to a copy of the passed in state', () => {
    const random = new Random();

    const state = getRandomState();
    const initialState = new Uint32Array(state);

    random.setState(state);
    random.random();

    // state does not change after next()
    expect(state).toEqual(initialState);
    expect(state).not.toEqual(random.getStateRef());
  });

  it('can change to a previous state to replay previous random values', () => {
    const random = new Random();

    // call next a few times to jumble the initial state
    random.random();
    random.random();
    random.random();

    const state = random.getState();
    const values1 = [random.random(), random.random(), random.random()];

    random.setState(state);
    const values2 = [random.random(), random.random(), random.random()];

    expect(values1).toEqual(values2);
  });
});

describe('setStateRef', () => {
  it('sets the current state reference', () => {
    const random = new Random();

    const state = getRandomState();
    const initialState = new Uint32Array(state);

    random.setStateRef(state);
    random.random();

    // state changes after next()
    expect(state).not.toEqual(initialState);
    expect(state).toBe(random.getStateRef());
  });
});

it('generates the same random number for the same initial seed', () => {
  const seed = getRandomSeed();
  const random1 = new Random(seed);
  const random2 = new Random(seed);

  for (let i = 0; i < 10; i++) {
    expect(random1.random()).toBe(random2.random());
  }
});

it('generates different random numbers for different initial seeds', () => {
  const seed = getRandomSeed();
  const random1 = new Random(seed);

  const seed2 = seed + 100;
  const random2 = new Random(seed2);

  // it's possible that the random numbers are the same, but it's very unlikely, especially for 10
  // iterations
  let foundDifferentValue = false;
  for (let i = 0; i < 10; i++) {
    if (random1.random() !== random2.random()) {
      foundDifferentValue = true;
    }
  }

  expect(foundDifferentValue).toBe(true);
});

it('generates adequately random numbers according to mean squared error', () => {
  const random = new Random();
  const iterations = 1000000;

  let squareError = 0;
  for (let i = 0; i < iterations; i++) {
    squareError += (random.random() - Math.random()) ** 2;
  }

  expect(squareError / iterations).toBeCloseTo(1 / 6);
});

it('throws an error if the state is not 4 elements long', () => {
  const random = new Random();

  expect(() => random.setState(new Uint32Array(3))).toThrowError();
  expect(() => random.setState(new Uint32Array(5))).toThrowError();
});

it('throws an error if seed is not an integer', () => {
  expect(() => new Random(0.5)).toThrowError();
});
