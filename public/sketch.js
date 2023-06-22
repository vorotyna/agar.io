let socket; // Keep track of our socket information

let blob;
let id;

let foods = []; // Holds an array of food Blob constructors
let foodsData = []; // Holds an array of food blob data that is sent to the server
let serverFoods = []; // Holds an array of food blob data that is returned from the server
let blobs = []; // Holds an array of different player blobs that are returned from the server
let zoom = 1;










// ----- SETUP FUNCTION ----- //

function setup() {
  createCanvas(windowWidth, windowHeight); // Setup canvas size

  // Start a socket connection to the server
  socket = io.connect('http://localhost:3000');

  // Make our main player Blob *CHANGE FROM 0,0 TO RANDOM(HEIGHT), RANDOM(WIDTH)*
  blob = new Blob(0, 0, 16, random(100, 255), random(100, 255), random(100, 255));

  // Make an object with the main player blob's data to send to the server
  let data = {
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
      console.log('DATA BLOBS', dataBlobs, 'DATA FOODS', dataFoods); // Console.logs both parameters
      blobs = dataBlobs; // Assign blobs array to the dataBlobs parameter that is returned from the server-side
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
  strokeWeight(0.5);
  for (let x = -width - 1000; x < width + 1000; x += gridSize) {
    line(x, -height - 1000, x, height + 1000); // Vertical lines
  }
  for (let y = -height - 1000; y < height + 1000; y += gridSize) {
    line(-width - 1000, y, width + 1000, y); // Horizontal lines
  }


  // Loop through all the players 
  for (let i = blobs.length - 1; i >= 0; i--) {
    let id = blobs[i].id;

    // If it is not the Client's own blob, then draw blob
    if (id.substring(2, id.length) !== socket.id) {
      // Blob styling
      fill(blobs[i].colourR, blobs[i].colourG, blobs[i].colourB); // Colour blob accordingly
      ellipse(blobs[i].x, blobs[i].y, blobs[i].r * 2, blobs[i].r * 2);

      // Text styling
      fill(255); // Colour white
      textAlign(CENTER);
      textSize(4);
      text(blobs[i].id, blobs[i].x, blobs[i].y + blobs[i].r);
    }
  }


  // Loop through all the food blobs
  for (let i = 0; i < serverFoods.length; i++) {
    // Show the food blobs on the map
    fill(
      serverFoods[i].colourR,
      serverFoods[i].colourG,
      serverFoods[i].colourR
    ); // Sets the fill color
    ellipse(
      serverFoods[i].x,
      serverFoods[i].y,
      serverFoods[i].r * 2,
      serverFoods[i].r * 2
    ); // Size of the ellipse
    serverFoods[i].pos = createVector(serverFoods[i].x, serverFoods[i].y);

    // If Blob eats one of the food blobs, then remove one food blob from food array and Blob grows
    if (blob.eats(serverFoods[i])) {
      serverFoods.splice(i, 1); // Remove one element starting at index i
      foods.splice(i, 1);
      // Replace with a new food blob
      let x = random(-width, width); // Generate random x value that can be positioned within the canvas area or outside of it
      let y = random(-height, height); // Generate random y value that can be positioned within the canvas area or outside of it
      let newF = new Blob(x, y, 8, random(200, 255), random(100, 255), random(200, 255));
      let newFServerBlobType = {
        id: random(250, 1000000),
        x: newF.x,
        y: newF.y,
        r: newF.r,
        colourR: newF.colourR,
        colourG: newF.colourG,
        colourB: newF.colourB,
      };
      foods.push(
        newF
      );
      serverFoods.push({
        newFServerBlobType
      }); // Creates new food blobs in food array with random height, random width, radius of 16, and random RGB
    }
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

  socket.emit('updateBlob', data);


  if (serverFoods.length > 0) {
    socket.emit("updateFood", serverFoods);
  };

}







// Resize the canvas if someone changes the window size
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}