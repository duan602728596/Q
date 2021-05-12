import path from 'path';
import fs from 'fs';
import gulp from 'gulp';
import typescript from 'gulp-typescript';
import { rollup } from 'rollup';
import { terser } from 'rollup-plugin-terser';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { metaHelper, requireJson } from '@sweet-milktea/utils';

const { __dirname } = metaHelper(import.meta.url);
const tsconfig = await requireJson(path.join(__dirname, 'tsconfig.json'));

/* esm build */
function buildEsm() {
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
      plugins: [nodeResolve({ browser: true })]
        .concat(compression ? [terser({ format: { comments: false } })] : []),
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

/* 写入package.js文件 */
async function writeTypeModulePackageJsonFile() {
  await fs.promises.writeFile(
    path.join(__dirname, 'esm/package.json'),
    JSON.stringify({ type: 'module' }, null, 2) + '\n'
  );
}

export default gulp.series(
  gulp.parallel(buildEsm, buildCommonjs),
  writeTypeModulePackageJsonFile,
  gulp.parallel(buildDist(true), buildDist(false))
);