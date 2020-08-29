const Twitter = require('twitter');
const config = require('../config/config');


let TwitterWrapper = (function() {

    var funcs = {};

    var client = new Twitter({
        consumer_key: config.twitter.clientId,
        consumer_secret: config.twitter.clientSecret,
        access_token_key: config.twitter.accessToken,
        access_token_secret: config.twitter.accessTokenSecret
    });

    /**
     * (Utility function) Send a POST request to the Twitter API
     * @param String endpoint  e.g. 'statuses/upload'
     * @param Object params    Params object to send
     * @return Promise         Rejects if response is error
     */
    function makePost(endpoint, params) {
        return new Promise((resolve, reject) => {
            client.post(endpoint, params, (error, data, response) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(data);
                }
            });
        });
    }

    /**
     * Step 1 of 3: Initialize a media upload
     * @return Promise resolving to String mediaId
     */
    function initUpload(mediaSize, mediaType, mediaData) {
        return makePost('media/upload', {
            command: 'INIT',
            total_bytes: mediaSize,
            media_type: mediaType,
        }).then(data => ({
            mediaId: data.media_id_string,
            mediaData: mediaData
        }));
    }

    /**
     * Step 2 of 3: Append file chunk
     * @param String mediaId    Reference to media object being uploaded
     * @return Promise resolving to String mediaId (for chaining)
     */
    function appendUpload(media) {
        return makePost('media/upload', {
            command: 'APPEND',
            media_id: media.mediaId,
            media: media.mediaData,
            segment_index: 0
        }).then(data => media.mediaId);
    }

    /**
     * Step 3 of 3: Finalize upload
     * @param String mediaId   Reference to media
     * @return Promise resolving to mediaId (for chaining)
     */
    function finalizeUpload(mediaId) {
        return makePost('media/upload', {
            command: 'FINALIZE',
            media_id: mediaId
        }).then(data => mediaId);
    }

    /**
     Post Video on Twitter
    */

    function postTweet(mediaId) {
        return makePost('statuses/update', {
            status: 'New tweet-' + Date.now(),
            media_ids: mediaId
        }).then(data => data);
    }

    funcs.postVideo = function(file) {
        return new Promise(function(resolve, reject) {
            const pathToMovie = file;
            const mediaType = 'video/mp4';
            const mediaData = require('fs').readFileSync(pathToMovie);
            const mediaSize = require('fs').statSync(pathToMovie).size;
            initUpload(mediaSize, mediaType, mediaData) // Declare that you wish to upload some media
                .then(appendUpload) // Send the data for the media
                .then(finalizeUpload) // Declare that you are done uploading chunks
                .then(postTweet)
                .then(function(result) {
                    resolve(result);
                })
                .catch(function(error) {
                    reject(error);
                });
        });
    };
    
    funcs.getUserTimeline = function() {
        return new Promise(function(resolve, reject) {
            var params = {screen_name: 'nodejs'};
            client.get('statuses/user_timeline', params, function(error, tweets, response) {
                if (!error) {
                    resolve(tweets);
                } else {
                    console.log(error);
                    reject(error);
                }
            });
        });
    };
    return funcs;
})();

module.exports = TwitterWrapper;