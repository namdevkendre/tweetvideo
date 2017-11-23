'use strict'

var express = require('express'),
    apiRouter = express.Router(),
    videoRoutes = require('./video');

var apiWrapper = function (app) {
    app.use('/api/v1', apiRouter);
    apiRouter.post('/upload', videoRoutes.uploadVideo);
}

module.exports = apiWrapper;