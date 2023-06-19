let blobs = []; // All of the blobs/clients that are currently connected

// Constructor function 
function Blob(id, x, y, r, colourR, colourG, colourB) {
  this.id = id;
  this.x = x;
  this.y = y;
  this.r = r;
  this.colourR = colourR;
  this.colourB = colourB;
  this.colourG = colourG;
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

// The server serves static files from the "public" directory
app.use(express.static('public'));

// WebSocket Portion
// WebSockets work with the HTTP server
let io = require('socket.io')(server);

// Have the server send a message (through the heartbeat function) to the client every second (1000ms)
setInterval(heartbeat, 1000);
function heartbeat() {
  io.sockets.emit('heartbeat', blobs); // Send a heartbeat event to all connected clients, contained in the 'blobs' array
}








// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on(
  'connection',
  // We are given a websocket object in our function
  function(socket) {
    console.log('We have a new client: ' + socket.id);

    socket.on('start', function(data) {
      console.log(`STARTING: ${socket.id} ${data.x} ${data.y} ${data.r}`);
      let blob = new Blob(socket.id, data.x, data.y, data.r, data.colourR, data.colourB, data.colourG); // Create a blob when we have a new client
      blobs.push(blob); // Push this new blob into our list of blobs / clients
    });


    // Synchronize the position and size of the blob between the server and the connected clients
    socket.on('update', function(data) {
      let blob = blobs.find(blob => blob.id === socket.id); // Find the blob object in the blobs array based on the socket id
      if (blob) {
        blob.x = data.x;
        blob.y = data.y;
        blob.r = data.r;
      }
      console.log(`UPDATED: ${socket.id} ${data.x} ${data.y} ${data.r}`);
    });








    // On disconnect, we want to remove the user's blob from the blobs array
    socket.on('disconnect', function() {
      console.log('Client has disconnected');

      let index = blobs.findIndex(blob => blob.id === socket.id); // Find the index of the blob object in the blobs array based on the socket id
      if (index !== -1) {
        blobs.splice(index, 1); // Remove the blob from the blobs array
      }
    });
  });
;
