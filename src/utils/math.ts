export function factorial(n: number) {
  let result = 1;
  for (let i = 1; i <= n; i++) {
    result *= i;
  }
  return result;
}

export function choose(totalNumber: number, chooseNumber: number) {
  return factorial(totalNumber) / (factorial(chooseNumber) * factorial(totalNumber - chooseNumber));
}

export function binomialDistribution(
  totalNumber: number,
  chooseNumber: number,
  probability: number,
) {
  return (
    choose(totalNumber, chooseNumber) *
    Math.pow(probability, chooseNumber) *
    Math.pow(1 - probability, totalNumber - chooseNumber)
  );
}
