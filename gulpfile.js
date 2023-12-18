const gulp = require("gulp")
const sourcemaps = require("gulp-sourcemaps")
const swc = require("gulp-swc")
const { rimraf } = require("rimraf")

const BUILD = "build"
const CLEAN = "clean:build"
// const ENV = "copy:env"
const COMPILE = "compile:typescript"

// Removes the ./build directory with all its content.
gulp.task(CLEAN, function () {
  return rimraf("./build")
})

gulp.task(COMPILE, function () {
  return gulp
    .src("./src/**/*.ts")
    .pipe(sourcemaps.init())
    .pipe(swc())
    .pipe(sourcemaps.write(".", { sourceRoot: "../src" }))
    .pipe(gulp.dest("build"))
})

// gulp.task(ENV, function () {
//   return gulp.src(".env", { allowEmpty: false }).pipe(gulp.dest("./build/"))
// })

// Runs all required steps for the build in sequence.
gulp.task(BUILD, gulp.series(CLEAN, COMPILE, /* ENV */))
