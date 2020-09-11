import typescript from 'rollup-plugin-typescript2';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import babel from '@rollup/plugin-babel';
import pkg from './package.json';

export default {
  input: 'src/index.tsx',
  output: [
    {
      file: pkg.main,
      format: 'es',
      exports: 'named',
      name: 'real-simple-context',
      sourcemap: true,
      strict: false,
      plugins: [terser()],
    },
  ],
  plugins: [
    resolve({
      jsnext: true,
      main: true,
      browser: true,
    }),
    commonjs(),
    typescript(),
    babel({
      exclude: 'node_modules/**',
    }),
  ],
  external: ['react', 'react-dom'],
};
