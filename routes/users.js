var express = require('express');
var router = express.Router();
var ffmpeg = require('ffmpeg');

/* GET users listing. */
router.get('/', function(req, res, next) {
    try {
        var process = new ffmpeg('./public/videos/SampleVideo.mp4');
        process.then(function (video) {
            console.log('The video is ready to be processed');
            res.send('The video is ready to be processed.');
        }, function (err) {
            console.log('Error: ' + err);
        });
    } catch (e) {
        console.log(e.code);
        console.log(e.msg);
    }
});

module.exports = router;
