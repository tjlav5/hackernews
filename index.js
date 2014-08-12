#!/usr/bin/env node

var FeedParser = require('feedparser')
  , request = require('request')
  , htmlToText = require('html-to-text')
  , posts = []
  , colors = require('colors')
  , prompt = require('prompt')
  , exec = require('child_process').exec
  , platform = require('os').platform()
  , i = 1;

const shellOpenCommand = {
  'win32': 'start ',
  'linux': 'xdg-open ',
  'darwin': 'open '
}[platform];

request('https://news.ycombinator.com/rss')
  .pipe(new FeedParser())
  .on('error', function(error) {
    console.log("An error occured");
  })
  .on('readable', function () {
    var stream = this, item;
    if(i < 16){
      while (item = stream.read()) {
      posts.push(item);
      console.log(i.toString().red + ". " + item.title);
      i++;
    }
    }
  })
  .on('finish', function(){
    promptForPost();
  });

function promptForPost() {
  prompt.start();

  var schema = {
    properties: {
      post: {
        message: 'Type post number to open, or 0 to quit',
        required: true
      },
    }
  };

  prompt.get(schema, function (err, result) {
    if(result.post !== "0"){
      var i = parseInt(result.post);
      if(isNaN(i) || i > posts.length || i < 1) {
        console.log("Invalid post number");
      } else {
        request(posts[i - 1].link, function (error, response, body) {
          if (!error && response.statusCode == 200) {
            var text = htmlToText.fromString(body, {
              wordwrap: 120
            });
            console.log(text);
            promptForPost();
          } else {
            return console.error('Failed to load post')
          }
        });
      }
    }
  });
}
