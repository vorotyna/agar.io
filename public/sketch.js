// Keep track of our socket information
let socket;

let blob;
let id;

let blobs = []; // Holds an array of different blobs
let food = []; // Holds an array of food
let zoom = 1;











function setup() {
  createCanvas(windowWidth, windowHeight); // Setup canvas size

  // Create a loop where food blobs are created into the food array
  for (let i = 0; i <= 300; i++) {
    let x = random(-width, width); // Generate random x value that can be positioned within the canvas area or outside of it
    let y = random(-height, height); // Generate random y value that can be positioned within the canvas area or outside of it
    food[i] = new Blob(x, y, 8, 55, 0, 0); // Creates new food blobs in food array with random height, random width, radius of 16, and RGB of 55,0,0
  }

  // Start a socket connection to the server
  socket = io.connect('http://localhost:3000');

  blob = new Blob(0, 0, 16, random(200, 255), random(100, 255), random(200, 255)); // Make our Blob // CHANGE FROM 0,0 TO RANDOM(HEIGHT), RANDOM(WIDTH)
  // Make an object with the Blob's data
  let data = {
    x: blob.pos.x,
    y: blob.pos.y,
    r: blob.r,
    colourR: blob.colourR,
    colourG: blob.colourG,
    colourB: blob.colourB
  };

  socket.emit('start', data);

  // On the 'heartbeat' event, console log to the client (frontend)
  socket.on('heartbeat',
    function(data) {
      console.log(data);
      blobs = data;
    }
  );
}











function draw() {
  background(255); // Sets background colour to white

  // // Draw grid lines in the background
  // let gridSize = 50; // Size of each grid cell
  stroke(225); // Color of grid lines
  // for (let x = 0; x < width; x += gridSize) {
  //   line(x, 0, x, height); // Vertical lines
  // }
  // for (let y = 0; y < height; y += gridSize) {
  //   line(0, y, width, y); // Horizontal lines
  // }

  translate(width / 2, height / 2); // Translates origin of the coordinate system to the center of the canvas
  let newzoom = 64 / blob.r; // Calculates the new zoom level based on the radius of the blob - the larger the radius, the smaller the zoom level
  zoom = lerp(zoom, newzoom, 0.1); // Interpolates the current zoom level towards the new zoom level gradually
  scale(zoom); // Scale coordinate system to increase the world view
  translate(-blob.pos.x, -blob.pos.y); // Translates the coordinate system to follow the position of the Blob - where world moves in the opposite direction of the Blob position (giving illusion that the world is moving relative to Blob)

  for (let i = blobs.length - 1; i >= 0; i--) { // Loop through all the players 
    let id = blobs[i].id;

    // If it is not the Client's own blob, then draw blob
    if (id.substring(2, id.length) !== socket.id) {
      // Blob styling
      fill(blobs[i].a, blobs[i].b, blobs[i].c); // Colour blob accodringly
      ellipse(blobs[i].x, blobs[i].y, blobs[i].r * 2, blobs[i].r * 2);

      // Text styling
      fill(255); // Colour white
      textAlign(CENTER);
      textSize(4);
      text(blobs[i].id, blobs[i].x, blobs[i].y + blobs[i].r);
    }


    // blobs[i].show();

    // // If Blob eats one of the blobs, then remove one blob from blobs and Blob grows
    // if (blob.eats(blobs[i])) {
    //   blobs.splice(i, 1); // Remove one element starting at index i 
    // }
  }

  for (let i = 0; i < food.length; i++) { // Show the food blobs
    food[i].show();
  }


  blob.show(); // Show the main player blob
  if (mouseIsPressed) {
    blob.update(); // Update blob position when mouse moves
  }
  blob.constrain();

  // Update location continuously in draw()
  let data = {
    x: blob.pos.x,
    y: blob.pos.y,
    r: blob.r,
  };
  socket.emit('update', data);
}







// Resize the canvas if someone changes the window size
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}