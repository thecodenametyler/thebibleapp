var gulp = require('gulp');
const sass = require('gulp-sass');
const browserSync = require('browser-sync').create();

// BrowserSync Reload
function reload(done) {
    browserSync.reload();
    done();
}

function style() {
    return (
        gulp
            .src("scss/*.scss")
 
            .pipe(sass())
            .on("error", sass.logError)
 
            .pipe(gulp.dest("assets/css"))
    );
}

function watch(){
    browserSync.init({
        // You can tell browserSync to use this directory and serve it as a mini-server
        server: {
            baseDir: "./"
        }
        // proxy: "localhost:8080"
        // If you are already serving your website locally using something like apache
        // You can use the proxy setting to proxy that instead
        // proxy: "yourlocal.dev"
    });

    gulp.watch('scss/*.scss', gulp.series(style,reload));
    gulp.watch('scss/layout/*.scss', gulp.series(style,reload));
    gulp.watch('scss/components/*.scss', gulp.series(style,reload));
    gulp.watch('scss/config/_commons.scss', gulp.series(style,reload));
    gulp.watch('scss/config/_fonts.scss', gulp.series(style,reload));
    gulp.watch('scss/config/_plugin.scss', gulp.series(style,reload));
    gulp.watch('scss/config/_grid.scss', gulp.series(style,reload));

    gulp.watch('./*.html', reload);
}

exports.style = style;
exports.watch = watch
