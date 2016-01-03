import gulp   from 'gulp';
import less   from 'gulp-less';
import babel  from 'gulp-babel';
import concat from 'gulp-concat';
import uglify from 'gulp-uglify';
import jas    from 'gulp-jasmine';
import tpls   from 'gulp-angular-templatecache';
import conn   from 'gulp-connect';
import minCss from 'gulp-minify-css';
import evStr  from 'event-stream';
import yargs  from 'yargs';
import config from './package.json';

const args = yargs.argv, paths = {
  src:      'src/**/*.js',
  tpls:     'src/**/*.html',
  less:     'less/**/*.less',
  build:    'build',
  dist:     'dist',
  specSrc:  'spec/**/*Spec.js',
  specDest: 'build/spec',
  spec:     'build/spec/**/*Spec.js'
};

// test: { src:  paths.spec, pipe: jas({ includeStackTrace: true }) },

const build = (opts = {}) => {
  var min = opts.min ? '.min' : '';
  opts = Object.assign({ min: false, name: `${config.build.name}${min}.js`, dest: paths.dist }, opts);

  var stream = evStr.merge(
    gulp.src(paths.src),
    gulp.src(paths.tpls).pipe(tpls({ module: config.build.name }))
  ).pipe(concat(opts.name)).pipe(babel({ plugins: [/*'transform-es2015-modules-commonjs'*/] }));

  if (opts.min) stream = stream.pipe(uglify());

  return stream.pipe(gulp.dest(opts.dest));
}

gulp.task('serve', () => {
  var port = config.build.port;
  return (port) ? conn.server({ root: __dirname, port }) : console.log("Server not configured");
});

gulp.task('less',    () => gulp.src(paths.less).pipe(less()).pipe(minCss()).pipe(gulp.dest(paths.dist)));
gulp.task('dist',    ['less'], build.bind(null, { min: true }));
gulp.task('watch',   gulp.watch.bind(gulp, [paths.src, paths.specSrc, paths.less], ['less', 'test']));
gulp.task('live',    ['serve', 'watch']);
gulp.task('default', ['test', 'dist']);

gulp.on('err', e => console.log("Gulp error:", e.err.stack));
