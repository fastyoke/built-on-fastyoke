import { build } from 'esbuild';

await build({
  entryPoints: ['src/index.tsx'],
  bundle: true,
  format: 'esm',
  outfile: 'dist/bundle.mjs',
  jsx: 'automatic',
  external: ['react', 'react-dom', 'react/jsx-runtime', 'react-dom/client', '@fastyoke/sdk'],
  logLevel: 'info',
});
console.log('built dist/bundle.mjs');
