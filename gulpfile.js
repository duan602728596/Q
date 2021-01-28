const gulp = require('gulp');
const typescript = require('gulp-typescript');
const { rollup } = require('rollup');
const { terser } = require('rollup-plugin-terser');
const tsconfig = require('./tsconfig.json');

/* es6 build */
function buildEs6() {
  const config = Object.assign(tsconfig.compilerOptions, {
    target: 'ES5'
  });
  const tsResult = gulp.src('src/**/*.ts')
    .pipe(typescript(config));

  return tsResult.js.pipe(gulp.dest('esm'));
}

/* commonjs build */
function buildCommonjs() {
  const config = Object.assign(tsconfig.compilerOptions, {
    target: 'ES5',
    module: 'commonjs'
  });
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

exports.default = gulp.series(
  gulp.parallel(buildEs6, buildCommonjs),
  gulp.parallel(buildDist(true), buildDist(false))
);