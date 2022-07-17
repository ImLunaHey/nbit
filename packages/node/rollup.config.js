import typescript from '@rollup/plugin-typescript';
// import { terser } from 'rollup-plugin-terser';
import prettier from 'rollup-plugin-prettier';

export default {
  input: 'src/index.ts',
  output: {
    dir: 'lib',
    format: 'cjs',
    strict: false,
    esModule: false,
  },
  external: ['stream'],
  plugins: [
    typescript({
      module: 'esnext',
      include: ['../**/*.ts'],
    }),
    // terser({
    //   format: {
    //     comments: false,
    //   },
    //   compress: false,
    //   mangle: false,
    // }),
    prettier({
      parser: 'babel',
    }),
  ],
};