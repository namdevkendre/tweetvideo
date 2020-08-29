'use strict'

var express = require('express'),
    apiRouter = express.Router(),
    twitterRoutes = require('./twitter');

var apiWrapper = function (app) {
    app.use('/api/v1', apiRouter);
    apiRouter.post('/twitter/uploadVideo', twitterRoutes.uploadVideo);
    apiRouter.get('/twitter/statuses/user_timeline', twitterRoutes.twitterTimeline);
    
}

module.exports = apiWrapper;