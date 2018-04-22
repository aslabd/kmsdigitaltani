// Package yang dibutuhkan
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cors = require('cors');

// Route di aplikasi
var index = require('./routes/index');
var post = require('./routes/artikel/post');
var tanya = require('./routes/diskusi/tanya');
var kategori = require('./routes/kategorisasi/kategori');
var subkategori = require('./routes/kategorisasi/subkategori');
var file = require('./routes/lampiran/file');
var topik = require('./routes/materi/topik');
var komentar = require('./routes/tanggapan/komentar');
var balasan = require('./routes/tanggapan/balasan');
var user = require('./routes/user/user');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

// Seluruh link menuju route
app.use('/api/', index);
app.use('/api/artikel/post', post);
app.use('/api/artikel/post/*', post);
app.use('/api/diskusi/topik', topik);
app.use('/api/diskusi/topik/*', topik);
app.use('/api/kategorisasi/kategori', kategori);
app.use('/api/kategorisasi/kategori/*', kategori);
app.use('/api/kategorisasi/subkategori', subkategori);
app.use('/api/kategorisasi/subkategori/*', subkategori);
app.use('/api/lampiran/file', file);
app.use('/api/lampiran/file/*', file);
app.use('/api/materi/topik', topik);
app.use('/api/materi/topik/*', topik);
app.use('/api/tanggapan/komentar', komentar);
app.use('/api/tanggapan/komentar/*', komentar);
app.use('/api/tanggapan/balasan', balasan);
app.use('/api/tanggapan/balasan/*', balasan);
app.use('/api/user', user);
app.use('/api/user/*', user);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

console.log("Selamat datang");

module.exports = app;
