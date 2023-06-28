let socket; // Keep track of our socket information

let blob; // Main player (CONSTRUCTOR)
let id;

let foods = []; // Holds an array of food Blob constructors
let blobs = []; // Holds an array of client Blob constructors
let foodsData = []; // Holds an array of food blob data that is sent to the server
let serverFoods = []; // Holds an array of food blob data that is returned from the server
let serverBlobs = []; // Holds an array of different player blobs that are returned from the server
let zoom = 1;










// ----- SETUP FUNCTION ----- //

function setup() {
  createCanvas(windowWidth, windowHeight); // Setup canvas size

  // Start a socket connection to the server
  socket = io.connect('http://localhost:3000');

  // Make our main player Blob *CHANGE FROM 0,0 TO RANDOM(HEIGHT), RANDOM(WIDTH)*
  blob = new Blob(random(0, 500), 0, 16, random(100, 255), random(100, 255), random(100, 255));

  // Make an object with the main player blob's data to send to the server
  let data = {
    id: blob.id,
    x: blob.pos.x,
    y: blob.pos.y,
    r: blob.r,
    colourR: blob.colourR,
    colourG: blob.colourG,
    colourB: blob.colourB
  };

  // Create a loop where 250 food blobs are created into the foods array
  for (let i = 0; i < 250; i++) {
    let x = random(-width, width); // Generate random x value that can be positioned within the canvas area or outside of it
    let y = random(-height, height); // Generate random y value that can be positioned within the canvas area or outside of it
    let food = new Blob(x, y, 4, random(200, 255), random(100, 255), random(200, 255)); // Create new food blob with random height, random width, radius of 4, and random RGB

    // Make an object with the food blob's data to send to the server
    let foodData = {
      x: food.pos.x,
      y: food.pos.y,
      r: food.r,
      colourR: food.colourR,
      colourG: food.colourG,
      colourB: food.colourB
    };

    foods.push(food); // Push each food Blob constructor into the foods array
    foodsData.push(foodData); // Push each food Blob's foodData object into the foodsData array, to be sent to the server
  }

  socket.emit('start', data, foodsData); // On 'start' event, send data object and foodsData array (of foodData objects) to the server

  // On the 'heartbeat' event (each 1000ms), execute the following function
  socket.on('heartbeat',
    function(dataBlobs, dataFoods) { // Receives dataBlobs and dataFoods parameters from the server
      serverBlobs = dataBlobs; // Assign serverBlobs array to the dataBlobs parameter that is returned from the server-side
      serverFoods = dataFoods; // Assign serverFoods array to the dataFoods parameter that is returned from the server-side
    }
  );
}









// ----- DRAW FUNCTION ----- //

function draw() {
  background(255); // Sets background colour to white

  translate(width / 2, height / 2); // Translates origin of the coordinate system to the center of the canvas
  let newzoom = 64 / blob.r; // Calculates the new zoom level based on the radius of the blob - the larger the radius, the smaller the zoom level
  zoom = lerp(zoom, newzoom, 0.1); // Interpolates the current zoom level towards the new zoom level gradually
  scale(zoom); // Scale coordinate system to increase the world view
  translate(-blob.pos.x, -blob.pos.y); // Translates the coordinate system to follow the position of the Blob - where world moves in the opposite direction of the Blob position (giving illusion that the world is moving relative to Blob)

  // Draw grid lines in the background
  let gridSize = 25; // Size of each grid cell
  stroke(225); // Color of grid lines
  strokeWeight(0.5); // Boldness of strokes
  for (let x = -width - 1000; x < width + 1000; x += gridSize) { // Create vertical grid lines that exceed the limits of the canvas area (±1000) 
    line(x, -height - 1000, x, height + 1000); // Vertical lines
  }
  for (let y = -height - 1000; y < height + 1000; y += gridSize) { // Create horizontal grid lines that exceed the limits of the canvas area (±1000) 
    line(-width - 1000, y, width + 1000, y); // Horizontal lines
  }

  // Loop through all the players that are returned from the server and create constructors for them to be used on frontend
  for (let i = serverBlobs.length - 1; i >= 0; i--) {
    let blob = new Blob(serverBlobs[i].x, serverBlobs[i].y, serverBlobs[i].r, serverBlobs[i].colourR, serverBlobs[i].colourG, serverBlobs[i].colourB); // Create new food blob with random height, random width, radius of 4, and random RGB
    blob.id = serverBlobs[i].id;
    blobs.push(blob);
  }


  // Loop through all the players that are returned from the server and handle blob eating scenarios
  for (let i = blobs.length - 1; i >= 0; i--) {
    let id = blobs[i].id;

    // If it is not the Client's own blob, then draw blob
    if (id.substring(2, id.length) !== socket.id) {
      // Blob styling
      fill(blobs[i].colourR, blobs[i].colourG, blobs[i].colourB); // Colour blob accordingly
      ellipse(blobs[i].x, blobs[i].y, blobs[i].r * 2, blobs[i].r * 2); // Size blob accordingly

      // Text styling for their id tag
      fill(0); // Colour white
      textAlign(CENTER); // Align Id tag in the center
      textSize(5);
      text(blobs[i].id.substring(2, 9), blobs[i].x, blobs[i].y + blobs[i].r); // Print Id tag that is a substring from index 2 to 9 

      if (blob.eats(blobs[i])) {
        blobs.splice(i, 1);
        serverBlobs.splice(i, 1);
        socket.emit("blobEaten", serverBlobs);
      }
    }
  }


  // Loop through all the food blobs that returned from the server
  for (let i = 0; i < foods.length; i++) {
    // Show the food blobs on the map
    fill(
      foods[i].colourR,
      foods[i].colourG,
      foods[i].colourB
    ); // Sets the fill color
    ellipse(
      foods[i].pos.x,
      foods[i].pos.y,
      foods[i].r * 2,
      foods[i].r * 2
    ); // Size of the ellipse

    // If main player Blob eats one of the food blobs, then remove one food blob from serverFoods array and main player Blob grows
    if (blob.eats(foods[i])) {
      serverFoods.splice(i, 1); // Remove one element starting at index i
      foods.splice(i, 1); // Remove one constructor food blob from foods array at index i

      // Replace with a new food blob
      let x = random(-width, width); // Generate random x value that can be positioned within the canvas area or outside of it
      let y = random(-height, height); // Generate random y value that can be positioned within the canvas area or outside of it

      let newFood = new Blob(x, y, 4, random(200, 255), random(100, 255), random(200, 255));

      let newFoodServerBlobType = {
        id: random(250, 1000),
        x: newFood.pos.x,
        y: newFood.pos.y,
        r: newFood.r,
        colourR: newFood.colourR,
        colourG: newFood.colourG,
        colourB: newFood.colourB,
      };

      foods.push(newFood); // Push newFood consturctor to foods array on frontend

      serverFoods.push(newFoodServerBlobType); // Push newFoodServerBlobType to serverFoods arrays on server-side
    }
  }

  socket.emit("updateFood", serverFoods);

  // Show the main player blob
  blob.show();
  if (mouseIsPressed) {
    blob.update(); // Update blob position when mouse moves
  }
  blob.constrain();

  // Update main player blob location continuously in draw()
  let data = {
    x: blob.pos.x,
    y: blob.pos.y,
    r: blob.r,
  };

  // Send an 'updateBlob' event with data parameter to the server-side
  socket.emit('updateBlob', data);
}








// ----- WINDOW RESIZE FUNCTION ----- //
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}