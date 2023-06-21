let blobs = []; // All of the blobs/clients that are currently connected
let foods = []; // All of the food blobs that should be on the map

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
  io.sockets.emit('heartbeat', blobs, foods); // Send a heartbeat event to all connected clients, contained in the 'blobs' array
}








// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on(
  'connection',
  // We are given a websocket object in our function
  function(socket) {
    console.log('We have a new client: ' + socket.id);






    socket.on('start', function(data, foodsData) {
      console.log(`STARTING: ${socket.id} ${data.x} ${data.y} ${data.r}`);

      let blob = new Blob(socket.id, data.x, data.y, data.r, data.colourR, data.colourG, data.colourB); // Recreate main player blob on the server side
      blobs.push(blob); // Push this new blob into our list of blobs / clients


      for (let i = 0; i < foodsData.length; i++) { // Recreate the food blobs on the server-side and store in the foods array
        if (foods.length >= 250) {
          break;
        }

        let foodBlob = new Blob(i, foodsData[i].x, foodsData[i].y, foodsData[i].r, foodsData[i].colourR, foodsData[i].colourG, foodsData[i].colourB);
        foods.push(foodBlob);
      }
    });











    // Synchronize the position and size of the blob between the server and the connected clients
    socket.on('updateBlob', function(dataBlob) {
      let blob = blobs.find(blob => blob.id === socket.id); // Find the blob object in the blobs array based on the socket id
      if (blob) {
        blob.x = dataBlob.x;
        blob.y = dataBlob.y;
        blob.r = dataBlob.r;
      }
      console.log(
        `UPDATED: ${socket.id} ${dataBlob.x} ${dataBlob.y} ${dataBlob.r}`
      );
    });













    socket.on('updateFood', function(dataFood) {
      if (foods.length !== 0 || dataFood.length !== 0) {
        foods = [...dataFood];
      }
      console.log("updated food");
    });

    // On disconnect, we want to remove the user's blob from the blobs array
    socket.on('disconnect', function() {
      console.log(`Client ${socket.id} has disconnected`);

      let index = blobs.findIndex(blob => blob.id === socket.id); // Find the index of the blob object in the blobs array based on the socket id
      if (index !== -1) {
        blobs.splice(index, 1); // Remove the blob from the blobs array
      }
    });
  });
;
