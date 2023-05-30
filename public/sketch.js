// Keep track of our socket information
let socket;

let blob;

let blobs = []; // Holds an array of different blobs
let zoom = 1;

function setup() {
  createCanvas(600, 600); // Canavas size
  // Start a socket connection to the server
  socket = io.connect('http://localhost:3000');

  blob = new Blob(random(width), random(height), random(8, 24));
  // Make a little object with x and y
  let data = {
    x: blob.pos.x,
    y: blob.pos.y,
    r: blob.r,
  };
  socket.emit('start', data);

}

function draw() {
  background(0); // Sets background colour to black
  translate(width / 2, height / 2); // Translates origin of the coordinate system to the center of the canvas
  let newzoom = 64 / blob.r; // Calculates the new zoom level based on the radius of the blob - the larger the radius, the smaller the zoom level
  zoom = lerp(zoom, newzoom, 0.1); // Interpolates the current zoom level towards the new zoom level gradually
  scale(zoom); // Scale coordinate system to increase the world view
  translate(-blob.pos.x, -blob.pos.y); // Translates the coordinate system to follow the position of the Blob - where world moves in the opposite direction of the Blob position (giving illusion that the world is moving relative to Blob)

  for (let i = blobs.length - 1; i >= 0; i--) { // Show the blobs (i.e., 'food' blobs)
    blobs[i].show();

    // If Blob eats one of the blobs, then remove one blob from blobs and Blob grows
    if (blob.eats(blobs[i])) {
      blobs.splice(i, 1); // Remove one element starting at index i 
    }
  }

  blob.show(); // Show the main player blob
  blob.update(); // Update blob position when mouse moves
  blob.constrain();

  // Update location continuously in draw()
  let data = {
    x: blob.pos.x,
    y: blob.pos.y,
    r: blob.r,
  };
  socket.emit('update', data);
}