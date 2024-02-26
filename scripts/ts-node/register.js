require('ts-node').register({
  project: 'scripts/ts-node/tsconfig.json',
  transpileOnly: true,
  transpiler: 'ts-node/transpilers/swc',
});

require('fix-esm').register();
