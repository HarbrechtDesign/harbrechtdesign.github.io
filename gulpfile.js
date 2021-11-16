// Example gulp 4 file
// https://gist.github.com/jeromecoupe/0b807b0c1050647eb340360902c3203a

const { src, dest, watch, series } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const postcss = require('gulp-postcss');
const cssnano = require('cssnano');
const terser = require('gulp-terser');
const browsersync = require('browser-sync').create();
const autoprefixer = require('gulp-autoprefixer');
const gutil = require('gulp-util');
const rename = require('gulp-rename');
const concat = require('gulp-concat');

function cssLibraries() {
	return src([
			"node_modules/@fancyapps/fancybox/dist/jquery.fancybox.min.css"
		])
		.pipe(dest("docs/css"));
}
function jsLibraries() {
	return src([
			"resources/js/uiMorphingButton.js",
			"node_modules/@fancyapps/fancybox/dist/jquery.fancybox.min.js",
			"node_modules/body-scroll-lock/lib/bodyScrollLock.js",
		])
		.pipe(dest("docs/js"));
}
function css() {
	return src("resources/scss/app.scss")
		.pipe(sass({
			debugInfo: true,
			lineNumbers: true
		}).on("error", sass.logError))
		.pipe(autoprefixer("last 4 version"))
		.pipe(dest("docs/css"))
		.pipe(postcss([cssnano()]))
		.pipe(rename({ suffix: ".min" }))
		.pipe(dest("docs/css"))
}
function js() {
	return src([
			"resources/js/app.js"
		])
		.pipe(concat("app.js"))
		.pipe(dest("docs/js"))
		.pipe(terser())
		.on("error", function(err) {
			gutil.log(gutil.colors.red("[Error]"), err.toString());
		})
		.pipe(rename({ suffix: ".min" }))
		.pipe(dest("docs/js"))
}
function pageData() {
	return src("resources/js/projects.json")
		.pipe(dest("docs/js"))
}
function browsersyncServe(cb){
	browsersync.init({
	server: {
		baseDir: 'docs'
	}
	});
	cb();
}
function browsersyncReload(cb){
	browsersync.reload();
	cb();
}
function watchTask(){
	watch('docs/*.html', browsersyncReload);
	watch(['resources/scss/*.scss', 'resources/js/*.js'], series(css, js, browsersyncReload));
	watch('resources/js/*.json', series(pageData, browsersyncReload));
}

exports.default = series(
	css,
	js,
	cssLibraries,
	jsLibraries,
	pageData,
	browsersyncServe,
	watchTask
);

