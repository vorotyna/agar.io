let socket; // Keep track of our socket information

let blob; // Main player constructor
let id;

let foods = []; // Holds an array of food Blob constructors on client-side only
let foodsData = []; // Holds an array of food blob data that is sent to the server
let serverFoods = []; // Holds an array of food blob data that is returned from the server
let serverBlobs = []; // Holds an array of different player blobs that are returned from the server
let zoom = 1;

let gameStarted = false; // Track whether game has started or whether menu should be shown
let nameInput;
let button;
let blobName; // Variable to store the blob's name



function openNewWindow() {
  // Open a new window with the same page
  window.open(window.location.href, "_blank");
}






// ----- SETUP FUNCTION ----- //

function setup() {
  createCanvas(displayWidth, displayHeight); // Setup canvas size to size of browser tab

  // Create and style the input field
  nameInput = createInput().attribute('placeholder', 'Enter blob\'s name');
  nameInput.attribute('maxlength', '20');
  nameInput.position(windowWidth / 2 - 100, windowHeight / 2 - 40);
  nameInput.size(200, 30);
  nameInput.style('font-family', 'Raleway');
  nameInput.style('text-align', 'center');
  nameInput.style('border-radius', '7px');
  nameInput.style('border-width', '0.5px');

  // Create and style the 'begin' button
  button = createButton('Begin');
  button.style('font-family', 'Raleway');
  button.style('border', 'none');
  button.style('background-color', '#88b169');
  button.style('border-radius', '7px');
  button.style('font-size', '22px');
  button.position(windowWidth / 2 - 120, windowHeight / 2 + 70);
  button.size(250, 45);

  button.elt.style.cursor = 'pointer'; // Add a pointer to the button when hovering


  button.mousePressed(begin);
}








// ----- BEGIN BUTTON FUNCTION ----- //

function begin() {
  blobName = nameInput.value(); // Save input name value
  nameInput.value(''); // Set input name value to blank
  nameInput.hide(); // Hide nameInput
  button.hide(); // Hide begin button


  // Start a socket connection to the server
  socket = io.connect("http://localhost:3000");

  // Create our main player Blob constructor
  blob = new Blob(
    random(-width, width), // Random spawning location (x)
    random(-height, height), // Random spawning location (y)
    8, // Radius size
    random(100, 255), // Random colour (R)
    random(100, 255), // Random colour (G)
    random(100, 255) // Random colour (B)
  );

  // Make an object with the main player blob's data to send to the server
  let data = {
    blobName: blobName, // Send blobName to server
    x: blob.pos.x,
    y: blob.pos.y,
    r: blob.r,
    colourR: blob.colourR,
    colourG: blob.colourG,
    colourB: blob.colourB,
  };

  // Create a loop where 500 food blobs are created into the foods array
  for (let i = 0; i < 1250; i++) {
    let food = new Blob(
      random(-width, width), // Generate random x value that can be positioned within the canvas area or outside of it 
      random(-height, height), // Generate random y value that can be positioned within the canvas area or outside of it
      4,
      random(200, 255),
      random(100, 255),
      random(200, 255)
    ); // Create new food blob with random height, random width, radius of 4, and random RGB

    // Make an object with the food blob's data to send to the server
    let foodData = {
      blobName: 'food', // Generic blobName for food
      x: food.pos.x,
      y: food.pos.y,
      r: food.r,
      colourR: food.colourR,
      colourG: food.colourG,
      colourB: food.colourB,
    };

    foods.push(food); // Push each food Blob constructor into the foods array
    foodsData.push(foodData); // Push each food Blob's foodData object into the foodsData array, to be sent to the server
  }

  socket.emit("start", data, foodsData); // On 'start' event, send data object with main player constructor and foodsData array (of foodData objects) to the server

  gameStarted = true; // Start game


  // On the 'heartbeat' event (each 30ms), execute the following function
  socket.on("heartbeat", function(dataBlobs, dataFoods) {
    // Receives dataBlobs and dataFoods parameters from the server
    serverBlobs = dataBlobs; // Assign serverBlobs array to the dataBlobs parameter that is returned from the server-side
    serverFoods = dataFoods; // Assign serverFoods array to the dataFoods parameter that is returned from the server-side
  });
}









// ----- DRAW FUNCTION ----- //

function draw() {
  // If game hasn't started, show the menu
  if (!gameStarted) {
    drawMenu();
  } else {
    background(255); // Sets background colour to white

    // If blob.isVisible is true then allow blob to move around
    if (blob.isVisible) {
      translate(windowWidth / 2, windowHeight / 2); // Translates origin of the coordinate system to the center of the canvas

      // If blob radius is <= 42, zoom out. Otherwise, set to a constant zoom level
      if (blob.r <= 42) {
        let newzoom = 80 / blob.r; // Calculates the new zoom level based on the radius of the blob - the larger the radius, the smaller the zoom level
        zoom = lerp(zoom, newzoom, 0.1); // Interpolates the current zoom level towards the new zoom level gradually
        scale(zoom); // Scale coordinate system to increase the world view
      } else {
        let newzoom = 80 / 42; // Set a constant zoom level for anything over 42
        zoom = lerp(zoom, newzoom, 0.1); // Interpolates the current zoom level towards the new zoom level gradually
        scale(zoom);
      }

      translate(-blob.pos.x, -blob.pos.y); // Translates the coordinate system to follow the position of the Blob - where world moves in the opposite direction of the Blob position (giving illusion that the world is moving relative to Blob)
    }

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


    // Loop through all the players that are returned from the server and handle blob eating scenarios
    for (let i = serverBlobs.length - 1; i >= 0; i--) {
      id = serverBlobs[i].id; // Set ID
      serverBlobs[i].pos = createVector(serverBlobs[i].x, serverBlobs[i].y); // Create position vector for serverBlob (so that it can be eaten with .eat method)

      // If it is not the Client's own blob, then draw blob
      if (id.substring(2, id.length) !== socket.id) {
        // Blob styling
        fill(serverBlobs[i].colourR, serverBlobs[i].colourG, serverBlobs[i].colourB); // Colour blob accordingly
        ellipse(serverBlobs[i].x, serverBlobs[i].y, serverBlobs[i].r * 2, serverBlobs[i].r * 2); // Size blob accordingly

        // Text styling for their id tag
        fill(0); // Colour black
        textAlign(CENTER); // Align Id tag in the center
        textSize(5);
        text(serverBlobs[i].blobName, serverBlobs[i].x, serverBlobs[i].y + serverBlobs[i].r); // Print Id tag that is the blobName

        // Handle Blob (main player) eating a serverBlob (another player)
        if (blob.eats(serverBlobs[i])) {
          // Remove the eaten blob from the serverBlobs array
          serverBlobs.splice(i, 1);

          // Emit 'blobEaten' event  to the server, to inform other clients
          socket.emit("blobEaten", id);
        }
      }
    }

    // On 'showAlert' event from the server, update serverBlobs to be equal to blobs coming from the server
    socket.on('showAlert', function(blobs) {
      serverBlobs = blobs; // Update serverBlobs array with latest server-side data
      blob.isVisible = false; // When player dies, do not show their blob on their screen anymore

      const gameOverMenu = document.querySelector('.gameOverMenu'); // Find HTML element with specified class
      gameOverMenu.style.visibility = 'visible'; // Add visibility value to it, so that it shows
    });


    // Loop through all the serverFoods food blobs that returned from the server
    for (let i = serverFoods.length - 1; i >= 0; i--) {
      serverFoods[i].pos = createVector(serverFoods[i].x, serverFoods[i].y); // Create a position vector for serverFoods so they can interact with .eat method

      // Show the food blobs on the map
      fill(
        serverFoods[i].colourR,
        serverFoods[i].colourG,
        serverFoods[i].colourB
      ); // Sets the fill color
      ellipse(
        serverFoods[i].x,
        serverFoods[i].y,
        serverFoods[i].r * 2,
      ); // Size of the ellipse

      // If main player Blob eats one of the food blobs, then remove one food blob from serverFoods array
      if (blob.eats(serverFoods[i])) {
        serverFoods.splice(i, 1); // Remove one element starting at index i
        foods.splice(i, 1); // Remove one constructor food blob from foods array at index i

        // Replace with a new food blob
        let newFood = new Blob(random(-width, width), random(-height, height), 4, random(200, 255), random(100, 255), random(200, 255)); // Create newFood constructor to replace eaten food

        let newFoodServerBlobType = {
          id: random(250, 1000),
          x: newFood.pos.x,
          y: newFood.pos.y,
          r: newFood.r,
          colourR: newFood.colourR,
          colourG: newFood.colourG,
          colourB: newFood.colourB,
        }; // Create newFood data object for the server-side

        foods.push(newFood); // Push newFood constructor to foods array on frontend

        serverFoods.push(newFoodServerBlobType); // Push newFoodServerBlobType data object to serverFoods arrays for the server-side

        socket.emit('updateFood', serverFoods); // Emit updateFood event only when a food is eaten
      }
    }

    // Show the main player blob
    blob.show();

    if (mouseIsPressed) {
      blob.update(); // Update blob position when mouse moves
    }
    blob.constrain(); // Constrain blob movement to map size

    // Update main player blob location continuously in draw()
    let data = {
      x: blob.pos.x,
      y: blob.pos.y,
      r: blob.r,
    };
    socket.emit('updateBlob', data); // Send an 'updateBlob' event with blob's location data to the server-side
  }
}






// ----- DRAW MENU FUNCTION ----- //

function drawMenu() {
  background(229, 247, 223); // Set background color for the start menu

  // Draw menu elements
  fill(14, 30, 8);
  textSize(30);
  textAlign(CENTER, CENTER);
  textFont("Raleway");
  textStyle(BOLD);
  text("WELCOME TO BLOBS.IO !", windowWidth / 2, windowHeight / 2 - 90);
  textSize(16);
  textStyle(NORMAL);
  text("Drag and click your mouse to control your blob.", windowWidth / 2, windowHeight / 2 + 15);
}