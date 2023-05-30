let blob;

let blobs = []; // Holds an array of different blobs

function setup() {
  createCanvas(600, 600); // Canavas size
  blob = new Blob(width / 2, height / 2, 64);
  for (let i = 0; i < 50; i++) {
    let x = random(-width, width * 2); // Generate random x value that can be positioned within the canvas area or outside of it
    let y = random(-height, height * 2); // Generate random y value that can be positioned within the canvas area or outside of it
    blobs[i] = new Blob(x, y, 16); // Creates new blobs in array with random height, random width, and radius of 16
  }
}

function draw() {
  background(0);
  translate(width / 2 - blob.pos.x, width / 2 - blob.pos.y); // Translates the origin of the screen so that it appears that the screen (i.e., 'map') moves with the blob

  for (let i = blobs.length - 1; i >= 0; i--) { // Show the blobs (i.e., 'food' blobs)
    blobs[i].show();

    // If Blob eats one of the blobs, then remove one blob from blobs and Blob grows
    if (blob.eats(blobs[i])) {
      blobs.splice(i, 1); // Remove one element starting at index i 
    }
  }

  blob.show(); // Show the main player blob
  blob.update(); // Update blob position when mouse moves
}