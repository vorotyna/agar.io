let blobs = []; // All of the clients that are currently connected
let foods = []; // All of the food blobs that should be on the map

// Blob constructor function on the server-side
function Blob(id, blobName, x, y, r, colourR, colourG, colourB) {
  this.id = id;
  this.blobName = blobName;
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







// Server updates the frontend with the blobs and foods array every 30ms
setInterval(heartbeat, 30);
function heartbeat() {
  io.sockets.emit('heartbeat', blobs, foods); // Send a heartbeat event to all connected clients
}








// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on(
  'connection',
  // We are given a websocket object in our function
  function(socket) {
    console.log('We have a new client: ' + socket.id);




    // ----- 'START' EVENT ----- // 

    socket.on('start', function(data, foodsData) {
      console.log(`STARTING: ${socket.id} ${data.x} ${data.y} ${data.r}`);

      let blob = new Blob(socket.id, data.blobName, data.x, data.y, data.r, data.colourR, data.colourG, data.colourB); // Recreate main player blob on the server side
      blobs.push(blob); // Push this new blob into our list of blobs / clients

      // Recreate the food blobs on the server-side and store in the foods array
      for (let i = 0; i < foodsData.length; i++) {
        // If foods array already has 250 food blobs in it, stop creating more
        if (foods.length >= 1250) {
          break;
        }

        let foodBlob = new Blob(i, foodsData[i].blobName, foodsData[i].x, foodsData[i].y, foodsData[i].r, foodsData[i].colourR, foodsData[i].colourG, foodsData[i].colourB); // Create new food Blob using server-side constructor

        foods.push(foodBlob); // Push foodBlob to server-side foods array
      }
    });











    // ----- 'UPDATE' EVENT ----- //

    socket.on('updateBlob', function(dataBlob) {
      let blob = blobs.find(blob => blob.id === socket.id); // Find the blob object in the blobs array based on the socket id

      // If it blob exists AND it's position coordinates/size has changed, then update its data on server-side
      if (blob && (blob.x !== dataBlob.x || blob.y !== dataBlob.y || blob.r !== dataBlob.r)) {
        blob.x = dataBlob.x;
        blob.y = dataBlob.y;
        blob.r = dataBlob.r;
      }
    });









    // ----- 'UPDATEFOOD' EVENT ----- //

    socket.on('updateFood', function(dataFood) {
      const foodString = JSON.stringify(foods);
      const dataFoodString = JSON.stringify(dataFood);

      // If server-side 'foods' and frontend 'dataFood' strings are not the same, then update server-side foods with latest dataFood
      if (foodString !== dataFoodString) {
        foods = [...dataFood];
      }
    });







    // ----- 'BLOBEATEN' EVENT ----- //

    socket.on('blobEaten', function(eatenBlobId) {
      const eatenBlobIndex = blobs.findIndex(blob => blob.id === eatenBlobId); // Find index of the eaten blob in the server-side blobs array

      // If findIndex returns an index
      if (eatenBlobIndex !== -1) {
        blobs.splice(eatenBlobIndex, 1); // Splice the blob from the blobs array

        const socketToDisconnect = io.sockets.connected[eatenBlobId]; // Define the eaten blob's socket

        console.log(`Player ${socket.id} just ate Player ${eatenBlobId}`);

        socketToDisconnect.emit('showAlert', blobs); // Emit 'showEvent' alert to frontend and pass through server-side blobs array

        socketToDisconnect.disconnect(); // Disconnect the eaten blob's socket
      }
    });








    // ----- 'DISCONNECT' EVENT ----- //

    socket.on('disconnect', function() {
      let index = blobs.findIndex(blob => blob.id === socket.id); // Find the index of the blob object in the blobs array based on the socket id

      // If findIndex returns the index
      if (index !== -1) {
        blobs.splice(index, 1); // Remove the blob from the blobs array

        console.log(`Client ${socket.id} has disconnected`);
      }
    });
  });
;
