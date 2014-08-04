#!/usr/bin/env node

var FeedParser = require('feedparser')
  , request = require('request')
  , posts = []
  , colors = require('colors')
  , prompt = require('prompt')
  , childProcess = require('child_process')
  , i = 1;

request('https://news.layervault.com/?format=rss')
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
      childProcess.exec("open " + posts[parseInt(result.post) - 1].link);
      promptForPost();
    }
  });


}
