var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

var indexRouter = require('./routes/index');
var articleRouter = require('./routes/article');
let authRouter = require('./routes/auth'); 
var app = express();

app.use(cors());

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

app.use('/article', articleRouter);
app.post('/auth', cors(), authRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  console.log("404");
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  console.log("request not matched");
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(3000,()=>{console.log("server running .....");});
module.exports = app;
