import path from 'path';
import gulp from 'gulp';
import typescript from 'gulp-typescript';
import { rollup } from 'rollup';
import { terser } from 'rollup-plugin-terser';
import { metaHelper, requireJson } from '@sweet-milktea/utils';

const { __dirname } = metaHelper(import.meta.url);
const tsconfig = await requireJson(path.join(__dirname, 'tsconfig.json'));

/* es6 build */
function buildEs6() {
  const config = {
    ...tsconfig.compilerOptions,
    target: 'ES5'
  };
  const tsResult = gulp.src('src/**/*.ts')
    .pipe(typescript(config));

  return tsResult.js.pipe(gulp.dest('esm'));
}

/* commonjs build */
function buildCommonjs() {
  const config = {
    ...tsconfig.compilerOptions,
    target: 'ES5',
    module: 'commonjs'
  };
  const tsResult = gulp.src('src/**/*.ts')
    .pipe(typescript(config));

  return tsResult.js.pipe(gulp.dest('lib'));
}

/* dist build */
function buildDist(compression) {
  return async function() {
    const bundle = await rollup({
      input: 'esm/index.js',
      plugins: compression ? [terser()] : undefined,
      moduleContext: (name) => 'this'
    });

    await bundle.write({
      format: 'umd',
      name: 'Q',
      exports: 'named',
      file: `dist/Q.${ compression ? 'min.' : '' }js`
    });
  };
}

export default gulp.series(
  gulp.parallel(buildEs6, buildCommonjs),
  gulp.parallel(buildDist(true), buildDist(false))
);