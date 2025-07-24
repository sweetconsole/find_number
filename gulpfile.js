
const gulp = require("gulp")
const del = require("del")
const include = require("gulp-file-include")
const concat = require("gulp-concat")
const autoprefixer = require("gulp-autoprefixer")
const uglify = require('gulp-uglify-es').default
const browserSync = require("browser-sync").create()
const imagemin = require("gulp-imagemin")
const htmlmin = require("gulp-htmlmin")
const newer = require("gulp-newer")
const cleanCSS = require("gulp-clean-css")
const webp = require("gulp-webp")
const ttf2woff = require("gulp-ttf2woff")
const sass = require('gulp-sass')(require('sass'));

const paths = {
    html: {
        src: "src/*.html",
        dist: "dist/"
    },
    styles: {
        src: ["src/style/**.scss", "src/components/**/*.scss"],
        dist: "dist/"
    },
    scripts: {
        src: "src/scripts/**/*.js",
        dist: "dist/"
    },
    images: {
        src: ["src/image/**/*", "!src/image/**/*.svg"],
        svg: "src/image/**/*.svg",
        webp: "src/image/**/*.{png, jpg, jpeg}",
        dist: "dist/image/"
    },
    fonts: {
        src: "src/fonts/*.ttf",
        dist: "dist/fonts/"
    },
    video: {
        src: "src/video/*",
        dist: "dist/video/"
    }
}

function clean() {
    return del(["dist/*", "!dist/image", "!dist/video"])
}

function html() {
    return gulp.src(paths.html.src)
        .pipe(include({
            prefix: "@"
        }))
        // .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest(paths.html.dist))
        .pipe(browserSync.stream())
}

function styles() {
    return gulp.src(paths.styles.src)
        .pipe(sass.sync().on('error', sass.logError))
        .pipe(concat('style.css'))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 version'],
            grid: true
        }))
        // .pipe(cleanCSS())
        .pipe(gulp.dest(paths.styles.dist))
        .pipe(browserSync.stream())
}

function scripts() {
    return gulp.src(paths.scripts.src)
        .pipe(concat('script.js'))
        // .pipe(uglify())
        .pipe(gulp.dest(paths.scripts.dist))
        .pipe(browserSync.stream())
}

function images() {
    return gulp.src(paths.images.webp)
        .pipe(webp())
        .pipe(gulp.dest(paths.images.dist))
        .pipe(browserSync.stream())
}

function sprite() {
    return gulp.src(paths.images.svg)
        .pipe(newer(paths.images.dist))
        .pipe(imagemin(
            [
                imagemin.gifsicle({ interlaced: true }),
                imagemin.mozjpeg({ quality: 75, progressive: true }),
                imagemin.optipng({ optimizationLevel: 5 }),
                imagemin.svgo({
                plugins: [
                    { removeViewBox: true },
                    { cleanupIDs: false }
                ]
                })
            ]
        ))
        .pipe(gulp.dest(paths.images.dist))
        .pipe(browserSync.stream())
}

function fontsWoff() {
    return gulp.src(paths.fonts.src)
        .pipe(ttf2woff())
        .pipe(gulp.dest(paths.fonts.dist))
        .pipe(browserSync.stream())
}

function watch() {
    browserSync.init({
        server: {
            baseDir: "./dist/"
    }
})

    gulp.watch(paths.html.dist).on("change", browserSync.reload)
    gulp.watch(paths.html.src, html)
    gulp.watch("src/components/**/*.html", html)
    gulp.watch("src/style/*.scss", styles)
    gulp.watch(paths.styles.src, styles)
    gulp.watch(paths.scripts.src, scripts)
    gulp.watch(paths.images.src, images)
    gulp.watch(paths.images.svg, sprite)
    gulp.watch(paths.fonts.src, fontsWoff)
}

exports.fonts = gulp.series(clean, gulp.parallel(fontsWoff))
exports.images = gulp.series(clean, images)

exports.build = gulp.series(
    clean,  html, gulp.parallel(
        styles, scripts, images, sprite, fontsWoff
    )
)


exports.server = gulp.series(
    clean, html, gulp.parallel(
        styles, scripts, images, sprite, fontsWoff
    ), watch
)