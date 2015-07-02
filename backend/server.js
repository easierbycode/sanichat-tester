var Queue = require('firebase-queue'),
    Firebase = require('firebase'),
    Filter = require('bad-words');

var config = require('../config');

var filter = new Filter();
var ref = new Firebase('https://sanichat-tester.firebaseio.com');

ref.authWithCustomToken(config.firebaseToken, function(err, authData){
    if (err) {
      console.log("Login failed with error: ", error);
    } else {
      console.log("Authenticated successfully with payload: ", authData);
    }
});

var queueRef = ref.child('queue');


// Creates the Queue
var options = {
  'specId': 'task_1',
  'numWorkers': 20
};

var queue = new Queue(queueRef, options, function(data, progress, resolve, reject) {

  console.log("tackling: " + data.count);

  //get time to 1 minute
  var timer = data.published + 60000 - new Date();
  if (timer <= 0) {
    setTimeout(function() {
      data.message = filter.clean(data.message);
      data.processed = new Date().getTime();
      data.late = true;

      ref.child('messages').push(data, function(err){
        if (err) {
            console.log(err);
            reject(err);
        } else {
            console.log('processed: ' + data.count);
            resolve(data);
        }
      });
    }, 10);

  }
  else {
    setTimeout(function() {
      data.message = filter.clean(data.message);
      data.processed = new Date().getTime();


      ref.child('messages').push(data, function(err){
        if (err) {
            console.log(err);
            reject(err);
        } else {
            console.log('processed: ' + data.count);
            resolve(data);
        }
      });
    }, timer);

  }
});
