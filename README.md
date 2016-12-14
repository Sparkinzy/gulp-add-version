```js
var ver          = require('gulp-version-append');

gulp.task('version',function(){
    gulp.src('./src/tpl/**/**/*.html')
    .pipe(ver())
    .pipe(gulp.dest(ROOT+'/'));
});
```

```html
<!-- before -->
<script type="text/javascript" src="/public/demo.js?ver=?"></script>
<!-- after -->
<script type="text/javascript" src="/public/demo.js?ver=f120c06d92"></script>
```