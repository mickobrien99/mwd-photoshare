"use strict";


var common = require('./common')
var knox = require('knox')
var http = require("http");
var url = require("url");
var multipart = require("multipart");
var util = require("util");
var events = require("events");
//var posix = require("posix");

var twitter    = common.twitter
var facebook   = common.facebook

var config = common.config

var fs = require('fs')

var S3_KEY = 'AKIAJNABKDJFYQNA4KGQ'
var S3_SECRET = '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'
var S3_BUCKET = 'mickobrien99photoshare'


var client = knox.createClient({
    key: S3_KEY,
    secret: S3_SECRET,
    bucket: S3_BUCKET
})



var send_social_msg = {
  twitter: function(user, msg, callback) {
    var conf = {
      consumer_key: config.twitter.key,
      consumer_secret: config.twitter.secret,
      access_token_key: user.key,
      access_token_secret: user.secret
    }
    var twit = new twitter(conf)
        
    var start = new Date()
    twit.updateStatus(msg, function (data) {
      var end = new Date()
      var dur = end.getTime()-start.getTime()
      console.log( 'twitter tweet:'+dur+', '+JSON.stringify(data) )
      callback( data.created_at )
    })
  },

  facebook: function(user, msg, callback) {
    var start = new Date()

    var facebook_client = new facebook.FacebookClient(
      config.facebook.key,
      config.facebook.secret
    )

    facebook_client.getSessionByAccessToken( user.key )(function(facebook_session) {
      facebook_session.graphCall("/me/feed", {message:msg}, 'POST')(function(result) {
        var end = new Date()
        var dur = end.getTime()-start.getTime()
        console.log( 'facebook post:'+dur+', '+JSON.stringify(result))
        callback(!result.error)
      })
    })
  }
}



exports.get_user = function( req, res, next ) {
  var clean_user = {}
  
  console.log( 'in exports.get_user')
  
  
  if( req.user ) {
    clean_user.id       = req.user.id
    clean_user.username = req.user.username
    clean_user.service  = req.user.service
  }

  common.util.sendjson(res,clean_user)
}


exports.social_msg = function( req, res, next, when ) {
  var user = req.user
  if( !user ) return common.util.sendcode(400);
  
  if( user.service ) {
    var d = new Date( parseInt(when,10) )

    send_social_msg[user.service]( 
      user, 
      'Burning out on '+d+'! Better get back to work... ', 
      function(ok) {
        common.util.sendjson(res,{ok:ok})
      }
    )
  }
}

exports.new_image = function( req, res ) {
	console.log('mick in new_image');
	console.log('req.body = ' + req.body);
	//console.log('req.rawBody = ' + req.rawBody);
	console.log('req.method = ' + req.method);
	//console.log('req.body.image = ' + req.body.image);
	//console.log('req.body.images = ' + req.body.images);
	
	//var base64Data = req.body.replace(/^data:image\/jpg;base64,/,"");
	//var dataBuffer = new Buffer(req.body, 'base64');

	var chunks;
	req.addListener('data', function (chunk) {
	  chunks.push(chunk);
	});
	req.addListener('end', function () {
	  // Do something with body text
	  console.log(chunks);
	});

	
	
	fs.writeFile("out.jpg", chunks, function(err) {
	  console.log(err);
	});
	/*
	//var read_stream = fs.createReadStream(req.body, "binary");
	//read_stream.on("data", function(data){
		console.log('starting to read file');
		client.putFile(req.body.images, 'slash.jpg', {'Content-Type': 'image/jpg'}, function(err, result) {
			if (200 == result.statusCode) {
				console.log('Uploaded to mazon S3');
			}
			else {
				console.log('Failed to upload file to Amazon S3');
			}
		});
	//});
	//read_stream.on("error", function(err){
	//  console.log("An error occurred: %s", err)
	//});
	//read_stream.on("close", function(){
	//  console.log("File closed.")
	//});
	*/
}


exports.upload_file = function (req, res) {
    // Request body is binary
    //req.setBodyEncoding("binary");

    // Handle request as multipart
    var stream = new multipart.Stream(req);
    
    // Create promise that will be used to emit event on file close
    var closePromise = new events.Promise();

    // Add handler for a request part received
    stream.addListener("part", function(part) {
        console.log("Received part, name = " + part.name + ", filename = " + part.filename);
        
        var openPromise = null;

        // Add handler for a request part body chunk received
        part.addListener("body", function(chunk) {
            // Calculate upload progress
            var progress = (stream.bytesReceived / stream.bytesTotal * 100).toFixed(2);
            var mb = (stream.bytesTotal / 1024 / 1024).toFixed(1);
     
            console.log("Uploading " + mb + "mb (" + progress + "%)");

            // Ask to open/create file (if not asked before)
            if (openPromise == null) {
                console.log("Opening file");
                openPromise = fs.open("./uploads/" + part.filename, process.O_CREAT | process.O_WRONLY, '0600');
            }

            // Add callback to execute after file is opened
            // If file is already open it is executed immediately
            openPromise.addCallback(function(fileDescriptor) {
                // Write chunk to file
                write_chunk(req, fileDescriptor, chunk, 
                    (stream.bytesReceived == stream.bytesTotal), closePromise);
            });
        });
    });

    // Add handler for the request being completed
    stream.addListener("complete", function() {
       console.log("Request complete");
		
        // Wait until file is closed
        closePromise.addCallback(function() {
            // Render response
            res.sendHeader(200, {"Content-Type": "text/plain"});
            res.sendBody("Thanks for playing!");
            res.finish();
			
            console.log("\n=> Done");
        });
    });
}