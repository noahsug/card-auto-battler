import { Random } from './seededRandom';

it('generates the same random number for the same initial seed', () => {
  const seed = Random.getRandomSeed();
  const random1 = new Random(seed);
  const random2 = new Random(seed);

  for (let i = 0; i < 10; i++) {
    expect(random1.next()).toBe(random2.next());
  }
});

it('generates different random numbers for different initial seeds', () => {
  const seed = Random.getRandomSeed();
  const random1 = new Random(seed);

  const seed2 = seed + 100;
  const random2 = new Random(seed2);

  // it's possible that the random numbers are the same, but it's very unlikely, especially for 10
  // iterations
  let foundDifferentValue = false;
  for (let i = 0; i < 10; i++) {
    if (random1.next() !== random2.next()) {
      foundDifferentValue = true;
    }
  }

  expect(foundDifferentValue).toBe(true);
});

it('changes state after generating the next random number', () => {
  const random = new Random();
  const state1 = random.state;

  random.next();
  const state2 = random.state;

  expect(state1).not.toBe(state2);
});

it('can change to a previous state to replay previous random values', () => {
  const random = new Random();
  const state = random.state;
  const values1 = [random.next(), random.next(), random.next()];

  random.state = state;
  const values2 = [random.next(), random.next(), random.next()];

  expect(values1).toEqual(values2);
});

it('can seed the random seed with a value between 0 - 1', () => {
  const seedSeed = Math.random();

  const seed1 = Random.getRandomSeed(seedSeed);
  const seed2 = Random.getRandomSeed(seedSeed);

  expect(seed1).toBe(seed2);
});

it('generates a random int from min to max', () => {
  const random = new Random();
  const value = random.nextInt(5, 10);

  expect(Number.isInteger(value)).toBe(true);
  expect(value).toBeGreaterThanOrEqual(5);
  expect(value).toBeLessThanOrEqual(10);
});

it('generates adequately random numbers according to mean squared error', () => {
  const random = new Random();
  const iterations = 1000000;

  let squareError = 0;
  for (let i = 0; i < iterations; i++) {
    squareError += Math.pow(random.next() - Math.random(), 2);
  }

  expect(squareError / iterations).toBeCloseTo(1 / 6);
});
