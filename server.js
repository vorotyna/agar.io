let blobs = []; // All of the blobs/clients that are currently connected

// Constructor function 
function Blob(id, x, y, r) {
  this.id = id;
  this.x = x;
  this.y = y;
  this.r = r;
}

// Using express: http://expressjs.com/
let express = require('express');
// Create the app
let app = express();

// Set up the server
// process.env.PORT is related to deploying on heroku
let server = app.listen(process.env.PORT || 3000, listen);

// This call back just tells us that the server has started
function listen() {
  let host = server.address().address;
  let port = server.address().port;
  console.log('Example app listening at http://' + host + ':' + port);
}

app.use(express.static('public'));

// WebSocket Portion
// WebSockets work with the HTTP server
let io = require('socket.io')(server);

// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on(
  'connection',
  // We are given a websocket object in our function
  function(socket) {
    console.log('We have a new client: ' + socket.id);

    socket.on('start', function(data) {
      console.log(socket.id + ' ' + data.x + ' ' + data.y + ' ' + data.r);
      let blob = new Blob(socket.id, data.x, data.y, data.r); // Create a blob when we have a new client
      blobs.push(blob); // Push this new blob into our list of blobs / clients
    });


    socket.on('update', function(data) {
      console.log(socket.id + " " + data.x + " " + data.y + " " + data.r);
      let blob;
      for (let i = 0; i < blobs.length; i++) { // Updates the location in the array of blobs
        if (socket.id == blobs[i].id) {
          blob = blobs[i];
        }
      }
      blob.x = data.x;
      blob.y = data.y;
      blob.r = data.r;
    });

    socket.on('disconnect', function() {
      console.log('Client has disconnected');
    });
  });

