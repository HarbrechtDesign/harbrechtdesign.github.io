var gulp = require("gulp"),
	gutil = require("gulp-util"),
	sass = require("gulp-sass"),
	header = require("gulp-header"),
	browserSync = require("browser-sync"),
	autoprefixer = require("gulp-autoprefixer"),
	uglify = require("gulp-uglify"),
	rename = require("gulp-rename"),
	cssnano = require("gulp-cssnano"),
	concat = require('gulp-concat');

gulp.task("css", function() {
	gulp
		.src("node_modules/@fancyapps/fancybox/dist/jquery.fancybox.min.css")
		.pipe(gulp.dest("docs/css"));
	gulp
		.src(["resources/scss/app.scss"])
		// .pipe(concat("app.scss"))
		.pipe(sass({
			debugInfo: true,
			lineNumbers: true
		}).on("error", sass.logError))
		.pipe(autoprefixer("last 4 version"))
		.pipe(gulp.dest("docs/css"))
		.pipe(cssnano())
		.pipe(rename({ suffix: ".min" }))
		.pipe(gulp.dest("docs/css"))
		.pipe(browserSync.reload({ stream: true }));
});
gulp.task("js", function() {
	gulp
		.src("resources/js/modalMorph.js")
		.pipe(gulp.dest("docs/js"))
		.pipe(browserSync.reload({ stream: true, once: true }));
	gulp
		.src("resources/js/projects.json")
		.pipe(gulp.dest("docs/js"))
		.pipe(browserSync.reload({ stream: true, once: true }));
	gulp
		.src(["resources/js/velocity.min.js","./node_modules/@fancyapps/fancybox/dist/jquery.fancybox.min","./node_modules/body-scroll-lock/lib/bodyScrollLock.js", "resources/js/app.js"])
		.pipe(concat("app.js"))
		.pipe(gulp.dest("docs/js"))
		.on("error", function(err) {
			gutil.log(gutil.colors.red("[Error]"), err.toString());
		})
		.pipe(uglify())
		.pipe(rename({ suffix: ".min" }))
		.pipe(gulp.dest("docs/js"))
		.pipe(browserSync.reload({ stream: true, once: true }));
});

gulp.task("browser-sync", function() {
	browserSync.init(null, {
		server: {
			baseDir: "docs"
		},
		ghostMode: false
	});
});
gulp.task("bs-reload", function() {
	browserSync.reload();
});

gulp.task("default", ["css", "js","browser-sync"], function() {
	gulp.watch("resources/scss/**/*.scss", ["css", "bs-reload"]);
	gulp.watch("resources/js/*.js", ["js","bs-reload"]);
	gulp.watch("resources/js/*.json", ["js","bs-reload"]);
	gulp.watch("docs/*.html", ["bs-reload"]);
});