const formidable = require('formidable'),
    ffmpeg = require('fluent-ffmpeg'),
    Promise = require('bluebird');

const Twitter = require('../libs/twitter.js');

let videoWrapper = (function() {

    function createClip(file) {
        return new Promise(function(resolve, reject) {
            let videoFile = process.env.PROJECT_DIR + '/public/videos/' + file.name;
            // create clip of 5 seconds
            ffmpeg(file.path)
                .seekInput(0)
                .duration(5)
                .outputOptions('-strict experimental')
                .on('start', function(commandLine) {
                    console.log('Spawned Ffmpeg with command: ' + commandLine);
                })
                .on('end', function() {
                    resolve(videoFile)
                })
                .on('error', function(err) {
                    reject(err)
                })
                .save(videoFile); //save clip
        });
    };

    let _uploadVideo = function(req, res) {
        let form = new formidable.IncomingForm();
        form.parse(req, function(err, fields, files) {
            let file = files.file;
            createClip(file)
                .then(function(videoFilePath) {
                    Twitter.postVideo(videoFilePath)
                        .then(function(result) {
                            res.status(200).send(result);
                        }).catch(function(error) {
                            res.status(400).send(err);
                        });
                }).catch(function(err) {
                    res.status(400).send(err);
                });
        });
    }
    return {
        uploadVideo: _uploadVideo
    }
})();

module.exports = videoWrapper;